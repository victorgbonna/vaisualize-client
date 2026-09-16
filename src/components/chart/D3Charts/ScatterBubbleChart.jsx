import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { formatCompactNumber } from "./chartDataUtils";

export default function ScatterBubbleChart({
  data,
  groups = [],
  bubble = false,
  xLabel = "",
  yLabel = "",
  zLabel = "",
}) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!data?.length || !svgRef.current || !containerRef.current) return;

    const render = () => {
      const container = containerRef.current;
      const svg = d3.select(svgRef.current);
      const { width, height } = container.getBoundingClientRect();

      if (!width || !height) return;

      svg.selectAll("*").remove();
      svg
        .attr("viewBox", `0 0 ${width} ${height}`)
        .attr("width", "100%")
        .attr("height", "100%");

      const margin = { top: groups.length ? 55 : 30, right: 28, bottom: 82, left: 68 };
      const chartWidth = Math.max(width - margin.left - margin.right, 0);
      const chartHeight = Math.max(height - margin.top - margin.bottom, 0);
      const chart = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

      const xExtent = d3.extent(data, (item) => Number(item.__x));
      const yExtent = d3.extent(data, (item) => Number(item.__y));
      const zExtent = d3.extent(data, (item) => Number(item.__z));
      const normalizeExtent = ([min, max]) => (min === max ? [min - 1, max + 1] : [min, max]);
      const x = d3.scaleLinear().domain(normalizeExtent(xExtent)).nice().range([0, chartWidth]);
      const y = d3.scaleLinear().domain(normalizeExtent(yExtent)).nice().range([chartHeight, 0]);
      const radius = bubble
        ? d3.scaleSqrt().domain(normalizeExtent(zExtent)).range([4, 24])
        : () => 5;
      const color = d3.scaleOrdinal().domain(groups).range(d3.schemeTableau10);

      chart
        .append("g")
        .call(d3.axisLeft(y).ticks(6).tickSize(-chartWidth).tickFormat(formatCompactNumber))
        .selectAll(".tick line")
        .attr("stroke", "#e5e7eb")
        .attr("stroke-opacity", 0.7);
      chart.selectAll(".domain").remove();

      chart
        .append("g")
        .attr("transform", `translate(0,${chartHeight})`)
        .call(d3.axisBottom(x).ticks(6).tickFormat(formatCompactNumber))
        .selectAll("text")
        .attr("fill", "#64748b")
        .attr("font-size", "11px");

      if (xLabel) {
        chart.append("text")
          .attr("x", chartWidth / 2)
          .attr("y", chartHeight + 58)
          .attr("text-anchor", "middle")
          .attr("fill", "#334155")
          .attr("font-size", "12px")
          .attr("font-weight", 600)
          .text(xLabel);
      }

      if (yLabel) {
        chart.append("text")
          .attr("transform", "rotate(-90)")
          .attr("x", -chartHeight / 2)
          .attr("y", -50)
          .attr("text-anchor", "middle")
          .attr("fill", "#334155")
          .attr("font-size", "12px")
          .attr("font-weight", 600)
          .text(yLabel);
      }

      if (groups.length) {
        const legend = chart.append("g").attr("transform", "translate(0,-35)");
        groups.forEach((groupKey, index) => {
          const item = legend.append("g").attr("transform", `translate(${index * 110},0)`);
          item.append("circle").attr("cx", 5).attr("cy", 0).attr("r", 5).attr("fill", color(groupKey));
          item.append("text").attr("x", 15).attr("y", 4).attr("font-size", "11px").attr("fill", "#475569").text(groupKey);
        });
      }

      const tooltip = chart.append("g").style("pointer-events", "none").style("opacity", 0);
      const tooltipRect = tooltip.append("rect").attr("fill", "#0f172a").attr("rx", 4).attr("height", 22).attr("y", -28);
      const tooltipText = tooltip.append("text").attr("fill", "white").attr("font-size", "11px").attr("x", 8).attr("y", -13);

      chart
        .selectAll("circle.data-point")
        .data(data)
        .enter()
        .append("circle")
        .attr("class", "data-point")
        .attr("cx", (item) => x(Number(item.__x)))
        .attr("cy", (item) => y(Number(item.__y)))
        .attr("r", (item) => radius(Number(item.__z)))
        .attr("fill", (item) => (groups.length ? color(item.__group_by) : "#4f46e5"))
        .attr("fill-opacity", bubble ? 0.68 : 0.82)
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 1.5)
        .style("cursor", "pointer")
        .on("mouseenter", function (event, item) {
          const label = bubble
            ? `${xLabel || "x"}: ${formatCompactNumber(item.__x)}, ${yLabel || "y"}: ${formatCompactNumber(item.__y)}, ${zLabel || "z"}: ${formatCompactNumber(item.__z)}`
            : `${xLabel || "x"}: ${formatCompactNumber(item.__x)}, ${yLabel || "y"}: ${formatCompactNumber(item.__y)}`;
          tooltipText.text(label);
          tooltipRect.attr("width", tooltipText.node().getComputedTextLength() + 16);
          tooltip
            .attr(
              "transform",
              `translate(${Math.min(Math.max(x(Number(item.__x)), 8), chartWidth - 8)},${Math.max(y(Number(item.__y)), 32)})`
            )
            .style("opacity", 1);
          d3.select(this).attr("stroke", "#0f172a");
        })
        .on("mouseleave", function () {
          tooltip.style("opacity", 0);
          d3.select(this).attr("stroke", "#ffffff");
        });
    };

    render();
    const observer = new ResizeObserver(render);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [data, groups, bubble, xLabel, yLabel, zLabel]);

  return (
    <div ref={containerRef} className="w-full h-[400px] tablet:w-[500px] tablet:h-[350px]">
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
}
