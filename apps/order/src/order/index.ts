import { type Route } from 'xpref';
import {
  getAction,
  postAction,
  detailAction,
  statusAction,
  cancelAction,
} from './order.controller';
import { validateResource } from './order.middleware';

export default {
  '/orders': ['order', [], {
    get: getAction,
    post: postAction,
  }, {
    '/:id': ['order-detail', [validateResource], {
      get: detailAction,
    }, {
      '/status': ['order-status', [], {
        patch: statusAction,
      }],
      '/cancel': ['order-cancel', [], {
        post: cancelAction,
      }],
    }],
  }],
} as Route;
