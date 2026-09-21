import { type Response } from 'xpref';
import logger from '../log-client';
import { type ApplicationRequest } from '../middleware/validate-application.middleware';
import { isPaymentProvider } from '../gateway-credential/gateway-credential.service';
import { ingestWebhook } from './webhook.service';
import type { JsonObject } from '../models/common.type';

/**
 * Validates webhook path params and body for ingestion.
 *
 * @example
 * validatePostAction(req);
 */
const validatePostAction = (req: ApplicationRequest) => {
  const applicationId = Number(req.params.applicationId);
  const provider = `${req.params.provider || ''}`.trim().toLowerCase();
  if (!Number.isInteger(applicationId) || applicationId <= 0) {
    throw new Error('Application id is required.');
  }
  if (!isPaymentProvider(provider)) {
    throw new Error('Provider must be stripe, paypal, or adyen.');
  }
  const payload = (req.body || {}) as JsonObject;
  const signature = `${req.headers['stripe-signature']
    || req.headers['x-webhook-signature']
    || ''}`.trim();
  if (!signature) throw new Error('Webhook signature is required.');
  const rawBody = typeof req.body === 'string'
    ? req.body
    : JSON.stringify(payload);
  return {
    applicationId,
    provider,
    rawBody,
    signature,
    payload,
  };
};

/**
 * Receives an inbound payment gateway webhook.
 *
 * @example
 * POST /webhooks/:applicationId/:provider
 */
export const postAction = (
  req: ApplicationRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validatePostAction(req))
  .then((input) => ingestWebhook(input))
  .then((event) => res.json(event))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });
