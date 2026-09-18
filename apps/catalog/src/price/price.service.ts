import { type Paging } from 'knexify/types';
import priceModel, { type Price } from '../models/price.model';
import { find as findVariant } from '../variant/variant.service';

const SEARCH_FIELDS = ['currency'];

export type PriceWrite = {
  variantId: number;
  currency: string;
  amount: string;
};

export type PriceSearch = Paging & {
  q?: string;
  variantId?: number;
};

/**
 * Finds an active price for an application.
 *
 * @example
 * find(1, 2).then((price) => price);
 */
export const find = (id: number, applicationId: number) =>
  priceModel().whereActive({ applicationId }).find(id);

/**
 * Searches prices for an application.
 *
 * @example
 * searchPrices(1, { q: 'USD', variantId: 3, page: 1, pageSize: 20 });
 */
export const searchPrices = (applicationId: number, search: PriceSearch) => {
  const { q = '', page = 1, pageSize = 20, token, variantId } = search;
  const filters = {
    applicationId,
    ...(variantId ? { variantId } : {}),
  };
  return priceModel()
    .whereActive(filters)
    .search(q, SEARCH_FIELDS)
    .paginate({ page, pageSize, token });
};

/**
 * Ensures a variant belongs to the same application.
 *
 * @example
 * ensureVariant(1, 4);
 */
const ensureVariant = (applicationId: number, variantId: number) =>
  findVariant(variantId, applicationId).then((variant) => {
    if (!variant) throw new Error('Variant not found.');
    return variant;
  });

/**
 * Creates a price for an application.
 *
 * @example
 * createPrice(1, { variantId: 2, currency: 'USD', amount: '10.00' });
 */
export const createPrice = (applicationId: number, payload: PriceWrite) => {
  const { variantId, currency, amount } = payload;
  return ensureVariant(applicationId, variantId)
    .then(() => priceModel().create({
      applicationId,
      variantId,
      currency,
      amount,
    }))
    .then((created: { id: number }) => find(created.id, applicationId));
};

/**
 * Updates a price and returns the row.
 *
 * @example
 * updatePrice(1, 2, payload);
 */
export const updatePrice = (
  id: number,
  applicationId: number,
  payload: PriceWrite,
) => {
  const { variantId, currency, amount } = payload;
  return ensureVariant(applicationId, variantId)
    .then(() => priceModel().patch(id, { variantId, currency, amount }))
    .then(() => find(id, applicationId));
};

/**
 * Soft-deletes a price.
 *
 * @example
 * removePrice(1);
 */
export const removePrice = (id: number) => priceModel().remove(id);

export type { Price };
