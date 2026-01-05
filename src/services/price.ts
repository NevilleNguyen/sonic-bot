import pino from 'pino';

const logger = pino({ name: 'price-service' });

const COINGECKO_API_URL = 'https://api.coingecko.com/api/v3/simple/price';
const SONIC_COIN_ID = 'sonic-3';
const CACHE_TTL_MS = 60_000; // 1 minute cache

interface PriceCache {
  price: number;
  timestamp: number;
}

let priceCache: PriceCache | null = null;

/**
 * Fetch the current S token price in USD from CoinGecko
 */
export async function getSonicPrice(): Promise<number | null> {
  // Return cached price if still valid
  if (priceCache && Date.now() - priceCache.timestamp < CACHE_TTL_MS) {
    return priceCache.price;
  }

  try {
    const url = `${COINGECKO_API_URL}?ids=${SONIC_COIN_ID}&vs_currencies=usd`;
    const response = await fetch(url);

    if (!response.ok) {
      logger.error({ status: response.status }, 'CoinGecko API request failed');
      return priceCache?.price ?? null;
    }

    const data = await response.json() as Record<string, { usd?: number }>;
    const price = data[SONIC_COIN_ID]?.usd;

    if (typeof price !== 'number') {
      logger.error({ data }, 'Invalid price data from CoinGecko');
      return priceCache?.price ?? null;
    }

    // Update cache
    priceCache = {
      price,
      timestamp: Date.now(),
    };

    logger.debug({ price }, 'Fetched S token price');
    return price;
  } catch (error) {
    logger.error({ err: error }, 'Failed to fetch price from CoinGecko');
    return priceCache?.price ?? null;
  }
}

/**
 * Format a USD value for display
 */
export function formatUsdValue(amount: number, price: number | null): string {
  if (price === null) {
    return '';
  }
  const usdValue = amount * price;
  return ` (~$${usdValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`;
}
