import client from '../client';
import { ANALYTICS_HOURLY_TABLE } from '../migration/schema';
import {
  buildAnalyticsRow,
  type AnalyticsEventData,
} from './analytics-event-data.type';

const format = 'JSONEachRow';

/**
 * Inserts an hourly analytics row into ClickHouse.
 *
 * @example
 * createHourlyAnalytics(1, data);
 */
export const createHourlyAnalytics = (
  applicationId: number,
  data: AnalyticsEventData,
) => {
  const values = [buildAnalyticsRow(applicationId, data)];
  return client.insert({
    table: ANALYTICS_HOURLY_TABLE,
    values,
    format,
  });
};
