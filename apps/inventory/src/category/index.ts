import { type Route } from 'xpref';
import {
  getAction,
  postAction,
  detailAction,
  updateAction,
  deleteAction,
} from './category.controller';
import { validateResource } from './category.middleware';

export default {
  '/categories': ['category', [], {
    get: getAction,
    post: postAction,
  }, {
    '/:id': ['category-detail', [validateResource], {
      get: detailAction,
      put: updateAction,
      delete: deleteAction,
    }],
  }],
} as Route;
