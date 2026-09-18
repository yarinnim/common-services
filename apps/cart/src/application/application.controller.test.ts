import { type Response } from 'xpref';
import { getAction, postAction } from './application.controller';
import {
  searchApplications,
  createApplication,
} from './application.service';
import { type ApplicationRequest } from '../middleware/validate-application.middleware';

jest.mock('../log-client', () => ({
  __esModule: true,
  default: () => ({ error: jest.fn() }),
}));

jest.mock('./application.service', () => ({
  searchApplications: jest.fn(),
  createApplication: jest.fn(),
  updateApplication: jest.fn(),
  removeApplication: jest.fn(),
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

describe('application.controller', () => {
  it('passes page and pageSize from the query to search', () => {
    (searchApplications as unknown as jest.Mock).mockReturnValue(
      Promise.resolve({ data: [] }),
    );
    const req = {
      query: { q: 'cart', page: '2', pageSize: '10' },
    } as unknown as ApplicationRequest;
    const res = createResponse();

    return getAction(req, res).then(() => {
      expect(searchApplications).toHaveBeenCalledWith({
        q: 'cart',
        page: 2,
        pageSize: 10,
        token: undefined,
      });
      expect(res.json).toHaveBeenCalledWith({ data: [] });
    });
  });

  it('returns { message } when the application code is missing', () => {
    const req = {
      body: { name: 'Cart' },
      query: {},
    } as unknown as ApplicationRequest;
    const res = createResponse();

    return postAction(req, res).then(() => {
      expect(createApplication).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Code is required.',
      });
    });
  });
});
