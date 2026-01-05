export const SFC_ABI = [
  // Events
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'validatorID', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'status', type: 'uint256' },
    ],
    name: 'ChangedValidatorStatus',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'delegator', type: 'address' },
      { indexed: true, internalType: 'uint256', name: 'toValidatorID', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'lockupExtraReward', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'lockupBaseReward', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'unlockedReward', type: 'uint256' },
    ],
    name: 'ClaimedRewards',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'validatorID', type: 'uint256' },
      { indexed: true, internalType: 'address', name: 'auth', type: 'address' },
      { indexed: false, internalType: 'uint256', name: 'createdEpoch', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'createdTime', type: 'uint256' },
    ],
    name: 'CreatedValidator',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'uint256', name: 'validatorID', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'deactivatedEpoch', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'deactivatedTime', type: 'uint256' },
    ],
    name: 'DeactivatedValidator',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'delegator', type: 'address' },
      { indexed: true, internalType: 'uint256', name: 'toValidatorID', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'Delegated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'delegator', type: 'address' },
      { indexed: true, internalType: 'uint256', name: 'toValidatorID', type: 'uint256' },
      { indexed: true, internalType: 'uint256', name: 'wrID', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'Undelegated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, internalType: 'address', name: 'delegator', type: 'address' },
      { indexed: true, internalType: 'uint256', name: 'toValidatorID', type: 'uint256' },
      { indexed: true, internalType: 'uint256', name: 'wrID', type: 'uint256' },
      { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'Withdrawn',
    type: 'event',
  },
  // Functions (only what we need)
  {
    constant: true,
    inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    name: 'getValidator',
    outputs: [
      { internalType: 'uint256', name: 'status', type: 'uint256' },
      { internalType: 'uint256', name: 'deactivatedTime', type: 'uint256' },
      { internalType: 'uint256', name: 'deactivatedEpoch', type: 'uint256' },
      { internalType: 'uint256', name: 'receivedStake', type: 'uint256' },
      { internalType: 'uint256', name: 'createdEpoch', type: 'uint256' },
      { internalType: 'uint256', name: 'createdTime', type: 'uint256' },
      { internalType: 'address', name: 'auth', type: 'address' },
    ],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
  {
    constant: true,
    inputs: [],
    name: 'lastValidatorID',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    payable: false,
    stateMutability: 'view',
    type: 'function',
  },
] as const;

export const SFC_ADDRESS = '0xFC00FACE00000000000000000000000000000000';
