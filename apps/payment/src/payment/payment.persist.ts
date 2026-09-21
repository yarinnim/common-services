import { type Transaction } from 'knexify';
import pool from '../models/pool';
import paymentModel, { type Payment } from '../models/payment.model';
import type { JsonObject } from '../models/common.type';
import { auditSource } from '../config';
import { createPaymentAudit } from '../utils/payment-audit';
import type { ResolvedGatewayCredential } from '../gateway-credential/gateway-credential.service';
import type { GatewayResult } from './provider/payment-provider.type';
import type { ChargeWrite } from './payment.query';

/**
 * Persists a payment row and returns the created record.
 *
 * @example
 * insertPayment(row, trx);
 */
export const insertPayment = (
  row: Record<string, unknown>,
  trx: Transaction,
) => paymentModel(trx)
  .create(row)
  .then((created: { id: number }) => paymentModel(trx)
    .whereActive({ applicationId: row.applicationId as number })
    .find(created.id));

/**
 * Writes an audit row for a payment mutation.
 *
 * @example
 * auditPayment(1, payment, 'charge', request);
 */
export const auditPayment = (
  applicationId: number,
  payment: Payment,
  action: string,
  requestPayload: JsonObject,
) => createPaymentAudit({
  applicationId,
  paymentId: payment.id,
  action,
  source: auditSource.API,
  requestPayload,
  responsePayload: payment as unknown as JsonObject,
});

/**
 * Maps a gateway result into a payment insert payload.
 *
 * @example
 * buildChargeRow(context, result);
 */
export const buildChargeRow = (
  context: {
    applicationId: number;
    action: string;
    write: ChargeWrite;
    parentPaymentId?: number;
    credential: ResolvedGatewayCredential;
  },
  result: GatewayResult,
) => {
  const { applicationId, action, write, parentPaymentId, credential } = context;
  return {
    applicationId,
    gatewayCredentialId: credential.id,
    parentPaymentId: parentPaymentId || null,
    idempotencyKey: write.idempotencyKey || null,
    action,
    status: result.status,
    amount: write.amount,
    currency: write.currency.toUpperCase(),
    provider: credential.provider,
    providerReference: result.providerReference,
    orderReference: write.orderReference || null,
    customerId: write.customerId || null,
    failureCode: result.failureCode || null,
    failureMessage: result.failureMessage || null,
    metadata: write.metadata,
  };
};

/**
 * Inserts a payment and writes its audit entry in one transaction.
 *
 * @example
 * persistPayment(1, row, 'charge', request);
 */
export const persistPayment = (
  applicationId: number,
  row: Record<string, unknown>,
  action: string,
  requestPayload: JsonObject,
): Promise<Payment> => pool.transaction((trx: Transaction) => (
  insertPayment(row, trx).then((payment: Payment) => auditPayment(
    applicationId,
    payment,
    action,
    requestPayload,
  ).then(() => payment))
));
