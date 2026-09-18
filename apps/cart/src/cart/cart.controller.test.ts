import { type Response } from 'xpref';
import { getAction, postAction } from './cart.controller';
import { searchCarts, createCart } from './cart.service';
import { type ApplicationRequest } from '../middleware/validate-application.middleware';

jest.mock('../log-client', () => ({
  __esModule: true,
  default: () => ({ error: jest.fn() }),
}));

jest.mock('./cart.service', () => ({
  searchCarts: jest.fn(),
  createCart: jest.fn(),
  updateCart: jest.fn(),
  removeCart: jest.fn(),
  canAccessCart: jest.fn(),
  find: jest.fn(),
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

describe('cart.controller', () => {
  it('passes page and pageSize from the query to search', () => {
    (searchCarts as unknown as jest.Mock).mockReturnValue(
      Promise.resolve({ data: [] }),
    );
    const req = {
      query: { q: 'active', page: '2', pageSize: '10' },
      application: { id: 4 },
      userId: 12,
    } as unknown as ApplicationRequest;
    const res = createResponse();

    return getAction(req, res).then(() => {
      expect(searchCarts).toHaveBeenCalledWith(4, {
        q: 'active',
        page: 2,
        pageSize: 10,
        token: undefined,
        userId: 12,
        sessionId: undefined,
      });
      expect(res.json).toHaveBeenCalledWith({ data: [] });
    });
  });

  it('returns { message } when user and session are missing', () => {
    const req = {
      query: { page: '1', pageSize: '20' },
      application: { id: 4 },
    } as unknown as ApplicationRequest;
    const res = createResponse();

    return getAction(req, res).then(() => {
      expect(searchCarts).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User id or session id is required.',
      });
    });
  });

  it('returns { message } when the session id is too long', () => {
    const req = {
      body: {},
      application: { id: 4 },
      sessionId: 's'.repeat(65),
    } as unknown as ApplicationRequest;
    const res = createResponse();

    return postAction(req, res).then(() => {
      expect(createCart).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Session id is invalid.',
      });
    });
  });
});
