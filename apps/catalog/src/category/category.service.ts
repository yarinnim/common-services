import { type Paging } from 'knexify/types';
import categoryModel, { type Category } from '../models/category.model';

const SEARCH_FIELDS = ['name', 'description'];

export type CategoryWrite = {
  parentId: number | null;
  name: string;
  description: string | null;
};

export type CategorySearch = Paging & {
  q?: string;
};

/**
 * Finds an active category for an application.
 *
 * @example
 * find(1, 2).then((category) => category);
 */
export const find = (id: number, applicationId: number) =>
  categoryModel().whereActive({ applicationId }).find(id);

/**
 * Searches categories for an application.
 *
 * @example
 * searchCategories(1, { q: 'shoes', page: 1, pageSize: 20 });
 */
export const searchCategories = (
  applicationId: number,
  search: CategorySearch,
) => {
  const { q = '', page = 1, pageSize = 20, token } = search;
  return categoryModel()
    .whereActive({ applicationId })
    .search(q, SEARCH_FIELDS)
    .paginate({ page, pageSize, token });
};

/**
 * Ensures an optional parent belongs to the same application.
 *
 * @example
 * ensureParent(1, 4);
 */
const ensureParent = (applicationId: number, parentId: number | null) => {
  if (!parentId) return Promise.resolve(null);
  return find(parentId, applicationId).then((category: Category | undefined) => {
    if (!category) throw new Error('Parent category not found.');
    return category;
  });
};

/**
 * Creates a category for an application.
 *
 * @example
 * createCategory(1, { parentId: null, name: 'Shoes', description: null });
 */
export const createCategory = (
  applicationId: number,
  payload: CategoryWrite,
) => {
  const { parentId, name, description } = payload;
  return ensureParent(applicationId, parentId)
    .then(() => categoryModel().create({
      applicationId,
      parentId,
      name,
      description,
    }))
    .then((created: { id: number }) => find(created.id, applicationId));
};

/**
 * Updates a category and returns the row.
 *
 * @example
 * updateCategory(1, 2, { parentId: null, name: 'Shoes', description: null });
 */
export const updateCategory = (
  id: number,
  applicationId: number,
  payload: CategoryWrite,
) => {
  const { parentId, name, description } = payload;
  if (parentId === id) throw new Error('Category cannot be its own parent.');
  return ensureParent(applicationId, parentId)
    .then(() => categoryModel().patch(id, { parentId, name, description }))
    .then(() => find(id, applicationId));
};

/**
 * Soft-deletes a category.
 *
 * @example
 * removeCategory(1);
 */
export const removeCategory = (id: number) => categoryModel().remove(id);

export type { Category };
