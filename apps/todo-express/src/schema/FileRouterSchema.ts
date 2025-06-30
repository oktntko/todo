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
const getManyInput = z.object({ file_id_list: FileSchema.shape.file_id.array().min(1) });

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

const createInput = z.object({
  body: z.object({ todo_id: TodoSchema.shape.todo_id.optional() }),
  file: fileInput,
});
const createManyInput = z.object({
  body: z.object({ todo_id: TodoSchema.shape.todo_id.optional() }),
  files: fileInput.array().min(1),
});

const deleteInput = FileSchema.pick({
  file_id: true,
  updated_at: true,
});

export const FileOutputSchema = FileSchema.merge(
  z.object({
    todo_list: z.lazy(() => TodoSchema).array(),
  }),
);

const searchInput = z.object({
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
  file_list: z.array(FileOutputSchema),
});

export const FileRouterSchema = {
  getInput,
  getManyInput,
  createInput,
  createManyInput,
  fileInput,
  deleteInput,
  searchInput,
  searchOutput,
};
