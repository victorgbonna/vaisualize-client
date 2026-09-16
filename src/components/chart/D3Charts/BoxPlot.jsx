"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { Chart as ChartJS } from "chart.js";
import { Chart } from "react-chartjs-2";
import "chart.js/auto";
import {
  BoxAndWiskers,
  BoxPlotController,
} from "@sgratzl/chartjs-chart-boxplot";
import { API_ENDPOINTS } from "@/configs";
import { DataRequestContext } from "@/context";
import {
  assembleChartRows,
  normalizeConfig,
  pagination,
} from "./chartDataUtils";

ChartJS.register(BoxPlotController, BoxAndWiskers);

export default function BoxPlot({ x, y, relationships = [] }) {
  const { datasets: dataArray } = useContext(DataRequestContext);
  const xConfig = useMemo(() => normalizeConfig(x), [x]);
  const yConfig = useMemo(() => normalizeConfig(y), [y]);

  const groupedData = useMemo(() => {
    const rows = assembleChartRows({
      dataArray,
      x: xConfig,
      y: yConfig,
      relationships,
    });

    return groupDistributionRows(rows);
  }, [dataArray, xConfig, yConfig, relationships]);

  return (
    <DistributionChart
      groupedData={groupedData}
      xLabel={xConfig?.col}
      yLabel={yConfig?.col}
      type="boxplot"
      loading={dataArray === undefined || dataArray === null}
    />
  );
}

function groupDistributionRows(rows) {
  return rows.reduce((acc, row) => {
    const key = row.__x ?? "N/B";
    const value = Number(row.__y);

    if (!Number.isFinite(value)) return acc;
    if (!acc[key]) acc[key] = [];

    acc[key].push(value);
    return acc;
  }, {});
}

function DistributionChart({ groupedData, xLabel, yLabel, type, loading }) {
  const labels = useMemo(() => Object.keys(groupedData), [groupedData]);
  const values = useMemo(() => Object.values(groupedData), [groupedData]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, limit: 4 });

  useEffect(() => {
    setMeta((previous) => ({
      ...previous,
      ...pagination({
        page: previous.page,
        count: labels.length,
        limit: previous.limit,
      }),
    }));
  }, [labels.length]);

  const chartData = useMemo(() => {
    if (!labels.length) return null;

    return {
      labels: labels.slice(meta.skip || 0, (meta.skip || 0) + meta.limit),
      datasets: [
        {
          label: yLabel,
          data: values.slice(meta.skip || 0, (meta.skip || 0) + meta.limit),
          backgroundColor: API_ENDPOINTS.GET_COLORS,
          borderColor: "rgba(75, 192, 192, 1)",
          borderWidth: 1,
          outlierColor: "#64748b",
          padding: 10,
          itemRadius: 0,
        },
      ],
    };
  }, [labels, values, meta, yLabel]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        x: {
          title: { display: Boolean(xLabel), text: xLabel },
          ticks: { font: { size: 11 }, maxRotation: 20 },
        },
        y: {
          title: { display: Boolean(yLabel), text: yLabel },
        },
      },
    }),
    [xLabel, yLabel]
  );

  if (loading) return <ChartState>Loading chart...</ChartState>;
  if (!chartData) return <ChartState>No data available</ChartState>;

  return (
    <div className="w-full relative">
      <SlideThrough meta={meta} setMeta={setMeta} />
      <div className="h-[400px] tablet:w-[500px] tablet:h-[350px]">
        <Chart type={type} data={chartData} options={options} />
      </div>
    </div>
  );
}

function ChartState({ children }) {
  return (
    <div className="w-full h-[400px] flex items-center justify-center">
      <p className="italic text-slate-500">{children}</p>
    </div>
  );
}

function SlideThrough({ meta, setMeta }) {
  if (meta.pages <= 1) return null;

  return (
    <div className="flex justify-end items-center justify-between gap-x-6 absolute top-4 right-2 z-10">
      {[-1, 1].map((direction) => (
        <button
          key={direction}
          type="button"
          disabled={direction < 0 ? meta.page === 1 : meta.page === meta.pages}
          onClick={() =>
            setMeta((previous) => ({
              ...previous,
              page: previous.page + direction,
              skip: (previous.page + direction - 1) * previous.limit,
            }))
          }
          className="bg-black p-1 rounded-full"
        >
          <img
            src="/svg/arrow-back-white.svg"
            alt="Change page"
            style={direction > 0 ? { transform: "rotate(180deg)" } : undefined}
          />
        </button>
      ))}
    </div>
  );
}
