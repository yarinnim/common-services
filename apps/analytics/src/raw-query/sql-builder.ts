import { getChronoClause } from '../chrono';
type SQLBuilder = {
  select: string[],
  where: string[],
  groupBy?: string[],
  orderBy?: string[],
  limit?: number,
  offset?: number,
};

const getWhere = (query: SQLBuilder, chronoWhere: string[]): string => {
  const { where = [] } = query;
  const pWhere = [
    'application_id = {appId: UInt32}',
    ...chronoWhere,
    ...where, 
  ];
  return `WHERE ${pWhere.join(' AND ')}`;
};

const getGroupBy = (query: SQLBuilder): string => {
  const { groupBy = [] } = query;
  if (groupBy.length === 0) return '';
  return `GROUP BY ${groupBy.join(', ')}`;
};

const getOrderby = (query: SQLBuilder): string => {
  const { orderBy = [] } = query;
  if (orderBy.length === 0) return '';
  return `ORDER BY ${orderBy.join(', ')}`;
};

const getLimit = (query: SQLBuilder): string => {
  const { limit = 0 } = query;
  if (limit === 0) return '';
  return `LIMIT ${limit}`;
};

const getOffset = (query: SQLBuilder): string => {
  const { offset = 0 } = query;
  if (offset === 0) return '';
  return `OFFSET ${offset}`;
};

type Query = {
  chrono: any,
  query: SQLBuilder,
};

export default function getSQL(sqlQuery: Query): string {
  const { query, chrono } = sqlQuery;
  const [tableName, chronoWhere] = getChronoClause(chrono);
  const { select } = query;
  const sql = `
    SELECT ${select.join(', ')}
    FROM ${tableName}
    ${getWhere(query, chronoWhere)}
    ${getGroupBy(query)}
    ${getOrderby(query)}
    ${getLimit(query)}
    ${getOffset(query)}
  `;
  console.log({ sql });
  return sql;
}
