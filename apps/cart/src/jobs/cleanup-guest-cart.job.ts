import logger from '../log-client';
import { guestCart } from '../config';
import { cleanupExpiredGuestCarts } from '../cart/cart.service';

const JOB_INTERVAL = guestCart.CLEANUP_INTERVAL;

const jobInterval = {
  MS: 1,
  S: 1000,
  M: 60 * 1000,
  H: 60 * 60 * 1000,
};

/**
 * Parses a duration interval such as `1h`, `30m`, `15s`, or `500ms`.
 *
 * @example
 * parseJobInterval('1h');
 */
const parseJobInterval = (interval: string): number => {
  const match = /^(\d+)(ms|s|m|h)$/.exec(`${interval || ''}`.trim());
  if (!match) throw new Error('Invalid job interval.');
  const amount = Number(match[1]);
  const unit = match[2];
  if (unit === 'ms') return amount * jobInterval.MS;
  if (unit === 's') return amount * jobInterval.S;
  if (unit === 'm') return amount * jobInterval.M;
  return amount * jobInterval.H;
};

/**
 * Soft-deletes expired guest carts and logs failures.
 *
 * @example
 * processJob();
 */
const processJob = () => {
  cleanupExpiredGuestCarts().catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
  });
};

/**
 * Starts guest-cart cleanup on the given interval.
 *
 * @example
 * runJob('1h');
 */
export default function runJob(interval: string = JOB_INTERVAL) {
  const delay = parseJobInterval(interval);
  processJob();
  setInterval(processJob, delay);
}
