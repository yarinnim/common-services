import { type Response } from 'xpref';
import logger from '../log-client';
import { type ApplicationRequest } from '../middleware/validate-application.middleware';
import { type WarehouseRequest } from './warehouse.middleware';
import {
  type WarehouseSearch,
  type WarehouseWrite,
  searchWarehouses,
  createWarehouse,
  updateWarehouse,
  removeWarehouse,
} from './warehouse.service';

/**
 * Validates GET /warehouses query parameters.
 *
 * @example
 * validateGetAction(req);
 */
const validateGetAction = (req: ApplicationRequest): WarehouseSearch => {
  const { q, page, pageSize, token } = req.query;
  return {
    q: `${q || ''}`,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 20,
    token: token ? `${token}` : undefined,
  };
};

/**
 * Validates POST and PUT warehouse bodies.
 *
 * @example
 * validateWriteAction(req);
 */
const validateWriteAction = (req: ApplicationRequest): WarehouseWrite => {
  const { code, name, address } = req.body || {};
  if (!`${code || ''}`.trim()) throw new Error('Code is required.');
  if (!`${name || ''}`.trim()) throw new Error('Name is required.');
  return {
    code: `${code}`.trim(),
    name: `${name}`.trim(),
    address: address ? `${address}` : null,
  };
};

/**
 * Lists warehouses for the authenticated application.
 *
 * @example
 * GET /warehouses
 */
export const getAction = (
  req: ApplicationRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validateGetAction(req))
  .then((search: WarehouseSearch) => {
    const { application } = req;
    if (!application) throw new Error('Application not found.');
    return searchWarehouses(application.id, search);
  })
  .then((result) => res.json(result))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Creates a warehouse for the authenticated application.
 *
 * @example
 * POST /warehouses
 */
export const postAction = (
  req: ApplicationRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validateWriteAction(req))
  .then((payload: WarehouseWrite) => {
    const { application } = req;
    if (!application) throw new Error('Application not found.');
    return createWarehouse(application.id, payload);
  })
  .then((warehouse) => res.json(warehouse))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Returns one warehouse.
 *
 * @example
 * GET /warehouses/:id
 */
export const detailAction = (
  req: WarehouseRequest,
  res: Response,
): Promise<Response> => Promise.resolve(res.json(req.warehouse));

/**
 * Updates a warehouse.
 *
 * @example
 * PUT /warehouses/:id
 */
export const updateAction = (
  req: WarehouseRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validateWriteAction(req))
  .then((payload: WarehouseWrite) => {
    const { application, warehouse } = req;
    if (!application || !warehouse) throw new Error('Warehouse not found.');
    return updateWarehouse(warehouse.id, application.id, payload);
  })
  .then((warehouse) => res.json(warehouse))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Soft-deletes a warehouse.
 *
 * @example
 * DELETE /warehouses/:id
 */
export const deleteAction = (
  req: WarehouseRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => {
    const { warehouse } = req;
    if (!warehouse) throw new Error('Warehouse not found.');
    return removeWarehouse(warehouse.id).then(() => warehouse);
  })
  .then((warehouse) => res.json(warehouse))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });
