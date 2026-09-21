import { type Knex } from 'knex';

const TABLE = 'application';

const applications = [
  {
    uuid: 'b2222222-2222-4222-8222-222222222222',
    secret_key: 'f8495848e60ff08382c3e6539a9f2b55',
    code: '@common-services/payment',
    name: 'Payment Service',
  },
];

/**
 * Seeds one payment tenant for local and integration use.
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
