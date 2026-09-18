import { type Knex } from 'knex';

const TABLE = 'application';

const applications = [
  {
    uuid: 'c1111111-1111-4111-8111-111111111111',
    secret_key: 'd6273626c48dde6160a1c4317f7d0e33',
    code: '@common_services/cart',
    name: 'Cart Service',
  },
];

/**
 * Seeds one cart tenant for local and integration use.
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
