import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { AppConfig, ContactEntry, ValidatorEntry } from '../types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let config: AppConfig | null = null;
let contactBook: Map<string, string> = new Map();
let validatorBook: Map<number, string> = new Map();

/**
 * Load configuration from JSON file
 */
export function loadConfig(configPath?: string): AppConfig {
  if (config) return config;

  const path = configPath || join(__dirname, '../../config/mainnet.json');
  const raw = readFileSync(path, 'utf-8');
  config = JSON.parse(raw) as AppConfig;

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
