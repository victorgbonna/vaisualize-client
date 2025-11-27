// import { useContext, useEffect, useMemo, useRef, useState } from 'react';
// import { DataRequestContext } from '@/context';
// import { consolelog, pagination, timeStampControl } from '@/configs';
// import { Line } from 'react-chartjs-2';

// // function LinePlot({ data, id="", displayLabel=false }){
// //   const chartRef = useRef(null);
// //   const [chartKey, setChartKey] = useState(0);  
// //   const [myChart, setMyChart] = useState(null);

// //   useEffect(() => {
// //     if (chartRef && chartRef.current) {
// //       const ctx = chartRef.current.getContext('2d');
// //       if (myChart) {
// //         myChart.destroy();
// //       }
      
// //       let newChart={}
// //       if(!displayLabel){
// //         newChart=new Chart(ctx, {
// //           type: 'line',
// //           data: {
// //             labels: data.labels,
// //             datasets: [{
// //               label: '',
// //               data: data.values,
// //               borderColor: '#2E8B57',
// //               tension: 0.8,
// //               borderWidth:2,
// //               lineTension: 0.8
// //             }]
// //           },
// //           options: {
// //             plugins: {
// //               legend: {
// //                 display: false
// //               }
// //             },
// //             scales: {
// //               x: {
// //                 display: false
// //               },
// //               y: {
// //                 display: false
// //               }
// //             },
// //             layout: {
// //               padding: {
// //                 top: 0,
// //                 bottom: 0,
// //                 left: 0,
// //                 right: 0
// //               }
// //             },
// //             elements: {
// //               point: {
// //                 radius: 0, // Set the radius to 0 to hide the points
// //               }
// //             },
// //             fill: true,
// //             backgroundColor: '#D3F8D3',
// //             responsive: true,
// //             maintainAspectRatio: false
// //           }
// //         });
// //       }
// //       else{
// //         newChart=new Chart(ctx, {
// //           type: 'line',
// //           data, 
// //           // {
// //           //   labels: data.labels,
// //           //   datasets: [{
// //           //     label: data.datasetLabel,
// //           //     data: data.values,
// //           //     borderColor: 'rgba(255, 99, 132, 1)',
// //           //     borderWidth: 2,
// //           //     fill: false
// //           //   }]
// //           // },
// //           options: {
// //             responsive: true,
// //             maintainAspectRatio: false
// //           }
// //         });
// //       }

// //       setMyChart(newChart);
    
// //       return () => {
// //           if (newChart) {
// //               newChart.destroy();
// //           }
// //       };
// //     }
// //   }, [data, chartKey]);

// //   return <canvas id={'line-plot'+id} ref={chartRef} />;
// // };
// function LinePlot(props){
//   const max_limit_of_group_by= props?.group_by?[...new Set(props?.data?.map((row)=>row[group_by]))]:[]
//   return(
//     <>
//     {!!max_limit_of_group_by.length<6?
//       <LinePlotGroupBy {...props}/>:
//       <LinePlotSingle {...props}/>
//     }
//     </>
//   )

// }
// function LinePlotGroupBy({aggregation,x, y, group_by,z,title, description,why, unit}){
//       const [meta, setMeta]= useState({page:1, pages:1, limit:unit?20:5})
//       const [error, setError]= useState('')
  
//       const {dataArray}= useContext(DataRequestContext)
//       const {isTimeStamp,parseTimestamp, getUnit}= timeStampControl
  
//       // const unit= getUnit([title,description,why])
//       // const getTimeStampFormat= isTimeStamp(dataArray[0][x[0]])
//       const {error:data_error,groupedData}=aggregateValues(
//         {data:dataArray, x:x[0], y:y[0],unit, aggregation, group_by}
//       )
//       const data = useMemo(() => {
//         if (!groupedData?.length) return null;
//         if (data_error) {
//           setError(data_error);
//           return {labels: 'nan', datasets: []};
//         }
  
//         const labels = groupedData[0]?.data
//           .slice(meta.skip, meta.skip + meta.limit)
//           .map(item => item.key) || [];
  
//         const datasets = groupedData.map(({groupKey, data: groupData}, idx) => ({
//           label: groupKey,
//           data: groupData.slice(meta.skip, meta.skip + meta.limit).map(item => item.value),
//           backgroundColor: [`rgba(75, 192, 192, 0.2)`, `rgba(255, 159, 64, 0.2)`, `rgba(153, 102, 255, 0.2)`][idx % 5],
//           fill: true, 
//           tension: 0.4,
//           borderWidth: 2,
//         }));
  
//         return {labels, datasets};
//       }, [meta, groupedData]);
//   const options = {
//     elements: {
//       line: { tension: 0 }, 
//     },
//     plugins: {
//       legend: { position: "", display:false },
//     },
//     scales: {
//       x: {
//         title: { display: true, text: x[0] },
//         // stacked: false, 
//       },
//       y: {
//         // beginAtZero: true,
//         // ticks: { stepSize: 1, precision: 0 },
//         title: { display: true, text: y[0] },
        
//       },
//     }
//   };
//    useEffect(()=>{
//     const count=Object.keys(dataArray).length
//     const result=pagination({page:meta.page, count})
//     setMeta({...meta, ...result})
//   },[])
//   if (!data) return null
//   // return null
//   return (
//     <div className="w-full flex justify-center relative">
//         {error?
//           <div className='bg-white flex items-center justify-center absolute w-full top-0 bottom-0 right-0 left-0'>
//               <p className='italic w-[80%]'>{error}</p>
//           </div>
//         :null}
//         {!error?<SlideThrough 
//           onPageClick={(e)=>setMeta({...meta, page:e, skip:(e - 1) * meta.limit})}
//           pages={meta.pages}
//           currentPage={meta.page}
//         />:null}
//         <Line 
//           data={data}
//           // {{labels:data.x_values, datasets:data.datasets}} 
//           options={options}/>
//     </div>
//   );
// }
// function LinePlotSingle({aggregation,x, y, group_by,z,title, description,why, unit}){
//   const {dataArray}=useContext(DataRequestContext);
//   const [meta, setMeta]= useState({page:1, pages:1, limit:4})
//   const {isTimeStamp,parseTimestamp, getUnit, convertToDigit}= timeStampControl
  
//   const getTimeStampFormat= isTimeStamp(dataArray[0][x[0]])
//   const [error, setError]=useState('')

  
//   const group_all= groupByAndFormat(
//     {data:dataArray, unit, xKey:x[0],
//       yKey:y[0], 
//       groupBy:group_by, 
//       format:getTimeStampFormat}
//   )
//   // consolelog({group_all:group_all})
//   const data = useMemo(() => {
//     if(!meta.count) return null
//     const x_values=[...new Set(dataArray.map((item)=>parseTimestamp({value:item[x[0]], pattern:getTimeStampFormat})))].slice(meta.skip, meta.skip+meta.limit) 
//     const datasets = Object.keys(group_all)
//       .map((groupKey, ind) => {

//       const groupData = group_all[groupKey];
//       // if(!index){
//       //   consolelog({groupData})
//       // }
//       let plot_data=[]
//       for (let index = 0; index < x_values.length; index++) {
//         const element = x_values[index];
//         // consolelog({ind})
//         const find_x= groupData.find((groupItem)=>groupItem.x===element)
//         // consolelog({find_x})
//         let push_x=null
//         if(find_x?.y){
//           push_x=convertToDigit(find_x?.y)
//         }
//         else if(index && plot_data[index-1]){
//           push_x=plot_data[index-1]
//         }
//         else{
//           setError('data incomplete for '+groupKey+' - '+element+' , please crosscheck your datasets')
//         }
//         plot_data.push(push_x)
//       }
//       const colors = [
//       'rgba(231, 76, 60, 0.8)',   // Vivid Red
//       'rgba(52, 152, 219, 0.8)',  // Bright Blue
//       'rgba(46, 204, 113, 0.8)',  // Fresh Green
//       'rgba(241, 196, 15, 0.8)',  // Golden Yellow
//       'rgba(155, 89, 182, 0.8)',
//       ]
//       // console.log({plot_data})
//       return {
//         label: groupKey,
//         // datax: groupData.map(item => item[y]),
//         data:plot_data,

//         // borderColor: `hsl(${(ind * 360) / Object.keys(group_all).length}, 70%, 50%)`,
//         borderWidth: 2,
//         backgroundColor:colors[ind]
//         // fill: false,
//         // pointRadius: 0, 
//       };});
//     return {datasets, x_values}
//   },[meta])

//   const options = {
//     elements: {
//       line: { tension: 0 }, 
//     },
//     plugins: {
//       legend: { position: "", display:false },
//     },
//     scales: {
//       x: {
//         title: { display: true, text: x[0] },
//         // stacked: false, 
//       },
//       y: {
//         // beginAtZero: true,
//         // ticks: { stepSize: 1, precision: 0 },
//         title: { display: true, text: y[0] },
        
//       },
//     }
//   };
//    useEffect(()=>{
//     const count=Object.keys(dataArray).length
//     const result=pagination({page:meta.page, count})
//     setMeta({...meta, ...result})
//   },[])
//   if (!data) return null
//   // return null
//   return (
//     <div className="w-full flex justify-center relative">
//         {error?
//           <div className='bg-white flex items-center justify-center absolute w-full top-0 bottom-0 right-0 left-0'>
//               <p className='italic w-[80%]'>{error}</p>
//           </div>
//         :null}
//         {!error?<SlideThrough 
//           onPageClick={(e)=>setMeta({...meta, page:e, skip:(e - 1) * meta.limit})}
//           pages={meta.pages}
//           currentPage={meta.page}
//         />:null}
//         <Line data={{labels:data.x_values, datasets:data.datasets}} options={options}/>
//     </div>
//   );
// }


// // function groupByTimeUnit({data, unit = 'hour', groupBy,x, format,y,z}) {
// //   const {parseTimestamp}= timeStampControl
// //   const grouped = {};
// // }
// function groupByAndFormat({data, groupBy, xKey, yKey, format}) {
//   const grouped = {};
//   const {parseTimestamp}= timeStampControl

//   for (const item of data) {    
//     const group = item[groupBy];
//     const x = item[xKey];
//     const y = item[yKey];
//     const parse_time_value= format ? parseTimestamp({value:x, pattern:format}) : x
//     if (!grouped[group]) grouped[group] = [];
//     grouped[group].push({ x:parse_time_value, y });
//   }

//   return grouped;
// }
// function SlideThrough({onPageClick, pages, currentPage}){
//   const slides=[
//     {style:{},label:'left'},
//     {style:{transform: 'rotate(180deg)'}, label:'right'}
//   ]
//   if(pages<=1) return null
//   return(
//     <div className="flex justify-end items-center justify-between gap-x-6 absolute top-4 right-2">
//       {slides.map(({style, label},ind)=>
//         <button key={ind} style={style} disabled={label==='left'?currentPage===1:currentPage===+pages} 
//           onClick={()=>onPageClick(currentPage+(label==='left'?-1:1))} className="bg-black p-1 rounded-full">
//           <img src="/svg/arrow-back-white.svg"/>
//         </button>      
//       )}
//     </div>
//   )
// }

// function aggregateValues({data, x, y, unit='', aggregation, group_by}) {
//   const grouped = {}; // grouped[timeKey][groupKey] = {total, count}
//   const {convertToDigit, extractDateUnit} = timeStampControl;
//   for (let index = 0; index < data.length; index++) {
//     const item = data[index];
//     const timeKey = extractDateUnit({value: item[x], unit});
//     const groupKey = group_by ? String(item[group_by] || 'N/A') : 'all';
  

//     if (!grouped[timeKey]) grouped[timeKey] = {};
//     if (!grouped[timeKey][groupKey]) {
//       grouped[timeKey][groupKey] = {total: 0, count: 0};
//     }

//     // if (!+item[y]) {
//     //   return {error: `Nothing numerical here ${y}`, groupedData: []};
//     // }

//     grouped[timeKey][groupKey].total += item[y]?convertToDigit(item[y]): 0;
//     grouped[timeKey][groupKey].count += 1;
//   }

//   // flatten into datasets
//   const groupKeys = [...new Set(Object.values(grouped).flatMap(Object.keys))];
//   const datasets = groupKeys.map(gk => ({
//     groupKey: gk,
//     data: Object.entries(grouped).map(([tk, groups]) => ({
//       key: tk,
//       value: aggregation === 'sum' ? groups[gk]?.total || 0
//         : aggregation === 'count' ? groups[gk]?.count || 0
//         : aggregation === 'average' ? (groups[gk]?.count ? groups[gk].total / groups[gk].count : 0)
//         : 0
//     }))
//   }));

//   return {groupedData: datasets};
// }
// export default LinePlot;

import React, { useContext, useEffect, useMemo, useState } from "react";
import { Line } from "react-chartjs-2";
import "chart.js/auto"; // automatically registers Chart.js components
import { API_ENDPOINTS, consolelog, pagination, timeStampControl } from "@/configs";
import { DataRequestContext } from "@/context";

// aggregate: "count"
// description:"Shows how many titles were added to Netflix each month and how this varies by content type."
// group_by: "type"
// plot_type: "area chart,line chart"
// title: "Monthly Additions to Netflix Catalog"
// unit: "months"
// why: "Reveals temporal trends and seasonality in catalog growth."
// x: "date_added"

export default function LineChart(props){
  const {dataArray}= useContext(DataRequestContext)
  const max_limit_of_group_by= props?.group_by?[...new Set(dataArray?.map((row)=>row[props?.group_by]))]:[]
  // console.log({a:[...new Set(dataArray?.map((row)=>row[props?.group_by]))]})
  return(
    <>
    {(max_limit_of_group_by.length && max_limit_of_group_by.length<=21)?
      <LineChartGroupBy {...props}/>:
      <LineChartSingle {...props}/>
    }
    </>
  )
}
function LineChartGroupBy({x,y,group_by, aggregation, title,why, description, unit}) {
    const [meta, setMeta]= useState({page:1, pages:1, limit:unit?20:5})
    const [error, setError]= useState('')

    const {dataArray}= useContext(DataRequestContext)
    const {isTimeStamp,parseTimestamp, getUnit}= timeStampControl

    const {error:data_error,groupedData}=aggregateValues(
      {data:dataArray, x:x[0], y:y[0],unit, aggregation, group_by}
    )
    const data = useMemo(() => {
      if (!groupedData?.length) return null;
      if (data_error) {
        setError(data_error);
        return {labels: 'nan', datasets: []};
      }

      const labels = groupedData[0]?.data
        .slice(meta.skip, meta.skip + meta.limit)
        .map(item => item.key) || [];

      const datasets = groupedData.map(({groupKey, data: groupData}, idx) => ({
        label: groupKey,
        data: groupData.slice(meta.skip, meta.skip + meta.limit).map(item => item.value),
        backgroundColor: API_ENDPOINTS.GET_COLORS[idx],
        fill: false, 
        tension: 0.4,
        borderWidth: 2,
      }));

      return {labels, datasets};
    }, [meta, groupedData]);

  const options = {
          responsive: true,
  maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  useEffect(()=>{
    const count=groupedData?.[0]?.data?.length
    const result=pagination({page:meta.page, count, limit:unit?20:5})
    setMeta({...meta, ...result})
  },[])
  if(!data) return null
  return(
    <div className="w-full relative tablet:overflow-x-hidden tablet:w-[400px]">
        {error?
          <div className='absolute bg-white text-black flex items-center justify-center w-full top-0 bottom-0 right-0 left-0'>
              <p className='italic w-[80%]'>{error}</p>
          </div>
        :null}
        <SlideThrough 
          onPageClick={(e)=>setMeta({...meta, page:e, skip:(e - 1) * meta.limit})}
          pages={meta.pages}
          currentPage={meta.page}
        />
        <div className="tablet:w-[500px] tablet:h-[350px]">
          <Line data={data} options={options} />
        </div>
    </div>
  ) 
}

function LineChartSingle({x,y,group_by, aggregation, title,why, description, unit}) {
    const [meta, setMeta]= useState({page:1, pages:1, limit:unit?20:5})
    const [error, setError]= useState('')

    const {dataArray}= useContext(DataRequestContext)
    const {isTimeStamp,parseTimestamp, getUnit}= timeStampControl

    // const unit= getUnit([title,description,why])
    // const getTimeStampFormat= isTimeStamp(dataArray[0][x[0]])
    const groupedData=aggregateValuesSingle(
      {data:dataArray, x:x[0], y:y[0],unit, aggregation, group_by}
    )
    const data = useMemo(() => {
      if(!meta.count) return null
      // if(data_error){
      //   // console.log({data_error})
      //   setError(data_error)
      //   return {labels:'nan', datasets:[]}
      // }
      const data = {
      
        labels: [...groupedData.slice(meta.skip, meta.skip+meta.limit).map(item=>item.key)],
        datasets: 
        
        [
            {
            label:x[0],
            data: [...groupedData.slice(meta.skip, meta.skip+meta.limit).map(item=>item.value)],
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            fill: false,  // <<< THIS MAKES IT AN AREA CHART
            tension: 0.4,
            borderWidth: 2,
            },
        ],
      };
      return data
    },[meta])
  const options = {
responsive: true,
  maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    interaction: {
      mode: "nearest",
      axis: "x",
      intersect: false,
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };
  useEffect(()=>{
    const count=groupedData?.length
    const result=pagination({page:meta.page, count, limit:unit?20:5})
    setMeta({...meta, ...result})
  },[])
  if(!data) return null
  return(
    <div className="w-full relative">
        {error?
          <div className='absolute bg-white text-black flex items-center justify-center w-full top-0 bottom-0 right-0 left-0'>
              <p className='italic w-[80%]'>{error}</p>
          </div>
        :null}
        <SlideThrough 
          onPageClick={(e)=>setMeta({...meta, page:e, skip:(e - 1) * meta.limit})}
          pages={meta.pages}
          currentPage={meta.page}
        />
        <div className=" tablet:w-[500px] tablet:h-[350px]">
          <Line data={data} options={options} />
        </div>
    </div>
  ) 
}

function group_item({data, x,y='none', group_by}){
  const grouped={}
  const item = data[index];
  const group_by_key= item[group_by]
  if(!grouped[group_by_key]){
    grouped[group_by_key] =[];
  }
  const key = extractDateUnit({value:item[x], unit:''});

  if (!grouped[group_by_key][key]) {
    grouped[group_by_key][key] = { total: 0, count: 0 };
  }
  grouped[group_by_key][key] += convertToDigit(item[y]);
  grouped[key].count += 1;
  
  const aggregated = Object.entries(grouped).map(([key, { total, count }]) => ({
      key,
      ...(
        aggregation === 'sum' ? { value: total }:
        aggregation === 'count'? { value: count }:
        aggregation === 'average' ? { value: total / count }:
        {}
      )   
    }));
  return {groupedData:aggregated.sort((a, b) => b.value - a.value)};
}
function aggregateValuesSingle({data, x, y, unit, aggregation}) {
  const grouped = {};
  const {parseTimestamp, convertToDigit, extractDateUnit, shortMonths, shortWeekdays}= timeStampControl
//   let error= null

  for (let index = 0; index < data.length; index++) {
    //  return {error:'Nothing numerical here ', groupedData:[]}
    const item = data[index]
    const key = unit?extractDateUnit({value:item[x], unit}): item[x];

    if (!grouped[key]) {
        grouped[key] = { total: 0, count: 0 };
      }
      // if(!+item[y]){
      //   // console.log(item[y])
      //   let error='Nothing numerical here '+y+': key'+key
      //   return {error, groupedData:[1]}
      // }
      grouped[key].total += item[y]?convertToDigit(item[y]):1;
      grouped[key].count += 1;
      
    }
    // if(error) return {error, groupedData:[1]}
    const aggregated = Object.entries(grouped).map(([key, { total, count }]) => ({
      key,
      ...(
        aggregation === 'sum' ? { value: total }:
        aggregation === 'count'? { value: count }:
        aggregation === 'average' ? { value: total / count }:
        {}
      )   
    }));
    // console.log({aggregated})
    return unit?.includes('week')?aggregated.sort((a,b)=> shortWeekdays.indexOf(a.key)-shortWeekdays.indexOf(b.key)):unit?.includes('mon')?aggregated.sort((a,b)=> shortMonths.indexOf(a.key)-shortMonths.indexOf(b.key)):aggregated.sort((a, b) => b.value - a.value);
}
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

function aggregateValues({data, x, y, unit='', aggregation, group_by}) {
  const grouped = {}; // grouped[timeKey][groupKey] = {total, count}
  const {convertToDigit, extractDateUnit, shortMonths, shortWeekdays} = timeStampControl;

  for (let index = 0; index < data.length; index++) {
    const item = data[index];
    const timeKey = unit?extractDateUnit({value: item[x], unit}) ?? 'N/B':item[x] ?? 'N/B';
    
    const groupKey = group_by ? String(item[group_by] || 'N/A') : 'all';
  

    if (!grouped[timeKey]) grouped[timeKey] = {};
    if (!grouped[timeKey][groupKey]) {
      grouped[timeKey][groupKey] = {total: 0, count: 0};
    }

    // if (!+item[y]) {
    //   return {error: `Nothing numerical here ${y}`, groupedData: []};
    // }

    grouped[timeKey][groupKey].total += item[y]?convertToDigit(item[y]): 0;
    grouped[timeKey][groupKey].count += 1;
  }

  // flatten into datasets
  const groupKeys = [...new Set(Object.values(grouped).flatMap(Object.keys))];
  const datasets = groupKeys.map(gk => ({
    groupKey: gk,
    data: Object.entries(grouped).map(([tk, groups]) => ({
      key: tk,
      value: aggregation === 'sum' ? groups[gk]?.total || 0
        : aggregation === 'count' ? groups[gk]?.count || 0
        : aggregation === 'average' ? (groups[gk]?.count ? groups[gk].total / groups[gk].count : 0)
        : 0
    }))
  }));
  console.log(unit?.includes('mon'), groupKeys,x,group_by)
  // const groupedData= unit?.includes('day')?datasets.sort((a,b)=> shortWeekdays.indexOf(a.key)-shortWeekdays.indexOf(b.key)):unit?.includes('mon')?datasets.sort((a,b)=> shortMonths.indexOf(a.key)-shortMonths.indexOf(b.key)):datasets

  return {groupedData:datasets};
}
