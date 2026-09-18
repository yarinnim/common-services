import { type Transaction } from 'knexify';
import { type Paging } from 'knexify/types';
import pool from '../models/pool';
import productModel, { type Product } from '../models/product.model';
import variantModel, { type Variant } from '../models/variant.model';
import type { JsonObject } from '../models/common.type';
import { find as findCategory } from '../category/category.service';

const SEARCH_FIELDS = ['name', 'description'];

export type ProductWrite = {
  categoryId: number | null;
  name: string;
  description: string | null;
  attributes: JsonObject;
};

export type ProductSearch = Paging & {
  q?: string;
};

/**
 * Finds an active product for an application.
 *
 * @example
 * find(1, 2).then((product) => product);
 */
export const find = (id: number, applicationId: number) =>
  productModel().whereActive({ applicationId }).find(id);

/**
 * Searches products for an application.
 *
 * @example
 * searchProducts(1, { q: 'shoe', page: 1, pageSize: 20 });
 */
export const searchProducts = (
  applicationId: number,
  search: ProductSearch,
) => {
  const { q = '', page = 1, pageSize = 20, token } = search;
  return productModel()
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
 * Creates a product for an application.
 *
 * @example
 * createProduct(1, { name: 'Shoe', attributes: {}, categoryId: null });
 */
export const createProduct = (
  applicationId: number,
  payload: ProductWrite,
) => {
  const { categoryId, name, description, attributes } = payload;
  return ensureCategory(applicationId, categoryId)
    .then(() => productModel().create({
      applicationId,
      categoryId,
      name,
      description,
      attributes,
    }))
    .then((created: { id: number }) => find(created.id, applicationId));
};

/**
 * Updates a product and returns the row.
 *
 * @example
 * updateProduct(1, 2, payload);
 */
export const updateProduct = (
  id: number,
  applicationId: number,
  payload: ProductWrite,
) => {
  const { categoryId, name, description, attributes } = payload;
  return ensureCategory(applicationId, categoryId)
    .then(() => productModel().patch(id, {
      categoryId,
      name,
      description,
      attributes,
    }))
    .then(() => find(id, applicationId));
};

/**
 * Soft-deletes variants in order, then the next remaining row.
 *
 * @example
 * removeVariantRows(variants, trx);
 */
const removeVariantRows = (
  variants: Variant[],
  trx: Transaction,
): Promise<unknown> => {
  if (!variants.length) return Promise.resolve(undefined);
  const [variant, ...rest] = variants;
  return variantModel(trx)
    .remove(variant.id)
    .then(() => removeVariantRows(rest, trx));
};

/**
 * Soft-deletes a product and its variants.
 *
 * @example
 * removeProduct(1, 2);
 */
export const removeProduct = (id: number, applicationId: number) =>
  variantModel()
    .whereActive({ applicationId, productId: id })
    .then((variants: Variant[]) => pool.transaction((trx: Transaction) =>
      removeVariantRows(variants || [], trx)
        .then(() => productModel(trx).remove(id))));

export type { Product };
