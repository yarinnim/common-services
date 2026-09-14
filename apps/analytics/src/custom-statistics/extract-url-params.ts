import type { ExtractUrlParams } from '../type';
import { type ChronoClause, getChronoClause } from '../chrono';
import { senitizeGroupBy } from './utils';

const getUrlFilter = (cond: string = '')=> {
  if (cond.length === 0) return ['', [], ''];
  const filter = JSON.parse(cond);
  const keys = Object.keys(filter);
  if (keys.length === 0) return ['', [], ''];
  return keys.reduce((accur: any, key: string) => {
    const [select, where, groupBy] = accur;
    const condValue = filter[key];
    const selectNext = ` extractURLParameter(url, '${key}') dimension_${key}, `;
    const whereNext = `dimension_${key} ${condValue}`;
    const groupByNext = ` dimension_${key}, `;
    return [
      `${selectNext} ${select}`,
      [...where, whereNext],
      `${groupByNext} ${groupBy}`,
    ];
  }, ['', [], '']);
};

const getWhere = (props: any) => {
  const { fieldValue, filterWhere, chronoWhere } = props;
  const where = [
    'application_id = {appId: UInt32}',
    `url like '${fieldValue}'`,
    ...filterWhere,
    ...chronoWhere,
  ].join(' AND ');
  return `WHERE ${where}`;
};

export default function extractUrlParams(props: ExtractUrlParams) {
  const [filterSelect, filterWhere, filterGroupBy] = getUrlFilter(props.filter);
  const [tableName, chronoWhere]: ChronoClause = getChronoClause(props as any);
  const { limit = 10, offset = 0 } = props;
  const where = getWhere({
    fieldValue: props.fieldValue,
    filterWhere,
    chronoWhere,
  });

  const sql = `
  SELECT
    ${filterSelect}
    extractURLParameter(url, '${props.keyToExtract}') AS extracted_dimension,
    SUM(total_count) AS total
  FROM ${tableName}
  ${where}
  GROUP BY ${senitizeGroupBy(filterGroupBy + ', extracted_dimension')}
  ORDER BY total DESC
  LIMIT ${limit}
  OFFSET ${offset}
  ;
  `;

  console.log(sql);
  return sql;
}
