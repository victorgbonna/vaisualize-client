import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

function RadarPlot({id="", data}){
    const chartRef = useRef(null);
    const [chartKey, setChartKey] = useState(0); 
    const [myChart, setMyChart] = useState(null);
    // console.log({c})
  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');

    if (myChart) {
        myChart.destroy();
    }

    const newChart=new Chart(ctx, {
        type: 'radar',
        data: data,
        options: {
          responsive: true
        },
    })

    setMyChart(newChart);
    
    return () => {
        if (newChart) {
            newChart.destroy();
        }
    };
  }, [data]);

  return <canvas id={'radar-plot'+id} ref={chartRef} />;
};

export default RadarPlot;
