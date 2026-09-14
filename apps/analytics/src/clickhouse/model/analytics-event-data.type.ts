import { parseUserAgent } from '../../utils';

/** Request log fields used when writing analytics to ClickHouse. */
export type AnalyticsEventData = {
  userAgent: string;
  deviceId: string;
  country: string;
  language: string;
  referer: string;
  origin: string;
  ip: string;
  url: string;
};

/**
 * Normalizes optional string values for ClickHouse dimensions.
 *
 * @example
 * normalizeOptionalString('');
 */
const normalizeOptionalString = (value: string | undefined): string => {
  const hasValue = value && value.trim() !== '';
  if (!hasValue) return 'unknown';
  return value.trim();
};

/**
 * Maps application event data to a ClickHouse analytics row.
 *
 * @example
 * buildAnalyticsRow(1, data);
 */
export const buildAnalyticsRow = (
  applicationId: number,
  data: AnalyticsEventData,
) => {
  const parsed = parseUserAgent(data.userAgent);

  return {
    application_id: applicationId,
    device_id: normalizeOptionalString(data.deviceId),
    device_type: parsed.deviceType,
    os: parsed.os,
    browser: parsed.browser,
    is_bot: parsed.isBot ? 1 : 0,
    country: normalizeOptionalString(data.country),
    language: normalizeOptionalString(data.language),
    referer: normalizeOptionalString(data.referer),
    origin: normalizeOptionalString(data.origin),
    ip: normalizeOptionalString(data.ip),
    url: normalizeOptionalString(data.url),
    user_agent: normalizeOptionalString(data.userAgent),
  };
};

/**
 * Maps application event data to a device online presence row.
 *
 * @example
 * buildDeviceOnlineRow(1, data);
 */
export const buildDeviceOnlineRow = (
  applicationId: number,
  data: AnalyticsEventData,
) => {
  const parsed = parseUserAgent(data.userAgent);

  return {
    application_id: applicationId,
    device_id: normalizeOptionalString(data.deviceId),
    device_type: parsed.deviceType,
    os: parsed.os,
    browser: parsed.browser,
    country: normalizeOptionalString(data.country),
    language: normalizeOptionalString(data.language),
  };
};
