import { type Knex } from 'knex';

const TABLE = 'category';

/**
 * Creates the category table for per-application catalog grouping.
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
    table.integer('parent_id');
    table.string('name', 255).notNullable();
    table.text('description');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at');
    table.timestamp('deleted_at');
    table.unique(['id', 'application_id']);
    table.unique(['application_id', 'name']);
    table
      .foreign(['parent_id', 'application_id'])
      .references(['id', 'application_id'])
      .inTable(TABLE);
  });
}

/**
 * Drops the category table.
 *
 * @example
 * npm run migrate:fresh
 */
export function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE);
}
