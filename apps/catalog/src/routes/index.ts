import { type Route } from 'xpref';
import testRoute from './test.route';
import applicationRoute from '../application';
import categoryRoute from '../category';
import productRoute from '../product';
import variantRoute from '../variant';
import priceRoute from '../price';
import mediaRoute from '../media';

export default {
  ...testRoute,
  ...applicationRoute,
  ...categoryRoute,
  ...productRoute,
  ...variantRoute,
  ...priceRoute,
  ...mediaRoute,
} as Route;
