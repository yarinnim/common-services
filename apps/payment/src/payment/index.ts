import { type Route } from 'xpref';
import {
  getAction,
  detailAction,
  chargeAction,
  authorizeAction,
  captureAction,
  refundAction,
} from './payment.controller';
import { validateResource } from './payment.middleware';

export default {
  '/payments': ['payment', [], {
    get: getAction,
  }, {
    '/charge': ['payment-charge', [], {
      post: chargeAction,
    }],
    '/authorize': ['payment-authorize', [], {
      post: authorizeAction,
    }],
    '/capture': ['payment-capture', [], {
      post: captureAction,
    }],
    '/refund': ['payment-refund', [], {
      post: refundAction,
    }],
    '/:id': ['payment-detail', [validateResource], {
      get: detailAction,
    }],
  }],
} as Route;
