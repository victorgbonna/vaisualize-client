import AreaChart from "./AreaChart";
import BarChart from "./BarChart";
import ActualHeatmapChart from "./ActualHeatmapChart";
import BoxPlotD3 from "./BoxPlotD3";
import BubbleChart from "./BubbleChart";
import Histogram from "./Histogram";
import LineChart from "./LineChart";
import PieChart from "./PieChart";
import RadarChartD3 from "./RadarChartD3";
import ScatterPlot from "./ScatterPlot";
import StackedBarChart from "./StackedBarChart";
import ViolinPlotD3 from "./ViolinPlotD3";

export default function D3Container({ combinedVisuals }) {
  return (
    <div className="grid grid-cols-2 gap-4 overflow-y-auto h-[490px]  justify-between p-3">
      {combinedVisuals?.map((visual, index) => (
          <div key={index} className=" bg-white rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 p-2">
            <p className='pt-2 pl-2'>{visual.title}</p>
            {visual.chartType === "area chart" ? <AreaChart {...visual} /> : null}
            {(visual.chartType === "bar chart" && !visual.group_by) ? <BarChart {...visual} /> : null}
            {visual.chartType === "histogram" ? <Histogram {...visual} /> : null}
            {visual.chartType === "line chart" ? <LineChart {...visual} /> : null}
            {visual.chartType === "pie chart" ? <PieChart {...visual} /> : null}
            {visual.chartType === "scatter plot" ? <ScatterPlot {...visual} /> : null}
            {visual.chartType === "bubble chart" ? <BubbleChart {...visual} /> : null}
            {visual.chartType === "box plot" ? <BoxPlotD3 {...visual} /> : null}
            {visual.chartType === "violin plot" ? <ViolinPlotD3 {...visual} /> : null}
            {visual.chartType === "radar chart" ? <RadarChartD3 {...visual} /> : null}
            {visual.chartType === "matrix heatmap" ? <ActualHeatmapChart {...visual} /> : null}
            {(visual.chartType === "bar chart" && visual.group_by) ? <StackedBarChart {...visual} /> : null}
          </div>
      ))}
    </div>
  );  
}
