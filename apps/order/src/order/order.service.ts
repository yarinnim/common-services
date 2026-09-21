import { type Transaction } from 'knexify';
import { type Paging } from 'knexify/types';
import pool from '../models/pool';
import orderModel, {
  type Order,
  type OrderStatus,
  type ChannelType,
  channelType,
  orderStatus,
  orderStatusTransition,
} from '../models/order.model';
import orderItemModel, { type OrderItem } from '../models/order-item.model';
import orderStatusHistoryModel, {
  type OrderStatusHistory,
} from '../models/order-status-history.model';
import type { JsonObject } from '../models/common.type';

const SEARCH_FIELDS = ['status', 'channelType', 'currency'];

export type OrderItemWrite = {
  productId: number | null;
  sku: string;
  name: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  metadata: JsonObject;
};

export type OrderWrite = {
  merchantId: number | null;
  customerId: number | null;
  channelType: ChannelType;
  storeId: number | null;
  subtotal: number;
  taxTotal: number;
  discountTotal: number;
  grandTotal: number;
  currency: string;
  metadata: JsonObject;
  items: OrderItemWrite[];
};

export type OrderSearch = Paging & {
  q?: string;
  status?: OrderStatus;
  channelType?: ChannelType;
  merchantId?: number;
  fromDate?: string;
  toDate?: string;
};

export type StatusTransition = {
  status: OrderStatus;
  reason: string | null;
  changedBy?: number;
};

export type OrderDetail = Order & {
  items: OrderItem[];
  statusHistory: OrderStatusHistory[];
};

type InsertItemContext = {
  applicationId: number;
  orderId: number;
  items: OrderItemWrite[];
  index: number;
  trx: Transaction;
};

type CreateOrderContext = {
  applicationId: number;
  payload: OrderWrite;
  changedBy?: number;
};

/**
 * Checks whether a channel type value is known.
 *
 * @example
 * isChannelType('ecommerce');
 */
export const isChannelType = (value: string): boolean =>
  Object.values(channelType).includes(value as ChannelType);

/**
 * Checks whether an order status value is known.
 *
 * @example
 * isOrderStatus('pending');
 */
export const isOrderStatus = (value: string): boolean =>
  Object.values(orderStatus).includes(value as OrderStatus);

/**
 * Checks whether a status transition is allowed.
 *
 * @example
 * canTransitionStatus('pending', 'confirmed');
 */
export const canTransitionStatus = (
  current: OrderStatus,
  next: OrderStatus,
): boolean => (orderStatusTransition[current] || []).includes(next);

/**
 * Finds an active order for an application.
 *
 * @example
 * find(1, 2).then((order) => order);
 */
export const find = (id: number, applicationId: number) =>
  orderModel().whereActive({ applicationId }).find(id);

/**
 * Lists active line items for an order.
 *
 * @example
 * listOrderItems(1, 2);
 */
export const listOrderItems = (orderId: number, applicationId: number) =>
  orderItemModel()
    .whereActive({ applicationId, orderId })
    .orderBy('id', 'asc');

/**
 * Lists status history rows for an order.
 *
 * @example
 * listStatusHistory(1, 2);
 */
export const listStatusHistory = (orderId: number, applicationId: number) =>
  orderStatusHistoryModel()
    .whereActive({ applicationId, orderId })
    .orderBy('id', 'asc');

/**
 * Loads an order with line items and status history.
 *
 * @example
 * findDetail(1, 2);
 */
export const findDetail = (
  id: number,
  applicationId: number,
): Promise<OrderDetail | undefined> => find(id, applicationId)
  .then((order: Order | undefined) => {
    if (!order) return undefined;
    return listOrderItems(id, applicationId)
      .then((items: OrderItem[]) => listStatusHistory(id, applicationId)
        .then((statusHistory: OrderStatusHistory[]) => ({
          ...order,
          items,
          statusHistory,
        })));
  });

/**
 * Applies optional list filters onto an order query.
 *
 * @example
 * applyOrderFilters(query, search);
 */
const applyOrderFilters = (
  query: ReturnType<typeof orderModel>,
  search: OrderSearch,
) => {
  const { status, channelType: channel, merchantId, fromDate, toDate } = search;
  if (status) query.where({ status });
  if (channel) query.where({ channelType: channel });
  if (merchantId) query.where({ merchantId });
  if (fromDate) query.whereRaw('created_at >= ?', [fromDate]);
  if (toDate) query.whereRaw('created_at <= ?', [toDate]);
  return query;
};

/**
 * Searches orders for an application with optional filters.
 *
 * @example
 * searchOrders(1, { status: 'pending', page: 1, pageSize: 20 });
 */
export const searchOrders = (applicationId: number, search: OrderSearch) => {
  const { q = '', page = 1, pageSize = 20, token } = search;
  return applyOrderFilters(
    orderModel().whereActive({ applicationId }),
    search,
  )
    .search(q, SEARCH_FIELDS)
    .paginate({ page, pageSize, token });
};

/**
 * Inserts one line item, then continues recursively.
 *
 * @example
 * insertOrderItems({ applicationId, orderId, items, index: 0, trx });
 */
const insertOrderItems = (context: InsertItemContext): Promise<void> => {
  const { applicationId, orderId, items, index, trx } = context;
  if (index >= items.length) return Promise.resolve();
  const item = items[index];
  const {
    productId, sku, name, unitPrice, quantity, totalPrice, metadata,
  } = item;
  return orderItemModel(trx)
    .create({
      applicationId,
      orderId,
      productId,
      sku,
      name,
      unitPrice,
      quantity,
      totalPrice,
      metadata,
    })
    .then(() => insertOrderItems({ ...context, index: index + 1 }));
};

type InitialHistoryContext = {
  applicationId: number;
  orderId: number;
  changedBy?: number;
  trx: Transaction;
};

/**
 * Writes the initial status history row for a new order.
 *
 * @example
 * insertInitialHistory({ applicationId, orderId, changedBy, trx });
 */
const insertInitialHistory = (context: InitialHistoryContext) => {
  const { applicationId, orderId, changedBy, trx } = context;
  return orderStatusHistoryModel(trx).create({
    applicationId,
    orderId,
    previousStatus: null,
    newStatus: orderStatus.PENDING,
    reason: 'Order created.',
    changedBy: changedBy || null,
  });
};

/**
 * Creates the order header inside a transaction.
 *
 * @example
 * insertOrderHeader(context, trx);
 */
const insertOrderHeader = (
  context: CreateOrderContext,
  trx: Transaction,
) => {
  const { applicationId, payload } = context;
  const {
    merchantId, customerId, channelType: channel, storeId,
    subtotal, taxTotal, discountTotal, grandTotal, currency, metadata,
  } = payload;
  return orderModel(trx).create({
    applicationId,
    merchantId,
    customerId,
    channelType: channel,
    storeId,
    status: orderStatus.PENDING,
    subtotal,
    taxTotal,
    discountTotal,
    grandTotal,
    currency,
    metadata,
  });
};

/**
 * Persists order header, items, and initial history in one transaction.
 *
 * @example
 * persistOrder(context);
 */
const persistOrder = (context: CreateOrderContext) => {
  const { applicationId, payload, changedBy } = context;
  return pool.transaction((trx: Transaction) => insertOrderHeader(context, trx)
    .then((created: { id: number }) => insertOrderItems({
      applicationId,
      orderId: created.id,
      items: payload.items,
      index: 0,
      trx,
    })
      .then(() => insertInitialHistory({
        applicationId,
        orderId: created.id,
        changedBy,
        trx,
      }))
      .then(() => created.id)));
};

/**
 * Creates an order with snapshotted line items.
 *
 * @example
 * createOrder(1, payload, 9);
 */
export const createOrder = (
  applicationId: number,
  payload: OrderWrite,
  changedBy?: number,
) => persistOrder({ applicationId, payload, changedBy })
  .then((orderId: number) => findDetail(orderId, applicationId))
  .then((detail: OrderDetail | undefined) => {
    if (!detail) throw new Error('Order not found.');
    return detail;
  });

/**
 * Writes a status history row and updates the order status.
 *
 * @example
 * applyStatusChange(order, transition, trx);
 */
const applyStatusChange = (
  order: Order,
  transition: StatusTransition,
  trx: Transaction,
) => {
  const { status, reason, changedBy } = transition;
  return orderStatusHistoryModel(trx)
    .create({
      applicationId: order.applicationId,
      orderId: order.id,
      previousStatus: order.status,
      newStatus: status,
      reason,
      changedBy: changedBy || null,
    })
    .then(() => orderModel(trx).patch(order.id, {
      status,
      updatedAt: pool.raw('current_timestamp'),
    }));
};

/**
 * Transitions an order to a new status when allowed.
 *
 * @example
 * transitionOrderStatus(order, { status: 'confirmed', reason: null });
 */
export const transitionOrderStatus = (
  order: Order,
  transition: StatusTransition,
) => {
  const { status } = transition;
  if (!canTransitionStatus(order.status, status)) {
    const message = [
      `Cannot transition order from ${order.status}`,
      `to ${status}.`,
    ].join(' ');
    throw new Error(message);
  }
  return pool.transaction((trx: Transaction) =>
    applyStatusChange(order, transition, trx))
    .then(() => findDetail(order.id, order.applicationId));
};

/**
 * Cancels an active order when the transition is allowed.
 *
 * @example
 * cancelOrder(order, 'Customer request', 9);
 */
export const cancelOrder = (
  order: Order,
  reason: string | null,
  changedBy?: number,
) => transitionOrderStatus(order, {
  status: orderStatus.CANCELLED,
  reason: reason || 'Order cancelled.',
  changedBy,
});

export type { Order, OrderItem, OrderStatusHistory };
