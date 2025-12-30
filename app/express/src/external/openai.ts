import OpenAI, { ClientOptions } from 'openai';

export function newOpenAI(options: ClientOptions = {}) {
  return new OpenAI(options);
}
