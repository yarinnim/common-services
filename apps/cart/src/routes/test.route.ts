import { type Route, type Response, type Request } from 'xpref';
import logger from '../log-client';

const action = (req: Request, res: Response) => {
  const { body = {}, headers } = req;
  logger().error({ at: new Date() });
  return res.json({
    at: new Date(),
    body,
    headers,
  });
};

export default {
  '/test': ['test', [], {
    get: action,
    post: action,
  }],
} as Route;
