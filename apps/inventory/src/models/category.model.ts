import type { Model } from 'knexify';
import { type BaseEntity } from 'knexify/types';
import { initModel } from './pool';

/** Category row scoped to an application tenant. */
export type Category = BaseEntity & {
  applicationId: number;
  name: string;
  description: string | null;
};

const TABLE = 'category';
const table: Model = initModel(TABLE);
export default table;
