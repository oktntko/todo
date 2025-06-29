import { z } from 'zod';
import { dayjs } from './dayjs';

export const DateSchema = z
  .string()
  .trim()
  .refine((arg) => dayjs(arg, 'YYYY-MM-DD', true).isValid(), '無効な日付形式です。');

export const TimeSchema = z
  .string()
  .trim()
  .refine((arg) => dayjs(arg, 'HH:mm', true).isValid(), '無効な時刻形式です。');

export const ColorSchema = z
  .string()
  .trim()
  .regex(/^#(([0-9a-fA-F]{2}){3}|([0-9a-fA-F]){3})$/, { message: '無効な色です。' })
  .transform((arg) => arg.toUpperCase());

export * from 'zod';
export { z };
