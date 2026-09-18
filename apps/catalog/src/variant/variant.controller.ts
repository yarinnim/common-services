import { type Response } from 'xpref';
import logger from '../log-client';
import { type ApplicationRequest } from '../middleware/validate-application.middleware';
import { type VariantRequest } from './variant.middleware';
import {
  type Variant,
  type VariantSearch,
  type VariantWrite,
  searchVariants,
  createVariant,
  updateVariant,
  removeVariant,
} from './variant.service';
import type { JsonObject } from '../models/common.type';
import {
  parseSortDirection,
  parseSortField,
} from '../utils/list-query';

/**
 * Parses an optional positive integer from a query value.
 *
 * @example
 * parseOptionalQueryId(req.query.productId);
 */
const parseOptionalQueryId = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new Error('Invalid product id.');
  return id;
};

/**
 * Validates GET /variants query parameters.
 *
 * @example
 * validateGetAction(req);
 */
const validateGetAction = (req: ApplicationRequest): VariantSearch => {
  const { q, page, pageSize, token, productId, sort, direction } = req.query;
  return {
    q: `${q || ''}`,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 20,
    token: token ? `${token}` : undefined,
    productId: parseOptionalQueryId(productId),
    sort: parseSortField(sort),
    direction: parseSortDirection(direction),
  };
};

/**
 * Parses a required positive integer.
 *
 * @example
 * parseRequiredId(req.body.productId, 'product id');
 */
const parseRequiredId = (value: unknown, label: string): number => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new Error(`Invalid ${label}.`);
  return id;
};

/**
 * Normalizes a JSON object payload.
 *
 * @example
 * parseJsonObject(req.body.options);
 */
const parseJsonObject = (value: unknown): JsonObject => {
  if (!value) return {};
  if (typeof value === 'object' && !Array.isArray(value)) {
    return value as JsonObject;
  }
  throw new Error('Options must be an object.');
};

/**
 * Validates POST and PUT variant bodies.
 *
 * @example
 * validateWriteAction(req);
 */
const validateWriteAction = (req: ApplicationRequest): VariantWrite => {
  const { sku, productId, options = {} } = req.body || {};
  if (!`${sku || ''}`.trim()) throw new Error('SKU is required.');
  return {
    sku: `${sku}`.trim(),
    productId: parseRequiredId(productId, 'product id'),
    options: parseJsonObject(options),
  };
};

/**
 * Lists variants for the authenticated application.
 *
 * @example
 * GET /variants
 */
export const getAction = (
  req: ApplicationRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validateGetAction(req))
  .then((search: VariantSearch) => {
    const { application } = req;
    if (!application) throw new Error('Application not found.');
    return searchVariants(application.id, search);
  })
  .then((result) => res.json(result))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Creates a variant for the authenticated application.
 *
 * @example
 * POST /variants
 */
export const postAction = (
  req: ApplicationRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validateWriteAction(req))
  .then((payload: VariantWrite) => {
    const { application } = req;
    if (!application) throw new Error('Application not found.');
    return createVariant(application.id, payload);
  })
  .then((variant) => res.json(variant))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Returns one variant.
 *
 * @example
 * GET /variants/:id
 */
export const detailAction = (
  req: VariantRequest,
  res: Response,
): Promise<Response> => Promise.resolve(res.json(req.variant));

/**
 * Updates a variant.
 *
 * @example
 * PUT /variants/:id
 */
export const updateAction = (
  req: VariantRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validateWriteAction(req))
  .then((payload: VariantWrite) => {
    const { application, variant } = req;
    if (!application || !variant) throw new Error('Variant not found.');
    return updateVariant(variant.id, application.id, payload);
  })
  .then((variant) => res.json(variant))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Soft-deletes a variant and returns the previous row.
 *
 * @example
 * removeAndReturn(variant);
 */
const removeAndReturn = (variant: Variant) =>
  removeVariant(variant.id).then(() => variant);

/**
 * Soft-deletes a variant.
 *
 * @example
 * DELETE /variants/:id
 */
export const deleteAction = (
  req: VariantRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => {
    const { variant } = req;
    if (!variant) throw new Error('Variant not found.');
    return removeAndReturn(variant);
  })
  .then((variant) => res.json(variant))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });
