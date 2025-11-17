// SwarmPlot.js
import React, { useEffect } from 'react';
// import Plot from 'react-plotly.js';

function SwarmPlot({ data }){
  useEffect(() => {
    if (data) {
      const trace = {
        type: 'scatter',
        mode: 'markers',
        x: data.x,
        y: data.y,
        marker: {
          color: data.markerColors, // Array of colors for each data point
          size: data.markerSizes, // Array of sizes for each data point
          symbol: data.markerSymbols, // Array of symbols for each data point
          line: {
            color: 'rgb(0,0,0)',
            width: 0.5
          }
        }
      };

      const layout = {
        title: 'Swarm Plot',
        xaxis: {
          title: 'X Axis'
        },
        yaxis: {
          title: 'Y Axis'
        }
      };

      Plotly.newPlot('swarmPlot', [trace], layout);
    }
  }, [data]);

  return <div id="swarmPlot" />;
};

export default SwarmPlot;
