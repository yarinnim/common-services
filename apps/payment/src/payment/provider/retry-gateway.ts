/**
 * Waits for the given milliseconds then resolves.
 *
 * @example
 * wait(100).then(() => true);
 */
const wait = (milliseconds: number): Promise<void> => new Promise((resolve) => {
  setTimeout(resolve, milliseconds);
});

/**
 * Retries a gateway call with exponential backoff.
 *
 * @example
 * retryGateway(0, () => adapter.charge(input));
 */
export const retryGateway = <T>(
  attempt: number,
  run: () => Promise<T>,
): Promise<T> => run()
    .catch((error: Error) => {
      if (attempt >= 2) throw error;
      const delay = 100 * (2 ** attempt);
      return wait(delay).then(() => retryGateway(attempt + 1, run));
    });
