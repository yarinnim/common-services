import type { Model } from 'knexify';
import { type BaseEntity } from 'knexify/types';
import { initModel } from './pool';
import type { JsonObject } from './common.type';

export const channelType = {
  ECOMMERCE: 'ecommerce',
  MINI_SHOP: 'mini_shop',
  POS: 'pos',
};

export type ChannelType = typeof channelType[keyof typeof channelType];

export const orderStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export type OrderStatus = typeof orderStatus[keyof typeof orderStatus];

/** Allowed next statuses for each current order status. */
export const orderStatusTransition: Record<OrderStatus, OrderStatus[]> = {
  [orderStatus.PENDING]: [orderStatus.CONFIRMED, orderStatus.CANCELLED],
  [orderStatus.CONFIRMED]: [orderStatus.PROCESSING, orderStatus.CANCELLED],
  [orderStatus.PROCESSING]: [orderStatus.SHIPPED, orderStatus.CANCELLED],
  [orderStatus.SHIPPED]: [orderStatus.DELIVERED, orderStatus.CANCELLED],
  [orderStatus.DELIVERED]: [],
  [orderStatus.CANCELLED]: [],
};

/** Order header row scoped to an application tenant. */
export type Order = BaseEntity & {
  applicationId: number;
  merchantId: number | null;
  customerId: number | null;
  channelType: ChannelType;
  storeId: number | null;
  status: OrderStatus;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  currency: string;
  metadata: JsonObject;
};

const TABLE = 'order';
const table: Model = initModel(TABLE);
export default table;
