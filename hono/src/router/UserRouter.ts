import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "../lib/zod.js";

export const user = new Hono();

user.get("/api/user", (c) => c.text("List Books"));

user.get("/api/user/:user_id", (c) => {
  const id = c.req.param("user_id");
  return c.text("Get Book: " + id);
});

const schema = z.object({
  name: z.string(),
  age: z.number(),
});

user.post("/api/user", zValidator("json", schema), (c) => {
  const input = c.req.valid("json");

  return c.json({
    success: true,
    message: `${input.name} is ${input.age}`,
  });
});
