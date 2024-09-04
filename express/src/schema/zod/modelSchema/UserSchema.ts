import { z } from '~/lib/zod.js';
import type { FileWithRelations } from './FileSchema.js';
import { FileWithRelationsSchema } from './FileSchema.js';
import type { SessionWithRelations } from './SessionSchema.js';
import { SessionWithRelationsSchema } from './SessionSchema.js';
import type { SpaceWithRelations } from './SpaceSchema.js';
import { SpaceWithRelationsSchema } from './SpaceSchema.js';

/////////////////////////////////////////
// USER SCHEMA
/////////////////////////////////////////

/**
 * ユーザ
 */
export const UserSchema = z.object({
  user_id: z.number().int(),
  email: z.string().trim().min(1).max(255).email(),
  password: z.string().trim().min(1).max(255),
  username: z.string().trim().min(1).max(100),
  /**
   * 二要素認証の有効化 `true`: 有効 / `false`: 無効
   */
  twofa_enable: z.boolean(),
  /**
   * 二要素認証の秘密鍵
   */
  twofa_secret: z.string().trim().max(255),
  created_at: z.coerce.date(),
  updated_at: z.coerce.date(),
});

export type User = z.infer<typeof UserSchema>;

/////////////////////////////////////////
// USER RELATION SCHEMA
/////////////////////////////////////////

export type UserRelations = {
  session_list: SessionWithRelations[];
  file_list: FileWithRelations[];
  space_list: SpaceWithRelations[];
};

export type UserWithRelations = z.infer<typeof UserSchema> & UserRelations;

export const UserWithRelationsSchema: z.ZodType<UserWithRelations> = UserSchema.merge(
  z.object({
    session_list: z.lazy(() => SessionWithRelationsSchema).array(),
    file_list: z.lazy(() => FileWithRelationsSchema).array(),
    space_list: z.lazy(() => SpaceWithRelationsSchema).array(),
  }),
);

export default UserSchema;
