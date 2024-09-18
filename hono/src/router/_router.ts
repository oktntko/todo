import { Hono } from "hono";
import { UserRouter } from "./UserRouter.js";

export const HonoRouter = new Hono().route("/", UserRouter);

export type TypeHonoRouter = typeof HonoRouter;
