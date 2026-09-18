import { type Response } from 'xpref';
import logger from '../log-client';
import { type ApplicationRequest } from '../middleware/validate-application.middleware';
import { type CartRequest } from './cart.middleware';
import {
  type Cart,
  type CartIdentity,
  type CartSearch,
  searchCarts,
  createCart,
  updateCart,
  removeCart,
} from './cart.service';

/**
 * Reads user and guest identity from the request.
 *
 * @example
 * readIdentity(req);
 */
const readIdentity = (req: ApplicationRequest): CartIdentity => {
  const { application, userId, sessionId } = req;
  if (!application) throw new Error('Application not found.');
  return { applicationId: application.id, userId, sessionId };
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
 * Validates GET /carts query parameters.
 *
 * @example
 * validateGetAction(req);
 */
const validateGetAction = (req: ApplicationRequest): CartSearch => {
  const { q, page, pageSize, token } = req.query;
  const { userId, sessionId } = requireOwner(readIdentity(req));
  return {
    q: `${q || ''}`,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 20,
    token: token ? `${token}` : undefined,
    userId,
    sessionId,
  };
};

/**
 * Validates POST /carts identity headers.
 *
 * @example
 * validatePostAction(req);
 */
const validatePostAction = (req: ApplicationRequest): CartIdentity =>
  requireOwner(readIdentity(req));

/**
 * Validates PUT /carts/:id (TTL refresh; body is unused).
 *
 * @example
 * validateWriteAction(req);
 */
const validateWriteAction = (req: CartRequest): Cart => {
  const { cart } = req;
  if (!cart) throw new Error('Cart not found.');
  return cart;
};

/**
 * Lists carts for the authenticated user or guest session.
 *
 * @example
 * GET /carts
 */
export const getAction = (
  req: ApplicationRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validateGetAction(req))
  .then((search: CartSearch) => {
    const { application } = req;
    if (!application) throw new Error('Application not found.');
    return searchCarts(application.id, search);
  })
  .then((result) => res.json(result))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Creates or loads a cart, merging a guest cart when the user logs in.
 *
 * @example
 * POST /carts
 */
export const postAction = (
  req: ApplicationRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validatePostAction(req))
  .then((identity: CartIdentity) => createCart(identity))
  .then((cart) => res.json(cart))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Returns one cart.
 *
 * @example
 * GET /carts/:id
 */
export const detailAction = (
  req: CartRequest,
  res: Response,
): Promise<Response> => Promise.resolve(res.json(req.cart));

/**
 * Refreshes guest-cart TTL.
 *
 * @example
 * PUT /carts/:id
 */
export const updateAction = (
  req: CartRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validateWriteAction(req))
  .then((cart: Cart) => {
    const { application } = req;
    if (!application) throw new Error('Application not found.');
    return updateCart(cart.id, application.id);
  })
  .then((cart) => res.json(cart))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Soft-deletes a cart and returns the previous row.
 *
 * @example
 * removeAndReturn(cart, applicationId);
 */
const removeAndReturn = (cart: Cart, applicationId: number) =>
  removeCart(cart.id, applicationId).then(() => cart);

/**
 * Soft-deletes a cart.
 *
 * @example
 * DELETE /carts/:id
 */
export const deleteAction = (
  req: CartRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => {
    const { application, cart } = req;
    if (!application || !cart) throw new Error('Cart not found.');
    return removeAndReturn(cart, application.id);
  })
  .then((cart) => res.json(cart))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });
