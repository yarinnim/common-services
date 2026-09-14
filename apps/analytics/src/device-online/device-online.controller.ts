import { type Response } from 'xpref';
import logger from '../log-client';
import { type AppRequest } from '../middleware/application.middleware';
import {
  findOnlineDeviceCount,
  findOnlineDeviceCountByDimension,
} from './device-online.service';

type DeviceOnlineQuery = {
  dimension: string;
  limit: number;
  onlineMinutes: number;
};

const ONLINE_DIMENSIONS = [
  'device_type',
  'os',
  'browser',
  'country',
  'language',
];

const DEFAULT_LIMIT = 10;
const DEFAULT_ONLINE_MINUTES = 5;

/**
 * Parses a positive integer from a query value.
 *
 * @example
 * parsePositiveInteger('10', 5);
 */
const parsePositiveInteger = (
  value: string | undefined,
  defaultValue: number,
): number => {
  if (!value) return defaultValue;
  const parsed = Number.parseInt(value, 10);
  const isInvalid = Number.isNaN(parsed) || parsed <= 0;
  if (isInvalid) throw new Error('Invalid query parameter.');
  return parsed;
};

/**
 * Validates device online GET query parameters.
 *
 * @example
 * validateGetAction(request);
 */
const validateGetAction = (request: AppRequest): DeviceOnlineQuery => {
  const { dimension, limit, onlineMinutes } = request.query;
  const dimensionValue = `${dimension || ''}`.trim();
  console.log({ dimensionValue });
  const hasDimension = dimensionValue.length > 0;
  

  if (hasDimension && !ONLINE_DIMENSIONS.includes(dimensionValue)) {
    throw new Error('Invalid online dimension.');
  }

  return {
    dimension: dimensionValue,
    limit: parsePositiveInteger(limit as string | undefined, DEFAULT_LIMIT),
    onlineMinutes: parsePositiveInteger(
      onlineMinutes as string | undefined,
      DEFAULT_ONLINE_MINUTES,
    ),
  };
};

/**
 * Returns online device counts for the authenticated application.
 *
 * @example
 * GET /statistics/device-online
 * GET /statistics/device-online?dimension=device_type&limit=10
 */
export const getAction = (
  request: AppRequest,
  response: Response,
): Promise<void> => (
  Promise.resolve()
    .then(() => validateGetAction(request))
    .then((query: DeviceOnlineQuery) => {
      console.log({ query });
      const { application } = request;
      if (!application) throw new Error('Application not found.');
      const { id } = application;

      if (query.dimension) {
        return findOnlineDeviceCountByDimension(
          id,
          query.dimension,
          query.limit,
        ).then((counts) => {
          response.json({ counts });
        });
      }

      return findOnlineDeviceCount(id, query.onlineMinutes)
        .then((result) => {
          response.json(result);
        });
    })
    .catch((error: Error) => {
      const { message } = error;
      logger().error({ message });
      response.status(400).json({ message });
    })
);
