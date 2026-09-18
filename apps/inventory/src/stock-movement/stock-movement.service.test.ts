import {
  createStockMovement,
  stockVersionConflict,
  type MovementWrite,
} from './stock-movement.service';
import { stockMovementType } from '../models/stock-movement.model';
import stockModel from '../models/stock.model';
import stockMovementModel from '../models/stock-movement.model';
import { find as findItem } from '../item/item.service';
import { find as findWarehouse } from '../warehouse/warehouse.service';
import { findByLocation } from '../stock/stock.service';

jest.mock('../models/pool', () => ({
  __esModule: true,
  default: {
    raw: () => 'current_timestamp',
    transaction: (run: (trx: Record<string, never>) => unknown) => run({}),
  },
}));

jest.mock('../models/stock.model', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../models/stock-movement.model', () => ({
  __esModule: true,
  stockMovementType: {
    RESTOCK: 'restock',
    SALE: 'sale',
    DAMAGE: 'damage',
    TRANSFER: 'transfer',
  },
  default: jest.fn(),
}));

jest.mock('../item/item.service', () => ({
  find: jest.fn(),
}));

jest.mock('../warehouse/warehouse.service', () => ({
  find: jest.fn(),
}));

jest.mock('../stock/stock.service', () => ({
  findByLocation: jest.fn(),
}));

type Settled = {
  ok: boolean;
  message?: string;
};

type StoredStock = {
  id: number;
  applicationId: number;
  itemId: number;
  warehouseId: number;
  quantity: number;
  version: number;
};

const salePayload: MovementWrite = {
  itemId: 2,
  warehouseId: 3,
  destinationWarehouseId: null,
  type: stockMovementType.SALE,
  quantity: 1,
  reference: null,
  note: null,
};

/**
 * Captures success or failure without rejecting the chain.
 *
 * @example
 * settle(createStockMovement(1, salePayload));
 */
const settle = (job: Promise<unknown>): Promise<Settled> => job
  .then(() => ({ ok: true }))
  .catch((error: Error) => ({ ok: false, message: error.message }));

describe('createStockMovement concurrency', () => {
  const stored: StoredStock = {
    id: 8,
    applicationId: 1,
    itemId: 2,
    warehouseId: 3,
    quantity: 1,
    version: 1,
  };

  beforeEach(() => {
    stored.quantity = 1;
    stored.version = 1;

    (findItem as jest.Mock).mockResolvedValue({ id: 2 });
    (findWarehouse as jest.Mock).mockResolvedValue({ id: 3 });
    (findByLocation as jest.Mock).mockResolvedValue({ ...stored });

    (stockModel as unknown as jest.Mock).mockImplementation(() => ({
      whereActive: (where: { id?: number, version?: number }) => ({
        update: (data: { quantity: number, version: number }) => {
          const hasMatch = where.id === stored.id
            && where.version === stored.version;
          if (!hasMatch) return Promise.resolve(0);
          stored.quantity = data.quantity;
          stored.version = data.version;
          return Promise.resolve(1);
        },
      }),
      create: (data: StoredStock) => Promise.resolve({ id: 8, ...data }),
    }));

    (stockMovementModel as unknown as jest.Mock).mockImplementation(() => ({
      create: (data: MovementWrite) => Promise.resolve({ id: 11, ...data }),
    }));
  });

  it('lets only one of two overlapping sales succeed when qty is 1', () => {
    const first = settle(createStockMovement(1, salePayload));
    const second = settle(createStockMovement(1, salePayload));

    return first.then((firstResult: Settled) => second.then(
      (secondResult: Settled) => {
        const wins = [firstResult, secondResult].filter((row) => row.ok);
        const losses = [firstResult, secondResult].filter((row) => !row.ok);
        expect(wins.length).toBe(1);
        expect(losses.length).toBe(1);
        expect(losses[0].message).toBe(stockVersionConflict);
        expect(stored.quantity).toBe(0);
        expect(stored.version).toBe(2);
      },
    ));
  });

  it('rejects a stale stock version before updating', () => {
    expect.assertions(3);
    const stale: MovementWrite = { ...salePayload, version: 1 };
    stored.version = 2;
    stored.quantity = 4;
    (findByLocation as jest.Mock).mockResolvedValue({ ...stored });

    return createStockMovement(1, stale).catch((error: Error) => {
      expect(error.message).toBe(stockVersionConflict);
      expect(stored.quantity).toBe(4);
      expect(stored.version).toBe(2);
    });
  });
});
