import { type Route } from 'xpref';
import {
  getAction,
  postAction,
  detailAction,
  updateAction,
  deleteAction,
} from './application.controller';
import { validateResource } from './application.middleware';

export default {
  '/applications': ['application', [], {
    get: getAction,
    post: postAction,
  }, {
    '/:id': ['application-detail', [validateResource], {
      get: detailAction,
      put: updateAction,
      delete: deleteAction,
    }],
  }],
} as Route;
