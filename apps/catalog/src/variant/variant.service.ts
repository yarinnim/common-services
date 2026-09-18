import { type Paging } from 'knexify/types';
import variantModel, { type Variant } from '../models/variant.model';
import type { JsonObject } from '../models/common.type';
import { find as findProduct } from '../product/product.service';

const SEARCH_FIELDS = ['sku'];

export type VariantWrite = {
  productId: number;
  sku: string;
  options: JsonObject;
};

export type VariantSearch = Paging & {
  q?: string;
  productId?: number;
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
  const { q = '', page = 1, pageSize = 20, token, productId } = search;
  const filters = {
    applicationId,
    ...(productId ? { productId } : {}),
  };
  return variantModel()
    .whereActive(filters)
    .search(q, SEARCH_FIELDS)
    .paginate({ page, pageSize, token });
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
