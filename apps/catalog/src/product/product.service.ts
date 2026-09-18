import { type QueryBuilder, type Transaction } from 'knexify';
import { type Paging } from 'knexify/types';
import pool from '../models/pool';
import productModel, { type Product } from '../models/product.model';
import variantModel, { type Variant } from '../models/variant.model';
import type { JsonObject } from '../models/common.type';
import { find as findCategory } from '../category/category.service';
import { applyListSort } from '../utils/list-query';

const SEARCH_FIELDS = ['name', 'description'];
const SKU_SEARCH_FIELDS = ['sku'];
const PRODUCT_SORT = {
  name: 'name',
  createdAt: 'createdAt',
  id: 'id',
};

export type ProductWrite = {
  categoryId: number | null;
  name: string;
  description: string | null;
  attributes: JsonObject;
};

export type ProductSearch = Paging & {
  q?: string;
  categoryId?: number;
  attributeKey?: string;
  attributeValue?: string;
  sort?: string;
  direction?: string;
};

type AttributeFilter = {
  attributeKey?: string;
  attributeValue?: string;
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
 * Builds a subquery of product ids whose SKU matches q.
 *
 * @example
 * skuProductQuery(1, 'A1');
 */
const skuProductQuery = (applicationId: number, q: string) =>
  variantModel()
    .whereActive({ applicationId })
    .search(q, SKU_SEARCH_FIELDS)
    .select('productId');

/**
 * Matches product name, description, or variant SKU.
 *
 * @example
 * applyProductTextSearch(query, 1, 'shoe');
 */
const applyProductTextSearch = (
  query: QueryBuilder,
  applicationId: number,
  q: string,
) => {
  if (!q.trim()) return query;
  return query.where((builder: QueryBuilder) => {
    builder.search(q, SEARCH_FIELDS);
    builder.orWhereIn('id', skuProductQuery(applicationId, q));
  });
};

/**
 * Filters products by JSON attribute key and optional value.
 *
 * @example
 * applyAttributeFilter(query, { attributeKey: 'color', attributeValue: 'red' });
 */
const applyAttributeFilter = (
  query: QueryBuilder,
  filter: AttributeFilter,
) => {
  const { attributeKey, attributeValue } = filter;
  if (!attributeKey) return query;
  if (!attributeValue) {
    return query.whereRaw('jsonb_exists(attributes, ?)', [attributeKey]);
  }
  return query.whereRaw('attributes ->> ? = ?', [attributeKey, attributeValue]);
};

/**
 * Searches products for an application.
 *
 * @example
 * searchProducts(1, { q: 'shoe', categoryId: 2, page: 1, pageSize: 20 });
 */
export const searchProducts = (
  applicationId: number,
  search: ProductSearch,
) => {
  const {
    q = '',
    page = 1,
    pageSize = 20,
    token,
    categoryId,
    attributeKey,
    attributeValue,
    sort,
    direction,
  } = search;
  const filters = {
    applicationId,
    ...(categoryId ? { categoryId } : {}),
  };
  const withText = applyProductTextSearch(
    productModel().whereActive(filters),
    applicationId,
    q,
  );
  const withAttributes = applyAttributeFilter(withText, {
    attributeKey,
    attributeValue,
  });
  return applyListSort(withAttributes, {
    sort,
    direction,
    allowed: PRODUCT_SORT,
  }).paginate({ page, pageSize, token });
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
