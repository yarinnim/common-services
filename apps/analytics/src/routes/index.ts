import { type Route } from 'xpref';
import testRoute from './test.route';
import { withApplicationValidation } from '../middleware/application.middleware';
import lifetimeStatisticsRoute from '../lifetime-statistics';
import customStatisticsRoute from '../custom-statistics';
import deviceOnlineRoute from '../device-online';
import rawSQLAction from '../raw-query';

export default {
  ...testRoute,
  '/statistics': ['', withApplicationValidation, {}, {
    ...lifetimeStatisticsRoute,
    ...customStatisticsRoute,
    ...deviceOnlineRoute,
    ...rawSQLAction,
  }],
} as Route;
