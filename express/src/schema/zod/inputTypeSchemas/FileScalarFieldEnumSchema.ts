import { z } from '~/lib/zod.js';

export const FileScalarFieldEnumSchema = z.enum([
  'file_id',
  'filename',
  'mimetype',
  'filesize',
  'created_at',
  'created_by',
  'updated_at',
  'updated_by',
]);

export default FileScalarFieldEnumSchema;
