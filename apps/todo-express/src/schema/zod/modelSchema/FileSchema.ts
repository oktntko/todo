import { z } from '~/lib/zod';
import type { TodoWithRelations } from './TodoSchema';
import { TodoWithRelationsSchema } from './TodoSchema';
import type { UserWithRelations } from './UserSchema';
import { UserWithRelationsSchema } from './UserSchema';

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

/////////////////////////////////////////
// FILE RELATION SCHEMA
/////////////////////////////////////////

export type FileRelations = {
  user_list: UserWithRelations[];
  todo_list: TodoWithRelations[];
};

export type FileWithRelations = z.infer<typeof FileSchema> & FileRelations;

export const FileWithRelationsSchema: z.ZodType<FileWithRelations> = FileSchema.merge(
  z.object({
    user_list: z.lazy(() => UserWithRelationsSchema).array(),
    todo_list: z.lazy(() => TodoWithRelationsSchema).array(),
  }),
);

export default FileSchema;
