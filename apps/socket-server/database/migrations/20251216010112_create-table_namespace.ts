import type { Knex } from 'knex';

const TABLE = 'namespace';

export function up(knex: Knex): Promise<void> {
  return knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";').then(() => {
    return knex.schema.createTable(TABLE,(table) => {
      table.increments('id').primary();
      table.uuid('uuid').unique().defaultTo(knex.raw('uuid_generate_v4()'));
      table.string('name', 255).unique().notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('deleted_at');
    });
  });
}


export function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE);
}

