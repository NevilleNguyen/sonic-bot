import TelegramBot from 'node-telegram-bot-api';
import pino from 'pino';

const logger = pino({ name: 'telegram' });

// Emojis
export const Emoji = {
  WHALE: '\u{1F40B}',      // Whale for big transfers
  CHECK_MARK: '\u{2705}',  // Check mark for delegations
  CROSS_MARK: '\u{274C}',  // Cross mark for undelegations
  STAR: '\u{2B50}',        // Star for rewards
  LOCK: '\u{1F512}',       // Lock for locked stake
  UNLOCK: '\u{1F513}',     // Unlock for unlocked stake
  ROCKET: '\u{1F680}',     // Rocket for new validator
} as const;

export class TelegramNotifier {
  private bot: TelegramBot;
  private chatId: number;

  constructor(token: string, chatId: number) {
    this.bot = new TelegramBot(token, { polling: false });
    this.chatId = chatId;
  }

  /**
   * Send an HTML-formatted message to the configured chat
   */
  async sendMessage(message: string): Promise<void> {
    try {
      await this.bot.sendMessage(this.chatId, message, {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      });
      logger.debug({ message: message.substring(0, 50) }, 'Message sent');
    } catch (error) {
      logger.error({ error }, 'Failed to send Telegram message');
      throw error;
    }
  }

  /**
   * Get the configured chat ID
   */
  getChatId(): number {
    return this.chatId;
  }
}

// Message formatting helpers
export function formatTxLink(explorerUrl: string, txHash: string, text: string): string {
  return `<a href="${explorerUrl}/tx/${txHash}">${text}</a>`;
}

export function formatAddressLink(explorerUrl: string, address: string, text: string): string {
  return `<a href="${explorerUrl}/address/${address}">${text}</a>`;
}

export function formatAmount(amount: number): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
