import { type Response } from 'xpref';
import logger from '../log-client';
import { applicationHeader } from '../config';
import { type ApplicationRequest } from '../middleware/validate-application.middleware';
import { type PaymentRequest } from './payment.middleware';
import {
  type PaymentSearch,
  type ChargeWrite,
  type CaptureWrite,
  type RefundWrite,
  searchPayments,
  createCharge,
  createAuthorization,
  createCapture,
  createRefund,
} from './payment.service';
import type { JsonObject } from '../models/common.type';

/**
 * Reads the Idempotency-Key header when present.
 *
 * @example
 * readIdempotencyKey(req);
 */
const readIdempotencyKey = (req: ApplicationRequest): string | undefined => {
  const raw = req.headers[applicationHeader.IDEMPOTENCY_KEY];
  const value = `${raw || ''}`.trim();
  return value || undefined;
};

/**
 * Validates list query parameters for GET /payments.
 *
 * @example
 * validateGetAction(req);
 */
const validateGetAction = (req: ApplicationRequest): PaymentSearch => {
  const { q, page, pageSize, token, status, action } = req.query;
  return {
    q: `${q || ''}`,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 20,
    token: token ? `${token}` : undefined,
    status: status ? `${status}` : undefined,
    action: action ? `${action}` : undefined,
  };
};

/**
 * Validates charge and authorize request bodies.
 *
 * @example
 * validateChargeAction(req);
 */
const validateChargeAction = (req: ApplicationRequest): ChargeWrite => {
  const {
    gatewayCredentialId,
    amount,
    currency,
    paymentToken,
    orderReference,
    customerId,
    metadata = {},
  } = req.body || {};
  const credentialId = Number(gatewayCredentialId);
  const parsedAmount = Number(amount);
  if (!Number.isInteger(credentialId) || credentialId <= 0) {
    throw new Error('Gateway credential id is required.');
  }
  if (!(parsedAmount > 0)) throw new Error('Amount must be greater than zero.');
  if (!`${currency || ''}`.trim()) throw new Error('Currency is required.');
  if (!`${paymentToken || ''}`.trim()) {
    throw new Error('Payment token is required.');
  }
  return {
    gatewayCredentialId: credentialId,
    amount: parsedAmount,
    currency: `${currency}`.trim().toUpperCase(),
    paymentToken: `${paymentToken}`.trim(),
    orderReference: orderReference ? `${orderReference}`.trim() : undefined,
    customerId: customerId ? Number(customerId) : undefined,
    metadata: metadata && typeof metadata === 'object'
      ? metadata as JsonObject
      : {},
    idempotencyKey: readIdempotencyKey(req),
  };
};

/**
 * Validates capture and refund request bodies.
 *
 * @example
 * validateFollowUpAction(req);
 */
const validateFollowUpAction = (
  req: ApplicationRequest,
): CaptureWrite => {
  const { paymentId, amount, metadata = {} } = req.body || {};
  const parsedPaymentId = Number(paymentId);
  if (!Number.isInteger(parsedPaymentId) || parsedPaymentId <= 0) {
    throw new Error('Payment id is required.');
  }
  const parsedAmount = amount === undefined || amount === null
    ? undefined
    : Number(amount);
  if (parsedAmount !== undefined && !(parsedAmount > 0)) {
    throw new Error('Amount must be greater than zero.');
  }
  return {
    paymentId: parsedPaymentId,
    amount: parsedAmount,
    metadata: metadata && typeof metadata === 'object'
      ? metadata as JsonObject
      : {},
    idempotencyKey: readIdempotencyKey(req),
  };
};

/**
 * Lists payments for the authenticated application.
 *
 * @example
 * GET /payments
 */
export const getAction = (
  req: ApplicationRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validateGetAction(req))
  .then((search: PaymentSearch) => {
    const { application } = req;
    if (!application) throw new Error('Application not found.');
    return searchPayments(application.id, search);
  })
  .then((result) => res.json(result))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Returns one payment.
 *
 * @example
 * GET /payments/:id
 */
export const detailAction = (
  req: PaymentRequest,
  res: Response,
): Promise<Response> => Promise.resolve(res.json(req.payment));

/**
 * Creates a charge payment.
 *
 * @example
 * POST /payments/charge
 */
export const chargeAction = (
  req: ApplicationRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validateChargeAction(req))
  .then((write: ChargeWrite) => {
    const { application } = req;
    if (!application) throw new Error('Application not found.');
    return createCharge(application.id, write);
  })
  .then((payment) => res.json(payment))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Creates an authorization payment.
 *
 * @example
 * POST /payments/authorize
 */
export const authorizeAction = (
  req: ApplicationRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validateChargeAction(req))
  .then((write: ChargeWrite) => {
    const { application } = req;
    if (!application) throw new Error('Application not found.');
    return createAuthorization(application.id, write);
  })
  .then((payment) => res.json(payment))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Captures a prior authorization.
 *
 * @example
 * POST /payments/capture
 */
export const captureAction = (
  req: ApplicationRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validateFollowUpAction(req))
  .then((write: CaptureWrite) => {
    const { application } = req;
    if (!application) throw new Error('Application not found.');
    return createCapture(application.id, write);
  })
  .then((payment) => res.json(payment))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Refunds a prior charge or capture.
 *
 * @example
 * POST /payments/refund
 */
export const refundAction = (
  req: ApplicationRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validateFollowUpAction(req))
  .then((write: RefundWrite) => {
    const { application } = req;
    if (!application) throw new Error('Application not found.');
    return createRefund(application.id, write);
  })
  .then((payment) => res.json(payment))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });
