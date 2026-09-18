import { type Response, type NextFunction } from 'xpref';
import { validateResource } from './application.middleware';
import { find } from './application.service';
import { type ApplicationDetailRequest } from './application.middleware';

jest.mock('./application.service', () => ({
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

  it('rejects an invalid application id', () => {
    const req = {
      params: { id: 'abc' },
    } as unknown as ApplicationDetailRequest;
    const res = createResponse();

    validateResource(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Application not found.',
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('rejects a missing application', () => {
    const lookup = Promise.resolve(undefined);
    (find as unknown as jest.Mock).mockReturnValue(lookup);
    const req = {
      params: { id: '4' },
    } as unknown as ApplicationDetailRequest;
    const res = createResponse();

    validateResource(req, res, next);

    return waitForLookup(lookup).then(() => {
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Application not found.',
      });
      expect(next).not.toHaveBeenCalled();
    });
  });

  it('attaches the application resource', () => {
    const application = { id: 4, uuid: 'uuid-1', code: 'cart', name: 'Cart' };
    const lookup = Promise.resolve(application);
    (find as unknown as jest.Mock).mockReturnValue(lookup);
    const req = {
      params: { id: '4' },
    } as unknown as ApplicationDetailRequest;
    const res = createResponse();

    validateResource(req, res, next);

    return waitForLookup(lookup).then(() => {
      expect(req.targetApplication).toEqual(application);
      expect(next).toHaveBeenCalled();
    });
  });
});
