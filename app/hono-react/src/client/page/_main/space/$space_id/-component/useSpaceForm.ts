import type { z } from '@todo/lib';

import type { SpaceRouterSchema } from '@/schema';

export type SpaceFormValue = z.input<typeof SpaceRouterSchema.createInput>;
