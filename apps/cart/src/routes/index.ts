import { type Route } from 'xpref';
import testRoute from './test.route';
import applicationRoute from '../application';

export default {
  ...testRoute,
  ...applicationRoute,
} as Route;
