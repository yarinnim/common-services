import type { WebhookEvent } from '../models/webhook-event.model';
import type { Payment } from '../models/payment.model';
import type { GatewayCredential } from '../models/gateway-credential.model';
import {
  webhookStatus,
  auditSource,
} from '../config';
import {
  findByProvider,
  resolveGatewayCredential,
  type ResolvedGatewayCredential,
} from '../gateway-credential/gateway-credential.service';
import { resolvePaymentProvider } from '../payment/provider/resolve-provider';
import { createPaymentAudit } from '../utils/payment-audit';
import {
  type WebhookIngestInput,
  createReceivedEvent,
  patchWebhookEvent,
  applyPaymentSucceeded,
  readProviderReference,
  processedAtValue,
} from './webhook.helpers';

/**
 * Resolves tenant credentials and verifies the webhook signature.
 *
 * @example
 * verifyWebhook(input);
 */
const verifyWebhook = (input: WebhookIngestInput) => {
  const { applicationId, provider, rawBody, signature } = input;
  return findByProvider(applicationId, provider)
    .then((row: GatewayCredential | undefined) => {
      if (!row) throw new Error('Gateway credential not found.');
      return resolveGatewayCredential(row.id, applicationId);
    })
    .then((credential: ResolvedGatewayCredential) => {
      if (!credential.webhookSecret) {
        throw new Error('Webhook secret is not configured.');
      }
      const adapter = resolvePaymentProvider(
        credential.provider,
        credential.secretKey,
      );
      const signatureValid = adapter.verifyWebhookSignature(
        rawBody,
        signature,
        credential.webhookSecret,
      );
      return { credential, signatureValid };
    });
};

/**
 * Applies domain side-effects for a verified webhook event.
 *
 * @example
 * processVerifiedWebhook(event, credential);
 */
const processVerifiedWebhook = (
  event: WebhookEvent,
  credential: ResolvedGatewayCredential,
) => {
  const { applicationId, payload, eventType } = event;
  const providerReference = readProviderReference(payload);
  const isSuccess = eventType.includes('succeeded')
    || eventType.includes('captured')
    || eventType === 'payment.succeeded';

  if (!isSuccess || !providerReference) {
    return patchWebhookEvent(event.id, applicationId, {
      status: webhookStatus.PROCESSED,
      processedAt: processedAtValue(),
    }).then(() => event);
  }

  return applyPaymentSucceeded(applicationId, providerReference)
    .then((payment: Payment | undefined) => createPaymentAudit({
      applicationId,
      paymentId: payment ? payment.id : undefined,
      action: 'webhook.payment_succeeded',
      source: auditSource.WEBHOOK,
      requestPayload: payload,
      responsePayload: {
        providerReference,
        credentialId: credential.id,
      },
    }).then(() => patchWebhookEvent(event.id, applicationId, {
      status: webhookStatus.PROCESSED,
      paymentId: payment ? payment.id : null,
      processedAt: processedAtValue(),
    })).then(() => event));
};

/**
 * Ingests an inbound gateway webhook for a tenant and provider.
 *
 * @example
 * ingestWebhook(input);
 */
export const ingestWebhook = (input: WebhookIngestInput) => verifyWebhook(input)
  .then((verified) => {
    const { credential, signatureValid } = verified;
    if (!signatureValid) {
      return createReceivedEvent(input, false)
        .then((event: WebhookEvent) => patchWebhookEvent(
          event.id,
          input.applicationId,
          {
            status: webhookStatus.DEAD_LETTER,
            errorMessage: 'Invalid webhook signature.',
            processedAt: processedAtValue(),
          },
        ).then(() => {
          throw new Error('Invalid webhook signature.');
        }));
    }
    return createReceivedEvent(input, true)
      .then((event: WebhookEvent) => processVerifiedWebhook(event, credential)
        .catch((error: Error) => patchWebhookEvent(
          event.id,
          input.applicationId,
          {
            status: webhookStatus.FAILED,
            errorMessage: error.message,
            processedAt: processedAtValue(),
          },
        ).then(() => {
          throw error;
        })));
  });
