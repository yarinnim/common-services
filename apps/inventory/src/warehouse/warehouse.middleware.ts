import { type Response, type NextFunction } from 'xpref';
import {
  type ApplicationRequest,
} from '../middleware/validate-application.middleware';
import { find, type Warehouse } from './warehouse.service';

export type WarehouseRequest = ApplicationRequest & {
  warehouse?: Warehouse;
};

/**
 * Loads a tenant-scoped warehouse for /warehouses/:id.
 *
 * @example
 * '/:id': ['detail', [validateResource], { get: detailAction }]
 */
export const validateResource = (
  request: WarehouseRequest,
  response: Response,
  next: NextFunction,
): void => {
  const { application } = request;
  if (!application) {
    return response.status(401).json({ message: 'Application not found.' });
  }

  const id = Number(request.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return response.status(404).json({ message: 'Warehouse not found.' });
  }

  find(id, application.id)
    .then((warehouse: Warehouse | undefined) => {
      if (!warehouse) throw new Error('Warehouse not found.');
      request.warehouse = warehouse;
      return next();
    })
    .catch((error: Error) => {
      const { message } = error;
      return response.status(404).json({ message });
    });
};
