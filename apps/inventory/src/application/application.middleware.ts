import { type Response, type NextFunction } from 'xpref';
import {
  type ApplicationRequest,
} from '../middleware/validate-application.middleware';
import { find } from './application.service';
import { type ApplicationContext } from '../models/application.model';

export type ApplicationDetailRequest = ApplicationRequest & {
  targetApplication?: ApplicationContext;
};

/**
 * Loads the application resource for /applications/:id.
 *
 * @example
 * '/:id': ['detail', [validateResource], { get: detailAction }]
 */
export const validateResource = (
  request: ApplicationDetailRequest,
  response: Response,
  next: NextFunction,
): void => {
  const id = Number(request.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return response.status(404).json({ message: 'Application not found.' });
  }

  find(id)
    .then((application: ApplicationContext | undefined) => {
      if (!application) throw new Error('Application not found.');
      request.targetApplication = application;
      return next();
    })
    .catch((error: Error) => {
      const { message } = error;
      return response.status(404).json({ message });
    });
};
