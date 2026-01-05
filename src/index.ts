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

let bot: SonicBot | null = null;

async function notifyAndExit(reason: string, code: number): Promise<void> {
  if (bot) {
    await bot.sendShutdownNotification(reason);
    await bot.stop();
  }
  process.exit(code);
}

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
  bot = new SonicBot();

  // Handle graceful shutdown
  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, 'Received shutdown signal');
    await notifyAndExit(`Graceful shutdown (${signal})`, 0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGQUIT', () => shutdown('SIGQUIT'));

  // Handle uncaught errors
  process.on('uncaughtException', async (error) => {
    logger.error({ error }, 'Uncaught exception');
    await notifyAndExit(`Uncaught exception: ${error.message}`, 1);
  });

  process.on('unhandledRejection', async (reason) => {
    logger.error({ reason }, 'Unhandled rejection');
    const message = reason instanceof Error ? reason.message : String(reason);
    await notifyAndExit(`Unhandled rejection: ${message}`, 1);
  });

  // Start the bot
  try {
    await bot.start();
    logger.info('Sonic bot is running. Press Ctrl+C to stop.');
  } catch (error) {
    logger.error({ error }, 'Failed to start bot');
    const message = error instanceof Error ? error.message : String(error);
    await notifyAndExit(`Failed to start: ${message}`, 1);
  }
}

main().catch(async (error) => {
  logger.error({ error }, 'Fatal error');
  const message = error instanceof Error ? error.message : String(error);
  await notifyAndExit(`Fatal error: ${message}`, 1);
});
