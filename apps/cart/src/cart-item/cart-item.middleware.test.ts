import { type Response, type NextFunction } from 'xpref';
import { validateResource } from './cart-item.middleware';
import { find } from './cart-item.service';
import { find as findCart, canAccessCart } from '../cart/cart.service';
import { type CartItemRequest } from './cart-item.middleware';

jest.mock('../models/pool', () => ({
  __esModule: true,
  default: {
    transaction: jest.fn(),
    raw: jest.fn((sql: string) => sql),
  },
  initModel: jest.fn(() => jest.fn()),
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
  guestCart: { EXPIRES_SQL: 'current_timestamp + interval \'7 days\'' },
}));

jest.mock('./cart-item.service', () => {
  const actual = jest.requireActual('./cart-item.service');
  return {
    ...actual,
    find: jest.fn(),
  };
});

jest.mock('../cart/cart.service', () => ({
  find: jest.fn(),
  canAccessCart: jest.fn(),
}));

type MockResponse = Response & {
  status: jest.Mock;
  json: jest.Mock;
};

/**
 * Builds a chained Express-style mock response.
 *
 * @example
 * createResponse();
 */
const createResponse = (): MockResponse => {
  const response = {
    status: jest.fn(),
    json: jest.fn(),
  } as unknown as MockResponse;
  response.status.mockReturnValue(response);
  response.json.mockReturnValue(response);
  return response;
};

/**
 * Waits for a lookup promise and one extra tick of follow-up handlers.
 *
 * @example
 * waitForLookup(lookup);
 */
const waitForLookup = (lookup: Promise<unknown>) => lookup
  .then(() => Promise.resolve())
  .catch(() => Promise.resolve());

describe('validateResource', () => {
  const next = jest.fn() as unknown as NextFunction;

  beforeEach(() => {
    (next as unknown as jest.Mock).mockReset();
    (find as unknown as jest.Mock).mockReset();
    (findCart as unknown as jest.Mock).mockReset();
    (canAccessCart as unknown as jest.Mock).mockReset();
  });

  it('rejects a missing application', () => {
    const req = {
      params: { id: '1' },
      headers: {},
    } as unknown as CartItemRequest;
    const res = createResponse();

    validateResource(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Application not found.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects an invalid item id', () => {
    const req = {
      application: { id: 4 },
      params: { id: 'abc' },
      userId: 12,
    } as unknown as CartItemRequest;
    const res = createResponse();

    validateResource(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Cart item not found.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects an item on another user cart', () => {
    const itemLookup = Promise.resolve({
      id: 3,
      applicationId: 4,
      cartId: 9,
      sku: 'SKU-1',
    });
    const cartLookup = Promise.resolve({
      id: 9,
      applicationId: 4,
      userId: 99,
    });
    (find as unknown as jest.Mock).mockReturnValue(itemLookup);
    (findCart as unknown as jest.Mock).mockReturnValue(cartLookup);
    (canAccessCart as unknown as jest.Mock).mockReturnValue(false);

    const req = {
      application: { id: 4 },
      params: { id: '3' },
      userId: 12,
    } as unknown as CartItemRequest;
    const res = createResponse();

    validateResource(req, res, next);

    return waitForLookup(itemLookup)
      .then(() => waitForLookup(cartLookup))
      .then(() => {
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.json).toHaveBeenCalledWith({
          message: 'Cart item not found.',
        });
        expect(next).not.toHaveBeenCalled();
      });
  });

  it('attaches an item on a cart the user owns', () => {
    const item = {
      id: 3,
      applicationId: 4,
      cartId: 9,
      sku: 'SKU-1',
    };
    const cart = {
      id: 9,
      applicationId: 4,
      userId: 12,
    };
    const itemLookup = Promise.resolve(item);
    const cartLookup = Promise.resolve(cart);
    (find as unknown as jest.Mock).mockReturnValue(itemLookup);
    (findCart as unknown as jest.Mock).mockReturnValue(cartLookup);
    (canAccessCart as unknown as jest.Mock).mockReturnValue(true);

    const req = {
      application: { id: 4 },
      params: { id: '3' },
      userId: 12,
    } as unknown as CartItemRequest;
    const res = createResponse();

    validateResource(req, res, next);

    return waitForLookup(itemLookup)
      .then(() => waitForLookup(cartLookup))
      .then(() => {
        expect(req.cartItem).toEqual(item);
        expect(req.cart).toEqual(cart);
        expect(next).toHaveBeenCalled();
      });
  });
});
