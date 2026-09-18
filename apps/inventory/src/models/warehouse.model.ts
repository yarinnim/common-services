import type { Model } from 'knexify';
import { type BaseEntity } from 'knexify/types';
import { initModel } from './pool';

/** Warehouse row scoped to an application tenant. */
export type Warehouse = BaseEntity & {
  applicationId: number;
  code: string;
  name: string;
  address: string | null;
};

const TABLE = 'warehouse';
const table: Model = initModel(TABLE);
export default table;
