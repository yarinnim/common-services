import paymentModel, { type Payment } from '../models/payment.model';

/**
 * Finds an existing payment by tenant-scoped idempotency key.
 *
 * @example
 * findByIdempotencyKey(1, 'req-123');
 */
export const findByIdempotencyKey = (
  applicationId: number,
  idempotencyKey: string,
) => paymentModel()
  .whereActive({ applicationId, idempotencyKey })
  .first() as Promise<Payment | undefined>;
