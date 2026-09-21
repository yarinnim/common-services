import type { Model } from 'knexify';
import { type BaseEntity } from 'knexify/types';
import { initModel } from './pool';
import type { JsonObject } from './common.type';

/** Payment audit row returned from the database. */
export type PaymentAudit = BaseEntity & {
  applicationId: number;
  paymentId?: number | null;
  action: string;
  source: string;
  requestPayload: JsonObject;
  responsePayload: JsonObject;
};

const TABLE = 'payment_audit';
const table: Model = initModel(TABLE);
export default table;
