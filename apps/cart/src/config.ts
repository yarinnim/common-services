import {
  MQ_HOST, MQ_PORT, MQ_USER, MQ_PASSWORD,
  COMMON_MQ_HOST, COMMON_MQ_PORT, COMMON_MQ_USER, COMMON_MQ_PASSWORD,
  CATALOG_BASE_URL, INVENTORY_BASE_URL,
} from './constants';

export const mqConnection = {
  internal: {
    host: MQ_HOST,
    port: MQ_PORT,
    user: MQ_USER,
    password: MQ_PASSWORD,
  },
  common: {
    host: COMMON_MQ_HOST,
    port: COMMON_MQ_PORT,
    user: COMMON_MQ_USER,
    password: COMMON_MQ_PASSWORD,
  },
};

export const applicationHeader = {
  ID: 'app-id',
  SECRET_KEY: 'app-secret-key',
  USER_ID: 'x-user-id',
  SESSION_ID: 'x-session-id',
};

export const applicationExcludedPath = {
  TEST: '/test',
};

export const guestCart = {
  EXPIRES_SQL: 'current_timestamp + interval \'7 days\'',
  CLEANUP_INTERVAL: '1h',
};

export const catalogService = {
  BASE_URL: CATALOG_BASE_URL,
};

export const inventoryService = {
  BASE_URL: INVENTORY_BASE_URL,
};

