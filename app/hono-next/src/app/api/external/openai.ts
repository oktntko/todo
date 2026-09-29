import type { ClientOptions } from 'openai';
import OpenAI from 'openai';

export function newOpenAI(options: ClientOptions = {}) {
  return new OpenAI(options);
}
