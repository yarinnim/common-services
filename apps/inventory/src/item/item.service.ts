import { type Paging } from 'knexify/types';
import itemModel, { type Item } from '../models/item.model';
import type { JsonObject } from '../models/common.type';
import { find as findCategory } from '../category/category.service';

const SEARCH_FIELDS = ['sku', 'name', 'description'];

export type ItemWrite = {
  sku: string;
  name: string;
  description: string | null;
  categoryId: number | null;
  attributes: JsonObject;
};

export type ItemSearch = Paging & {
  q?: string;
};

/**
 * Finds an active item for an application.
 *
 * @example
 * find(1, 2).then((item) => item);
 */
export const find = (id: number, applicationId: number) =>
  itemModel().whereActive({ applicationId }).find(id);

/**
 * Searches items for an application.
 *
 * @example
 * searchItems(1, { q: 'sku', page: 1, pageSize: 20 });
 */
export const searchItems = (applicationId: number, search: ItemSearch) => {
  const { q = '', page = 1, pageSize = 20, token } = search;
  return itemModel()
    .whereActive({ applicationId })
    .search(q, SEARCH_FIELDS)
    .paginate({ page, pageSize, token });
};

/**
 * Ensures an optional category belongs to the same application.
 *
 * @example
 * ensureCategory(1, 4);
 */
const ensureCategory = (
  applicationId: number,
  categoryId: number | null,
) => {
  if (!categoryId) return Promise.resolve(null);
  return findCategory(categoryId, applicationId)
    .then((category) => {
      if (!category) throw new Error('Category not found.');
      return category;
    });
};

/**
 * Creates an item for an application.
 *
 * @example
 * createItem(1, { sku: 'A1', name: 'Bag', attributes: {} });
 */
export const createItem = (applicationId: number, payload: ItemWrite) => {
  const { sku, name, description, categoryId, attributes } = payload;
  return ensureCategory(applicationId, categoryId)
    .then(() => itemModel().create({
      applicationId,
      sku,
      name,
      description,
      categoryId,
      attributes,
    }));
};

/**
 * Updates an item and returns the row.
 *
 * @example
 * updateItem(1, 2, payload);
 */
export const updateItem = (
  id: number,
  applicationId: number,
  payload: ItemWrite,
) => {
  const { sku, name, description, categoryId, attributes } = payload;
  return ensureCategory(applicationId, categoryId)
    .then(() => itemModel().patch(id, {
      sku,
      name,
      description,
      categoryId,
      attributes,
    }))
    .then(() => find(id, applicationId));
};

/**
 * Soft-deletes an item.
 *
 * @example
 * removeItem(1);
 */
export const removeItem = (id: number) => itemModel().remove(id);

export type { Item };
