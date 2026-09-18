import { type Knex } from 'knex';

const TABLE = 'cart';

/**
 * Creates the cart table for per-application user and guest carts.
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
    table.integer('user_id');
    table.string('session_id', 64);
    table.string('status', 32).notNullable().defaultTo('active');
    table.timestamp('expires_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at');
    table.timestamp('deleted_at');
    table.unique(['id', 'application_id']);
    table.unique(['application_id', 'user_id']);
    table.unique(['application_id', 'session_id']);
  });
}

/**
 * Drops the cart table.
 *
 * @example
 * npm run migrate:fresh
 */
export function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE);
}
