import React, { useContext, useEffect, useMemo, useRef } from "react";
import * as d3 from "d3";

import { timeStampControl } from "@/configs";
import { DataRequestContext } from "@/context";
import { formatCompactNumber } from "./chartDataUtils";
import { assembleChartRows } from "./chartCore";

const EMPTY_RELATIONSHIPS = [];

export default function PieChart(props) {
  const { datasets: dataArray } = useContext(DataRequestContext);
  return <PieChartInner {...props} />;
}

function aggregatePieValues({ data, aggregate, hasY }) {
  const { convertToDigit } = timeStampControl;
  const grouped = {};

  data.forEach((item) => {
    const key = item.__x ?? "N/B";
    if (!grouped[key]) grouped[key] = { total: 0, count: 0 };
    grouped[key].total += hasY && item.__y != null ? convertToDigit(item.__y) : 0;
    grouped[key].count += 1;
  });

  return Object.entries(grouped)
    .map(([key, { total, count }]) => ({
      key,
      value: aggregate === "sum"
        ? total
        : aggregate === "average"
          ? count ? total / count : 0
          : count,
    }))
    .sort((a, b) => b.value - a.value);
}

function renderPieChart({ svg, container, data }) {
  if (!svg || !container || !data?.length) return;

  const svgSelection = d3.select(svg);
  svgSelection.selectAll("*").remove();

  const { width, height } = container.getBoundingClientRect();
  if (!width || !height) return;

  const legendReserve = 130;
  const radius = Math.min(width - legendReserve, height) / 2 - 10;
  if (radius <= 0) return;

  const chart = svgSelection
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "xMidYMid meet");
  const centerX = (width - legendReserve) / 2;
  const centerY = height / 2;
  const pieGroup = chart.append("g").attr("transform", `translate(${centerX},${centerY})`);
  const total = d3.sum(data, (item) => item.value) || 1;
  const color = d3.scaleOrdinal().domain(data.map((item) => item.key)).range(d3.schemeTableau10);
  const pie = d3.pie().value((item) => item.value).sort(null);
  const arc = d3.arc().innerRadius(0).outerRadius(radius);
  const hoverArc = d3.arc().innerRadius(0).outerRadius(radius + 8);
  const tooltipLayer = chart.append("g").style("pointer-events", "none").style("opacity", 0);
  const tooltipBackground = tooltipLayer.append("rect").attr("fill", "#0f172a").attr("rx", 4).attr("height", 22).attr("y", -24);
  const tooltipText = tooltipLayer.append("text").attr("fill", "#ffffff").attr("font-size", "11px").attr("x", 0).attr("y", -9);

  pieGroup.selectAll("path")
    .data(pie(data))
    .enter()
    .append("path")
    .attr("d", arc)
    .attr("fill", (item) => color(item.data.key))
    .attr("stroke", "#ffffff")
    .attr("stroke-width", 1.5)
    .style("cursor", "pointer")
    .on("mouseenter", function (event, item) {
      d3.select(this).transition().duration(120).attr("d", hoverArc);
      const percent = ((item.data.value / total) * 100).toFixed(1);
      const label = `${item.data.key}: ${formatCompactNumber(item.data.value)} (${percent}%)`;
      tooltipText.text(label);
      tooltipBackground.attr("width", tooltipText.node().getComputedTextLength() + 16);
      const [labelX, labelY] = arc.centroid(item);
      tooltipLayer.attr("transform", `translate(${centerX + labelX},${centerY + labelY})`).style("opacity", 1);
    })
    .on("mouseleave", function () {
      d3.select(this).transition().duration(120).attr("d", arc);
      tooltipLayer.style("opacity", 0);
    });

  const legend = chart.append("g").attr("transform", `translate(${width - legendReserve + 10},${height / 2 - (data.length * 20) / 2})`);
  data.forEach((item, index) => {
    const legendItem = legend.append("g").attr("transform", `translate(0,${index * 20})`);
    legendItem.append("circle").attr("cx", 5).attr("cy", 0).attr("r", 5).attr("fill", color(item.key));
    legendItem.append("text").attr("x", 15).attr("y", 4).attr("font-size", "11px").attr("fill", "#475569")
      .text(`${item.key} (${((item.value / total) * 100).toFixed(0)}%)`);
  });
}

function D3PieChart({ data, xLabel = "", yLabel = "" }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!data?.length || !svgRef.current || !containerRef.current) return;
    const render = () => renderPieChart({ svg: svgRef.current, container: containerRef.current, data });
    render();
    const observer = new ResizeObserver(render);
    observer.observe(containerRef.current);
    return () => {
      observer.disconnect();
      if (svgRef.current) d3.select(svgRef.current).selectAll("*").remove();
    };
  }, [data]);

  return (
    <div>
      {(xLabel || yLabel) && (
        <div className="px-2 pt-1 text-center text-xs font-semibold text-slate-700">
          {xLabel}
          {xLabel && yLabel ? " / " : ""}
          {yLabel}
        </div>
      )}
      <div ref={containerRef} className="w-full h-[380px] tablet:w-[500px] tablet:h-[330px]">
        <svg ref={svgRef} className="w-full h-full" />
      </div>
    </div>
  );
}

function PieChartInner({ x, y, aggregate, ...props }) {
  const { datasets: dataArray } = useContext(DataRequestContext);
  const relationships = props?.relationships ?? EMPTY_RELATIONSHIPS;
  const normalizedData = useMemo(() => {
    try {
      const xConfig = x && typeof x === "object" ? x : { table: props?.x_table, col: x };
      const hasYValue = y && (typeof y === "object" ? y.col : y);
      const yConfig = hasYValue
        ? typeof y === "object" ? y : { table: props?.y_table, col: y }
        : null;
      return assembleChartRows({ dataArray: dataArray || {}, x: xConfig, y: yConfig, group_by: null, relationships });
    } catch (error) {
      console.error(error);
      return null;
    }
  }, [dataArray, x, y, props?.x_table, props?.y_table, relationships]);
  const hasY = Boolean(normalizedData?.some((row) => row.__y !== undefined));
  const chartData = useMemo(() => normalizedData ? aggregatePieValues({ data: normalizedData, aggregate, hasY }) : [], [normalizedData, aggregate, hasY]);

  if (dataArray === undefined || dataArray === null) return <div className="w-full h-[400px] flex items-center justify-center"><p className="italic text-slate-500">Loading chart...</p></div>;
  if (normalizedData === null) return <div className="w-full h-[400px] flex items-center justify-center"><p className="italic text-slate-500">Unable to load chart</p></div>;
  if (!chartData.length) return <div className="w-full h-[400px] flex items-center justify-center"><p className="italic text-slate-500">No data available</p></div>;
  return (
    <D3PieChart
      data={chartData}
      xLabel={typeof x === "object" ? x?.col : x}
      yLabel={(typeof y === "object" ? y?.col : y) || aggregate}
    />
  );
}
