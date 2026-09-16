import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { formatCompactNumber } from "./chartDataUtils";

export default function DistributionChartD3({ groupedData, kind = "box", xLabel, yLabel }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!groupedData?.length || !svgRef.current || !containerRef.current) return;

    const render = () => {
      if(containerRef.current === null) return;
      const { width, height } = containerRef.current.getBoundingClientRect();
      if (!width || !height) return;
      const svg = d3.select(svgRef.current);
      svg.selectAll("*").remove().attr("viewBox", `0 0 ${width} ${height}`);
      svg.attr("width", "100%").attr("height", "100%");

      const margin = { top: 30, right: 20, bottom: 72, left: 68 };
      const chartWidth = width - margin.left - margin.right;
      const chartHeight = height - margin.top - margin.bottom;
      const chart = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
      const labels = groupedData.map((item) => item.key);
      const allValues = groupedData.flatMap((item) => item.values).filter(Number.isFinite);
      const extent = d3.extent(allValues);
      const y = d3.scaleLinear().domain([extent[0] ?? 0, extent[1] ?? 1]).nice().range([chartHeight, 0]);
      const x = d3.scaleBand().domain(labels).range([0, chartWidth]).padding(0.25);

      chart.append("g").call(d3.axisLeft(y).ticks(6).tickFormat(formatCompactNumber).tickSize(-chartWidth))
        .selectAll(".tick line").attr("stroke", "#e5e7eb").attr("stroke-opacity", 0.7);
      chart.selectAll(".domain").remove();
      chart.append("g").attr("transform", `translate(0,${chartHeight})`).call(d3.axisBottom(x))
        .selectAll("text").attr("transform", labels.length > 5 ? "rotate(-45)" : null).attr("text-anchor", labels.length > 5 ? "end" : "middle");

      groupedData.forEach((item) => {
        const values = item.values.slice().sort(d3.ascending);
        if (!values.length) return;
        const q1 = d3.quantile(values, 0.25);
        const median = d3.quantile(values, 0.5);
        const q3 = d3.quantile(values, 0.75);
        const min = values[0];
        const max = values[values.length - 1];
        const center = x(item.key) + x.bandwidth() / 2;
        const boxWidth = x.bandwidth() * 0.55;
        const fill = kind === "violin" ? "#6366f1" : "#4f46e5";

        if (kind === "violin") {
          const histogram = d3.bin().domain(y.domain()).thresholds(18)(values);
          const maxBin = d3.max(histogram, (bin) => bin.length) || 1;
          const violinWidth = d3.scaleLinear().domain([0, maxBin]).range([0, boxWidth]);
          const area = d3.area().curve(d3.curveCatmullRom).x0((bin) => center - violinWidth(bin.length)).x1((bin) => center + violinWidth(bin.length)).y((bin) => y((bin.x0 + bin.x1) / 2));
          chart.append("path").datum(histogram).attr("d", area).attr("fill", fill).attr("fill-opacity", 0.45).attr("stroke", fill);
          chart.append("line").attr("x1", center).attr("x2", center).attr("y1", y(min)).attr("y2", y(max)).attr("stroke", "#334155");
          chart.append("line").attr("x1", center - 6).attr("x2", center + 6).attr("y1", y(median)).attr("y2", y(median)).attr("stroke", "#0f172a").attr("stroke-width", 2);
        } else {
          chart.append("line").attr("x1", center).attr("x2", center).attr("y1", y(min)).attr("y2", y(max)).attr("stroke", "#334155");
          chart.append("rect").attr("x", center - boxWidth / 2).attr("y", y(q3)).attr("width", boxWidth).attr("height", Math.max(y(q1) - y(q3), 1)).attr("fill", fill).attr("fill-opacity", 0.45).attr("stroke", fill);
          chart.append("line").attr("x1", center - boxWidth / 2).attr("x2", center + boxWidth / 2).attr("y1", y(median)).attr("y2", y(median)).attr("stroke", "#0f172a").attr("stroke-width", 2);
          chart.append("line").attr("x1", center - boxWidth / 3).attr("x2", center + boxWidth / 3).attr("y1", y(min)).attr("y2", y(min)).attr("stroke", "#334155");
          chart.append("line").attr("x1", center - boxWidth / 3).attr("x2", center + boxWidth / 3).attr("y1", y(max)).attr("y2", y(max)).attr("stroke", "#334155");
        }
      });

      if (xLabel) chart.append("text").attr("x", chartWidth / 2).attr("y", chartHeight + 58).attr("text-anchor", "middle").attr("fill", "#334155").text(xLabel);
      if (yLabel) chart.append("text").attr("transform", "rotate(-90)").attr("x", -chartHeight / 2).attr("y", -50).attr("text-anchor", "middle").attr("fill", "#334155").text(yLabel);
    };

    render();
    const observer = new ResizeObserver(render);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [groupedData, kind, xLabel, yLabel]);

  return <div ref={containerRef} className="w-full h-[400px] tablet:w-[500px] tablet:h-[350px]"><svg ref={svgRef} className="w-full h-full" /></div>;
}
