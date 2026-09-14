import { createClient } from '@clickhouse/client';
import {
  CLICKHOUSE_DATABASE,
  CLICKHOUSE_HOST,
  CLICKHOUSE_PASSWORD,
  CLICKHOUSE_PORT,
  CLICKHOUSE_PROTOCOL,
  CLICKHOUSE_USERNAME,
} from '../../constants';

const url = `${CLICKHOUSE_PROTOCOL}://${CLICKHOUSE_HOST}:${CLICKHOUSE_PORT}`;

/**
 * Creates a ClickHouse client for the given database.
 *
 * @example
 * createMigrationClient('default');
 */
const createMigrationClient = (database: string) => createClient({
  url,
  username: CLICKHOUSE_USERNAME,
  password: CLICKHOUSE_PASSWORD,
  database,
});

/**
 * Executes a ClickHouse DDL statement.
 *
 * @example
 * execQuery('CREATE DATABASE IF NOT EXISTS analytics', 'default');
 */
export const execQuery = (
  query: string,
  database: string = CLICKHOUSE_DATABASE,
): Promise<void> => {
  const migrationClient = createMigrationClient(database);
  return migrationClient.command({ query })
    .then(() => migrationClient.close())
    .then(() => undefined);
};
