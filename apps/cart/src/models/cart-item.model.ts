import type { Model } from 'knexify';
import { type BaseEntity } from 'knexify/types';
import { initModel } from './pool';

/** Cart item row scoped to an application tenant. */
export type CartItem = BaseEntity & {
  applicationId: number;
  cartId: number;
  productId: number | null;
  variantId: number | null;
  sku: string;
  quantity: number;
  currency: string;
  amount: string;
};

const TABLE = 'cart_item';
const table: Model = initModel(TABLE);
export default table;
