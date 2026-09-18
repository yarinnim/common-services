import { type Response } from 'xpref';
import {
  getAction,
  postAction,
  updateAction,
} from './cart-item.controller';
import {
  searchCartItems,
  createCartItem,
  updateCartItem,
} from './cart-item.service';
import { type ApplicationRequest } from '../middleware/validate-application.middleware';
import { type CartItemRequest } from './cart-item.middleware';

jest.mock('../log-client', () => ({
  __esModule: true,
  default: () => ({ error: jest.fn() }),
}));

jest.mock('../config', () => ({
  applicationHeader: {
    ID: 'app-id',
    SECRET_KEY: 'app-secret-key',
    USER_ID: 'x-user-id',
    SESSION_ID: 'x-session-id',
  },
}));

jest.mock('./cart-item.service', () => ({
  searchCartItems: jest.fn(),
  createCartItem: jest.fn(),
  updateCartItem: jest.fn(),
  removeCartItem: jest.fn(),
  clearCartItems: jest.fn(),
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

describe('cart-item.controller', () => {
  it('passes page and pageSize from the query to search', () => {
    (searchCartItems as unknown as jest.Mock).mockReturnValue(
      Promise.resolve({ data: [] }),
    );
    const req = {
      query: { cartId: '9', q: 'SKU', page: '2', pageSize: '10' },
      application: { id: 4 },
      userId: 12,
      headers: { 'app-id': 'uuid', 'app-secret-key': 'secret' },
    } as unknown as ApplicationRequest;
    const res = createResponse();

    return getAction(req, res).then(() => {
      expect(searchCartItems).toHaveBeenCalledWith(
        {
          applicationId: 4,
          userId: 12,
          sessionId: undefined,
          appId: 'uuid',
          secretKey: 'secret',
        },
        {
          q: 'SKU',
          page: 2,
          pageSize: 10,
          token: undefined,
          cartId: 9,
        },
      );
      expect(res.json).toHaveBeenCalledWith({ data: [] });
    });
  });

  it('returns { message } when quantity is not greater than 0', () => {
    const req = {
      body: {
        cartId: 9,
        sku: 'SKU-1',
        quantity: 0,
        currency: 'USD',
        amount: '10.00',
      },
      application: { id: 4 },
      userId: 12,
      headers: {},
    } as unknown as ApplicationRequest;
    const res = createResponse();

    return postAction(req, res).then(() => {
      expect(createCartItem).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Quantity must be greater than 0.',
      });
    });
  });

  it('returns { message } when SKU is missing', () => {
    const req = {
      body: {
        cartId: 9,
        quantity: 1,
        currency: 'USD',
        amount: '10.00',
      },
      application: { id: 4 },
      userId: 12,
      headers: {},
    } as unknown as ApplicationRequest;
    const res = createResponse();

    return postAction(req, res).then(() => {
      expect(createCartItem).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'SKU is required.' });
    });
  });

  it('returns { message } when an update quantity is invalid', () => {
    const req = {
      body: { quantity: -1 },
      application: { id: 4 },
      userId: 12,
      headers: {},
      cartItem: { id: 3, cartId: 9 },
    } as unknown as CartItemRequest;
    const res = createResponse();

    return updateAction(req, res).then(() => {
      expect(updateCartItem).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Quantity must be greater than 0.',
      });
    });
  });
});
