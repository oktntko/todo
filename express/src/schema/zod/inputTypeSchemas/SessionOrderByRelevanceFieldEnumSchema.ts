import { z } from '~/lib/zod.js';

export const SessionOrderByRelevanceFieldEnumSchema = z.enum(['session_key', 'data']);

export default SessionOrderByRelevanceFieldEnumSchema;
