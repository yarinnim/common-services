import { type Knex } from 'knex';

const TABLE = 'media';

/**
 * Creates the media table for per-product asset URL mappings.
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
    table.integer('product_id').notNullable();
    table.integer('variant_id');
    table.string('url', 2048).notNullable();
    table.string('kind', 32).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at');
    table.timestamp('deleted_at');
    table.unique(['id', 'application_id']);
    table
      .foreign(['product_id', 'application_id'])
      .references(['id', 'application_id'])
      .inTable('product');
    table
      .foreign(['variant_id', 'application_id'])
      .references(['id', 'application_id'])
      .inTable('variant');
  });
}

/**
 * Drops the media table.
 *
 * @example
 * npm run migrate:fresh
 */
export function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE);
}
