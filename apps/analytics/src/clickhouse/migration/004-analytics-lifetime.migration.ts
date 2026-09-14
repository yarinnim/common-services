import { execQuery } from './exec-query';
import {
  ANALYTICS_DIMENSION_COLUMNS,
  ANALYTICS_DIMENSION_ORDER,
  ANALYTICS_LIFETIME_TABLE,
} from './schema';

/**
 * Creates the lifetime analytics fact table.
 *
 * @example
 * up();
 */
const sql = `
CREATE TABLE IF NOT EXISTS ${ANALYTICS_LIFETIME_TABLE} (
  application_id UInt32,
  ${ANALYTICS_DIMENSION_COLUMNS},
  total_count UInt64 DEFAULT 1
)
ENGINE = SummingMergeTree(total_count)
PARTITION BY application_id
ORDER BY (
  application_id,
  ${ANALYTICS_DIMENSION_ORDER}
);
`;

export const up = (): Promise<void> => execQuery(sql);

/**
 * Drops the lifetime analytics fact table.
 *
 * @example
 * down();
 */
export const down = (): Promise<void> => (
  execQuery(`DROP TABLE IF EXISTS ${ANALYTICS_LIFETIME_TABLE}`)
);
