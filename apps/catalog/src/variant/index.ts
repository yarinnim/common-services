import { type Route } from 'xpref';
import {
  getAction,
  postAction,
  detailAction,
  updateAction,
  deleteAction,
} from './variant.controller';
import { validateResource } from './variant.middleware';

export default {
  '/variants': ['variant', [], {
    get: getAction,
    post: postAction,
  }, {
    '/:id': ['variant-detail', [validateResource], {
      get: detailAction,
      put: updateAction,
      delete: deleteAction,
    }],
  }],
} as Route;
