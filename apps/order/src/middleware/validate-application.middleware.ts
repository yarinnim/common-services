import { type Request, type Response, type NextFunction } from 'xpref';
import { applicationHeader, applicationExcludedPath } from '../config';
import applicationModel, {
  type Application,
  type ApplicationContext,
} from '../models/application.model';

export type ApplicationRequest = Request & {
  application?: ApplicationContext;
  userId?: number;
};

/**
 * Validates app-id and app-secret-key, then attaches the tenant to the request.
 *
 * @example
 * interceptor: (app) => app.use(validateApplication)
 */
export const validateApplication = (
  request: ApplicationRequest,
  response: Response,
  next: NextFunction,
): void => {
  if (request.path === applicationExcludedPath.TEST) return next();

  const { headers } = request;
  const uuid = `${headers[applicationHeader.ID] || ''}`;
  const secretKey = `${headers[applicationHeader.SECRET_KEY] || ''}`;

  if (!uuid) {
    return response.status(401).json({ message: 'App ID not provided.' });
  }

  if (!secretKey) {
    return response.status(401).json({
      message: 'App secret key not provided.',
    });
  }

  applicationModel()
    .whereActive({ uuid, secretKey })
    .first()
    .then((application: Application | undefined) => {
      if (!application) throw new Error('Invalid application credentials.');
      const { secretKey: _secretKey, ...context } = application;
      request.application = context;
      request.userId = Number(headers[applicationHeader.USER_ID]) || undefined;
      return next();
    })
    .catch((error: Error) => {
      const { message } = error;
      return response.status(401).json({ message });
    });
};
