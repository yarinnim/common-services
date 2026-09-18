import { type Knex } from 'knex';

const TABLE = 'cart_item';

/**
 * Creates the cart_item table for per-cart line items and price snapshots.
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
    table.integer('cart_id').notNullable();
    table.integer('product_id');
    table.integer('variant_id');
    table.string('sku', 64).notNullable();
    table.integer('quantity').notNullable();
    table.string('currency', 3).notNullable();
    table.decimal('amount', 12, 2).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at');
    table.timestamp('deleted_at');
    table.unique(['id', 'application_id']);
    table.unique(['application_id', 'cart_id', 'variant_id']);
    table.unique(['application_id', 'cart_id', 'sku']);
    table
      .foreign(['cart_id', 'application_id'])
      .references(['id', 'application_id'])
      .inTable('cart');
  });
}

/**
 * Drops the cart_item table.
 *
 * @example
 * npm run migrate:fresh
 */
export function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE);
}
