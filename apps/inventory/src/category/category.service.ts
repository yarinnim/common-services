import { type Paging } from 'knexify/types';
import categoryModel, { type Category } from '../models/category.model';

const SEARCH_FIELDS = ['name', 'description'];

export type CategoryWrite = {
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
 * searchCategories(1, { q: 'box', page: 1, pageSize: 20 });
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
 * Creates a category for an application.
 *
 * @example
 * createCategory(1, { name: 'Box', description: null });
 */
export const createCategory = (
  applicationId: number,
  payload: CategoryWrite,
) => {
  const { name, description } = payload;
  return categoryModel().create({ applicationId, name, description });
};

/**
 * Updates a category and returns the row.
 *
 * @example
 * updateCategory(1, 2, { name: 'Box', description: null });
 */
export const updateCategory = (
  id: number,
  applicationId: number,
  payload: CategoryWrite,
) => {
  const { name, description } = payload;
  return categoryModel()
    .patch(id, { name, description })
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
