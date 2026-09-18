import { type Knex } from 'knex';

const TABLE = 'stock';

/**
 * Creates the stock table for per-warehouse item quantities.
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
    table.integer('item_id').notNullable();
    table.integer('warehouse_id').notNullable();
    table.integer('quantity').notNullable().defaultTo(0);
    table.integer('version').notNullable().defaultTo(1);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at');
    table.timestamp('deleted_at');
    table.unique(['id', 'application_id']);
    table.unique(['application_id', 'item_id', 'warehouse_id']);
    table
      .foreign(['item_id', 'application_id'])
      .references(['id', 'application_id'])
      .inTable('item');
    table
      .foreign(['warehouse_id', 'application_id'])
      .references(['id', 'application_id'])
      .inTable('warehouse');
  });
}

/**
 * Drops the stock table.
 *
 * @example
 * npm run migrate:fresh
 */
export function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE);
}
