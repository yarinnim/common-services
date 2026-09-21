import webhookEventModel, {
  type WebhookEvent,
} from '../models/webhook-event.model';
import paymentModel, { type Payment } from '../models/payment.model';
import pool from '../models/pool';
import type { JsonObject } from '../models/common.type';
import { webhookStatus, paymentStatus } from '../config';

export type WebhookIngestInput = {
  applicationId: number;
  provider: string;
  rawBody: string;
  signature: string;
  payload: JsonObject;
};

/**
 * Reads a provider reference from a webhook payload when present.
 *
 * @example
 * readProviderReference(payload);
 */
export const readProviderReference = (payload: JsonObject): string => {
  const data = payload.data as JsonObject | undefined;
  const object = data ? data.object as JsonObject | undefined : undefined;
  if (object && object.id) return `${object.id}`;
  return `${payload.providerReference || ''}`.trim();
};

/**
 * Creates a received webhook event row.
 *
 * @example
 * createReceivedEvent(input, true);
 */
export const createReceivedEvent = (
  input: WebhookIngestInput,
  signatureValid: boolean,
) => {
  const { applicationId, provider, payload } = input;
  const providerEventId = `${payload.id || payload.eventId || ''}`.trim()
    || `evt_${Date.now()}`;
  const eventType = `${payload.type || payload.eventType || 'unknown'}`;
  return webhookEventModel()
    .create({
      applicationId,
      provider,
      providerEventId,
      eventType,
      status: webhookStatus.RECEIVED,
      payload,
      signatureValid,
      paymentId: null,
      errorMessage: null,
      processedAt: null,
    })
    .then((created: { id: number }) => webhookEventModel()
      .whereActive({ applicationId })
      .find(created.id) as Promise<WebhookEvent>);
};

/**
 * Marks a webhook event with the given patch fields.
 *
 * @example
 * patchWebhookEvent(1, 1, { status: 'processed' });
 */
export const patchWebhookEvent = (
  id: number,
  applicationId: number,
  patch: Record<string, unknown>,
) => webhookEventModel()
  .whereActive({ applicationId })
  .patch(id, patch);

/**
 * Updates a payment to succeeded when the provider reference matches.
 *
 * @example
 * applyPaymentSucceeded(1, 'pi_abc');
 */
export const applyPaymentSucceeded = (
  applicationId: number,
  providerReference: string,
) => paymentModel()
  .whereActive({ applicationId, providerReference })
  .first()
  .then((payment: Payment | undefined) => {
    if (!payment) return undefined;
    return paymentModel()
      .whereActive({ applicationId })
      .patch(payment.id, { status: paymentStatus.SUCCEEDED })
      .then(() => payment);
  });

/**
 * Returns a processed_at timestamp expression for webhook updates.
 *
 * @example
 * processedAtValue();
 */
export const processedAtValue = () => pool.raw('current_timestamp');
