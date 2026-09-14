import type { SplitUrl } from './type';

export type ChronoClause = [
  _tableName: string,
  _whereAndClause: string[],
];

const HOURLY = 'analytics_hourly';
const LIFETIME = 'analytics_lifetime';

const todaySql = (): ChronoClause => [HOURLY, ['hour_at >= toStartOfDay(now())']];
const yesterdaySql = (): ChronoClause => [HOURLY, [
  'hour_at >= toStartOfDay(now() - INTERVAL 1 DAY)',
  'hour_at < toStartOfDay(now())']];

const thisWeekSql = (): ChronoClause => [HOURLY, ['hour_at >= toMonday(now())']];
const lastWeekSql = (): ChronoClause => [HOURLY, [ 
  'hour_at >= toMonday(now() - INTERVAL 1 WEEK)',
  'hour_at < toMonday(now())']];

const thisMonthSql = (): ChronoClause => [HOURLY, ['hour_at >= toStartOfMonth(now())']];
const lastMonthSql = (): ChronoClause => [HOURLY, [
  'hour_at >= toStartOfMonth(now() - INTERVAL 1 MONTH)',
  'hour_at < toStartOfMonth(now())']];

const thisYearSql = (): ChronoClause => [HOURLY, ['hour_at >= toStartOfYear(now())']];
const lastYearSql = (): ChronoClause => [HOURLY, [
  'hour_at >= toStartOfYear(now() - INTERVAL 1 YEAR)',
  'hour_at < toStartOfYear(now())']];

const lifetimeSql = (): ChronoClause => [LIFETIME, []];
const dateRangeSql = (props: SplitUrl): ChronoClause => {
  const { dateRange } = props;
  const [fromDate, toDate]: [Date, Date] = JSON.parse(dateRange);
  return [HOURLY, [
    `hour_at >= toDateTime('${fromDate} 00:00:00')`,
    `hour_at < toDateTime('${toDate} 00:00:00') + INTERVAL 1 Day`]];
};

export const getChronoClause = (props: SplitUrl): ChronoClause => {
  const { partition = 'lifetime' } = props;
  const sql: Record<string, CallableFunction> = {
    today: todaySql, 
    yesterday: yesterdaySql,
    thisWeek: thisWeekSql,
    lastWeek: lastWeekSql,
    thisMonth: thisMonthSql,
    lastMonth: lastMonthSql,
    thisYear: thisYearSql,
    lastYear: lastYearSql,

    lifetime: lifetimeSql,
    dateRange: dateRangeSql,
  };

  return sql[partition](props) || [LIFETIME, []];
};
