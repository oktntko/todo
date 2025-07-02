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
const ALGORITHM = 'aes-256-ctr';
const IV_LENGTH = 16;

// const KEY_LENGTH = 23;
// const KEY = crypto.randomBytes(KEY_LENGTH).toString('base64');

function encrypt(text: string, key = env.secret.SECRET_KEY) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  return Buffer.concat([iv, cipher.update(Buffer.from(text)), cipher.final()]).toString('base64');
}

function decrypt(data: string, key = env.secret.SECRET_KEY) {
  const buff = Buffer.from(data, 'base64');

  const iv = buff.subarray(0, IV_LENGTH);
  const encData = buff.subarray(IV_LENGTH);

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

  return Buffer.concat([decipher.update(encData), decipher.final()]).toString('utf8');
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
