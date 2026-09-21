/* eslint-disable no-console */
import xpref, { type Xpref, type Application } from 'xpref';
import logger from './log-client';
import { APP_PORT, APP_ENV, APP_NAME } from './constants';
import { validateApplication } from './middleware/validate-application.middleware';
import routes from './routes';

const apiProps: Xpref = {
  port: APP_PORT,
  appEnv: APP_ENV,
  appName: APP_NAME,
  interceptor: (app: Application) => app.use(validateApplication),
  routes,
  logger,
};

xpref(apiProps).catch(console.error);
