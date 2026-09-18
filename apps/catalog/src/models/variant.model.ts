import type { Model } from 'knexify';
import { type BaseEntity } from 'knexify/types';
import { initModel } from './pool';
import type { JsonObject } from './common.type';

/** Variant row scoped to an application tenant. */
export type Variant = BaseEntity & {
  applicationId: number;
  productId: number;
  sku: string;
  options: JsonObject;
};

const TABLE = 'variant';
const table: Model = initModel(TABLE);
export default table;
