export type ClickHouseMigration = {
  up: () => Promise<void>;
  down: () => Promise<void>;
};
