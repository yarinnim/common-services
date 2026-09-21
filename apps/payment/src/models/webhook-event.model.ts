import type { Model } from 'knexify';
import { type BaseEntity } from 'knexify/types';
import { initModel } from './pool';
import type { JsonObject } from './common.type';

/** Webhook event row returned from the database. */
export type WebhookEvent = BaseEntity & {
  applicationId: number;
  paymentId?: number | null;
  provider: string;
  providerEventId: string;
  eventType: string;
  status: string;
  payload: JsonObject;
  signatureValid: boolean;
  errorMessage?: string | null;
  processedAt?: string | null;
};

const TABLE = 'webhook_event';
const table: Model = initModel(TABLE);
export default table;
