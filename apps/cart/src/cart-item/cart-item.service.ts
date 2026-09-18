import { type Transaction } from 'knexify';
import { type Paging } from 'knexify/types';
import pool from '../models/pool';
import cartItemModel, { type CartItem } from '../models/cart-item.model';
import {
  type Cart,
  type CartIdentity,
  canAccessCart,
  find as findCart,
} from '../cart/cart.service';
import { syncCartItemWrite } from '../utils/catalog-sync';

const SEARCH_FIELDS = ['sku'];

export type CartItemWrite = {
  cartId: number;
  productId: number | null;
  variantId: number | null;
  sku: string;
  quantity: number;
  currency: string;
  amount: string;
};

export type CartItemSearch = Paging & {
  q?: string;
  cartId: number;
};

/**
 * Finds an active cart item for an application.
 *
 * @example
 * find(1, 2).then((item) => item);
 */
export const find = (id: number, applicationId: number) =>
  cartItemModel().whereActive({ applicationId }).find(id);

/**
 * Loads a cart the user or guest session may access.
 *
 * @example
 * requireOwnedCart(identity, 4);
 */
const requireOwnedCart = (identity: CartIdentity, cartId: number) =>
  findCart(cartId, identity.applicationId).then((cart: Cart | undefined) => {
    if (!cart || !canAccessCart(cart, identity)) {
      throw new Error('Cart not found.');
    }
    return cart;
  });

/**
 * Searches items for an owned cart.
 *
 * @example
 * searchCartItems(identity, { cartId: 4, page: 1, pageSize: 20 });
 */
export const searchCartItems = (
  identity: CartIdentity,
  search: CartItemSearch,
) => {
  const { q = '', page = 1, pageSize = 20, token, cartId } = search;
  return requireOwnedCart(identity, cartId)
    .then((cart: Cart) => cartItemModel()
      .whereActive({ applicationId: cart.applicationId, cartId: cart.id })
      .search(q, SEARCH_FIELDS)
      .paginate({ page, pageSize, token }));
};

/**
 * Finds an existing line by SKU on a cart.
 *
 * @example
 * findLineBySku(1, 4, 'SKU-1');
 */
const findLineBySku = (
  applicationId: number,
  cartId: number,
  sku: string,
) => cartItemModel().whereActive({ applicationId, cartId, sku }).first();

/**
 * Inserts a cart line inside a transaction.
 *
 * @example
 * insertLine(cart, payload, trx);
 */
const insertLine = (
  cart: Cart,
  payload: CartItemWrite,
  trx: Transaction,
) => {
  const { productId, variantId, sku, quantity, currency, amount } = payload;
  return cartItemModel(trx).create({
    applicationId: cart.applicationId,
    cartId: cart.id,
    productId,
    variantId,
    sku,
    quantity,
    currency,
    amount,
  });
};

/**
 * Adds quantity onto an existing line.
 *
 * @example
 * combineLine(item, 2, trx);
 */
const combineLine = (item: CartItem, quantity: number, trx: Transaction) =>
  cartItemModel(trx)
    .patch(item.id, {
      quantity: item.quantity + quantity,
      updatedAt: pool.raw('current_timestamp'),
    })
    .then(() => item);

/**
 * Creates or combines a line after the parent cart is loaded.
 *
 * @example
 * writeCartItem(cart, payload);
 */
const writeCartItem = (cart: Cart, payload: CartItemWrite) =>
  findLineBySku(cart.applicationId, cart.id, payload.sku)
    .then((item: CartItem | undefined) =>
      pool.transaction((trx: Transaction) => (item
        ? combineLine(item, payload.quantity, trx)
        : insertLine(cart, payload, trx))))
    .then((row: { id: number }) => find(row.id, cart.applicationId));

/**
 * Validates the line, then creates or combines it on the cart.
 *
 * @example
 * addSyncedItem(cart, payload, identity);
 */
const addSyncedItem = (
  cart: Cart,
  payload: CartItemWrite,
  identity: CartIdentity,
) => syncCartItemWrite(payload, identity)
  .then((synced: CartItemWrite) => writeCartItem(cart, synced));

/**
 * Adds an item to an owned cart, combining quantity when the SKU exists.
 *
 * @example
 * createCartItem(identity, payload);
 */
export const createCartItem = (
  identity: CartIdentity,
  payload: CartItemWrite,
) => requireOwnedCart(identity, payload.cartId)
  .then((cart: Cart) => addSyncedItem(cart, payload, identity));

/**
 * Updates quantity for an owned cart item.
 *
 * @example
 * writeQuantity(item, 3);
 */
const writeQuantity = (item: CartItem, quantity: number) =>
  pool.transaction((trx: Transaction) => cartItemModel(trx)
    .patch(item.id, {
      quantity,
      updatedAt: pool.raw('current_timestamp'),
    }))
    .then(() => find(item.id, item.applicationId));

/**
 * Builds a write payload from a stored line without changing the snapshot.
 *
 * @example
 * toWritePayload(item, 3);
 */
const toWritePayload = (item: CartItem, quantity: number): CartItemWrite => ({
  cartId: item.cartId,
  productId: item.productId,
  variantId: item.variantId,
  sku: item.sku,
  quantity,
  currency: item.currency,
  amount: `${item.amount}`,
});

/**
 * Re-validates catalog and inventory, then patches quantity only.
 *
 * @example
 * syncOwnedItem(item, identity, 3);
 */
const syncOwnedItem = (
  item: CartItem,
  identity: CartIdentity,
  quantity: number,
) => syncCartItemWrite(toWritePayload(item, quantity), identity)
  .then(() => writeQuantity(item, quantity));

/**
 * Ensures the parent cart is owned, then patches quantity.
 *
 * @example
 * updateOwnedItem(item, identity, 3);
 */
const updateOwnedItem = (
  item: CartItem,
  identity: CartIdentity,
  quantity: number,
) => requireOwnedCart(identity, item.cartId)
  .then(() => syncOwnedItem(item, identity, quantity));

/**
 * Updates an item quantity after verifying cart ownership.
 *
 * @example
 * updateCartItem(1, identity, 3);
 */
export const updateCartItem = (
  id: number,
  identity: CartIdentity,
  quantity: number,
) => find(id, identity.applicationId).then((item: CartItem | undefined) => {
  if (!item) throw new Error('Cart item not found.');
  return updateOwnedItem(item, identity, quantity);
});

/**
 * Soft-deletes an owned cart item.
 *
 * @example
 * writeRemove(item);
 */
const writeRemove = (item: CartItem) =>
  pool.transaction((trx: Transaction) =>
    cartItemModel(trx).remove(item.id)).then(() => item);

/**
 * Ensures the parent cart is owned, then removes the line.
 *
 * @example
 * removeOwnedItem(item, identity);
 */
const removeOwnedItem = (item: CartItem, identity: CartIdentity) =>
  requireOwnedCart(identity, item.cartId).then(() => writeRemove(item));

/**
 * Removes an item after verifying cart ownership.
 *
 * @example
 * removeCartItem(1, identity);
 */
export const removeCartItem = (id: number, identity: CartIdentity) =>
  find(id, identity.applicationId).then((item: CartItem | undefined) => {
    if (!item) throw new Error('Cart item not found.');
    return removeOwnedItem(item, identity);
  });

/**
 * Soft-deletes cart lines recursively.
 *
 * @example
 * removeItemRows(items, trx);
 */
const removeItemRows = (
  items: CartItem[],
  trx: Transaction,
): Promise<unknown> => {
  if (!items.length) return Promise.resolve(undefined);
  const [item, ...rest] = items;
  return cartItemModel(trx)
    .remove(item.id)
    .then(() => removeItemRows(rest, trx));
};

/**
 * Lists active lines for a cart.
 *
 * @example
 * listItems(1, 4);
 */
const listItems = (applicationId: number, cartId: number) =>
  cartItemModel().whereActive({ applicationId, cartId });

/**
 * Clears all lines on an owned cart.
 *
 * @example
 * clearOwnedCart(cart);
 */
const clearOwnedCart = (cart: Cart) =>
  listItems(cart.applicationId, cart.id)
    .then((items: CartItem[]) => pool.transaction((trx: Transaction) =>
      removeItemRows(items || [], trx)))
    .then(() => cart);

/**
 * Clears every item from an owned cart.
 *
 * @example
 * clearCartItems(identity, 4);
 */
export const clearCartItems = (identity: CartIdentity, cartId: number) =>
  requireOwnedCart(identity, cartId)
    .then((cart: Cart) => clearOwnedCart(cart));

export type { CartItem };
