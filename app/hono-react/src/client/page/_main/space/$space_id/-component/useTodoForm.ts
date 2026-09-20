import type { z } from '@todo/lib';

import { TodoRouterSchema } from '@/schema';

export type TodoFormValue = z.input<typeof TodoRouterSchema.createInput>;
