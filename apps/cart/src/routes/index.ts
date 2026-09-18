import { type Route } from 'xpref';
import testRoute from './test.route';
import applicationRoute from '../application';
import cartRoute from '../cart';
import cartItemRoute from '../cart-item';

export default {
  ...testRoute,
  ...applicationRoute,
  ...cartRoute,
  ...cartItemRoute,
} as Route;
