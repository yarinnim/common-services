import {
  MQ_HOST, MQ_PORT, MQ_USER, MQ_PASSWORD,
  COMMON_MQ_HOST, COMMON_MQ_PORT, COMMON_MQ_USER, COMMON_MQ_PASSWORD,
  DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_DATABASE,
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

export const psql = {
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
};
