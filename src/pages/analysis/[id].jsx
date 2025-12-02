"use client";
import { Fragment, useCallback, useContext, useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import ChartLayout from "@/components/default";

import {HistogramGrouped, BoxPlot, ViolinPlot, ScatterPlot, BubbleChart, BarChart, HeatmapChart,RadarChart, AreaChart, LinePlot, PieChart} from "@/components/chart/chartTools";
import { DataFetch, SelectOption } from "@/components";
import { API_ENDPOINTS, commafy, consolelog, timeStampControl } from "@/configs";
import { DataRequestContext, UseDataRequestContextComponent } from "@/context";
import { useQuery } from "@tanstack/react-query";
import { useFileInput, useHttpServices } from "@/hooks";
import { useRouter } from "next/router";
import { ModalLayout } from "@/components/modal";

export default function ChartAnalysis() {
    return (
        <UseDataRequestContextComponent>
            <AnalysisC/>
        </UseDataRequestContextComponent>
    )
}



function AnalysisC() {
    const router = useRouter()
    // const dataList = data_json;
    const {setDataArray:setData, setVisualsSugg, setDataMetrics:setMetrics}= useContext(DataRequestContext)
    
    const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;
    const [timeLeft, setTimeLeft] = useState('');
    const [openModal, setOpenModal]= useState('')

    const {getData, getDataWithoutBaseUrl}= useHttpServices()
    const getARequest=async()=>{    
        return await getData({path:API_ENDPOINTS.GET_REQUEST(router?.query?.id)})
    }
    // 1min:14 mark
    const {
            isLoading:reqLoading, 
            data:req_data, 
            error, 
            isError:isReqError}= useQuery(
        {
        queryKey:['a-request', router?.query?.id],
        queryFn:()=>getARequest(),
        refetchOnWindowFocus: false,
        retry:false, enabled:!!router.isReady
        }
    )

    const read_into_csv=async(data)=>{
        fetch(data?.file_url?.[0])
        .then((res) => res.text())
        .then((csvText) => {
            const result = Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
            });
            // console.log({chatGPT_response:data.chatGPT_response})
            const {visuals, metrics}= data.chatGPT_response[0].visuals_obj ?? data.chatGPT_response[0]
            // const {chatGPT_response:visuals_sugg[0].visuals_obj, ...request}= data
            
            setData(result.data);
            setMetrics(metrics)
            setVisualsSugg(visuals)
            return
        })

    }
    const read_into_file = async (data) => {
        const fileUrl = data?.file_url?.[0];
        if (!fileUrl) return;

        const lower = fileUrl.toLowerCase();

        // ========= CSV =========
        if (lower.endsWith(".csv")) {
            const res = await fetch(fileUrl);
            const text = await res.text();

            const result = Papa.parse(text, {
                header: true,
                skipEmptyLines: true,
            });

            const { visuals, metrics } =
                data.chatGPT_response[0].visuals_obj ??
                data.chatGPT_response[0];

            setData(result.data);
            setMetrics(metrics);
            setVisualsSugg(visuals);

            return;
        }

        if (lower.endsWith(".xlsx") || lower.endsWith(".xls")) {
            const res = await fetch(fileUrl);
            const buffer = await res.arrayBuffer();

            const workbook = XLSX.read(buffer, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            const result = XLSX.utils.sheet_to_json(worksheet, {
                defval: "",
                raw: false,
            });

            const { visuals, metrics } =
                data.chatGPT_response[0].visuals_obj ??
                data.chatGPT_response[0];

            setData(result);
            setMetrics(metrics);
            setVisualsSugg(visuals);

            return;
        }

        console.warn("Unsupported file type");
    };
    useEffect(()=>{
        if(!req_data) return
        
        read_into_file(req_data?.request)
        const created = new Date(req_data?.request?.createdAt).getTime();
        const expiry = created + 2 * 24 * 60 * 60 * 1000
        
        const tick = () => {
            const remaining = expiry - Date.now();
            setTimeLeft(remaining);
        };

        tick(); 

        const interval = setInterval(tick, 1000);

        setTimeout(() => {
            setOpenModal({
                label:req_data?.request?.title,
                id:req_data?.request?._id
            })
        }, 3000);

        return () => clearInterval(interval);       
    },[req_data])

    const formatTime = (ms) => {
        if(!ms) return null
        const totalSeconds = Math.floor(ms / 1000);
        const days = Math.floor(totalSeconds / (24 * 3600));
        const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    };
    
    return (
    <>
        <DataFetch
            isLoading={reqLoading} 
            isError={isReqError} 
            errorMsg={error?.message}
            isEmpty={false}
        >
            <div>
                <div style={{
                    boxShadow: '1px 0px 50px -8px rgba(24, 24, 27, 0.1)'
                }} className="flex tablet:flex-col items-center justify-between rounded-b-md sticky tablet:relative tablet:w-full top-0 z-[99] border w-full left-0 right-0 h-fit bg-white py-7 px-10 tablet:px-4">
                    <div>
                        <h1 className="text-2xl font-semibold text-[#5345E6]">{req_data?.request?.title}</h1>
                        {/* <p className="text-gray-700 text-sm tablet:mt-2">This visuals expires in {formatTime(timeLeft)} — Subscribe for premium to cancel</p> */}
                    </div>
                    <div className="gap-x-[4px] relative tablet:mt-6 flex items-center">
                        <div className="flex-col flex justify-end gap-y-[6px]">
                            <p className="text-sm">This visual expires in</p>
                            <p className="text-[#C40404]">{formatTime(timeLeft)}</p>
                        </div>
                        <button className="p2 px-10 rounded-lg py-3">
                            <div className="mb-[3px] gap-x-2 flex items-center">
                                <img src="/svg/metric/star.svg" alt="star" />
                                <p className="text-white font-semibold">Get Premium</p>
                            </div>
                            <p>{'(To keep your visual forever)'}</p>
                        </button>
                        <div
                            className="absolute right-[-20px] top-[-20px] h-[40px] w-[40px] flex items-center justify-center">
                            <img src="/svg/discount.svg" className="absolute inset-0 h-full w-full "/>
                            <div className="relative z-2 text-center text-white">
                                <p className="mb-[-10px] text-sm font-semibold">80%</p>
                                <small className="text-[9px] font-medium">OFF</small>
                            </div>

                        </div>
                    </div>

                </div>
                <div className="px-8 py-7 bg-g tablet:px-4" >
                    <p className="w-[90%] tablet:text-sm tablet:w-[95%]">{req_data?.request?.description}</p>
                    <div className="mt-11 mb-20">
                        <CardBox/>
                    </div>
                    <div>
                        <VisualCharts/>
                    </div>
                </div>
            </div>

        </DataFetch>
        {openModal}
    </>
  );
}

function CardBox(){
    const {dataArray:data, dataMetrics:metrics}= useContext(DataRequestContext)
    const {isDate, convertToDigit}= timeStampControl
    // console.log({metrics})
    return(
    <div className="grid grid-cols-5 tablet:grid-cols-1 gap-x-8 gap-y-14 justify-between items-center number_card">
        {metrics?.map(({label, aggregate, column},ind)=>
            {
                let aggregate_value=[]
                let aggregate_icon= API_ENDPOINTS.METRIC_ICONS.find(({match})=>label?.includes(match)) || {match:'', value:'chart.svg'}
                if(aggregate.includes('count')){
                    let values= data.map((row)=>row[column])?.filter((x)=>!!x)
                    aggregate_value=[[...new Set(values)].length]
                }
                else if (aggregate.includes('sum')){
                    let sum_aggregate_values = data.reduce(
                        (acc, item) => acc + (convertToDigit(item[column]) || 0), 0
                    );
                    aggregate_value= [sum_aggregate_values]
                }
                else if (aggregate.includes('average')){
                    let sum_aggregate_values = data.reduce(
                        (acc, item) => acc + (convertToDigit(item[column]) || 0),0
                    );
                    // console.log({column,sum_aggregate_values,data:data.length})
                    aggregate_value= [Math.round((sum_aggregate_values/data.length) *100)/100]
                }
                else if (aggregate.includes('mode')){
                    const freq = {};
                    let max = 0;
                    let values= data.map((row)=>row[column])?.filter((x)=>!!x)

                    for (const num of values) {
                        freq[num] = (freq[num] || 0) + 1;
                        if (freq[num] > max) max = freq[num];
                    }

                    aggregate_value= Object.keys(freq)
                        .filter(n => freq[n] === max)
                }
                else if (aggregate.includes('min')){
                    const date_type= isNaN(parseInt(data[0][column]))? isDate(data[0][column]):false
                    
                    let values= data.map(
                        (row)=>date_type?row[column]:convertToDigit(row[column]))?.filter((x)=>!!x)
                    if(date_type){
                        aggregate_icon=API_ENDPOINTS.METRIC_ICONS.find(({match})=>match==='Mindate')
                        aggregate_value=[minmaxDate({values,aggregate:'max'})]
                    }
                    else{
                        aggregate_icon=API_ENDPOINTS.METRIC_ICONS.find(({match})=>match==='Min')
                        aggregate_value=[Math.min(...values)]
                    }
                }
                else if (aggregate.includes('max')){
                    const date_type= isNaN(parseInt(data[0][column]))? isDate(data[0][column]):false
                    let values= data.map(
                        (row)=>date_type?row[column]:convertToDigit(row[column]))?.filter((x)=>!!x)
                    if(date_type){
                        aggregate_icon=API_ENDPOINTS.METRIC_ICONS.find(({match})=>match==='Maxdate')
                        aggregate_value=[minmaxDate({values,aggregate:'max'})]
                    }
                    else{
                        aggregate_icon=API_ENDPOINTS.METRIC_ICONS.find(({match})=>match==='Max')
                        aggregate_value=[Math.max(...values)]
                    }
                }
                return(
                <Fragment key={ind}>
                    <div className="py-4 px-5 shadow-lg bg-white rounded-lg  tablet:py-10" style={{
                        borderColor:'rgba(56, 56, 56, 0.12)',
                        borderWidth:'1.5px'
                    }}>
                        <div className="p-2 p1 rounded-md w-fit mb-2">
                            <img style={aggregate_icon?{}:{visibility:'hidden'}} src={"/svg/metric/"+(aggregate_icon?.value || 'chart.svg')} alt={aggregate_icon?.value} className="w-5 h-5"/>
                        </div>
                        <p className="capitalize text-[13px] mb-[6px] text-[#1D1E25] tablet:text-base">{label}</p>
                        <p className="text-3xl font-semibold">
                            {commafy(aggregate_value[0])}
                            {!aggregate_value.length?<span className="text-sm text-gray-600">+</span>:<></>}
                        </p>
                    </div>
                </Fragment>
            )}
        )}    
    </div>
)}
function minmaxDate({values,aggregate}) {
  const isYearFormat = /^\d{4}$/.test(values[0]);
  if (isYearFormat) {
    return Math[aggregate](...values.map(Number));
  }

  const timestamps = values.map(v => new Date(v));
  const minmaxTs = Math[aggregate](...timestamps);

  return new Date(minmaxTs).toLocaleDateString();
}
function ExCardBox(){
    return null
    return(
        <>
        <div>
            <p className="uppercase">{"Total Entries"}</p>
            <p>{data.length}</p>
        </div>
        {Object.entries(stats.unique).map(([col, count]) => (
            <div key={`unique-${col}`}>
            <p className="uppercase">{`Total '${col}'`}</p>
            <p>{count}</p>
            </div>
        ))}


        {Object.entries(stats.categorical).map(([col, count]) => (
            <div key={`cat-${col}`}>
            <p className="uppercase">{`Total '${col}'`}</p>
            <p>{count}</p>
            </div>
        ))}

        {Object.entries(stats.numerical).map(([col, avg]) => (
            <div key={`num-${col}`}>
            <p className="uppercase">{`Average '${col}'`}</p>
            <p>{avg}</p>
            </div>
        ))}

        {Object.entries(stats.date).map(([col, { years, months }]) => (
            <div key={`date-${col}`}>
            <p className="uppercase">{`Total '${col}'`}</p>
            <p>{`${years} years (${months} months)`}</p>
            </div>
        ))}
        </>
    )
}
function VisualCharts(){
    const {visualsSugg:visuals_sugg}= useContext(DataRequestContext)
    // if(!data.length, !chartType) return null
    // console.log({visuals_sugg})
    return(
        <section className="grid grid-cols-2 tablet:grid-cols-1 gap-x-5 gap-y-8 w-full items-start">
           {visuals_sugg?.map(({plot_type, title,unit, description,x,y,group_by,z, aggregate, why},ind)=>{
                    return(
                        <Fragment key={ind}>
                            <ChartComponent 
                                plot_type={plot_type} title={title}
                                x={x} y={y} z={z}
                                description={description}
                                group_by={group_by}
                                aggregate={aggregate}
                                unit={unit}
                                why={why}
                            />
                        </Fragment>
                    )
                }

            )} 
        </section>
    )
}

function ChartComponent({plot_type, x, z=null, y, why, title,unit,aggregate, description, group_by=null}){
    const [chartType, setChartType]= useState(plot_type.split(',')[0])
    const [mount, setMount]= useState(false)
    const charts_done=[
        'area chart',
        'line chart',
        'histogram', 
        'box plot', 
        'violin plot', 
        'scatter plot', 
        'bubble chart',
        'bar chart',
        'pie chart',
        'radar chart',
        'matrix heatmap'
    ]
    const componentMap = {
        'histogram': HistogramGrouped,
        'box plot': BoxPlot,
        'violin plot': ViolinPlot, 
        'scatter plot': ScatterPlot,
        'radar chart': RadarChart, 
        'bubble chart': BubbleChart,
        'matrix heatmap':HeatmapChart,   
        'area chart': AreaChart, 
        'line chart': LinePlot,
        'pie chart':PieChart, 
        // 'chloropleth map': ChloroplethMap, 
        'bar chart': BarChart, 
        // 'stacked bar chart': StackedBarChart,
        // 'grouped bar chart':GroupedBarChart, 'swarm plot': SwarmPlot
    };
    const Chart= useMemo(()=>{
        return componentMap[chartType]
    },[chartType])
    // if(!mount) return null
    if(!charts_done.includes(chartType)) return null 
    return(
        <div className="relative bg-white rounded-lg shadow-lg py-4 px-3 w-full relative tablet:overflow-x-auto"
        style={{
            borderColor:'rgba(56, 56, 56, 0.12)',
            borderWidth:'1.5px'
        }}
        >
            <div className="relative mb-4 flex justify-between items-center">
                <div className="flex relative items-center gap-x-2">
                    <p className="font-semibold">{title}</p>
                    {plot_type.split(',').length>1?
                        <div className="">
                            <SelectOption options={[...plot_type.split(',')].map((x)=>x.trim())}
                                label={'Switch Chart'} value={chartType}
                                onChange={(e)=>setChartType(e)}
                            />
                        </div>
                        :null
                    }
                </div>
                <button onClick={()=>setMount(!mount)}>
                    <img src="/svg/info.svg"/>
                </button>
                {mount?
                    <div className="w-[300px] text-center shadow-md bg-white border h-fit absolute top-[30px] text-xs p-2 rounded-md right-0 z-[2]">
                        <p>{why}</p>
                    </div>
                :null}
            </div>
            <div className="p-2 rounded-b-md bg-g pt-5">
                <Chart 
                    x={[x]} y={[y]} group_by={group_by} 
                    aggregation={aggregate} 
                    z={z} unit={unit}
                />
            </div>
        </div>
    )
}
// function analyzeColumnsOnce({data, metrics}) {
//   const result = {
//     unique: {},
//     categorical: {},
//     numerical: {},
//     date: {},
//   };
//   let metrics_render= []

//   for (const metric of metrics) {
//     const {}= metric
//   }
//   for (let index = 0; index < metrics_render.length; index++) {
//     const element = a;
    
//   }
//   return result;
// }
// function ex_analyzeColumnsOnce({data, request}) {
//   const result = {
//     unique: {},
//     categorical: {},
//     numerical: {},
//     date: {},
//   };
//   console.log({request})
//   const uniqueSets = {};
//   const categoricalSets = {};
//   const numericalTotals = {};
//   const dateSets = {};

//   const allCols = {
//     unique: request?.unique_columns || [],
//     categorical: request?.categorical_columns?.slice(0, 4) || [],
//     numerical: request?.numerical_columns?.slice(0, 4) || [],
//     date: request?.date_columns?.slice(0, 4) || [],
//   };


//   allCols.unique.forEach(col => (uniqueSets[col] = new Set()));
//   allCols.categorical.forEach(col => (categoricalSets[col] = new Set()));
//   allCols.numerical.forEach(col => (numericalTotals[col] = 0));
//   allCols.date.forEach(col => (dateSets[col] = { months: new Set(), years: new Set() }));

//   data.forEach(item => {
//     for (const col in uniqueSets) uniqueSets[col].add(item[col]);
//     for (const col in categoricalSets) categoricalSets[col].add(item[col]);
//     for (const col in numericalTotals) numericalTotals[col] += +item[col] || 0;
//     for (const col in dateSets) {
//       const d = new Date(item[col]);
//       if (!isNaN(d)) {
//         dateSets[col].months.add(`${d.getFullYear()}-${d.getMonth() + 1}`);
//         dateSets[col].years.add(d.getFullYear());
//       }
//     }
//   });

//   for (const col in uniqueSets) {
//     const count = uniqueSets[col].size;
//     if (count > 3 && count !== data.length) result.unique[col] = count;
//   }

//   for (const col in categoricalSets) {
//     const count = categoricalSets[col].size;
//     if (count > 3 && count !== data.length) result.categorical[col] = count;
//   }

//   for (const col in numericalTotals) {
//     if (col.includes('id')) continue;
//     Math.round((numericalTotals[col] / data.length) * 100) / 100
//     const avg = Math.round((numericalTotals[col] / data.length) * 100) / 100;
//     if (avg) result.numerical[col] = avg;
//   }

//   for (const col in dateSets) {
//     if (['dob', 'date of birth'].includes(col.toLowerCase())) continue;
//     const { months, years } = dateSets[col];
//     result.date[col] = { years: years.size, months: months.size };
//   }

//   return result;
// }

function SubscribeBox({onNext, onClose}){
    const [step, setStep]= useState(0)
    const features=[
        {label:'Your visual will last for a lifetime', isActive:true},
        {label:'Make unlimited datasets analysis', isActive:true},
        {label:'Generate detailed reports'},
        {label:'Add customized visuals'}
    ]
    const {postData}= useHttpServices()

    const {  uploadFile, fileData, previewSrc, getFileName, setPreviewSrc, setFileData} =useFileInput()
    const formChange=(e, key, option=false)=>{
        if (option) return setFormData({...formData,[key]:e})
        return setFormData({...formData,[key]:e.target.value})
    }
    const datasetInfo = [
        {
            label: "Your Nick Name",
            name: "nickname",
            type: "text",
            placeholder: "analyzer(sa)ndro??",
            required: true,
            maxlength:55
        },
        {
            label: "Yur Email",
            name: "email",
            type: "email",
            placeholder: "youremail@gmail.com",
            required: true,
            maxlength:55
        },
        {
            label: "Your Whatsapp Line",
            name: "whatsapp",
            type: "text",
            placeholder: "+91 377778890",
            required: true,
            maxlength:55
        },
         
    ];
    return(
        <ModalLayout onClose={onClose}>
            <div 
                onClick={(e)=> e.stopPropagation()} 
                className={"bg-white rounded-md px-3 py-5 text-center w-[400px] tablet:w-full "}>
                <div className="px-2 top-0 sticky">
                    <div className="flex justify-between items-center mb-8">
                        {/* <button style={step?{}:{visibility:'hidden'}} onClick={()=>setStep(0)}>
                        <img src="/svg/arrow-left.svg" alt="arrow-left" className="w-5 h-5"/>
                        </button> */}
                    <img className="cursor-pointer" onClick={
                            ()=>{
                                setShowModal('') 
                                setSearchStatus(null)
                            }
                        } alt="icon" src={'/svg/close.svg'}/>
                    </div>
                    <div className="mt-4">
                        <p>Upgrade to Premium</p>
                        <p>{"This won't last forever"}</p>
                        <p>Upgrade to make it last forever</p>
                    </div>
                </div>
                <div>            
                    <div className="mt-1 px-2">     
                        <div className="p-3 bg-[#EEF4FA] rounded-lg">
                            <div className="flex items-center gap-x-2 mb-2.5">
                                <img src="" alt="star"/>
                                <p className="font-semibold text-xl">Premium Features:</p>
                            </div>
                            <div className="flex flex-col gap-y-3">
                                {features.map(({isActive, label},ind)=>
                                    <div key={ind} className="flex gap-x-[2px] items-center">
                                        <img src={isActive?'/svg/tick.svg':'/svg/circle.svg'} />
                                        <p style={!isActive?{opacity:'0.5'}:{}}>{label}</p>
                                        {isActive?
                                        <p className="p-[5px] rounded-[22px]" style={{
                                            background:'rgba(90, 102, 111, 0.16)'
                                        }}>
                                            Coming soon
                                        </p>
                                        :null
                                        }
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="border-[#8F34E9] border pr-4 py-4 rounded-lg">
                            <div className="flex items-center gap-x-[3px]">
                                {/* <img src="/svg/dollar.svg" alt="dollar" /> */}
                                <p><span>{'$'}</span>Pricing:</p>
                            </div>
                            <div className="flex justify-center items-center gap-x-5">
                                {[{label:'Original', price:'$10'},{label:'Discount', price:'5'}]
                                    .map(({label, price},ind)=>
                                    <div key={ind}>
                                        <p>{label}</p>
                                        <p>{price}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-x-4">
                            <button className="w-full py-2.5 rounded-lg p1">
                                {'Not Now'}
                            </button>
                            <button className="w-full py-2.5 rounded-lg p2">
                                {'Continue'}
                            </button>
                    </div>
                    <div>
                        <div className="w-full flex flex-col gap-5 grid grid-cols-2 gap-x-5 tablet:grid-cols-1">
                            {datasetInfo.map(({label, name, type, options, placeholder, maxlength},ind)=>
                                <Fragment key={ind}>
                                    {type==='text'?
                                    <div className={ind===0?' col-span-2 ':''}>
                                        <p className="font-medium">{label}</p>
                                        <input type={type} onChange={(e)=>formChange(e, name)}
                                            value={formData[name] || ''} 
                                            className=" py-3 px-3 gap-x-2 w-full mt-2.5 rounded-md text-sm tablet:text-base "
                                            placeholder={placeholder}
                                            maxLength={maxlength}
                                        />
                                    </div>:
                                    type==='select'?
                                    <div className="w-full">
                                        <p className="font-medium">{label}</p>
                                        <SelectOption
                                            options={
                                                options
                                            }
                                            // optionClass=" py-3 px-3 gap-x-2 w-full mt-2.5 rounded-md text-sm tablet:text-base"
                                            value={formData[name] || ''} 
                                            onChange={(e)=>formChange(e,name, true)}
                                            label={label}
                                        />
                                    </div>:
                                    <div>
                                        <p className="font-medium">{label}</p>
                                        <textarea value={formData[name] || ''} 
                                            onChange={(e)=>formChange(e,name)}
                                            className="w-full p-3 h-[100px] rounded-md gap-x-2 w-full mt-2.5 rounded-md text-sm tablet:text-base "
                                            placeholder={placeholder}
                                            maxLength={maxlength}    
                                        />
                                    </div>
                                    }
                                </Fragment>
                            )}
                        </div>
                        <div className="relative py-8 rounded-md border bg-white mt-8 border-dashed border-[#8F34E9] flex flex-col items-center justify-center">
                            <img src="/svg/upload-purple.svg" alt="upload-purple" className="w-10 h-10"/>
                            {fileData?.value? 
                                <p className="text-[18px] font-medium mb-2">{getFileName(fileData?.value)}</p>
                            :  <>
                            
                                <p className="text-[18px] font-medium mb-2">{'Upload your file here'}</p>
                            </>
                            
                            }
                            <p className="text-[14px] font-medium text-gray-600">{'(CSV/Excel)'}</p>                                

                            <button onClick={(e)=>{
                                e.preventDefault()
                                document.querySelector('#img').click()
                            }} className="flex gap-x-2 rounded-md mt-8 p1 py-3.5 px-12 rounded-md items-center">
                                <img src="/svg/link-attached.svg" className="w-5 h-5"/>
                                <p className="text-base text-white">{!fileData?.value?'Add file':'Change file'}</p>
                            </button>
                            
                            <input type="file" accept=".png, .jpg, .jpeg" name="coverImg" 
                                className="hidden" id="img"
                                onChange={(e)=>previewSrc(e)}
                            />
                        </div>
                    </div>
                    <div>
                        <div className="w-full">
                            <button className="w-full py-2.5 rounded-lg p2">Submit Payment</button>
                        </div>
                    </div>
                </div>
                <div>
                    <div>
                        <img src="/svg/note.svg"/>
                        <p>Payment Details:</p>
                    </div>
                    <div className="w-full flex flex-col gap-5 grid grid-cols-2 gap-x-5 tablet:grid-cols-1">
                        {datasetInfo.map(({label, name, type, options, placeholder, maxlength},ind)=>
                            <Fragment key={ind}>
                                {type==='text'?
                                <div className={ind===0?' col-span-2 ':''}>
                                    <p className="font-medium">{label}</p>
                                    <input type={type} onChange={(e)=>formChange(e, name)}
                                        value={formData[name] || ''} 
                                        className=" py-3 px-3 gap-x-2 w-full mt-2.5 rounded-md text-sm tablet:text-base "
                                        placeholder={placeholder}
                                        maxLength={maxlength}
                                    />
                                </div>:
                                type==='select'?
                                <div className="w-full">
                                    <p className="font-medium">{label}</p>
                                    <SelectOption
                                        options={
                                            options
                                        }
                                        // optionClass=" py-3 px-3 gap-x-2 w-full mt-2.5 rounded-md text-sm tablet:text-base"
                                        value={formData[name] || ''} 
                                        onChange={(e)=>formChange(e,name, true)}
                                        label={label}
                                    />
                                </div>:
                                <div>
                                    <p className="font-medium">{label}</p>
                                    <textarea value={formData[name] || ''} 
                                        onChange={(e)=>formChange(e,name)}
                                        className="w-full p-3 h-[100px] rounded-md gap-x-2 w-full mt-2.5 rounded-md text-sm tablet:text-base "
                                        placeholder={placeholder}
                                        maxLength={maxlength}    
                                    />
                                </div>
                                }
                            </Fragment>
                        )}
                    </div>
                </div>
            </div>
        </ModalLayout>
    )
}
