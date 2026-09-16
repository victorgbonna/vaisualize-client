import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { formatCompactNumber } from "./chartDataUtils";

export default function CartesianChart({
  data,
  groups = [],
  kind = "bar",
  unit,
  xLabel = "",
  yLabel = "",
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
      svg.attr("viewBox", `0 0 ${width} ${height}`).attr("width", "100%").attr("height", "100%");

      const margin = { top: groups.length ? 55 : 30, right: 20, bottom: 82, left: 68 };
      const chartWidth = Math.max(width - margin.left - margin.right, 0);
      const chartHeight = Math.max(height - margin.top - margin.bottom, 0);
      const chart = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
      const xValues = [...new Set(data.map((item) => item.key))];
      const maxValue = kind === "stacked"
        ? d3.max(xValues, (key) => groups.reduce((total, groupKey) => {
            const item = data.find((entry) => entry.key === key && entry.groupKey === groupKey);
            return total + Number(item?.value || 0);
          }, 0)) || 1
        : d3.max(data, (item) => Number(item.value)) || 1;
      const x = d3.scaleBand().domain(xValues).range([0, chartWidth]).padding(kind === "line" ? 0.2 : 0.18);
      const y = d3.scaleLinear().domain([0, maxValue]).nice().range([chartHeight, 0]);
      const color = d3.scaleOrdinal().domain(groups).range(d3.schemeTableau10);

      chart.append("g").call(d3.axisLeft(y).ticks(6).tickSize(-chartWidth).tickFormat(formatCompactNumber))
        .selectAll(".tick line").attr("stroke", "#e5e7eb").attr("stroke-opacity", 0.7);
      chart.selectAll(".y-axis .domain").remove();
      chart.append("g").attr("transform", `translate(0,${chartHeight})`).call(d3.axisBottom(x))
        .selectAll("text").attr("fill", "#64748b").attr("font-size", "11px");
      chart.selectAll(".domain").remove();

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

      const tooltip = chart.append("g").style("pointer-events", "none").style("opacity", 0);
      const tooltipRect = tooltip.append("rect").attr("fill", "#0f172a").attr("rx", 4).attr("height", 22).attr("y", -28);
      const tooltipText = tooltip.append("text").attr("fill", "white").attr("font-size", "11px").attr("x", 8).attr("y", -13);
      const showTooltip = (event, item, pointX, pointY, groupKey = "") => {
        const label = `${item.key}: ${formatCompactNumber(item.value)}${groupKey ? ` (${groupKey})` : ""}`;
        tooltipText.text(label);
        tooltipRect.attr("width", tooltipText.node().getComputedTextLength() + 16);
        tooltip.attr("transform", `translate(${Math.min(Math.max(pointX, 8), chartWidth - 8)},${Math.max(pointY, 32)})`).style("opacity", 1);
      };

      const drawPoint = (item, groupKey, pointX, pointY, fill) => {
        chart.append("circle").attr("cx", pointX).attr("cy", pointY).attr("r", kind === "line" ? 4 : 3)
          .attr("fill", fill).attr("stroke", "white").attr("stroke-width", 1.5)
          .style("cursor", "pointer")
          .on("mouseenter", (event) => showTooltip(event, item, pointX, pointY, groupKey))
          .on("mouseleave", () => tooltip.style("opacity", 0));
      };

      if (groups.length) {
        groups.forEach((groupKey, groupIndex) => {
          const series = data.filter((item) => item.groupKey === groupKey);
          const fill = color(groupKey);
          const points = series.map((item) => ({ item, x: x(item.key) + x.bandwidth() / 2, y: y(Number(item.value)) }));

          if (kind === "line") {
            chart.append("path").datum(points).attr("fill", "none").attr("stroke", fill).attr("stroke-width", 2)
              .attr("d", d3.line().x((point) => point.x).y((point) => point.y));
          } else if (kind === "stacked") {
            points.forEach((point) => {
              const previousGroups = groups.slice(0, groupIndex);
              const stackValue = previousGroups.reduce((total, previousGroup) => {
                const previousPoint = data.find((item) => item.groupKey === previousGroup && item.key === point.item.key);
                return total + Number(previousPoint?.value || 0);
              }, 0);
              const value = Number(point.item.value || 0);
              const top = y(stackValue + value);
              const bottom = y(stackValue);

              chart.append("rect").attr("x", x(point.item.key)).attr("y", top)
                .attr("width", x.bandwidth()).attr("height", Math.max(bottom - top, 0)).attr("fill", fill);
            });
          } else {
            points.forEach((point) => {
              chart.append("rect").attr("x", point.x - x.bandwidth() / 2 + (x.bandwidth() * groupIndex) / groups.length)
                .attr("y", point.y).attr("width", x.bandwidth() / groups.length).attr("height", chartHeight - point.y).attr("fill", fill);
            });
          }
          points.forEach((point) => drawPoint(point.item, groupKey, point.x, point.y, fill));
        });
      } else {
        const fill = kind === "line" ? "#4bc0c0" : "#4f46e5";
        const points = data.map((item) => ({ item, x: x(item.key) + x.bandwidth() / 2, y: y(Number(item.value)) }));
        if (kind === "line") {
          chart.append("path").datum(points).attr("fill", "none").attr("stroke", fill).attr("stroke-width", 2)
            .attr("d", d3.line().x((point) => point.x).y((point) => point.y));
        } else {
          points.forEach((point) => chart.append("rect").attr("x", x(point.item.key)).attr("y", point.y).attr("width", x.bandwidth()).attr("height", chartHeight - point.y).attr("fill", fill));
        }
        points.forEach((point) => drawPoint(point.item, "", point.x, point.y, fill));
      }
    };

    render();
    const observer = new ResizeObserver(render);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [data, groups, kind, unit, xLabel, yLabel]);

  return <div ref={containerRef} className="w-full h-[400px] tablet:w-[500px] tablet:h-[350px]"><svg ref={svgRef} className="w-full h-full" /></div>;
}
