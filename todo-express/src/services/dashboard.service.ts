import dayjs from "dayjs";
import { DashboardQuery } from "~/controllers/api/dashboard.controller";
import log from "~/middlewares/log";
import { TodosRawRepository } from "~/repositories/todos.raw.repository";

// # GET /api/dashboard
const getDashboard = async (query: DashboardQuery) => {
  log.debug("getDashboard");
  const begin_date = query.begin_date ?? dayjs().subtract(1, "week").format("YYYY-MM-DD");
  // end_date 検索対象がタイムスタンプなので、指定された日を検索対象に含めるために、＋１日する
  const end_date = dayjs(query.end_date).add(1, "day").format("YYYY-MM-DD");

  // カウントを取得する
  const count = {
    created: (await TodosRawRepository.selectCount("created", begin_date, end_date))[0],
    done: (await TodosRawRepository.selectCount("done", begin_date, end_date))[0],
  };

  // pie のデータを取得する
  const pie = {
    category: await TodosRawRepository.selectPie("category", begin_date, end_date),
    project: await TodosRawRepository.selectPie("project", begin_date, end_date),
  };

  // bar のデータを取得する
  const stackedBar = {
    category: await TodosRawRepository.selectStackedBar("category", begin_date, end_date),
    project: await TodosRawRepository.selectStackedBar("project", begin_date, end_date),
  };

  return {
    count,
    pie,
    stackedBar,
  };
};

export const DashboardService = {
  getDashboard,
} as const;
