import { type Route } from 'xpref';
import {
  getAction,
  postAction,
  detailAction,
  updateAction,
  deleteAction,
} from './product.controller';
import { validateResource } from './product.middleware';

export default {
  '/products': ['product', [], {
    get: getAction,
    post: postAction,
  }, {
    '/:id': ['product-detail', [validateResource], {
      get: detailAction,
      put: updateAction,
      delete: deleteAction,
    }],
  }],
} as Route;
