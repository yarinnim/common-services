import { paymentProvider } from '../../config';
import type { PaymentProviderAdapter } from './payment-provider.type';
import { createStripeAdapter } from './stripe.adapter';

/**
 * Resolves a payment provider adapter for the given provider code.
 *
 * @example
 * resolvePaymentProvider('stripe', 'sk_test_xxx');
 */
export const resolvePaymentProvider = (
  provider: string,
  secretKey: string,
): PaymentProviderAdapter => {
  if (provider === paymentProvider.STRIPE) {
    return createStripeAdapter(secretKey);
  }
  throw new Error(`Payment provider "${provider}" is not supported yet.`);
};
