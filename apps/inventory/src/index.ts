/* eslint-disable no-console */
import xpref, { type Xpref } from 'xpref';
import logger from './log-client';
import { APP_PORT, APP_ENV, APP_NAME } from './constants';
import routes from './routes';

const apiProps: Xpref = {
  port: APP_PORT, appEnv: APP_ENV, appName: APP_NAME,
  routes, logger,
} as any;

xpref(apiProps).catch(console.error);
