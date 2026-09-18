import type { Model } from 'knexify';
import { type BaseEntity } from 'knexify/types';
import { initModel } from './pool';
import type { JsonObject } from './common.type';

/** Application tenant row returned from the database. */
export type Application = BaseEntity & {
  uuid: string;
  secretKey: string;
  code: string;
  name: string;
  setting: JsonObject;
};

/** Application attached to the request after middleware validation. */
export type ApplicationContext = Omit<Application, 'secretKey'>;

const TABLE = 'application';
const table: Model = initModel(TABLE);
export default table;
