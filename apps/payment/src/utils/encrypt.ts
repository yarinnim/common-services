import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { ENCRYPTION_MASTER_KEY } from '../constants';
import type { JsonObject } from '../models/common.type';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;

export type EncryptedPayload = {
  ciphertext: string;
  meta: JsonObject;
};

/**
 * Returns the 32-byte master key buffer from ENCRYPTION_MASTER_KEY.
 *
 * @example
 * getMasterKey();
 */
const getMasterKey = (): Buffer => {
  const key = Buffer.from(ENCRYPTION_MASTER_KEY, 'hex');
  if (key.length !== 32) {
    throw new Error('ENCRYPTION_MASTER_KEY must be 64 hex characters.');
  }
  return key;
};

/**
 * Encrypts plaintext with AES-256-GCM using the master key.
 *
 * @example
 * encryptSecret('sk_test_xxx');
 */
export const encryptSecret = (plaintext: string): EncryptedPayload => {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, getMasterKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ]);
  const authTag = cipher.getAuthTag();
  return {
    ciphertext: encrypted.toString('base64'),
    meta: {
      algorithm: ALGORITHM,
      iv: iv.toString('base64'),
      authTag: authTag.toString('base64'),
    },
  };
};

/**
 * Decrypts a ciphertext produced by encryptSecret.
 *
 * @example
 * decryptSecret(row.encryptedSecret, row.encryptionMeta);
 */
export const decryptSecret = (
  ciphertext: string,
  meta: JsonObject,
): string => {
  const iv = Buffer.from(`${meta.iv || ''}`, 'base64');
  const authTag = Buffer.from(`${meta.authTag || ''}`, 'base64');
  if (!iv.length || !authTag.length) {
    throw new Error('Invalid encryption metadata.');
  }
  const decipher = createDecipheriv(ALGORITHM, getMasterKey(), iv);
  decipher.setAuthTag(authTag);
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(ciphertext, 'base64')),
    decipher.final(),
  ]);
  return decrypted.toString('utf8');
};
