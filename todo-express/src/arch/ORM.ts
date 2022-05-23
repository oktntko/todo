import { PrismaClient } from "@prisma/client";
import { db } from "~/middlewares/log";

const ORM = new PrismaClient({
  log: ["info", { emit: "event", level: "query" }, "warn", "error"],
});

ORM.$use(async (params, next) => {
  const result = await next(params);
  db.debug("RESULT::", result);
  return result;
});

ORM.$on("query", (event) => {
  db.info("QUERY::", event.query);
  db.debug("PARAMS::", event.params, "DURATION::", `${event.duration} ms`);
});

export default ORM;
