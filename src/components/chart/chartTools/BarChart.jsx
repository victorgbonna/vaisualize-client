import { API_ENDPOINTS, consolelog, pagination, timeStampControl } from "@/configs";
import { DataRequestContext } from "@/context";
import { useMemo, useEffect, useState, useContext } from "react";
import { Bar } from "react-chartjs-2";

// aggregate
// : 
// "count"
// description
// : 
// "Counts the number of titles associated with each listed genre label, separated by content type."
// group_by
// : 
// "type"
// plot_type
// : 
// "bar chart"
// title
// : 
// "Distribution Across Genre Labels"
// why
// : 
// "Identifies the most dominant genres and how they differ between movies and TV shows."
// x
// : 
// "listed_in"
export default function BarChart(props){
  const max_limit_of_group_by= props?.group_by?[...new Set(props?.data?.map((row)=>row[group_by]))]:[]
  return(
    <div>
    {props?.group_by?
      <BarChartGroupBy {...props}/>:
      <BarChartSingle {...props}/>
    }
    </div>
  )
}
function BarChartGroupBy({x, y, aggregation, group_by, unit}) {
    const [meta, setMeta]= useState({page:1, pages:1, limit:unit?20:5})
    const [error, setError]= useState('')

    const {dataArray}= useContext(DataRequestContext)

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
        backgroundColor: API_ENDPOINTS.GET_COLORS.slice(4)[idx],
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
      legend: { position: "top", display: false },
      title: { display: false, text: "Monthly Sales" },
    },
    scales: {
      x: {
        
      },
      y: {
       title: { display: true, text: y[0]  }
      },
    },
  };
  useEffect(()=>{
    const count=groupedData?.[0]?.data?.length
    const result=pagination({page:meta.page, count, limit:4})
    setMeta({...meta, ...result})
  },[])
  if(!data) return null
  return (
    <div className="w-full relative tablet:h-full">
      <SlideThrough 
          onPageClick={(e)=>setMeta({...meta, page:e, skip:(e - 1) * meta.limit})}
          pages={meta.pages}
          currentPage={meta.page}
        />
      <div className="h-[400px] tablet:w-[500px] tablet:h-[350px]">
      {data?<Bar data={data} options={options} />:null}
      </div>
    </div>
  )
}
function BarChartSingle({x, y, aggregation, unit}) {
  const [meta, setMeta]= useState({page:1, pages:1, limit:4})
  const {dataArray}=useContext(DataRequestContext);
  
  const groupedData=aggregateValuesSingle({data:dataArray, x:x[0], y:y[0], aggregation, unit})
  const colors = [
      'rgba(231, 76, 60, 0.8)',   // Red
        'rgba(52, 152, 219, 0.8)',  // Blue
        'rgba(46, 204, 113, 0.8)',  // Green
        'rgba(241, 196, 15, 0.8)',  // Yellow
        'rgba(155, 89, 182, 0.8)',  // Purple
        'rgba(230, 126, 34, 0.8)',  // Orange
        'rgba(26, 188, 156, 0.8)'
  ]
  // consolelog({groupedData:groupedData.slice(meta.skip, meta.skip+meta.limit)})
  const data= useMemo(()=>{
    if(!meta.count) return null
    // if( groupedData.length===0) return null
    const data = {
      
      labels: [...groupedData.slice(meta.skip, meta.skip+meta.limit).map(item=>item.key)],
      datasets: [
        {
          label: y[0],
          data: [...groupedData.slice(meta.skip, meta.skip+meta.limit).map(item=>item.value)],
          backgroundColor: colors,
        },
        // {
        //   label: 'Overall',
        //   data: [...groupedData2.slice(meta.skip, meta.skip+meta.limit).map(item=>item.value)],
        //   backgroundColor: "red",
        // },
      ],
      
    };
    return data
  }, [meta])
  const options = {
responsive: true,
  maintainAspectRatio: false,
    plugins: {
      legend: { position: "top", display: false },
      title: { display: false, text: "Monthly Sales" },
    },
    scales: {
      x: {
        
      },
      y: {
       title: { display: true, text: y[0]  }
      },
    },
  };

  useEffect(()=>{
    const count=groupedData.length
    const result=pagination({page:meta.page, count, limit:4})
    setMeta({...meta, ...result})
  },[])
  if(!data) return null
  return (
    <div className="w-full relative tabet:h-full">
      <SlideThrough 
          onPageClick={(e)=>setMeta({...meta, page:e, skip:(e - 1) * meta.limit})}
          pages={meta.pages}
          currentPage={meta.page}
        />
      <div className="h-[400px] tablet:w-[500px] tablet:h-[350px]">
        {data?<Bar data={data} options={options} />:null}
      </div>

    </div>
  )
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
  // const groupedData= unit?.includes('day')?datasets.sort((a,b)=> shortWeekdays.indexOf(a.key)-shortWeekdays.indexOf(b.key)):unit?.includes('mon')?datasets.sort((a,b)=> shortMonths.indexOf(a.key)-shortMonths.indexOf(b.key)):datasets

  return {groupedData:datasets};
}

 function aggregateValuesSingle({data, x, y, aggregation, unit}) {
    let grouped=[]
    const {convertToDigit, extractDateUnit, shortMonths, shortWeekdays}= timeStampControl
    
    for (let index = 0; index < data.length; index++) {
      const item = data[index];
      
          const key = unit?extractDateUnit({value:item[x], unit}): item[x];

      if (!grouped[key]) {
        grouped[key] = { total: 0, count: 0 };
      }
      grouped[key].total += convertToDigit(item[y]);
      grouped[key].count += 1;
      
    }

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