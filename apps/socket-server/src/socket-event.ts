/* eslint-disable no-console */
import logger from './log-client';

type BindedProps = {
  socket: any;
  io: any;
}

export const onError = (props: BindedProps, error: any) => {
  const { socket } = props;
  const { message } = error;
  logger().error(message);
  socket.disconnect();
};

export const onDisconnect = (props: BindedProps, reason: any) => {
  const { socket } = props;
  logger().error(reason);
  socket.disconnect();
};

export const onDisconnecting = (_props: BindedProps, reason: any) => {
  logger().error(reason);
};

export const onNewNamespace = (_props: any, namespace: any) => {
  const { name } = namespace;
  console.log(`[INFO] New name space connected [${name}]...`);
};
