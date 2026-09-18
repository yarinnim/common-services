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
  });

  it('skips credential checks for /test', () => {
    const req = {
      path: '/test',
      headers: {},
    } as unknown as ApplicationRequest;
    const res = createResponse();

    validateApplication(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('rejects a missing app-id header', () => {
    const req = {
      path: '/products',
      headers: { 'app-secret-key': 'secret' },
    } as unknown as ApplicationRequest;
    const res = createResponse();

    validateApplication(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: 'App ID not provided.' });
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects a missing app secret key header', () => {
    const req = {
      path: '/products',
      headers: { 'app-id': 'uuid-1' },
    } as unknown as ApplicationRequest;
    const res = createResponse();

    validateApplication(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'App secret key not provided.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects invalid application credentials', () => {
    const lookup = Promise.resolve(undefined);
    (applicationModel as unknown as jest.Mock).mockReturnValue({
      whereActive: () => ({
        first: () => lookup,
      }),
    });

    const req = {
      path: '/products',
      headers: { 'app-id': 'uuid-1', 'app-secret-key': 'bad' },
    } as unknown as ApplicationRequest;
    const res = createResponse();

    validateApplication(req, res, next);

    return waitForLookup(lookup).then(() => {
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid application credentials.',
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  it('attaches the tenant without the secret key', () => {
    const lookup = Promise.resolve({
      id: 4,
      uuid: 'uuid-1',
      secretKey: 'secret',
      code: 'catalog',
      name: 'Catalog',
      setting: {},
    });
    (applicationModel as unknown as jest.Mock).mockReturnValue({
      whereActive: () => ({
        first: () => lookup,
      }),
    });

    const req = {
      path: '/products',
      headers: {
        'app-id': 'uuid-1',
        'app-secret-key': 'secret',
        'x-user-id': '12',
      },
    } as unknown as ApplicationRequest;
    const res = createResponse();

    validateApplication(req, res, next);

    return waitForLookup(lookup).then(() => {
      expect(req.application).toEqual({
        id: 4,
        uuid: 'uuid-1',
        code: 'catalog',
        name: 'Catalog',
        setting: {},
      });
      expect(req.userId).toBe(12);
      expect(next).toHaveBeenCalled();
    });
  });
});
