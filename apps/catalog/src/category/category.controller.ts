import { type Response } from 'xpref';
import logger from '../log-client';
import { type ApplicationRequest } from '../middleware/validate-application.middleware';
import { type CategoryRequest } from './category.middleware';
import {
  type Category,
  type CategorySearch,
  type CategoryWrite,
  searchCategories,
  createCategory,
  updateCategory,
  removeCategory,
} from './category.service';

/**
 * Validates GET /categories query parameters.
 *
 * @example
 * validateGetAction(req);
 */
const validateGetAction = (req: ApplicationRequest): CategorySearch => {
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
 * parseOptionalId(req.body.parentId);
 */
const parseOptionalId = (value: unknown): number | null => {
  if (value === undefined || value === null || value === '') return null;
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new Error('Invalid parent id.');
  return id;
};

/**
 * Validates POST and PUT category bodies.
 *
 * @example
 * validateWriteAction(req);
 */
const validateWriteAction = (req: ApplicationRequest): CategoryWrite => {
  const { name, description, parentId } = req.body || {};
  if (!`${name || ''}`.trim()) throw new Error('Name is required.');
  return {
    parentId: parseOptionalId(parentId),
    name: `${name}`.trim(),
    description: description ? `${description}` : null,
  };
};

/**
 * Lists categories for the authenticated application.
 *
 * @example
 * GET /categories
 */
export const getAction = (
  req: ApplicationRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validateGetAction(req))
  .then((search: CategorySearch) => {
    const { application } = req;
    if (!application) throw new Error('Application not found.');
    return searchCategories(application.id, search);
  })
  .then((result) => res.json(result))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Creates a category for the authenticated application.
 *
 * @example
 * POST /categories
 */
export const postAction = (
  req: ApplicationRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validateWriteAction(req))
  .then((payload: CategoryWrite) => {
    const { application } = req;
    if (!application) throw new Error('Application not found.');
    return createCategory(application.id, payload);
  })
  .then((category) => res.json(category))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Returns one category.
 *
 * @example
 * GET /categories/:id
 */
export const detailAction = (
  req: CategoryRequest,
  res: Response,
): Promise<Response> => Promise.resolve(res.json(req.category));

/**
 * Updates a category.
 *
 * @example
 * PUT /categories/:id
 */
export const updateAction = (
  req: CategoryRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validateWriteAction(req))
  .then((payload: CategoryWrite) => {
    const { application, category } = req;
    if (!application || !category) throw new Error('Category not found.');
    return updateCategory(category.id, application.id, payload);
  })
  .then((category) => res.json(category))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Soft-deletes a category and returns the previous row.
 *
 * @example
 * removeAndReturn(category);
 */
const removeAndReturn = (category: Category) =>
  removeCategory(category.id).then(() => category);

/**
 * Soft-deletes a category.
 *
 * @example
 * DELETE /categories/:id
 */
export const deleteAction = (
  req: CategoryRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => {
    const { category } = req;
    if (!category) throw new Error('Category not found.');
    return removeAndReturn(category);
  })
  .then((category) => res.json(category))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });
