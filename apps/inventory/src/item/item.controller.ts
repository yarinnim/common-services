import { type Response } from 'xpref';
import logger from '../log-client';
import { type ApplicationRequest } from '../middleware/validate-application.middleware';
import { type ItemRequest } from './item.middleware';
import {
  type ItemSearch,
  type ItemWrite,
  searchItems,
  createItem,
  updateItem,
  removeItem,
} from './item.service';

/**
 * Validates GET /items query parameters.
 *
 * @example
 * validateGetAction(req);
 */
const validateGetAction = (req: ApplicationRequest): ItemSearch => {
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
 * Validates POST and PUT item bodies.
 *
 * @example
 * validateWriteAction(req);
 */
const validateWriteAction = (req: ApplicationRequest): ItemWrite => {
  const { sku, name, description, categoryId, attributes = {} } = req.body || {};
  if (!`${sku || ''}`.trim()) throw new Error('SKU is required.');
  if (!`${name || ''}`.trim()) throw new Error('Name is required.');
  return {
    sku: `${sku}`.trim(),
    name: `${name}`.trim(),
    description: description ? `${description}` : null,
    categoryId: parseOptionalId(categoryId),
    attributes: attributes && typeof attributes === 'object' ? attributes : {},
  };
};

/**
 * Lists items for the authenticated application.
 *
 * @example
 * GET /items
 */
export const getAction = (
  req: ApplicationRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validateGetAction(req))
  .then((search: ItemSearch) => {
    const { application } = req;
    if (!application) throw new Error('Application not found.');
    return searchItems(application.id, search);
  })
  .then((result) => res.json(result))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Creates an item for the authenticated application.
 *
 * @example
 * POST /items
 */
export const postAction = (
  req: ApplicationRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validateWriteAction(req))
  .then((payload: ItemWrite) => {
    const { application } = req;
    if (!application) throw new Error('Application not found.');
    return createItem(application.id, payload);
  })
  .then((item) => res.json(item))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Returns one item.
 *
 * @example
 * GET /items/:id
 */
export const detailAction = (
  req: ItemRequest,
  res: Response,
): Promise<Response> => Promise.resolve(res.json(req.item));

/**
 * Updates an item.
 *
 * @example
 * PUT /items/:id
 */
export const updateAction = (
  req: ItemRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validateWriteAction(req))
  .then((payload: ItemWrite) => {
    const { application, item } = req;
    if (!application || !item) throw new Error('Item not found.');
    return updateItem(item.id, application.id, payload);
  })
  .then((item) => res.json(item))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Soft-deletes an item.
 *
 * @example
 * DELETE /items/:id
 */
export const deleteAction = (
  req: ItemRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => {
    const { item } = req;
    if (!item) throw new Error('Item not found.');
    return removeItem(item.id).then(() => item);
  })
  .then((item) => res.json(item))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });
