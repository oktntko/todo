import { z } from '@repo/lib/zod';

export const FileOrderByRelevanceFieldEnumSchema = z.enum(['file_id', 'filename', 'mimetype']);

export default FileOrderByRelevanceFieldEnumSchema;
