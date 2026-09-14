/* eslint-disable no-console */
import xpref, { type Xpref } from 'xpref';
import { createServer } from 'http';
import { APP_PORT, APP_ENV, APP_NAME } from './constants';
import initSocketServer from './socket-server';
import logger from './log-client';
import routes from './routes';

const apiProps: Xpref = {
  port: APP_PORT,
  appEnv: APP_ENV,
  appName: APP_NAME,
  routes,
  logger,
  manuallyStart: (initializedApi: any) => {
    console.log('[INFO] Start the server manually.');
    const { app, port } = initializedApi; 
    const server = createServer(app);
    return initSocketServer({ server, port });
  },
} as any;

xpref(apiProps);
