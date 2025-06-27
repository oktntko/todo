import { z } from '@repo/lib/zod';

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

export default UserSchema;
