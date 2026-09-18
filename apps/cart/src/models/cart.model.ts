import type { Model } from 'knexify';
import { type BaseEntity } from 'knexify/types';
import { initModel } from './pool';

export const cartStatus = {
  ACTIVE: 'active',
  MERGED: 'merged',
};

/** Cart row scoped to an application tenant. */
export type Cart = BaseEntity & {
  applicationId: number;
  userId: number | null;
  sessionId: string | null;
  status: string;
  expiresAt: Date | null;
};

const TABLE = 'cart';
const table: Model = initModel(TABLE);
export default table;
