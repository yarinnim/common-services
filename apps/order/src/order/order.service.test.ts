jest.mock('../models/pool', () => ({
  __esModule: true,
  default: {
    transaction: jest.fn(),
    raw: jest.fn((sql: string) => sql),
  },
  initModel: jest.fn(() => jest.fn()),
}));

jest.mock('../models/order.model', () => ({
  __esModule: true,
  channelType: {
    ECOMMERCE: 'ecommerce',
    MINI_SHOP: 'mini_shop',
    POS: 'pos',
  },
  orderStatus: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled',
  },
  orderStatusTransition: {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['shipped', 'cancelled'],
    shipped: ['delivered', 'cancelled'],
    delivered: [],
    cancelled: [],
  },
  default: jest.fn(),
}));

jest.mock('../models/order-item.model', () => ({
  __esModule: true,
  default: jest.fn(),
}));

jest.mock('../models/order-status-history.model', () => ({
  __esModule: true,
  default: jest.fn(),
}));

import {
  canTransitionStatus,
  isChannelType,
  isOrderStatus,
} from './order.service';
import { orderStatus } from '../models/order.model';

describe('order.service helpers', () => {
  it('accepts known channel types', () => {
    expect(isChannelType('ecommerce')).toBe(true);
    expect(isChannelType('unknown')).toBe(false);
  });

  it('accepts known order statuses', () => {
    expect(isOrderStatus(orderStatus.PENDING)).toBe(true);
    expect(isOrderStatus('broken')).toBe(false);
  });

  it('allows pending to confirmed and rejects delivered to pending', () => {
    expect(canTransitionStatus(
      orderStatus.PENDING,
      orderStatus.CONFIRMED,
    )).toBe(true);
    expect(canTransitionStatus(
      orderStatus.DELIVERED,
      orderStatus.PENDING,
    )).toBe(false);
  });
});
