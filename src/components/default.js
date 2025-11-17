// chartSetup.js
"use client"
import { 
  Chart as ChartLayout, registerables,
  CategoryScale,
  RadialLinearScale,
  LinearScale,
  PointElement,
  Title,LineElement,
  Filler,
  Tooltip,
  Legend,BarElement
 } from "chart.js";
// import { BoxPlotController, BoxAndWiskers } from "@sgratzl/chartjs-chart-boxplot"; 

import { BoxPlotController,BoxAndWiskers, 
  ViolinController, Violin } from "@sgratzl/chartjs-chart-boxplot";

// Register all chart components (scales, elements, etc.)
ChartLayout.register(
  ...registerables,
  BarElement, 
  BoxPlotController,
  LineElement,
  Filler,  RadialLinearScale, 
  PointElement,
  ViolinController, Violin,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,  BoxAndWiskers
);

// ✅ Global defaults — apply everywhere
ChartLayout.defaults.font.family = "Quicksand, sans-serif";
ChartLayout.defaults.font.size = 14;
ChartLayout.defaults.font.weight = "500";
ChartLayout.defaults.color = "#333"; // affects all text color globally

// Axis defaults (optional)
ChartLayout.defaults.scale.ticks.color = "#444";
ChartLayout.defaults.scale.grid.color = "rgba(0,0,0,0.05)";

// Legend defaults
ChartLayout.defaults.plugins.legend.labels.font = {
  family: "Quicksand, sans-serif",
  size: 13,
  weight: "500",
};
ChartLayout.defaults.plugins.legend.labels.color = "#222";

// Title defaults
ChartLayout.defaults.plugins.title.font = {
  family: "Quicksand, sans-serif",
  size: 16,
  weight: "600",
};
ChartLayout.defaults.plugins.title.color = "#000";

// Tooltip defaults
ChartLayout.defaults.plugins.tooltip.titleFont = {
  family: "Quicksand, sans-serif",
  size: 13,
  weight: "600",
};
ChartLayout.defaults.plugins.tooltip.bodyFont = {
  family: "Quicksand, sans-serif",
  size: 12,
};

export default ChartLayout;
