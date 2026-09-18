import { type Transaction } from 'knexify';
import { type Paging } from 'knexify/types';
import pool from '../models/pool';
import stockMovementModel, {
  type StockMovement,
  type StockMovementType,
  stockMovementType,
} from '../models/stock-movement.model';
import stockModel, { type Stock } from '../models/stock.model';
import { find as findItem } from '../item/item.service';
import { find as findWarehouse } from '../warehouse/warehouse.service';
import { findByLocation } from '../stock/stock.service';

const SEARCH_FIELDS = ['type', 'reference', 'note'];

export const stockVersionConflict = 'Stock version conflict.';

export type MovementWrite = {
  itemId: number;
  warehouseId: number;
  destinationWarehouseId: number | null;
  type: StockMovementType;
  quantity: number;
  reference: string | null;
  note: string | null;
  version?: number;
};

export type MovementSearch = Paging & {
  q?: string;
};

type MovementPlan = {
  applicationId: number;
  payload: MovementWrite;
  createdBy?: number;
  stock?: Stock;
  destinationStock?: Stock;
};

/**
 * Finds an active stock movement for an application.
 *
 * @example
 * find(1, 2).then((movement) => movement);
 */
export const find = (id: number, applicationId: number) =>
  stockMovementModel().whereActive({ applicationId }).find(id);

/**
 * Searches stock movements for an application.
 *
 * @example
 * searchStockMovements(1, { q: 'sale', page: 1, pageSize: 20 });
 */
export const searchStockMovements = (
  applicationId: number,
  search: MovementSearch,
) => {
  const { q = '', page = 1, pageSize = 20, token } = search;
  return stockMovementModel()
    .whereActive({ applicationId })
    .search(q, SEARCH_FIELDS)
    .paginate({ page, pageSize, token });
};

/**
 * Checks whether a movement type is known.
 *
 * @example
 * isStockMovementType('restock');
 */
export const isStockMovementType = (value: string): boolean =>
  Object.values(stockMovementType).includes(value as StockMovementType);

/**
 * Requires an item owned by the application.
 *
 * @example
 * requireItem(1, 2);
 */
const requireItem = (applicationId: number, itemId: number) =>
  findItem(itemId, applicationId).then((item) => {
    if (!item) throw new Error('Item not found.');
    return item;
  });

/**
 * Requires a warehouse owned by the application.
 *
 * @example
 * requireWarehouse(1, 2);
 */
const requireWarehouse = (applicationId: number, warehouseId: number) =>
  findWarehouse(warehouseId, applicationId).then((warehouse) => {
    if (!warehouse) throw new Error('Warehouse not found.');
    return warehouse;
  });

/**
 * Computes the source warehouse quantity after a movement.
 *
 * @example
 * nextSourceQuantity(stock, payload);
 */
const nextSourceQuantity = (
  stock: Stock | undefined,
  payload: MovementWrite,
) => {
  const current = stock ? stock.quantity : 0;
  const { type, quantity } = payload;
  if (type === stockMovementType.RESTOCK) return current + quantity;
  const next = current - quantity;
  if (next < 0) throw new Error('Insufficient stock quantity.');
  return next;
};

/**
 * Updates stock using the current version, or fails on conflict.
 *
 * @example
 * patchStock(stock, 10, trx);
 */
const patchStock = (stock: Stock, quantity: number, trx: Transaction) =>
  stockModel(trx)
    .whereActive({ id: stock.id, version: stock.version })
    .update({
      quantity,
      version: stock.version + 1,
      updatedAt: pool.raw('current_timestamp'),
    })
    .then((updated: number) => {
      if (!updated) throw new Error(stockVersionConflict);
      return updated;
    });

/**
 * Creates a stock row when none exists yet.
 *
 * @example
 * createStock(plan, 5, trx);
 */
const createStock = (
  plan: MovementPlan,
  quantity: number,
  trx: Transaction,
) => {
  const { applicationId, payload } = plan;
  const { itemId, warehouseId } = payload;
  return stockModel(trx).create({
    applicationId,
    itemId,
    warehouseId,
    quantity,
    version: 1,
  });
};

/**
 * Saves source warehouse stock for a movement.
 *
 * @example
 * saveSourceStock(plan, trx);
 */
const saveSourceStock = (plan: MovementPlan, trx: Transaction) => {
  const { payload, stock } = plan;
  if (payload.version && stock && payload.version !== stock.version) {
    throw new Error(stockVersionConflict);
  }
  const quantity = nextSourceQuantity(stock, payload);
  if (!stock) {
    return createStock(plan, quantity, trx).then(() => undefined);
  }
  return patchStock(stock, quantity, trx).then(() => undefined);
};

/**
 * Saves destination warehouse stock for a transfer.
 *
 * @example
 * saveDestinationStock(plan, trx);
 */
const saveDestinationStock = (plan: MovementPlan, trx: Transaction) => {
  const { applicationId, payload, destinationStock } = plan;
  if (payload.type !== stockMovementType.TRANSFER) {
    return Promise.resolve(undefined);
  }
  const { destinationWarehouseId, itemId, quantity } = payload;
  if (!destinationWarehouseId) {
    throw new Error('Destination warehouse is required.');
  }
  if (!destinationStock) {
    return stockModel(trx).create({
      applicationId,
      itemId,
      warehouseId: destinationWarehouseId,
      quantity,
      version: 1,
    }).then(() => undefined);
  }
  return patchStock(
    destinationStock,
    destinationStock.quantity + quantity,
    trx,
  ).then(() => undefined);
};

/**
 * Inserts the audit row for a stock movement.
 *
 * @example
 * insertMovement(plan, trx);
 */
const insertMovement = (plan: MovementPlan, trx: Transaction) => {
  const { applicationId, payload, createdBy } = plan;
  const {
    itemId,
    warehouseId,
    destinationWarehouseId,
    type,
    quantity,
    reference,
    note,
  } = payload;
  return stockMovementModel(trx).create({
    applicationId,
    itemId,
    warehouseId,
    destinationWarehouseId,
    type,
    quantity,
    reference,
    note,
    createdBy: createdBy || null,
  });
};

/**
 * Loads item, warehouses, and current stock rows for a movement.
 *
 * @example
 * loadPlan(1, payload, 9);
 */
const loadPlan = (
  applicationId: number,
  payload: MovementWrite,
  createdBy?: number,
): Promise<MovementPlan> => {
  const { itemId, warehouseId, destinationWarehouseId, type } = payload;
  return requireItem(applicationId, itemId)
    .then(() => requireWarehouse(applicationId, warehouseId))
    .then(() => {
      if (type !== stockMovementType.TRANSFER) return null;
      return requireWarehouse(applicationId, destinationWarehouseId as number);
    })
    .then(() => findByLocation(applicationId, itemId, warehouseId))
    .then((stock: Stock | undefined) => {
      if (type !== stockMovementType.TRANSFER) {
        return { applicationId, payload, createdBy, stock };
      }
      return findByLocation(
        applicationId,
        itemId,
        destinationWarehouseId as number,
      ).then((destinationStock: Stock | undefined) => ({
        applicationId,
        payload,
        createdBy,
        stock,
        destinationStock,
      }));
    });
};

/**
 * Records a stock movement and updates warehouse quantities.
 *
 * @example
 * createStockMovement(1, payload, 9);
 */
export const createStockMovement = (
  applicationId: number,
  payload: MovementWrite,
  createdBy?: number,
) => loadPlan(applicationId, payload, createdBy)
  .then((plan: MovementPlan) => pool.transaction((trx: Transaction) =>
    saveSourceStock(plan, trx)
      .then(() => saveDestinationStock(plan, trx))
      .then(() => insertMovement(plan, trx))));

export type { StockMovement };
