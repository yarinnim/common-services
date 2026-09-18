import {
  searchCartItems,
  createCartItem,
  updateCartItem,
} from './cart-item.service';
import { find as findCart, canAccessCart } from '../cart/cart.service';
import { syncCartItemWrite } from '../utils/catalog-sync';
import cartItemModel from '../models/cart-item.model';
import pool from '../models/pool';

jest.mock('../models/pool', () => ({
  __esModule: true,
  default: {
    transaction: jest.fn(),
    raw: jest.fn((sql: string) => sql),
  },
  initModel: jest.fn(() => jest.fn()),
}));

jest.mock('../models/cart-item.model', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../cart/cart.service', () => ({
  find: jest.fn(),
  canAccessCart: jest.fn(),
}));

jest.mock('../utils/catalog-sync', () => ({
  syncCartItemWrite: jest.fn((payload) => Promise.resolve(payload)),
}));

describe('searchCartItems', () => {
  const identity = { applicationId: 4, userId: 12 };

  beforeEach(() => {
    (findCart as unknown as jest.Mock).mockReset();
    (canAccessCart as unknown as jest.Mock).mockReset();
  });

  it('rejects a cart owned by another tenant or user', () => {
    (findCart as unknown as jest.Mock).mockReturnValue(Promise.resolve({
      id: 9,
      applicationId: 4,
      userId: 99,
    }));
    (canAccessCart as unknown as jest.Mock).mockReturnValue(false);

    return searchCartItems(identity, {
      cartId: 9,
      page: 1,
      pageSize: 20,
    }).then(() => {
      throw new Error('Should have rejected.');
    }).catch((error: Error) => {
      expect(error.message).toBe('Cart not found.');
    });
  });
});

describe('createCartItem', () => {
  const payload = {
    cartId: 9,
    productId: null,
    variantId: null,
    sku: 'SKU-1',
    quantity: 1,
    currency: 'USD',
    amount: '10.00',
  };

  beforeEach(() => {
    (findCart as unknown as jest.Mock).mockReset();
    (canAccessCart as unknown as jest.Mock).mockReset();
    (syncCartItemWrite as unknown as jest.Mock).mockReset();
    (syncCartItemWrite as unknown as jest.Mock).mockImplementation(
      (line) => Promise.resolve(line),
    );
  });

  it('rejects a missing parent cart', () => {
    (findCart as unknown as jest.Mock).mockReturnValue(Promise.resolve(undefined));

    return createCartItem(
      { applicationId: 4, userId: 12 },
      payload,
    ).then(() => {
      throw new Error('Should have rejected.');
    }).catch((error: Error) => {
      expect(error.message).toBe('Cart not found.');
      expect(syncCartItemWrite).not.toHaveBeenCalled();
    });
  });

  it('rejects when the item is not in the tenant catalog', () => {
    (findCart as unknown as jest.Mock).mockReturnValue(Promise.resolve({
      id: 9,
      applicationId: 4,
      userId: 12,
    }));
    (canAccessCart as unknown as jest.Mock).mockReturnValue(true);
    (syncCartItemWrite as unknown as jest.Mock).mockReturnValue(
      Promise.reject(new Error('Item is not in the catalog.')),
    );

    return createCartItem(
      { applicationId: 4, userId: 12, appId: 'uuid', secretKey: 'secret' },
      payload,
    ).then(() => {
      throw new Error('Should have rejected.');
    }).catch((error: Error) => {
      expect(error.message).toBe('Item is not in the catalog.');
    });
  });

  it('combines quantity and keeps the stored snapshot amount', () => {
    const existing = {
      id: 3,
      applicationId: 4,
      cartId: 9,
      sku: 'SKU-1',
      quantity: 1,
      currency: 'USD',
      amount: '10.00',
    };
    (findCart as unknown as jest.Mock).mockReturnValue(Promise.resolve({
      id: 9,
      applicationId: 4,
      userId: 12,
    }));
    (canAccessCart as unknown as jest.Mock).mockReturnValue(true);

    const itemQuery = {
      whereActive: jest.fn(),
      first: jest.fn(() => Promise.resolve(existing)),
      patch: jest.fn(() => Promise.resolve(1)),
      find: jest.fn(() => Promise.resolve({ ...existing, quantity: 3 })),
    };
    itemQuery.whereActive.mockReturnValue(itemQuery);
    (cartItemModel as unknown as jest.Mock).mockReturnValue(itemQuery);
    (pool.transaction as unknown as jest.Mock).mockImplementation(
      (work: (trx: unknown) => unknown) => work({}),
    );

    return createCartItem(
      { applicationId: 4, userId: 12 },
      { ...payload, quantity: 2 },
    ).then((item) => {
      expect(itemQuery.patch).toHaveBeenCalledWith(3, {
        quantity: 3,
        updatedAt: 'current_timestamp',
      });
      expect(item.amount).toBe('10.00');
      expect(item.quantity).toBe(3);
    });
  });
});

describe('updateCartItem', () => {
  it('rejects an item missing from the tenant', () => {
    const itemQuery = {
      whereActive: jest.fn(),
      find: jest.fn(() => Promise.resolve(undefined)),
    };
    itemQuery.whereActive.mockReturnValue(itemQuery);
    (cartItemModel as unknown as jest.Mock).mockReturnValue(itemQuery);

    return updateCartItem(3, { applicationId: 4, userId: 12 }, 2)
      .then(() => {
        throw new Error('Should have rejected.');
      })
      .catch((error: Error) => {
        expect(error.message).toBe('Cart item not found.');
      });
  });

  it('rejects when the parent cart belongs to another user', () => {
    const itemQuery = {
      whereActive: jest.fn(),
      find: jest.fn(() => Promise.resolve({
        id: 3,
        applicationId: 4,
        cartId: 9,
        sku: 'SKU-1',
        quantity: 1,
        currency: 'USD',
        amount: '10.00',
      })),
    };
    itemQuery.whereActive.mockReturnValue(itemQuery);
    (cartItemModel as unknown as jest.Mock).mockReturnValue(itemQuery);
    (findCart as unknown as jest.Mock).mockReturnValue(Promise.resolve({
      id: 9,
      applicationId: 4,
      userId: 99,
    }));
    (canAccessCart as unknown as jest.Mock).mockReturnValue(false);

    return updateCartItem(3, { applicationId: 4, userId: 12 }, 2)
      .then(() => {
        throw new Error('Should have rejected.');
      })
      .catch((error: Error) => {
        expect(error.message).toBe('Cart not found.');
      });
  });
});
