import { useContext, useEffect, useMemo, useState } from "react";
import { DataRequestContext } from "@/context";
import {
  findRelationship,
  getTableRows,
  normalizeConfig,
  pagination,
  resolveRelatedColumnValue,
} from "./chartDataUtils";

export default function ActualHeatmapChart({ x, y, aggregate = "sum", relationships = [] }) {
  const { datasets: dataArray } = useContext(DataRequestContext);
  const xConfigs = useMemo(() => normalizeConfigArray(x), [x]);
  const yConfig = useMemo(() => normalizeConfig(y), [y]);
  const baseTable = useMemo(
    () => getWorkingTable(xConfigs, yConfig, relationships),
    [xConfigs, yConfig, relationships]
  );

  const preparedRows = useMemo(() => {
    const baseData = getTableRows(dataArray, baseTable);

    return baseData
      .map((row) => ({
        __y: resolveColumn({
          row,
          baseTable,
          config: yConfig,
          dataArray,
          relationships,
        }),
        __values: xConfigs.reduce((acc, config) => {
          acc[config.col] = resolveColumn({
            row,
            baseTable,
            config,
            dataArray,
            relationships,
          });
          return acc;
        }, {}),
      }))
      .filter((row) => row.__y !== undefined && row.__y !== null);
  }, [dataArray, baseTable, xConfigs, yConfig, relationships]);

  const heatmapData = useMemo(
    () => buildHeatmapData({ rows: preparedRows, columns: xConfigs.map((config) => config.col), aggregate }),
    [preparedRows, xConfigs, aggregate]
  );

  if (dataArray === undefined || dataArray === null) {
    return <ChartState>Loading chart...</ChartState>;
  }

  if (!heatmapData.groups.length || !xConfigs.length) {
    return <ChartState>No data available</ChartState>;
  }

  return (
    <HeatmapTable
      heatmapData={heatmapData}
      columns={xConfigs.map((config) => config.col)}
      yLabel={yConfig?.col}
    />
  );
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

function buildHeatmapData({ rows, columns, aggregate }) {
  const buckets = {};

  rows.forEach((row) => {
    const group = row.__y ?? "N/B";

    if (!buckets[group]) {
      buckets[group] = {};
    }

    columns.forEach((column) => {
      const value = Number(row.__values[column]);

      if (!Number.isFinite(value)) return;
      if (!buckets[group][column]) {
        buckets[group][column] = { total: 0, count: 0 };
      }

      buckets[group][column].total += value;
      buckets[group][column].count += 1;
    });
  });

  const groups = Object.keys(buckets);
  const values = {};
  const maxByColumn = {};

  groups.forEach((group) => {
    values[group] = {};

    columns.forEach((column) => {
      const bucket = buckets[group][column];
      const value = bucket
        ? aggregate === "average" || aggregate === "mean"
          ? bucket.total / bucket.count
          : bucket.total
        : 0;

      const roundedValue = Math.round(value * 100) / 100;
      values[group][column] = roundedValue;
      maxByColumn[column] = Math.max(maxByColumn[column] || 0, roundedValue);
    });
  });

  return { groups, values, maxByColumn };
}

function HeatmapTable({ heatmapData, columns, yLabel }) {
  const [meta, setMeta] = useState({ page: 1, pages: 1, limit: 4 });

  useEffect(() => {
    setMeta((previous) => ({
      ...previous,
      ...pagination({
        page: previous.page,
        count: heatmapData.groups.length,
        limit: previous.limit,
      }),
    }));
  }, [heatmapData.groups.length]);

  const visibleGroups = heatmapData.groups.slice(meta.skip || 0, (meta.skip || 0) + meta.limit);

  return (
    <div className="pt-6 border rounded-lg overflow-x-auto overflow-y-auto h-[400px] w-full relative">
      <SlideThrough meta={meta} setMeta={setMeta} />
      <table className="border-collapse border-spacing-2 w-full min-w-[420px]">
        <thead>
          <tr className="text-sm">
            <th className="h-fit w-[150px] px-4 py-2 text-gray-600 text-xs font-medium">
              <p className="underline">{yLabel}</p>
            </th>
            {visibleGroups.map((group) => (
              <th className="mx-2 px-4 py-2 font-semibold text-gray-600 text-[13px]" key={group}>
                {group}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {columns.map((column) => (
            <tr key={column} className="w-full">
              <td className="text-gray-600 text-sm text-center">
                <p>
                  {column}
                  <span className="text-[11px] italic">
                    {` (max-${heatmapData.maxByColumn[column] || 0})`}
                  </span>
                </p>
              </td>
              {visibleGroups.map((group) => {
                const value = heatmapData.values[group]?.[column] || 0;
                const max = heatmapData.maxByColumn[column] || 0;
                const intensity = max ? Math.max(Math.round((value / max) * 10) / 10, 0.1) : 0;

                return (
                  <td
                    style={{
                      backgroundColor: value ? `rgba(21, 105, 56, ${intensity})` : "#ffffff",
                    }}
                    className="text-sm font-bold border border-slate-300 text-center h-8 text-black"
                    key={group}
                  >
                    {value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
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
    <div className="flex justify-end items-center justify-between gap-x-6 absolute top-2 right-1 z-10">
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
