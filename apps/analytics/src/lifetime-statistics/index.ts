import { type Route, type Response } from 'xpref';
import { type AppRequest } from '../middleware/application.middleware';
import {
  getUniqueCount,
  getUniqueDimensionCount,
} from '../clickhouse/model/analytics-lifetime.model';
import { dimension } from '../clickhouse/config';

const lifeTimeAction = (req: AppRequest, response: Response): any => {
  const { application } = req;
  const { id } = application as any;

  const uniqueCounts = Object.keys(dimension).map((key: string) => {
    const value = (dimension as any)[key];
    return getUniqueCount(id, value, 10)
      .then((result: any) => ({ [value]: result }));
  });

  return Promise.all(uniqueCounts)
    .then((result: any) => response.json({ dimensions: result }));
};

const uniqueCountAction = (request: AppRequest, response: Response): any => {
  const { application } = request;
  const { dimensions } = request.query;
  const { id } = application as any;
  const queryDimensions: any[] = JSON.parse(dimensions as string);
  const uniqueCounts = queryDimensions.map((dimension: string) =>
    getUniqueDimensionCount(id,dimension as string)
      .then(([result]: any) => ({ [dimension]: result[dimension] })),
  );

  return Promise.all(uniqueCounts)
    .then((result: any) => response.json({ dimensions: result }));
};
export default {
  '/lifetime': ['analytics',[], {
    get: lifeTimeAction,
  },
  {
    '/unique-count': ['analytics-count-device', [], {
      get: uniqueCountAction,
    }],
  },
  ],
} as Route;
