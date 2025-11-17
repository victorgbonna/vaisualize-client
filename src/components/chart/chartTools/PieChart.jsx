import React, { useContext, useEffect, useRef, useState } from 'react';
import { Pie } from "react-chartjs-2";
import "chart.js/auto";
import { DataRequestContext } from '@/context';
import { timeStampControl } from '@/configs';


function PieChart({x,y, title, aggregation}){
  const colors = [
      'rgba(231, 76, 60, 0.8)',   // Red
        'rgba(52, 152, 219, 0.8)',  // Blue
        'rgba(46, 204, 113, 0.8)',  // Green
        'rgba(241, 196, 15, 0.8)',  // Yellow
        'rgba(155, 89, 182, 0.8)',  // Purple
        'rgba(230, 126, 34, 0.8)',  // Orange
        'rgba(26, 188, 156, 0.8)'
  ]
  const {dataArray}=useContext(DataRequestContext);  
  const groupedData=aggregateValues(
    {data:dataArray, x:x[0], y:y[0], aggregation})

   const data = {
    labels: groupedData.map(({key})=>key),
    datasets: [
      {
        label: y[0],
        data: groupedData.map(({value})=>value),
        backgroundColor: colors,
        borderColor: colors.map((color)=>color.replace('0.8)','1)')),
        borderWidth: 1,
      },
    ],

  };
  const options = {
    plugins: {
      
      legend: {
        position: "bottom",
      },
    },
  };
  return (
    <div className="w-full relative">
      <div className="h-full w-full flex justify-center">
          <div className="w-[400px] tablet:h-fit">
            <Pie data={data} options={options} />
          </div>
      </div>
    </div>
  )
};
 function aggregateValues({data, x, y, aggregation, meta}) {
    let grouped=[]
    const {convertToDigit}= timeStampControl
    for (let index = 0; index < data.length; index++) {
      const item = data[index];
      const key = item[x];

      if (!grouped[key]) {
        grouped[key] = { total: 0, count: 0 };
      }
      grouped[key].total += (convertToDigit(item[y]) ?? 1);
      grouped[key].count += 1;
      
    }

    const aggregated = Object.entries(grouped).map(([key, { total, count }]) => ({
      key,
      ...(
        aggregation === 'sum' || aggregation === 'total' ? { value: total }:
        aggregation === 'count'? { value: count }:
        aggregation === 'average' ? { value: total / count }:
        {}
      )   
    }));

    const data_agg=aggregated.sort((a, b) => b.value - a.value);
    if(data_agg.length<8){
      return data_agg
    }
    const top7 = data_agg.slice(0, 6);
    const restSum = data_agg.slice(6).reduce((sum, item) => sum + item.value, 0);

    const final = [
      ...top7,
      ...(restSum > 0 ? [
        { key: "rest(+"+(data_agg.length-7)+") others", value: restSum }] : []),
    ];
    return top7
  }

export default PieChart;
