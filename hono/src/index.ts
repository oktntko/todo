import { serve } from "@hono/node-server";
import { HonoRouter } from "./router/_router.js";

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: HonoRouter.fetch,
  port,
});
