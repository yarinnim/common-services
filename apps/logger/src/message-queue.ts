/* eslint-disable no-console */
import connect, { type MessageQueue, type ChannelModel } from '@core/message-queue';
import {
  MQ_HOST, MQ_PORT,
  MQ_USER, MQ_PASSWORD,
} from './constants';

const getConnection = (): MessageQueue => ({
  host: MQ_HOST,
  port: MQ_PORT,
  user: MQ_USER,
  password: MQ_PASSWORD,
});

export default function connectMQ(cb: CallableFunction) {
  const connection = getConnection();
  return connect(connection, {
    onConnect: (con: ChannelModel) => {
      console.log(`[x] Message queue is connected (${MQ_HOST})...`);
      return cb(con);
    },
  });
}
