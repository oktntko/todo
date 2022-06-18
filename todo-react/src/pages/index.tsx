import dayjs from "dayjs";
import { motion } from "framer-motion";
import { memo, useCallback, useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { api } from "~/repositories/api";
import { components, paths } from "~/repositories/schema";

const BEGIN_DATE_ID = "begin_date";
const END_DATE_ID = "end_date";

export function IndexPage() {
  const { res, getDashboard } = useDashboard();
  const [checked, setChecked] = useState("category");

  const begin_date = dayjs().subtract(1, "week").format("YYYY-MM-DD");
  const end_date = dayjs().format("YYYY-MM-DD");

  const handleChange = () => {
    const beginElement = document.getElementById(BEGIN_DATE_ID);
    const endElement = document.getElementById(END_DATE_ID);
    if (!(beginElement instanceof HTMLInputElement) || !(endElement instanceof HTMLInputElement)) {
      return;
    }

    if (dayjs(beginElement.value).isAfter(dayjs(endElement.value))) {
      return;
    }

    getDashboard({
      begin_date: beginElement.value,
      end_date: endElement.value,
    });
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto md:my-4 md:px-4"
      >
        {/* 検索ボックス */}
        <div className="mx-auto flex flex-row flex-nowrap items-center justify-center md:max-w-3xl">
          {/* 開始日と期日 */}
          <form className="flex flex-nowrap items-center space-x-1 py-1">
            {/* 開始日 */}
            <input
              id={BEGIN_DATE_ID}
              name="begin_date"
              type="date"
              defaultValue={begin_date}
              className="border-[0.5px] focus:outline-none"
              onChange={handleChange}
            />
            <span> ～ </span>
            {/* 期日 */}
            <input
              id={END_DATE_ID}
              name="end_date"
              type="date"
              defaultValue={end_date}
              className="border-[0.5px] focus:outline-none"
              onChange={handleChange}
            />
          </form>
        </div>
        {/* 件数 */}
        <div className="m-4 flex flex-wrap justify-center gap-8">
          <div className="min-w-[16rem] rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
            <h5 className="mb-2 text-lg font-bold uppercase text-red-500 dark:text-white">
              created
            </h5>
            <h1
              className={`mb-2 text-center text-8xl font-bold text-gray-500 dark:text-white ${
                (res?.count.created.count ?? 0) - 5 > (res?.count.done.count ?? 0)
                  ? "text-red-500"
                  : ""
              }`}
            >
              {res?.count.created.count}
            </h1>
          </div>
          <div className="min-w-[16rem] rounded-lg border border-gray-200 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
            <h5 className="mb-2 text-lg font-bold uppercase text-green-500 dark:text-white">
              done
            </h5>
            <h5
              className={`mb-2 text-center text-8xl font-bold text-gray-500 dark:text-white ${
                (res?.count.created.count ?? 0) - 5 < (res?.count.done.count ?? 0)
                  ? "text-green-500"
                  : ""
              }`}
            >
              {res?.count.done.count}
            </h5>
          </div>
        </div>
        {/* チャート選択肢 */}
        <div className="m-4 flex flex-wrap justify-center gap-8">
          {["category", "project"].map((option) => (
            <div key={option}>
              <input
                type="radio"
                name="option"
                id={option}
                value={option}
                checked={checked === option}
                className="peer hidden"
                onChange={(e) => setChecked(e.target.value)}
              />
              <label
                htmlFor={option}
                className="my-4 flex w-32 flex-col rounded-2xl border-2 border-gray-500 p-2 text-center text-lg font-bold uppercase hover:bg-yellow-200 peer-checked:bg-green-200"
              >
                {option}
              </label>
            </div>
          ))}
        </div>
        {/* チャート */}
        <div className="flex flex-wrap justify-center gap-2 ">
          {checked === "category" ? (
            <>
              <div className="">{res ? <PieChart data={res.pie.category} /> : null}</div>
              <div className="">
                {res ? <StackedBarChart data={res.stackedBar.category} /> : null}
              </div>
            </>
          ) : (
            <>
              <div className="">{res ? <PieChart data={res.pie.project} /> : null}</div>
              <div className="">
                {res ? <StackedBarChart data={res.stackedBar.project} /> : null}
              </div>
            </>
          )}
        </div>
      </motion.div>
    </>
  );
}

const useDashboard = () => {
  const [res, setRes] = useState<components["schemas"]["DashboardResponse"] | null>(null);
  const getDashboard = useCallback(
    (query: paths["/api/dashboard"]["get"]["parameters"]["query"]) => {
      api.get.dashboard(query).then(({ data }) => setRes(data));
    },
    []
  );

  useEffect(() => {
    getDashboard({});
  }, []);

  return { res, getDashboard };
};

const PieChart = memo(function PieChart({
  data,
}: {
  data: components["schemas"]["PieResponse"][];
}) {
  // group
  const labels = data.map((row) => row.name ?? "NOT SET");
  // y軸
  const series: ApexCharts.ApexOptions["series"] = data.map((row) => row.count);

  return (
    <Chart
      options={{ chart: { id: "PieChart" }, labels }}
      series={series}
      type="pie"
      width={720}
      height={480}
    />
  );
});

const StackedBarChart = memo(function StackedBarChart({
  data,
}: {
  data: components["schemas"]["BarResponse"][];
}) {
  // x軸
  const categoriesSet = new Set<string>();
  data.map((row) => categoriesSet.add(row.created_date));
  const categories = Array.from(categoriesSet);

  // group
  const groupsSet = new Set<string | undefined>();
  data.map((row) => groupsSet.add(row.name));
  const groups = Array.from(groupsSet);

  // y軸
  const series: ApexCharts.ApexOptions["series"] = groups.map((group) => {
    const groupData = data.filter((row) => row.name === group);
    return {
      name: group ?? "NOT SET",
      data: categories.map((date) => {
        // その日のデータが無ければ 0 にする
        return groupData.find((row) => row.created_date === date)?.count ?? 0;
      }),
    };
  });

  return (
    <Chart
      options={{
        chart: { id: "StackedBarChart", stacked: true },
        xaxis: { categories },
      }}
      series={series}
      type="bar"
      width={720}
      height={480}
    />
  );
});

/**
 *
 * 期間内増加数 ＝ 件数 / 期間 ＝ 件/日
 * 期間内完了数 ＝ 件数 / 期間 ＝ 件/日
 *
 * カテゴリの割合 | プロジェクトの割合
 * 円グラフ       | 円グラフ
 *
 */
