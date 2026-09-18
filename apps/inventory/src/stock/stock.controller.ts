import { type Response } from 'xpref';
import logger from '../log-client';
import { type ApplicationRequest } from '../middleware/validate-application.middleware';
import { type StockRequest } from './stock.middleware';
import { type StockSearch, searchStocks } from './stock.service';

/**
 * Parses an optional positive integer query value.
 *
 * @example
 * parseOptionalId(req.query.itemId);
 */
const parseOptionalId = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new Error('Invalid id filter.');
  return id;
};

/**
 * Validates GET /stocks query parameters.
 *
 * @example
 * validateGetAction(req);
 */
const validateGetAction = (req: ApplicationRequest): StockSearch => {
  const { q, page, pageSize, token, itemId, warehouseId } = req.query;
  return {
    q: `${q || ''}`,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 20,
    token: token ? `${token}` : undefined,
    itemId: parseOptionalId(itemId),
    warehouseId: parseOptionalId(warehouseId),
  };
};

/**
 * Lists stock levels for the authenticated application.
 *
 * @example
 * GET /stocks
 */
export const getAction = (
  req: ApplicationRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validateGetAction(req))
  .then((search: StockSearch) => {
    const { application } = req;
    if (!application) throw new Error('Application not found.');
    return searchStocks(application.id, search);
  })
  .then((result) => res.json(result))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Returns one stock row.
 *
 * @example
 * GET /stocks/:id
 */
export const detailAction = (
  req: StockRequest,
  res: Response,
): Promise<Response> => Promise.resolve(res.json(req.stock));
