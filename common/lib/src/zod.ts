import { z } from 'zod';
import { dayjs } from './dayjs';

export const DateSchema = z
  .string()
  .trim()
  .refine((arg) => dayjs(arg, 'YYYY-MM-DD', true).isValid(), '無効な日付形式です。')
  .pipe(z.custom<`${number}-${number}-${number}`>());

export const MonthSchema = z
  .string()
  .trim()
  .refine((arg) => dayjs(arg, 'YYYY-MM', true).isValid(), '無効な年月形式です。')
  .pipe(z.custom<`${number}-${number}`>());

export const TimeSchema = z
  .string()
  .trim()
  .refine((arg) => dayjs(arg, 'HH:mm', true).isValid(), '無効な時刻形式です。')
  .pipe(z.custom<`${number}:${number}`>());

export const ColorSchema = z
  .string()
  .trim()
  .regex(/^#(([0-9a-fA-F]{2}){3}|([0-9a-fA-F]){3})$/, { message: '無効な色です。' })
  .transform((arg) => arg.toUpperCase())
  .pipe(z.custom<`#${string}`>());

export const UnsignedDecimalSchema = z.coerce
  .string()
  .trim()
  .regex(/^\d{1,20}(?:\.\d{1,20})?$/, { message: '無効な数値形式です。' })
  .transform((arg) => arg.toUpperCase())
  .pipe(z.custom<`${number}` | `${number}.${number}`>());

export const SignedDecimalSchema = z.coerce
  .string()
  .trim()
  .regex(/^[-]?\d{1,20}(?:\.\d{1,20})?$/, { message: '無効な数値形式です。' })
  .transform((arg) => arg.toUpperCase())
  .pipe(z.custom<`${number}` | `${number}.${number}` | `-${number}` | `-${number}.${number}`>());

export * from 'zod';
export { z };
