import { MQ_HOST, MQ_PORT, MQ_USER, MQ_PASSWORD } from './constants';

export const logLevels = ['debug', 'info', 'warn', 'error', 'fatal', 'request-log'];

export const route = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  FETAL: 'fetal',
  REQUEST_LOG: 'request-log',
};

export const mqConnection = {
  host: MQ_HOST,
  port: MQ_PORT,
  user: MQ_USER,
  password: MQ_PASSWORD,
};

