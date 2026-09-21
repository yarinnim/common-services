jest.mock('../config', () => ({
  applicationHeader: {
    ID: 'app-id',
    SECRET_KEY: 'app-secret-key',
    USER_ID: 'x-user-id',
  },
  applicationExcludedPath: {
    TEST: '/test',
  },
}));

jest.mock('../models/pool', () => ({
  __esModule: true,
  default: {
    transaction: jest.fn(),
    raw: jest.fn((sql: string) => sql),
  },
  initModel: jest.fn(() => jest.fn()),
}));

jest.mock('./order.service', () => ({
  find: jest.fn(),
}));

import { type Response, type NextFunction } from 'xpref';
import { validateResource, type OrderRequest } from './order.middleware';
import { find } from './order.service';
import { orderStatus, channelType } from '../models/order.model';

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

describe('order.middleware', () => {
  const next = jest.fn() as unknown as NextFunction;

  beforeEach(() => {
    (next as unknown as jest.Mock).mockReset();
    (find as unknown as jest.Mock).mockReset();
  });

  it('returns 401 when application is missing', () => {
    const req = { params: { id: '1' } } as unknown as OrderRequest;
    const res = createResponse();
    validateResource(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('attaches the order when found', () => {
    const order = {
      id: 1,
      applicationId: 2,
      status: orderStatus.PENDING,
      channelType: channelType.ECOMMERCE,
    };
    const lookup = Promise.resolve(order);
    (find as unknown as jest.Mock).mockReturnValue(lookup);
    const req = {
      application: { id: 2 },
      params: { id: '1' },
    } as unknown as OrderRequest;
    const res = createResponse();

    validateResource(req, res, next);
    return waitForLookup(lookup).then(() => {
      expect(req.order).toEqual(order);
      expect(next).toHaveBeenCalled();
    });
  });
});
