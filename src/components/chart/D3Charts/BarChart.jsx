import { useContext, useEffect, useMemo, useState } from "react";
import { DataRequestContext } from "@/context";
import CartesianChart from "./CartesianChart";
import { aggregateGrouped, aggregateSingle, assembleChartRows, findRelationship, getGroupValues, getTableRows, normalizeConfig, pagination } from "./chartDataUtils";

export default function BarChart(props) {
  const { datasets: dataArray } = useContext(DataRequestContext);
  const groupBy = normalizeConfig(props.group_by);
  const hasGroupBy = Boolean(groupBy?.table && groupBy?.col);
  const groupValues = useMemo(() => getGroupValues(dataArray, groupBy), [dataArray, groupBy]);
  const x = normalizeConfig(props.x);
  const y = normalizeConfig(props.y);
  const axisRelationship = x?.table && y?.table && x.table !== y.table
    ? findRelationship(x.table, y.table, props.relationships || [])
    : null;
  const workingTable = axisRelationship?.fromTable || x?.table;
  const workingData = getTableRows(dataArray, workingTable);

  return hasGroupBy && groupValues.length <= 21
    ? <BarChartWithGroupBy {...props} workingData={workingData} />
    : <BarChartWithoutGroupBy {...props} workingData={workingData} />;
}

function useChartData({ dataArray, workingData, x, y, groupBy, relationships, unit, aggregate, grouped, limit }) {
  const rows = useMemo(() => assembleChartRows({ dataArray, workingData, x, y, groupBy, relationships }), [dataArray, workingData, x, y, groupBy, relationships]);
  const values = useMemo(() => grouped ? aggregateGrouped({ data: rows, unit, aggregate }) : aggregateSingle({ data: rows, unit, aggregate }), [rows, unit, aggregate, grouped]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, limit });

  useEffect(() => {
    const count = grouped ? values?.[0]?.data?.length || 0 : values?.length || 0;
    setMeta((previous) => ({ ...previous, ...pagination({ page: previous.page, count, limit }) }));
  }, [values, grouped, limit]);

  const pageData = useMemo(() => grouped
    ? values.flatMap(({ groupKey, data }) => data.slice(meta.skip || 0, (meta.skip || 0) + meta.limit).map((item) => ({ ...item, groupKey })))
    : values.slice(meta.skip || 0, (meta.skip || 0) + meta.limit), [values, grouped, meta]);

  return { values, pageData, meta, setMeta };
}

function BarChartWithoutGroupBy({ x, y, aggregate, unit, relationships = [], workingData }) {
  const { datasets: dataArray } = useContext(DataRequestContext);
  const xConfig = useMemo(() => normalizeConfig(x), [x]);
  const yConfig = useMemo(() => normalizeConfig(y), [y]);
  const { pageData, meta, setMeta } = useChartData({ dataArray, workingData, x: xConfig, y: yConfig, relationships, unit, aggregate, grouped: false, limit: unit ? 20 : 5 });
  return <ChartFrame data={pageData} meta={meta} setMeta={setMeta} kind="bar" xLabel={xConfig?.col} yLabel={yConfig?.col || aggregate} />;
}

function BarChartWithGroupBy({ x, y, group_by, aggregate, unit, relationships = [], workingData }) {
  const { datasets: dataArray } = useContext(DataRequestContext);
  const xConfig = useMemo(() => normalizeConfig(x), [x]);
  const yConfig = useMemo(() => normalizeConfig(y), [y]);
  const groupConfig = useMemo(() => normalizeConfig(group_by), [group_by]);
  const { pageData, meta, setMeta } = useChartData({ dataArray, workingData, x: xConfig, y: yConfig, groupBy: groupConfig, relationships, unit, aggregate, grouped: true, limit: unit ? 20 : 5 });
  const groups = useMemo(() => [...new Set(pageData.map((item) => item.groupKey))], [pageData]);
  return <ChartFrame data={pageData} groups={groups} meta={meta} setMeta={setMeta} kind="bar" xLabel={xConfig?.col} yLabel={yConfig?.col || aggregate} />;
}

function ChartFrame({ data, groups = [], meta, setMeta, kind, xLabel, yLabel }) {
  if (!data?.length) return <div className="w-full h-[400px] flex items-center justify-center"><p className="italic text-slate-500">No data available</p></div>;
  return <div className="relative"><SlideThrough meta={meta} setMeta={setMeta} /><CartesianChart data={data} groups={groups} kind={kind} xLabel={xLabel} yLabel={yLabel} /></div>;
}

function SlideThrough({ meta, setMeta }) {
  if (meta.pages <= 1) return null;
  return <div className="flex justify-end gap-6 absolute top-4 right-2 z-10">{[-1, 1].map((direction) => <button key={direction} type="button" disabled={direction < 0 ? meta.page === 1 : meta.page === meta.pages} onClick={() => setMeta((previous) => ({ ...previous, page: previous.page + direction, skip: (previous.page + direction - 1) * previous.limit }))} className="bg-black p-1 rounded-full"><img src="/svg/arrow-back-white.svg" alt="Change page" style={direction > 0 ? { transform: "rotate(180deg)" } : undefined} /></button>)}</div>;
}
