import type { Model } from 'knexify';
import { type BaseEntity } from 'knexify/types';
import { initModel } from './pool';
import type { JsonObject } from './common.type';

/** Product row scoped to an application tenant. */
export type Product = BaseEntity & {
  applicationId: number;
  categoryId: number | null;
  name: string;
  description: string | null;
  attributes: JsonObject;
};

const TABLE = 'product';
const table: Model = initModel(TABLE);
export default table;
