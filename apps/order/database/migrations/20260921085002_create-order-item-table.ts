import { type Knex } from 'knex';

const TABLE = 'order_item';

/**
 * Creates the order_item table for snapshotted line items at purchase.
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
    table.integer('order_id').notNullable();
    table.integer('product_id');
    table.string('sku', 64).notNullable();
    table.string('name', 255).notNullable();
    table.decimal('unit_price', 12, 2).notNullable();
    table.integer('quantity').notNullable();
    table.decimal('total_price', 12, 2).notNullable();
    table.jsonb('metadata').notNullable().defaultTo({});
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at');
    table.timestamp('deleted_at');
    table.unique(['id', 'application_id']);
    table
      .foreign(['order_id', 'application_id'])
      .references(['id', 'application_id'])
      .inTable('order');
  });
}

/**
 * Drops the order_item table.
 *
 * @example
 * npm run migrate:fresh
 */
export function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE);
}
