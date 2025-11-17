import { API_ENDPOINTS, consolelog, pagination } from "@/configs";
import { DataRequestContext } from "@/context";
import { useMemo, useState, useEffect, useContext } from "react";
import { Radar } from "react-chartjs-2";


export default function RadarChart({x,y:z}) {
  
    const [meta, setMeta]= useState({page:1, pages:1, limit:4})
    // consolelog({radar:z})
      
    const {dataArray}=useContext(DataRequestContext);

    const options = {
        responsive: true,
        scales: {
        r: {
          pointLabels: {
            font: {
              size: 13, 
            },
            padding: 10, 
            display: true,
          },
        },
      },
      layout: {
        padding: 10, 
      },
    };
    // const colors = [
    //     'rgba(231, 76, 60, 0.3)',   // Red
    //     'rgba(52, 152, 219, 0.3)',  // Blue
    //     'rgba(46, 204, 113, 0.3)',  // Green
    //     'rgba(241, 196, 15, 0.3)',  // Yellow
    //     'rgba(155, 89, 182, 0.3)',  // Purple
    //     'rgba(230, 126, 34, 0.3)',  // Orange
    //     'rgba(26, 188, 156, 0.3)' 
    // ];
    const colors= API_ENDPOINTS.GET_COLORS

    const all_zlabels= [...new Set(dataArray.map((item)=>item[z]))];

    const data= useMemo(()=>{
        if(!meta.count) return null
        
        const zLabels= all_zlabels.slice(meta.skip, meta.skip+meta.limit)
        let isAverageCount=false

        const data = zLabels?.map((zValue,index)=>{
            const find_z_in_data=dataArray?.filter((dataRow)=>dataRow[z]===zValue)
            let z_actual_value_in_data=null
            if(find_z_in_data.length<=1){
              z_actual_value_in_data=find_z_in_data[0]
            }
            else{
              z_actual_value_in_data= find_z_in_data.reduce((acc, a)=>acc+(a??0),0)
              if (!isAverageCount){
                isAverageCount=true
              }
            }
            // let z_avg_value_in_data= find_z_in_data.length===1?find_z_in_data[0]:find
            return (
                {
                  label: zValue,
                  data:x[0]?.map((ability_key)=>+find_z_in_data[ability_key] ?? 0),
                  backgroundColor: colors[index % colors.length].replace('1)', '0.3)'),
                  borderColor: colors[index % colors.length],
                  borderWidth: 2,
                }
            )
        })
        // consolelog({x:x[0]?.xProp, zLabels, find_z_in_data:find_z_in_data[0]})
        
        // {
        // labels: x[0]?.xData,
        // datasets: [
        //     {
        //     label: "Athlete A",
        //     data: [6, 8, 7, 5, 9],
        //     backgroundColor: "rgba(54, 162, 235, 0.2)",
        //     borderColor: "rgba(54, 162, 235, 0.3)",
        //     borderWidth: 2,
        //     },
        //     {
        //     label: "Athlete B",
        //     data: [8, 5, 6, 9, 7],
        //     backgroundColor: "rgba(255, 99, 132, 0.2)",
        //     borderColor: "rgba(255, 99, 132, 0.3)",
        //     borderWidth: 2,
        //     },
        // ],
        // };
        // consolelog({datasets:data, labels:x[0]?.xProp})
        return {datasets:data, labels:x[0].map((x)=>x+(isAverageCount?'(mean v.)':''))}
    },[meta])

    useEffect(()=>{
        const count=all_zlabels.length
        
        const result=pagination({page:meta.page, count, limit:4})
        setMeta({...meta, ...result})
    },[])
    if (!data) return null
    return (
    <div className="flex justify-center w-full relative">
        <SlideThrough 
          onPageClick={(e)=>setMeta({...meta, page:e, skip:(e - 1) * meta.limit})}
          pages={meta.pages}
          currentPage={meta.page}
        />
        <div className="h-full w-full flex justify-center">
            <div className="w-[400px] tablet:h-fit">
                <Radar data={data} options={options} />
            </div>
        </div>

    </div>
)}
function SlideThrough({onPageClick, pages, currentPage}){
    consolelog({pages, currentPage})
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
    // const data = {
    // labels: ["Speed", "Agility", "Strength", "Stamina", "Skill"],
    // datasets: [
    //     {
    //     label: "Athlete A",
    //     data: [6, 8, 7, 5, 9],
    //     backgroundColor: "rgba(54, 162, 235, 0.2)",
    //     borderColor: "rgba(54, 162, 235, 0.3)",
    //     borderWidth: 2,
    //     },
    //     {
    //     label: "Athlete B",
    //     data: [8, 5, 6, 9, 7],
    //     backgroundColor: "rgba(255, 99, 132, 0.2)",
    //     borderColor: "rgba(255, 99, 132, 0.3)",
    //     borderWidth: 2,
    //     },
    // ],
    // };

function buildRadarData({ dataArray, columns, group_by, aggregate = "average" }) {
  // If no group_by, treat as single group
  const groups = group_by
    ? [...new Set(dataArray.map((row) => row[group_by]))]
    : ["All"];

  const labels = columns; // each numerical column is one axis

  // Initialize buckets: buckets[group][axis] = array of values
  const buckets = {};
  groups.forEach((g) => {
    buckets[g] = columns.map(() => []);
  });

  // Fill buckets
  dataArray.forEach((row) => {
    const group = group_by ? row[group_by] : "All";
    columns.forEach((col, idx) => {
      const value = Number(row[col]) || 0;
      buckets[group][idx].push(value);
    });
  });

  // Aggregation function
  const computeAggregate = (arr) => {
    if (aggregate === "count") return arr.length;
    const total = arr.reduce((a, b) => a + b, 0);
    if (aggregate === "total") return total;
    if (aggregate === "average") return arr.length ? +(total / arr.length).toFixed(2) : 0;
    return arr.length;
  };

  // Build datasets for Chart.js
  const datasets = groups.map((g, i) => ({
    label: g,
    data: buckets[g].map((arr) => computeAggregate(arr)),
    backgroundColor: `rgba(${50 + i * 40}, ${120 + i * 30}, 200, 0.2)`,
    borderColor: `rgba(${50 + i * 40}, ${120 + i * 30}, 200, 1)`,
    borderWidth: 1,
  }));

  return { labels, datasets };
}
