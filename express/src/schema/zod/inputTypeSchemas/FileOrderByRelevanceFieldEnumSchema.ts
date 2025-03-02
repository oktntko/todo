import { z } from '~/lib/zod.js';

export const FileOrderByRelevanceFieldEnumSchema = z.enum(['file_id', 'filename', 'mimetype']);

export default FileOrderByRelevanceFieldEnumSchema;
