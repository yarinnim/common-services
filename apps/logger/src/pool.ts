import connect, { type Connection } from './db';
import {
  DB_HOST,
  DB_PORT,
  DB_USERNAME,
  DB_PASSWORD,
  DB_DATABASE,
  DB_MAX_POOL_SIZE,
  DB_REQUEST_LOG_DB,
} from './constants';

const getConnection = (props: any): Connection => ({
  host: DB_HOST,
  port: DB_PORT,
  username: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  maxPoolSize: DB_MAX_POOL_SIZE,
  ...props,
});

export default function connectDb(collectionName: string) {
  const conn: Connection = getConnection({});
  return connect(conn, collectionName);
}

export const requestLogPool = (collectionName: string) => {
  const conn: Connection = getConnection({ database: DB_REQUEST_LOG_DB });
  return connect(conn, collectionName);
};
