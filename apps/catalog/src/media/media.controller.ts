import { type Response } from 'xpref';
import logger from '../log-client';
import { type ApplicationRequest } from '../middleware/validate-application.middleware';
import { type MediaRequest } from './media.middleware';
import {
  type Media,
  type MediaKind,
  type MediaSearch,
  type MediaWrite,
  isMediaKind,
  searchMedia,
  createMedia,
  updateMedia,
  removeMedia,
} from './media.service';

/**
 * Parses an optional positive integer from a query or body value.
 *
 * @example
 * parseOptionalId(req.query.productId, 'product id');
 */
const parseOptionalId = (value: unknown, label: string): number | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new Error(`Invalid ${label}.`);
  return id;
};

/**
 * Validates GET /media query parameters.
 *
 * @example
 * validateGetAction(req);
 */
const validateGetAction = (req: ApplicationRequest): MediaSearch => {
  const { q, page, pageSize, token, productId, variantId } = req.query;
  return {
    q: `${q || ''}`,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 20,
    token: token ? `${token}` : undefined,
    productId: parseOptionalId(productId, 'product id'),
    variantId: parseOptionalId(variantId, 'variant id'),
  };
};

/**
 * Parses a required positive integer.
 *
 * @example
 * parseRequiredId(req.body.productId, 'product id');
 */
const parseRequiredId = (value: unknown, label: string): number => {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new Error(`Invalid ${label}.`);
  return id;
};

/**
 * Parses a media URL mapping.
 *
 * @example
 * parseUrl('https://cdn.example/a.jpg');
 */
const parseUrl = (value: unknown): string => {
  const url = `${value || ''}`.trim();
  if (!url) throw new Error('URL is required.');
  if (url.length > 2048) throw new Error('URL is too long.');
  return url;
};

/**
 * Parses a media kind.
 *
 * @example
 * parseKind('image');
 */
const parseKind = (value: unknown): MediaKind => {
  const kind = `${value || ''}`.trim();
  if (!isMediaKind(kind)) throw new Error('Invalid media kind.');
  return kind as MediaKind;
};

/**
 * Validates POST and PUT media bodies.
 *
 * @example
 * validateWriteAction(req);
 */
const validateWriteAction = (req: ApplicationRequest): MediaWrite => {
  const { productId, variantId, url, kind } = req.body || {};
  return {
    productId: parseRequiredId(productId, 'product id'),
    variantId: parseOptionalId(variantId, 'variant id') || null,
    url: parseUrl(url),
    kind: parseKind(kind),
  };
};

/**
 * Lists media URL mappings for the authenticated application.
 *
 * @example
 * GET /media
 */
export const getAction = (
  req: ApplicationRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validateGetAction(req))
  .then((search: MediaSearch) => {
    const { application } = req;
    if (!application) throw new Error('Application not found.');
    return searchMedia(application.id, search);
  })
  .then((result) => res.json(result))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Creates a media URL mapping for the authenticated application.
 *
 * @example
 * POST /media
 */
export const postAction = (
  req: ApplicationRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validateWriteAction(req))
  .then((payload: MediaWrite) => {
    const { application } = req;
    if (!application) throw new Error('Application not found.');
    return createMedia(application.id, payload);
  })
  .then((media) => res.json(media))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Returns one media URL mapping.
 *
 * @example
 * GET /media/:id
 */
export const detailAction = (
  req: MediaRequest,
  res: Response,
): Promise<Response> => Promise.resolve(res.json(req.media));

/**
 * Updates a media URL mapping.
 *
 * @example
 * PUT /media/:id
 */
export const updateAction = (
  req: MediaRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validateWriteAction(req))
  .then((payload: MediaWrite) => {
    const { application, media } = req;
    if (!application || !media) throw new Error('Media not found.');
    return updateMedia(media.id, application.id, payload);
  })
  .then((media) => res.json(media))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Soft-deletes a media URL mapping and returns the previous row.
 *
 * @example
 * removeAndReturn(media);
 */
const removeAndReturn = (media: Media) =>
  removeMedia(media.id).then(() => media);

/**
 * Soft-deletes a media URL mapping.
 *
 * @example
 * DELETE /media/:id
 */
export const deleteAction = (
  req: MediaRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => {
    const { media } = req;
    if (!media) throw new Error('Media not found.');
    return removeAndReturn(media);
  })
  .then((media) => res.json(media))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });
