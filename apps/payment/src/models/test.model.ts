import type { Model } from 'knexify';
import { initModel } from './pool';

const TABLE = 'test';
const table: Model = initModel(TABLE);
export default table;
