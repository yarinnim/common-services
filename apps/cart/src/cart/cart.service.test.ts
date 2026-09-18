import { canAccessCart, createCart, searchCarts } from './cart.service';
import type { Cart } from './cart.service';

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
});
