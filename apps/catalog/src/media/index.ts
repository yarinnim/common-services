import { type Route } from 'xpref';
import {
  getAction,
  postAction,
  detailAction,
  updateAction,
  deleteAction,
} from './media.controller';
import { validateResource } from './media.middleware';

export default {
  '/media': ['media', [], {
    get: getAction,
    post: postAction,
  }, {
    '/:id': ['media-detail', [validateResource], {
      get: detailAction,
      put: updateAction,
      delete: deleteAction,
    }],
  }],
} as Route;
