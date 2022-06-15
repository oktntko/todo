import { Prisma } from "@prisma/client";
import ORM from "~/arch/ORM";
import log from "~/middlewares/log";

type StackedBarType = {
  created_date: string;
  name: string | null;
  count: number;
};

const selectStackedBar = async (
  groupBy: "category" | "project",
  begin_date: string,
  end_date: string
): Promise<StackedBarType[]> => {
  log.debug("selectStackedBar");

  const $table = Prisma.raw(groupBy === "category" ? "categories" : "projects");
  const $group_id = Prisma.raw(groupBy === "category" ? "category_id" : "project_id");
  const $name = Prisma.raw(groupBy === "category" ? "category_name" : "project_name");

  return ORM.$queryRaw`
SELECT
  to_char(todos.created_at, 'YYYY-MM-DD') AS created_date
  , ${$name} AS name
  , count(*) AS count
FROM
  todos
  LEFT OUTER JOIN ${$table} AS JOINED
    ON todos.${$group_id} = JOINED.${$group_id}
WHERE
  todos.created_at BETWEEN '${Prisma.raw(begin_date)}' AND '${Prisma.raw(end_date)}'
GROUP BY
  created_date
  , name
ORDER BY
  created_date ASC
  `;
};

type PieType = {
  name: string | null;
  count: number;
};

const selectPie = async (
  groupBy: "category" | "project",
  begin_date: string,
  end_date: string
): Promise<PieType[]> => {
  log.debug("selectPie");

  const $table = Prisma.raw(groupBy === "category" ? "categories" : "projects");
  const $group_id = Prisma.raw(groupBy === "category" ? "category_id" : "project_id");
  const $name = Prisma.raw(groupBy === "category" ? "category_name" : "project_name");

  return ORM.$queryRaw`
SELECT
  ${$name} AS name
  , count(*) AS count
FROM
  todos
  LEFT OUTER JOIN ${$table} AS JOINED
    ON todos.${$group_id} = JOINED.${$group_id}
WHERE
  todos.created_at BETWEEN '${Prisma.raw(begin_date)}' AND '${Prisma.raw(end_date)}'
GROUP BY
  name
  `;
};

type CountType = {
  count: number;
};

const selectCount = async (
  whereBy: "created" | "done",
  begin_date: string,
  end_date: string
): Promise<CountType[]> => {
  log.debug("selectCount");

  const $where_at = Prisma.raw(whereBy === "created" ? "created_at" : "done_at");

  return ORM.$queryRaw`
SELECT
  count(*) AS count
FROM
  todos
WHERE
  ${$where_at} BETWEEN '${Prisma.raw(begin_date)}' AND '${Prisma.raw(end_date)}'
  `;
};

export const TodosRawRepository = {
  selectStackedBar,
  selectPie,
  selectCount,
} as const;
