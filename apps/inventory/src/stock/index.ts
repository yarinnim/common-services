import { type Route } from 'xpref';
import { getAction, detailAction } from './stock.controller';
import { validateResource } from './stock.middleware';

export default {
  '/stocks': ['stock', [], {
    get: getAction,
  }, {
    '/:id': ['stock-detail', [validateResource], {
      get: detailAction,
    }],
  }],
} as Route;
