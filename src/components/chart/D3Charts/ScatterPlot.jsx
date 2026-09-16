import { useContext, useMemo } from "react";
import { DataRequestContext } from "@/context";
import {
  assembleChartRows,
  getGroupValues,
  normalizeConfig,
} from "./chartDataUtils";
import ScatterBubbleChart from "./ScatterBubbleChart";

export default function ScatterPlot({ x, y, group_by, relationships = [] }) {
  const { datasets: dataArray } = useContext(DataRequestContext);
  const xConfig = useMemo(() => normalizeConfig(x), [x]);
  const yConfig = useMemo(() => normalizeConfig(y), [y]);
  const groupConfig = useMemo(() => normalizeConfig(group_by), [group_by]);
  const groupValues = useMemo(
    () => getGroupValues(dataArray, groupConfig),
    [dataArray, groupConfig]
  );
  const hasGroupBy = Boolean(groupConfig?.table && groupConfig?.col);
  const useGroupBy = hasGroupBy && groupValues.length <= 21;

  const rows = useMemo(
    () =>
      assembleChartRows({
        dataArray,
        x: xConfig,
        y: yConfig,
        groupBy: useGroupBy ? groupConfig : null,
        relationships,
      }).filter(
        (row) => Number.isFinite(Number(row.__x)) && Number.isFinite(Number(row.__y))
      ),
    [dataArray, xConfig, yConfig, groupConfig, relationships, useGroupBy]
  );

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
