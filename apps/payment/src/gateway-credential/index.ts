import { type Route } from 'xpref';
import {
  getAction,
  postAction,
  detailAction,
  updateAction,
  deleteAction,
} from './gateway-credential.controller';
import { validateResource } from './gateway-credential.middleware';

export default {
  '/gateway-credentials': ['gateway-credential', [], {
    get: getAction,
    post: postAction,
  }, {
    '/:id': ['gateway-credential-detail', [validateResource], {
      get: detailAction,
      put: updateAction,
      delete: deleteAction,
    }],
  }],
} as Route;
