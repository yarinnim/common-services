import { type Response, type NextFunction } from 'xpref';
import {
  type ApplicationRequest,
} from '../middleware/validate-application.middleware';
import { find } from './payment-audit.service';
import type { PaymentAudit } from '../models/payment-audit.model';

export type PaymentAuditRequest = ApplicationRequest & {
  paymentAudit?: PaymentAudit;
};

/**
 * Loads a tenant-scoped payment audit for /payment-audits/:id.
 *
 * @example
 * '/:id': ['detail', [validateResource], { get: detailAction }]
 */
export const validateResource = (
  request: PaymentAuditRequest,
  response: Response,
  next: NextFunction,
): void => {
  const { application } = request;
  if (!application) {
    return response.status(401).json({ message: 'Application not found.' });
  }

  const id = Number(request.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return response.status(404).json({ message: 'Payment audit not found.' });
  }

  find(id, application.id)
    .then((paymentAudit: PaymentAudit | undefined) => {
      if (!paymentAudit) throw new Error('Payment audit not found.');
      request.paymentAudit = paymentAudit;
      return next();
    })
    .catch((error: Error) => {
      const { message } = error;
      return response.status(404).json({ message });
    });
};
