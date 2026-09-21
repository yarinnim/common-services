import { type Paging } from 'knexify/types';
import paymentAuditModel from '../models/payment-audit.model';

const SEARCH_FIELDS = ['action', 'source'];

export type PaymentAuditSearch = Paging & {
  q?: string;
  paymentId?: number;
};

/**
 * Finds a tenant-scoped payment audit row by id.
 *
 * @example
 * find(1, 10);
 */
export const find = (id: number, applicationId: number) => paymentAuditModel()
  .whereActive({ applicationId })
  .find(id);

/**
 * Searches tenant-scoped payment audit rows.
 *
 * @example
 * searchPaymentAudits(1, { q: 'charge', page: 1, pageSize: 20 });
 */
export const searchPaymentAudits = (
  applicationId: number,
  search: PaymentAuditSearch,
) => {
  const {
    q = '',
    page = 1,
    pageSize = 20,
    token,
    paymentId,
  } = search;
  const filters: Record<string, unknown> = { applicationId };
  if (paymentId) filters.paymentId = paymentId;
  return paymentAuditModel()
    .whereActive(filters)
    .search(q, SEARCH_FIELDS)
    .paginate({ page, pageSize, token });
};
