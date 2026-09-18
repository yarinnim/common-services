import type { Model } from 'knexify';
import { type BaseEntity } from 'knexify/types';
import { initModel } from './pool';

export const stockMovementType = {
  RESTOCK: 'restock',
  SALE: 'sale',
  DAMAGE: 'damage',
  TRANSFER: 'transfer',
};

export type StockMovementType =
  typeof stockMovementType[keyof typeof stockMovementType];

/** Stock movement audit row scoped to an application tenant. */
export type StockMovement = BaseEntity & {
  applicationId: number;
  itemId: number;
  warehouseId: number;
  destinationWarehouseId: number | null;
  type: StockMovementType;
  quantity: number;
  reference: string | null;
  note: string | null;
  createdBy: number | null;
};

const TABLE = 'stock_movement';
const table: Model = initModel(TABLE);
export default table;
