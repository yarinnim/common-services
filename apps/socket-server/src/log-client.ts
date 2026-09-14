import logClient, { type Logger } from '@core/log-client';
import mq, { getConnectionCallback } from '@core/message-queue';
import {
  LOG_EXCHANGE,
  APP_ENV,
  APP_NAME, MQ_HOST,
  MQ_PORT, MQ_USER, MQ_PASSWORD,
} from './constants';

const mqName = 'log-client';
mq({
  name: mqName,
  host: MQ_HOST,
  port: MQ_PORT,
  user: MQ_USER,
  password: MQ_PASSWORD,
}, { onConnect: () => true });

export default function initLogClient(): Logger {
  return logClient({
    connection: getConnectionCallback(mqName),
    logExchange: LOG_EXCHANGE,
    env: APP_ENV,
    appName: APP_NAME,
  });
}
