import type { Model } from 'knexify';
import { type BaseEntity } from 'knexify/types';
import { initModel } from './pool';
import type { OrderStatus } from './order.model';

/** Audit row for an order status transition. */
export type OrderStatusHistory = BaseEntity & {
  applicationId: number;
  orderId: number;
  previousStatus: OrderStatus | null;
  newStatus: OrderStatus;
  reason: string | null;
  changedBy: number | null;
};

const TABLE = 'order_status_history';
const table: Model = initModel(TABLE);
export default table;
