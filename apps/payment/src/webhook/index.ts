import { type Route } from 'xpref';
import { postAction } from './webhook.controller';

export default {
  '/webhooks': ['webhook', [], {}, {
    '/:applicationId': ['webhook-application', [], {}, {
      '/:provider': ['webhook-provider', [], {
        post: postAction,
      }],
    }],
  }],
} as Route;
