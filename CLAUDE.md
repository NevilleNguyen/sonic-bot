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
│   │   └── config.ts            # Configuration loader
│   ├── core/
│   │   ├── bot.ts               # Main orchestrator, manages all watchers
│   │   └── sfc-client.ts        # SFC contract interactions via ethers.js
│   ├── notification/
│   │   └── telegram.ts          # Telegram bot and message formatting
│   ├── contracts/
│   │   └── sfc-abi.ts           # SFC contract ABI
│   ├── types/
│   │   └── index.ts             # TypeScript interfaces
│   └── utils/
│       └── format.ts            # Wei conversion, formatting utilities
├── config/
│   ├── mainnet.json             # Main configuration (gitignored)
│   └── mainnet.example.json     # Example configuration
├── package.json
├── tsconfig.json
└── CLAUDE.md
```

## Events Monitored
1. **CreatedValidator** - New validator creation
2. **Delegated** - Staking/delegation events
3. **Undelegated** - Unstaking events
4. **ClaimedRewards** - Reward claim events
5. **LockedUpStake** - Lock-up stake events
6. **UnlockedStake** - Unlock stake events
7. **S Token Transfers** - Large native token transfers

## Configuration
Copy `config/mainnet.example.json` to `config/mainnet.json` and update:
- `telegram.token` - Your Telegram bot token from @BotFather
- `telegram.chat_id` - Your Telegram chat/group ID
- `thresholds.*` - Minimum amounts to trigger notifications
- `contact_book` - Address to name mappings
- `validator_book` - Validator ID to name mappings

## Commands
```bash
# Install dependencies
npm install

# Run in development mode (with hot reload)
npm run dev

# Type check
npm run typecheck

# Build for production
npm run build

# Run production build
npm start
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
- Loads JSON config file
- Provides contact/validator name lookups
- Maintains in-memory lookup maps

## Technology Stack
- **Runtime**: Node.js with ES modules
- **Language**: TypeScript
- **Blockchain**: ethers.js v6
- **Notifications**: node-telegram-bot-api
- **Logging**: pino with pino-pretty
- **Build**: tsup

## Based On
This project is a TypeScript rewrite of [fantombot](../fantombot), originally written in Go. The core functionality is the same but adapted for the Sonic chain.
