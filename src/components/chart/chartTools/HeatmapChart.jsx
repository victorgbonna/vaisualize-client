
// import { HeatmapComponent, Inject, Tooltip } from '@syncfusion/ej2-react-Heatmap';

import { consolelog, pagination } from "@/configs";
import { DataRequestContext } from "@/context";
import { useContext, useEffect, useState } from "react";

function ExHeatmapChart({x,y}){
  let HeatmapData= [
    [52, 65, 67, 45, 37, 52],
    [68, null, 63, 51, 30, 51],
    [7, 16, 47, null, 88, 6],
    [66, 64, null, 40, 47, 41],
    [14, 46, 97, 69, null, 3],
    [54, 46, 61, 46, null, 39]

  ];
  return (
   <div className="overflow-x-auto">
        <table className={` border-separate border-spacing-2`}>
            <thead>
            <tr className="text-sm">
                <th className="font-medium">Interval</th>
                {x.map((num_cols,ind)=>
                    <th className="min-w-[50px] font-semibold text-gray-600 text-xs" key={ind}>{'wk-'+(num_cols)}</th>
                )}
                
            </tr>
            </thead>
            <tbody>
            {x.map((num_cols,ind)=>{
                return(
                <tr key={ind}>
                    <td className="text-gray-600 text-xs">{num_cols}</td>
                    {x.map((num_cols_2,j)=>{
                        const value = correlationMatrix[i][j];
                        const intensity = Math.round(Math.abs(value) * 900);
                        return(
                            <td 
                            style={{
                                backgroundColor:
                                intensity==10?"rgb(220 252 231)":
                                intensity==20?"rgb(187 247 208)":
                                intensity==30?"rgb(134 239 172)":
                                intensity==40?"rgb(74 222 128)":
                                intensity==50?"rgb(34 197 94)":
                                intensity==60?"rgb(22 163 74)":
                                intensity==70?"rgb(21 128 61)":
                                intensity==80?"rgb(22 101 52)":
                                intensity==90?"rgb(20 83 45)":
                                "#ffffff"
                            }}
                            className={`text-sm border border-slate-300 text-center h-12 text-black`} 
                            key={num_cols_2}>
                                {value.toFixed(2)}
                            </td>
                        )
                    }

                    )}
                    
                </tr>)
                })}
            </tbody>
        </table>
    </div>
  );
}
function HeatmapChart({x,y}){
    const [meta, setMeta]= useState({page:1, pages:1, limit:4})
    const {dataArray}= useContext(DataRequestContext)
    const [labels_max, setLabelsMax]=useState({})

    const {result:heatmap_x_and_y, isAverageCount}= groupByXandCollectY(
        {data:dataArray, xKeys:x[0], yKey:y[0], sorted_key:null});
    
    
    useEffect(()=>{
      let labels_max_const={}
      for (const col of x[0]){
        const max=Math.max(...dataArray.map((item)=>+item[col] ?? 0))
        const min= Math.min(...dataArray.map((item)=>+item[col] ?? 0))
        labels_max_const[col]= [max,min]    
      }
      setLabelsMax(labels_max_const)

      const count=Object.keys(heatmap_x_and_y)?.length
      const result=pagination({page:meta.page, count})
      setMeta({...meta, ...result})
        
    },[])

    // const labels_max=y[0].map((col)=>{
    //     return({
    //         col,
    //         max: Math.max(...dataArray.map((item)=>+item[col] ?? 0))
    //     })
    // })

    console.log(heatmap_x_and_y)
    const heatmap_color='rgba(21, 105, 56, '


    return (
    <div className="  pt-4 border rounded-lg overflow-x-auto overflow-y-auto h-[300px] w-full relative pt-6">
        <SlideThrough 
          onPageClick={(e)=>setMeta({...meta, page:e, skip:(e - 1) * meta.limit})}
          pages={meta.pages}
          currentPage={meta.page}
        />
        <table className={`border-collapse border-spacing-2 w-full`}>
            <thead>
                <tr className="text-sm">
                    <th className="h-fit w-[150px] px-4 py-2 text-gray-600 text-xs font-medium"><p className="underline">{y}</p><p>{'attributes'+isAverageCount?'(mean val)':''}</p></th>
                    {Object.keys(heatmap_x_and_y)
                        .slice(meta.skip, meta.skip+meta.limit).map((row,ind)=>
                        <th className="mx-2 px-4 py-2 font-semibold text-gray-600 text-[13px]" key={ind}>{row}</th>
                    )}
                </tr>
            </thead>
            <tbody>
            {x[0].map((num_entry,ind)=>{
                // return null
                return(
                <tr key={ind} className="w-full">
                    <td className="text-gray-600 text-sm text-center">
                      <p 
                      // style={{
                      //   overflowWrap: 'break-word', wordBreak: 'break-all'
                      // }} 
                      className="p">{num_entry} 
                      <span className="text-[11px] italic">
                        {`(max-${labels_max?.[num_entry]?.[0]})`}
                      </span></p>
                    </td>
                    {Object.values(heatmap_x_and_y).
                        slice(meta.skip, meta.skip+meta.limit)
                        .map((heat_pack,j)=>{
                            const max= labels_max[num_entry][0];
                            const value=heat_pack[0][num_entry]
                            const intensity = value?Math.round((value/max) * 10)/10:0
                        
                        return(
                            <td 
                            style={{
                                backgroundColor:
                                // intensity<=0.2?'rgba(21, 105, 56, 0.2)':
                                // intensity<=0.3?'rgba(21, 105, 56, 0.3)':
                                // intensity<=0.4?'rgba(21, 105, 56, 0.4)':
                                // intensity<=0.5?'rgba(21, 105, 56, 0.5)':
                                // intensity<=0.6?'rgba(21, 105, 56, 0.6)':
                                // intensity<=0.7?'rgba(21, 105, 56, 0.7)':
                                // intensity<=0.8?'rgba(21, 105, 56, 0.8)':
                                // intensity<=0.9?'rgba(21, 105, 56, 0.9)':
                                // intensity<=1?'rgba(21, 105, 56, 1)'
                                 // intensity<=20?"rgb(220 252 23)":
                                // intensity<=30?"rgb(187 247 208)":
                                // intensity<=40?"rgb(134 239 172)":
                                // intensity<=50?"rgb(74 222 128)":
                                // intensity<=60?"rgb(34 197 94)":
                                // intensity<=70?"rgb(22 163 74)":
                                // intensity<=80?"rgb(21 128 61)":
                                // intensity<=90?"rgb(22 101 52)":
                                // intensity<=100?"rgb(20 83 45)":
                                !value?"#ffffff":
                                intensity?heatmap_color+''+intensity+')'
                               
                                :"#ffffff"
                            }}
                            className={`text-white text-sm font-bold border border-slate-300 text-center h-8 text-black`} 
                            key={j}>
                                {heat_pack[0][num_entry]}
                            </td>
                        )
                    }

                    )}
                    
                </tr>)
                })}
            </tbody>
        </table>
    </div>
  );
}
function groupByXandCollectY({data, xKeys, yKey, sorted_key=null, aggregate='average'}) {
  // const sorted_data = Array.isArray(data) ? data.slice() : [];
  // // preserve previous sort behavior if requested
  // sorted_data.sort((a, b) => {
  //   if (!sorted_key) return (b[xKeys[0]] || 0) - (a[xKeys[0]] || 0);
  //   return (b[sorted_key] || 0) - (a[sorted_key] || 0);
  // });
  const rows = data;
  const sumsByGroup = {};
  const countsByGroup = {};
  let isAverageCount=false

  for (const row of rows) {
    const group = row?.[yKey] ?? 'unknown';
    if (!sumsByGroup[group]) {
      sumsByGroup[group] = {};
      countsByGroup[group] = {};
    }
    for (const xKey of xKeys) {
      const raw = row?.[xKey];
      const num = Number(raw);
      // treat non-numeric as 0 but still count? here we skip non-finite values
      if (!Number.isFinite(num)) continue;
      sumsByGroup[group][xKey] = (sumsByGroup[group][xKey] || 0) + num;
      if(!isAverageCount && !!countsByGroup[group][xKey]){
        isAverageCount=true
      }
      countsByGroup[group][xKey] = (countsByGroup[group][xKey] || 0) + 1;
    }
  }
  const result = {};
  for (const [group, sumsObj] of Object.entries(sumsByGroup)) {
    const out = {};
    for (const xKey of Object.keys(sumsObj)) {
      const sum = sumsObj[xKey] || 0;
      const count = countsByGroup[group]?.[xKey] || 0;
      if (aggregate === 'average' || aggregate === 'mean') {
        out[xKey] = count ? Math.round((sum / count) * 100) / 100 : 0;
      } else {
        out[xKey] = Math.round(sum * 100) / 100;
      }
    }
    result[group] = [out]; // keep existing API shape: each group -> array with object
  }
  return {result, isAverageCount};
}

function SlideThrough({onPageClick, pages, currentPage}){
  const slides=[
    {style:{},label:'left'},
    {style:{transform: 'rotate(180deg)'}, label:'right'}
  ]
  if(pages<=1) return null
  return(
    <div className="flex justify-end items-center justify-between gap-x-6 absolute top-2 right-1">
      {slides.map(({style, label},ind)=>
        <button key={ind} style={style} disabled={label==='left'?currentPage===1:currentPage===+pages} 
          onClick={()=>onPageClick(currentPage+(label==='left'?-1:1))} className="bg-black p-1 rounded-full">
          <img src="/svg/arrow-back-white.svg"/>
        </button>      
      )}
    </div>
  )
}

export default HeatmapChart;
