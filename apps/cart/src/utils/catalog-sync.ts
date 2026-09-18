import {
  applicationHeader,
  catalogService,
  inventoryService,
} from '../config';

const CATALOG_MISS = 'Item is not in the catalog.';
const PRICE_MISS = 'Price is not in the catalog.';
const STOCK_MISS = 'Insufficient stock quantity.';

export type CatalogAuth = {
  appId?: string;
  secretKey?: string;
};

export type CatalogLine = {
  cartId: number;
  productId: number | null;
  variantId: number | null;
  sku: string;
  quantity: number;
  currency: string;
  amount: string;
};

type CatalogBody = {
  message?: string;
  data?: unknown;
  id?: number;
  productId?: number;
  sku?: string;
};

type CatalogVariant = {
  id: number;
  productId: number;
  sku: string;
};

type CatalogPrice = {
  currency: string;
};

type InventoryItem = {
  id: number;
  sku: string;
};

type InventoryStock = {
  quantity: number;
};

type TenantAuth = {
  appId: string;
  secretKey: string;
};

type HttpResult = {
  response: Response;
  body: CatalogBody;
};

/**
 * Requires tenant headers before calling catalog or inventory.
 *
 * @example
 * requireCatalogAuth({ appId: 'uuid', secretKey: 'secret' });
 */
const requireCatalogAuth = (auth: CatalogAuth): TenantAuth => {
  const { appId, secretKey } = auth;
  if (!appId || !secretKey) throw new Error('Application not found.');
  return { appId, secretKey };
};

/**
 * Builds tenant headers for catalog and inventory requests.
 *
 * @example
 * tenantHeaders({ appId: 'uuid', secretKey: 'secret' });
 */
const tenantHeaders = (auth: TenantAuth) => ({
  [applicationHeader.ID]: auth.appId,
  [applicationHeader.SECRET_KEY]: auth.secretKey,
  Accept: 'application/json',
});

/**
 * Builds a service URL with an optional query string.
 *
 * @example
 * buildUrl('http://catalog', '/variants', { q: 'SKU-1' });
 */
const buildUrl = (
  base: string,
  path: string,
  query?: Record<string, string>,
) => {
  if (!query) return `${base}${path}`;
  return `${base}${path}?${new URLSearchParams(query).toString()}`;
};

/**
 * Parses a JSON body from a catalog or inventory response.
 *
 * @example
 * parseBody('{"id":1}');
 */
const parseBody = (text: string): CatalogBody => {
  if (!text) return {};
  return JSON.parse(text) as CatalogBody;
};

/**
 * Reads JSON from an HTTP response.
 *
 * @example
 * readJson(response);
 */
const readJson = (response: Response): Promise<CatalogBody> =>
  response.text().then((text: string) => parseBody(text));

/**
 * Attaches a parsed body to an HTTP response.
 *
 * @example
 * withBody(response);
 */
const withBody = (response: Response): Promise<HttpResult> =>
  readJson(response).then((body: CatalogBody) => ({ response, body }));

/**
 * GET JSON from catalog or inventory using tenant headers.
 *
 * @example
 * requestJson('http://catalog/variants/1', auth);
 */
const requestJson = (url: string, auth: TenantAuth) =>
  fetch(url, { headers: tenantHeaders(auth) }).then(withBody);

/**
 * Requires a successful HTTP response.
 *
 * @example
 * requireOk(result, CATALOG_MISS);
 */
const requireOk = (result: HttpResult, fallback: string): CatalogBody => {
  const { response, body } = result;
  if (!response.ok) throw new Error(fallback);
  return body;
};

/**
 * Reads a paginated `data` array from a service body.
 *
 * @example
 * readRows(body);
 */
const readRows = <T>(body: CatalogBody): T[] => {
  const { data } = body;
  if (!Array.isArray(data)) return [];
  return data as T[];
};

/**
 * Finds a variant with an exact SKU match.
 *
 * @example
 * matchSku('SKU-1', variants);
 */
const matchSku = (
  sku: string,
  variants: CatalogVariant[],
): CatalogVariant | undefined => {
  if (!variants.length) return undefined;
  const [current, ...rest] = variants;
  if (current.sku === sku) return current;
  return matchSku(sku, rest);
};

/**
 * Finds a price with an exact currency match.
 *
 * @example
 * matchPrice('USD', prices);
 */
const matchPrice = (
  currency: string,
  prices: CatalogPrice[],
): CatalogPrice | undefined => {
  if (!prices.length) return undefined;
  const [current, ...rest] = prices;
  if (current.currency === currency) return current;
  return matchPrice(currency, rest);
};

/**
 * Finds an inventory item with an exact SKU match.
 *
 * @example
 * matchInventorySku('SKU-1', items);
 */
const matchInventorySku = (
  sku: string,
  items: InventoryItem[],
): InventoryItem | undefined => {
  if (!items.length) return undefined;
  const [current, ...rest] = items;
  if (current.sku === sku) return current;
  return matchInventorySku(sku, rest);
};

/**
 * Sums stock quantities across warehouses.
 *
 * @example
 * totalStock([{ quantity: 2 }, { quantity: 3 }]);
 */
const totalStock = (stocks: InventoryStock[]): number => {
  if (!stocks.length) return 0;
  const [row, ...rest] = stocks;
  return Number(row.quantity || 0) + totalStock(rest);
};

/**
 * Reads a catalog variant from a detail body.
 *
 * @example
 * readVariant({ id: 1, productId: 2, sku: 'SKU-1' });
 */
const readVariant = (body: CatalogBody): CatalogVariant => {
  const { id, productId, sku } = body;
  if (!id || !productId || !sku) throw new Error(CATALOG_MISS);
  return { id, productId, sku };
};

/**
 * Loads a variant by id from catalog.
 *
 * @example
 * getVariantById(7, auth);
 */
const getVariantById = (id: number, auth: TenantAuth) =>
  requestJson(buildUrl(catalogService.BASE_URL, `/variants/${id}`), auth)
    .then((result: HttpResult) => requireOk(result, CATALOG_MISS))
    .then((body: CatalogBody) => readVariant(body));

/**
 * Picks an exact SKU from a variant search result.
 *
 * @example
 * pickVariantBySku('SKU-1', variants);
 */
const pickVariantBySku = (sku: string, variants: CatalogVariant[]) => {
  const variant = matchSku(sku, variants);
  if (!variant) throw new Error(CATALOG_MISS);
  return variant;
};

/**
 * Loads a variant by SKU from catalog search.
 *
 * @example
 * searchVariantBySku('SKU-1', auth);
 */
const searchVariantBySku = (sku: string, auth: TenantAuth) =>
  requestJson(buildUrl(catalogService.BASE_URL, '/variants', {
    q: sku,
    page: '1',
    pageSize: '20',
  }), auth)
    .then((result: HttpResult) => requireOk(result, CATALOG_MISS))
    .then((body: CatalogBody) =>
      pickVariantBySku(sku, readRows<CatalogVariant>(body)));

/**
 * Loads the catalog variant for a cart line.
 *
 * @example
 * loadCatalogVariant(payload, auth);
 */
const loadCatalogVariant = (payload: CatalogLine, auth: TenantAuth) => {
  if (payload.variantId) return getVariantById(payload.variantId, auth);
  return searchVariantBySku(payload.sku, auth);
};

/**
 * Ensures the catalog variant matches the requested product and SKU.
 *
 * @example
 * assertProductMatch(payload, variant);
 */
const assertProductMatch = (
  payload: CatalogLine,
  variant: CatalogVariant,
) => {
  if (payload.productId && payload.productId !== variant.productId) {
    throw new Error(CATALOG_MISS);
  }
  if (payload.sku !== variant.sku) throw new Error(CATALOG_MISS);
  return variant;
};

/**
 * Ensures a tenant catalog price exists for the snapshot currency.
 *
 * @example
 * assertCatalogPrice(payload, variant, auth);
 */
const assertCatalogPrice = (
  payload: CatalogLine,
  variant: CatalogVariant,
  auth: TenantAuth,
) => requestJson(buildUrl(catalogService.BASE_URL, '/prices', {
  variantId: `${variant.id}`,
  currency: payload.currency,
  page: '1',
  pageSize: '20',
}), auth)
  .then((result: HttpResult) => requireOk(result, PRICE_MISS))
  .then((body: CatalogBody) => {
    const price = matchPrice(payload.currency, readRows<CatalogPrice>(body));
    if (!price) throw new Error(PRICE_MISS);
    return variant;
  });

/**
 * Copies catalog refs onto the line without changing the price snapshot.
 *
 * @example
 * snapshotFromCatalog(payload, variant);
 */
const snapshotFromCatalog = (
  payload: CatalogLine,
  variant: CatalogVariant,
): CatalogLine => ({
  ...payload,
  productId: variant.productId,
  variantId: variant.id,
  sku: variant.sku,
});

/**
 * Loads catalog refs and keeps the request price snapshot.
 *
 * @example
 * loadAndSnapshot(payload, auth);
 */
const loadAndSnapshot = (payload: CatalogLine, tenant: TenantAuth) =>
  loadCatalogVariant(payload, tenant)
    .then((variant: CatalogVariant) => assertProductMatch(payload, variant))
    .then((variant: CatalogVariant) =>
      assertCatalogPrice(payload, variant, tenant))
    .then((variant: CatalogVariant) => snapshotFromCatalog(payload, variant));

/**
 * Validates the line against catalog when CATALOG_BASE_URL is set.
 *
 * @example
 * syncCatalogLine(payload, auth);
 */
const syncCatalogLine = (payload: CatalogLine, auth: CatalogAuth) => {
  if (!catalogService.BASE_URL) return Promise.resolve(payload);
  return Promise.resolve()
    .then(() => requireCatalogAuth(auth))
    .then((tenant: TenantAuth) => loadAndSnapshot(payload, tenant));
};

/**
 * Loads an inventory item by exact SKU.
 *
 * @example
 * searchInventoryItem('SKU-1', auth);
 */
const searchInventoryItem = (sku: string, auth: TenantAuth) =>
  requestJson(buildUrl(inventoryService.BASE_URL, '/items', {
    q: sku,
    page: '1',
    pageSize: '20',
  }), auth)
    .then((result: HttpResult) => requireOk(result, CATALOG_MISS))
    .then((body: CatalogBody) => {
      const item = matchInventorySku(sku, readRows<InventoryItem>(body));
      if (!item) throw new Error(CATALOG_MISS);
      return item;
    });

/**
 * Loads stock rows for an inventory item.
 *
 * @example
 * searchInventoryStocks(4, auth);
 */
const searchInventoryStocks = (itemId: number, auth: TenantAuth) =>
  requestJson(buildUrl(inventoryService.BASE_URL, '/stocks', {
    itemId: `${itemId}`,
    page: '1',
    pageSize: '100',
  }), auth)
    .then((result: HttpResult) => requireOk(result, STOCK_MISS))
    .then((body: CatalogBody) => readRows<InventoryStock>(body));

/**
 * Loads inventory stock and rejects when quantity is too high.
 *
 * @example
 * checkInventoryStock('SKU-1', 2, auth);
 */
const checkInventoryStock = (
  sku: string,
  quantity: number,
  tenant: TenantAuth,
) => searchInventoryItem(sku, tenant)
  .then((item: InventoryItem) => searchInventoryStocks(item.id, tenant))
  .then((stocks: InventoryStock[]) => {
    if (totalStock(stocks) < quantity) throw new Error(STOCK_MISS);
  });

/**
 * Ensures requested quantity is available when INVENTORY_BASE_URL is set.
 *
 * @example
 * assertInventoryQuantity('SKU-1', 2, auth);
 */
const assertInventoryQuantity = (
  sku: string,
  quantity: number,
  auth: CatalogAuth,
) => {
  if (!inventoryService.BASE_URL) return Promise.resolve(undefined);
  return Promise.resolve()
    .then(() => requireCatalogAuth(auth))
    .then((tenant: TenantAuth) =>
      checkInventoryStock(sku, quantity, tenant));
};

/**
 * Reattaches inventory after catalog validation.
 *
 * @example
 * withInventory(line, auth);
 */
const withInventory = (line: CatalogLine, auth: CatalogAuth) =>
  assertInventoryQuantity(line.sku, line.quantity, auth).then(() => line);

/**
 * Validates add/update against catalog and inventory, keeping the snapshot.
 *
 * Empty CATALOG_BASE_URL / INVENTORY_BASE_URL accepts the request snapshot.
 *
 * @example
 * syncCartItemWrite(payload, { appId, secretKey });
 */
export const syncCartItemWrite = (
  payload: CatalogLine,
  auth: CatalogAuth,
) => syncCatalogLine(payload, auth)
  .then((line: CatalogLine) => withInventory(line, auth));
