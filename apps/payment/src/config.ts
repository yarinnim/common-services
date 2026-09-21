import {
  MQ_HOST, MQ_PORT, MQ_USER, MQ_PASSWORD,
  COMMON_MQ_HOST, COMMON_MQ_PORT, COMMON_MQ_USER, COMMON_MQ_PASSWORD,
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
  IDEMPOTENCY_KEY: 'idempotency-key',
};

export const applicationExcludedPath = {
  TEST: '/test',
  WEBHOOK_PREFIX: '/webhooks',
};

export const paymentProvider = {
  STRIPE: 'stripe',
  PAYPAL: 'paypal',
  ADYEN: 'adyen',
};

export const paymentAction = {
  CHARGE: 'charge',
  AUTHORIZE: 'authorize',
  CAPTURE: 'capture',
  REFUND: 'refund',
};

export const paymentStatus = {
  PENDING: 'pending',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  CANCELED: 'canceled',
};

export const webhookStatus = {
  RECEIVED: 'received',
  PROCESSED: 'processed',
  FAILED: 'failed',
  DEAD_LETTER: 'dead_letter',
};

export const auditSource = {
  API: 'api',
  WEBHOOK: 'webhook',
  SYSTEM: 'system',
};
