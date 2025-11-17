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

export default function AreaChart(props){
  const {dataArray}= useContext(DataRequestContext)
  const max_limit_of_group_by= props?.group_by?[...new Set(dataArray?.map((row)=>row[props?.group_by]))]:[]

  return(
    <>
    {(max_limit_of_group_by.length && max_limit_of_group_by.length<=21)?
      <AreaChartGroupBy {...props}/>:
      <AreaChartSingle {...props}/>
    }
    </>
  )
}
function AreaChartGroupBy({x,y,group_by, aggregation, title,why, description, unit}) {
    const [meta, setMeta]= useState({page:1, pages:1, limit:unit?20:5})
    const [error, setError]= useState('')

    const {dataArray}= useContext(DataRequestContext)
    const {isTimeStamp,parseTimestamp, getUnit}= timeStampControl

    // const unit= getUnit([title,description,why])
    // const getTimeStampFormat= isTimeStamp(dataArray[0][x[0]])
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
        backgroundColor: API_ENDPOINTS.GET_COLORS[idx].replace('1)', '0.5)'),
        borderColor:API_ENDPOINTS.GET_COLORS[idx],
        fill: true, 
        tension: 0.4,
        borderWidth: 2,
      }));

      return {labels, datasets};
    }, [meta, groupedData]);

  const options = {
    responsive: true,
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
        <Line data={data} options={options} />
    </div>
  ) 
}

function AreaChartSingle({x,y,group_by, aggregation, title,why, description, unit}) {
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
            label: y[0],
            data: [...groupedData.slice(meta.skip, meta.skip+meta.limit).map(item=>item.value)],
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            fill: true,  // <<< THIS MAKES IT AN AREA CHART
            tension: 0.4,
            borderWidth: 2,
            },
        ],
      };
      return data
    },[meta])
  const options = {
    responsive: true,
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
        <Line data={data} options={options} />
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


  for (let index = 0; index < data.length; index++) {
    //  return {error:'Nothing numerical here ', groupedData:[]}
    const item = data[index]
    const key = unit?extractDateUnit({value: item[x], unit}) ?? 'N/B':item[x] ?? 'N/B';
    
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
    return unit?.includes('day')?aggregated.sort((a,b)=> shortWeekdays.indexOf(a.key)-shortWeekdays.indexOf(b.key)):unit?.includes('mon')?aggregated.sort((a,b)=> shortMonths.indexOf(a.key)-shortMonths.indexOf(b.key)):aggregated.sort((a, b) => b.value - a.value);

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
  const {parseTimestamp, convertToDigit, extractDateUnit, shortMonths, shortWeekdays}= timeStampControl

  for (let index = 0; index < data.length; index++) {
    const item = data[index];
    // if(!item[x]) continue
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

  // const groupedData= unit?.includes('day')?datasets.sort((a,b)=> shortWeekdays.indexOf(a.key)-shortWeekdays.indexOf(b.key)):unit?.includes('mon')?datasets.sort((a,b)=> shortMonths.indexOf(a.key)-shortMonths.indexOf(b.key)):datasets

  return {groupedData:datasets};
}