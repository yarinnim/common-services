import { type Response, type NextFunction } from 'xpref';
import {
  type ApplicationRequest,
} from '../middleware/validate-application.middleware';
import {
  type Cart,
  canAccessCart,
  find as findCart,
} from '../cart/cart.service';
import { find, type CartItem } from './cart-item.service';

export type CartItemRequest = ApplicationRequest & {
  cart?: Cart;
  cartItem?: CartItem;
};

/**
 * Loads a tenant-scoped item whose parent cart the caller may access.
 *
 * @example
 * '/:id': ['detail', [validateResource], { get: detailAction }]
 */
export const validateResource = (
  request: CartItemRequest,
  response: Response,
  next: NextFunction,
): void => {
  const { application } = request;
  if (!application) {
    return response.status(401).json({ message: 'Application not found.' });
  }

  const id = Number(request.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return response.status(404).json({ message: 'Cart item not found.' });
  }

  find(id, application.id)
    .then((item: CartItem | undefined) => attachOwnedItem(request, item, next))
    .catch((error: Error) => {
      const { message } = error;
      return response.status(404).json({ message });
    });
};

/**
 * Attaches the item after the parent cart is confirmed owned.
 *
 * @example
 * attachOwnedItem(request, item, next);
 */
const attachOwnedItem = (
  request: CartItemRequest,
  item: CartItem | undefined,
  next: NextFunction,
) => {
  if (!item) throw new Error('Cart item not found.');
  const { application, userId, sessionId } = request;
  const identity = {
    applicationId: application?.id as number,
    userId,
    sessionId,
  };
  return findCart(item.cartId, identity.applicationId)
    .then((cart: Cart | undefined) => {
      if (!cart || !canAccessCart(cart, identity)) {
        throw new Error('Cart item not found.');
      }
      request.cartItem = item;
      request.cart = cart;
      return next();
    });
};
