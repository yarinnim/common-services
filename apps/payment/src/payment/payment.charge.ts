import { paymentAction } from '../config';
import {
  resolveGatewayCredential,
  type ResolvedGatewayCredential,
} from '../gateway-credential/gateway-credential.service';
import { findByIdempotencyKey } from '../utils/idempotency';
import { resolvePaymentProvider } from './provider/resolve-provider';
import { retryGateway } from './provider/retry-gateway';
import type { GatewayResult } from './provider/payment-provider.type';
import type { Payment } from '../models/payment.model';
import type { JsonObject } from '../models/common.type';
import { type ChargeWrite } from './payment.query';
import { buildChargeRow, persistPayment } from './payment.persist';

type ChargeInput = {
  applicationId: number;
  action: string;
  write: ChargeWrite;
};

/**
 * Calls the gateway and persists a charge or authorize payment.
 *
 * @example
 * runChargeLike(input);
 */
const runChargeLike = (input: ChargeInput): Promise<Payment> => {
  const { applicationId, action, write } = input;
  return resolveGatewayCredential(write.gatewayCredentialId, applicationId)
    .then((credential: ResolvedGatewayCredential) => {
      const adapter = resolvePaymentProvider(
        credential.provider,
        credential.secretKey,
      );
      const gatewayInput = {
        amount: write.amount,
        currency: write.currency,
        paymentToken: write.paymentToken,
        orderReference: write.orderReference,
        customerId: write.customerId,
        metadata: write.metadata,
      };
      const runner = action === paymentAction.AUTHORIZE
        ? () => adapter.authorize(gatewayInput)
        : () => adapter.charge(gatewayInput);
      return retryGateway(0, runner).then((result: GatewayResult) => ({
        credential,
        result,
      }));
    })
    .then((bundle) => {
      const { credential, result } = bundle;
      const row = buildChargeRow({
        applicationId,
        action,
        write,
        credential,
      }, result);
      return persistPayment(
        applicationId,
        row,
        action,
        write as unknown as JsonObject,
      );
    });
};

/**
 * Creates a charge or authorize payment with optional idempotency.
 *
 * @example
 * executeChargeLike(1, 'charge', write);
 */
export const executeChargeLike = (
  applicationId: number,
  action: string,
  write: ChargeWrite,
): Promise<Payment> => {
  const input = { applicationId, action, write };
  if (!write.idempotencyKey) return runChargeLike(input);
  return findByIdempotencyKey(applicationId, write.idempotencyKey)
    .then((existing: Payment | undefined) => {
      if (existing) return existing;
      return runChargeLike(input);
    });
};

/**
 * Creates a charge payment.
 *
 * @example
 * createCharge(1, write);
 */
export const createCharge = (
  applicationId: number,
  write: ChargeWrite,
): Promise<Payment> => executeChargeLike(
  applicationId,
  paymentAction.CHARGE,
  write,
);

/**
 * Creates an authorization payment.
 *
 * @example
 * createAuthorization(1, write);
 */
export const createAuthorization = (
  applicationId: number,
  write: ChargeWrite,
): Promise<Payment> => executeChargeLike(
  applicationId,
  paymentAction.AUTHORIZE,
  write,
);
