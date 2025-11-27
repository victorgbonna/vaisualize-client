// ScatterPlot.js
import { API_ENDPOINTS, pagination, timeStampControl } from '@/configs';
import { DataRequestContext } from '@/context';
import React, { Fragment, useContext, useEffect, useMemo, useState } from 'react';
import { Scatter } from "react-chartjs-2";

function ScatterPlot(props){
  return(
    <>
    {props.group_by?
      <ScatterPlotGroupBy {...props}/>:
      <ScatterPlotSingle {...props}/>
    }
    </>
  )

}

function ScatterPlotGroupBy({x,y, group_by}){
  const {dataArray}=useContext(DataRequestContext);
  const [meta, setMeta]= useState({page:1, pages:1, limit:5})
  const {convertToDigit}=timeStampControl
  const colors = API_ENDPOINTS.GET_COLORS

  const datasets_into_objects= dataArray.reduce((acc, row) => {
    const group = row[group_by];
    if (!acc[group]) acc[group] = {
      label: group,
      data: [],
      backgroundColor: colors[Object.keys(acc).length % colors.length],
      pointRadius: 3,
      borderColor: '#0000007a'

    };
    acc[group].data.push(
      { x: convertToDigit(row[x[0]]), y: convertToDigit(row[y[0]]) });
    return acc;
  }, {})
  const datasets = Object.values(
      datasets_into_objects
    )

  const data = useMemo(() => {
    if(!meta.count) return null
    
    const data = {
      datasets:datasets.slice(meta.skip, meta.skip+meta.limit)
    };
  return data
  },[meta])

  const options = {
    // onHover: function (event, activeElements) {
    //   if (activeElements && activeElements.length) {
    //     const datasetIndex = activeElements[0];
    //     const index = activeElements[0]?.index;
    //     console.log({data:dataArray[index]});
    //     // You can show a custom tooltip, highlight, etc.
    //   }
    // },
    // tooltips: { enabled: true },
    responsive: true,
  maintainAspectRatio: false,
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
  useEffect(()=>{
    const count=datasets.length
    const result=pagination({page:meta.page, count, limit:5})
    setMeta({...meta, ...result})
  },[])

  if(!data) return null
  return(
    <div className="w-full relative">
      
      <SlideThrough 
        onPageClick={(e)=>setMeta({...meta, page:e, skip:(e - 1) * meta.limit})}
        pages={meta.pages}
        currentPage={meta.page}
      />
      <div className='absolute w-fit bottom-[55px] right-3 border py-1 px-2 bg-opacity-50 bg-white rounded-md'>
          <div className='flex items-center gap-x-3'>
            <div className='flex items-center gap-x-1'>
              {Object.values(datasets).slice(meta.skip, meta.skip+meta.limit).map((_,index)=> 
                <Fragment key={index}>
                  {colors[index] && colors[index] !=='#e4e0e5'?<div style={{borderRadius:50, width:10, height:10, background:colors[index]}} className='border border-black'>
                
                  </div>:null}
                </Fragment>
              )}
            </div>
            <p className='text-xs'>{group_by}</p>
          </div>

      </div>
      <div className='h-[400px] tablet:h-[350px] tablet:w-[500px]'>
        <Scatter data={data} options={options} />
      </div>
    </div>
  )
}

function ScatterPlotSingle({x,y}){
  const {dataArray}=useContext(DataRequestContext);
  const [meta, setMeta]= useState({page:1, pages:1, limit:5})
  const {convertToDigit}=timeStampControl
  const colors = API_ENDPOINTS.GET_COLORS

  const datasets_into_objects= dataArray.map((row)=>({x:row[x[0]], y:row[y[0]]}))
  const datasets = datasets_into_objects

  const data = useMemo(() => {
    if(!meta.count) return null
    
    const data = {
      datasets:datasets.slice(meta.skip, meta.skip+meta.limit)
    };
  return data
  },[meta])

  const options = {
    // onHover: function (event, activeElements) {
    //   if (activeElements && activeElements.length) {
    //     const datasetIndex = activeElements[0];
    //     const index = activeElements[0]?.index;
    //     console.log({data:dataArray[index]});
    //     // You can show a custom tooltip, highlight, etc.
    //   }
    // },
    // tooltips: { enabled: true },
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
  useEffect(()=>{
    const count=datasets.length
    const result=pagination({page:meta.page, count, limit:5})
    setMeta({...meta, ...result})
  },[])

  if(!data) return null
  return(
    <div className="w-full relative ">
      
      <SlideThrough 
        onPageClick={(e)=>setMeta({...meta, page:e, skip:(e - 1) * meta.limit})}
        pages={meta.pages}
        currentPage={meta.page}
      />
      <div className='absolute w-fit bottom-[55px] right-3 border py-1 px-2 bg-opacity-50 bg-white rounded-md'>
          <div className='flex items-center gap-x-3'>
            <div className='flex items-center gap-x-1'>
              {Object.values(datasets).slice(meta.skip, meta.skip+meta.limit).map((_,index)=> 
                <Fragment key={index}>
                  {colors[index] && colors[index] !=='#e4e0e5'?<div style={{borderRadius:50, width:10, height:10, background:colors[index]}} className='border border-black'>
                
                  </div>:null}
                </Fragment>
              )}
            </div>
            <p className='text-xs'>{group_by}</p>
          </div>

      </div>
      <div className='tablet:h-[350px] tablet:w-[500px] h-[400px]'>
        <Scatter data={data} options={options} />
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

export default ScatterPlot;
// function ScatterPlot({ data }){
//   const chartRef = useRef(null);
//   const [chartKey, setChartKey] = useState(0); 
//   const [myChart, setMyChart] = useState(null);

//   useEffect(() => {
//     const ctx = chartRef.current.getContext('2d');

//     if (myChart) {
//         myChart.destroy();
//     }
//       const datasets = data.datasets.map((dataset, datasetIndex) => {
//         const colors = dataset.data.map((point, pointIndex) => {
//           // Generate color based on x-value (assuming unique x-values)
//           return `${ pointIndex % 3===0?'red':"blue"}`;
//         });

//         return {
//           label: dataset.label,
//           data: dataset.data,
//           backgroundColor: colors,
//           borderColor: 'rgba(0, 0, 0, 1)', // Border color
//           borderWidth: 1, // Border width
//           pointRadius: 5 // Point radius
//         };
//       });


//       const newChart=new Chart(ctx, {
//         type: 'scatter',
//         data: {
//           datasets: datasets
//         },
//         options: {
//             plugins: {
//                 legend: {
//                     display: false
//                 },
//             },
//           scales: {
//             x: {
//                 ticks: {
//                     //option 2, use callback to change labels to empty string
//                     callback: () => ('')
//                   },
//               beginAtZero:true
//             },
//             y: {
//               beginAtZero: true // Ensure y-axis starts at zero
//             }
//           }
//         }
//       });
//       setMyChart(newChart)
//     return () => {
//         if (newChart) {
//             newChart.destroy();
//         }
//     };
//   }, [data, chartKey]);

//   return <canvas ref={chartRef}></canvas>;
// };