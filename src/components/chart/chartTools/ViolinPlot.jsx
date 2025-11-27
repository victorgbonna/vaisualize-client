"use client";

import { API_ENDPOINTS, pagination, timeStampControl } from "@/configs";
import { DataRequestContext } from "@/context";

import React, { useContext, useEffect, useMemo, useState } from "react";
import { Chart } from "react-chartjs-2";


function ViolinPlot({x,y}){
  const [meta, setMeta]= useState({page:1, pages:1, limit:4})
  const {convertToDigit}= timeStampControl

  const {dataArray}=useContext(DataRequestContext);
  const groupedData= groupData({array:dataArray, x:x[0], y:y[0]})
    
  const labels = Object.keys(groupedData);
  const values = Object.values(groupedData);

  const options = {
    responsive: true,
    maintainAspectRatio:false,
    plugins: {
      title: {
        display: false,
        text: "Violin Plot Example"
      },
      legend: {
        position: "top",
        display:false
      }
    },
    scales: {
      x: {
        title: { display: true, text: x[0] },
        // stacked: false, 
      },
      y: {
        // beginAtZero: true,
        // ticks: { stepSize: 1, precision: 0 },
        title: { display: true, text: y[0] },
        
      },
    }
  };
  // const data = {
  //   labels: ["Group A", "Group B", "Group C"],
  //   datasets: [
  //     {
  //       label: "Violin Dataset",
  //       data: [
  //         [5, 8, 3, 6, 9, 12, 7],
  //         [4, 7, 1, 5, 10, 8, 6],
  //         [2, 3, 4, 8, 9, 5, 7]
  //       ],
  //       backgroundColor: "rgba(153,102,255,0.6)",
  //       borderColor: "rgba(153,102,255,1)",
  //       borderWidth: 1
  //     }
  //   ]
  // };
  const data= useMemo(()=>{
    if(!meta.count) return null
    if(!meta.count) return null
    const all_xlabels= labels
    const xLabels= all_xlabels.slice(meta.skip, meta.skip+meta.limit)
    
    const data = {
      labels: xLabels,
    
      datasets: [
        {
          label:y[0], 
          data:values.slice(meta.skip, meta.skip+meta.limit),
          backgroundColor:API_ENDPOINTS.GET_COLORS
         
          // data: [
          //   ...xLabels.map(xLabel =>
          //   {
          //   return dataArray
          //     .filter(row => row[x[0]?.xProp] === xLabel)
          //     .map(row => +row[y[0]?.yProp]);
              
          //   })
          // ],
          // ...datasets_style_presets[1]
        }
      ],
    };
    return data
  },[meta])
  useEffect(()=>{
    // const {xLabels, rest}= getSortedValues(x[0]?.xData)
    // setXlabelsObj({xLabels,rest})
    const count=labels.length
    const result=pagination({page:meta.page, count})
    setMeta({...meta, ...result})
  },[])
  
  if (!data) return null
  return (
    <div className="w-full relative">
       <SlideThrough 
          onPageClick={(e)=>setMeta({...meta, page:e, skip:(e - 1) * meta.limit})}
          pages={meta.pages}
          currentPage={meta.page}
        />
      <div className="h-[400px] tablet:w-[500px] tablet:h-[350px]">
        <Chart type="violin" data={data} options={options} />
      </div>
    </div>
  );
};
const roundUpTo5 = (num) => Math.ceil(num / 5) * 5;
const roundDownTo5 = (num) => Math.floor(num / 5) * 5;

function SlideThrough({onPageClick, pages, currentPage}){
  const slides=[
    {style:{},label:'left'},
    {style:{transform: 'rotate(180deg)'}, label:'right'}
  ]
  if(pages<=1) return null
  return(
    <div className="flex justify-end items-center justify-between gap-x-6 absolute top-4 right-2">
      {slides.map(({style, label},ind)=>
        <button key={ind} style={style} disabled={label==='left'?currentPage===1:currentPage===+pages} 
          onClick={()=>onPageClick(currentPage+(label==='left'?-1:1))} className="bg-black p-1 rounded-full">
          <img src="/svg/arrow-back-white.svg"/>
        </button>      
      )}
    </div>
  )
}

function groupData({array, x, y}) {
  const {convertToDigit}= timeStampControl

  const groupedData = array.reduce((acc, item) => {
    // consolelog({item,acc,x,y})
    if (!acc[item[x]]) acc[item[x]] = [];
    acc[item[x]].push(convertToDigit(item[y]));
    return acc;
  }, {});

  return groupedData;
}

export default ViolinPlot;
