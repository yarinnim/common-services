import mq, { getConnectionCallback } from '@core/message-queue';
import { eventEmitter } from '@core/event';
import { EVENT_EXCHANGE } from './constants';
import { mqConnection } from './config';

const name = 'analytics';

mq({ ...mqConnection, name }, { onConnect: () => true });

export default function initEventEmitter() {
  return eventEmitter({
    connection: getConnectionCallback(name),
    eventExchange: EVENT_EXCHANGE.toString(),
  });
}
