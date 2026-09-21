import { type Response } from 'xpref';
import logger from '../log-client';
import { type ApplicationRequest } from '../middleware/validate-application.middleware';
import { type PaymentAuditRequest } from './payment-audit.middleware';
import {
  type PaymentAuditSearch,
  searchPaymentAudits,
} from './payment-audit.service';

/**
 * Validates GET /payment-audits query parameters.
 *
 * @example
 * validateGetAction(req);
 */
const validateGetAction = (req: ApplicationRequest): PaymentAuditSearch => {
  const { q, page, pageSize, token, paymentId } = req.query;
  return {
    q: `${q || ''}`,
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 20,
    token: token ? `${token}` : undefined,
    paymentId: paymentId ? Number(paymentId) : undefined,
  };
};

/**
 * Lists payment audits for the authenticated application.
 *
 * @example
 * GET /payment-audits
 */
export const getAction = (
  req: ApplicationRequest,
  res: Response,
): Promise<Response> => Promise.resolve()
  .then(() => validateGetAction(req))
  .then((search: PaymentAuditSearch) => {
    const { application } = req;
    if (!application) throw new Error('Application not found.');
    return searchPaymentAudits(application.id, search);
  })
  .then((result) => res.json(result))
  .catch((error: Error) => {
    const { message } = error;
    logger().error({ message });
    return res.status(400).json({ message });
  });

/**
 * Returns one payment audit row.
 *
 * @example
 * GET /payment-audits/:id
 */
export const detailAction = (
  req: PaymentAuditRequest,
  res: Response,
): Promise<Response> => Promise.resolve(res.json(req.paymentAudit));
