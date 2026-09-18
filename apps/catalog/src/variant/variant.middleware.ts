import { type Response, type NextFunction } from 'xpref';
import {
  type ApplicationRequest,
} from '../middleware/validate-application.middleware';
import { find, type Variant } from './variant.service';

export type VariantRequest = ApplicationRequest & {
  variant?: Variant;
};

/**
 * Loads a tenant-scoped variant for /variants/:id.
 *
 * @example
 * '/:id': ['detail', [validateResource], { get: detailAction }]
 */
export const validateResource = (
  request: VariantRequest,
  response: Response,
  next: NextFunction,
): void => {
  const { application } = request;
  if (!application) {
    return response.status(401).json({ message: 'Application not found.' });
  }

  const id = Number(request.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return response.status(404).json({ message: 'Variant not found.' });
  }

  find(id, application.id)
    .then((variant: Variant | undefined) => {
      if (!variant) throw new Error('Variant not found.');
      request.variant = variant;
      return next();
    })
    .catch((error: Error) => {
      const { message } = error;
      return response.status(404).json({ message });
    });
};
