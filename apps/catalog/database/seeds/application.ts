import { type Knex } from 'knex';

const TABLE = 'application';

const applications = [
  {
    uuid: 'a1111111-1111-4111-8111-111111111111',
    secret_key: 'e5162515b37ccf505990b3206e6c9d22',
    code: '@common-services/catalog',
    name: 'Catalog Service',
  },
];

/**
 * Seeds one catalog tenant for local and integration use.
 *
 * @example
 * npm run seed:run
 */
export function seed(knex: Knex): Promise<void> {
  return knex
    .raw(`truncate table ${TABLE} restart identity cascade`)
    .then(() => knex(TABLE).insert(applications))
    .then(() => {
      console.log('[INFO] Application seed completed.');
    });
}
