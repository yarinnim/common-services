import { type Knex } from 'knex';

const TABLE = 'gateway_credential';

/**
 * Creates the gateway credential table for encrypted per-tenant vault keys.
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
    table.string('provider', 32).notNullable();
    table.string('publishable_key', 512);
    table.text('encrypted_secret').notNullable();
    table.text('encrypted_webhook_secret');
    table.jsonb('encryption_meta').notNullable().defaultTo({});
    table.jsonb('setting').notNullable().defaultTo({});
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at');
    table.timestamp('deleted_at');
    table.unique(['id', 'application_id']);
    table.unique(['application_id', 'provider']);
  });
}

/**
 * Drops the gateway credential table.
 *
 * @example
 * npm run migrate:fresh
 */
export function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE);
}
