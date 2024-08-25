import { z } from '~/lib/zod.js';
import { FileSchema } from '~/schema/zod/modelSchema/FileSchema.js';

const getInput = FileSchema.pick({
  file_id: true,
});
const getManyInput = z.object({ file_id: FileSchema.shape.file_id.array().min(1) });

const createInput = z.any().refine(
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

const deleteInput = FileSchema.pick({
  file_id: true,
  updated_at: true,
});

export const FileRouterSchema = {
  getInput,
  getManyInput,
  createInput,
  deleteInput,
};
