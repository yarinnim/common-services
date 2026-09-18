import dotenv from 'dotenv';

dotenv.config();

type Env = string | number | boolean;

function getEnv<T extends Env = string>(key: string): T {
  const result = process.env[key];
  if (result === undefined) throw new Error(`The ${key} environment variable is required`);
  return result as T;
};

export const DEBUG_MODE = getEnv<boolean>('DEBUG_MODE').toString().includes('true');
export const APP_PORT = getEnv('APP_PORT') as number;
export const APP_ENV = getEnv('APP_ENV');
export const APP_NAME = getEnv('APP_NAME');

export const DB_HOST = getEnv('DB_HOST');
export const DB_PORT = getEnv('DB_PORT') as number;
export const DB_USER = getEnv('DB_USER');
export const DB_PASSWORD = getEnv('DB_PASSWORD');
export const DB_DATABASE = getEnv('DB_DATABASE');
export const DB_READ_HOST = getEnv('DB_READ_HOST');
export const DB_READ_PORT = getEnv('DB_READ_PORT') as number;

export const MQ_HOST = getEnv('MQ_HOST');
export const MQ_PORT = getEnv('MQ_PORT') as number;
export const MQ_USER = getEnv('MQ_USER');
export const MQ_PASSWORD = getEnv('MQ_PASSWORD');

export const COMMON_MQ_HOST = getEnv('COMMON_MQ_HOST');
export const COMMON_MQ_PORT = getEnv('COMMON_MQ_PORT') as number;
export const COMMON_MQ_USER = getEnv('COMMON_MQ_USER');
export const COMMON_MQ_PASSWORD = getEnv('COMMON_MQ_PASSWORD');

export const LOG_EXCHANGE = getEnv('LOG_EXCHANGE');

/**
 * Reads an optional env value and strips a trailing slash from URLs.
 *
 * @example
 * getOptionalEnv('CATALOG_BASE_URL');
 */
function getOptionalEnv(key: string): string {
  return `${process.env[key] || ''}`.replace(/\/$/, '');
}

export const CATALOG_BASE_URL = getOptionalEnv('CATALOG_BASE_URL');
export const INVENTORY_BASE_URL = getOptionalEnv('INVENTORY_BASE_URL');
