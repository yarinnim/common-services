import type { Model } from 'knexify';
import { type BaseEntity } from 'knexify/types';
import { initModel } from './pool';
import type { JsonObject } from './common.type';

/** Item catalog row scoped to an application tenant. */
export type Item = BaseEntity & {
  applicationId: number;
  categoryId: number | null;
  sku: string;
  name: string;
  description: string | null;
  attributes: JsonObject;
};

const TABLE = 'item';
const table: Model = initModel(TABLE);
export default table;
