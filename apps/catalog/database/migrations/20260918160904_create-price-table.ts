import { type Knex } from 'knex';

const TABLE = 'price';

/**
 * Creates the price table for per-variant multi-currency amounts.
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
    table.integer('variant_id').notNullable();
    table.string('currency', 3).notNullable();
    table.decimal('amount', 12, 2).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at');
    table.timestamp('deleted_at');
    table.unique(['id', 'application_id']);
    table.unique(['application_id', 'variant_id', 'currency']);
    table
      .foreign(['variant_id', 'application_id'])
      .references(['id', 'application_id'])
      .inTable('variant');
  });
}

/**
 * Drops the price table.
 *
 * @example
 * npm run migrate:fresh
 */
export function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE);
}
