import { useContext, useEffect, useMemo, useState } from "react";
import * as d3 from "d3";
import { DataRequestContext } from "@/context";
import CartesianChart from "./CartesianChart";
import {
  assembleChartRows,
  getTableRows,
  normalizeConfig,
  pagination,
} from "./chartDataUtils";

// ============================================================
// HISTOGRAM BINNING
// ============================================================

function aggregateHistogramBins({ data, aggregate, thresholdCount = 12 }) {
  const numericValues = data
    .map((row) => Number(row.__x))
    .filter((value) => Number.isFinite(value));

  if (!numericValues.length) return [];

  const binGenerator = d3
    .bin()
    .domain(d3.extent(numericValues))
    .thresholds(thresholdCount);

  const bins = binGenerator(numericValues);

  // If a __y column exists, sum/average it per bin instead of just counting rows.
  const hasY = data.some((row) => row.__y !== undefined);

  return bins
    .filter((bin) => bin.length > 0 || bin.x0 !== bin.x1) // keep empty-but-in-range bins for a continuous axis
    .map((bin) => {
      let value;

      if (!hasY || aggregate === "count") {
        value = bin.length;
      } else {
        const yValues = bin
          .map((v) => {
            // find the original row for this numeric __x value to read __y
            const row = data.find((r) => Number(r.__x) === v);
            return row ? Number(row.__y) : null;
          })
          .filter((v) => Number.isFinite(v));

        const total = d3.sum(yValues);

        value =
          aggregate === "average"
            ? (yValues.length ? total / yValues.length : 0)
            : total; // "sum" or fallback
      }

      return {
        key: `${d3.format(",.2~s")(bin.x0)}–${d3.format(",.2~s")(bin.x1)}`,
        x0: bin.x0,
        x1: bin.x1,
        value,
      };
    });
}

// ============================================================
// HISTOGRAM COMPONENT
// ============================================================

export default function Histogram({ x, y, aggregate, relationships = [] }) {
  const { datasets: dataArray } = useContext(DataRequestContext);
  const xConfig = useMemo(() => normalizeConfig(x), [x]);
  const yConfig = useMemo(() => normalizeConfig(y), [y]);

  const rows = useMemo(
    () =>
      assembleChartRows({
        dataArray,
        workingData: getTableRows(dataArray, xConfig?.table),
        x: xConfig,
        y: yConfig,
        relationships,
      }),
    [dataArray, xConfig, yConfig, relationships]
  );

  const values = useMemo(
    () =>
      aggregateHistogramBins({
        data: rows,
        aggregate,
      }),
    [rows, aggregate]
  );

  const [meta, setMeta] = useState({ page: 1, pages: 1, limit: 12 });

  useEffect(() => {
    setMeta((previous) => ({
      ...previous,
      ...pagination({
        page: previous.page,
        count: values.length,
        limit: previous.limit,
      }),
    }));
  }, [values]);

  const pageData = useMemo(
    () => values.slice(meta.skip || 0, (meta.skip || 0) + meta.limit),
    [values, meta]
  );

  if (dataArray === undefined || dataArray === null) {
    return <ChartState>Loading chart...</ChartState>;
  }

  if (!pageData.length) {
    return <ChartState>No data available</ChartState>;
  }

  return (
    <div className="relative">
      <SlideThrough meta={meta} setMeta={setMeta} />
      <CartesianChart
        data={pageData}
        kind="bar"
        xLabel={xConfig?.col}
        yLabel={yConfig?.col || aggregate}
      />
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
    <div className="flex justify-end gap-6 absolute top-4 right-2 z-10">
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