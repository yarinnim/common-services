import { type Knex } from 'knex';

const TABLE = 'application';

const applications = [
  {
    uuid: 'a1111111-1111-4111-8111-111111111111',
    secret_key: 'e5162515b37ccf505990b3206e6c9d22',
    code: '@media-services/media-api',
    name: 'Media Service',
    setting: {},
  },
];

/**
 * Seeds the integrated application table.
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
