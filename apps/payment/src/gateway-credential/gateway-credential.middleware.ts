import { type Response, type NextFunction } from 'xpref';
import {
  type ApplicationRequest,
} from '../middleware/validate-application.middleware';
import {
  find,
  type GatewayCredentialPublic,
} from './gateway-credential.service';

export type GatewayCredentialRequest = ApplicationRequest & {
  gatewayCredential?: GatewayCredentialPublic;
};

/**
 * Loads a tenant-scoped gateway credential for /gateway-credentials/:id.
 *
 * @example
 * '/:id': ['detail', [validateResource], { get: detailAction }]
 */
export const validateResource = (
  request: GatewayCredentialRequest,
  response: Response,
  next: NextFunction,
): void => {
  const { application } = request;
  if (!application) {
    return response.status(401).json({ message: 'Application not found.' });
  }

  const id = Number(request.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return response.status(404).json({
      message: 'Gateway credential not found.',
    });
  }

  find(id, application.id)
    .then((credential: GatewayCredentialPublic | undefined) => {
      if (!credential) throw new Error('Gateway credential not found.');
      request.gatewayCredential = credential;
      return next();
    })
    .catch((error: Error) => {
      const { message } = error;
      return response.status(404).json({ message });
    });
};
