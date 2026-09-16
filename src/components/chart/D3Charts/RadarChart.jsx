"use client";

import { useContext, useEffect, useMemo, useState } from "react";
import { Radar } from "react-chartjs-2";
import "chart.js/auto";
import { API_ENDPOINTS, timeStampControl } from "@/configs";
import { DataRequestContext } from "@/context";
import {
  findRelationship,
  getTableRows,
  normalizeConfig,
  pagination,
  resolveRelatedColumnValue,
} from "./chartDataUtils";

export default function RadarChart({ x, y, relationships = [] }) {
  const { datasets: dataArray } = useContext(DataRequestContext);
  const xConfigs = useMemo(() => normalizeConfigArray(x), [x]);
  const yConfig = useMemo(() => normalizeConfig(y), [y]);
  const baseTable = useMemo(
    () => getWorkingTable(xConfigs, yConfig, relationships),
    [xConfigs, yConfig, relationships]
  );

  const rows = useMemo(() => {
    const baseData = getTableRows(dataArray, baseTable);

    return baseData
      .map((row) => ({
        __group: resolveColumn({
          row,
          baseTable,
          config: yConfig,
          dataArray,
          relationships,
        }),
        __values: xConfigs.map((config) =>
          resolveColumn({
            row,
            baseTable,
            config,
            dataArray,
            relationships,
          })
        ),
      }))
      .filter((row) => row.__group !== undefined && row.__group !== null);
  }, [dataArray, baseTable, xConfigs, yConfig, relationships]);

  if (dataArray === undefined || dataArray === null) {
    return <ChartState>Loading chart...</ChartState>;
  }

  if (!rows.length || !xConfigs.length) {
    return <ChartState>No data available</ChartState>;
  }

  return <RadarRenderer rows={rows} labels={xConfigs.map((config) => config.col)} />;
}

function normalizeConfigArray(value) {
  const values = Array.isArray(value?.[0]) ? value[0] : Array.isArray(value) ? value : [value];
  return values.map((item) => normalizeConfig(item)).filter(Boolean);
}

function getWorkingTable(xConfigs, yConfig, relationships) {
  const firstX = xConfigs[0];

  if (!firstX?.table || !yConfig?.table) return firstX?.table || yConfig?.table;
  if (firstX.table === yConfig.table) return firstX.table;

  return findRelationship(firstX.table, yConfig.table, relationships)?.fromTable || firstX.table;
}

function resolveColumn({ row, baseTable, config, dataArray, relationships }) {
  if (!config?.table || !config?.col) return undefined;

  return resolveRelatedColumnValue({
    row,
    currentTable: baseTable,
    targetTable: config.table,
    targetColumn: config.col,
    dataArray,
    relationships,
  });
}

function RadarRenderer({ rows, labels }) {
  const [meta, setMeta] = useState({ page: 1, pages: 1, limit: 4 });
  const groups = useMemo(
    () => [...new Set(rows.map((row) => String(row.__group ?? "N/A")))],
    [rows]
  );

  useEffect(() => {
    setMeta((previous) => ({
      ...previous,
      ...pagination({
        page: previous.page,
        count: groups.length,
        limit: previous.limit,
      }),
    }));
  }, [groups.length]);

  const data = useMemo(() => {
    const visibleGroups = groups.slice(meta.skip || 0, (meta.skip || 0) + meta.limit);
    const colors = API_ENDPOINTS.GET_COLORS;

    return {
      labels,
      datasets: visibleGroups.map((group, index) => {
        const groupRows = rows.filter((row) => String(row.__group ?? "N/A") === group);

        return {
          label: group,
          data: labels.map((_, valueIndex) => averageValue(groupRows, valueIndex)),
          backgroundColor: colors[index % colors.length].replace("1)", "0.3)"),
          borderColor: colors[index % colors.length].replace("1)", "0.7)"),
          borderWidth: 1,
        };
      }),
    };
  }, [groups, labels, meta, rows]);

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" },
      },
      scales: {
        r: {
          pointLabels: {
            font: { size: 12 },
            padding: 10,
            display: true,
          },
          ticks: {
            callback: (value) => timeStampControl.convertToDigit(value),
          },
        },
      },
      layout: { padding: 10 },
    }),
    []
  );

  return (
    <div className="flex justify-center w-full relative tablet:block">
      <SlideThrough meta={meta} setMeta={setMeta} />
      <div className="h-full flex justify-center tablet:block">
        <div className="w-[600px] h-[400px] tablet:w-full tablet:w-[410px] tablet:h-[400px]">
          <Radar data={data} options={options} />
        </div>
      </div>
    </div>
  );
}

function averageValue(rows, valueIndex) {
  const values = rows
    .map((row) => Number(row.__values[valueIndex]))
    .filter((value) => Number.isFinite(value));

  if (!values.length) return 0;

  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 100) / 100;
}

function ChartState({ children }) {
  return (
    <div className="w-full h-[400px] flex items-center justify-center">
      <p className="italic text-slate-500">{children}</p>
    </div>
  );
}

function SlideThrough({ meta, setMeta }) {
  if (meta.pages <= 1) return null;

  return (
    <div className="flex justify-end items-center justify-between gap-x-6 absolute top-4 right-2 z-10">
      {[-1, 1].map((direction) => (
        <button
          key={direction}
          type="button"
          disabled={direction < 0 ? meta.page === 1 : meta.page === meta.pages}
          onClick={() =>
            setMeta((previous) => ({
              ...previous,
              page: previous.page + direction,
              skip: (previous.page + direction - 1) * previous.limit,
            }))
          }
          className="bg-black p-1 rounded-full"
        >
          <img
            src="/svg/arrow-back-white.svg"
            alt="Change page"
            style={direction > 0 ? { transform: "rotate(180deg)" } : undefined}
          />
        </button>
      ))}
    </div>
  );
}
