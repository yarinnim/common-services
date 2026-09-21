import { type Route } from 'xpref';
import testRoute from './test.route';
import applicationRoute from '../application';
import gatewayCredentialRoute from '../gateway-credential';
import paymentRoute from '../payment';
import webhookRoute from '../webhook';
import paymentAuditRoute from '../payment-audit';

export default {
  ...testRoute,
  ...applicationRoute,
  ...gatewayCredentialRoute,
  ...paymentRoute,
  ...webhookRoute,
  ...paymentAuditRoute,
} as Route;
