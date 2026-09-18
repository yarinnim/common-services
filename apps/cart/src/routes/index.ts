import { type Route } from 'xpref';
import testRoute from './test.route';
import applicationRoute from '../application';
import cartRoute from '../cart';

export default {
  ...testRoute,
  ...applicationRoute,
  ...cartRoute,
} as Route;
