import { type Paging } from 'knexify/types';
import warehouseModel, { type Warehouse } from '../models/warehouse.model';

const SEARCH_FIELDS = ['code', 'name', 'address'];

export type WarehouseWrite = {
  code: string;
  name: string;
  address: string | null;
};

export type WarehouseSearch = Paging & {
  q?: string;
};

/**
 * Finds an active warehouse for an application.
 *
 * @example
 * find(1, 2).then((warehouse) => warehouse);
 */
export const find = (id: number, applicationId: number) =>
  warehouseModel().whereActive({ applicationId }).find(id);

/**
 * Searches warehouses for an application.
 *
 * @example
 * searchWarehouses(1, { q: 'main', page: 1, pageSize: 20 });
 */
export const searchWarehouses = (
  applicationId: number,
  search: WarehouseSearch,
) => {
  const { q = '', page = 1, pageSize = 20, token } = search;
  return warehouseModel()
    .whereActive({ applicationId })
    .search(q, SEARCH_FIELDS)
    .paginate({ page, pageSize, token });
};

/**
 * Creates a warehouse for an application.
 *
 * @example
 * createWarehouse(1, { code: 'WH1', name: 'Main', address: null });
 */
export const createWarehouse = (
  applicationId: number,
  payload: WarehouseWrite,
) => {
  const { code, name, address } = payload;
  return warehouseModel().create({ applicationId, code, name, address });
};

/**
 * Updates a warehouse and returns the row.
 *
 * @example
 * updateWarehouse(1, 2, { code: 'WH1', name: 'Main', address: null });
 */
export const updateWarehouse = (
  id: number,
  applicationId: number,
  payload: WarehouseWrite,
) => {
  const { code, name, address } = payload;
  return warehouseModel()
    .patch(id, { code, name, address })
    .then(() => find(id, applicationId));
};

/**
 * Soft-deletes a warehouse.
 *
 * @example
 * removeWarehouse(1);
 */
export const removeWarehouse = (id: number) => warehouseModel().remove(id);

export type { Warehouse };
