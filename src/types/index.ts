// Configuration types
export interface SonicChainConfig {
  sfc_contract_address: string;
  rpc_endpoint: string;
  ws_endpoint: string;
  explorer_tx_endpoint: string;
}

export interface ThresholdsConfig {
  min_staking_amount: number;
  min_claim_amount: number;
  min_transfer_amount: number;
}

export interface TelegramConfig {
  token: string;
  chat_id: number;
}

export interface ContactEntry {
  address: string;
  name: string;
}

export interface ValidatorEntry {
  id: number;
  name: string;
}

export interface AppConfig {
  sonic_chain: SonicChainConfig;
  thresholds: ThresholdsConfig;
  telegram: TelegramConfig;
  contact_book: ContactEntry[];
  validator_book: ValidatorEntry[];
}

// SFC Event types
export interface SFCValidator {
  id: bigint;
  address: string;
  createdTime: bigint;
  createdEpoch: bigint;
  deactivatedTime: bigint;
  deactivatedEpoch: bigint;
  isActive: boolean;
  isOffline: boolean;
}

export interface SFCDelegateInfo {
  delegator: string;
  toValidatorId: bigint;
  amount: number;
  blockNumber: bigint;
  txHash: string;
}

export interface SFCUndelegateInfo {
  delegator: string;
  toValidatorId: bigint;
  amount: number;
  wrId: bigint;
  blockNumber: bigint;
  txHash: string;
}

export interface SFCRewardInfo {
  delegator: string;
  toValidatorId: bigint;
  lockupExtraReward: number;
  lockupBaseReward: number;
  unlockedReward: number;
  blockNumber: bigint;
  txHash: string;
}

export interface SFCLockedUpStake {
  delegator: string;
  validatorId: bigint;
  duration: bigint;
  amount: number;
  blockNumber: bigint;
  txHash: string;
}

export interface SFCUnlockedStake {
  delegator: string;
  validatorId: bigint;
  amount: number;
  penalty: number;
  blockNumber: bigint;
  txHash: string;
}

export interface TransferLog {
  blockNumber: bigint;
  txHash: string;
  from: string;
  to: string;
  amount: number;
}
