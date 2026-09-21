import knexify, { type Connection, type Model, createModel } from 'knexify';
import {
  DB_HOST,
  DB_PORT,
  DB_USER,
  DB_PASSWORD,
  DB_DATABASE,
  DB_READ_HOST,
  DB_READ_PORT,
} from '../constants';

export const connection: Connection = {
  host: DB_HOST,
  port: DB_PORT,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  readConnection: {
    host: DB_READ_HOST,
    port: DB_READ_PORT,
  },
};

const pool = knexify({ connection });

export function initModel(tableName: string): Model {
  return createModel(pool, tableName);
}

export default pool;
