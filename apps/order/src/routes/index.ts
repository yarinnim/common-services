import { type Route } from 'xpref';
import testRoute from './test.route';
import applicationRoute from '../application';
import orderRoute from '../order';

export default {
  ...testRoute,
  ...applicationRoute,
  ...orderRoute,
} as Route;
