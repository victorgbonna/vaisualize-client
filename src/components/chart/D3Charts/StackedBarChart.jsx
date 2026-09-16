import { useContext, useEffect, useMemo, useState } from "react";
import { DataRequestContext } from "@/context";
import CartesianChart from "./CartesianChart";
import { aggregateGrouped, assembleChartRows, getGroupValues, normalizeConfig, pagination } from "./chartDataUtils";

export default function StackedBarChart(props) {
  const { datasets: contextData } = useContext(DataRequestContext);
  const dataArray = props.dataArray || contextData;
  const groupBy = normalizeConfig(props.group_by);
  const groupValues = useMemo(() => getGroupValues(dataArray, groupBy), [dataArray, groupBy]);

  if (!groupBy?.table || !groupBy?.col || groupValues.length > 21) {
    return <div className="w-full h-[400px] flex items-center justify-center"><p className="italic text-slate-500">A compatible Group By column is required.</p></div>;
  }

  return <StackedBarChartWithGroupBy {...props} dataArray={dataArray} />;
}

function StackedBarChartWithGroupBy({ x, y, group_by, aggregate, unit, dataArray, relationships = [] }) {
  const xConfig = useMemo(() => normalizeConfig(x), [x]);
  const yConfig = useMemo(() => normalizeConfig(y), [y]);
  const groupConfig = useMemo(() => normalizeConfig(group_by), [group_by]);
  const rows = useMemo(() => assembleChartRows({ dataArray, x: xConfig, y: yConfig, groupBy: groupConfig, relationships }), [dataArray, xConfig, yConfig, groupConfig, relationships]);
  const groupedData = useMemo(() => aggregateGrouped({ data: rows, unit, aggregate }), [rows, unit, aggregate]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, limit: unit ? 20 : 5 });

  useEffect(() => {
    const count = groupedData?.[0]?.data?.length || 0;
    setMeta((previous) => ({ ...previous, ...pagination({ page: previous.page, count, limit: previous.limit }) }));
  }, [groupedData]);

  const data = useMemo(() => groupedData.flatMap(({ groupKey, data }) => data.slice(meta.skip || 0, (meta.skip || 0) + meta.limit).map((item) => ({ ...item, groupKey }))), [groupedData, meta]);
  const groups = useMemo(() => groupedData.map(({ groupKey }) => groupKey), [groupedData]);

  if (!data.length) return <div className="w-full h-[400px] flex items-center justify-center"><p className="italic text-slate-500">No data available</p></div>;
  return <div className="relative"><SlideThrough meta={meta} setMeta={setMeta} /><CartesianChart data={data} groups={groups} kind="stacked" xLabel={xConfig?.col} yLabel={yConfig?.col || aggregate} /></div>;
}

function SlideThrough({ meta, setMeta }) {
  if (meta.pages <= 1) return null;
  return <div className="flex justify-end gap-6 absolute top-4 right-2 z-10">{[-1, 1].map((direction) => <button key={direction} type="button" disabled={direction < 0 ? meta.page === 1 : meta.page === meta.pages} onClick={() => setMeta((previous) => ({ ...previous, page: previous.page + direction, skip: (previous.page + direction - 1) * previous.limit }))} className="bg-black p-1 rounded-full"><img src="/svg/arrow-back-white.svg" alt="Change page" style={direction > 0 ? { transform: "rotate(180deg)" } : undefined} /></button>)}</div>;
}
