import { type InferResponseType } from 'hono';
import { atom } from 'jotai';

import { hono } from '~/middleware/hono';

export const groupListAtom = atom<InferResponseType<typeof hono.group.list.$post>>([]);
