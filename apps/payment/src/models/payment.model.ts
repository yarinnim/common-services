import type { Model } from 'knexify';
import { type BaseEntity } from 'knexify/types';
import { initModel } from './pool';
import type { JsonObject } from './common.type';

/** Payment transaction row returned from the database. */
export type Payment = BaseEntity & {
  applicationId: number;
  gatewayCredentialId: number;
  parentPaymentId?: number | null;
  idempotencyKey?: string | null;
  action: string;
  status: string;
  amount: number;
  currency: string;
  provider: string;
  providerReference?: string | null;
  orderReference?: string | null;
  customerId?: number | null;
  failureCode?: string | null;
  failureMessage?: string | null;
  metadata: JsonObject;
};

const TABLE = 'payment';
const table: Model = initModel(TABLE);
export default table;
