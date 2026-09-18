import { type Knex } from 'knex';

const TABLE = 'product';

/**
 * Creates the product table for per-application catalog products.
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
    table.string('name', 255).notNullable();
    table.text('description');
    table.jsonb('attributes').notNullable().defaultTo({});
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at');
    table.timestamp('deleted_at');
    table.unique(['id', 'application_id']);
    table
      .foreign(['category_id', 'application_id'])
      .references(['id', 'application_id'])
      .inTable('category');
  });
}

/**
 * Drops the product table.
 *
 * @example
 * npm run migrate:fresh
 */
export function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE);
}
