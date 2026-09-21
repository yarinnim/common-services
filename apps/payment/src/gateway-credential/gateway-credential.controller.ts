import { type Response } from 'xpref';
import logger from '../log-client';
import { type ApplicationRequest } from '../middleware/validate-application.middleware';
import {
  type GatewayCredentialRequest,
} from './gateway-credential.middleware';
import {
  type GatewayCredentialSearch,
  type GatewayCredentialWrite,
  isPaymentProvider,
  searchGatewayCredentials,
  createGatewayCredential,
  updateGatewayCredential,
  removeGatewayCredential,
} from './gateway-credential.service';

/**
 * Validates GET /gateway-credentials query parameters.
 *
 * @example
 * validateGetAction(req);
 */
const validateGetAction = (
  req: ApplicationRequest,
): GatewayCredentialSearch => {
  const { q, page, pageSize, token } = req.query;
  return {
    q: `${q || ''}`,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 20,
    token: token ? `${token}` : undefined,
  };
};

/**
 * Validates POST and PUT gateway credential bodies.
 *
 * @example
 * validateWriteAction(req);
 */
const validateWriteAction = (
  req: ApplicationRequest,
): GatewayCredentialWrite => {
  const {
    provider,
    secretKey,
    webhookSecret,
    publishableKey,
    setting = {},
  } = req.body || {};
  const normalizedProvider = `${provider || ''}`.trim().toLowerCase();
  if (!isPaymentProvider(normalizedProvider)) {
    throw new Error('Provider must be stripe, paypal, or adyen.');
  }
  if (!`${secretKey || ''}`.trim()) throw new Error('Secret key is required.');
  return {
    provider: normalizedProvider,
    secretKey: `${secretKey}`.trim(),
    webhookSecret: webhookSecret ? `${webhookSecret}`.trim() : undefined,
    publishableKey: publishableKey ? `${publishableKey}`.trim() : undefined,
    setting: setting && typeof setting === 'object' ? setting : {},
  };
};

/**
 * Lists gateway credentials for the authenticated application.
 *
 * @example
 * GET /gateway-credentials
 */
export const getAction = (
  req: ApplicationRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validateGetAction(req))
  .then((search: GatewayCredentialSearch) => {
    const { application } = req;
    if (!application) throw new Error('Application not found.');
    return searchGatewayCredentials(application.id, search);
  })
  .then((result) => res.json(result))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Creates an encrypted gateway credential.
 *
 * @example
 * POST /gateway-credentials
 */
export const postAction = (
  req: ApplicationRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validateWriteAction(req))
  .then((payload: GatewayCredentialWrite) => {
    const { application } = req;
    if (!application) throw new Error('Application not found.');
    return createGatewayCredential(application.id, payload);
  })
  .then((credential) => res.json(credential))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Returns one gateway credential (secrets never included).
 *
 * @example
 * GET /gateway-credentials/:id
 */
export const detailAction = (
  req: GatewayCredentialRequest,
  res: Response,
): Promise<Response> => Promise.resolve(res.json(req.gatewayCredential));

/**
 * Updates an encrypted gateway credential.
 *
 * @example
 * PUT /gateway-credentials/:id
 */
export const updateAction = (
  req: GatewayCredentialRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validateWriteAction(req))
  .then((payload: GatewayCredentialWrite) => {
    const { application, gatewayCredential } = req;
    if (!application) throw new Error('Application not found.');
    if (!gatewayCredential) throw new Error('Gateway credential not found.');
    return updateGatewayCredential(
      gatewayCredential.id,
      application.id,
      payload,
    );
  })
  .then((credential) => res.json(credential))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Soft-deletes a gateway credential and returns the previous public row.
 *
 * @example
 * removeAndReturn(applicationId, credential);
 */
const removeAndReturn = (
  applicationId: number,
  credential: NonNullable<GatewayCredentialRequest['gatewayCredential']>,
) => removeGatewayCredential(credential.id, applicationId)
  .then(() => credential);

/**
 * Soft-deletes a gateway credential.
 *
 * @example
 * DELETE /gateway-credentials/:id
 */
export const deleteAction = (
  req: GatewayCredentialRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => {
    const { application, gatewayCredential } = req;
    if (!application) throw new Error('Application not found.');
    if (!gatewayCredential) throw new Error('Gateway credential not found.');
    return removeAndReturn(application.id, gatewayCredential);
  })
  .then((credential) => res.json(credential))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });
