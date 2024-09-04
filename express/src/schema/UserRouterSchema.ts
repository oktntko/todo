import { z } from '~/lib/zod.js';
import { SortOrderSchema } from '~/schema/zod/inputTypeSchemas/SortOrderSchema.js';
import { UserScalarFieldEnumSchema } from '~/schema/zod/inputTypeSchemas/UserScalarFieldEnumSchema.js';
import { UserSchema } from '~/schema/zod/modelSchema/UserSchema.js';

const createInput = UserSchema.omit({
  user_id: true,

  created_at: true,
  updated_at: true,
});

const deleteInput = UserSchema.pick({
  user_id: true,
  updated_at: true,
});

const updateInput = createInput.merge(deleteInput);

const getInput = UserSchema.pick({
  user_id: true,
});

const listInput = z.object({
  where: z.object({
    user_keyword: z.string().trim().max(255),
  }),
  sort: z.object({
    field: UserScalarFieldEnumSchema,
    order: SortOrderSchema,
  }),
  limit: z.number().int().max(100),
  offset: z.number().int(),
});

const listOutput = z.object({
  total: z.number(),
  user_list: z.array(UserSchema),
});

export const UserRouterSchema = {
  createInput,
  deleteInput,
  updateInput,
  getInput,
  listInput,
  listOutput,
};
