import { type Response } from 'xpref';
import logger from '../log-client';
import { type ApplicationRequest } from '../middleware/validate-application.middleware';
import { type PriceRequest } from './price.middleware';
import {
  type Price,
  type PriceSearch,
  type PriceWrite,
  searchPrices,
  createPrice,
  updatePrice,
  removePrice,
} from './price.service';
import {
  parseSortDirection,
  parseSortField,
} from '../utils/list-query';

/**
 * Parses an optional positive integer from a query value.
 *
 * @example
 * parseOptionalQueryId(req.query.variantId);
 */
const parseOptionalQueryId = (value: unknown): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new Error('Invalid variant id.');
  return id;
};

/**
 * Validates GET /prices query parameters.
 *
 * @example
 * validateGetAction(req);
 */
const validateGetAction = (req: ApplicationRequest): PriceSearch => {
  const { q, page, pageSize, token, variantId, currency, sort, direction } =
    req.query;
  return {
    q: `${q || ''}`,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 20,
    token: token ? `${token}` : undefined,
    variantId: parseOptionalQueryId(variantId),
    currency: parseOptionalCurrency(currency),
    sort: parseSortField(sort),
    direction: parseSortDirection(direction),
  };
};

/**
 * Parses an optional currency code from a query value.
 *
 * @example
 * parseOptionalCurrency(req.query.currency);
 */
const parseOptionalCurrency = (value: unknown): string | undefined => {
  if (value === undefined || value === null || `${value}`.trim() === '') {
    return undefined;
  }
  return parseCurrency(value);
};

/**
 * Parses a required positive integer.
 *
 * @example
 * parseRequiredId(req.body.variantId, 'variant id');
 */
const parseRequiredId = (value: unknown, label: string): number => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new Error(`Invalid ${label}.`);
  return id;
};

/**
 * Parses a three-letter currency code.
 *
 * @example
 * parseCurrency('usd');
 */
const parseCurrency = (value: unknown): string => {
  const currency = `${value || ''}`.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) throw new Error('Invalid currency.');
  return currency;
};

/**
 * Parses a non-negative money amount.
 *
 * @example
 * parseAmount(10.5);
 */
const parseAmount = (value: unknown): string => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) throw new Error('Invalid amount.');
  return amount.toFixed(2);
};

/**
 * Validates POST and PUT price bodies.
 *
 * @example
 * validateWriteAction(req);
 */
const validateWriteAction = (req: ApplicationRequest): PriceWrite => {
  const { variantId, currency, amount } = req.body || {};
  return {
    variantId: parseRequiredId(variantId, 'variant id'),
    currency: parseCurrency(currency),
    amount: parseAmount(amount),
  };
};

/**
 * Lists prices for the authenticated application.
 *
 * @example
 * GET /prices
 */
export const getAction = (
  req: ApplicationRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validateGetAction(req))
  .then((search: PriceSearch) => {
    const { application } = req;
    if (!application) throw new Error('Application not found.');
    return searchPrices(application.id, search);
  })
  .then((result) => res.json(result))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Creates a price for the authenticated application.
 *
 * @example
 * POST /prices
 */
export const postAction = (
  req: ApplicationRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validateWriteAction(req))
  .then((payload: PriceWrite) => {
    const { application } = req;
    if (!application) throw new Error('Application not found.');
    return createPrice(application.id, payload);
  })
  .then((price) => res.json(price))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Returns one price.
 *
 * @example
 * GET /prices/:id
 */
export const detailAction = (
  req: PriceRequest,
  res: Response,
): Promise<Response> => Promise.resolve(res.json(req.price));

/**
 * Updates a price.
 *
 * @example
 * PUT /prices/:id
 */
export const updateAction = (
  req: PriceRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validateWriteAction(req))
  .then((payload: PriceWrite) => {
    const { application, price } = req;
    if (!application || !price) throw new Error('Price not found.');
    return updatePrice(price.id, application.id, payload);
  })
  .then((price) => res.json(price))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Soft-deletes a price and returns the previous row.
 *
 * @example
 * removeAndReturn(price);
 */
const removeAndReturn = (price: Price) =>
  removePrice(price.id).then(() => price);

/**
 * Soft-deletes a price.
 *
 * @example
 * DELETE /prices/:id
 */
export const deleteAction = (
  req: PriceRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => {
    const { price } = req;
    if (!price) throw new Error('Price not found.');
    return removeAndReturn(price);
  })
  .then((price) => res.json(price))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });
