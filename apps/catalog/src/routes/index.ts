import { type Route } from 'xpref';
import testRoute from './test.route';
import applicationRoute from '../application';
import categoryRoute from '../category';

export default {
  ...testRoute,
  ...applicationRoute,
  ...categoryRoute,
} as Route;
