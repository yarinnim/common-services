import { type Response } from 'xpref';
import logger from '../log-client';
import { type ApplicationRequest } from '../middleware/validate-application.middleware';
import {
  type ApplicationDetailRequest,
} from './application.middleware';
import {
  type ApplicationSearch,
  type ApplicationWrite,
  searchApplications,
  createApplication,
  updateApplication,
  removeApplication,
} from './application.service';

/**
 * Validates GET /applications query parameters.
 *
 * @example
 * validateGetAction(req);
 */
const validateGetAction = (req: ApplicationRequest): ApplicationSearch => {
  const { q, page, pageSize, token } = req.query;
  return {
    q: `${q || ''}`,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 20,
    token: token ? `${token}` : undefined,
  };
};

/**
 * Validates POST and PUT application bodies.
 *
 * @example
 * validateWriteAction(req);
 */
const validateWriteAction = (req: ApplicationRequest): ApplicationWrite => {
  const { code, name, setting = {} } = req.body || {};
  if (!`${code || ''}`.trim()) throw new Error('Code is required.');
  if (!`${name || ''}`.trim()) throw new Error('Name is required.');
  return {
    code: `${code}`.trim(),
    name: `${name}`.trim(),
    setting: setting && typeof setting === 'object' ? setting : {},
  };
};

/**
 * Lists applications.
 *
 * @example
 * GET /applications
 */
export const getAction = (
  req: ApplicationRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validateGetAction(req))
  .then((search: ApplicationSearch) => searchApplications(search))
  .then((result) => res.json(result))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Creates an application.
 *
 * @example
 * POST /applications
 */
export const postAction = (
  req: ApplicationRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validateWriteAction(req))
  .then((payload: ApplicationWrite) => createApplication(payload))
  .then((application) => res.json(application))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Returns one application.
 *
 * @example
 * GET /applications/:id
 */
export const detailAction = (
  req: ApplicationDetailRequest,
  res: Response,
): Promise<Response> => Promise.resolve(res.json(req.targetApplication));

/**
 * Updates an application.
 *
 * @example
 * PUT /applications/:id
 */
export const updateAction = (
  req: ApplicationDetailRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validateWriteAction(req))
  .then((payload: ApplicationWrite) => {
    const { targetApplication } = req;
    if (!targetApplication) throw new Error('Application not found.');
    return updateApplication(targetApplication.id, payload);
  })
  .then((application) => res.json(application))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Soft-deletes an application.
 *
 * @example
 * DELETE /applications/:id
 */
export const deleteAction = (
  req: ApplicationDetailRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => {
    const { targetApplication } = req;
    if (!targetApplication) throw new Error('Application not found.');
    return removeApplication(targetApplication.id)
      .then(() => targetApplication);
  })
  .then((application) => res.json(application))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });
