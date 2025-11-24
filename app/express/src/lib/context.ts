import { AsyncLocalStorage } from 'node:async_hooks';

export const ReqCtx = {
  context: new AsyncLocalStorage<{
    reqid: string;
  }>(),
  get reqid() {
    return this.context.getStore()?.reqid ?? 'UNKNOWN';
  },
};
