import { z } from 'zod';
import { dayjs } from './dayjs';

export const DateSchema = z
  .string()
  .trim()
  .refine((arg) => dayjs(arg, 'YYYY-MM-DD', true).isValid(), 'Invalid date format.')
  .pipe(z.custom<`${number}-${number}-${number}`>());

export const MonthSchema = z
  .string()
  .trim()
  .refine((arg) => dayjs(arg, 'YYYY-MM', true).isValid(), 'Invalid year/month format.')
  .pipe(z.custom<`${number}-${number}`>());

export const TimeSchema = z
  .string()
  .trim()
  .refine((arg) => dayjs(arg, 'HH:mm', true).isValid(), 'Invalid time format.')
  .pipe(z.custom<`${number}:${number}`>());

export const ColorSchema = z
  .string()
  .trim()
  .regex(/^#(([0-9a-fA-F]{2}){3}|([0-9a-fA-F]){3})$/, { message: 'Invalid color.' })
  .transform((arg) => arg.toUpperCase())
  .pipe(z.custom<`#${string}`>());

export const UnsignedDecimalSchema = z.coerce
  .string()
  .trim()
  .regex(/^\d{1,20}(?:\.\d{1,20})?$/, { message: 'Invalid number format.' })
  .transform((arg) => arg.toUpperCase())
  .pipe(z.custom<`${number}` | `${number}.${number}`>());

export const SignedDecimalSchema = z.coerce
  .string()
  .trim()
  .regex(/^[-]?\d{1,20}(?:\.\d{1,20})?$/, { message: 'Invalid number format.' })
  .transform((arg) => arg.toUpperCase())
  .pipe(z.custom<`${number}` | `${number}.${number}` | `-${number}` | `-${number}.${number}`>());

export const NumberRelationIdSchema = z.number().nullable().pipe(z.number().int().positive());
export const StringRelationIdSchema = z.string().nullable().pipe(z.string().length(36));

export * from 'zod';
export { z };
