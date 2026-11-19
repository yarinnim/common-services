import { Knex } from 'knex';

const NAMESPACE_TABLE = 'namespace';
const TABLE = 'app';

const namespaces = [
  {
    id: 1,
    name: 'Socket Namespace',
    uuid: '01a1f2b3-d17e-7abc-9c86-291d9686f2d0',
  }
];

const apps = [
  {
    namespace_id: 1,
    name: 'Socket client API',
    description: 'The integration between Socket Client and Socket Server',
    uuid: '01a1f2b3-d186-70b6-9498-6a1511e5c490', // 26b6037f0a168fc7bad6daeb1ce55396
  },
  {
    namespace_id: 1,
    name: 'Socket client web',
    description:'The web client',
    uuid: '01a1f2b3-d186-780e-a66e-6eeb1110bade', // 36f9883ce1ee892dc19340649d0d873a
  },
  {
    namespace_id: 1,
    name: 'Socket client from APP',
    description: 'App client',
    uuid: '01a1f2b3-d186-788a-aec6-b6f7e472d4d2', // b0da49a550c19800fe217dc971c14fc9
  }
];

export async function seed(knex: Knex): Promise<any> {
  return knex
  .raw(`truncate table ${NAMESPACE_TABLE} restart identity cascade`)
  .then(() => knex.table(NAMESPACE_TABLE).insert(namespaces))
  .then(() => knex.raw(`truncate table ${TABLE} restart identity cascade;`))
  .then(() => knex(TABLE).insert(apps))
  .then(() => console.log('Application is created.'));
}
