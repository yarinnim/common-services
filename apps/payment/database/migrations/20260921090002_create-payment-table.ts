import { type Knex } from 'knex';

const TABLE = 'payment';

/**
 * Creates the payment table for charges, authorizations, captures, and refunds.
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
    table.integer('gateway_credential_id').notNullable();
    table.integer('parent_payment_id');
    table.string('idempotency_key', 128);
    table.string('action', 32).notNullable();
    table.string('status', 32).notNullable();
    table.decimal('amount', 12, 2).notNullable();
    table.string('currency', 3).notNullable();
    table.string('provider', 32).notNullable();
    table.string('provider_reference', 255);
    table.string('order_reference', 128);
    table.integer('customer_id');
    table.string('failure_code', 64);
    table.text('failure_message');
    table.jsonb('metadata').notNullable().defaultTo({});
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at');
    table.timestamp('deleted_at');
    table.unique(['id', 'application_id']);
    table.unique(['application_id', 'idempotency_key']);
    table
      .foreign(['gateway_credential_id', 'application_id'])
      .references(['id', 'application_id'])
      .inTable('gateway_credential');
    table
      .foreign(['parent_payment_id', 'application_id'])
      .references(['id', 'application_id'])
      .inTable('payment');
  });
}

/**
 * Drops the payment table.
 *
 * @example
 * npm run migrate:fresh
 */
export function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE);
}
