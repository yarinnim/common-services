import { type Knex } from 'knex';

const TABLE = 'stock_movement';

/**
 * Creates the stock movement table for adjustment audit history.
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
    table.integer('destination_warehouse_id');
    table.string('type', 32).notNullable();
    table.integer('quantity').notNullable();
    table.string('reference', 128);
    table.text('note');
    table.integer('created_by');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at');
    table.timestamp('deleted_at');
    table.unique(['id', 'application_id']);
    table
      .foreign(['item_id', 'application_id'])
      .references(['id', 'application_id'])
      .inTable('item');
    table
      .foreign(['warehouse_id', 'application_id'])
      .references(['id', 'application_id'])
      .inTable('warehouse');
    table
      .foreign(['destination_warehouse_id', 'application_id'])
      .references(['id', 'application_id'])
      .inTable('warehouse');
  });
}

/**
 * Drops the stock movement table.
 *
 * @example
 * npm run migrate:fresh
 */
export function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE);
}
