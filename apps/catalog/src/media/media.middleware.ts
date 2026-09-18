import { type Response, type NextFunction } from 'xpref';
import {
  type ApplicationRequest,
} from '../middleware/validate-application.middleware';
import { find, type Media } from './media.service';

export type MediaRequest = ApplicationRequest & {
  media?: Media;
};

/**
 * Loads a tenant-scoped media row for /media/:id.
 *
 * @example
 * '/:id': ['detail', [validateResource], { get: detailAction }]
 */
export const validateResource = (
  request: MediaRequest,
  response: Response,
  next: NextFunction,
): void => {
  const { application } = request;
  if (!application) {
    return response.status(401).json({ message: 'Application not found.' });
  }

  const id = Number(request.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return response.status(404).json({ message: 'Media not found.' });
  }

  find(id, application.id)
    .then((media: Media | undefined) => {
      if (!media) throw new Error('Media not found.');
      request.media = media;
      return next();
    })
    .catch((error: Error) => {
      const { message } = error;
      return response.status(404).json({ message });
    });
};
