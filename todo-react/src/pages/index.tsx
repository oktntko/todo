import dayjs from "dayjs";
import equal from "fast-deep-equal";
import { Field, Form, Formik } from "formik";
import { motion } from "framer-motion";
import { memo, useCallback, useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { BiSend, BiUndo } from "react-icons/bi";
import { Button } from "~/components/Button";
import { api } from "~/repositories/api";
import { components, paths } from "~/repositories/schema";

export function IndexPage() {
  const { res, getDashboard } = useDashboard();
  const [initialValues] = useState({
    begin_date: dayjs().subtract(1, "week").format("YYYY-MM-DD"),
    end_date: dayjs().format("YYYY-MM-DD"),
  });

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container mx-auto md:my-4 md:px-4"
      >
        <div className="mx-auto flex flex-row flex-nowrap items-center justify-center md:max-w-3xl">
          <Formik initialValues={initialValues} onSubmit={(values) => getDashboard(values)}>
            {({ values, resetForm }) => {
              const isOriginalValues = equal(values, initialValues);

              return (
                <Form>
                  <div
                    className={`flex flex-row flex-nowrap items-center justify-center
              space-x-2 p-4 `}
                  >
                    {/* 開始日と期日 */}
                    <div className="flex flex-nowrap items-center space-x-1 py-1">
                      {/* 開始日 */}
                      <Field
                        name="begin_date"
                        type="date"
                        className="border-[0.5px] focus:outline-none"
                      />
                      <span> ～ </span>
                      {/* 期日 */}
                      <Field
                        name="end_date"
                        type="date"
                        className="border-[0.5px] focus:outline-none"
                      />
                    </div>

                    {/* 右側 */}
                    <div className="flex flex-nowrap justify-end space-x-2 ">
                      <Button
                        type="button"
                        className="rounded-3xl p-1"
                        colorset={"white"}
                        disabled={isOriginalValues}
                        onClick={() => {
                          resetForm({ values: initialValues });
                        }}
                      >
                        <BiUndo className="text-lg" />
                      </Button>
                      <Button type="submit" className="rounded-3xl p-1" colorset={"green"}>
                        <BiSend className="text-lg" />
                      </Button>
                    </div>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </div>

        <div className="flex gap-2 ">
          <div className="">{res ? <PieChart data={res.pie.category} /> : null}</div>
          <div className="">{res ? <StackedBarChart data={res.stackedBar.category} /> : null}</div>
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
      height={560}
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
      width={800}
      height={560}
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
