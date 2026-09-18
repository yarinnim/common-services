import { type Knex } from 'knex';

const TABLE = 'item';

/**
 * Creates the item table for per-application SKU catalog records.
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
    table.integer('category_id');
    table.string('sku', 64).notNullable();
    table.string('name', 255).notNullable();
    table.text('description');
    table.jsonb('attributes').notNullable().defaultTo({});
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at');
    table.timestamp('deleted_at');
    table.unique(['id', 'application_id']);
    table.unique(['application_id', 'sku']);
    table
      .foreign(['category_id', 'application_id'])
      .references(['id', 'application_id'])
      .inTable('category');
  });
}

/**
 * Drops the item table.
 *
 * @example
 * npm run migrate:fresh
 */
export function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE);
}
