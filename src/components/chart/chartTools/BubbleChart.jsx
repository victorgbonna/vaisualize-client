
import { API_ENDPOINTS, consolelog, timeStampControl } from '@/configs';
import { DataRequestContext } from '@/context';
import React, { Fragment, useContext, useEffect, useRef, useState } from 'react';
import { Bubble } from "react-chartjs-2";

function BubbleChart({x,y, group_by, z}){
  const {dataArray}=useContext(DataRequestContext);
    // consolelog({bubble:z})
  const colors = API_ENDPOINTS.GET_COLORS
  
  const {convertToDigit}= timeStampControl

  const z_values= dataArray.map((item)=>convertToDigit(item[z]))
  const unique_z_values= [...new Set(z_values)];
  const min_z_value= Math.min(...unique_z_values)
  const max_z_value= Math.max(...unique_z_values)

  const datasets_into_objects= dataArray.reduce((acc, row) => {
    const group = row[group_by];
    if (!acc[group]) acc[group] = {
      label: group,
      data: [],
      backgroundColor: colors[Object.keys(acc).length % colors.length],
      borderColor: '#0000007a'
    };
    acc[group].data.push({ 
      x: convertToDigit(row[x[0]]), y: convertToDigit(row[y[0]]), 
      r: scaleRadius({value: convertToDigit(row[z]), min: min_z_value, max: max_z_value}) 
    });
    return acc;
  }, {})
  const datasets = Object.values(
    datasets_into_objects
  );
  const data = {
    datasets,
  };

  const options = {
    maintainAspectRatio:false,
    responsive:true,
    plugins: {
      legend: { display: false },
      title: { display: false }, 
      
    },
    scales: {
      x: {
        title: {
          display: true,
          text: x[0],
          ticks: { font: { size: 6 } },
        },
      },
      y: {
        title: {
          display: true,
          text: y[0]
        },
      },
    },
    // plugins: {
    //   legend: {
    //     labels: { font: { family: "Poppins", size: 13 } },
    //   },
    // },
  };
  return(
    <>
    <div className='absolute w-fit bottom-[55px] right-3 border py-1 px-2 bg-opacity-50 bg-white rounded-md'>
      <div className='flex items-center gap-x-3'>
        <div className='flex items-center gap-x-1'>
          {Object.values(datasets_into_objects).map((_,index)=> 
            <Fragment key={index}>
              {colors[index] && colors[index] !=='#e4e0e5'?<div style={{borderRadius:50, width:10, height:10, background:colors[index]}} className='border border-black'>
                
              </div>:null}
            </Fragment>
          )}
        </div>
        <p className='text-xs'>{group_by}</p>
      </div>
    </div>
    <div className="h-[400px]  tablet:w-[500px] tablet:h-[350px]">
      <Bubble data={data} options={options} />
    </div>
    </>
  )
}
function scaleValue({value, xVal, yVal, min, max}) {
    const result= Math.ceil(
        ((value - Math.min(xVal, yVal)) / (Math.max(xVal, yVal) - Math.min(xVal, yVal) || 1)) * (max - min) + min
    );
  return result
}

function processData(dataArray, x, y, z) {
  return dataArray.reduce(
    (acc, row) => {
      const yVal = Number(row[y[0]]);
      const xVal = Number(row[x[0]]);

      acc.values.push(yVal);
      acc.data.push({ x: xVal, y: yVal, r: scaledR });

      return acc;
    },
    { values: [], data: [] }
  );
}
function scaleRadius({value, min, max, minR = 2, maxR =8}) {
  if (max === min) return (minR + maxR) / 2; 
  const normalized = (value - min) / (max - min);
  return minR + normalized * (maxR - minR);
}

export default BubbleChart;
