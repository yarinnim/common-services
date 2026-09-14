/* eslint-disable no-console */
import migrateUp from './migration';

migrateUp().catch((error: Error) => {
  const { message } = error;
  console.error(`[ERROR] ClickHouse migration failed: ${message}`);
  process.exit(1);
});
