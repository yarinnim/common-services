import { type Response } from 'xpref';
import logger from '../log-client';
import { type ApplicationRequest } from '../middleware/validate-application.middleware';
import { type OrderRequest } from './order.middleware';
import {
  type OrderSearch,
  type OrderWrite,
  type OrderItemWrite,
  type StatusTransition,
  isChannelType,
  isOrderStatus,
  searchOrders,
  createOrder,
  findDetail,
  transitionOrderStatus,
  cancelOrder,
} from './order.service';
import type { JsonObject } from '../models/common.type';
import {
  type ChannelType,
  type OrderStatus,
} from '../models/order.model';

/**
 * Parses an optional positive integer from a request value.
 *
 * @example
 * parseOptionalId(req.body.merchantId, 'merchant id');
 */
const parseOptionalId = (value: unknown, label: string): number | null => {
  if (value === undefined || value === null || value === '') return null;
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error(`Invalid ${label}.`);
  }
  return id;
};

/**
 * Parses a required money amount.
 *
 * @example
 * parseAmount(req.body.subtotal, 'subtotal');
 */
const parseAmount = (value: unknown, label: string): number => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error(`Invalid ${label}.`);
  }
  return amount;
};

/**
 * Parses a required positive quantity.
 *
 * @example
 * parseQuantity(req.body.quantity);
 */
const parseQuantity = (value: unknown): number => {
  const quantity = Number(value);
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error('Invalid quantity.');
  }
  return quantity;
};

/**
 * Validates one order line item from the request body.
 *
 * @example
 * validateOrderItem(req.body.items[0]);
 */
const validateOrderItem = (raw: Record<string, unknown>): OrderItemWrite => {
  const {
    productId, sku, name, unitPrice, quantity, totalPrice, metadata = {},
  } = raw;
  if (!`${sku || ''}`.trim()) throw new Error('Item SKU is required.');
  if (!`${name || ''}`.trim()) throw new Error('Item name is required.');
  const parsedUnit = parseAmount(unitPrice, 'unit price');
  const parsedQuantity = parseQuantity(quantity);
  const parsedTotal = parseAmount(totalPrice, 'total price');
  const expected = Number((parsedUnit * parsedQuantity).toFixed(2));
  if (parsedTotal !== expected) {
    throw new Error('Item total price must equal unit price times quantity.');
  }
  return {
    productId: parseOptionalId(productId, 'product id'),
    sku: `${sku}`.trim(),
    name: `${name}`.trim(),
    unitPrice: parsedUnit,
    quantity: parsedQuantity,
    totalPrice: parsedTotal,
    metadata: metadata && typeof metadata === 'object'
      ? metadata as JsonObject
      : {},
  };
};

/**
 * Validates line items recursively.
 *
 * @example
 * validateOrderItems(rawItems, [], 0);
 */
const validateOrderItems = (
  rawItems: unknown[],
  result: OrderItemWrite[],
  index: number,
): OrderItemWrite[] => {
  if (index >= rawItems.length) return result;
  const raw = rawItems[index];
  if (!raw || typeof raw !== 'object') {
    throw new Error('Each order item must be an object.');
  }
  result.push(validateOrderItem(raw as Record<string, unknown>));
  return validateOrderItems(rawItems, result, index + 1);
};

/**
 * Validates POST /orders body.
 *
 * @example
 * validatePostAction(req);
 */
const validatePostAction = (req: ApplicationRequest): OrderWrite => {
  const body = req.body || {};
  const {
    merchantId, customerId, channelType: channel, storeId,
    subtotal, taxTotal = 0, discountTotal = 0, grandTotal, currency,
    metadata = {}, items,
  } = body;
  if (!`${channel || ''}`.trim() || !isChannelType(`${channel}`)) {
    throw new Error('Valid channel type is required.');
  }
  if (!`${currency || ''}`.trim() || `${currency}`.trim().length !== 3) {
    throw new Error('Currency must be a 3-letter code.');
  }
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('At least one order item is required.');
  }
  return {
    merchantId: parseOptionalId(merchantId, 'merchant id'),
    customerId: parseOptionalId(customerId, 'customer id'),
    channelType: `${channel}` as ChannelType,
    storeId: parseOptionalId(storeId, 'store id'),
    subtotal: parseAmount(subtotal, 'subtotal'),
    taxTotal: parseAmount(taxTotal, 'tax total'),
    discountTotal: parseAmount(discountTotal, 'discount total'),
    grandTotal: parseAmount(grandTotal, 'grand total'),
    currency: `${currency}`.trim().toUpperCase(),
    metadata: metadata && typeof metadata === 'object' ? metadata : {},
    items: validateOrderItems(items, [], 0),
  };
};

/**
 * Validates GET /orders query parameters.
 *
 * @example
 * validateGetAction(req);
 */
const validateGetAction = (req: ApplicationRequest): OrderSearch => {
  const {
    q, page, pageSize, token, status, channelType: channel,
    merchantId, fromDate, toDate,
  } = req.query;
  const statusValue = status ? `${status}` : '';
  if (statusValue && !isOrderStatus(statusValue)) {
    throw new Error('Invalid status filter.');
  }
  const channelValue = channel ? `${channel}` : '';
  if (channelValue && !isChannelType(channelValue)) {
    throw new Error('Invalid channel type filter.');
  }
  return {
    q: `${q || ''}`,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 20,
    token: token ? `${token}` : undefined,
    status: statusValue ? statusValue as OrderStatus : undefined,
    channelType: channelValue ? channelValue as ChannelType : undefined,
    merchantId: merchantId
      ? parseOptionalId(merchantId, 'merchant id') || undefined
      : undefined,
    fromDate: fromDate ? `${fromDate}` : undefined,
    toDate: toDate ? `${toDate}` : undefined,
  };
};

/**
 * Validates PATCH /orders/:id/status body.
 *
 * @example
 * validateStatusAction(req);
 */
const validateStatusAction = (req: OrderRequest): StatusTransition => {
  const { status, reason } = req.body || {};
  if (!`${status || ''}`.trim() || !isOrderStatus(`${status}`)) {
    throw new Error('Valid status is required.');
  }
  return {
    status: `${status}` as OrderStatus,
    reason: reason ? `${reason}` : null,
    changedBy: req.userId,
  };
};

/**
 * Lists orders for the authenticated application.
 *
 * @example
 * GET /orders
 */
export const getAction = (
  req: ApplicationRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validateGetAction(req))
  .then((search: OrderSearch) => {
    const { application } = req;
    if (!application) throw new Error('Application not found.');
    return searchOrders(application.id, search);
  })
  .then((result) => res.json(result))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Creates an order for the authenticated application.
 *
 * @example
 * POST /orders
 */
export const postAction = (
  req: ApplicationRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validatePostAction(req))
  .then((payload: OrderWrite) => {
    const { application, userId } = req;
    if (!application) throw new Error('Application not found.');
    return createOrder(application.id, payload, userId);
  })
  .then((order) => res.json(order))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Returns one order with items and status history.
 *
 * @example
 * GET /orders/:id
 */
export const detailAction = (
  req: OrderRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => {
    const { application, order } = req;
    if (!application || !order) throw new Error('Order not found.');
    return findDetail(order.id, application.id);
  })
  .then((detail) => {
    if (!detail) throw new Error('Order not found.');
    return res.json(detail);
  })
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Transitions order status when the change is allowed.
 *
 * @example
 * PATCH /orders/:id/status
 */
export const statusAction = (
  req: OrderRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validateStatusAction(req))
  .then((transition: StatusTransition) => {
    const { order } = req;
    if (!order) throw new Error('Order not found.');
    return transitionOrderStatus(order, transition);
  })
  .then((detail) => res.json(detail))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Cancels an active order.
 *
 * @example
 * POST /orders/:id/cancel
 */
export const cancelAction = (
  req: OrderRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => {
    const { order, userId, body } = req;
    if (!order) throw new Error('Order not found.');
    const reason = body?.reason ? `${body.reason}` : null;
    return cancelOrder(order, reason, userId);
  })
  .then((detail) => res.json(detail))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });
