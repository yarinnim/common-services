import client from '../client';
import { ANALYTICS_LIFETIME_TABLE } from '../migration/schema';
import {
  buildAnalyticsRow,
  type AnalyticsEventData,
} from './analytics-event-data.type';

const format = 'JSONEachRow';

export const createLifetimeAnalytics = (
  applicationId: number,
  data: AnalyticsEventData,
) => {
  const values = [buildAnalyticsRow(applicationId, data)];
  return client.insert({
    table: ANALYTICS_LIFETIME_TABLE,
    values,
    format,
  });
};
const lifetimeUniqueDimensionCountQuery = (dimensionName: string) => {
  const strQuery = `
    SELECT
      uniq(${dimensionName}) AS ${dimensionName}
    FROM analytics_lifetime
    WHERE application_id = {appId: UInt32}
    LIMIT 1
  `;
  return strQuery;
};

const lifetimeCountQuery = (dimensionName: string, limit: number = 10) => {
  const strQuery = `
    SELECT 
      ${dimensionName} AS value,
      SUM(total_count) AS count
    FROM analytics_lifetime
    WHERE application_id = {appId: UInt32}
    GROUP BY ${dimensionName}
    ORDER BY count DESC
  `;
  if (limit === 0) return strQuery;
  return `${strQuery} LIMIT ${limit}`;
};

export const getUniqueCount = (appId: number, dimensionName: string, limit: number = 0) =>
  client.query({
    query: lifetimeCountQuery(dimensionName, limit),
    query_params: { appId },
    format: 'JSONEachRow',
  }).then((resultSet: any) => resultSet.json());

export const getUniqueDimensionCount = (appId: number, dimensionName: string) =>
  client.query({
    query: lifetimeUniqueDimensionCountQuery(dimensionName),
    query_params: { appId },
    format: 'JSONEachRow',
  }).then((resultSet: any) => resultSet.json());
