import { type Route } from 'xpref';
import {
  getAction,
  postAction,
  detailAction,
  updateAction,
  deleteAction,
} from './cart.controller';
import { validateResource } from './cart.middleware';

export default {
  '/carts': ['cart', [], {
    get: getAction,
    post: postAction,
  }, {
    '/:id': ['cart-detail', [validateResource], {
      get: detailAction,
      put: updateAction,
      delete: deleteAction,
    }],
  }],
} as Route;
