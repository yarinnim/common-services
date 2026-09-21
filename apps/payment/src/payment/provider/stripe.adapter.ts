import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { paymentStatus } from '../../config';
import type {
  GatewayCaptureInput,
  GatewayChargeInput,
  GatewayRefundInput,
  GatewayResult,
  PaymentProviderAdapter,
} from './payment-provider.type';

/**
 * Builds a deterministic Stripe-like reference id.
 *
 * @example
 * buildReference('pi');
 */
const buildReference = (prefix: string): string => {
  const suffix = randomBytes(8).toString('hex');
  return `${prefix}_${suffix}`;
};

/**
 * Simulates a Stripe charge using the tenant-resolved secret key.
 *
 * @example
 * createStripeAdapter('sk_test_xxx').charge(input);
 */
const runChargeLike = (
  actionPrefix: string,
  input: GatewayChargeInput,
): Promise<GatewayResult> => {
  const { amount, currency, paymentToken, metadata } = input;
  if (!paymentToken.trim()) {
    return Promise.resolve({
      status: paymentStatus.FAILED,
      providerReference: buildReference(actionPrefix),
      failureCode: 'missing_token',
      failureMessage: 'Payment token is required.',
      raw: { amount, currency },
    });
  }
  return Promise.resolve({
    status: paymentStatus.SUCCEEDED,
    providerReference: buildReference(actionPrefix),
    raw: { amount, currency, paymentToken, metadata },
  });
};

/**
 * Creates a Stripe adapter bound to a tenant secret key.
 *
 * @example
 * createStripeAdapter(resolved.secretKey);
 */
export const createStripeAdapter = (
  secretKey: string,
): PaymentProviderAdapter => {
  if (!secretKey.trim()) {
    throw new Error('Stripe secret key is required.');
  }

  return {
    charge: (input: GatewayChargeInput) => runChargeLike('pi', input),
    authorize: (input: GatewayChargeInput) => runChargeLike('pi_auth', input),
    capture: (input: GatewayCaptureInput) => Promise.resolve({
      status: paymentStatus.SUCCEEDED,
      providerReference: buildReference('pi_cap'),
      raw: {
        amount: input.amount,
        currency: input.currency,
        providerReference: input.providerReference,
        metadata: input.metadata,
      },
    }),
    refund: (input: GatewayRefundInput) => Promise.resolve({
      status: paymentStatus.SUCCEEDED,
      providerReference: buildReference('re'),
      raw: {
        amount: input.amount,
        currency: input.currency,
        providerReference: input.providerReference,
        metadata: input.metadata,
      },
    }),
    verifyWebhookSignature: (
      payload: string,
      signature: string,
      webhookSecret: string,
    ): boolean => {
      const expected = createHmac('sha256', webhookSecret)
        .update(payload)
        .digest('hex');
      const provided = `${signature || ''}`;
      if (expected.length !== provided.length) return false;
      return timingSafeEqual(
        Buffer.from(expected),
        Buffer.from(provided),
      );
    },
  };
};
