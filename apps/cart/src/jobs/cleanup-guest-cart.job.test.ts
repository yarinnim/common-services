import runJob from './cleanup-guest-cart.job';
import { cleanupExpiredGuestCarts } from '../cart/cart.service';
import logger from '../log-client';

jest.mock('../log-client', () => ({
  __esModule: true,
  default: jest.fn(() => ({ error: jest.fn() })),
}));

jest.mock('../config', () => ({
  guestCart: {
    EXPIRES_SQL: 'current_timestamp + interval \'7 days\'',
    CLEANUP_INTERVAL: '1h',
  },
}));

jest.mock('../cart/cart.service', () => ({
  cleanupExpiredGuestCarts: jest.fn(() => Promise.resolve(undefined)),
}));

describe('cleanup-guest-cart.job', () => {
  const setIntervalMock = jest.spyOn(global, 'setInterval');

  beforeEach(() => {
    setIntervalMock.mockReset();
    setIntervalMock.mockReturnValue(0 as unknown as NodeJS.Timeout);
    (cleanupExpiredGuestCarts as unknown as jest.Mock).mockReset();
    (cleanupExpiredGuestCarts as unknown as jest.Mock).mockReturnValue(
      Promise.resolve(undefined),
    );
    (logger as unknown as jest.Mock).mockClear();
  });

  afterEach(() => {
    setIntervalMock.mockReset();
  });

  it('runs cleanup immediately and hourly by default', () => {
    runJob();
    expect(cleanupExpiredGuestCarts).toHaveBeenCalledTimes(1);
    expect(setIntervalMock).toHaveBeenCalledWith(expect.any(Function), 3600000);
  });

  it('uses the provided interval', () => {
    runJob('30m');
    expect(setIntervalMock).toHaveBeenCalledWith(expect.any(Function), 1800000);
  });

  it('rejects an invalid interval', () => {
    expect(() => runJob('weekly')).toThrow('Invalid job interval.');
  });

  it('logs { message } when cleanup fails', () => {
    const log = { error: jest.fn() };
    (logger as unknown as jest.Mock).mockReturnValue(log);
    (cleanupExpiredGuestCarts as unknown as jest.Mock).mockReturnValue(
      Promise.reject(new Error('Cart lookup failed.')),
    );

    runJob('1s');
    return Promise.resolve().then(() => {
      expect(log.error).toHaveBeenCalledWith({
        message: 'Cart lookup failed.',
      });
    });
  });
});
