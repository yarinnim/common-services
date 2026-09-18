import { type Response } from 'xpref';
import logger from '../log-client';
import { type ApplicationRequest } from '../middleware/validate-application.middleware';
import { type StockMovementRequest } from './stock-movement.middleware';
import {
  type MovementSearch,
  type MovementWrite,
  isStockMovementType,
  searchStockMovements,
  createStockMovement,
} from './stock-movement.service';
import {
  type StockMovementType,
  stockMovementType,
} from '../models/stock-movement.model';

/**
 * Parses a required positive integer.
 *
 * @example
 * parseRequiredId(req.body.itemId, 'Item id is required.');
 */
const parseRequiredId = (value: unknown, message: string): number => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new Error(message);
  return id;
};

/**
 * Validates GET /stock-movements query parameters.
 *
 * @example
 * validateGetAction(req);
 */
const validateGetAction = (req: ApplicationRequest): MovementSearch => {
  const { q, page, pageSize, token } = req.query;
  return {
    q: `${q || ''}`,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 20,
    token: token ? `${token}` : undefined,
  };
};

/**
 * Validates POST /stock-movements body.
 *
 * @example
 * validatePostAction(req);
 */
const validatePostAction = (req: ApplicationRequest): MovementWrite => {
  const body = req.body || {};
  const {
    itemId,
    warehouseId,
    destinationWarehouseId,
    type,
    quantity,
    reference,
    note,
    version,
  } = body;
  const movementType = `${type || ''}`;
  if (!isStockMovementType(movementType)) {
    throw new Error('Invalid stock movement type.');
  }
  const parsedQuantity = Number(quantity);
  if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
    throw new Error('Quantity must be a positive integer.');
  }
  const parsedWarehouseId = parseRequiredId(
    warehouseId,
    'Warehouse id is required.',
  );
  const parsedDestinationId = destinationWarehouseId
    ? parseRequiredId(destinationWarehouseId, 'Invalid destination warehouse.')
    : null;
  if (movementType === stockMovementType.TRANSFER && !parsedDestinationId) {
    throw new Error('Destination warehouse is required.');
  }
  if (parsedDestinationId && parsedDestinationId === parsedWarehouseId) {
    throw new Error('Destination warehouse must be different.');
  }
  return {
    itemId: parseRequiredId(itemId, 'Item id is required.'),
    warehouseId: parsedWarehouseId,
    destinationWarehouseId: parsedDestinationId,
    type: movementType as StockMovementType,
    quantity: parsedQuantity,
    reference: reference ? `${reference}` : null,
    note: note ? `${note}` : null,
    version: version ? Number(version) : undefined,
  };
};

/**
 * Lists stock movements for the authenticated application.
 *
 * @example
 * GET /stock-movements
 */
export const getAction = (
  req: ApplicationRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validateGetAction(req))
  .then((search: MovementSearch) => {
    const { application } = req;
    if (!application) throw new Error('Application not found.');
    return searchStockMovements(application.id, search);
  })
  .then((result) => res.json(result))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Creates a stock movement and updates stock levels.
 *
 * @example
 * POST /stock-movements
 */
export const postAction = (
  req: ApplicationRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validatePostAction(req))
  .then((payload: MovementWrite) => {
    const { application, userId } = req;
    if (!application) throw new Error('Application not found.');
    return createStockMovement(application.id, payload, userId);
  })
  .then((movement) => res.json(movement))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Returns one stock movement.
 *
 * @example
 * GET /stock-movements/:id
 */
export const detailAction = (
  req: StockMovementRequest,
  res: Response,
): Promise<Response> => Promise.resolve(res.json(req.stockMovement));
