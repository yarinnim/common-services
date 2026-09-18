import { type Route } from 'xpref';
import {
  getAction,
  postAction,
  detailAction,
  updateAction,
  deleteAction,
} from './price.controller';
import { validateResource } from './price.middleware';

export default {
  '/prices': ['price', [], {
    get: getAction,
    post: postAction,
  }, {
    '/:id': ['price-detail', [validateResource], {
      get: detailAction,
      put: updateAction,
      delete: deleteAction,
    }],
  }],
} as Route;
