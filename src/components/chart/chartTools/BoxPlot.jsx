"use client";

import React, { useContext, useEffect, useMemo, useState } from "react";
import { Chart } from "react-chartjs-2";
import { API_ENDPOINTS, consolelog, pagination, timeStampControl } from "@/configs";
import { DataRequestContext } from "@/context";
// import { SelectMultiple } from "@/components";
import "chart.js/auto";

const datasets_style_presets=[
    {   
      // label: "Dataset 1",
      backgroundColor: "rgba(75, 192, 192, 0.6)",
      borderColor: "rgba(75, 192, 192, 1)",
      borderWidth: 1,
      outlierColor: "#999999",
      padding: 10,
      itemRadius: 0},
    {
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
        outlierColor: "#999999",
        padding: 10,
        itemRadius: 0,
    }
  ]
function BoxPlot({x, y, aggregation}){
  const {dataArray}=useContext(DataRequestContext);

  const groupedData= groupData({array:dataArray, x:x[0], y:y[0]})
  const {convertToDigit}= timeStampControl
  

  const labels = Object.keys(groupedData);
  const values = Object.values(groupedData);
  const [meta, setMeta]= useState({page:1, pages:1, limit:4})
  const all_y_values=dataArray.map((item)=>convertToDigit(item[y[0]]))
  const max_bin = roundUpTo5(Math.max(...all_y_values))
  const min_bin = roundDownTo5(Math.min(...all_y_values))
  
  
  let diff= (max_bin-min_bin)/6
  diff=Math.round(diff / 1) * 1

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "", display:false },
    },
    elements: {
      boxplot: {
        boxWidth: 0.8,
        outlierRadius: 2,
      },
    },
    scales: {
      y: {
        min: min_bin,
        // max: max_bin, 
        // ticks: {
        //   stepSize: 10,
        // },
        title: { display: true, text:y[0] },
      },
      x: {
        ticks: {
          font: { size: 11 },
          maxRotation:20,
          align: "right", 
        },
        title: { display: true, text: x[0] },
      },
    
    },
  };
  const data= useMemo(()=>{
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
    const count=labels.length
    const result=pagination({page:meta.page, count})
    setMeta({...meta, ...result})
  },[])
  if (!data) return null
  
  return (
    <div className="w-full relative">
      {/* {(meta?.pages>1)? */}
        <SlideThrough 
          onPageClick={(e)=>setMeta({...meta, page:e, skip:(e - 1) * meta.limit})}
          pages={meta.pages}
          currentPage={meta.page}
        />
        {/* :null} */}
      <div className="h-[400px] tablet:w-[500px] tablet:h-[350px]">
      <Chart type="boxplot" data={data} options={options} />
      </div>
    </div>
  );
};

// function FilterOptions({xLabelObj, setXlabelsObj}){
//   const [xLabelObjChange, setXlabelsObjDupli]={}
//   useEffect(()=>{
//     setXlabelsObjDupli(xLabelObj)
//   }, [xLabelObj])

//   const actualChange=()=>{
//     setXlabelsObj(xLabelObjChange)
//   }
//   return(
//     <div className="relative">
//       <div>
//         <p>Filter Labels</p>
//       </div>
//       <div>
//         <p>Highest, is 4 to show</p>
//         <div>
//           {xLabelObjChange.map((x,ind)=>
//             <div key={ind}>

//             </div>
//           )}
//         </div>
//         <div>
//           {rest.map((x,index)=>
//             <div style={0?{
//                 background:"#CABECF", padding:"12px 10px"
//             }:{ padding:"12px 10px"}} 
//             className="text-sm border-b-2 cursor-pointer flex items-center gap-x-3" key={index} 
//             >
//               <p>{x}</p>
//               <button disabled={}>Include</button>
//             </div>
//           )}
//         </div>
//         B
//       </div>
//     </div>

//   )
// }
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
const roundUpTo5 = (num) => Math.ceil(num / 5) * 5;
const roundDownTo5 = (num) => Math.floor(num / 5) * 5;

function getSortedValues(xData){

  // 1. Count occurrences
  const counts = xData.reduce((acc, key) => {
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  // 2. Sort by highest count
  const sortedKeys = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);

  // 3. Pick top 4 and group the rest
  const top4 = sortedKeys.slice(0, 3);
  const rest = sortedKeys.slice(3);

  // 4. Merge into final labels array
  const xLabels = rest.length > 0 ? [...top4, 'rest'] : top4;
  return {xLabels, rest}
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


export default BoxPlot;

// ...xLabels.map(xLabel =>
//             {
//               if (xLabel === 'rest') {
//                 // Combine all remaining categories
//                 return dataArray
//                   .filter(row => rest.includes(row[x[0]?.xProp]))
//                   .map(row => +row[y[0]?.yProp]);
//               } else {
//                 return dataArray
//                   .filter(row => row[x[0]?.xProp] === xLabel)
//                   .map(row => +row[y[0]?.yProp]);
//               }
//             })