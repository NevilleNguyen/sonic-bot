import { Contract, WebSocketProvider, JsonRpcProvider, ContractEventPayload } from 'ethers';
import { SFC_ABI } from '../contracts/sfc-abi.js';
import { getConfig } from '../config/config.js';
import { weiToFloat } from '../utils/format.js';
import type {
  SFCValidator,
  SFCDelegateInfo,
  SFCUndelegateInfo,
  SFCRewardInfo,
} from '../types/index.js';
import pino from 'pino';

const logger = pino({ name: 'sfc-client' });

export class SFCClient {
  private rpcProvider: JsonRpcProvider;
  private wsProvider: WebSocketProvider;
  private contract: Contract;
  private wsContract: Contract;

  constructor() {
    const config = getConfig();

    this.rpcProvider = new JsonRpcProvider(config.sonic_chain.rpc_endpoint);
    this.wsProvider = new WebSocketProvider(config.sonic_chain.ws_endpoint);

    this.contract = new Contract(
      config.sonic_chain.sfc_contract_address,
      SFC_ABI,
      this.rpcProvider
    );

    this.wsContract = new Contract(
      config.sonic_chain.sfc_contract_address,
      SFC_ABI,
      this.wsProvider
    );
  }

  /**
   * Get the last validator ID
   */
  async getLastValidatorId(): Promise<bigint> {
    return await this.contract.lastValidatorID();
  }

  /**
   * Get validator by ID
   */
  async getValidatorById(id: bigint): Promise<SFCValidator> {
    const result = await this.contract.getValidator(id);
    const isActive = result.status === 0n;

    return {
      id,
      address: result.auth,
      createdTime: result.createdTime,
      createdEpoch: result.createdEpoch,
      deactivatedTime: result.deactivatedTime,
      deactivatedEpoch: result.deactivatedEpoch,
      isActive,
      isOffline: false,
    };
  }

  /**
   * Watch for CreatedValidator events
   */
  watchCreatedValidator(
    callback: (validator: SFCValidator) => void,
    onError: (error: Error) => void
  ): void {
    this.wsContract.on('CreatedValidator', (validatorID, auth, createdEpoch, createdTime, event) => {
      try {
        const validator: SFCValidator = {
          id: validatorID,
          address: auth,
          createdTime,
          createdEpoch,
          deactivatedTime: 0n,
          deactivatedEpoch: 0n,
          isActive: true,
          isOffline: false,
        };
        callback(validator);
      } catch (err) {
        onError(err as Error);
      }
    });

    this.wsProvider.on('error', onError);
  }

  /**
   * Watch for Delegated events
   */
  watchDelegated(
    callback: (info: SFCDelegateInfo) => void,
    onError: (error: Error) => void
  ): void {
    this.wsContract.on('Delegated', (delegator, toValidatorID, amount, event: ContractEventPayload) => {
      try {
        const log = event.log;
        const info: SFCDelegateInfo = {
          delegator,
          toValidatorId: toValidatorID,
          amount: weiToFloat(amount),
          blockNumber: BigInt(log.blockNumber),
          txHash: log.transactionHash,
        };
        callback(info);
      } catch (err) {
        onError(err as Error);
      }
    });
  }

  /**
   * Watch for Undelegated events
   */
  watchUndelegated(
    callback: (info: SFCUndelegateInfo) => void,
    onError: (error: Error) => void
  ): void {
    this.wsContract.on('Undelegated', (delegator, toValidatorID, wrID, amount, event: ContractEventPayload) => {
      try {
        const log = event.log;
        const info: SFCUndelegateInfo = {
          delegator,
          toValidatorId: toValidatorID,
          amount: weiToFloat(amount),
          wrId: wrID,
          blockNumber: BigInt(log.blockNumber),
          txHash: log.transactionHash,
        };
        callback(info);
      } catch (err) {
        onError(err as Error);
      }
    });
  }

  /**
   * Watch for ClaimedRewards events
   */
  watchClaimedRewards(
    callback: (info: SFCRewardInfo) => void,
    onError: (error: Error) => void
  ): void {
    this.wsContract.on(
      'ClaimedRewards',
      (delegator, toValidatorID, lockupExtraReward, lockupBaseReward, unlockedReward, event: ContractEventPayload) => {
        try {
          const log = event.log;
          const info: SFCRewardInfo = {
            delegator,
            toValidatorId: toValidatorID,
            lockupExtraReward: weiToFloat(lockupExtraReward),
            lockupBaseReward: weiToFloat(lockupBaseReward),
            unlockedReward: weiToFloat(unlockedReward),
            blockNumber: BigInt(log.blockNumber),
            txHash: log.transactionHash,
          };
          callback(info);
        } catch (err) {
          onError(err as Error);
        }
      }
    );
  }

  /**
   * Watch for new block headers
   */
  watchNewBlocks(
    callback: (blockNumber: bigint) => void,
    onError: (error: Error) => void
  ): void {
    this.wsProvider.on('block', (blockNumber: number) => {
      try {
        callback(BigInt(blockNumber));
      } catch (err) {
        onError(err as Error);
      }
    });
  }

  /**
   * Get RPC provider for block queries
   */
  getRpcProvider(): JsonRpcProvider {
    return this.rpcProvider;
  }

  /**
   * Close all connections
   */
  async close(): Promise<void> {
    await this.wsProvider.destroy();
  }
}
