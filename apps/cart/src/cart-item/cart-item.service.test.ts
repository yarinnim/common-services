import { searchCartItems, createCartItem } from './cart-item.service';
import { find as findCart, canAccessCart } from '../cart/cart.service';

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
  it('rejects a missing parent cart', () => {
    (findCart as unknown as jest.Mock).mockReturnValue(Promise.resolve(undefined));

    return createCartItem(
      { applicationId: 4, userId: 12 },
      {
        cartId: 9,
        productId: null,
        variantId: null,
        sku: 'SKU-1',
        quantity: 1,
        currency: 'USD',
        amount: '10.00',
      },
    ).then(() => {
      throw new Error('Should have rejected.');
    }).catch((error: Error) => {
      expect(error.message).toBe('Cart not found.');
    });
  });
});
