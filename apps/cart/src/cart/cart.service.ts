import { type Transaction } from 'knexify';
import { type Paging } from 'knexify/types';
import pool from '../models/pool';
import cartModel, { type Cart, cartStatus } from '../models/cart.model';
import cartItemModel, { type CartItem } from '../models/cart-item.model';
import { guestCart } from '../config';

const SEARCH_FIELDS = ['status', 'sessionId'];

export type CartIdentity = {
  applicationId: number;
  userId?: number;
  sessionId?: string;
  appId?: string;
  secretKey?: string;
};

export type CartSearch = Paging & {
  q?: string;
  userId?: number;
  sessionId?: string;
};

type GuestItemMove = {
  item: CartItem;
  userItem?: CartItem;
};

type MergeCarts = {
  userCart: Cart;
  guestCart: Cart;
};

/**
 * Finds an active cart for an application.
 *
 * @example
 * find(1, 2).then((cart) => cart);
 */
export const find = (id: number, applicationId: number) =>
  cartModel().whereActive({ applicationId }).find(id);

/**
 * Returns whether a cart belongs to the user or guest session.
 *
 * @example
 * canAccessCart(cart, { userId: 12 });
 */
export const canAccessCart = (cart: Cart, identity: CartIdentity): boolean => {
  const { userId, sessionId } = identity;
  if (userId && cart.userId === userId) return true;
  if (sessionId && cart.sessionId === sessionId) return true;
  return false;
};

/**
 * Searches carts for the authenticated user or guest session.
 *
 * @example
 * searchCarts(1, { userId: 12, page: 1, pageSize: 20 });
 */
export const searchCarts = (applicationId: number, search: CartSearch) => {
  const { q = '', page = 1, pageSize = 20, token, userId, sessionId } = search;
  if (!userId && !sessionId) {
    throw new Error('User id or session id is required.');
  }
  const filters = userId
    ? { applicationId, userId }
    : { applicationId, sessionId };
  return cartModel()
    .whereActive(filters)
    .search(q, SEARCH_FIELDS)
    .paginate({ page, pageSize, token });
};

/**
 * Loads the active user cart if it exists.
 *
 * @example
 * findUserCart(1, 12);
 */
const findUserCart = (applicationId: number, userId: number) =>
  cartModel()
    .whereActive({ applicationId, userId, status: cartStatus.ACTIVE })
    .first();

/**
 * Loads a non-expired active guest cart.
 *
 * @example
 * findGuestCart(1, 'sess-1');
 */
const findGuestCart = (applicationId: number, sessionId: string) =>
  cartModel()
    .whereActive({ applicationId, sessionId, status: cartStatus.ACTIVE })
    .whereRaw('(expires_at is null or expires_at > current_timestamp)')
    .first();

/**
 * Inserts an authenticated-user cart.
 *
 * @example
 * insertUserCart(1, 12);
 */
const insertUserCart = (applicationId: number, userId: number) =>
  cartModel()
    .create({
      applicationId,
      userId,
      sessionId: null,
      status: cartStatus.ACTIVE,
      expiresAt: null,
    })
    .then((created: { id: number }) => find(created.id, applicationId));

/**
 * Inserts a guest cart with TTL.
 *
 * @example
 * insertGuestCart(1, 'sess-1');
 */
const insertGuestCart = (applicationId: number, sessionId: string) =>
  cartModel()
    .create({
      applicationId,
      userId: null,
      sessionId,
      status: cartStatus.ACTIVE,
      expiresAt: pool.raw(guestCart.EXPIRES_SQL),
    })
    .then((created: { id: number }) => find(created.id, applicationId));

/**
 * Clears identity fields and soft-deletes a cart.
 *
 * @example
 * releaseCart(1, trx);
 */
const releaseCart = (id: number, trx: Transaction) =>
  cartModel(trx)
    .patch(id, {
      userId: null,
      sessionId: null,
      updatedAt: pool.raw('current_timestamp'),
    })
    .then(() => cartModel(trx).remove(id));

/**
 * Marks a guest cart merged and releases its unique keys.
 *
 * @example
 * closeGuestCart(1, trx);
 */
const closeGuestCart = (id: number, trx: Transaction) =>
  cartModel(trx)
    .patch(id, {
      userId: null,
      sessionId: null,
      status: cartStatus.MERGED,
      updatedAt: pool.raw('current_timestamp'),
    })
    .then(() => cartModel(trx).remove(id));

/**
 * Closes an expired guest cart so the session can be reused.
 *
 * @example
 * closeExpiredGuestCart(1, 'sess-1');
 */
const closeExpiredGuestCart = (applicationId: number, sessionId: string) =>
  cartModel()
    .whereActive({ applicationId, sessionId, status: cartStatus.ACTIVE })
    .whereRaw('expires_at <= current_timestamp')
    .first()
    .then((cart: Cart | undefined) => {
      if (!cart) return undefined;
      return pool.transaction((trx: Transaction) => releaseCart(cart.id, trx));
    });

/**
 * Creates or loads an authenticated-user cart.
 *
 * @example
 * loadOrCreateUserCart(1, 12);
 */
const loadOrCreateUserCart = (applicationId: number, userId: number) =>
  findUserCart(applicationId, userId)
    .then((cart: Cart | undefined) =>
      cart || insertUserCart(applicationId, userId));

/**
 * Creates or loads a guest cart, replacing an expired session cart.
 *
 * @example
 * loadOrCreateGuestCart(1, 'sess-1');
 */
const loadOrCreateGuestCart = (applicationId: number, sessionId: string) =>
  closeExpiredGuestCart(applicationId, sessionId)
    .then(() => findGuestCart(applicationId, sessionId))
    .then((cart: Cart | undefined) =>
      cart || insertGuestCart(applicationId, sessionId));

/**
 * Lists active items for a cart.
 *
 * @example
 * listCartItems(1, 4);
 */
const listCartItems = (applicationId: number, cartId: number) =>
  cartItemModel().whereActive({ applicationId, cartId });

/**
 * Finds a user-cart line that matches a guest item SKU.
 *
 * @example
 * matchUserItem(guestItem, userItems);
 */
const matchUserItem = (
  item: CartItem,
  userItems: CartItem[],
): CartItem | undefined => {
  if (!userItems.length) return undefined;
  const [current, ...rest] = userItems;
  if (current.sku === item.sku) return current;
  return matchUserItem(item, rest);
};

/**
 * Builds guest-to-user item moves recursively.
 *
 * @example
 * buildGuestMoves(guestItems, userItems);
 */
const buildGuestMoves = (
  guestItems: CartItem[],
  userItems: CartItem[],
): GuestItemMove[] => {
  if (!guestItems.length) return [];
  const [item, ...rest] = guestItems;
  return [
    { item, userItem: matchUserItem(item, userItems) },
    ...buildGuestMoves(rest, userItems),
  ];
};

/**
 * Combines or moves one guest line onto the user cart.
 *
 * @example
 * applyGuestMove(move, 4, trx);
 */
const applyGuestMove = (
  move: GuestItemMove,
  userCartId: number,
  trx: Transaction,
) => {
  const { item, userItem } = move;
  if (!userItem) {
    return cartItemModel(trx).patch(item.id, { cartId: userCartId });
  }
  return cartItemModel(trx)
    .patch(userItem.id, { quantity: userItem.quantity + item.quantity })
    .then(() => cartItemModel(trx).remove(item.id));
};

/**
 * Applies guest item moves recursively.
 *
 * @example
 * applyGuestMoves(moves, 4, trx);
 */
const applyGuestMoves = (
  moves: GuestItemMove[],
  userCartId: number,
  trx: Transaction,
): Promise<unknown> => {
  if (!moves.length) return Promise.resolve(undefined);
  const [move, ...rest] = moves;
  return applyGuestMove(move, userCartId, trx)
    .then(() => applyGuestMoves(rest, userCartId, trx));
};

/**
 * Loads guest and user lines used to plan a merge.
 *
 * @example
 * loadGuestMoves(userCart, guestCart);
 */
const loadGuestMoves = (userCart: Cart, guestCart: Cart) => {
  const { applicationId } = userCart;
  return listCartItems(applicationId, guestCart.id)
    .then((guestItems: CartItem[]) =>
      pairGuestMoves(userCart, guestItems || []));
};

/**
 * Pairs guest lines with matching user-cart SKUs.
 *
 * @example
 * pairGuestMoves(userCart, guestItems);
 */
const pairGuestMoves = (userCart: Cart, guestItems: CartItem[]) =>
  listCartItems(userCart.applicationId, userCart.id)
    .then((userItems: CartItem[]) =>
      buildGuestMoves(guestItems, userItems || []));

/**
 * Writes item moves and closes the guest cart.
 *
 * @example
 * writeGuestMerge(userCart, guestCart, moves);
 */
const writeGuestMerge = (
  merge: MergeCarts,
  moves: GuestItemMove[],
) => pool.transaction((trx: Transaction) =>
  applyGuestMoves(moves, merge.userCart.id, trx)
    .then(() => closeGuestCart(merge.guestCart.id, trx)));

/**
 * Loads guest and user items, then writes the merge.
 *
 * @example
 * mergeGuestCart(userCart, guestCart);
 */
const mergeGuestCart = (userCart: Cart, guestCart: Cart) =>
  loadGuestMoves(userCart, guestCart)
    .then((moves: GuestItemMove[]) =>
      writeGuestMerge({ userCart, guestCart }, moves))
    .then(() => find(userCart.id, userCart.applicationId));

/**
 * Merges when a guest cart exists for the login session.
 *
 * @example
 * mergeIfGuestExists(userCart, identity);
 */
const mergeIfGuestExists = (userCart: Cart, identity: CartIdentity) =>
  findGuestCart(identity.applicationId, identity.sessionId as string)
    .then((guest: Cart | undefined) => {
      if (!guest || guest.id === userCart.id) return userCart;
      return mergeGuestCart(userCart, guest);
    });

/**
 * Merges a guest cart into the user cart when both identities are present.
 *
 * @example
 * mergeOnLogin({ applicationId: 1, userId: 12, sessionId: 'sess-1' });
 */
const mergeOnLogin = (identity: CartIdentity) =>
  loadOrCreateUserCart(identity.applicationId, identity.userId as number)
    .then((userCart: Cart) => mergeIfGuestExists(userCart, identity));

/**
 * Creates or loads a cart, merging guest lines when the user logs in.
 *
 * @example
 * createCart({ applicationId: 1, userId: 12, sessionId: 'sess-1' });
 */
export const createCart = (identity: CartIdentity) => {
  const { applicationId, userId, sessionId } = identity;
  if (!userId && !sessionId) {
    throw new Error('User id or session id is required.');
  }
  if (userId && sessionId) return mergeOnLogin(identity);
  if (userId) return loadOrCreateUserCart(applicationId, userId);
  return loadOrCreateGuestCart(applicationId, sessionId as string);
};

/**
 * Refreshes guest-cart TTL; user carts are returned unchanged.
 *
 * @example
 * updateCart(1, 2);
 */
export const updateCart = (id: number, applicationId: number) =>
  find(id, applicationId).then((cart: Cart | undefined) => {
    if (!cart) throw new Error('Cart not found.');
    if (!cart.sessionId) return cart;
    return cartModel()
      .patch(id, {
        expiresAt: pool.raw(guestCart.EXPIRES_SQL),
        updatedAt: pool.raw('current_timestamp'),
      })
      .then(() => find(id, applicationId));
  });

/**
 * Soft-deletes a cart after clearing unique identity fields.
 *
 * @example
 * removeCart(1, 2);
 */
export const removeCart = (id: number, applicationId: number) =>
  find(id, applicationId).then((cart: Cart | undefined) => {
    if (!cart) throw new Error('Cart not found.');
    return pool.transaction((trx: Transaction) =>
      releaseCart(cart.id, trx).then(() => cart));
  });

/**
 * Lists expired active guest carts across tenants.
 *
 * @example
 * listExpiredGuestCarts();
 */
const listExpiredGuestCarts = () =>
  cartModel()
    .whereActive({ status: cartStatus.ACTIVE })
    .whereRaw('user_id is null')
    .whereRaw('session_id is not null')
    .whereRaw('expires_at <= current_timestamp');

/**
 * Soft-deletes cart lines recursively.
 *
 * @example
 * removeCartLines(items, trx);
 */
const removeCartLines = (
  items: CartItem[],
  trx: Transaction,
): Promise<unknown> => {
  if (!items.length) return Promise.resolve(undefined);
  const [item, ...rest] = items;
  return cartItemModel(trx)
    .remove(item.id)
    .then(() => removeCartLines(rest, trx));
};

/**
 * Soft-deletes an expired guest cart and its lines.
 *
 * @example
 * writeExpiredCart(cart, items);
 */
const writeExpiredCart = (cart: Cart, items: CartItem[]) =>
  pool.transaction((trx: Transaction) =>
    removeCartLines(items, trx).then(() => releaseCart(cart.id, trx)));

/**
 * Loads lines for a guest cart, then expires it.
 *
 * @example
 * expireGuestCart(cart);
 */
const expireGuestCart = (cart: Cart) =>
  listCartItems(cart.applicationId, cart.id)
    .then((items: CartItem[]) => writeExpiredCart(cart, items || []));

/**
 * Expires guest carts recursively.
 *
 * @example
 * expireGuestCarts(carts);
 */
const expireGuestCarts = (carts: Cart[]): Promise<unknown> => {
  if (!carts.length) return Promise.resolve(undefined);
  const [cart, ...rest] = carts;
  return expireGuestCart(cart).then(() => expireGuestCarts(rest));
};

/**
 * Soft-deletes expired guest carts and their items.
 *
 * User carts and non-expired guest carts are left alone.
 *
 * @example
 * cleanupExpiredGuestCarts();
 */
export const cleanupExpiredGuestCarts = () =>
  listExpiredGuestCarts()
    .then((carts: Cart[]) => expireGuestCarts(carts || []));

export type { Cart };
