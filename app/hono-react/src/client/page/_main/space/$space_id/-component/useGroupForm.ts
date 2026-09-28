import type { z } from '@todo/lib';

import { GroupRouterSchema } from '@/schema';

export type GroupFormValue = z.input<typeof GroupRouterSchema.createInput>;
