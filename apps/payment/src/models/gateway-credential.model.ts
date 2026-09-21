import type { Model } from 'knexify';
import { type BaseEntity } from 'knexify/types';
import { initModel } from './pool';
import type { JsonObject } from './common.type';

/** Gateway credential vault row returned from the database. */
export type GatewayCredential = BaseEntity & {
  applicationId: number;
  provider: string;
  publishableKey?: string | null;
  encryptedSecret: string;
  encryptedWebhookSecret?: string | null;
  encryptionMeta: JsonObject;
  setting: JsonObject;
};

const TABLE = 'gateway_credential';
const table: Model = initModel(TABLE);
export default table;
