import { catalogService, inventoryService } from '../config';
import { syncCartItemWrite } from './catalog-sync';

jest.mock('../config', () => ({
  catalogService: { BASE_URL: '' },
  inventoryService: { BASE_URL: '' },
  applicationHeader: {
    ID: 'app-id',
    SECRET_KEY: 'app-secret-key',
  },
}));

type FetchResponse = {
  ok: boolean;
  status: number;
  text: () => Promise<string>;
};

const payload = {
  cartId: 9,
  productId: 2,
  variantId: 7,
  sku: 'SKU-1',
  quantity: 2,
  currency: 'USD',
  amount: '10.00',
};

const auth = {
  appId: 'app-uuid',
  secretKey: 'app-secret',
};

/**
 * Builds a JSON fetch response for catalog and inventory stubs.
 *
 * @example
 * jsonResponse(200, { id: 7 });
 */
const jsonResponse = (status: number, body: unknown): Promise<FetchResponse> =>
  Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(JSON.stringify(body)),
  });

describe('syncCartItemWrite', () => {
  const fetchMock = jest.fn();

  beforeEach(() => {
    catalogService.BASE_URL = '';
    inventoryService.BASE_URL = '';
    fetchMock.mockReset();
    global.fetch = fetchMock as unknown as typeof fetch;
  });

  it('keeps the request snapshot when catalog and inventory URLs are empty', () =>
    syncCartItemWrite(payload, auth).then((line) => {
      expect(fetchMock).not.toHaveBeenCalled();
      expect(line).toEqual(payload);
    }));

  it('rejects when catalog is enabled without tenant credentials', () => {
    catalogService.BASE_URL = 'http://catalog.test';
    return syncCartItemWrite(payload, {}).then(() => {
      throw new Error('Should have rejected.');
    }).catch((error: Error) => {
      expect(error.message).toBe('Application not found.');
    });
  });

  it('rejects when the variant is not in the tenant catalog', () => {
    catalogService.BASE_URL = 'http://catalog.test';
    fetchMock.mockReturnValue(jsonResponse(404, {
      message: 'Variant not found.',
    }));
    return syncCartItemWrite(payload, auth).then(() => {
      throw new Error('Should have rejected.');
    }).catch((error: Error) => {
      expect(error.message).toBe('Item is not in the catalog.');
    });
  });

  it('rejects when the requested SKU does not match the variant', () => {
    catalogService.BASE_URL = 'http://catalog.test';
    fetchMock.mockReturnValue(jsonResponse(200, {
      id: 7,
      productId: 2,
      sku: 'OTHER',
    }));
    return syncCartItemWrite(payload, auth).then(() => {
      throw new Error('Should have rejected.');
    }).catch((error: Error) => {
      expect(error.message).toBe('Item is not in the catalog.');
    });
  });

  it('rejects when no catalog price exists for the snapshot currency', () => {
    catalogService.BASE_URL = 'http://catalog.test';
    fetchMock.mockImplementation((url: string) => {
      if (`${url}`.includes('/variants/')) {
        return jsonResponse(200, { id: 7, productId: 2, sku: 'SKU-1' });
      }
      return jsonResponse(200, { data: [] });
    });
    return syncCartItemWrite(payload, auth).then(() => {
      throw new Error('Should have rejected.');
    }).catch((error: Error) => {
      expect(error.message).toBe('Price is not in the catalog.');
    });
  });

  it('keeps the request amount when catalog returns a different price', () => {
    catalogService.BASE_URL = 'http://catalog.test';
    fetchMock.mockImplementation((url: string) => {
      if (`${url}`.includes('/variants/')) {
        return jsonResponse(200, { id: 7, productId: 2, sku: 'SKU-1' });
      }
      return jsonResponse(200, {
        data: [{ currency: 'USD', amount: '99.00' }],
      });
    });
    return syncCartItemWrite(payload, auth).then((line) => {
      expect(line.amount).toBe('10.00');
      expect(line.currency).toBe('USD');
      expect(line.sku).toBe('SKU-1');
      expect(line.variantId).toBe(7);
      expect(line.productId).toBe(2);
    });
  });

  it('rejects when inventory stock is below the requested quantity', () => {
    inventoryService.BASE_URL = 'http://inventory.test';
    fetchMock.mockImplementation((url: string) => {
      if (`${url}`.includes('/items')) {
        return jsonResponse(200, { data: [{ id: 4, sku: 'SKU-1' }] });
      }
      return jsonResponse(200, { data: [{ quantity: 1 }] });
    });
    return syncCartItemWrite(payload, auth).then(() => {
      throw new Error('Should have rejected.');
    }).catch((error: Error) => {
      expect(error.message).toBe('Insufficient stock quantity.');
    });
  });
});
