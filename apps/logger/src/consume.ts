import connect, {
  type MessageQueue,
  type ChannelModel,
  type Channel,
} from '@core/message-queue';
import {
  MQ_HOST, MQ_PORT, MQ_USER,
  MQ_PASSWORD, LOG_EXCHANGE,
} from './constants';
import pool from './pool';
import { getCollectionName, consoleLog, parseContent } from './utils';
import handleRequestLog from './request-log';
import { logLevels, route } from './config';

const onChannelCreated = (channel: Channel) => {
  channel.assertExchange(LOG_EXCHANGE, 'direct', { durable: false });
  return channel.assertQueue('', { exclusive: true })
    .then((queue: any) => ({ queue, channel }));
};

const getLogInfo = (data: any) => ({
  timestamp: data.timestamp,
  message: data.message,
  severity: data.severity,
});

const onConsume = (message: any): any => {
  const { fields, content } = message;
  const { routingKey } = fields;
  const parsedContent = parseContent(content);
  const data = { ...parsedContent, severity: routingKey };

  consoleLog(data);

  const collectionName = getCollectionName(data);

  if (routingKey === route.REQUEST_LOG) return handleRequestLog({
    data,
    collectionName,
  });

  const logInfo = getLogInfo(data);
  return pool(collectionName)
    .then((collection: any) => collection.insertOne(logInfo));
};

const onQueueAsserted = (props: any) => {
  const { channel, queue } = props;
  logLevels.forEach((level: string) => channel.bindQueue(queue.queue, LOG_EXCHANGE, level));
  channel.consume(queue.queue, onConsume, { noAck: true });
};

export default function connectToMQ() {
  const props = {
    host: MQ_HOST,
    port: MQ_PORT,
    user: MQ_USER,
    password: MQ_PASSWORD,
  } as MessageQueue;

  return connect(props, {
    onConnect: (con: ChannelModel) => {
      return con.createChannel()
        .then(onChannelCreated)
        .then(onQueueAsserted);
    },
  });
}
