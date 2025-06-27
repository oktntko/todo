import { z } from '@repo/lib/zod';

export const SessionOrderByRelevanceFieldEnumSchema = z.enum(['session_key', 'data']);

export default SessionOrderByRelevanceFieldEnumSchema;
