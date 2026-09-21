import { type Response, type NextFunction } from 'xpref';
import {
  type ApplicationRequest,
} from '../middleware/validate-application.middleware';
import { find, type Payment } from './payment.service';

export type PaymentRequest = ApplicationRequest & {
  payment?: Payment;
};

/**
 * Loads a tenant-scoped payment for /payments/:id.
 *
 * @example
 * '/:id': ['detail', [validateResource], { get: detailAction }]
 */
export const validateResource = (
  request: PaymentRequest,
  response: Response,
  next: NextFunction,
): void => {
  const { application } = request;
  if (!application) {
    return response.status(401).json({ message: 'Application not found.' });
  }

  const id = Number(request.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return response.status(404).json({ message: 'Payment not found.' });
  }

  find(id, application.id)
    .then((payment: Payment | undefined) => {
      if (!payment) throw new Error('Payment not found.');
      request.payment = payment;
      return next();
    })
    .catch((error: Error) => {
      const { message } = error;
      return response.status(404).json({ message });
    });
};
