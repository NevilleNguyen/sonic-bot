import pino from 'pino';
import { SFCClient } from './sfc-client.js';
import { TelegramNotifier, Emoji, formatTxLink, formatAddressLink, formatAmount } from '../notification/telegram.js';
import { getConfig, getContactName, getValidatorName } from '../config/config.js';
import { weiToFloat } from '../utils/format.js';
import type {
  SFCValidator,
  SFCDelegateInfo,
  SFCUndelegateInfo,
  SFCRewardInfo,
  SFCLockedUpStake,
  SFCUnlockedStake,
  TransferLog,
} from '../types/index.js';

const logger = pino({ name: 'bot' });

// Validators keeper (in-memory cache)
const validatorsMap = new Map<bigint, SFCValidator>();

export class SonicBot {
  private sfcClient: SFCClient;
  private telegram: TelegramNotifier;
  private explorerUrl: string;
  private minStakingAmount: number;
  private minClaimAmount: number;
  private minTransferAmount: number;

  constructor() {
    const config = getConfig();

    this.sfcClient = new SFCClient();
    this.telegram = new TelegramNotifier(
      config.telegram.token,
      config.telegram.chat_id
    );

    this.explorerUrl = config.sonic_chain.explorer_tx_endpoint;
    this.minStakingAmount = config.thresholds.min_staking_amount;
    this.minClaimAmount = config.thresholds.min_claim_amount;
    this.minTransferAmount = config.thresholds.min_transfer_amount;
  }

  /**
   * Start the bot
   */
  async start(): Promise<void> {
    logger.info({
      minStakingAmount: this.minStakingAmount,
      minClaimAmount: this.minClaimAmount,
      minTransferAmount: this.minTransferAmount,
    }, 'Sonic bot starting');

    await this.sendMessage('Sonic bot started');

    // Start all watchers
    this.watchCreatedValidators();
    this.watchDelegateEvents();
    this.watchUndelegateEvents();
    this.watchClaimRewardEvents();
    this.watchLockedUpStakeEvents();
    this.watchUnlockedStakeEvents();
    this.watchSTransfers();

    logger.info('All watchers started');
  }

  /**
   * Send a message via Telegram
   */
  private async sendMessage(message: string): Promise<void> {
    try {
      await this.telegram.sendMessage(message);
    } catch (error) {
      logger.error({ error }, 'Failed to send message');
    }
  }

  /**
   * Watch for new validators
   */
  private watchCreatedValidators(): void {
    logger.info('Starting CreatedValidator watcher');

    this.sfcClient.watchCreatedValidator(
      async (validator) => {
        logger.debug({ validatorId: validator.id.toString() }, 'New validator created');
        validatorsMap.set(validator.id, validator);
        await this.sendCreatedValidatorMessage(validator);
      },
      (error) => {
        logger.error({ err: error }, 'CreatedValidator watcher error');
      }
    );
  }

  /**
   * Watch for delegation events
   */
  private watchDelegateEvents(): void {
    logger.info('Starting Delegated watcher');

    this.sfcClient.watchDelegated(
      async (info) => {
        if (info.amount > this.minStakingAmount) {
          logger.debug({ txHash: info.txHash }, 'New delegation event');
          await this.sendDelegateMessage(info);
        }
      },
      (error) => {
        logger.error({ err: error }, 'Delegated watcher error');
      }
    );
  }

  /**
   * Watch for undelegation events
   */
  private watchUndelegateEvents(): void {
    logger.info('Starting Undelegated watcher');

    this.sfcClient.watchUndelegated(
      async (info) => {
        if (info.amount > this.minStakingAmount) {
          logger.debug({ txHash: info.txHash }, 'New undelegation event');
          await this.sendUndelegateMessage(info);
        }
      },
      (error) => {
        logger.error({ err: error }, 'Undelegated watcher error');
      }
    );
  }

  /**
   * Watch for reward claim events
   */
  private watchClaimRewardEvents(): void {
    logger.info('Starting ClaimedRewards watcher');

    this.sfcClient.watchClaimedRewards(
      async (info) => {
        if (info.unlockedReward > this.minClaimAmount) {
          logger.debug({ txHash: info.txHash }, 'New reward claim event');
          await this.sendClaimRewardMessage(info);
        }
      },
      (error) => {
        logger.error({ err: error }, 'ClaimedRewards watcher error');
      }
    );
  }

  /**
   * Watch for locked up stake events
   */
  private watchLockedUpStakeEvents(): void {
    logger.info('Starting LockedUpStake watcher');

    this.sfcClient.watchLockedUpStake(
      async (info) => {
        if (info.amount > this.minStakingAmount) {
          logger.debug({ txHash: info.txHash }, 'New locked up stake event');
          await this.sendLockedUpStakeMessage(info);
        }
      },
      (error) => {
        logger.error({ err: error }, 'LockedUpStake watcher error');
      }
    );
  }

  /**
   * Watch for unlocked stake events
   */
  private watchUnlockedStakeEvents(): void {
    logger.info('Starting UnlockedStake watcher');

    this.sfcClient.watchUnlockedStake(
      async (info) => {
        if (info.amount > this.minStakingAmount) {
          logger.debug({ txHash: info.txHash }, 'New unlocked stake event');
          await this.sendUnlockedStakeMessage(info);
        }
      },
      (error) => {
        logger.error({ err: error }, 'UnlockedStake watcher error');
      }
    );
  }

  /**
   * Watch for large S token transfers
   */
  private watchSTransfers(): void {
    logger.info('Starting S transfer watcher');

    const SHIFT_BLOCKS = 5n;
    const provider = this.sfcClient.getRpcProvider();

    this.sfcClient.watchNewBlocks(
      async (blockNumber) => {
        try {
          const targetBlock = blockNumber - SHIFT_BLOCKS;
          const block = await provider.getBlock(Number(targetBlock), true);

          if (!block || !block.prefetchedTransactions) return;

          for (const tx of block.prefetchedTransactions) {
            // Only process simple value transfers (no input data)
            // Check for empty data: '0x', '0x0', '0x00', etc.
            const isEmptyData = !tx.data || tx.data === '0x' || /^0x0*$/.test(tx.data);
            if (!isEmptyData || !tx.to || !tx.value) continue;

            const amount = weiToFloat(tx.value);
            if (amount > this.minTransferAmount) {
              const transferLog: TransferLog = {
                blockNumber: BigInt(block.number),
                txHash: tx.hash,
                from: tx.from,
                to: tx.to,
                amount,
              };
              logger.debug({ txHash: tx.hash, amount }, 'Large transfer detected');
              await this.sendBigTransferMessage(transferLog);
            }
          }
        } catch (error) {
          logger.error({ err: error, blockNumber: blockNumber.toString() }, 'Error processing block');
        }
      },
      (error) => {
        logger.error({ err: error }, 'Block watcher error');
      }
    );
  }

  // Message formatting methods

  private async sendCreatedValidatorMessage(validator: SFCValidator): Promise<void> {
    const validatorLink = formatAddressLink(this.explorerUrl, validator.address, 'created validator');
    const msg = `${Emoji.ROCKET} A new ${validatorLink} with ID <b>${validator.id}</b>`;
    await this.sendMessage(msg);
  }

  private async sendDelegateMessage(info: SFCDelegateInfo): Promise<void> {
    const txLink = formatTxLink(this.explorerUrl, info.txHash, 'delegation event');
    const validatorName = getValidatorName(info.toValidatorId);
    const delegatorName = getContactName(info.delegator);

    const msg = `${Emoji.CHECK_MARK} A ${txLink} of <b>${formatAmount(info.amount)} S</b> from <code>${delegatorName}</code> to validator ${validatorName}`;
    await this.sendMessage(msg);
  }

  private async sendUndelegateMessage(info: SFCUndelegateInfo): Promise<void> {
    const txLink = formatTxLink(this.explorerUrl, info.txHash, 'undelegation event');
    const validatorName = getValidatorName(info.toValidatorId);
    const delegatorName = getContactName(info.delegator);

    const msg = `${Emoji.CROSS_MARK} An ${txLink} of <b>${formatAmount(info.amount)} S</b> from <code>${delegatorName}</code> to validator ${validatorName}`;
    await this.sendMessage(msg);
  }

  private async sendClaimRewardMessage(info: SFCRewardInfo): Promise<void> {
    const txLink = formatTxLink(this.explorerUrl, info.txHash, 'reward claim event');
    const validatorName = getValidatorName(info.toValidatorId);
    const delegatorName = getContactName(info.delegator);

    const msg = `${Emoji.STAR} A ${txLink} of <b>${formatAmount(info.unlockedReward)} S</b> from <code>${delegatorName}</code> to validator ${validatorName}`;
    await this.sendMessage(msg);
  }

  private async sendLockedUpStakeMessage(info: SFCLockedUpStake): Promise<void> {
    const txLink = formatTxLink(this.explorerUrl, info.txHash, 'locked up stake event');
    const validatorName = getValidatorName(info.validatorId);
    const delegatorName = getContactName(info.delegator);

    const msg = `${Emoji.LOCK} A ${txLink} of <b>${formatAmount(info.amount)} S</b> from <code>${delegatorName}</code> to validator ${validatorName}`;
    await this.sendMessage(msg);
  }

  private async sendUnlockedStakeMessage(info: SFCUnlockedStake): Promise<void> {
    const txLink = formatTxLink(this.explorerUrl, info.txHash, 'unlocked stake event');
    const validatorName = getValidatorName(info.validatorId);
    const delegatorName = getContactName(info.delegator);

    const msg = `${Emoji.UNLOCK} An ${txLink} of <b>${formatAmount(info.amount)} S</b> from <code>${delegatorName}</code> to validator ${validatorName}`;
    await this.sendMessage(msg);
  }

  private async sendBigTransferMessage(transfer: TransferLog): Promise<void> {
    const txLink = formatTxLink(this.explorerUrl, transfer.txHash, 'transfer');
    const fromName = getContactName(transfer.from);
    const toName = getContactName(transfer.to);

    const msg = `${Emoji.WHALE} Big ${txLink} of <b>${formatAmount(transfer.amount)} S</b> from <code>${fromName}</code> to <code>${toName}</code>`;
    await this.sendMessage(msg);
  }

  /**
   * Send a crash/shutdown notification
   */
  async sendShutdownNotification(reason: string): Promise<void> {
    const msg = `\u{1F6A8} Sonic bot stopped: ${reason}`;
    try {
      await this.telegram.sendMessage(msg);
    } catch (error) {
      logger.error({ error }, 'Failed to send shutdown notification');
    }
  }

  /**
   * Stop the bot
   */
  async stop(): Promise<void> {
    logger.info('Stopping Sonic bot');
    await this.sfcClient.close();
  }
}
