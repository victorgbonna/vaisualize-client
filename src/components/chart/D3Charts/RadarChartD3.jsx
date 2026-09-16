import { useContext, useEffect, useMemo, useState } from "react";
import * as d3 from "d3";
import { DataRequestContext } from "@/context";
import { findRelationship, getTableRows, normalizeConfig, pagination, resolveRelatedColumnValue } from "./chartDataUtils";

export default function RadarChartD3({ x, y, relationships = [] }) {
  const { datasets: dataArray } = useContext(DataRequestContext);
  const xConfigs = useMemo(() => (Array.isArray(x) ? x : [x]).map(normalizeConfig).filter(Boolean), [x]);
  const yConfig = useMemo(() => normalizeConfig(y), [y]);
  const baseTable = useMemo(() => {
    const firstX = xConfigs[0];
    if (!firstX?.table || !yConfig?.table || firstX.table === yConfig.table) return firstX?.table || yConfig?.table;
    return findRelationship(firstX.table, yConfig.table, relationships)?.fromTable || firstX.table;
  }, [xConfigs, yConfig, relationships]);
  const rows = useMemo(() => getTableRows(dataArray, baseTable).map((row) => ({
    group: resolveValue(row, baseTable, yConfig, dataArray, relationships),
    values: xConfigs.map((config) => Number(resolveValue(row, baseTable, config, dataArray, relationships))),
  })).filter((row) => row.group != null && row.values.some(Number.isFinite)), [dataArray, baseTable, xConfigs, yConfig, relationships]);

  const groups = useMemo(() => [...new Set(rows.map((row) => String(row.group)))], [rows]);
  const [meta, setMeta] = useState({ page: 1, pages: 1, limit: 5 });
  useEffect(() => setMeta((previous) => ({ ...previous, ...pagination({ page: previous.page, count: groups.length, limit: previous.limit }) })), [groups.length]);
  const pageGroups = groups.slice(meta.skip || 0, (meta.skip || 0) + meta.limit);

  if (dataArray == null) return <ChartState>Loading chart...</ChartState>;
  if (!pageGroups.length || !xConfigs.length) return <ChartState>No data available</ChartState>;
  const datasets = pageGroups.map((group) => ({ group, values: rows.filter((row) => String(row.group) === group).map((row) => row.values) }));
  return <div className="relative"><SlideThrough meta={meta} setMeta={setMeta} /><RadarD3 data={datasets} labels={xConfigs.map((config) => config.col)} /></div>;
}

function resolveValue(row, baseTable, config, dataArray, relationships) {
  if (!config?.table || !config?.col) return undefined;
  return resolveRelatedColumnValue({ row, currentTable: baseTable, targetTable: config.table, targetColumn: config.col, dataArray, relationships });
}

function RadarD3({ data, labels }) {
  const [svgElement, setSvgElement] = useState(null);
  useEffect(() => {
    if (!svgElement || !data.length) return;
    const svg = d3.select(svgElement);
    const { width, height } = svgElement.parentElement.getBoundingClientRect();
    svg.selectAll("*").remove().attr("viewBox", `0 0 ${width} ${height}`).attr("width", "100%").attr("height", "100%");
    const radius = Math.min(width, height) * 0.34;
    const center = { x: width / 2, y: height / 2 };
    const angle = (index) => (Math.PI * 2 * index) / labels.length - Math.PI / 2;
    const max = d3.max(data.flatMap((item) => item.values.flat())) || 1;
    const scale = d3.scaleLinear().domain([0, max]).range([0, radius]);
    const color = d3.scaleOrdinal().domain(data.map((item) => item.group)).range(d3.schemeTableau10);
    const point = (index, value) => [center.x + Math.cos(angle(index)) * scale(value), center.y + Math.sin(angle(index)) * scale(value)];
    [0.25, 0.5, 0.75, 1].forEach((level) => svg.append("circle").attr("cx", center.x).attr("cy", center.y).attr("r", radius * level).attr("fill", "none").attr("stroke", "#e2e8f0"));
    labels.forEach((label, index) => { const [x, y] = point(index, max); svg.append("line").attr("x1", center.x).attr("y1", center.y).attr("x2", x).attr("y2", y).attr("stroke", "#cbd5e1"); svg.append("text").attr("x", x).attr("y", y).attr("text-anchor", "middle").attr("font-size", "11px").attr("fill", "#475569").text(label); });
    data.forEach((series) => { const values = labels.map((_, index) => d3.mean(series.values, (row) => Number(row[index]) || 0)); const path = values.map((value, index) => point(index, value)); path.push(path[0]); svg.append("path").attr("d", d3.line()(path)).attr("fill", color(series.group)).attr("fill-opacity", 0.2).attr("stroke", color(series.group)).attr("stroke-width", 2); });
  }, [svgElement, data, labels]);
  return <div className="h-[400px] w-full"><svg ref={setSvgElement} className="h-full w-full" /></div>;
}

function SlideThrough({ meta, setMeta }) { if (meta.pages <= 1) return null; return <div className="absolute right-2 top-4 z-10 flex gap-6">{[-1, 1].map((direction) => <button key={direction} type="button" disabled={direction < 0 ? meta.page === 1 : meta.page === meta.pages} onClick={() => setMeta((previous) => ({ ...previous, page: previous.page + direction, skip: (previous.page + direction - 1) * previous.limit }))} className="rounded-full bg-black p-1"><img src="/svg/arrow-back-white.svg" alt="Change page" style={direction > 0 ? { transform: "rotate(180deg)" } : undefined} /></button>)}</div>; }
function ChartState({ children }) { return <div className="flex h-[400px] w-full items-center justify-center"><p className="italic text-slate-500">{children}</p></div>; }
