import xpref, {
  type Response, type Request,
  type Xpref, type Route,
} from 'xpref';
import consume from './consume';
import { APP_PORT, APP_NAME, APP_ENV } from './constants';

const homeAction = (_req: Request, res: Response) => res.json({
  message: 'Heart beat',
  at: new Date(),
});

const routes = {
  '/': ['hom', [], {
    get: homeAction,
  }],
} as Route;

const props: Xpref = {
  appName: APP_NAME,
  appEnv: APP_ENV,
  port: APP_PORT,
  routes,
};

xpref(props).then(consume);
