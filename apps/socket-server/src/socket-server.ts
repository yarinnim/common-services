/* eslint-disable no-console */
import { Server } from 'socket.io';
import authMdw from './auth';
import {
  onError, onDisconnect,
  onDisconnecting,
  onNewNamespace,
} from './socket-event';
import messageHandler, { type Message } from './message-handler';
import { SOCKET_PATH } from './constants';

type SocketServer = {
  server: any;
  port: number,
}

export default function initServer(props: SocketServer) {
  const { server, port } = props;
  const io = new Server(server, {
    path: SOCKET_PATH,
    connectionStateRecovery: {},
    cors: { origin: '*' },
  });

  server.listen(port, () => {
    console.log(`[INFO] Server started manually at port ${port}`);
  });

  const nameReg = /^\/[\w\d-]*$/;
  const rootNamespace = io.of(nameReg);
  rootNamespace.use(authMdw);
  rootNamespace.on('connection', (socket) => {
    const { id } = socket;
    console.log(`[INFO] Socket connection created [${id}]`);
    const bindedProps = { socket, io };
    socket.on('error', onError.bind(null, bindedProps));
    socket.on('disconnect', onDisconnect.bind(null, bindedProps));
    socket.on('disconnecting', onDisconnecting.bind(null, bindedProps));

    socket.on('join-room', (room: string) => {
      socket.join(room);
      rootNamespace.to(room).emit('room-joint', 'New connection joins room.');
    });

    socket.on('leave-room', (room: string) => {
      socket.leave(room);
      rootNamespace.to(room).emit('room-left', 'A member left the room.');
    });

    socket.on('message', (message: Message) => {
      messageHandler({ rootNamespace, socket }, message);
    });
  });

  io.on('new_namespace', onNewNamespace.bind(null, { io }));
  return io;
}
