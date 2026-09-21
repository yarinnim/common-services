import { paymentAction, paymentStatus } from '../config';
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
import { find, type CaptureWrite, type RefundWrite } from './payment.query';
import { persistPayment } from './payment.persist';

type FollowUpWrite = CaptureWrite | RefundWrite;

type FollowUpInput = {
  applicationId: number;
  action: string;
  write: FollowUpWrite;
  expectedParentAction: string;
};

/**
 * Loads a parent payment and validates it for follow-up actions.
 *
 * @example
 * loadParentPayment(1, 10, 'authorize');
 */
const loadParentPayment = (
  applicationId: number,
  paymentId: number,
  expectedAction: string,
) => find(paymentId, applicationId).then((payment: Payment | undefined) => {
  if (!payment) throw new Error('Payment not found.');
  if (payment.action !== expectedAction) {
    throw new Error(`Parent payment must be a ${expectedAction}.`);
  }
  if (payment.status !== paymentStatus.SUCCEEDED) {
    throw new Error('Parent payment is not succeeded.');
  }
  if (!payment.providerReference) {
    throw new Error('Parent payment has no provider reference.');
  }
  return payment;
});

/**
 * Calls the gateway and persists a capture or refund payment.
 *
 * @example
 * runFollowUp(input);
 */
const runFollowUp = (input: FollowUpInput): Promise<Payment> => {
  const { applicationId, action, write, expectedParentAction } = input;
  return loadParentPayment(applicationId, write.paymentId, expectedParentAction)
    .then((parent: Payment) => resolveGatewayCredential(
      parent.gatewayCredentialId,
      applicationId,
    ).then((credential: ResolvedGatewayCredential) => ({ parent, credential })))
    .then((bundle) => {
      const { parent, credential } = bundle;
      const amount = write.amount ?? Number(parent.amount);
      if (amount <= 0) throw new Error('Amount must be greater than zero.');
      if (amount > Number(parent.amount)) {
        throw new Error('Amount exceeds parent payment amount.');
      }
      const adapter = resolvePaymentProvider(
        credential.provider,
        credential.secretKey,
      );
      const gatewayInput = {
        providerReference: `${parent.providerReference}`,
        amount,
        currency: parent.currency,
        metadata: write.metadata,
      };
      const runner = action === paymentAction.CAPTURE
        ? () => adapter.capture(gatewayInput)
        : () => adapter.refund(gatewayInput);
      return retryGateway(0, runner).then((result: GatewayResult) => ({
        parent,
        credential,
        result,
        amount,
      }));
    })
    .then((bundle) => {
      const { parent, credential, result, amount } = bundle;
      const row = {
        applicationId,
        gatewayCredentialId: credential.id,
        parentPaymentId: parent.id,
        idempotencyKey: write.idempotencyKey || null,
        action,
        status: result.status,
        amount,
        currency: parent.currency,
        provider: credential.provider,
        providerReference: result.providerReference,
        orderReference: parent.orderReference || null,
        customerId: parent.customerId || null,
        failureCode: result.failureCode || null,
        failureMessage: result.failureMessage || null,
        metadata: write.metadata,
      };
      return persistPayment(
        applicationId,
        row,
        action,
        write as unknown as JsonObject,
      );
    });
};

/**
 * Creates a follow-up payment with optional idempotency.
 *
 * @example
 * executeFollowUp(input);
 */
const executeFollowUp = (input: FollowUpInput): Promise<Payment> => {
  const { applicationId, write } = input;
  if (!write.idempotencyKey) return runFollowUp(input);
  return findByIdempotencyKey(applicationId, write.idempotencyKey)
    .then((existing: Payment | undefined) => {
      if (existing) return existing;
      return runFollowUp(input);
    });
};

/**
 * Captures a prior authorization.
 *
 * @example
 * createCapture(1, write);
 */
export const createCapture = (
  applicationId: number,
  write: CaptureWrite,
): Promise<Payment> => executeFollowUp({
  applicationId,
  action: paymentAction.CAPTURE,
  write,
  expectedParentAction: paymentAction.AUTHORIZE,
});

/**
 * Refunds a prior charge or capture.
 *
 * @example
 * createRefund(1, write);
 */
export const createRefund = (
  applicationId: number,
  write: RefundWrite,
): Promise<Payment> => find(write.paymentId, applicationId)
  .then((parent: Payment | undefined) => {
    if (!parent) throw new Error('Payment not found.');
    if (
      parent.action !== paymentAction.CHARGE
      && parent.action !== paymentAction.CAPTURE
    ) {
      throw new Error('Refund requires a charge or capture parent.');
    }
    return executeFollowUp({
      applicationId,
      action: paymentAction.REFUND,
      write,
      expectedParentAction: parent.action,
    });
  });
