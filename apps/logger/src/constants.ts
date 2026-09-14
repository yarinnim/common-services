import dotenv from 'dotenv';
import {get} from 'http';

dotenv.config();

const getEnv = (key: string): string | number => process.env[key] || (() => {
  throw new Error(`The ${key} environment variable is required`);
})();

export const APP_PORT: number = getEnv('APP_PORT') as number;
export const APP_ENV = getEnv('APP_ENV') as string;
export const APP_NAME = getEnv('APP_NAME') as string;

export const DB_HOST = getEnv('DB_HOST') as string;
export const DB_PORT = getEnv('DB_PORT') as any;
export const DB_USERNAME = getEnv('DB_USERNAME') as string;
export const DB_PASSWORD = getEnv('DB_PASSWORD') as string;
export const DB_DATABASE = getEnv('DB_DATABASE') as string;
export const DB_MAX_POOL_SIZE = getEnv('DB_MAX_POOL_SIZE') as number;
export const DB_REQUEST_LOG_DB = getEnv('DB_REQUEST_LOG_DB') as string;

export const MQ_HOST = getEnv('MQ_HOST') as string;
export const MQ_PORT = getEnv('MQ_PORT') as any;
export const MQ_USER = getEnv('MQ_USER') as string;
export const MQ_PASSWORD = getEnv('MQ_PASSWORD') as string;

export const LOG_EXCHANGE = getEnv('LOG_EXCHANGE') as string;
export const EVENT_EXCHANGE = getEnv('EVENT_EXCHANGE');
