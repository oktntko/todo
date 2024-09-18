import { Hono } from "hono";
import { user } from "./UserRouter.js";

export const HonoRouter = new Hono();

HonoRouter.route("/", user);
