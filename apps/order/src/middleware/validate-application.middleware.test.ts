import { type Response, type NextFunction } from 'xpref';
import { validateApplication } from './validate-application.middleware';
import applicationModel from '../models/application.model';
import { type ApplicationRequest } from './validate-application.middleware';

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

jest.mock('../models/application.model', () => ({
  __esModule: true,
  default: jest.fn(),
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

describe('validateApplication', () => {
  const next = jest.fn() as unknown as NextFunction;

  beforeEach(() => {
    (next as unknown as jest.Mock).mockReset();
    (applicationModel as unknown as jest.Mock).mockReset();
  });

  it('skips validation for the /test path', () => {
    const req = { path: '/test', headers: {} } as ApplicationRequest;
    const res = createResponse();
    validateApplication(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('returns 401 when app-id is missing', () => {
    const req = {
      path: '/orders',
      headers: { 'app-secret-key': 'secret' },
    } as unknown as ApplicationRequest;
    const res = createResponse();
    validateApplication(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'App ID not provided.',
    });
  });

  it('attaches the application when credentials are valid', () => {
    const first = jest.fn().mockReturnValue(Promise.resolve({
      id: 1,
      uuid: 'a1111111-1111-4111-8111-111111111111',
      secretKey: 'secret',
      code: 'order',
      name: 'Order',
      setting: {},
    }));
    (applicationModel as unknown as jest.Mock).mockReturnValue({
      whereActive: () => ({ first }),
    });

    const req = {
      path: '/orders',
      headers: {
        'app-id': 'a1111111-1111-4111-8111-111111111111',
        'app-secret-key': 'secret',
        'x-user-id': '9',
      },
    } as unknown as ApplicationRequest;
    const res = createResponse();

    validateApplication(req, res, next);
    return waitForLookup(first()).then(() => {
      expect(req.application?.id).toBe(1);
      expect(req.userId).toBe(9);
      expect(next).toHaveBeenCalled();
    });
  });
});
