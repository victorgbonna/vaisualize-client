import { useContext, useMemo } from "react";
import { DataRequestContext } from "@/context";
import {
  assembleChartRows,
  findRelationship,
  getGroupValues,
  getTableRows,
  normalizeConfig,
  resolveRelatedColumnValue,
} from "./chartDataUtils";
import ScatterBubbleChart from "./ScatterBubbleChart";

export default function BubbleChart({ x, y, z, group_by, relationships = [] }) {
  const { datasets: dataArray } = useContext(DataRequestContext);
  const xConfig = useMemo(() => normalizeConfig(x), [x]);
  const yConfig = useMemo(() => normalizeConfig(y), [y]);
  const zConfig = useMemo(() => normalizeConfig(z), [z]);
  const groupConfig = useMemo(() => normalizeConfig(group_by), [group_by]);
  const groupValues = useMemo(
    () => getGroupValues(dataArray, groupConfig),
    [dataArray, groupConfig]
  );
  const hasGroupBy = Boolean(groupConfig?.table && groupConfig?.col);
  const useGroupBy = hasGroupBy && groupValues.length <= 21;

  const baseTable = useMemo(() => {
    if (!xConfig?.table || !yConfig?.table) return xConfig?.table;
    if (xConfig.table === yConfig.table) return xConfig.table;
    return findRelationship(xConfig.table, yConfig.table, relationships)?.fromTable;
  }, [xConfig, yConfig, relationships]);

  const rows = useMemo(() => {
    const preparedRows = assembleChartRows({
      dataArray,
      workingData: getTableRows(dataArray, baseTable),
      x: xConfig,
      y: yConfig,
      groupBy: useGroupBy ? groupConfig : null,
      relationships,
    });

    return preparedRows
      .map((row) => ({
        ...row,
        __z:
          zConfig?.table && zConfig?.col
            ? resolveRelatedColumnValue({
                row,
                currentTable: baseTable || xConfig?.table,
                targetTable: zConfig.table,
                targetColumn: zConfig.col,
                dataArray,
                relationships,
              })
            : undefined,
      }))
      .filter(
        (row) =>
          Number.isFinite(Number(row.__x)) &&
          Number.isFinite(Number(row.__y)) &&
          Number.isFinite(Number(row.__z))
      );
  }, [dataArray, baseTable, xConfig, yConfig, zConfig, groupConfig, relationships, useGroupBy]);

  if (dataArray === undefined || dataArray === null) {
    return <ChartState>Loading chart...</ChartState>;
  }

  if (!rows.length) {
    return <ChartState>No data available</ChartState>;
  }

  return (
    <ScatterBubbleChart
      data={rows}
      groups={useGroupBy ? groupValues : []}
      xLabel={xConfig?.col}
      yLabel={yConfig?.col}
      zLabel={zConfig?.col}
      bubble
    />
  );
}

function ChartState({ children }) {
  return (
    <div className="w-full h-[400px] flex items-center justify-center">
      <p className="italic text-slate-500">{children}</p>
    </div>
  );
}
