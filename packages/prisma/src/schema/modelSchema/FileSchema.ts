import { z } from '@repo/lib/zod';

/////////////////////////////////////////
// FILE SCHEMA
/////////////////////////////////////////

export const FileSchema = z.object({
  file_id: z.string().uuid(),
  filename: z.string().trim().min(1).max(255),
  mimetype: z.string().trim().min(1).max(100),
  filesize: z.number().int(),
  created_at: z.coerce.date(),
  created_by: z.number().int(),
  updated_at: z.coerce.date(),
  updated_by: z.number().int(),
});

export type File = z.infer<typeof FileSchema>;

export default FileSchema;
