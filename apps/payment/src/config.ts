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

