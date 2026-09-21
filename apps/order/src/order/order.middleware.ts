import { type Response, type NextFunction } from 'xpref';
import {
  type ApplicationRequest,
} from '../middleware/validate-application.middleware';
import { find, type Order } from './order.service';

export type OrderRequest = ApplicationRequest & {
  order?: Order;
};

/**
 * Loads a tenant-scoped order for /orders/:id routes.
 *
 * @example
 * '/:id': ['detail', [validateResource], { get: detailAction }]
 */
export const validateResource = (
  request: OrderRequest,
  response: Response,
  next: NextFunction,
): void => {
  const { application } = request;
  if (!application) {
    return response.status(401).json({ message: 'Application not found.' });
  }

  const id = Number(request.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return response.status(404).json({ message: 'Order not found.' });
  }

  find(id, application.id)
    .then((order: Order | undefined) => {
      if (!order) throw new Error('Order not found.');
      request.order = order;
      return next();
    })
    .catch((error: Error) => {
      const { message } = error;
      return response.status(404).json({ message });
    });
};
