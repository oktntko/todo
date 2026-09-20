import { type InferResponseType } from 'hono';
import { atom } from 'jotai';

import { hono } from '~/middleware/hono';

export const aichatListAtom = atom<InferResponseType<typeof hono.aichat.list.$post>>([]);
