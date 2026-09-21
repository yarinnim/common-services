import { type Knex } from 'knex';

const TABLE = 'webhook_event';

/**
 * Creates the webhook event table for inbound gateway event ingestion.
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
    table.integer('payment_id');
    table.string('provider', 32).notNullable();
    table.string('provider_event_id', 255).notNullable();
    table.string('event_type', 128).notNullable();
    table.string('status', 32).notNullable();
    table.jsonb('payload').notNullable().defaultTo({});
    table.boolean('signature_valid').notNullable().defaultTo(false);
    table.text('error_message');
    table.timestamp('processed_at');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at');
    table.timestamp('deleted_at');
    table.unique(['id', 'application_id']);
    table.unique(['application_id', 'provider', 'provider_event_id']);
    table
      .foreign(['payment_id', 'application_id'])
      .references(['id', 'application_id'])
      .inTable('payment');
  });
}

/**
 * Drops the webhook event table.
 *
 * @example
 * npm run migrate:fresh
 */
export function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE);
}
