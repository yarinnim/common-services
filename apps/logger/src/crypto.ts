import crypto from 'crypto';

const SALT = '11034470d8c24b438d4d5f962f36e2bf'; /* The MD5 of "logger-server" */
const iv = Buffer.from(SALT.substring(0, 16));
const ALG = 'aes-256-cbc';

export function encrypt(text: string): string {
  const cipher = crypto.createCipheriv(ALG, SALT, iv);
  let encryptedData = cipher.update(text, 'utf8', 'hex');
  encryptedData += cipher.final('hex');
  return encryptedData;
}

export function decrypt(text: string): string {
  const decipher = crypto.createDecipheriv(ALG, SALT, iv);
  let decryptedData = decipher.update(text, 'hex', 'utf8');
  decryptedData += decipher.final('utf8');
  return decryptedData;
}

export function hash(text: string, algorythm: string = 'md5'): string {
  const hashed = crypto.createHash(algorythm);
  hashed.update(text);
  return hashed.digest('hex');
}
