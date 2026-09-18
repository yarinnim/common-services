import { type Paging } from 'knexify/types';
import mediaModel, {
  type Media,
  type MediaKind,
  mediaKind,
} from '../models/media.model';
import { find as findProduct } from '../product/product.service';
import { find as findVariant } from '../variant/variant.service';

const SEARCH_FIELDS = ['url', 'kind'];

export type MediaWrite = {
  productId: number;
  variantId: number | null;
  url: string;
  kind: MediaKind;
};

export type MediaSearch = Paging & {
  q?: string;
  productId?: number;
  variantId?: number;
};

/**
 * Checks whether a media kind is known.
 *
 * @example
 * isMediaKind('image');
 */
export const isMediaKind = (value: string): boolean =>
  Object.values(mediaKind).includes(value as MediaKind);

/**
 * Finds an active media row for an application.
 *
 * @example
 * find(1, 2).then((media) => media);
 */
export const find = (id: number, applicationId: number) =>
  mediaModel().whereActive({ applicationId }).find(id);

/**
 * Searches media rows for an application.
 *
 * @example
 * searchMedia(1, { productId: 3, page: 1, pageSize: 20 });
 */
export const searchMedia = (applicationId: number, search: MediaSearch) => {
  const { q = '', page = 1, pageSize = 20, token, productId, variantId } = search;
  const filters = {
    applicationId,
    ...(productId ? { productId } : {}),
    ...(variantId ? { variantId } : {}),
  };
  return mediaModel()
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
 * Ensures an optional variant belongs to the product and tenant.
 *
 * @example
 * ensureVariant(1, 4, 8);
 */
const ensureVariant = (
  applicationId: number,
  productId: number,
  variantId: number | null,
) => {
  if (!variantId) return Promise.resolve(null);
  return findVariant(variantId, applicationId).then((variant) => {
    if (!variant) throw new Error('Variant not found.');
    if (variant.productId !== productId) {
      throw new Error('Variant does not belong to this product.');
    }
    return variant;
  });
};

/**
 * Creates a media URL mapping for an application.
 *
 * @example
 * createMedia(1, { productId: 2, url: 'https://cdn/a.jpg', kind: 'image' });
 */
export const createMedia = (applicationId: number, payload: MediaWrite) => {
  const { productId, variantId, url, kind } = payload;
  return ensureProduct(applicationId, productId)
    .then(() => ensureVariant(applicationId, productId, variantId))
    .then(() => mediaModel().create({
      applicationId,
      productId,
      variantId,
      url,
      kind,
    }))
    .then((created: { id: number }) => find(created.id, applicationId));
};

/**
 * Updates a media URL mapping and returns the row.
 *
 * @example
 * updateMedia(1, 2, payload);
 */
export const updateMedia = (
  id: number,
  applicationId: number,
  payload: MediaWrite,
) => {
  const { productId, variantId, url, kind } = payload;
  return ensureProduct(applicationId, productId)
    .then(() => ensureVariant(applicationId, productId, variantId))
    .then(() => mediaModel().patch(id, {
      productId,
      variantId,
      url,
      kind,
    }))
    .then(() => find(id, applicationId));
};

/**
 * Soft-deletes a media URL mapping.
 *
 * @example
 * removeMedia(1);
 */
export const removeMedia = (id: number) => mediaModel().remove(id);

export type { Media, MediaKind };
