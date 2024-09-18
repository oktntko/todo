import { z } from '~/lib/zod.js';
import { FileSchema } from '~/schema/zod/modelSchema/FileSchema.js';
import { TodoSchema } from '~/schema/zod/modelSchema/TodoSchema.js';

const getInput = FileSchema.pick({
  file_id: true,
});
const getManyInput = z.object({ file_id: FileSchema.shape.file_id.array().min(1) });

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

export const FileRouterSchema = {
  getInput,
  getManyInput,
  createInput,
  createManyInput,
  fileInput,
  deleteInput,
};
