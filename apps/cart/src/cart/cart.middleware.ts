import { type Response, type NextFunction } from 'xpref';
import {
  type ApplicationRequest,
} from '../middleware/validate-application.middleware';
import { canAccessCart, find, type Cart } from './cart.service';

export type CartRequest = ApplicationRequest & {
  cart?: Cart;
};

/**
 * Loads a tenant-scoped cart the user or guest session may access.
 *
 * @example
 * '/:id': ['detail', [validateResource], { get: detailAction }]
 */
export const validateResource = (
  request: CartRequest,
  response: Response,
  next: NextFunction,
): void => {
  const { application, userId, sessionId } = request;
  if (!application) {
    return response.status(401).json({ message: 'Application not found.' });
  }

  const id = Number(request.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return response.status(404).json({ message: 'Cart not found.' });
  }

  find(id, application.id)
    .then((cart: Cart | undefined) => {
      const identity = { applicationId: application.id, userId, sessionId };
      if (!cart || !canAccessCart(cart, identity)) {
        throw new Error('Cart not found.');
      }
      request.cart = cart;
      return next();
    })
    .catch((error: Error) => {
      const { message } = error;
      return response.status(404).json({ message });
    });
};
