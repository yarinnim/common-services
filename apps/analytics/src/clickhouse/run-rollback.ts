/* eslint-disable no-console */
import { migrateDown } from './migration';

migrateDown().catch((error: Error) => {
  const { message } = error;
  console.error(`[ERROR] ClickHouse rollback failed: ${message}`);
  process.exit(1);
});
