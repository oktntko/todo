import { z } from '~/lib/zod';

export const FileOrderByRelevanceFieldEnumSchema = z.enum(['file_id', 'filename', 'mimetype']);

export default FileOrderByRelevanceFieldEnumSchema;
