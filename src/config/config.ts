import 'dotenv/config';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import type { AppConfig, ContactEntry, ValidatorEntry } from '../types/index.js';

let config: AppConfig | null = null;
let contactBook: Map<string, string> = new Map();
let validatorBook: Map<number, string> = new Map();

/**
 * Get required environment variable or throw
 */
function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

/**
 * Get optional environment variable with default
 */
function getEnv(name: string, defaultValue: string): string {
  return process.env[name] || defaultValue;
}

/**
 * Load JSON file, returns empty array if file doesn't exist
 */
function loadJsonFile<T>(filePath: string): T[] {
  const resolvedPath = resolve(filePath);
  if (!existsSync(resolvedPath)) {
    return [];
  }
  try {
    const raw = readFileSync(resolvedPath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    throw new Error(`Failed to parse JSON file ${filePath}: ${err}`);
  }
}

/**
 * Load configuration from environment variables
 */
export function loadConfig(): AppConfig {
  if (config) return config;

  // Load contact and validator books from JSON files
  const contactBookPath = getEnv('CONTACT_BOOK_PATH', 'data/contacts.json');
  const validatorBookPath = getEnv('VALIDATOR_BOOK_PATH', 'data/validators.json');

  const contacts = loadJsonFile<ContactEntry>(contactBookPath);
  const validators = loadJsonFile<ValidatorEntry>(validatorBookPath);

  config = {
    sonic_chain: {
      sfc_contract_address: getEnv('SFC_CONTRACT_ADDRESS', '0xFC00FACE00000000000000000000000000000000'),
      rpc_endpoint: getEnv('RPC_ENDPOINT', 'https://rpc.soniclabs.com'),
      ws_endpoint: getEnv('WS_ENDPOINT', 'wss://rpc.soniclabs.com'),
      explorer_tx_endpoint: getEnv('EXPLORER_TX_ENDPOINT', 'https://sonicscan.org'),
    },
    thresholds: {
      min_staking_amount: parseFloat(getEnv('MIN_STAKING_AMOUNT', '1000')),
      min_claim_amount: parseFloat(getEnv('MIN_CLAIM_AMOUNT', '1000')),
      min_transfer_amount: parseFloat(getEnv('MIN_TRANSFER_AMOUNT', '1000')),
    },
    telegram: {
      token: requireEnv('TELEGRAM_TOKEN'),
      chat_id: parseInt(requireEnv('TELEGRAM_CHAT_ID'), 10),
    },
    contact_book: contacts,
    validator_book: validators,
  };

  // Build lookup maps
  for (const entry of config.contact_book) {
    contactBook.set(entry.address.toLowerCase(), entry.name);
  }

  for (const entry of config.validator_book) {
    validatorBook.set(entry.id, entry.name);
  }

  return config;
}

/**
 * Get configuration (must be loaded first)
 */
export function getConfig(): AppConfig {
  if (!config) {
    throw new Error('Configuration not loaded. Call loadConfig() first.');
  }
  return config;
}

/**
 * Get contact name by address, returns address if not found
 */
export function getContactName(address: string): string {
  const name = contactBook.get(address.toLowerCase());
  return name || address;
}

/**
 * Get validator name by ID, returns ID as string if not found
 */
export function getValidatorName(id: number | bigint): string {
  const numId = typeof id === 'bigint' ? Number(id) : id;
  const name = validatorBook.get(numId);
  return name || `Validator ${numId}`;
}

/**
 * Add a new contact to the book
 */
export function addContact(address: string, name: string): void {
  contactBook.set(address.toLowerCase(), name);
}

/**
 * Add a new validator to the book
 */
export function addValidator(id: number, name: string): void {
  validatorBook.set(id, name);
}
