import { type Knex } from 'knex';

const TABLE = 'order';

/**
 * Creates the order table for per-application purchase orders.
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
    table.integer('merchant_id');
    table.integer('customer_id');
    table.string('channel_type', 32).notNullable();
    table.integer('store_id');
    table.string('status', 32).notNullable();
    table.decimal('subtotal', 12, 2).notNullable();
    table.decimal('tax_total', 12, 2).notNullable().defaultTo(0);
    table.decimal('discount_total', 12, 2).notNullable().defaultTo(0);
    table.decimal('grand_total', 12, 2).notNullable();
    table.string('currency', 3).notNullable();
    table.jsonb('metadata').notNullable().defaultTo({});
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at');
    table.timestamp('deleted_at');
    table.unique(['id', 'application_id']);
  });
}

/**
 * Drops the order table.
 *
 * @example
 * npm run migrate:fresh
 */
export function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE);
}
