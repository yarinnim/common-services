import dotenv from 'dotenv';

dotenv.config();

const getEnv = (key: string): string | number | boolean => process.env[key] || (() => {
  throw new Error(`The ${key} environment variable is required`);
})();

export const APP_ENV = getEnv('APP_ENV') as string;
export const APP_NAME = getEnv('APP_NAME') as string;
export const APP_PORT = getEnv('APP_PORT') as number;

export const SOCKET_PATH = getEnv('SOCKET_PATH') as string;

export const MQ_HOST = getEnv('MQ_HOST') as string;
export const MQ_PORT = getEnv('MQ_PORT') as any;
export const MQ_USER = getEnv('MQ_USER') as string;
export const MQ_PASSWORD = getEnv('MQ_PASSWORD') as string;

export const LOG_EXCHANGE = getEnv('LOG_EXCHANGE') as string;

export const DB_HOST = getEnv('DB_HOST') as string;
export const DB_PORT = getEnv('DB_PORT') as number;
export const DB_USER = getEnv('DB_USER') as string;
export const DB_PASSWORD = getEnv('DB_PASSWORD') as string;
export const DB_DATABASE = getEnv('DB_DATABASE') as string;
export const DB_READ_HOST = getEnv('DB_READ_HOST') as string;
export const DB_READ_PORT = getEnv('DB_READ_PORT') as number;
