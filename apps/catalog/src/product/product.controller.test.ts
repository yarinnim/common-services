import { type Response } from 'xpref';
import { getAction, postAction } from './product.controller';
import { searchProducts, createProduct } from './product.service';
import { type ApplicationRequest } from '../middleware/validate-application.middleware';

jest.mock('../log-client', () => ({
  __esModule: true,
  default: () => ({ error: jest.fn() }),
}));

jest.mock('./product.service', () => ({
  searchProducts: jest.fn(),
  createProduct: jest.fn(),
  updateProduct: jest.fn(),
  removeProduct: jest.fn(),
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

describe('product.controller', () => {
  it('passes page and pageSize from the query to search', () => {
    (searchProducts as jest.Mock).mockResolvedValue({ data: [] });
    const req = {
      query: { q: 'shoe', page: '2', pageSize: '10' },
      application: { id: 1 },
    } as unknown as ApplicationRequest;
    const res = createResponse();

    return getAction(req, res).then(() => {
      expect(searchProducts).toHaveBeenCalledWith(1, {
        q: 'shoe',
        page: 2,
        pageSize: 10,
        token: undefined,
        categoryId: undefined,
        attributeKey: undefined,
        attributeValue: undefined,
        sort: undefined,
        direction: undefined,
      });
      expect(res.json).toHaveBeenCalledWith({ data: [] });
    });
  });

  it('returns { message } when the product name is missing', () => {
    const req = {
      body: { attributes: {} },
      application: { id: 1 },
      query: {},
    } as unknown as ApplicationRequest;
    const res = createResponse();

    return postAction(req, res).then(() => {
      expect(createProduct).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Name is required.' });
    });
  });

  it('returns { message } when sort direction is invalid', () => {
    const req = {
      query: { direction: 'sideways' },
      application: { id: 1 },
    } as unknown as ApplicationRequest;
    const res = createResponse();

    return getAction(req, res).then(() => {
      expect(searchProducts).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Invalid sort direction.',
      });
    });
  });
});
