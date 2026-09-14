import { execQuery } from './exec-query';
import {
  ANALYTICS_DIMENSION_COLUMNS,
  ANALYTICS_DIMENSION_ORDER,
  ANALYTICS_HOURLY_TABLE,
} from './schema';

/**
 * Creates the hourly analytics fact table.
 *
 * @example
 * up();
 */
const sql = `
CREATE TABLE IF NOT EXISTS ${ANALYTICS_HOURLY_TABLE} (
  application_id UInt32,
  hour_at DateTime DEFAULT toStartOfHour(now()),
  ${ANALYTICS_DIMENSION_COLUMNS},
  total_count UInt64 DEFAULT 1
)
ENGINE = SummingMergeTree(total_count)
PARTITION BY toYYYYMM(hour_at)
ORDER BY (
  application_id,
  hour_at,
  ${ANALYTICS_DIMENSION_ORDER}
);
`;

export const up = (): Promise<void> => (execQuery(sql));

/**
 * Drops the hourly analytics fact table.
 *
 * @example
 * down();
 */
export const down = (): Promise<void> => (
  execQuery(`DROP TABLE IF EXISTS ${ANALYTICS_HOURLY_TABLE}`)
);
