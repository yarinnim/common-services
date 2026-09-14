import { psql } from '../../config';
import { execQuery } from './exec-query';

const APPLICATION_DICTIONARY = 'application_dictionary';

/**
 * Creates the integrated application dictionary from PostgreSQL.
 *
 * @example
 * up();
 */
const sql = `
CREATE DICTIONARY IF NOT EXISTS ${APPLICATION_DICTIONARY} (
  id UInt32,
  uuid String,
  code String,
  name String
)
PRIMARY KEY id
SOURCE(POSTGRESQL(
  port ${psql.port}
  host '${psql.host}'
  user '${psql.user}'
  password '${psql.password}'
  db '${psql.database}'
  table 'application'
  where 'deleted_at IS NULL'
))
LAYOUT(HASHED())
LIFETIME(MIN 300 MAX 600);
`;
export const up = (): Promise<void> => (execQuery(sql));

/**
 * Drops the integrated application dictionary.
 *
 * @example
 * down();
 */
export const down = (): Promise<void> => (
  execQuery(`DROP DICTIONARY IF EXISTS ${APPLICATION_DICTIONARY}`)
);
