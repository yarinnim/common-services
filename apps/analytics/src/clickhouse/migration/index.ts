/* eslint-disable no-console */
import * as createDatabase from './001-create-database.migration';
import * as applicationDictionary from './002-application-dictionary.migration';
import * as analyticsHourly from './003-analytics-hourly.migration';
import * as analyticsLifetime from './004-analytics-lifetime.migration';
import * as deviceOnline from './005-device-online.migration';
import { type ClickHouseMigration } from './types';

/** Wide fact tables only — never create analytics_hourly_stat_* per dimension. */
const migrations: ClickHouseMigration[] = [
  createDatabase,
  applicationDictionary,
  analyticsHourly,
  analyticsLifetime,
  deviceOnline,
];

/**
 * Runs ClickHouse migrations in order.
 *
 * @example
 * runMigrationsUp(migrations);
 */
const runMigrationsUp = (
  items: ClickHouseMigration[],
  index: number = 0,
): Promise<void> => {
  if (index >= items.length) return Promise.resolve();
  return items[index].up().then(() => runMigrationsUp(items, index + 1));
};

/**
 * Rolls back ClickHouse migrations in reverse order.
 *
 * @example
 * runMigrationsDown(migrations);
 */
const runMigrationsDown = (
  items: ClickHouseMigration[],
  index: number = 0,
): Promise<void> => {
  if (index >= items.length) return Promise.resolve();
  return items[index].down().then(() => runMigrationsDown(items, index + 1));
};

/**
 * Creates ClickHouse database, dictionary and analytics tables.
 *
 * @example
 * npm run clickhouse:migrate
 */
export const migrateUp = (): Promise<void> => (
  runMigrationsUp(migrations).then(() => {
    console.log('[INFO] ClickHouse migration completed.');
  })
);

/**
 * Drops ClickHouse analytics objects.
 *
 * @example
 * npm run clickhouse:migrate:rollback
 */
export const migrateDown = (): Promise<void> => (
  runMigrationsDown([...migrations].reverse()).then(() => {
    console.log('[INFO] ClickHouse migration rolled back.');
  })
);

export default migrateUp;
