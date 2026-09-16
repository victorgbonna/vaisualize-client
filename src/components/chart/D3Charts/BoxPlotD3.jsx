import { useContext, useEffect, useMemo, useState } from "react";
import { DataRequestContext } from "@/context";
import { assembleChartRows, normalizeConfig, pagination } from "./chartDataUtils";
import DistributionChartD3 from "./DistributionChartD3";

export default function BoxPlotD3({ x, y, relationships = [], distributionKind = "box" }) {
  const { datasets: dataArray } = useContext(DataRequestContext);
  const rows = useMemo(() => assembleChartRows({ dataArray, x: normalizeConfig(x), y: normalizeConfig(y), relationships }), [dataArray, x, y, relationships]);
  const grouped = useMemo(() => groupRows(rows), [rows]);
  return <PagedDistribution grouped={grouped} xLabel={normalizeConfig(x)?.col} yLabel={normalizeConfig(y)?.col} kind={distributionKind} loading={dataArray == null} />;
}

function groupRows(rows) {
  const grouped = {};
  rows.forEach((row) => {
    const value = Number(row.__y);
    if (!Number.isFinite(value)) return;
    const key = row.__x ?? "N/B";
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(value);
  });
  return Object.entries(grouped).map(([key, values]) => ({ key, values }));
}

function PagedDistribution({ grouped, xLabel, yLabel, kind, loading }) {
  const [meta, setMeta] = useState({ page: 1, pages: 1, limit: 5 });
  useEffect(() => setMeta((previous) => ({ ...previous, ...pagination({ page: previous.page, count: grouped.length, limit: previous.limit }) })), [grouped.length]);
  const page = useMemo(() => grouped.slice(meta.skip || 0, (meta.skip || 0) + meta.limit), [grouped, meta]);
  if (loading) return <ChartState>Loading chart...</ChartState>;
  if (!page.length) return <ChartState>No data available</ChartState>;
  return <div className="relative"><SlideThrough meta={meta} setMeta={setMeta} /><DistributionChartD3 groupedData={page} kind={kind} xLabel={xLabel} yLabel={yLabel} /></div>;
}

function SlideThrough({ meta, setMeta }) {
  if (meta.pages <= 1) return null;
  return <div className="absolute right-2 top-4 z-10 flex gap-6">{[-1, 1].map((direction) => <button key={direction} type="button" disabled={direction < 0 ? meta.page === 1 : meta.page === meta.pages} onClick={() => setMeta((previous) => ({ ...previous, page: previous.page + direction, skip: (previous.page + direction - 1) * previous.limit }))} className="rounded-full bg-black p-1"><img src="/svg/arrow-back-white.svg" alt="Change page" style={direction > 0 ? { transform: "rotate(180deg)" } : undefined} /></button>)}</div>;
}

function ChartState({ children }) {
  return <div className="flex h-[400px] w-full items-center justify-center"><p className="italic text-slate-500">{children}</p></div>;
}
