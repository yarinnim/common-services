import logClient from '@core/log-client';
import mq, { getConnectionCallback } from '@core/message-queue';
import { mqConnection } from './config';
import { APP_ENV, APP_NAME, LOG_EXCHANGE, DEBUG_MODE } from './constants';

const name = 'log-client';
const { common } = mqConnection;
mq({ ...common, name }, { onConnect: () => true });

export default function initLogClient() {
  return logClient({
    connection: getConnectionCallback(name),
    logExchange: LOG_EXCHANGE,
    env: APP_ENV, appName: APP_NAME,
    debugMode: DEBUG_MODE,
  });
}
