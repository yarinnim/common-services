import { type Response } from 'xpref';
import { postAction } from './stock-movement.controller';
import {
  createStockMovement,
  stockVersionConflict,
} from './stock-movement.service';
import { type ApplicationRequest } from '../middleware/validate-application.middleware';

jest.mock('../log-client', () => ({
  __esModule: true,
  default: () => ({ error: jest.fn() }),
}));

jest.mock('./stock-movement.service', () => ({
  isStockMovementType: () => true,
  searchStockMovements: jest.fn(),
  createStockMovement: jest.fn(),
  stockVersionConflict: 'Stock version conflict.',
}));

type MockResponse = Response & {
  status: jest.Mock;
  json: jest.Mock;
};

describe('postAction concurrency', () => {
  it('returns 409 when the stock version is stale', () => {
    (createStockMovement as jest.Mock).mockRejectedValue(
      new Error(stockVersionConflict),
    );

    const req = {
      body: {
        itemId: 2,
        warehouseId: 3,
        type: 'sale',
        quantity: 1,
      },
      application: { id: 1 },
      query: {},
    } as unknown as ApplicationRequest;

    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    } as unknown as MockResponse;

    return postAction(req, res).then(() => {
      expect(res.status).toHaveBeenCalledWith(409);
      expect(res.json).toHaveBeenCalledWith({
        message: stockVersionConflict,
      });
    });
  });
});
