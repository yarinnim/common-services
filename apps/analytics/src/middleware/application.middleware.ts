import {
  type Request,
  type Response,
  type NextFunction,
} from 'xpref';
import {
  type Application,
  type ApplicationContext,
  findActiveApplication,
} from '../models/application.model';

export type AppRequest = Request & {
  application?: ApplicationContext;
};

const APP_ID_HEADER = 'app-id';
const APP_SECRET_KEY_HEADER = 'app-secret-key';

const getHeaderValue = (request: Request, headerName: string): string => {
  const headerValue = request.headers[headerName];
  if (Array.isArray(headerValue)) return `${headerValue[0] || ''}`.trim();
  return `${headerValue || ''}`.trim();
};

const toApplicationContext = (application: Application): ApplicationContext => {
  const { secretKey: _ignored, ...context } = application;
  return context;
};

/**
 * Validates app-id and app-secret-key headers against an active application.
 *
 * @example
 * '/events': ['events', [validateApplication], { post: postAction }]
 */
export const validateApplication = (
  request: AppRequest,
  response: Response,
  next: NextFunction,
): void => {
  const appId = getHeaderValue(request, APP_ID_HEADER);
  const appSecretKey = getHeaderValue(request, APP_SECRET_KEY_HEADER);

  if (!appId) {
    response.status(401).json({ message: 'App ID not provided.' });
    return;
  }

  if (!appSecretKey) {
    response.status(401).json({ message: 'App secret key not provided.' });
    return;
  }

  findActiveApplication(appId, appSecretKey)
    .then((application) => {
      if (!application) throw new Error('Invalid application credentials.');
      request.application = toApplicationContext(application);
      next();
    })
    .catch((error: Error) => {
      const { message } = error;
      response.status(401).json({ message });
    });
};

/** Route middleware stack that requires a valid integrated application. */
export const withApplicationValidation = [validateApplication];
