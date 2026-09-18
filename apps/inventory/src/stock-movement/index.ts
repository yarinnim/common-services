import { type Route } from 'xpref';
import {
  getAction,
  postAction,
  detailAction,
} from './stock-movement.controller';
import { validateResource } from './stock-movement.middleware';

export default {
  '/stock-movements': ['stock-movement', [], {
    get: getAction,
    post: postAction,
  }, {
    '/:id': ['stock-movement-detail', [validateResource], {
      get: detailAction,
    }],
  }],
} as Route;
