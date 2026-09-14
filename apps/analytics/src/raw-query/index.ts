import type { Route, Response } from 'xpref';
import client from '../clickhouse/client';
import type { AppRequest } from '../middleware/application.middleware';
import getSql from './sql-builder';

const rawSQLAction = (req: AppRequest, res: Response) => {
  const { application, body, query } = req;
  const sql = getSql({
    chrono: query,
    query: body,
  });

  return client.query({
    query: sql,
    query_params: { appId: application?.id },
    format: 'JSONEachRow',
  })
    .then((result: any) => result.json())
    .then((result: any) => res.json({ result }))
    .catch((error: any) => {
      const { message } = error;
      return res.status(401).json({ message });
    });
};

export default {
  '/query': ['raw-query', [], {
    post: rawSQLAction,
  }],
} as Route;
