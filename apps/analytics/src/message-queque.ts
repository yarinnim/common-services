import mq from '@core/message-queue';
import { mqConnection } from './config';
import initEventReceiver from './event-receiver';

const { common } = mqConnection;

export default function initMQServices() {
  return mq(common, {
    onConnect: (connection: any) => {
      initEventReceiver(connection);
    },
  });
}
