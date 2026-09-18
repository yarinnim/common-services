import { type Response, type NextFunction } from 'xpref';
import { validateResource } from './cart.middleware';
import { find } from './cart.service';
import { type CartRequest } from './cart.middleware';

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
  guestCart: { EXPIRES_SQL: "current_timestamp + interval '7 days'" },
}));

jest.mock('./cart.service', () => {
  const actual = jest.requireActual('./cart.service');
  return {
    ...actual,
    find: jest.fn(),
  };
});

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
  });

  it('rejects a missing application', () => {
    const req = {
      params: { id: '1' },
      headers: {},
    } as unknown as CartRequest;
    const res = createResponse();

    validateResource(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Application not found.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects an invalid cart id', () => {
    const req = {
      application: { id: 4 },
      params: { id: 'abc' },
      userId: 12,
    } as unknown as CartRequest;
    const res = createResponse();

    validateResource(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: 'Cart not found.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects a cart owned by another user', () => {
    const lookup = Promise.resolve({
      id: 8,
      applicationId: 4,
      userId: 99,
      sessionId: null,
      status: 'active',
      expiresAt: null,
    });
    (find as unknown as jest.Mock).mockReturnValue(lookup);

    const req = {
      application: { id: 4 },
      params: { id: '8' },
      userId: 12,
    } as unknown as CartRequest;
    const res = createResponse();

    validateResource(req, res, next);

    return waitForLookup(lookup).then(() => {
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: 'Cart not found.' });
      expect(next).not.toHaveBeenCalled();
    });
  });

  it('attaches a cart the user owns', () => {
    const cart = {
      id: 8,
      applicationId: 4,
      userId: 12,
      sessionId: null,
      status: 'active',
      expiresAt: null,
    };
    const lookup = Promise.resolve(cart);
    (find as unknown as jest.Mock).mockReturnValue(lookup);

    const req = {
      application: { id: 4 },
      params: { id: '8' },
      userId: 12,
    } as unknown as CartRequest;
    const res = createResponse();

    validateResource(req, res, next);

    return waitForLookup(lookup).then(() => {
      expect(req.cart).toEqual(cart);
      expect(next).toHaveBeenCalled();
    });
  });
});
