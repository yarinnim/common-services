import { type Response, type NextFunction } from 'xpref';
import {
  type ApplicationRequest,
} from '../middleware/validate-application.middleware';
import { find, type Item } from './item.service';

export type ItemRequest = ApplicationRequest & {
  item?: Item;
};

/**
 * Loads a tenant-scoped item for /items/:id.
 *
 * @example
 * '/:id': ['detail', [validateResource], { get: detailAction }]
 */
export const validateResource = (
  request: ItemRequest,
  response: Response,
  next: NextFunction,
): void => {
  const { application } = request;
  if (!application) {
    return response.status(401).json({ message: 'Application not found.' });
  }

  const id = Number(request.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return response.status(404).json({ message: 'Item not found.' });
  }

  find(id, application.id)
    .then((item: Item | undefined) => {
      if (!item) throw new Error('Item not found.');
      request.item = item;
      return next();
    })
    .catch((error: Error) => {
      const { message } = error;
      return response.status(404).json({ message });
    });
};
