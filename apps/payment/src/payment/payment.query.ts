import { type Paging } from 'knexify/types';
import paymentModel from '../models/payment.model';
import type { JsonObject } from '../models/common.type';

export type PaymentSearch = Paging & {
  q?: string;
  status?: string;
  action?: string;
};

export type ChargeWrite = {
  gatewayCredentialId: number;
  amount: number;
  currency: string;
  paymentToken: string;
  orderReference?: string;
  customerId?: number;
  metadata: JsonObject;
  idempotencyKey?: string;
};

export type CaptureWrite = {
  paymentId: number;
  amount?: number;
  metadata: JsonObject;
  idempotencyKey?: string;
};

export type RefundWrite = {
  paymentId: number;
  amount?: number;
  metadata: JsonObject;
  idempotencyKey?: string;
};

const SEARCH_FIELDS = [
  'action',
  'status',
  'provider',
  'providerReference',
  'orderReference',
  'idempotencyKey',
];

/**
 * Finds a tenant-scoped payment by id.
 *
 * @example
 * find(1, 10);
 */
export const find = (id: number, applicationId: number) => paymentModel()
  .whereActive({ applicationId })
  .find(id);

/**
 * Searches tenant-scoped payments.
 *
 * @example
 * searchPayments(1, { q: 'charge', page: 1, pageSize: 20 });
 */
export const searchPayments = (
  applicationId: number,
  search: PaymentSearch,
) => {
  const {
    q = '',
    page = 1,
    pageSize = 20,
    token,
    status,
    action,
  } = search;
  const filters: Record<string, unknown> = { applicationId };
  if (status) filters.status = status;
  if (action) filters.action = action;
  return paymentModel()
    .whereActive(filters)
    .search(q, SEARCH_FIELDS)
    .paginate({ page, pageSize, token });
};
