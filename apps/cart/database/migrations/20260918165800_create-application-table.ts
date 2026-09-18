import { type Knex } from 'knex';

const TABLE = 'application';

/**
 * Creates the application table for registered cart tenants.
 *
 * @example
 * npm run migrate:latest
 */
export function up(knex: Knex): Promise<void> {
  return knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";').then(() => {
    return knex.schema.createTable(TABLE, (table) => {
      table.increments('id').primary();
      table
        .uuid('uuid')
        .unique()
        .notNullable()
        .defaultTo(knex.raw('uuid_generate_v4()'));
      table
        .string('secret_key', 64)
        .notNullable()
        .defaultTo(knex.raw("md5(uuid_generate_v4()::text)"));
      table.string('code', 64).unique().notNullable();
      table.string('name', 255).unique().notNullable();
      table.jsonb('setting').notNullable().defaultTo({});
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at');
      table.timestamp('deleted_at');
    });
  });
}

/**
 * Drops the application table.
 *
 * @example
 * npm run migrate:fresh
 */
export function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE);
}
