import paymentAuditModel from '../models/payment-audit.model';
import type { JsonObject } from '../models/common.type';

export type AuditWrite = {
  applicationId: number;
  paymentId?: number;
  action: string;
  source: string;
  requestPayload: JsonObject;
  responsePayload: JsonObject;
};

/**
 * Persists a tenant-scoped payment audit entry.
 *
 * @example
 * createPaymentAudit({ applicationId: 1, action: 'charge', ... });
 */
export const createPaymentAudit = (payload: AuditWrite) => {
  const {
    applicationId,
    paymentId,
    action,
    source,
    requestPayload,
    responsePayload,
  } = payload;
  return paymentAuditModel().create({
    applicationId,
    paymentId: paymentId || null,
    action,
    source,
    requestPayload,
    responsePayload,
  });
};
