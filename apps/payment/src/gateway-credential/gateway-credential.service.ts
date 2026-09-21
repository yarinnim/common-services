import { type Paging } from 'knexify/types';
import gatewayCredentialModel, {
  type GatewayCredential,
} from '../models/gateway-credential.model';
import type { JsonObject } from '../models/common.type';
import { encryptSecret, decryptSecret } from '../utils/encrypt';
import { paymentProvider } from '../config';

const PUBLIC_FIELDS = [
  'id',
  'applicationId',
  'provider',
  'publishableKey',
  'setting',
  'createdAt',
  'updatedAt',
];

const SEARCH_FIELDS = ['provider', 'publishableKey'];

const PROVIDERS = [
  paymentProvider.STRIPE,
  paymentProvider.PAYPAL,
  paymentProvider.ADYEN,
];

export type GatewayCredentialPublic = Pick<
  GatewayCredential,
  | 'id'
  | 'applicationId'
  | 'provider'
  | 'publishableKey'
  | 'setting'
  | 'createdAt'
  | 'updatedAt'
>;

export type GatewayCredentialWrite = {
  provider: string;
  secretKey: string;
  webhookSecret?: string;
  publishableKey?: string;
  setting: JsonObject;
};

export type GatewayCredentialSearch = Paging & {
  q?: string;
};

export type ResolvedGatewayCredential = {
  id: number;
  applicationId: number;
  provider: string;
  publishableKey?: string | null;
  secretKey: string;
  webhookSecret?: string;
  setting: JsonObject;
};

/**
 * Returns true when the provider is a supported gateway.
 *
 * @example
 * isPaymentProvider('stripe');
 */
export const isPaymentProvider = (provider: string): boolean => PROVIDERS
  .includes(provider);

/**
 * Finds a public credential row scoped to the application.
 *
 * @example
 * find(1, 10);
 */
export const find = (id: number, applicationId: number) => (
  gatewayCredentialModel()
    .select(PUBLIC_FIELDS)
    .whereActive({ applicationId })
    .find(id)
);

/**
 * Searches public credentials for an application.
 *
 * @example
 * searchGatewayCredentials(1, { q: 'stripe', page: 1, pageSize: 20 });
 */
export const searchGatewayCredentials = (
  applicationId: number,
  search: GatewayCredentialSearch,
) => {
  const { q = '', page = 1, pageSize = 20, token } = search;
  return gatewayCredentialModel()
    .select(PUBLIC_FIELDS)
    .whereActive({ applicationId })
    .search(q, SEARCH_FIELDS)
    .paginate({ page, pageSize, token });
};

/**
 * Encrypts write payload fields for persistence.
 *
 * @example
 * buildEncryptedRow(1, payload);
 */
const buildEncryptedRow = (
  applicationId: number,
  payload: GatewayCredentialWrite,
) => {
  const { provider, secretKey, webhookSecret, publishableKey, setting } = payload;
  const secret = encryptSecret(secretKey);
  const webhook = webhookSecret
    ? encryptSecret(webhookSecret)
    : undefined;
  return {
    applicationId,
    provider,
    publishableKey: publishableKey || null,
    encryptedSecret: secret.ciphertext,
    encryptedWebhookSecret: webhook ? webhook.ciphertext : null,
    encryptionMeta: {
      secret: secret.meta,
      webhook: webhook ? webhook.meta : null,
    },
    setting,
  };
};

/**
 * Creates an encrypted gateway credential and returns the public row.
 *
 * @example
 * createGatewayCredential(1, {
 *   provider: 'stripe', secretKey: 'sk', setting: {},
 * });
 */
export const createGatewayCredential = (
  applicationId: number,
  payload: GatewayCredentialWrite,
) => {
  const row = buildEncryptedRow(applicationId, payload);
  return gatewayCredentialModel()
    .create(row)
    .then((created: { id: number }) => find(created.id, applicationId));
};

/**
 * Updates an encrypted gateway credential and returns the public row.
 *
 * @example
 * updateGatewayCredential(1, 10, payload);
 */
export const updateGatewayCredential = (
  id: number,
  applicationId: number,
  payload: GatewayCredentialWrite,
) => {
  const row = buildEncryptedRow(applicationId, payload);
  return gatewayCredentialModel()
    .whereActive({ applicationId })
    .patch(id, row)
    .then(() => find(id, applicationId));
};

/**
 * Soft-deletes a gateway credential.
 *
 * @example
 * removeGatewayCredential(1, 10);
 */
export const removeGatewayCredential = (id: number, applicationId: number) => (
  find(id, applicationId).then((credential) => {
    if (!credential) throw new Error('Gateway credential not found.');
    return gatewayCredentialModel().remove(id);
  })
);

/**
 * Loads and decrypts a credential for gateway adapter use.
 *
 * @example
 * resolveGatewayCredential(1, 10);
 */
export const resolveGatewayCredential = (
  id: number,
  applicationId: number,
) => gatewayCredentialModel()
  .whereActive({ applicationId })
  .find(id)
  .then((credential: GatewayCredential | undefined) => {
    if (!credential) throw new Error('Gateway credential not found.');
    const { encryptionMeta } = credential;
    const secretMeta = (encryptionMeta.secret || {}) as JsonObject;
    const webhookMeta = (encryptionMeta.webhook || {}) as JsonObject;
    const secretKey = decryptSecret(credential.encryptedSecret, secretMeta);
    const webhookSecret = credential.encryptedWebhookSecret
      ? decryptSecret(credential.encryptedWebhookSecret, webhookMeta)
      : undefined;
    return {
      id: credential.id,
      applicationId: credential.applicationId,
      provider: credential.provider,
      publishableKey: credential.publishableKey,
      secretKey,
      webhookSecret,
      setting: credential.setting,
    } as ResolvedGatewayCredential;
  });

/**
 * Finds the active credential for a provider under an application.
 *
 * @example
 * findByProvider(1, 'stripe');
 */
export const findByProvider = (applicationId: number, provider: string) => (
  gatewayCredentialModel()
    .whereActive({ applicationId, provider })
    .first()
);
