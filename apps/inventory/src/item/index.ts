import { type Route } from 'xpref';
import {
  getAction,
  postAction,
  detailAction,
  updateAction,
  deleteAction,
} from './item.controller';
import { validateResource } from './item.middleware';

export default {
  '/items': ['item', [], {
    get: getAction,
    post: postAction,
  }, {
    '/:id': ['item-detail', [validateResource], {
      get: detailAction,
      put: updateAction,
      delete: deleteAction,
    }],
  }],
} as Route;
