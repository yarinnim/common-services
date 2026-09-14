import type { Route, Response } from 'xpref';
import client from '../clickhouse/client';
import type { AppRequest } from '../middleware/application.middleware';
import extractUrlParams from './extract-url-params';
import splitUrl from './split-url';
import countDimension from './count-dimension';

const action: any = {
  'extract-url-params': extractUrlParams,
  'split-url': splitUrl,
  'count-dimension':  countDimension,
};

const customeStatisticsAction = (req: AppRequest, res: Response) => {
  const { application, query } = req as any;
  const sqlQuery = (action as any)[query?.action as string] || false;

  if (!sqlQuery) return res.status(404).json({
    message: 'Action not available',
  });

  const strQuery = sqlQuery(query);

  return client.query({
    query: strQuery,
    query_params: { appId: application?.id },
    format: 'JSONEachRow',
  }).then((result: any) => result.json())
    .then((result: any) => res.json({ result }))
    .catch((error: any) => {
      const { message } = error;
      return res.status(401).json({ message });
    });
};

export default {
  '/custom': ['custom', [], {
    get: customeStatisticsAction,
  }],
} as Route;
