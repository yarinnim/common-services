import { type ChronoClause, getChronoClause } from '../chrono';
import { CountDimension } from '../type';
import { getWhereClause, senitizeFields } from './utils';

const getGroupBy = (groupByFields: string) => {
  if (groupByFields.length === 0) return '';
  return `GROUP BY ${groupByFields}`;
};

const getSelectFields = (selectFields: string): string => {
  if(selectFields.length === 0) return '';
  return `, ${selectFields}`;
};

const getGroupField = (fieldName: string, groupField: boolean) => {
  if (!groupField) return ['', ''];
  return [fieldName, fieldName];
};

const getWhere = (props: any): string => {
  const { filterWhere, chronoWhere } = props;
  const where = [
    'application_id = {appId: UInt32}',
    ...filterWhere,
    ...chronoWhere,
  ].join(' AND ');
  return `WHERE ${where}`;
};

export default function totalCount(props: CountDimension) {
  const { limit = 10, offset = 0, filter = '{}', groupField = false } = props;
  const filterWhere = getWhereClause(filter);
  const [select, groupBy] = getGroupField(props.fieldName, groupField);
  const [tableName, chronoWhere]: ChronoClause = getChronoClause(props as any);
  const where = getWhere({ filterWhere, chronoWhere });
  const sql = `
  SELECT
    SUM(total_count) AS total_count
    ${getSelectFields(senitizeFields(['', select]))}
  FROM ${tableName}
  ${where}
  ${getGroupBy(senitizeFields(['', groupBy]))}
  ORDER BY total_count DESC
  LIMIT ${limit}
  OFFSET ${offset}
  `;

  return sql;
}
