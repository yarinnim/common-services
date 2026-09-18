import type { Model } from 'knexify';
import { type BaseEntity } from 'knexify/types';
import { initModel } from './pool';

/** Price row scoped to an application tenant. */
export type Price = BaseEntity & {
  applicationId: number;
  variantId: number;
  currency: string;
  amount: string;
};

const TABLE = 'price';
const table: Model = initModel(TABLE);
export default table;
