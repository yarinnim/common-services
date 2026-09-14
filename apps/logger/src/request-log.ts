/* eslint-disable no-console */
import { requestLogPool } from './pool';
import { encrypt } from './crypto';
import eventEmitter from './event-emitter';

const getRequestLogInfo = (data: any) => {
  const { timestamp, message } = data;
  const { method } = message;
  const info = {
    timestamp,
    method,
    ...message,
  };

  if (method === 'GET') return info;
  const body = encrypt(message.body || '{}');
  return { ...info, body };
};

export default function handleRequestLog(props: any) {
  const { data, collectionName } = props;
  const reqLogInfo = getRequestLogInfo(data);

  const emit = eventEmitter();
  emit('request-log', data);

  return requestLogPool(collectionName)
    .then((collection: any) => collection.insertOne(reqLogInfo))
    .catch((error: any) => {
      console.error(`[ERROR] Logger - ${error.message}`);
    });

}
