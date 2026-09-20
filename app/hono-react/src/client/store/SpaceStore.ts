import { type InferResponseType } from 'hono';
import { atom } from 'jotai';

import { hono } from '~/middleware/hono';

export const spaceListAtom = atom<InferResponseType<typeof hono.space.list.$post>>([]);

export const currentSpaceAtom = atom<
  InferResponseType<typeof hono.space.list.$post>[number] | undefined
>(undefined);
