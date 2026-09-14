/* eslint-disable no-console */
import { 
  CLICKHOUSE_PROTOCOL,
  CLICKHOUSE_HOST,
  CLICKHOUSE_PORT,
  CLICKHOUSE_DATABASE,
  CLICKHOUSE_PASSWORD,
  CLICKHOUSE_USERNAME,
} from '../constants';
import { createClient } from '@clickhouse/client';

const url = `${CLICKHOUSE_PROTOCOL}://${CLICKHOUSE_HOST}:${CLICKHOUSE_PORT}`;
const client = createClient({
  url,
  username: CLICKHOUSE_USERNAME,
  password: CLICKHOUSE_PASSWORD,
  database: CLICKHOUSE_DATABASE,
});

export default client;

function gracefulShutdown(signal: any) {
  console.log(`\n[WARNING] Received ${signal}. Cleaning up ClickHouse connections...`);
  try {
    return client.close()
      .then(() => {
        console.log('[INFO] ClickHouse client closed successfully.');
        process.exit(0);
      });
  } catch (err: any) {
    const { message } = err;
    console.error(`[ERROR] ${message}`);
    process.exit(1);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
