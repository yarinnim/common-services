import { type Response, type NextFunction } from 'xpref';
import {
  type ApplicationRequest,
} from '../middleware/validate-application.middleware';
import { find, type StockMovement } from './stock-movement.service';

export type StockMovementRequest = ApplicationRequest & {
  stockMovement?: StockMovement;
};

/**
 * Loads a tenant-scoped stock movement for /stock-movements/:id.
 *
 * @example
 * '/:id': ['detail', [validateResource], { get: detailAction }]
 */
export const validateResource = (
  request: StockMovementRequest,
  response: Response,
  next: NextFunction,
): void => {
  const { application } = request;
  if (!application) {
    return response.status(401).json({ message: 'Application not found.' });
  }

  const id = Number(request.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return response.status(404).json({ message: 'Stock movement not found.' });
  }

  find(id, application.id)
    .then((stockMovement: StockMovement | undefined) => {
      if (!stockMovement) throw new Error('Stock movement not found.');
      request.stockMovement = stockMovement;
      return next();
    })
    .catch((error: Error) => {
      const { message } = error;
      return response.status(404).json({ message });
    });
};
