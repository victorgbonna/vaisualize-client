"use client";

import { useRef, useEffect } from "react";
import * as d3 from "d3";

export default function SampleChart(props) {
  return (
    <>
    {props.type==="bar"? <BarChart {...props} /> : <PieChart {...props}/>} 
    </>
  );
}

function BarChart({
  data = [40, 25, 60, 20, 45, 70],
  bgColor:backgroundColor = "#f5f5f5",
  textColor = "#333",
  chartColors = ["#4FC3F7"],
  font:fontFamily
}) {
  const svgRef = useRef();
  useEffect(() => {
    const width = 450;
    const height = 260;
    const margin = { top: 40, right: 30, bottom: 40, left: 30 };

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg
      .attr("width", width)
      .attr("height", height)
      // .style("background", backgroundColor)
      // .style("border-radius", "16px")
      // .style("border", "1px solid #ddd")
      // .style("box-shadow", "0 4px 6px rgba(0, 0, 0, 0.1)");

    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3
      .scaleBand()
      .domain(data.map((_, i) => i))
      .range([0, chartWidth])
      .padding(0.4);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(data)])
      .nice()
      .range([chartHeight, 0]);

    // Bars
    chart
      .selectAll("rect")
      .data(data)
      .join("rect")
      .attr("x", (_, i) => x(i))
      .attr("y", d => y(d))
      .attr("width", x.bandwidth())
      .attr("height", d => chartHeight - y(d))
      .attr("rx", 8) // rounded corners
      .attr("fill", (_, i) =>
        chartColors[0]
      );

    // Optional subtle value labels
    // chart
    //   .selectAll("text")
    //   .data(data)
    //   .join("text")
    //   .attr("x", (_, i) => x(i) + x.bandwidth() / 2)
    //   .attr("y", d => y(d) - 8)
    //   .attr("text-anchor", "middle")
    //   .style("fill", textColor)
    //   .style("font-family", fontFamily)
    //   .style("font-size", "12px")
    //   .text(d => d);

  }, [data, backgroundColor, textColor, chartColors, fontFamily]);

  return (
    <div className="border rounded-lg relative" style={{background:backgroundColor, fontFamily}}>
      <div className="flex justify-between items-center px-4 py-2">
        <div className="flex flex-col gap-1">
          <div className="h-6 w-48 bg-slate-100 rounded"></div>
          <div className="h-3 w-32 bg-slate-50 rounded"></div>
        </div>
        <div className="flex gap-2">
          <div className="size-6 rounded bg-slate-100"></div>
          <div className="size-6 rounded bg-slate-100"></div>
        </div>
      </div>
      <svg ref={svgRef} />
      <div className="absolute inset-0 flex items-center justify-center text-sm" style={{color:textColor}}>
       <div className="bg-white/90 flex gap-x-2 items-center px-6 py-2 rounded-full border border-primary/20 shadow-xl flex items-center gap-3 backdrop-blur-md">
          <div className="flex items-center gap-x-[2px]">
            {chartColors.map((color, ind)=>
              <div key={ind} className="size-3 rounded-full" style={{background:color}}></div>
            )}
          </div>
          <p style={{fontFamily:fontFamily.value}}>Sample Chart</p>     
       </div>
      </div>
    </div>
  );
}

function PieChart({
  data = [40, 25, 60, 20, 45, 70],
  bgColor:backgroundColor = "#f5f5f5",
  textColor = "#333",
  chartColors = ["#4FC3F7"],
  font:fontFamily
}) {
 const svgRef = useRef();

  useEffect(() => {
    const width = 450;
    const height = 260;
    const radius = Math.min(width, height) / 2 - 20;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    svg
      .attr("width", width)
      .attr("height", height);

    const chart = svg
      .append("g")
      .attr("transform", `translate(${width / 2}, ${height / 2})`);

    // Create pie layout
    const pie = d3
      .pie()
      .sort(null)
      .value(d => d);

    const arc = d3
      .arc()
      .innerRadius(0) // change to radius * 0.6 for donut
      .outerRadius(radius)
      .cornerRadius(6);

    const arcs = chart
      .selectAll("path")
      .data(pie(data))
      .join("path")
      .attr("d", arc)
      .attr("fill", (_, i) => chartColors[i % chartColors.length])
      // .style("transition ", "all 0.3s ease");
      .attr("stroke", backgroundColor)   // 👈 separation color
      .attr("stroke-width", 3); 

  }, [data, backgroundColor, textColor, chartColors, fontFamily]);

  return (
    <div
      className="border rounded-lg relative"
      style={{ background: backgroundColor }}
    >
      <div className="flex justify-between items-center px-4 py-2">
        <div className="flex flex-col gap-1">
          <div className="h-6 w-48 bg-slate-100 rounded"></div>
          <div className="h-3 w-32 bg-slate-50 rounded"></div>
        </div>
        <div className="flex gap-2">
          <div className="size-6 rounded bg-slate-100"></div>
          <div className="size-6 rounded bg-slate-100"></div>
        </div>
      </div>

      <svg ref={svgRef} />

      <div
        className="absolute inset-0 flex items-center justify-center text-sm"
        style={{ color: textColor, fontFamily }}
      >
        <div className="bg-white/90 flex gap-x-2 items-center px-6 py-2 rounded-full border border-primary/20 shadow-xl backdrop-blur-md">
          <div className="flex items-center gap-x-[2px]">
            {chartColors.map((color, ind) => (
              <div
                key={ind}
                className="size-3 rounded-full"
                style={{ background: color }}
              ></div>
            ))}
          </div>
          <p style={{fontFamily:fontFamily.value}}>Sample Chart</p>     

        </div>
      </div>
    </div>
  );
}