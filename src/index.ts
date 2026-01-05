import pino from 'pino';
import { loadConfig } from './config/config.js';
import { SonicBot } from './core/bot.js';

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

async function main(): Promise<void> {
  // Load configuration
  try {
    loadConfig();
    logger.info('Configuration loaded');
  } catch (error) {
    logger.error({ error }, 'Failed to load configuration');
    process.exit(1);
  }

  // Create and start bot
  const bot = new SonicBot();

  // Handle graceful shutdown
  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, 'Received shutdown signal');
    await bot.stop();
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGQUIT', () => shutdown('SIGQUIT'));

  // Handle uncaught errors
  process.on('uncaughtException', (error) => {
    logger.error({ error }, 'Uncaught exception');
    process.exit(1);
  });

  process.on('unhandledRejection', (reason) => {
    logger.error({ reason }, 'Unhandled rejection');
  });

  // Start the bot
  try {
    await bot.start();
    logger.info('Sonic bot is running. Press Ctrl+C to stop.');
  } catch (error) {
    logger.error({ error }, 'Failed to start bot');
    process.exit(1);
  }
}

main().catch((error) => {
  logger.error({ error }, 'Fatal error');
  process.exit(1);
});
