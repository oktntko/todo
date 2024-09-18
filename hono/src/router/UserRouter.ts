import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "../lib/zod.js";

const schema = z.object({
  name: z.string(),
  age: z.number(),
});

export const UserRouter = new Hono()
  .get("/api/user", (c) => c.text("List Books"))
  .get("/api/user/:user_id", (c) => {
    const id = c.req.param("user_id");
    return c.text("Get Book: " + id);
  })
  .post("/api/user", zValidator("json", schema), (c) => {
    const input = c.req.valid("json");

    return c.json({
      success: true,
      message: `${input.name} is ${input.age}`,
    });
  });
