import { type Response, type NextFunction } from 'xpref';
import {
  type ApplicationRequest,
} from '../middleware/validate-application.middleware';
import { find, type Stock } from './stock.service';

export type StockRequest = ApplicationRequest & {
  stock?: Stock;
};

/**
 * Loads a tenant-scoped stock row for /stocks/:id.
 *
 * @example
 * '/:id': ['detail', [validateResource], { get: detailAction }]
 */
export const validateResource = (
  request: StockRequest,
  response: Response,
  next: NextFunction,
): void => {
  const { application } = request;
  if (!application) {
    return response.status(401).json({ message: 'Application not found.' });
  }

  const id = Number(request.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return response.status(404).json({ message: 'Stock not found.' });
  }

  find(id, application.id)
    .then((stock: Stock | undefined) => {
      if (!stock) throw new Error('Stock not found.');
      request.stock = stock;
      return next();
    })
    .catch((error: Error) => {
      const { message } = error;
      return response.status(404).json({ message });
    });
};
