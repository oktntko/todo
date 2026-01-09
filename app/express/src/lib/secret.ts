import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import qrcode from 'qrcode';
import speakeasy, { type Encoding } from 'speakeasy';
import { env } from '~/lib/env';

////////////////////////////////
// ハッシュ化
////////////////////////////////
const SALT_OR_ROUNDS = 10;

function hash(text: string) {
  return bcrypt.hashSync(text, SALT_OR_ROUNDS);
}

function compare(data: string, encrypted: string) {
  return bcrypt.compareSync(data, encrypted);
}

export const HashPassword = {
  hash,
  compare,
};

////////////////////////////////
// 暗号化・複合化
////////////////////////////////
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // GCM 推奨
const TAG_LENGTH = 16; // auth tag

function encrypt(text: string, key = Buffer.from(env.secret.SECRET_KEY, 'base64')) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);

  const tag = cipher.getAuthTag();

  return Buffer.concat([iv, tag, encrypted]).toString('base64');
}

function decrypt(data: string, key = Buffer.from(env.secret.SECRET_KEY, 'base64')) {
  const buf = Buffer.from(data, 'base64');

  const iv = buf.subarray(0, IV_LENGTH);
  const tag = buf.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
  const encrypted = buf.subarray(IV_LENGTH + TAG_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);

  return decipher.update(encrypted, undefined, 'utf8') + decipher.final('utf8');
}

export const SecretPassword = {
  encrypt,
  decrypt,
};

////////////////////////////////
// ワンタイムパスワード
////////////////////////////////
function generateSecret(params: { name: string; issuer?: string }) {
  return speakeasy.generateSecret({
    length: 32,
    name: params.name,
    issuer: params.issuer || env.APP_NAME,
  });
}

async function generateQrcodeUrl(params: { secret: string; name: string; issuer?: string }) {
  // cSpell:ignore otpauth
  const url = speakeasy.otpauthURL({
    secret: params.secret,
    label: encodeURIComponent(params.name),
    issuer: params.issuer || env.APP_NAME,
  });

  return qrcode.toDataURL(url);
}

function verifyToken(params: { secret: string; token: string; encoding?: Encoding }) {
  // cSpell:ignore totp
  return speakeasy.totp.verify({
    secret: params.secret,
    token: params.token,
    encoding: params.encoding || 'base32',
  });
}

export const OnetimePassword = {
  generateSecret,
  generateQrcodeUrl,
  verifyToken,
};
