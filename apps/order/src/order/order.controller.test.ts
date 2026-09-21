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

jest.mock('../log-client', () => ({
  __esModule: true,
  default: () => ({ error: jest.fn() }),
}));

jest.mock('./order.service', () => ({
  ...jest.requireActual('./order.service'),
  searchOrders: jest.fn(),
  createOrder: jest.fn(),
  findDetail: jest.fn(),
  transitionOrderStatus: jest.fn(),
  cancelOrder: jest.fn(),
}));

import { type Response } from 'xpref';
import {
  getAction,
  postAction,
  statusAction,
  cancelAction,
} from './order.controller';
import {
  searchOrders,
  createOrder,
  transitionOrderStatus,
  cancelOrder,
} from './order.service';
import { type ApplicationRequest } from '../middleware/validate-application.middleware';
import { type OrderRequest } from './order.middleware';
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

describe('order.controller', () => {
  it('lists orders scoped to the application', () => {
    (searchOrders as unknown as jest.Mock).mockReturnValue(
      Promise.resolve({ data: [] }),
    );
    const req = {
      application: { id: 1 },
      query: { status: orderStatus.PENDING, page: '1', pageSize: '20' },
    } as unknown as ApplicationRequest;
    const res = createResponse();

    return getAction(req, res).then(() => {
      expect(searchOrders).toHaveBeenCalledWith(1, expect.objectContaining({
        status: orderStatus.PENDING,
        page: 1,
        pageSize: 20,
      }));
      expect(res.json).toHaveBeenCalledWith({ data: [] });
    });
  });

  it('rejects create when items are missing', () => {
    const req = {
      application: { id: 1 },
      body: {
        channelType: channelType.ECOMMERCE,
        subtotal: 10,
        grandTotal: 10,
        currency: 'USD',
        items: [],
      },
      query: {},
    } as unknown as ApplicationRequest;
    const res = createResponse();

    return postAction(req, res).then(() => {
      expect(createOrder).not.toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'At least one order item is required.',
      });
    });
  });

  it('transitions order status', () => {
    (transitionOrderStatus as unknown as jest.Mock).mockReturnValue(
      Promise.resolve({ id: 1, status: orderStatus.CONFIRMED }),
    );
    const req = {
      application: { id: 1 },
      userId: 9,
      order: {
        id: 1,
        applicationId: 1,
        status: orderStatus.PENDING,
      },
      body: { status: orderStatus.CONFIRMED },
    } as unknown as OrderRequest;
    const res = createResponse();

    return statusAction(req, res).then(() => {
      expect(transitionOrderStatus).toHaveBeenCalledWith(
        req.order,
        expect.objectContaining({
          status: orderStatus.CONFIRMED,
          changedBy: 9,
        }),
      );
    });
  });

  it('cancels an order', () => {
    (cancelOrder as unknown as jest.Mock).mockReturnValue(
      Promise.resolve({ id: 1, status: orderStatus.CANCELLED }),
    );
    const req = {
      application: { id: 1 },
      userId: 9,
      order: {
        id: 1,
        applicationId: 1,
        status: orderStatus.PENDING,
      },
      body: { reason: 'Customer request' },
    } as unknown as OrderRequest;
    const res = createResponse();

    return cancelAction(req, res).then(() => {
      expect(cancelOrder).toHaveBeenCalledWith(
        req.order,
        'Customer request',
        9,
      );
    });
  });
});
