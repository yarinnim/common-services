import { type Knex } from 'knex';

const TABLE = 'order_status_history';

/**
 * Creates the order_status_history table for order state transition audits.
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
    table.integer('order_id').notNullable();
    table.string('previous_status', 32);
    table.string('new_status', 32).notNullable();
    table.text('reason');
    table.integer('changed_by');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at');
    table.timestamp('deleted_at');
    table.unique(['id', 'application_id']);
    table
      .foreign(['order_id', 'application_id'])
      .references(['id', 'application_id'])
      .inTable('order');
  });
}

/**
 * Drops the order_status_history table.
 *
 * @example
 * npm run migrate:fresh
 */
export function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE);
}
