import { type Response, type NextFunction } from 'xpref';
import {
  type ApplicationRequest,
} from '../middleware/validate-application.middleware';
import { find, type Category } from './category.service';

export type CategoryRequest = ApplicationRequest & {
  category?: Category;
};

/**
 * Loads a tenant-scoped category for /categories/:id.
 *
 * @example
 * '/:id': ['detail', [validateResource], { get: detailAction }]
 */
export const validateResource = (
  request: CategoryRequest,
  response: Response,
  next: NextFunction,
): void => {
  const { application } = request;
  if (!application) {
    return response.status(401).json({ message: 'Application not found.' });
  }

  const id = Number(request.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return response.status(404).json({ message: 'Category not found.' });
  }

  find(id, application.id)
    .then((category: Category | undefined) => {
      if (!category) throw new Error('Category not found.');
      request.category = category;
      return next();
    })
    .catch((error: Error) => {
      const { message } = error;
      return response.status(404).json({ message });
    });
};
