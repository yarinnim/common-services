import { type Paging } from 'knexify/types';
import variantModel, { type Variant } from '../models/variant.model';
import type { JsonObject } from '../models/common.type';
import { find as findProduct } from '../product/product.service';
import { applyListSort } from '../utils/list-query';

const SEARCH_FIELDS = ['sku'];
const VARIANT_SORT = {
  sku: 'sku',
  createdAt: 'createdAt',
  id: 'id',
};

export type VariantWrite = {
  productId: number;
  sku: string;
  options: JsonObject;
};

export type VariantSearch = Paging & {
  q?: string;
  productId?: number;
  sort?: string;
  direction?: string;
};

/**
 * Finds an active variant for an application.
 *
 * @example
 * find(1, 2).then((variant) => variant);
 */
export const find = (id: number, applicationId: number) =>
  variantModel().whereActive({ applicationId }).find(id);

/**
 * Searches variants for an application.
 *
 * @example
 * searchVariants(1, { q: 'SKU', productId: 3, page: 1, pageSize: 20 });
 */
export const searchVariants = (
  applicationId: number,
  search: VariantSearch,
) => {
  const {
    q = '',
    page = 1,
    pageSize = 20,
    token,
    productId,
    sort,
    direction,
  } = search;
  const filters = {
    applicationId,
    ...(productId ? { productId } : {}),
  };
  const query = variantModel()
    .whereActive(filters)
    .search(q, SEARCH_FIELDS);
  return applyListSort(query, {
    sort,
    direction,
    allowed: VARIANT_SORT,
  }).paginate({ page, pageSize, token });
};

/**
 * Ensures a product belongs to the same application.
 *
 * @example
 * ensureProduct(1, 4);
 */
const ensureProduct = (applicationId: number, productId: number) =>
  findProduct(productId, applicationId).then((product) => {
    if (!product) throw new Error('Product not found.');
    return product;
  });

/**
 * Creates a variant for an application.
 *
 * @example
 * createVariant(1, { productId: 2, sku: 'A1', options: { size: 'M' } });
 */
export const createVariant = (
  applicationId: number,
  payload: VariantWrite,
) => {
  const { productId, sku, options } = payload;
  return ensureProduct(applicationId, productId)
    .then(() => variantModel().create({
      applicationId,
      productId,
      sku,
      options,
    }))
    .then((created: { id: number }) => find(created.id, applicationId));
};

/**
 * Updates a variant and returns the row.
 *
 * @example
 * updateVariant(1, 2, payload);
 */
export const updateVariant = (
  id: number,
  applicationId: number,
  payload: VariantWrite,
) => {
  const { productId, sku, options } = payload;
  return ensureProduct(applicationId, productId)
    .then(() => variantModel().patch(id, { productId, sku, options }))
    .then(() => find(id, applicationId));
};

/**
 * Soft-deletes a variant.
 *
 * @example
 * removeVariant(1);
 */
export const removeVariant = (id: number) => variantModel().remove(id);

export type { Variant };
