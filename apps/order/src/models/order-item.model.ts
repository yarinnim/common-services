import type { Model } from 'knexify';
import { type BaseEntity } from 'knexify/types';
import { initModel } from './pool';
import type { JsonObject } from './common.type';

/** Order line item snapshot at purchase time. */
export type OrderItem = BaseEntity & {
  applicationId: number;
  orderId: number;
  productId: number | null;
  sku: string;
  name: string;
  unitPrice: number;
  quantity: number;
  totalPrice: number;
  metadata: JsonObject;
};

const TABLE = 'order_item';
const table: Model = initModel(TABLE);
export default table;
