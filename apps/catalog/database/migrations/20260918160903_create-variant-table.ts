import { type Knex } from 'knex';

const TABLE = 'variant';

/**
 * Creates the variant table for per-application product SKUs.
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
    table.string('sku', 64).notNullable();
    table.jsonb('options').notNullable().defaultTo({});
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at');
    table.timestamp('deleted_at');
    table.unique(['id', 'application_id']);
    table.unique(['application_id', 'sku']);
    table
      .foreign(['product_id', 'application_id'])
      .references(['id', 'application_id'])
      .inTable('product');
  });
}

/**
 * Drops the variant table.
 *
 * @example
 * npm run migrate:fresh
 */
export function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE);
}
