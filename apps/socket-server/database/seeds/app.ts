import { Knex } from 'knex';

const NAMESPACE_TABLE = 'namespace';
const TABLE = 'app';

const namespaces = [
  {
    id: 1,
    name: 'Socket Namespace',
    uuid: '079594bb-4823-4c6c-a490-3e48ed245298',
  }
];

const apps = [
  {
    namespace_id: 1,
    name: 'Socket client API',
    description: 'The integration between Socket Client and Socket Server',
    uuid: 'fb4eb0be-8f00-46d4-ac38-451df5d1f7eb',
    // secret_key: '7fd61c690670dd19ec9aa3ab01a17803',
  },
  {
    namespace_id: 1,
    name: 'Socket client web',
    description:'The web client',
    uuid: '1b3b2e0c-8685-4c56-9c87-1c8b42fc3261',
    // secret_key: '68da93d67ecfc388b1736d6927a3a87e',
  },
  {
    namespace_id: 1,
    name: 'Socket client from APP',
    description: 'App client',
    uuid: 'f824518f-97cc-41fb-bb9a-6f0fd07eccf6',
    // secret_key: 'ce71357f995214ae1d70f579e86d3ade',
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
