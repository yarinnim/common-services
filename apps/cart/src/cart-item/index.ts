import { type Route } from 'xpref';
import {
  getAction,
  postAction,
  clearAction,
  detailAction,
  updateAction,
  deleteAction,
} from './cart-item.controller';
import { validateResource } from './cart-item.middleware';

export default {
  '/cart-items': ['cart-item', [], {
    get: getAction,
    post: postAction,
    delete: clearAction,
  }, {
    '/:id': ['cart-item-detail', [validateResource], {
      get: detailAction,
      put: updateAction,
      delete: deleteAction,
    }],
  }],
} as Route;
