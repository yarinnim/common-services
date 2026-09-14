import { CLICKHOUSE_DATABASE } from '../../constants';
import { execQuery } from './exec-query';

/**
 * Creates the ClickHouse analytics database.
 *
 * @example
 * up();
 */
export const up = (): Promise<void> => (
  execQuery(`CREATE DATABASE IF NOT EXISTS ${CLICKHOUSE_DATABASE}`, 'default')
);

/**
 * Drops the ClickHouse analytics database and all objects inside it.
 *
 * @example
 * down();
 */
export const down = (): Promise<void> => (
  execQuery(`DROP DATABASE IF EXISTS ${CLICKHOUSE_DATABASE}`, 'default')
);
