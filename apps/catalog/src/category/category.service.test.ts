import {
  find,
  createCategory,
  updateCategory,
  type CategoryWrite,
} from './category.service';
import categoryModel from '../models/category.model';

jest.mock('../models/category.model', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../utils/list-query', () => ({
  applyListSort: (query: { paginate?: unknown }) => query,
}));

const payload: CategoryWrite = {
  parentId: 2,
  name: 'Child',
  description: null,
};

describe('category.service tenant rules', () => {
  const findMock = jest.fn();
  const createMock = jest.fn();
  const patchMock = jest.fn();
  const whereActiveMock = jest.fn();

  beforeEach(() => {
    findMock.mockReset();
    createMock.mockReset();
    patchMock.mockReset();
    whereActiveMock.mockReset();
    whereActiveMock.mockReturnValue({ find: findMock });
    (categoryModel as unknown as jest.Mock).mockReturnValue({
      whereActive: whereActiveMock,
      create: createMock,
      patch: patchMock,
    });
  });

  it('scopes find to the requested application', () => {
    findMock.mockResolvedValue(undefined);

    return find(9, 2).then((category) => {
      expect(whereActiveMock).toHaveBeenCalledWith({ applicationId: 2 });
      expect(findMock).toHaveBeenCalledWith(9);
      expect(category).toBeUndefined();
    });
  });

  it('rejects a parent that belongs to another tenant', () => {
    findMock.mockResolvedValue(undefined);

    return createCategory(1, payload).catch((error: Error) => {
      expect(error.message).toBe('Parent category not found.');
      expect(whereActiveMock).toHaveBeenCalledWith({ applicationId: 1 });
      expect(createMock).not.toHaveBeenCalled();
    });
  });

  it('rejects a category as its own parent', () => {
    const ownParent: CategoryWrite = {
      parentId: 4,
      name: 'Shoes',
      description: null,
    };

    expect(() => updateCategory(4, 1, ownParent)).toThrow(
      'Category cannot be its own parent.',
    );
    expect(patchMock).not.toHaveBeenCalled();
  });
});
