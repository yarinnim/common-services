import { type Knex } from 'knex';

const TABLE = 'application';

const applications = [
  {
    uuid: 'a1111111-1111-4111-8111-111111111111',
    secret_key: 'e7384737d59eef7271b2d5428f8e1f44',
    code: '@core-services/order',
    name: 'Order Service',
  },
];

/**
 * Seeds one order tenant for local and integration use.
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
