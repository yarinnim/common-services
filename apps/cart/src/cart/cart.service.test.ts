import pool from '../models/pool';
import cartModel from '../models/cart.model';
import cartItemModel from '../models/cart-item.model';
import {
  canAccessCart,
  createCart,
  searchCarts,
  updateCart,
  cleanupExpiredGuestCarts,
} from './cart.service';
import type { Cart } from './cart.service';
import type { CartItem } from '../models/cart-item.model';

jest.mock('../models/pool', () => ({
  __esModule: true,
  default: {
    transaction: jest.fn(),
    raw: jest.fn((sql: string) => sql),
  },
}));

jest.mock('../models/cart.model', () => ({
  __esModule: true,
  cartStatus: { ACTIVE: 'active', MERGED: 'merged' },
  default: jest.fn(),
}));

jest.mock('../models/cart-item.model', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../config', () => ({
  guestCart: { EXPIRES_SQL: "current_timestamp + interval '7 days'" },
}));

/**
 * Builds a cart row for access checks.
 *
 * @example
 * makeCart({ userId: 12 });
 */
const makeCart = (cart: Partial<Cart>): Cart => ({
  id: 1,
  applicationId: 4,
  userId: null,
  sessionId: null,
  status: 'active',
  expiresAt: null,
  ...cart,
});

describe('canAccessCart', () => {
  it('allows the owning user', () => {
    const cart = makeCart({ userId: 12 });
    expect(canAccessCart(cart, { applicationId: 4, userId: 12 })).toBe(true);
  });

  it('allows the guest session', () => {
    const cart = makeCart({ sessionId: 'sess-1' });
    expect(canAccessCart(cart, {
      applicationId: 4,
      sessionId: 'sess-1',
    })).toBe(true);
  });

  it('rejects another user or session', () => {
    const cart = makeCart({ userId: 12, sessionId: 'sess-1' });
    expect(canAccessCart(cart, { applicationId: 4, userId: 9 })).toBe(false);
    expect(canAccessCart(cart, {
      applicationId: 4,
      sessionId: 'other',
    })).toBe(false);
  });
});

describe('createCart', () => {
  it('requires a user id or session id', () => {
    expect(() => createCart({ applicationId: 4 }))
      .toThrow('User id or session id is required.');
  });
});

describe('searchCarts', () => {
  it('requires a user id or session id', () => {
    expect(() => searchCarts(4, { page: 1, pageSize: 20 }))
      .toThrow('User id or session id is required.');
  });

  it('scopes search to the user in the tenant', () => {
    const paginate = jest.fn();
    const search = jest.fn(() => ({ paginate }));
    (cartModel as unknown as jest.Mock).mockReturnValue({
      whereActive: jest.fn(() => ({ search })),
    });

    searchCarts(4, { userId: 12, q: 'active', page: 2, pageSize: 10 });

    expect(cartModel().whereActive).toHaveBeenCalledWith({
      applicationId: 4,
      userId: 12,
    });
    expect(search).toHaveBeenCalledWith('active', ['status', 'sessionId']);
    expect(paginate).toHaveBeenCalledWith({
      page: 2,
      pageSize: 10,
      token: undefined,
    });
  });

  it('scopes search to the guest session in the tenant', () => {
    const paginate = jest.fn();
    const search = jest.fn(() => ({ paginate }));
    (cartModel as unknown as jest.Mock).mockReturnValue({
      whereActive: jest.fn(() => ({ search })),
    });

    searchCarts(4, { sessionId: 'sess-1', page: 1, pageSize: 20 });

    expect(cartModel().whereActive).toHaveBeenCalledWith({
      applicationId: 4,
      sessionId: 'sess-1',
    });
  });
});

describe('updateCart', () => {
  it('rejects a cart missing from the tenant', () => {
    (cartModel as unknown as jest.Mock).mockReturnValue({
      whereActive: jest.fn(() => ({
        find: jest.fn(() => Promise.resolve(undefined)),
      })),
    });

    return updateCart(8, 4).then(() => {
      throw new Error('Should have rejected.');
    }).catch((error: Error) => {
      expect(error.message).toBe('Cart not found.');
    });
  });
});

describe('createCart merge', () => {
  const userCart = makeCart({ id: 1, userId: 12 });
  const guestCart = makeCart({
    id: 2,
    userId: null,
    sessionId: 'sess-1',
  });
  const userItem = {
    id: 11,
    applicationId: 4,
    cartId: 1,
    sku: 'SKU-1',
    quantity: 1,
  } as CartItem;
  const guestItem = {
    id: 22,
    applicationId: 4,
    cartId: 2,
    sku: 'SKU-1',
    quantity: 2,
  } as CartItem;

  beforeEach(() => {
    const cartQuery = {
      whereActive: jest.fn(),
      whereRaw: jest.fn(),
      first: jest.fn(),
      find: jest.fn(),
      patch: jest.fn(() => Promise.resolve(1)),
      remove: jest.fn(() => Promise.resolve(1)),
    };
    cartQuery.whereActive.mockReturnValue(cartQuery);
    cartQuery.whereRaw.mockReturnValue(cartQuery);
    cartQuery.first
      .mockReturnValueOnce(Promise.resolve(userCart))
      .mockReturnValueOnce(Promise.resolve(guestCart));
    cartQuery.find.mockReturnValue(Promise.resolve(userCart));
    (cartModel as unknown as jest.Mock).mockReturnValue(cartQuery);

    const itemQuery = {
      whereActive: jest.fn(),
      patch: jest.fn(() => Promise.resolve(1)),
      remove: jest.fn(() => Promise.resolve(1)),
    };
    itemQuery.whereActive.mockImplementation((filters: { cartId: number }) => {
      if (filters.cartId === guestCart.id) {
        return Promise.resolve([guestItem]);
      }
      return Promise.resolve([userItem]);
    });
    (cartItemModel as unknown as jest.Mock).mockReturnValue(itemQuery);
    (pool.transaction as unknown as jest.Mock).mockImplementation(
      (work: (trx: unknown) => unknown) => work({}),
    );
  });

  it('combines matching guest SKUs into the user cart', () =>
    createCart({
      applicationId: 4,
      userId: 12,
      sessionId: 'sess-1',
    }).then((cart) => {
      expect(cart).toEqual(userCart);
      expect(cartItemModel().patch).toHaveBeenCalledWith(11, { quantity: 3 });
      expect(cartItemModel().remove).toHaveBeenCalledWith(22);
      expect(cartModel().remove).toHaveBeenCalledWith(2);
    }));
});

describe('cleanupExpiredGuestCarts', () => {
  type CartQuery = {
    whereActive: jest.Mock;
    whereRaw: jest.Mock;
    patch: jest.Mock;
    remove: jest.Mock;
    then: (
      resolve: (value: Cart[]) => unknown,
      reject?: (reason: unknown) => unknown,
    ) => Promise<unknown>;
  };

  let listedCarts: Cart[];
  let listedItems: CartItem[];
  let cartQuery: CartQuery;
  let itemRemove: jest.Mock;

  beforeEach(() => {
    listedCarts = [];
    listedItems = [];
    cartQuery = {
      whereActive: jest.fn(),
      whereRaw: jest.fn(),
      patch: jest.fn(() => Promise.resolve(1)),
      remove: jest.fn(() => Promise.resolve(1)),
      then: (
        resolve: (value: Cart[]) => unknown,
        reject?: (reason: unknown) => unknown,
      ) => Promise.resolve(listedCarts).then(resolve, reject),
    };
    cartQuery.whereActive.mockReturnValue(cartQuery);
    cartQuery.whereRaw.mockReturnValue(cartQuery);
    (cartModel as unknown as jest.Mock).mockReturnValue(cartQuery);

    itemRemove = jest.fn(() => Promise.resolve(1));
    (cartItemModel as unknown as jest.Mock).mockReturnValue({
      whereActive: jest.fn(() => Promise.resolve(listedItems)),
      remove: itemRemove,
    });
    (pool.transaction as unknown as jest.Mock).mockImplementation(
      (work: (trx: unknown) => unknown) => work({}),
    );
  });

  it('leaves active guest carts and user carts alone', () =>
    cleanupExpiredGuestCarts().then(() => {
      expect(cartQuery.whereActive).toHaveBeenCalledWith({ status: 'active' });
      expect(cartQuery.whereRaw).toHaveBeenCalledWith('user_id is null');
      expect(cartQuery.whereRaw).toHaveBeenCalledWith(
        'session_id is not null',
      );
      expect(cartQuery.whereRaw).toHaveBeenCalledWith(
        'expires_at <= current_timestamp',
      );
      expect(cartQuery.patch).not.toHaveBeenCalled();
      expect(cartQuery.remove).not.toHaveBeenCalled();
      expect(itemRemove).not.toHaveBeenCalled();
    }));

  it('soft-deletes an expired guest cart and its items', () => {
    const expired = makeCart({
      id: 9,
      userId: null,
      sessionId: 'sess-1',
      expiresAt: new Date('2020-01-01'),
    });
    listedCarts = [expired];
    listedItems = [{
      id: 3,
      applicationId: 4,
      cartId: 9,
      productId: null,
      variantId: null,
      sku: 'SKU-1',
      quantity: 1,
      currency: 'USD',
      amount: '10.00',
    } as CartItem];

    return cleanupExpiredGuestCarts().then(() => {
      expect(itemRemove).toHaveBeenCalledWith(3);
      expect(cartQuery.patch).toHaveBeenCalledWith(9, {
        userId: null,
        sessionId: null,
        updatedAt: 'current_timestamp',
      });
      expect(cartQuery.remove).toHaveBeenCalledWith(9);
    });
  });
});
