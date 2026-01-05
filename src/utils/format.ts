import { formatUnits } from 'ethers';

/**
 * Convert wei to float with specified decimals
 */
export function weiToFloat(wei: bigint, decimals: number = 18): number {
  return parseFloat(formatUnits(wei, decimals));
}

/**
 * Format a number to a human-readable string with commas
 */
export function formatNumber(num: number, decimals: number = 2): string {
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Shorten an address for display
 */
export function shortenAddress(address: string, chars: number = 4): string {
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}
