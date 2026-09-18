import { type Paging } from 'knexify/types';
import stockModel, { type Stock } from '../models/stock.model';

const SEARCH_FIELDS: string[] = [];

export type StockSearch = Paging & {
  q?: string;
  itemId?: number;
  warehouseId?: number;
};

/**
 * Finds an active stock row for an application.
 *
 * @example
 * find(1, 2).then((stock) => stock);
 */
export const find = (id: number, applicationId: number) =>
  stockModel().whereActive({ applicationId }).find(id);

/**
 * Finds stock for an item in a warehouse.
 *
 * @example
 * findByLocation(1, 2, 3);
 */
export const findByLocation = (
  applicationId: number,
  itemId: number,
  warehouseId: number,
) => stockModel()
  .whereActive({ applicationId, itemId, warehouseId })
  .first();

/**
 * Searches stock rows for an application.
 *
 * @example
 * searchStocks(1, { itemId: 2, page: 1, pageSize: 20 });
 */
export const searchStocks = (applicationId: number, search: StockSearch) => {
  const { q = '', page = 1, pageSize = 20, token, itemId, warehouseId } = search;
  const filters = {
    applicationId,
    ...(itemId ? { itemId } : {}),
    ...(warehouseId ? { warehouseId } : {}),
  };
  return stockModel()
    .whereActive(filters)
    .search(q, SEARCH_FIELDS)
    .paginate({ page, pageSize, token });
};

export type { Stock };
