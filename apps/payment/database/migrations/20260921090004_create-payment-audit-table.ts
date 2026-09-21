import { type Knex } from 'knex';

const TABLE = 'payment_audit';

/**
 * Creates the payment audit table for tenant-scoped financial compliance logs.
 *
 * @example
 * npm run migrate:latest
 */
export function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(TABLE, (table) => {
    table.increments('id').primary();
    table
      .integer('application_id')
      .notNullable()
      .references('id')
      .inTable('application');
    table.integer('payment_id');
    table.string('action', 64).notNullable();
    table.string('source', 32).notNullable();
    table.jsonb('request_payload').notNullable().defaultTo({});
    table.jsonb('response_payload').notNullable().defaultTo({});
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at');
    table.timestamp('deleted_at');
    table.unique(['id', 'application_id']);
    table
      .foreign(['payment_id', 'application_id'])
      .references(['id', 'application_id'])
      .inTable('payment');
  });
}

/**
 * Drops the payment audit table.
 *
 * @example
 * npm run migrate:fresh
 */
export function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE);
}
