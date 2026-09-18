import { type Response } from 'xpref';
import logger from '../log-client';
import { applicationHeader } from '../config';
import { type ApplicationRequest } from '../middleware/validate-application.middleware';
import { type CartIdentity } from '../cart/cart.service';
import { type CartItemRequest } from './cart-item.middleware';
import {
  type CartItem,
  type CartItemSearch,
  type CartItemWrite,
  searchCartItems,
  createCartItem,
  updateCartItem,
  removeCartItem,
  clearCartItems,
} from './cart-item.service';

/**
 * Reads user and guest identity from the request.
 *
 * @example
 * readIdentity(req);
 */
const readIdentity = (req: ApplicationRequest): CartIdentity => {
  const { application, userId, sessionId, headers } = req;
  if (!application) throw new Error('Application not found.');
  const appId = `${headers[applicationHeader.ID] || ''}`.trim();
  const secretKey = `${headers[applicationHeader.SECRET_KEY] || ''}`.trim();
  return {
    applicationId: application.id,
    userId,
    sessionId,
    appId: appId || undefined,
    secretKey: secretKey || undefined,
  };
};

/**
 * Requires a user id or a valid guest session id.
 *
 * @example
 * requireOwner(identity);
 */
const requireOwner = (identity: CartIdentity): CartIdentity => {
  const { userId, sessionId } = identity;
  if (!userId && !sessionId) {
    throw new Error('User id or session id is required.');
  }
  if (sessionId && sessionId.length > 64) {
    throw new Error('Session id is invalid.');
  }
  return identity;
};

/**
 * Parses a required positive integer.
 *
 * @example
 * parseRequiredId(req.body.cartId, 'cart id');
 */
const parseRequiredId = (value: unknown, label: string): number => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new Error(`Invalid ${label}.`);
  return id;
};

/**
 * Parses an optional positive integer.
 *
 * @example
 * parseOptionalId(req.body.productId);
 */
const parseOptionalId = (value: unknown): number | null => {
  if (value === undefined || value === null || value === '') return null;
  return parseRequiredId(value, 'catalog id');
};

/**
 * Parses a quantity greater than zero.
 *
 * @example
 * parseQuantity(2);
 */
const parseQuantity = (value: unknown): number => {
  const quantity = Number(value);
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error('Quantity must be greater than 0.');
  }
  return quantity;
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
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error('Invalid amount.');
  }
  return amount.toFixed(2);
};

/**
 * Parses a required SKU.
 *
 * @example
 * parseSku(req.body.sku);
 */
const parseSku = (value: unknown): string => {
  const sku = `${value || ''}`.trim();
  if (!sku) throw new Error('SKU is required.');
  if (sku.length > 64) throw new Error('SKU is invalid.');
  return sku;
};

/**
 * Validates GET /cart-items query parameters.
 *
 * @example
 * validateGetAction(req);
 */
const validateGetAction = (req: ApplicationRequest): CartItemSearch => {
  const { q, page, pageSize, token, cartId } = req.query;
  requireOwner(readIdentity(req));
  return {
    q: `${q || ''}`,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 20,
    token: token ? `${token}` : undefined,
    cartId: parseRequiredId(cartId, 'cart id'),
  };
};

/**
 * Validates POST /cart-items bodies.
 *
 * @example
 * validateWriteAction(req);
 */
const validateWriteAction = (req: ApplicationRequest): CartItemWrite => {
  const body = req.body || {};
  const { cartId, productId, variantId, sku, quantity, currency, amount } = body;
  requireOwner(readIdentity(req));
  return {
    cartId: parseRequiredId(cartId, 'cart id'),
    productId: parseOptionalId(productId),
    variantId: parseOptionalId(variantId),
    sku: parseSku(sku),
    quantity: parseQuantity(quantity),
    currency: parseCurrency(currency),
    amount: parseAmount(amount),
  };
};

/**
 * Validates PUT /cart-items/:id quantity.
 *
 * @example
 * validatePatchAction(req);
 */
const validatePatchAction = (req: CartItemRequest): number => {
  const { cartItem } = req;
  if (!cartItem) throw new Error('Cart item not found.');
  requireOwner(readIdentity(req));
  return parseQuantity((req.body || {}).quantity);
};

/**
 * Validates DELETE /cart-items (clear) query parameters.
 *
 * @example
 * validateClearAction(req);
 */
const validateClearAction = (req: ApplicationRequest): number => {
  requireOwner(readIdentity(req));
  return parseRequiredId(req.query.cartId, 'cart id');
};

/**
 * Lists items for an owned cart.
 *
 * @example
 * GET /cart-items?cartId=4
 */
export const getAction = (
  req: ApplicationRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validateGetAction(req))
  .then((search: CartItemSearch) =>
    searchCartItems(readIdentity(req), search))
  .then((result) => res.json(result))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Adds an item to an owned cart.
 *
 * @example
 * POST /cart-items
 */
export const postAction = (
  req: ApplicationRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validateWriteAction(req))
  .then((payload: CartItemWrite) =>
    createCartItem(readIdentity(req), payload))
  .then((item) => res.json(item))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Clears every item from an owned cart.
 *
 * @example
 * DELETE /cart-items?cartId=4
 */
export const clearAction = (
  req: ApplicationRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validateClearAction(req))
  .then((cartId: number) => clearCartItems(readIdentity(req), cartId))
  .then((cart) => res.json(cart))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Returns one cart item.
 *
 * @example
 * GET /cart-items/:id
 */
export const detailAction = (
  req: CartItemRequest,
  res: Response,
): Promise<Response> => Promise.resolve(res.json(req.cartItem));

/**
 * Updates an item quantity.
 *
 * @example
 * PUT /cart-items/:id
 */
export const updateAction = (
  req: CartItemRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validatePatchAction(req))
  .then((quantity: number) =>
    updateCartItem(req.cartItem?.id as number, readIdentity(req), quantity))
  .then((item) => res.json(item))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Soft-deletes a cart item and returns the previous row.
 *
 * @example
 * removeAndReturn(item, identity);
 */
const removeAndReturn = (item: CartItem, identity: CartIdentity) =>
  removeCartItem(item.id, identity).then(() => item);

/**
 * Soft-deletes a cart item.
 *
 * @example
 * DELETE /cart-items/:id
 */
export const deleteAction = (
  req: CartItemRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => {
    const { cartItem } = req;
    if (!cartItem) throw new Error('Cart item not found.');
    return removeAndReturn(cartItem, requireOwner(readIdentity(req)));
  })
  .then((item) => res.json(item))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });
