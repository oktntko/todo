import { z } from '~/lib/zod.js';
import type { UserWithRelations } from './UserSchema.js';
import { UserWithRelationsSchema } from './UserSchema.js';

/////////////////////////////////////////
// FILE SCHEMA
/////////////////////////////////////////

export const FileSchema = z.object({
  file_id: z.string().uuid(),
  filename: z.string().trim().min(1).max(255),
  mimetype: z.string().trim().min(1).max(100),
  size: z.number().int(),
  created_at: z.coerce.date(),
  created_by: z.number().int(),
  updated_at: z.coerce.date(),
  updated_by: z.number().int(),
});

export type File = z.infer<typeof FileSchema>;

/////////////////////////////////////////
// FILE RELATION SCHEMA
/////////////////////////////////////////

export type FileRelations = {
  user_list: UserWithRelations[];
};

export type FileWithRelations = z.infer<typeof FileSchema> & FileRelations;

export const FileWithRelationsSchema: z.ZodType<FileWithRelations> = FileSchema.merge(
  z.object({
    user_list: z.lazy(() => UserWithRelationsSchema).array(),
  }),
);

export default FileSchema;
