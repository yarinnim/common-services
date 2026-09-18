import { type Route } from 'xpref';
import testRoute from './test.route';
import applicationRoute from '../application';
import categoryRoute from '../category';
import warehouseRoute from '../warehouse';
import itemRoute from '../item';
import stockRoute from '../stock';
import stockMovementRoute from '../stock-movement';

export default {
  ...testRoute,
  ...applicationRoute,
  ...categoryRoute,
  ...warehouseRoute,
  ...itemRoute,
  ...stockRoute,
  ...stockMovementRoute,
} as Route;
