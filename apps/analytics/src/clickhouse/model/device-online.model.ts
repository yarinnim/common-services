import client from '../client';
import { DEVICE_ONLINE_TABLE } from '../migration/schema';
import {
  buildDeviceOnlineRow,
  type AnalyticsEventData,
} from './analytics-event-data.type';

const queryFormat = 'JSONEachRow';
const ONLINE_WINDOW_MINUTES = 5;

const ONLINE_DIMENSIONS = [
  'device_type',
  'os',
  'browser',
  'country',
  'language',
];

type OnlineDimension = 'device_type' | 'os' | 'browser' | 'country' | 'language';

type OnlineCountResult = {
  onlineCount: number;
};

type OnlineDimensionCount = {
  value: string;
  count: number;
};

/**
 * Checks whether a dimension is allowed for online count queries.
 *
 * @example
 * isOnlineDimension('device_type');
 */
const isOnlineDimension = (dimensionName: string): dimensionName is OnlineDimension => (
  ONLINE_DIMENSIONS.includes(dimensionName)
);

/**
 * Builds the shared WHERE clause for online device queries.
 *
 * @example
 * getOnlineWhereClause();
 */
const getOnlineWhereClause = (): string => (
  `application_id = {appId: UInt32}
  AND last_seen >= now() - INTERVAL {onlineMinutes: UInt32} MINUTE
  AND device_type != 'Bot'`
);

/**
 * Builds the total online device count query.
 *
 * @example
 * getOnlineCountQuery();
 */
const getOnlineCountQuery = (): string => (
  `SELECT uniqExact(device_id) AS online_count
  FROM ${DEVICE_ONLINE_TABLE} FINAL
  WHERE ${getOnlineWhereClause()}`
);

/**
 * Builds the online device count query grouped by dimension.
 *
 * @example
 * getOnlineCountByDimensionQuery('device_type', 10);
 */
const getOnlineCountByDimensionQuery = (
  dimensionName: OnlineDimension,
  limit: number,
): string => {
  const baseQuery = `
    SELECT
      ${dimensionName} AS value,
      uniqExact(device_id) AS count
    FROM ${DEVICE_ONLINE_TABLE} FINAL
    WHERE ${getOnlineWhereClause()}
    GROUP BY ${dimensionName}
    ORDER BY count DESC
  `;
  if (limit === 0) return baseQuery;
  return `${baseQuery} LIMIT ${limit}`;
};

/**
 * Checks whether a device online row should be written.
 *
 * @example
 * shouldWriteDeviceOnline('uuid', 'Mobile');
 */
const shouldWriteDeviceOnline = (
  deviceId: string,
  deviceType: string,
): boolean => {
  const hasDeviceId = deviceId !== 'unknown';
  const isNotBot = deviceType !== 'Bot';
  return hasDeviceId && isNotBot;
};

/**
 * Inserts or updates device online presence in ClickHouse.
 *
 * @example
 * createDeviceOnline(1, data);
 */
export const createDeviceOnline = (
  applicationId: number,
  data: AnalyticsEventData,
): Promise<void> => {
  const row = buildDeviceOnlineRow(applicationId, data);
  const { device_id: deviceId, device_type: deviceType } = row;

  if (!shouldWriteDeviceOnline(deviceId, deviceType)) {
    return Promise.resolve();
  }

  return client.insert({
    table: DEVICE_ONLINE_TABLE,
    values: [row],
    format: queryFormat,
  }).then(() => undefined);
};

/**
 * Gets the total number of online devices for an application.
 *
 * @example
 * getOnlineDeviceCount(1);
 */
export const getOnlineDeviceCount = (
  appId: number,
  onlineMinutes: number = ONLINE_WINDOW_MINUTES,
): Promise<OnlineCountResult> => (
  client.query({
    query: getOnlineCountQuery(),
    query_params: { appId, onlineMinutes },
    format: queryFormat,
  })
    .then((resultSet: { json: () => Promise<{ online_count: number }[]> }) => (
      resultSet.json()
    ))
    .then(([result]: { online_count: number }[]) => ({
      onlineCount: result.online_count,
    }))
);

/**
 * Gets online device counts grouped by dimension.
 *
 * @example
 * getOnlineDeviceCountByDimension(1, 'device_type', 10);
 */
export const getOnlineDeviceCountByDimension = (
  appId: number,
  dimensionName: string,
  limit: number = 10,
): Promise<OnlineDimensionCount[]> => {
  if (!isOnlineDimension(dimensionName)) {
    return Promise.reject(new Error('Invalid online dimension.'));
  }

  return client.query({
    query: getOnlineCountByDimensionQuery(dimensionName, limit),
    query_params: { appId, onlineMinutes: ONLINE_WINDOW_MINUTES },
    format: queryFormat,
  })
    .then((resultSet: { json: () => Promise<OnlineDimensionCount[]> }) => (
      resultSet.json()
    ));
};
