import { execQuery } from './exec-query';
import {
  DEVICE_ONLINE_COLUMNS,
  DEVICE_ONLINE_TABLE,
} from './schema';

/**
 * Creates the device online presence table.
 *
 * @example
 * up();
 */
const sql = `
CREATE TABLE IF NOT EXISTS ${DEVICE_ONLINE_TABLE} (
  application_id UInt32,
  ${DEVICE_ONLINE_COLUMNS}
)
ENGINE = ReplacingMergeTree(last_seen)
PARTITION BY toYYYYMM(last_seen)
ORDER BY (application_id, device_id)
TTL last_seen + INTERVAL 7 DAY;
`;

/**
 * Creates the device online table for real-time presence tracking.
 *
 * @example
 * up();
 */
export const up = (): Promise<void> => execQuery(sql);

/**
 * Drops the device online table.
 *
 * @example
 * down();
 */
export const down = (): Promise<void> => (
  execQuery(`DROP TABLE IF EXISTS ${DEVICE_ONLINE_TABLE}`)
);
