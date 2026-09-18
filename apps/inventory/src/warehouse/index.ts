import { type Route } from 'xpref';
import {
  getAction,
  postAction,
  detailAction,
  updateAction,
  deleteAction,
} from './warehouse.controller';
import { validateResource } from './warehouse.middleware';

export default {
  '/warehouses': ['warehouse', [], {
    get: getAction,
    post: postAction,
  }, {
    '/:id': ['warehouse-detail', [validateResource], {
      get: detailAction,
      put: updateAction,
      delete: deleteAction,
    }],
  }],
} as Route;
