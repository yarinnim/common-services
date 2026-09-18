import type { Model } from 'knexify';
import { type BaseEntity } from 'knexify/types';
import { initModel } from './pool';

/** Stock quantity row for one item in one warehouse. */
export type Stock = BaseEntity & {
  applicationId: number;
  itemId: number;
  warehouseId: number;
  quantity: number;
  version: number;
};

const TABLE = 'stock';
const table: Model = initModel(TABLE);
export default table;
