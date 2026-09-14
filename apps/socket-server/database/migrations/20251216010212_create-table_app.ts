import type { Knex } from 'knex';

const TABLE = 'app';

export async function up(knex: Knex): Promise<void> {
  return knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";').then(() => {
    return knex.schema.createTable(TABLE, (table) => {
      table.increments('id').primary();
      table.smallint('namespace_id').references('id').inTable('namespace').notNullable();
      table.uuid('uuid')
        .defaultTo(knex.raw('uuid_generate_v4()'))
        .notNullable();
      table.specificType(
        'secret_key',
        'varchar(32) GENERATED ALWAYS AS (MD5(uuid::TEXT)) STORED'
      );
      table.string('name', 150).unique().notNullable();
      table.string('description', 2000).nullable();
      table.timestamp('expired_at').nullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
      table.timestamp('updated_at');
      table.timestamp('deleted_at');
    });
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable(TABLE);
}
