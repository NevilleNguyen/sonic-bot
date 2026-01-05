# Sonic Bot - Project Documentation

## Overview
Sonic Bot is a blockchain event monitoring bot for the Sonic chain (formerly Fantom). It monitors staking-related events and large S token transfers, sending real-time notifications via Telegram.

## Sonic Network Details
| Parameter | Value |
|-----------|-------|
| Chain ID | 146 |
| Native Token | S |
| RPC URL | `https://rpc.soniclabs.com` |
| WebSocket | `wss://rpc.soniclabs.com` |
| Block Explorer | `https://sonicscan.org` |
| SFC Contract | `0xFC00FACE00000000000000000000000000000000` |

## Project Structure
```
sonic-bot/
├── src/
│   ├── index.ts                 # Entry point, signal handling
│   ├── config/
│   │   └── config.ts            # Configuration loader (from env vars)
│   ├── core/
│   │   ├── bot.ts               # Main orchestrator, manages all watchers
│   │   └── sfc-client.ts        # SFC contract interactions via ethers.js
│   ├── services/
│   │   └── price.ts             # CoinGecko price service for USD values
│   ├── notification/
│   │   └── telegram.ts          # Telegram bot and message formatting
│   ├── contracts/
│   │   └── sfc-abi.ts           # SFC contract ABI
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces
│   └── utils/
│       └── format.ts            # Wei conversion, formatting utilities
├── .env                         # Environment config (gitignored)
├── .env.example                 # Example environment config
├── data/
│   ├── contacts.json            # Contact address book (gitignored)
│   ├── contacts.example.json    # Example contacts
│   ├── validators.json          # Validator name book (gitignored)
│   └── validators.example.json  # Example validators
├── package.json
├── tsconfig.json
└── CLAUDE.md
```

## Events Monitored
1. **CreatedValidator** - New validator creation
2. **Delegated** - Staking/delegation events (with USD value)
3. **Undelegated** - Unstaking events (with USD value)
4. **ClaimedRewards** - Reward claim events (with USD value)
5. **S Token Transfers** - Large native token transfers (with USD value)

All monetary events include real-time USD price conversion via CoinGecko API.

## Configuration
1. Copy `.env.example` to `.env` and update:
   - `TELEGRAM_TOKEN` - Your Telegram bot token from @BotFather
   - `TELEGRAM_CHAT_ID` - Your Telegram chat/group ID
   - `MIN_STAKING_AMOUNT`, `MIN_CLAIM_AMOUNT`, `MIN_TRANSFER_AMOUNT` - Thresholds

2. Copy `data/contacts.example.json` to `data/contacts.json` for address labels
3. Copy `data/validators.example.json` to `data/validators.json` for validator names

## Commands
```bash
# Install dependencies
pnpm install

# Run in development mode (with hot reload)
pnpm dev

# Type check
pnpm typecheck

# Build for production
pnpm build

# Run production build
pnpm start
```

## Key Files

### src/core/bot.ts
Main orchestrator that:
- Initializes SFC client and Telegram notifier
- Starts all event watchers
- Formats and sends notification messages

### src/core/sfc-client.ts
Ethers.js wrapper for SFC contract that:
- Connects to Sonic RPC and WebSocket endpoints
- Watches for contract events
- Provides validator lookup functions

### src/config/config.ts
Configuration management:
- Loads configuration from environment variables
- Provides contact/validator name lookups
- Maintains in-memory lookup maps

### src/services/price.ts
Price service for USD conversion:
- Fetches S token price from CoinGecko API (coin ID: sonic-3)
- 1-minute cache to minimize API calls
- Graceful fallback to cached price on API errors

## Technology Stack
- **Runtime**: Node.js with ES modules
- **Language**: TypeScript
- **Blockchain**: ethers.js v6
- **Notifications**: node-telegram-bot-api
- **Logging**: pino with pino-pretty
- **Build**: tsup

## Based On
This project is a TypeScript rewrite of [fantombot](../fantombot), originally written in Go. The core functionality is the same but adapted for the Sonic chain.
