import { MongoClient } from 'mongodb';
import { createHash } from 'crypto';

const hash = (str: string): string => createHash('md5')
  .update(str)
  .digest('hex');

export type Connection = {
  host: string;
  port: number;
  username: string;
  password: string;
  maxPoolSize: number;
  database: string;
};

const getConnection = (props: Connection): string => {
  const {
    host, port,
    username, password,
  } = props;

  const encodedPwd = encodeURIComponent(password);
  return `mongodb://${username}:${encodedPwd}@${host}:${port}`;
};

const pool: Record<string, any> = {};
const db: Record<string, any> = {};

const getClient = (url: string) => {
  const poolName = hash(url);
  if (pool[poolName] || false) return pool[poolName];
  pool[poolName] = new MongoClient(url);
  return pool[poolName];
};

const initDB = (mongoClient: any, database: string) => {
  if (db[database] || false) return db[database];
  db[database] = mongoClient.db(database);
  return db[database];
};

export default function connect(conn: Connection, connectionName: string, cb: any = false) {
  const url = getConnection(conn);
  const client = getClient(url);
  return client
    .connect()
    .then((dbClient: any) => {
      const { database } = conn;
      return initDB(dbClient, database);
    })
    .then((dbPool: any) => dbPool.collection(connectionName))
    .then(cb);
}
