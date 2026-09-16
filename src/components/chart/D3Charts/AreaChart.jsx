import React, {
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as d3 from "d3";

import {
  pagination,
  timeStampControl,
} from "@/configs";

import { DataRequestContext } from "@/context";
import { formatCompactNumber } from "./chartDataUtils";

const EMPTY_RELATIONSHIPS = [];

function getTableRows(dataArray, table) {
  if (Array.isArray(dataArray)) {
    return dataArray;
  }

  if (!dataArray || !table) {
    return [];
  }

  if (Array.isArray(dataArray[table])) {
    return dataArray[table];
  }

  const matchingTable = Object.keys(dataArray).find(
    (key) => key.toLowerCase() === String(table).toLowerCase()
  );

  return matchingTable && Array.isArray(dataArray[matchingTable])
    ? dataArray[matchingTable]
    : [];
}


// ============================================================
// AREA CHART CONTROLLER
// ============================================================

export default function AreaChart(props) {
  const { datasets: dataArray } = useContext(DataRequestContext);

  const groupBy = props?.group_by;

  const hasGroupBy =
    Boolean(
      groupBy &&
        typeof groupBy === "object" &&
        groupBy.table &&
        groupBy.col
    ) ||
    Boolean(
      typeof groupBy === "string" &&
        groupBy
    );

  const max_limit_of_group_by = useMemo(() => {
    if (!hasGroupBy || !dataArray) {
      return [];
    }

    const groupTable =
      typeof groupBy === "object"
        ? groupBy.table
        : props?.x?.table;

    const groupColumn =
      typeof groupBy === "object"
        ? groupBy.col
        : groupBy;

    const tableData = getTableRows(dataArray, groupTable);

    if (!Array.isArray(tableData)) {
      return [];
    }

    return [
      ...new Set(
        tableData.map((row) => row?.[groupColumn])
      ),
    ];
  }, [dataArray, groupBy, hasGroupBy, props?.x]);

  return (
    <>
      {hasGroupBy &&
      max_limit_of_group_by.length &&
      max_limit_of_group_by.length <= 21 ? (
        <AreaChartWithGroupBy {...props} dataArray={dataArray} />
      ) : (
        <AreaChartWithoutGroupBy {...props} dataArray={dataArray} />
      )}
    </>
  );
}

// ============================================================
// RELATIONSHIP HELPERS
// ============================================================

function getRelationshipParts(relationship) {
  if (!relationship) {
    return null;
  }

  const fromTable = relationship.from_table;
  const toTable = relationship.to_table;
  const fromColumn = relationship.from_column;
  const toColumn = relationship.to_column;

  if (!fromTable || !toTable || !fromColumn || !toColumn) {
    return null;
  }

  return { fromTable, fromColumn, toTable, toColumn };
}

function findRelationship({ currentTable, targetTable, relationships = [] }) {
  if (!currentTable || !targetTable || currentTable === targetTable) {
    return null;
  }

  for (let index = 0; index < relationships.length; index++) {
    const relation = getRelationshipParts(relationships[index]);

    if (!relation) {
      continue;
    }

    const matchesForward =
      relation.fromTable === currentTable && relation.toTable === targetTable;

    const matchesReverse =
      relation.toTable === currentTable && relation.fromTable === targetTable;

    if (matchesForward || matchesReverse) {
      return relation;
    }
  }

  return null;
}

function resolveRelatedColumnValue({
  row,
  currentTable,
  targetTable,
  targetColumn,
  dataArray,
  relationships = [],
}) {
  if (!row) {
    return undefined;
  }

  if (currentTable === targetTable) {
    return row?.[targetColumn];
  }

  const relationship = findRelationship({
    currentTable,
    targetTable,
    relationships,
  });

  if (!relationship) {
    return undefined;
  }

  let lookupColumn;
  let targetLookupColumn;

  if (
    relationship.fromTable === currentTable &&
    relationship.toTable === targetTable
  ) {
    lookupColumn = relationship.fromColumn;
    targetLookupColumn = relationship.toColumn;
  } else if (
    relationship.toTable === currentTable &&
    relationship.fromTable === targetTable
  ) {
    lookupColumn = relationship.toColumn;
    targetLookupColumn = relationship.fromColumn;
  }

  if (!lookupColumn || !targetLookupColumn) {
    return undefined;
  }

  const lookupValue = row?.[lookupColumn];

  if (lookupValue === undefined || lookupValue === null) {
    return undefined;
  }

  const targetData = getTableRows(dataArray, targetTable);

  if (!Array.isArray(targetData)) {
    return undefined;
  }

  const relatedRow = targetData.find(
    (item) => String(item?.[targetLookupColumn]) === String(lookupValue)
  );

  return relatedRow?.[targetColumn];
}


// ============================================================
// NORMALIZE CHART ROWS
// ============================================================

function assembleChartRows({
  dataArray,
  x,
  y,
  group_by,
  relationships = [],
}) {
  if (!x?.table || !x?.col) {
    return [];
  }

  const hasY = Boolean(y?.table && y?.col);

  const xTable = x.table;
  const groupTable = group_by?.table;
  const groupColumn = group_by?.col;

  const baseTable = xTable;
  const baseData = getTableRows(dataArray, baseTable);

  if (!Array.isArray(baseData)) {
    return [];
  }

  const result = [];

  for (let index = 0; index < baseData.length; index++) {
    const row = baseData[index];

    const xValue = resolveRelatedColumnValue({
      row,
      currentTable: baseTable,
      targetTable: xTable,
      targetColumn: x.col,
      dataArray,
      relationships,
    });

    const yValue = hasY
      ? resolveRelatedColumnValue({
          row,
          currentTable: baseTable,
          targetTable: y.table,
          targetColumn: y.col,
          dataArray,
          relationships,
        })
      : undefined;

    let groupValue;
    if (groupTable && groupColumn) {
      groupValue = resolveRelatedColumnValue({
        row,
        currentTable: baseTable,
        targetTable: groupTable,
        targetColumn: groupColumn,
        dataArray,
        relationships,
      });
    }

    result.push({
      ...row,
      __x: xValue,
      ...(hasY ? { __y: yValue } : {}),
      ...(groupTable && groupColumn ? { __group_by: groupValue } : {}),
    });
  }

  return result;
}


// ============================================================
// SHARED D3 AREA CHART RENDERER
// ============================================================

function renderAreaChart({
  svg,
  container,
  data,
  groups = [],
  xAccessor,
  yAccessor,
  groupAccessor,
  unit,
  xLabel = "",
  yLabel = "",
}) {
  if (!svg || !container || !data?.length) {
    return;
  }

  const svgSelection = d3.select(svg);

  svgSelection.selectAll("*").remove();

  const containerRect = container.getBoundingClientRect();
  const width = containerRect.width;
  const height = containerRect.height;

  if (!width || !height) {
    return;
  }

  const margin = {
    top: groups.length ? 55 : 30,
    right: 20,
    bottom: 82,
    left: 68,
  };

  const chartWidth = Math.max(width - margin.left - margin.right, 0);
  const chartHeight = Math.max(height - margin.top - margin.bottom, 0);

  if (!chartWidth || !chartHeight) {
    return;
  }

  const chart = svgSelection
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("preserveAspectRatio", "none")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // ==========================================================
  // X VALUES
  // ==========================================================

  const xValues = [...new Set(data.map((d) => xAccessor(d)))];

  // ==========================================================
  // Y VALUES
  // ==========================================================

  const numericValues = data
    .map((d) => Number(yAccessor(d)))
    .filter((value) => Number.isFinite(value));

  const maxY = d3.max(numericValues) ?? 0;

  // ==========================================================
  // X SCALE
  // ==========================================================

  let xScale;
  let xType = "category";

  if (!unit) {
    const numericXValues = xValues
      .map((value) => Number(value))
      .filter((value) => Number.isFinite(value));

    const allNumeric =
      numericXValues.length === xValues.length && xValues.length > 0;

    if (allNumeric) {
      xType = "numeric";

      let domain = d3.extent(numericXValues);

      if (domain[0] === domain[1]) {
        domain = [domain[0] - 1, domain[1] + 1];
      }

      xScale = d3.scaleLinear().domain(domain).range([0, chartWidth]);
    } else {
      const dateValues = xValues.map((value) => new Date(value));

      const allDates =
        dateValues.length === xValues.length &&
        dateValues.every((date) => !Number.isNaN(date.getTime()));

      if (allDates) {
        xType = "date";

        let domain = d3.extent(dateValues);

        if (domain[0]?.getTime() === domain[1]?.getTime()) {
          domain = [
            new Date(domain[0].getTime() - 86400000),
            new Date(domain[1].getTime() + 86400000),
          ];
        }

        xScale = d3.scaleTime().domain(domain).range([0, chartWidth]);
      }
    }
  }

  if (!xScale) {
    xScale = d3.scalePoint().domain(xValues).range([0, chartWidth]).padding(0.5);
  }

  // ==========================================================
  // Y SCALE
  // ==========================================================

  const yScale = d3
    .scaleLinear()
    .domain([0, maxY > 0 ? maxY : 1])
    .nice()
    .range([chartHeight, 0]);

  // ==========================================================
  // X / Y POSITION HELPERS
  // ==========================================================

  const getX = (value) => {
    if (xType === "numeric") return xScale(Number(value));
    if (xType === "date") return xScale(new Date(value));
    return xScale(value);
  };

  const getY = (value) => {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) return null;
    return yScale(numericValue);
  };

  // ==========================================================
  // Y AXIS
  // ==========================================================

  const compactNumber = (value) => {
    const abs = Math.abs(value);
    if (abs >= 1_000_000_000) return d3.format(".3~s")(value);
    if (abs >= 1_000_000) return d3.format(".3~s")(value);
    if (abs >= 1_000) return d3.format(".3~s")(value);
    return formatCompactNumber(value);
  };

  const yAxis = d3
    .axisLeft(yScale)
    .ticks(6)
    .tickFormat(compactNumber)
    .tickSize(-chartWidth);

  const yAxisGroup = chart.append("g").attr("class", "y-axis").call(yAxis);

  yAxisGroup.select(".domain").remove();
  yAxisGroup
    .selectAll(".tick line")
    .attr("stroke", "#e5e7eb")
    .attr("stroke-opacity", 0.7);
  yAxisGroup
    .selectAll(".tick text")
    .attr("fill", "#64748b")
    .attr("font-size", "11px");

  // ==========================================================
  // X AXIS
  // ==========================================================

  let xAxis;

  if (xType === "numeric") {
    xAxis = d3
      .axisBottom(xScale)
      .ticks(Math.min(10, xValues.length))
      .tickFormat(formatCompactNumber);
  } else if (xType === "date") {
    xAxis = d3.axisBottom(xScale).ticks(Math.min(10, xValues.length));
  } else {
    xAxis = d3
      .axisBottom(xScale)
      .tickValues(
        xValues.length > 10
          ? xValues.filter(
              (_, index) => index % Math.ceil(xValues.length / 10) === 0
            )
          : xValues
      );
  }

  const xAxisGroup = chart
    .append("g")
    .attr("transform", `translate(0,${chartHeight})`)
    .attr("class", "x-axis")
    .call(xAxis);

  xAxisGroup.select(".domain").remove();
  xAxisGroup.selectAll(".tick line").remove();
  xAxisGroup
    .selectAll(".tick text")
    .attr("fill", "#64748b")
    .attr("font-size", "11px");

  if (xLabel) {
    chart
      .append("text")
      .attr("x", chartWidth / 2)
      .attr("y", chartHeight + 58)
      .attr("text-anchor", "middle")
      .attr("fill", "#334155")
      .attr("font-size", "12px")
      .attr("font-weight", 600)
      .text(xLabel);
  }

  if (yLabel) {
    chart
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -chartHeight / 2)
      .attr("y", -50)
      .attr("text-anchor", "middle")
      .attr("fill", "#334155")
      .attr("font-size", "12px")
      .attr("font-weight", 600)
      .text(yLabel);
  }

  // ==========================================================
  // X LABEL ROTATION
  // ==========================================================

  const visibleTickCount = xAxisGroup.selectAll(".tick").size();

  const shouldRotateLabels =
    xType === "category" &&
    visibleTickCount > 0 &&
    chartWidth / visibleTickCount < 70;

  if (shouldRotateLabels) {
    xAxisGroup
      .selectAll(".tick text")
      .attr("transform", "rotate(-45)")
      .attr("text-anchor", "end")
      .attr("dx", "-0.6em")
      .attr("dy", "0.15em");
  }

  // ==========================================================
  // COLORS
  // ==========================================================

  const color = d3.scaleOrdinal().domain(groups).range(d3.schemeTableau10);

  // ==========================================================
  // SERIES
  // ==========================================================

  let series;

  if (groups.length) {
    series = groups.map((groupKey) => {
      const groupData = data.filter((item) => groupAccessor(item) === groupKey);
      return { groupKey, data: groupData };
    });
  } else {
    series = [{ groupKey: null, data }];
  }

  // ==========================================================
  // AREA GENERATOR
  // ==========================================================

  const createArea = () =>
    d3
      .area()
      .defined((d) => {
        const value = yAccessor(d);
        return (
          value !== null &&
          value !== undefined &&
          Number.isFinite(Number(value))
        );
      })
      .x((d) => getX(xAccessor(d)))
      .y0(chartHeight)
      .y1((d) => getY(yAccessor(d)))
      .curve(d3.curveMonotoneX);

  // ==========================================================
  // LEGEND
  // ==========================================================

  if (groups.length) {
    const legend = chart
      .append("g")
      .attr("class", "legend")
      .attr("transform", "translate(0,-35)");

    groups.forEach((groupKey, index) => {
      const legendItem = legend
        .append("g")
        .attr("transform", `translate(${index * 110},0)`);

      legendItem
        .append("circle")
        .attr("cx", 5)
        .attr("cy", 0)
        .attr("r", 5)
        .attr("fill", color(groupKey));

      legendItem
        .append("text")
        .attr("x", 15)
        .attr("y", 4)
        .attr("font-size", "11px")
        .attr("fill", "#475569")
        .text(groupKey);
    });
  }

  // ==========================================================
  // DRAW AREAS + POINTS + TOOLTIP
  // ==========================================================

  const areaLayer = chart.append("g").attr("class", "areas");

  const tooltipLayer = chart
    .append("g")
    .attr("class", "data-point-tooltip")
    .style("pointer-events", "none")
    .style("opacity", 0);

  const tooltipBackground = tooltipLayer
    .append("rect")
    .attr("fill", "#0f172a")
    .attr("rx", 4)
    .attr("ry", 4)
    .attr("fill-opacity", 0.95)
    .attr("x", -8)
    .attr("y", -24)
    .attr("height", 22);

  const tooltipText = tooltipLayer
    .append("text")
    .attr("fill", "#ffffff")
    .attr("font-size", "11px")
    .attr("x", 0)
    .attr("y", -9);

  series.forEach(({ groupKey, data: seriesData }) => {
    const seriesColor = groups.length ? color(groupKey) : "#4bc0c0";

    const areaPath = areaLayer
      .append("path")
      .datum(seriesData)
      .attr("class", "area-path")
      .attr("d", createArea())
      .attr("fill", seriesColor)
      .attr("fill-opacity", 0.25)
      .attr("stroke", seriesColor)
      .attr("stroke-width", 2)
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round");

    if (groups.length) {
      areaPath
        .style("cursor", "pointer")
        .on("mouseenter", function () {
          areaLayer
            .selectAll(".area-path")
            .attr("fill-opacity", 0.08)
            .attr("stroke-opacity", 0.35);

          d3.select(this)
            .attr("fill-opacity", 0.4)
            .attr("stroke-opacity", 1)
            .attr("stroke-width", 3);
        })
        .on("mouseleave", function () {
          areaLayer
            .selectAll(".area-path")
            .attr("fill-opacity", 0.25)
            .attr("stroke-opacity", 1)
            .attr("stroke-width", 2);
        });
    }

    areaLayer
      .selectAll(`.data-point-${groups.indexOf(groupKey)}`)
      .data(seriesData.filter((point) => getY(yAccessor(point)) !== null))
      .enter()
      .append("circle")
      .attr("class", `data-point-${groups.indexOf(groupKey)}`)
      .attr("cx", (point) => getX(xAccessor(point)))
      .attr("cy", (point) => getY(yAccessor(point)))
      .attr("r", 4)
      .attr("fill", seriesColor)
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 1.5)
      .style("cursor", "pointer")
      .on("mouseenter", function (event, point) {
        const x = getX(xAccessor(point));
        const y = getY(yAccessor(point));
        const label = `${xAccessor(point)}: ${formatCompactNumber(yAccessor(point))}`;

        tooltipText.text(label);
        tooltipBackground.attr(
          "width",
          tooltipText.node().getComputedTextLength() + 16
        );
        tooltipLayer
          .attr(
            "transform",
            `translate(${Math.min(Math.max(x, 8), chartWidth - 8)},${Math.max(
              y,
              28
            )})`
          )
          .style("opacity", 1);

        d3.select(this).attr("r", 5);
      })
      .on("mouseleave", function () {
        tooltipLayer.style("opacity", 0);
        d3.select(this).attr("r", 4);
      });
  });
}


// ============================================================
// D3 CHART COMPONENT
// ============================================================

function D3AreaChart({
  data,
  groups = [],
  xAccessor,
  yAccessor,
  groupAccessor,
  unit,
  xLabel,
  yLabel,
}) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!data?.length || !svgRef.current || !containerRef.current) {
      return;
    }

    const render = () => {
      if (!svgRef.current || !containerRef.current) return;

      renderAreaChart({
        svg: svgRef.current,
        container: containerRef.current,
        data,
        groups,
        xAccessor,
        yAccessor,
        groupAccessor,
        unit,
        xLabel,
        yLabel,
      });
    };

    render();

    const observer = new ResizeObserver(() => render());
    observer.observe(containerRef.current);

    return () => {
      observer.disconnect();
      if (svgRef.current) {
        d3.select(svgRef.current).selectAll("*").remove();
      }
    };
  }, [data, groups, xAccessor, yAccessor, groupAccessor, unit, xLabel, yLabel]);

  return (
    <div
      ref={containerRef}
      className="w-full h-[400px] tablet:w-[500px] tablet:h-[350px]"
    >
      <svg ref={svgRef} className="w-full h-full" />
    </div>
  );
}


// ============================================================
// WITHOUT GROUP BY
// ============================================================

function AreaChartWithoutGroupBy({
  x,
  y,
  group_by,
  aggregate,
  unit,
  dataArray,
  ...props
}) {
  const [meta, setMeta] = useState({
    page: 1,
    pages: 1,
    limit: unit ? 20 : 5,
  });

  const [error, setError] = useState("");

  const relationships = props?.relationships ?? EMPTY_RELATIONSHIPS;

  const normalizedData = useMemo(() => {
    try {
      const xValue = x;
      const yValue = y;

      const xConfig =
        typeof xValue === "object"
          ? xValue
          : { table: props?.x_table, col: xValue };

      // FIX: only build a yConfig object when y is actually meaningfully provided
      const yConfig =
        yValue && (typeof yValue === "object" ? yValue.col : yValue)
          ? typeof yValue === "object"
            ? yValue
            : { table: props?.y_table, col: yValue }
          : null;

      return assembleChartRows({
        dataArray: dataArray || {},
        x: xConfig,
        y: yConfig,
        group_by: null,
        relationships,
      });
    } catch (err) {
      console.error(err);
      return null;
    }
  }, [dataArray, x, y, props?.x_table, props?.y_table, relationships]);

  useEffect(() => {
    if (normalizedData === null) {
      setError("Unable to load chart");
    } else {
      setError("");
    }
  }, [normalizedData]);

  const groupedData = useMemo(() => {
    if (!normalizedData) return [];
    try {
      return aggregateValuesSingle({
        data: normalizedData,
        x: "__x",
        y: "__y",
        unit,
        aggregate,
      });
    } catch (err) {
      console.error(err);
      return [];
    }
  }, [normalizedData, unit, aggregate]);

  useEffect(() => {
    const count = groupedData?.length || 0;

    const result = pagination({
      page: meta.page,
      count,
      limit: unit ? 20 : 5,
    });

    setMeta((prev) => {
      const next = { ...prev, ...result };
      return Object.keys(next).every((key) => next[key] === prev[key])
        ? prev
        : next;
    });
  }, [groupedData, unit]);

  const chartData = useMemo(() => {
    return groupedData?.slice(meta.skip || 0, (meta.skip || 0) + meta.limit);
  }, [groupedData, meta]);

  // TEMP DIAGNOSTIC — remove once cause is confirmed
  console.log('AreaChartWithoutGroupBy debug:', {
    normalizedDataLength: normalizedData?.length,
    groupedData,
    chartDataLength: chartData?.length,
  });

  // ==========================================================
  // STATES
  // ==========================================================

  if (dataArray === undefined || dataArray === null) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <p className="italic text-slate-500">Loading chart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <p className="italic text-slate-500">{error}</p>
      </div>
    );
  }

  if (!chartData?.length) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <p className="italic text-slate-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <SlideThrough
        onPageClick={(page) =>
          setMeta((prev) => ({
            ...prev,
            page,
            skip: (page - 1) * prev.limit,
          }))
        }
        pages={meta.pages}
        currentPage={meta.page}
      />

      <D3AreaChart
        data={chartData}
        groups={[]}
        xAccessor={(d) => d.key}
        yAccessor={(d) => d.value}
        unit={unit}
        xLabel={typeof x === "object" ? x?.col : x}
        yLabel={(typeof y === "object" ? y?.col : y) || aggregate}
      />
    </div>
  );
}


// ============================================================
// WITH GROUP BY
// ============================================================

function AreaChartWithGroupBy({
  x,
  y,
  group_by,
  aggregate,
  unit,
  dataArray,
  ...props
}) {
  const [meta, setMeta] = useState({
    page: 1,
    pages: 1,
    limit: unit ? 20 : 5,
  });

  const [error, setError] = useState("");

  const relationships = props?.relationships ?? EMPTY_RELATIONSHIPS;

  const normalizedData = useMemo(() => {
    try {
      const xValue = Array.isArray(x) ? x[0] : x;
      const yValue = Array.isArray(y) ? y[0] : y;

      const xConfig =
        typeof xValue === "object"
          ? xValue
          : { table: props?.x_table, col: xValue };

      // FIX: only build a yConfig object when y is actually meaningfully provided
      const yConfig =
        yValue && (typeof yValue === "object" ? yValue.col : yValue)
          ? typeof yValue === "object"
            ? yValue
            : { table: props?.y_table, col: yValue }
          : null;

      const groupConfig =
        typeof group_by === "object"
          ? group_by
          : group_by
          ? { table: props?.group_by_table, col: group_by }
          : null;

      return assembleChartRows({
        dataArray: dataArray || {},
        x: xConfig,
        y: yConfig,
        group_by: groupConfig,
        relationships,
      });
    } catch (err) {
      console.error(err);
      return null;
    }
  }, [dataArray, x, y, group_by, props?.group_by_table, relationships]);

  useEffect(() => {
    if (normalizedData === null) {
      setError("Unable to load chart");
    } else {
      setError("");
    }
  }, [normalizedData]);

  const { groupedData } = useMemo(() => {
    if (!normalizedData) {
      return { groupedData: [] };
    }

    try {
      return aggregateValues({
        data: normalizedData,
        x: "__x",
        y: "__y",
        unit,
        aggregate,
        group_by: "__group_by",
      });
    } catch (err) {
      console.error(err);
      return { groupedData: [] };
    }
  }, [normalizedData, unit, aggregate]);

  useEffect(() => {
    const count = groupedData?.[0]?.data?.length || 0;

    const result = pagination({
      page: meta.page,
      count,
      limit: unit ? 20 : 5,
    });

    setMeta((prev) => {
      const next = { ...prev, ...result };
      return Object.keys(next).every((key) => next[key] === prev[key])
        ? prev
        : next;
    });
  }, [groupedData, unit]);

  const chartData = useMemo(() => {
    if (!groupedData?.length) {
      return { data: [], groups: [] };
    }

    const groups = groupedData.map(({ groupKey }) => groupKey);

    const data = [];

    groupedData.forEach(({ groupKey, data: groupData }) => {
      groupData
        .slice(meta.skip || 0, (meta.skip || 0) + meta.limit)
        .forEach((item) => {
          data.push({
            key: item.key,
            value: item.value,
            groupKey,
          });
        });
    });

    return { data, groups };
  }, [groupedData, meta]);

  // TEMP DIAGNOSTIC — remove once cause is confirmed
  console.log('AreaChartWithGroupBy debug:', {
    normalizedDataLength: normalizedData?.length,
    groupedData,
    groups: chartData.groups,
    chartDataLength: chartData.data?.length,
    chartData: chartData.data,
  });

  // ==========================================================
  // STATES
  // ==========================================================

  if (dataArray === undefined || dataArray === null) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <p className="italic text-slate-500">Loading chart...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <p className="italic text-slate-500">{error}</p>
      </div>
    );
  }

  if (!chartData.data?.length || !chartData.groups?.length) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <p className="italic text-slate-500">No data available</p>
      </div>
    );
  }

  return (
    <div className="w-full relative">
      <SlideThrough
        onPageClick={(page) =>
          setMeta((prev) => ({
            ...prev,
            page,
            skip: (page - 1) * prev.limit,
          }))
        }
        pages={meta.pages}
        currentPage={meta.page}
      />

      <D3AreaChart
        data={chartData.data}
        groups={chartData.groups}
        xAccessor={(d) => d.key}
        yAccessor={(d) => d.value}
        groupAccessor={(d) => d.groupKey}
        unit={unit}
        xLabel={typeof x === "object" ? x?.col : x}
        yLabel={(typeof y === "object" ? y?.col : y) || aggregate}
      />
    </div>
  );
}


// ============================================================
// PAGINATION
// ============================================================

function SlideThrough({ onPageClick, pages, currentPage }) {
  const slides = [
    { style: {}, label: "left" },
    { style: { transform: "rotate(180deg)" }, label: "right" },
  ];

  if (pages <= 1) {
    return null;
  }

  return (
    <div className="flex justify-end items-center justify-between gap-x-6 absolute top-4 right-2 z-10">
      {slides.map(({ style, label }, ind) => (
        <button
          key={ind}
          style={style}
          disabled={
            label === "left" ? currentPage === 1 : currentPage === +pages
          }
          onClick={() =>
            onPageClick(currentPage + (label === "left" ? -1 : 1))
          }
          className="bg-black p-1 rounded-full"
        >
          <img src="/svg/arrow-back-white.svg" />
        </button>
      ))}
    </div>
  );
}


// ============================================================
// SINGLE DATA AGGREGATE
// ============================================================

function aggregateValuesSingle({ data, x, y, unit, aggregate }) {
  const grouped = {};

  const { convertToDigit, extractDateUnit, shortMonths, shortWeekdays, weekGroups } =
    timeStampControl;

  for (let index = 0; index < data.length; index++) {
    const item = data[index];

    const key = unit
      ? extractDateUnit({ value: item[x], unit }) ?? "N/B"
      : item[x] ?? "N/B";

    if (!grouped[key]) {
      grouped[key] = { total: 0, count: 0 };
    }

    // FIX: was `item[y] ? convertToDigit(item[y]) : 1` — a falsy/missing y
    // must not silently add 1 to the total.
    grouped[key].total +=
      item[y] != null ? convertToDigit(item[y]) : 0;

    grouped[key].count += 1;
  }

  const aggregated = Object.entries(grouped).map(([key, { total, count }]) => ({
    key,
    ...(aggregate === "sum"
      ? { value: total }
      : aggregate === "count"
      ? { value: count }
      : aggregate === "average"
      ? { value: total / count }
      : {}),
  }));

  return !unit
    ? aggregated.sort((a, b) => b.value - a.value)
    : unit?.includes("week")
    ? aggregated.sort(
        (a, b) => weekGroups.indexOf(a.key) - weekGroups.indexOf(b.key)
      )
    : unit?.includes("day")
    ? aggregated.sort(
        (a, b) => shortWeekdays.indexOf(a.key) - shortWeekdays.indexOf(b.key)
      )
    : unit?.includes("mon")
    ? aggregated.sort(
        (a, b) => shortMonths.indexOf(a.key) - shortMonths.indexOf(b.key)
      )
    : aggregated.sort((a, b) => b.value - a.value);
}


// ============================================================
// GROUPED DATA AGGREGATE
// ============================================================

function aggregateValues({ data, x, y, unit = "", aggregate, group_by }) {
  const grouped = {};

  const { convertToDigit, extractDateUnit, shortMonths, shortWeekdays, weekGroups } =
    timeStampControl;

  for (let index = 0; index < data.length; index++) {
    const item = data[index];

    const timeKey = unit
      ? extractDateUnit({ value: item[x], unit }) ?? "N/B"
      : item[x] ?? "N/B";

    const groupKey = group_by ? String(item[group_by] ?? "N/A") : "all";

    if (!grouped[timeKey]) {
      grouped[timeKey] = {};
    }

    if (!grouped[timeKey][groupKey]) {
      grouped[timeKey][groupKey] = { total: 0, count: 0 };
    }

    grouped[timeKey][groupKey].total +=
      item[y] != null ? convertToDigit(item[y]) : 0;

    grouped[timeKey][groupKey].count += 1;
  }

  const groupKeys = [
    ...new Set(Object.values(grouped).flatMap(Object.keys)),
  ];

  const datasets = groupKeys.map((gk) => ({
    groupKey: gk,

    data: Object.entries(grouped)
      .map(([tk, groups]) => ({
        key: tk,

        value:
          aggregate === "sum"
            ? groups[gk]?.total || 0
            : aggregate === "count"
            ? groups[gk]?.count || 0
            : aggregate === "average"
            ? groups[gk]?.count
              ? groups[gk].total / groups[gk].count
              : 0
            : 0,
      }))
      .sort((a, b) => {
        if (!unit) return b.value - a.value;

        if (unit?.includes("week")) {
          return weekGroups.indexOf(a.key) - weekGroups.indexOf(b.key);
        }

        if (unit?.includes("day")) {
          return shortWeekdays.indexOf(a.key) - shortWeekdays.indexOf(b.key);
        }

        if (unit?.includes("mon")) {
          return shortMonths.indexOf(a.key) - shortMonths.indexOf(b.key);
        }

        return b.value - a.value;
      }),
  }));

  return { groupedData: datasets };
}
