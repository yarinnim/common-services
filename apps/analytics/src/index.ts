/* eslint-disable no-console */
import xpref, { type Xpref } from 'xpref';
import logger from './log-client';
import { APP_PORT, APP_ENV, APP_NAME } from './constants';
import routes from './routes';
import initMQServices from './message-queque';

const apiProps: Xpref = {
  port: APP_PORT,
  appEnv: APP_ENV,
  appName: APP_NAME,
  routes,
  logger,
} as Xpref;

xpref(apiProps)
  .then(initMQServices)
  .catch(console.error);
