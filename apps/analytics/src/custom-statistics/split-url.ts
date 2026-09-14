import { SplitUrl } from '../type';
import { getChronoClause, type ChronoClause } from '../chrono';

const getWhere = (props: any): string => {
  const { chronoWhere, fieldValue, match } = props;
  const where = [
    'application_id = {appId: UInt32}',
    `url LIKE '${fieldValue}'`,
    `match(visited_id, '${match}')`,
    ...chronoWhere,
  ].join(' AND ');
  return `WHERE ${where}`;
};

export default function splitUrl(props: SplitUrl) {
  const [tableName, chronoWhere]: ChronoClause = getChronoClause(props);
  const { limit = 10, offset = 0 } = props;
  const sqlLimit: string = Number(limit) === 0 ? '' : `LIMIT ${limit}`;
  const where = getWhere({
    fieldValue: props.fieldValue,
    match: props.match,
    chronoWhere,
  });
  const sql = `
    SELECT
      splitByChar('${props.charToSplit}', url)[-1] AS visited_id,
      SUM(total_count) AS total_visits
    FROM ${tableName}
    ${where}
    GROUP BY visited_id
    ORDER BY total_visits DESC
    ${sqlLimit}
    OFFSET ${offset}
    ;
  `;
  return sql;
}
