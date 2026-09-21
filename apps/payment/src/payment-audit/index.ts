import { type Route } from 'xpref';
import { getAction, detailAction } from './payment-audit.controller';
import { validateResource } from './payment-audit.middleware';

export default {
  '/payment-audits': ['payment-audit', [], {
    get: getAction,
  }, {
    '/:id': ['payment-audit-detail', [validateResource], {
      get: detailAction,
    }],
  }],
} as Route;
