import type { Model } from 'knexify';
import { type BaseEntity } from 'knexify/types';
import { initModel } from './pool';

export const mediaKind = {
  IMAGE: 'image',
  ASSET: 'asset',
};

export type MediaKind = typeof mediaKind[keyof typeof mediaKind];

/** Media row scoped to an application tenant. */
export type Media = BaseEntity & {
  applicationId: number;
  productId: number;
  variantId: number | null;
  url: string;
  kind: MediaKind;
};

const TABLE = 'media';
const table: Model = initModel(TABLE);
export default table;
