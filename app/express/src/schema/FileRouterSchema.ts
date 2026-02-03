import { z } from '@todo/lib/zod';
import {
  FileScalarFieldEnumSchema,
  FileSchema,
  SortOrderSchema,
  TodoSchema,
} from '@todo/prisma/schema';

const getInput = FileSchema.pick({
  file_id: true,
});
const getManyInput = z.object({
  file_id_list: FileSchema.shape.file_id.array().min(1),
});

const getOutput = FileSchema;

const fileInput = z.any().refine(
  (file): file is Express.Multer.File => {
    return (
      file != null &&
      typeof file.fieldname === 'string' &&
      typeof file.originalname === 'string' &&
      typeof file.mimetype === 'string' &&
      typeof file.size === 'number'
    );
  },
  { message: 'Invalid type' },
);

const createInputBody = z.object({
  space_id: FileSchema.shape.space_id,
  todo_id: TodoSchema.shape.todo_id.optional(),
});

const createInput = z.object({
  body: createInputBody,
  file: fileInput,
});
const createManyInput = z.object({
  body: createInputBody,
  files: fileInput.array().min(1),
});

const deleteInput = FileSchema.pick({
  file_id: true,
  updated_at: true,
});
const deleteManyInput = z.object({
  space_id: FileSchema.shape.space_id,
  target_list: deleteInput.array().min(1),
});

const searchInput = z.object({
  space_id: FileSchema.shape.space_id,
  where: z.object({
    file_keyword: z.string().trim().max(255),
  }),
  sort: z.object({
    field: FileScalarFieldEnumSchema,
    order: SortOrderSchema,
  }),
  limit: z.number().int().positive(),
  page: z.number().int().positive(),
});

const searchOutput = z.object({
  total: z.number(),
  file_list: z.array(
    FileSchema.extend({
      todo_list: z.lazy(() => TodoSchema).array(),
    }),
  ),
});

export const FileRouterSchema = {
  getInput,
  getOutput,
  getManyInput,
  createInputBody,
  createInput,
  createManyInput,
  fileInput,
  deleteInput,
  deleteManyInput,
  searchInput,
  searchOutput,
};
