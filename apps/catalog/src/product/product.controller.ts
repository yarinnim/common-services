import { type Response } from 'xpref';
import logger from '../log-client';
import { type ApplicationRequest } from '../middleware/validate-application.middleware';
import { type ProductRequest } from './product.middleware';
import {
  type Product,
  type ProductSearch,
  type ProductWrite,
  searchProducts,
  createProduct,
  updateProduct,
  removeProduct,
} from './product.service';
import type { JsonObject } from '../models/common.type';

/**
 * Validates GET /products query parameters.
 *
 * @example
 * validateGetAction(req);
 */
const validateGetAction = (req: ApplicationRequest): ProductSearch => {
  const { q, page, pageSize, token } = req.query;
  return {
    q: `${q || ''}`,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 20,
    token: token ? `${token}` : undefined,
  };
};

/**
 * Parses an optional positive integer.
 *
 * @example
 * parseOptionalId(req.body.categoryId);
 */
const parseOptionalId = (value: unknown): number | null => {
  if (value === undefined || value === null || value === '') return null;
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new Error('Invalid category id.');
  return id;
};

/**
 * Normalizes a JSON object payload.
 *
 * @example
 * parseJsonObject(req.body.attributes);
 */
const parseJsonObject = (value: unknown): JsonObject => {
  if (!value) return {};
  if (typeof value === 'object' && !Array.isArray(value)) {
    return value as JsonObject;
  }
  throw new Error('Attributes must be an object.');
};

/**
 * Validates POST and PUT product bodies.
 *
 * @example
 * validateWriteAction(req);
 */
const validateWriteAction = (req: ApplicationRequest): ProductWrite => {
  const { name, description, categoryId, attributes = {} } = req.body || {};
  if (!`${name || ''}`.trim()) throw new Error('Name is required.');
  return {
    name: `${name}`.trim(),
    description: description ? `${description}` : null,
    categoryId: parseOptionalId(categoryId),
    attributes: parseJsonObject(attributes),
  };
};

/**
 * Lists products for the authenticated application.
 *
 * @example
 * GET /products
 */
export const getAction = (
  req: ApplicationRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validateGetAction(req))
  .then((search: ProductSearch) => {
    const { application } = req;
    if (!application) throw new Error('Application not found.');
    return searchProducts(application.id, search);
  })
  .then((result) => res.json(result))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Creates a product for the authenticated application.
 *
 * @example
 * POST /products
 */
export const postAction = (
  req: ApplicationRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validateWriteAction(req))
  .then((payload: ProductWrite) => {
    const { application } = req;
    if (!application) throw new Error('Application not found.');
    return createProduct(application.id, payload);
  })
  .then((product) => res.json(product))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Returns one product.
 *
 * @example
 * GET /products/:id
 */
export const detailAction = (
  req: ProductRequest,
  res: Response,
): Promise<Response> => Promise.resolve(res.json(req.product));

/**
 * Updates a product.
 *
 * @example
 * PUT /products/:id
 */
export const updateAction = (
  req: ProductRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validateWriteAction(req))
  .then((payload: ProductWrite) => {
    const { application, product } = req;
    if (!application || !product) throw new Error('Product not found.');
    return updateProduct(product.id, application.id, payload);
  })
  .then((product) => res.json(product))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Soft-deletes a product and its variants, then returns the product.
 *
 * @example
 * removeAndReturn(applicationId, product);
 */
const removeAndReturn = (applicationId: number, product: Product) =>
  removeProduct(product.id, applicationId).then(() => product);

/**
 * Soft-deletes a product.
 *
 * @example
 * DELETE /products/:id
 */
export const deleteAction = (
  req: ProductRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => {
    const { application, product } = req;
    if (!application || !product) throw new Error('Product not found.');
    return removeAndReturn(application.id, product);
  })
  .then((product) => res.json(product))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });
