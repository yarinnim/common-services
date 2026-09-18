import { type QueryBuilder } from 'knexify';

export type SortInput = {
  sort?: string;
  direction?: string;
  allowed: Record<string, string>;
};

/**
 * Applies a whitelisted orderBy before paginate.
 *
 * @example
 * applyListSort(query, { sort: 'name', direction: 'asc', allowed });
 */
export const applyListSort = (query: QueryBuilder, input: SortInput) => {
  const { sort, direction, allowed } = input;
  const field = allowed[`${sort || ''}`] || allowed.createdAt;
  const order = direction === 'asc' ? 'asc' : 'desc';
  return query.orderBy(field, order);
};

/**
 * Parses an optional sort field from a query value.
 *
 * @example
 * parseSortField(req.query.sort);
 */
export const parseSortField = (value: unknown): string | undefined => {
  const sort = `${value || ''}`.trim();
  return sort || undefined;
};

/**
 * Parses an optional asc/desc sort direction.
 *
 * @example
 * parseSortDirection(req.query.direction);
 */
export const parseSortDirection = (value: unknown): string | undefined => {
  const direction = `${value || ''}`.trim().toLowerCase();
  if (!direction) return undefined;
  if (direction !== 'asc' && direction !== 'desc') {
    throw new Error('Invalid sort direction.');
  }
  return direction;
};
