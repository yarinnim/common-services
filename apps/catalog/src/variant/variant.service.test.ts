import { find, createVariant, type VariantWrite } from './variant.service';
import variantModel from '../models/variant.model';
import { find as findProduct } from '../product/product.service';

jest.mock('../models/variant.model', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../product/product.service', () => ({
  find: jest.fn(),
}));

jest.mock('../utils/list-query', () => ({
  applyListSort: (query: { paginate?: unknown }) => query,
}));

const payload: VariantWrite = {
  productId: 2,
  sku: 'SHOE-1',
  options: { size: 'M' },
};

describe('variant.service tenant and SKU rules', () => {
  const findMock = jest.fn();
  const createMock = jest.fn();
  const whereActiveMock = jest.fn();

  beforeEach(() => {
    findMock.mockReset();
    createMock.mockReset();
    whereActiveMock.mockReset();
    whereActiveMock.mockReturnValue({ find: findMock });
    (variantModel as unknown as jest.Mock).mockReturnValue({
      whereActive: whereActiveMock,
      create: createMock,
    });
    (findProduct as jest.Mock).mockResolvedValue({ id: 2, applicationId: 1 });
  });

  it('scopes find to the requested application', () => {
    findMock.mockResolvedValue(undefined);

    return find(8, 3).then((variant) => {
      expect(whereActiveMock).toHaveBeenCalledWith({ applicationId: 3 });
      expect(findMock).toHaveBeenCalledWith(8);
      expect(variant).toBeUndefined();
    });
  });

  it('rejects a product that belongs to another tenant', () => {
    (findProduct as jest.Mock).mockResolvedValue(undefined);

    return createVariant(1, payload).catch((error: Error) => {
      expect(error.message).toBe('Product not found.');
      expect(createMock).not.toHaveBeenCalled();
    });
  });

  it('rejects a duplicate SKU for the same tenant', () => {
    createMock
      .mockResolvedValueOnce({ id: 1 })
      .mockRejectedValueOnce(new Error('SKU already exists.'));
    findMock.mockResolvedValue({ id: 1, sku: payload.sku });

    return createVariant(1, payload)
      .then(() => createVariant(1, payload))
      .catch((error: Error) => {
        expect(error.message).toBe('SKU already exists.');
        expect(createMock).toHaveBeenCalledTimes(2);
      });
  });
});
