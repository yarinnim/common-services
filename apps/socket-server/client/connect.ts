import { io, type Socket } from 'socket.io-client';

const HOST = process.env.SOCKET_HOST || 'http://localhost:3000';
const PATH = process.env.SOCKET_PATH || '/socket-server/socket.io';
const NAMESPACE = '01a1f2b3-d17e-7abc-9c86-291d9686f2d0';
const APP_ID = '01a1f2b3-d186-70b6-9498-6a1511e5c490';
const SECRET_KEY = '26b6037f0a168fc7bad6daeb1ce55396';



type OutgoingMessage = {
  event: string;
  room?: string;
  message: unknown;
};

function connect(): Socket {
  if (!NAMESPACE || !APP_ID || !SECRET_KEY) {
    throw new Error(
      'Set SOCKET_NAMESPACE, SOCKET_APP_ID, and SOCKET_SECRET_KEY before connecting.',
    );
  }

  const socket = io(`${HOST}/${NAMESPACE}`, {
    path: PATH,
    auth: {
      namespace: NAMESPACE,
      appId: APP_ID,
      secretKey: SECRET_KEY,
    },
  });

  socket.on('connect', () => {
    console.log(`[INFO] Connected [${socket.id}] to ${HOST}/${NAMESPACE}`);
  });

  socket.on('connect_error', (error: Error) => {
    console.error(`[ERROR] ${error.message}`);
  });

  socket.on('disconnect', (reason: string) => {
    console.log(`[INFO] Disconnected: ${reason}`);
  });

  socket.on('room-joint', (message: string) => {
    console.log(`[INFO] room-joint: ${message}`);
  });

  socket.on('room-left', (message: string) => {
    console.log(`[INFO] room-left: ${message}`);
  });

  return socket;
}

export function joinRoom(socket: Socket, room: string) {
  socket.emit('join-room', room);
}

export function leaveRoom(socket: Socket, room: string) {
  socket.emit('leave-room', room);
}

export function sendMessage(socket: Socket, payload: OutgoingMessage) {
  socket.emit('message', payload);
}

const socket = connect();

export default socket;
