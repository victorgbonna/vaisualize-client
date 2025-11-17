import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';

function MultipleBarChart({customlabel, id="", data:c, data2:nxt_data, datalabel,data2label}){
    const chartRef = useRef(null);
    const [chartKey, setChartKey] = useState(0); 
    const [myChart, setMyChart] = useState(null);
    // console.log({c})
  useEffect(() => {
    const ctx = chartRef.current.getContext('2d');

    if (myChart) {
        myChart.destroy();
    }
    const data = {
      labels: customlabel || ['January', 'February', 'March', 'April', 'May', 'June', 'August', 'September', 'October', 'November', 'December'].map((month)=>month.slice(0,3)),
      datasets: [
        {
          label: 'Dataset 1',
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
          data: c, 
          ...datalabel
        },
        {
          label: 'Dataset 2',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
          data: nxt_data,
          ...data2label
        }
      ]
    };

    const options = {
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            display: false 
          }
        },
        x:{
            grid: {
                display: false 
            }
        }
      },
    };

    const newChart=new Chart(ctx, {
      type: 'bar',
      data: data,
      options: options
    });

    setMyChart(newChart);
    
    return () => {
        if (newChart) {
            newChart.destroy();
        }
    };
  }, [c, nxt_data, chartKey]);

  return <canvas id={'multiple-bar'+id} ref={chartRef} />;
};

export default MultipleBarChart;
