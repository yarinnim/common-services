import {
  getOnlineDeviceCount,
  getOnlineDeviceCountByDimension,
} from '../clickhouse/model/device-online.model';

type OnlineCount = {
  onlineCount: number;
};

type OnlineDimensionCount = {
  value: string;
  count: number;
};

/**
 * Finds the total online device count for an application.
 *
 * @example
 * findOnlineDeviceCount(1);
 */
export const findOnlineDeviceCount = (
  applicationId: number,
  onlineMinutes: number,
): Promise<OnlineCount> => (
  getOnlineDeviceCount(applicationId, onlineMinutes)
);

/**
 * Finds online device counts grouped by dimension.
 *
 * @example
 * findOnlineDeviceCountByDimension(1, 'device_type', 10);
 */
export const findOnlineDeviceCountByDimension = (
  applicationId: number,
  dimensionName: string,
  limit: number,
): Promise<OnlineDimensionCount[]> => (
  getOnlineDeviceCountByDimension(applicationId, dimensionName, limit)
);
