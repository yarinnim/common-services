import { type Paging } from 'knexify/types';
import applicationModel from '../models/application.model';
import type { JsonObject } from '../models/common.type';

const PUBLIC_FIELDS = [
  'id',
  'uuid',
  'code',
  'name',
  'setting',
  'createdAt',
  'updatedAt',
];

const SEARCH_FIELDS = ['code', 'name'];

export type ApplicationWrite = {
  code: string;
  name: string;
  setting: JsonObject;
};

export type ApplicationSearch = Paging & {
  q?: string;
};

/**
 * Finds an active application by id without the secret key.
 *
 * @example
 * find(1).then((application) => application);
 */
export const find = (id: number) => applicationModel()
  .select(PUBLIC_FIELDS)
  .whereActive()
  .find(id);

/**
 * Searches active applications.
 *
 * @example
 * searchApplications({ q: 'order', page: 1, pageSize: 20 });
 */
export const searchApplications = (search: ApplicationSearch) => {
  const { q = '', page = 1, pageSize = 20, token } = search;
  return applicationModel()
    .select(PUBLIC_FIELDS)
    .whereActive()
    .search(q, SEARCH_FIELDS)
    .paginate({ page, pageSize, token });
};

/**
 * Creates an application and returns the public row.
 *
 * @example
 * createApplication({ code: 'shop', name: 'Shop', setting: {} });
 */
export const createApplication = (payload: ApplicationWrite) => {
  const { code, name, setting } = payload;
  return applicationModel()
    .create({ code, name, setting })
    .then((created: { id: number }) => find(created.id));
};

/**
 * Updates an application and returns the public row.
 *
 * @example
 * updateApplication(1, { code: 'shop', name: 'Shop', setting: {} });
 */
export const updateApplication = (id: number, payload: ApplicationWrite) => {
  const { code, name, setting } = payload;
  return applicationModel()
    .patch(id, { code, name, setting })
    .then(() => find(id));
};

/**
 * Soft-deletes an application.
 *
 * @example
 * removeApplication(1);
 */
export const removeApplication = (id: number) => applicationModel().remove(id);
