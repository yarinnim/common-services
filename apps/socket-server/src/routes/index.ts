import type { Route, Request, Response } from 'xpref';

const getAction = (req: Request, res: Response) => res.json({
  message: 'Test action',
  at: new Date(),
  headers: req.headers,
});

export default {
  '/test': ['test', [], {
    get: getAction,
  }],
} as Route;
