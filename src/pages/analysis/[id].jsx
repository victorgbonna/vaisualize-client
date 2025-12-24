"use client";
import { Fragment, use, useCallback, useContext, useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import ChartLayout from "@/components/default";

import {HistogramGrouped, BoxPlot, ViolinPlot, ScatterPlot, BubbleChart, BarChart, HeatmapChart,RadarChart, AreaChart, LinePlot, PieChart} from "@/components/chart/chartTools";
import { DataFetch, DeleteVisualHelper, FilterBox, LoadButton, SelectFilters, SelectOption, SelectOptionAsObjectValue } from "@/components";
import { API_ENDPOINTS, commafy, consolelog, timeStampControl } from "@/configs";
import { DataRequestContext, UseDataRequestContextComponent } from "@/context";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useFileInput, useHttpServices, useToast } from "@/hooks";
import { useRouter } from "next/router";
import { ActionChartModal, ContinueCancel, ModalLayout, Ok } from "@/components/modal";
import Link from "next/link";
import Head from "next/head";
// import SelectFilters from "@/components/helper/SelectOption/selectFilters";

export default function ChartAnalysis() {
    return (
        <UseDataRequestContextComponent>
            <Head>
                <meta name="robots" content="noindex, nofollow"/>
            </Head>
            <AnalysisC/>
            {/* <ActionChartModal status={'add'}/> */}
        </UseDataRequestContextComponent>
    )
}

const formatTime = (ms) => {
        if(!ms) return null
        const totalSeconds = Math.floor(ms / 1000);
        const days = Math.floor(totalSeconds / (24 * 3600));
        const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    };

function AnalysisC() {
    const router = useRouter()
    // const dataList = data_json;
    const {setDataArray:setData, setVisualsSugg, setDataMetrics:setMetrics, setColumns, setFilter, compl_dataArray, setCompDataArray}= useContext(DataRequestContext)
    
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
            refetch:refetchRequestData,
            error, 
            isError:isReqError}= useQuery(
        {
        queryKey:['a-request', router?.query?.id],
        queryFn:()=>getARequest(),
        refetchOnWindowFocus: false,
        retry:false, enabled:!!router.isReady
        }
    )

    // const read_into_csv=async(data)=>{
    //     fetch(data?.file_url?.[0])
    //     .then((res) => res.text())
    //     .then((csvText) => {
    //         const result = Papa.parse(csvText, {
    //             header: true,
    //             skipEmptyLines: true,
    //         });

    //         // console.log({chatGPT_response:data.chatGPT_response})
    //         const {categorical_columns, numerical_columns, date_columns, unique_columns, columns:all_columns}= data
    //         const listed_columns=[]

    //         const {visuals, metrics}= data.visuals_obj ?? data.chatGPT_response[0].visuals_obj ?? data.chatGPT_response[0]
    //         // const {chatGPT_response:visuals_sugg[0].visuals_obj, ...request}= data
    //         for (const col of all_columns) {
    //             if(categorical_columns.includes(col)){
    //                 listed_columns.push({col, cat:'categorical_column'})
    //             }
    //             else if(unique_columns.includes(col)){
    //                 listed_columns.push({col, cat:'categorical_column'})
    //             }
    //             else if(numerical_columns.includes(col)){
    //                 listed_columns.push({col, cat:'numerical_column'})
    //             }
    //             else if(date_columns.includes(col)){
    //                 listed_columns.push({col, cat:'date_column'})
    //             }
    //             else{
    //                 listed_columns.push({col, cat:'categorical_column'})
    //             }
    //         }

    //         setData(result.data);
    //         setMetrics(metrics)
    //         setVisualsSugg(visuals)
            
    //         setColumns(listed_columns)
    //         return
    //     })

    // }
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

            const {categorical_columns, numerical_columns, date_columns, unique_columns, columns:all_columns}= data
            const listed_columns=[]

            const {visuals, metrics}= data.visuals_obj 
            // const {chatGPT_response:visuals_sugg[0].visuals_obj, ...request}= data
            // console.log({all_columns})
            for (const col of all_columns) {
                if(categorical_columns.includes(col)){
                    listed_columns.push({col, cat:'categorical_column'})
                }
                else if(unique_columns.includes(col)){
                    listed_columns.push({col, cat:'categorical_column'})
                }
                else if(numerical_columns.includes(col)){
                    listed_columns.push({col, cat:'numerical_column'})
                }
                else if(date_columns.includes(col)){
                    listed_columns.push({col, cat:'date_column'})
                }
                else{
                    listed_columns.push({col, cat:'categorical_column'})
                }
            }

            setData(result.data);
            setCompDataArray(result.data)
            setMetrics(metrics)
            setVisualsSugg(visuals)
            
            setColumns(listed_columns)

            // console.log({xdata:data.active_filter})
            if(data?.active_filter){
                setFilter(data?.active_filter?.filters)
            }
            return
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

            const {categorical_columns, numerical_columns, date_columns, unique_columns, columns:all_columns}= data
            const listed_columns=[]
            // console.log({x:data})
            const {visuals, metrics}= data?.visuals_obj 
            // const {chatGPT_response:visuals_sugg[0].visuals_obj, ...request}= data
            // console.log({all_columns})
            for (const col of all_columns) {
                if(categorical_columns.includes(col)){
                    listed_columns.push({col, cat:'categorical_column'})
                }
                else if(unique_columns.includes(col)){
                    listed_columns.push({col, cat:'categorical_column'})
                }
                else if(numerical_columns.includes(col)){
                    listed_columns.push({col, cat:'numerical_column'})
                }
                else if(date_columns.includes(col)){
                    listed_columns.push({col, cat:'date_column'})
                }
                else{
                    listed_columns.push({col, cat:'categorical_column'})
                }
            }

            setData(result);
            setCompDataArray(result)
            setMetrics(metrics)
            setVisualsSugg(visuals)
            
            setColumns(listed_columns)
            // console.log({xdata:data.active_filter})
            if(data?.active_filter){
                setFilter(data?.active_filter?.filters)
            }
            return
        }

        console.warn("Unsupported file type");
    };
    useEffect(()=>{
        if(!req_data) return
        
        read_into_file(req_data?.request)
        // console.log({re:req_data?.request})

        if(req_data?.request?.status!=='break') return
        const created = new Date(req_data?.request?.createdAt).getTime();
        const expiry = created + 2 * 24 * 60 * 60 * 1000
        // console.log({expiry})
        const tick = () => {
            const remaining = expiry - Date.now();
            setTimeLeft(remaining);
        };

        tick(); 

        const interval = setInterval(tick, 1000);

        setTimeout(() => {
            setOpenModal({
                type:'subscribe',
                label:req_data?.request?.title,
                id:req_data?.request?._id
            })
        }, 5000);

        return () => clearInterval(interval);       
    },[req_data])

    
    return (
    <>
        <DataFetch
            isLoading={reqLoading} 
            isError={isReqError} 
            errorMsg={error?.error?.message}
            isEmpty={false}
        >
            <div>
                <div style={{
                    boxShadow: '1px 0px 50px -8px rgba(24, 24, 27, 0.1)'
                }} className="flex tablet:flex-col items-center justify-between rounded-b-md sticky tablet:relative tablet:w-full top-0 z-[99] border w-full left-0 right-0 h-fit bg-white py-7 px-10 tablet:px-4">
                    <div className="flex items-center gap-x-5">
                        <Link href={'/'}>
                            <img src="/svg/home.svg" alt="home" className="w-8 h-8"/>
                        </Link>
                        <h1 className="text-2xl font-semibold text-[#5345E6]">{req_data?.request?.title}</h1>
                        {/* <p className="text-gray-700 text-sm tablet:mt-2">This visuals expires in {formatTime(timeLeft)} — Subscribe for premium to cancel</p> */}
                    </div>
                    <div className="gap-x-[4px] relative tablet:mt-6 flex items-center">
                        {req_data?.request?.status==='break'?
                        <>
                        <div className="flex-col flex justify-end gap-y-[6px] items-end">
                            <p className="text-sm">This visual expires in</p>
                            <p className="text-[#C40404] font-semibold">{formatTime(timeLeft)}</p>
                        </div>
                        <button onClick={()=>setOpenModal({
                            label:req_data?.request?.title,
                            _id:req_data?.request?._id,
                            type:'subscribe'
                            })} className="p2 px-10 rounded-lg py-3 flex-col flex items-center ml-3">
                            <div className="mb-[3px] gap-x-2 flex items-center">
                                <img src="/svg/metric/star.svg" alt="star" />
                                <p className="text-white font-semibold">Get Premium</p>
                            </div>
                            <p className="text-white">{'(To keep your visual forever)'}</p>
                        </button>
                        <div
                            className="absolute right-[-20px] top-[-20px] h-[40px] w-[40px] flex items-center justify-center">
                            <img src="/svg/discount.svg" className="absolute inset-0 h-full w-full "/>
                            <div className="relative z-2 text-center text-white">
                                <p className="mb-[-10px] text-sm font-semibold">60%</p>
                                <small className="text-[9px] font-medium">OFF</small>
                            </div>

                        </div>
                        </>:
                        req_data?.request?.status==='pending'?
                        <div className="flex flex-col justify-end items-end">
                            <p className="text-sm italic mb-2">Payment verification still in progress</p>
                            <div className="w-fit">
                                <Link className="w-fit text-white py-2 px-5 rounded-lg p2" href={API_ENDPOINTS.MY_DETAILS.WHATSAPP} >
                                    Contact Us
                                </Link>
                            </div>

                        </div>
                        :<>
                            <button onClick={()=>setOpenModal({
                                type:'filter', id:req_data?.request?._id, active_filter:req_data?.request?.active_filter
                            })} className="px-5 py-2.5 text-[15px] p2 mr-6 tablet:mr-0 rounded-lg text-white flex items-center gap-x-2">
                                <img src="/svg/filter.svg" className="w-5 h-5"/>
                                <p>Filter Data</p>
                            </button>
                            <button disabled={true} className="text-[15px] px-5 py-2.5 p3 rounded-lg text-white flex items-center gap-x-2">
                                <img src="/svg/change.svg" className="w-5 h-5"/>
                                <p>Select Another Data</p>
                            </button>
                        </>
                        }
                    </div>

                </div>
                <div className="px-8 py-7 bg-g tablet:px-4 bg-[#F5F5FA]" >
                    <p className="w-[90%] tablet:text-sm tablet:w-[95%]">{req_data?.request?.description}</p>
                    <div className="mt-11 mb-20">
                        <CardBox/>
                    </div>
                    <div>
                        <VisualCharts refetchRequestData={refetchRequestData}/>
                    </div>
                </div>
            </div>

        </DataFetch>
        {openModal?.type==='subscribe' ?
            <SubscribeBox timeLeft={timeLeft} data={openModal} 
                onClose={()=>setOpenModal(null)}
                setShowModal={()=>setOpenModal(null)}
            />
        :null}
        {openModal?.type==='filter' ?
            <FilterBox data={openModal} 
                onClose={()=>setOpenModal(null)}
                setShowModal={()=>setOpenModal(null)}/>
        :null}
    </>
  );
}

function CardBox(){
    const {dataArray:data, dataMetrics:metrics, columns}= useContext(DataRequestContext)
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
                    const date_type= columns?.find(({col})=>column===col)?.cat==='date_column'
                    // isNaN(parseInt(data[0][column]))? isDate(data[0][column]):false
                    
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
                    const date_type= columns?.find(({col})=>column===col)?.cat==='date_column'
                    // const date_type= isNaN(parseInt(data[0][column]))? isDate(data[0][column]):false
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
                        <p className="text-2xl font-semibold">
                            {commafy(+aggregate_value[0]?Math.round(aggregate_value*100/100):aggregate_value[0])}
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

function VisualCharts({refetchRequestData}){
    const {visualsSugg:visuals_sugg, newVisualsSugg, del_visualsSugg, setDelVisualsSugg}= useContext(DataRequestContext)
    const [actionModal, setActionModal]= useState(null)
    
    return(
        <>
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
                                setActionModal={setActionModal}
                                ind={ind}
                            />
                        </Fragment>
                    )
                }

            )}
            <div>
                <button onClick={()=>setActionModal({
                    status:'add', 
                })} className="py-10 px-5 shadow-lg rounded-lg w-full h-full flex flex-col items-center justify-center border-2 border-gray-600 border-dashed">
                    <img src="/svg/add-dark.svg" style={{
                        filter: 'brightness(50%)'
                    }}/>
                    <p className="text-xl font-semibold">Adjust your visuals</p>
                </button>
            </div>

        </section>
        {actionModal?.status==='edit'?
            <ActionChartModal
                data ={actionModal}
                status={'edit'}
                onNext={()=>{
                    setActionModal(null)
                    // refetchRequestData()
                    window.location.reload()
                }}
                onClose={()=>setActionModal(null)}
            />:
            null
        }
        {actionModal?.status==='add'?
            <ActionChartModal
                data ={actionModal}
                status={actionModal?.status}
                onNext={()=>{
                    setActionModal(null)
                    // refetchRequestData()
                    window.location.reload()
                }}
                onClose={()=>setActionModal(null)}
            />:
            null
        }
        {actionModal?.status==='delete'?
        <DeleteVisualHelper
            active={actionModal}
            setActive={()=>setActionModal(null)}
            onClose={()=>setActionModal(null)}
            onNext={(e)=>setDelVisualsSugg([...del_visualsSugg, e])}
        />:null}
        {/* {actionModal?.status==='delete'?
            <ContinueCancel isLoading={delLoading} 
                onClose={()=>setActionModal(null)}
                onNext={()=>deleteChart()}
                html={<p className="text-center text-base">
                    Confirm delete: "<b>{actionModal.title}</b>"?
                </p>}
                continueClass={' p3 '}
                cancelClass=" p1 "
            />:
            null
        } */}
        </>
    )
}

function ChartComponent({actionModal, setActionModal,plot_type,ind, x, z=null, y, why, title,unit,aggregate, description, group_by=null, isNew}){
    const [chartType, setChartType]= useState(plot_type.split(',')[0])
    const [mount, setMount]= useState(false)
    const {del_visualsSugg, setDelVisualsSugg}= useContext(DataRequestContext)
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
            borderWidth:'1.5px',
            ...(
                del_visualsSugg?.includes(ind)
                ?{display:'none'}:{}
            )
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
                {!isNew?
                <div className="flex items-end gap-x-5">
                    <button onClick={()=>setMount(!mount)}>
                        <img src="/svg/info.svg"/>
                    </button>
                    <button className="p-1.5 p1 rounded-lg" onClick={()=>setActionModal({
                        x, y, z, group_by, aggregate, unit,why,chartInd:ind, chartType, title, status:'edit'
                    })}>
                        <img src="/svg/edit.svg" className="w-3.5 h-3.5"/>
                    </button>
                    <button onClick=
                        {()=>
                        {
                            setActionModal({
                            chartType, title, status:'delete', chartInd:ind
                        })}}
                        className="p-1.5 p3 rounded-lg" >
                        <img src="/svg/bin.svg" className="w-3.5 h-3.5"/>
                    </button>
                    
                </div>:null}

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

function SubscribeBox({onNext, onClose, timeLeft, data, setShowModal}){
    const [step, setStep]= useState(0)
    const features=[
        {label:'Your visual will last for a lifetime', isActive:true},
        {label:'Reuse this visual for matching datasets', isActive:true},
        {label:'Add Filters and drill down into data', isActive:true},
        {label:'Generate detailed reports'},
    ]
    const {postData}= useHttpServices()
    const [formData, setFormData]= useState({})
    const {NotifyError, NotifySuccess}= useToast()

    const {  uploadFile, fileData, previewSrc, getFileName, previewPic} =useFileInput('vaisualize-payment-receipt13736373e7e')
    const formChange=(e, key, option=false)=>{
        if (option) return setFormData({...formData,[key]:e})
        return setFormData({...formData,[key]:e.target.value})
    }
    const datasetInfo = [
        {
            label: "Your Name",
            name: "fullName",
            type: "text",
            placeholder: "analy(zer / sa)ndro??",
            required: true,
            maxlength:40
        },
        {
            label: "Yur Email",
            name: "email",
            type: "email",
            placeholder: "youremail@gmail.com",
            required: true,
            maxlength:30
        },
        {
            label: "Your Whatsapp Line",
            name: "whatsapp",
            type: "text",
            placeholder: "+91 377778890",
            required: true,
            maxlength:15
        },
         
    ];
    const router=useRouter()
    const sendPaymentQuery= async()=>{
        const {fullName, email:email_attached, whatsapp:whatsapp_line}=formData
        const user_body={whatsapp_line, email_attached, fullName}
        const request_body={_id:router?.query?.id}
        // console.log({request_body, user_body})
        const { url:proof, delete_token, error: imageError } = await uploadFile()
        
        if (imageError) {
            console.log({imageError})
            throw {error:imageError}
        }
        return await postData(
            {   
                path:API_ENDPOINTS.SEND_PAYMENT,
                body:{user_body, request_body, proof},
                
            }
        )
    }

    const {mutate:sendPayment, isPending:payLoading}=useMutation({
    mutationFn: ()=>sendPaymentQuery(),
    onError:({error})=>{
        // consolelog({error})
        return NotifyError(error.message || 'Could not get data')
    },
    onSuccess:({data})=>{
        NotifySuccess('Payment sent for approval. We will get back to you shortly.')
        onClose()
    }
    })
    return(
        <ModalLayout onClose={setShowModal}>
            <div 
                onClick={(e)=> e.stopPropagation()} 
                className={"bg-white rounded-md px-4 py-5 text-center w-[600px] tablet:w-full "}>
                <div className="px-2 top-0 sticky">
                    <div className="flex justify-end items-center mb-4">
                        {/* <button style={step?{}:{visibility:'hidden'}} onClick={()=>setStep(0)}>
                        <img src="/svg/arrow-left.svg" alt="arrow-left" className="w-5 h-5"/>
                    
                    </button> */}
                        <button 
                            onClick={
                                ()=>{
                                    setShowModal() 
                                    // setSearchStatus(null)
                                }
                            }>
                            <img alt="icon" src={'/svg/close.svg'}/>                      
                        </button>
                    </div>
                    <div className="my-4" style={step?{display:'none'}:{}}>
                        <p className="text-2xl mb-[4px] text-[#8F34E9] font-semibold">Upgrade to Premium</p>
                        <p className="text-[#EE444D] text-[15px]">{"This will expire in "+formatTime(timeLeft)}</p>
                        <p className="text-[#5D5C5C] text-sm">Upgrade to make it last forever</p>
                    </div>
                </div>
                <div className="relative flex items-start overflow-x-hidden w-full flex-nowrap"
                    
                > 
                {/* // style={{transform: `translateY(-${step * 450}px)`} }> */}
                    <div className="min-w-full" style={step?{display:'none'}:{}}>            
                        <div className="mt-4 p-3">     
                            <div className="p-4 bg-[#EEF4FA] rounded-lg">
                                <div className="flex items-center gap-x-2 mb-2.5">
                                    <img src="/svg/purple-star.svg" alt="star"/>
                                    <p className="font-semibold text-[15px]">Premium Features:</p>
                                </div>
                                <div className="flex flex-col gap-y-3">
                                    {features.map(({isActive, label},ind)=>
                                        <div key={ind} className="flex gap-x-[10px] items-center">
                                            <img src={isActive?'/svg/tick.svg':'/svg/circle.svg'} />
                                            <p className="text-sm" style={!isActive?{opacity:'0.5'}:{}}>{label}</p>
                                            {!isActive?
                                            <p className="p-[5px] rounded-[22px] text-xs px-2" style={{
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
                            <div className="border-[#8F34E9] border px-4 py-4 rounded-lg mt-7">
                                <div className="flex items-center gap-x-[3px]">
                                    {/* <img src="/svg/dollar.svg" alt="dollar" /> */}
                                    <p className=" font-semibold text-lg"><span className="text-[#8F34E9]">{'$  '}</span>Pricing:</p>
                                </div>
                                <div className="flex justify-center items-center gap-x-5">
                                    {[{label:'Original', price:'$10'},{label:'Discount', price:'$4(₦6,000)'}]
                                        .map(({label, price},ind)=>
                                        <div key={ind}>
                                            <p className="text-[#5D5C5C] text-sm">{label}</p>
                                            <p className="font-bold" 
                                                style={!ind?{textDecoration:'line-through', fontSize:'16px'}:
                                                    {fontSize:'30px', color:'#8F34E9'}}>
                                                    {price}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-x-4 text-white mt-3 px-3">
                                <button onClick={()=>setShowModal()} className="w-full py-2.5 rounded-lg bg-red-500">
                                    {'Not Now'}
                                </button>
                                <button onClick={()=>setStep(1)} className="w-full py-2.5 rounded-lg p2">
                                    {'Continue'}
                                </button>
                        </div>
                        
                    </div>
                    <div className="min-w-full" style={!step?{display:'none'}:{}} >
                        {/* <div>
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
                        </div> */}
                        <div className="text-sm text-left bg-[#EEF4FA] rounded-lg p-3">
                            <div className="flex gap-x-3 items-center mb-2">
                                <img src="/svg/dollar.svg"/>
                                <p className="font-semibold">Payment Details:</p>
                            </div>
                            <p>Please make transfer to:</p>
                            <div className="flex flex-col gap-x-3 bg-white rounded-md px-3 py-2 mt-1">
                                <div className="grid grid-cols-3 w-full mb-3 gap-x-3">
                                    <p className="invisible">ee</p>
                                    <p className="font-medium">NGN</p>
                                    <p className="font-medium">USD</p> 
                                    
                                </div>
                                <div>
                                    {['Bank Name', 'Account Number', 'Account Name'].map((label,ind)=>
                                        <div key={ind} className="grid grid-cols-3 gap-x-3 mb-3">
                                            <p className="text-[#5D5C5C] text-[13px]">{label}</p>
                                            <p>{API_ENDPOINTS.MY_DETAILS.ACCOUNT_DETAILS[0][label.replace(' ', '_').toUpperCase()]}</p>
                                            <p>{API_ENDPOINTS.MY_DETAILS.ACCOUNT_DETAILS[1][label.replace(' ', '_').toUpperCase()]}</p>

                                        </div>
                                    )}
                                </div>
                                {/* <div className="flex items-end">
                                    {API_ENDPOINTS.MY_DETAILS.ACCOUNT_DETAILS.map((
                                        {BANK_NAME, ACCOUNT_NUMBER, ACCOUNT_NAME, COUNTRY},ind)=>
                                        <div key={ind} className="mb-3">
                                            <p>{COUNTRY}</p>
                                            <p className="font-medium">{BANK_NAME}</p>
                                            <p>{ACCOUNT_NUMBER}</p>
                                            <p>{ACCOUNT_NAME}</p>   
                                        </div>
                                    )}
                                </div> */}
                            </div>
                        </div>
                        <div className="flex gap-x-3 items-center my-2">
                            <img src="/svg/dollar.svg"/>
                            <p className="font-semibold text-[15px]">Payment Form:</p>
                        </div>
                        <div className="w-full text-sm  text-left grid grid-cols-2 gap-3 justify-between mt-3 tablet:grid-cols-1">
                            {datasetInfo.map(({label, name, type, options, placeholder, maxlength},ind)=>
                                <Fragment key={ind}>
                                    {type==='text' || type==='email'?
                                    <div>
                                        <p className="font-medium">{label}</p>
                                        <input type={type} onChange={(e)=>formChange(e, name)}
                                            value={formData[name] || ''} 
                                            className=" py-3 px-3 border gap-x-2 w-full text-left mt-2.5 rounded-md text-sm tablet:text-base "
                                            placeholder={placeholder}
                                            maxLength={maxlength}
                                        />
                                    </div>:
                                    type==='select'?
                                    <div className="w-full">
                                        <p className="font-medium text-left">{label}</p>
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
                            <div>
                                <p className="font-medium">{'Receipt of Payment'}</p>
                                {fileData?.value?<p className="text-[13px] italic">{getFileName(fileData?.value)}</p>:null}
                                <div>
                                    <button onClick={(e)=>{
                                    e.preventDefault()
                                    document.querySelector('#img').click()
                                }} className="flex gap-x-2 rounded-md border py-3 justify-center w-full mt-2.5 rounded-md items-center">
                                    <img src="/svg/link-attached-blacki.svg" className="w-4 h-4"/>
                                    <p className="text-sm text-black">{!fileData?.value?'Add file(pdf/img)':'Change file'}</p>
                                </button>
                                
                                <input type="file" accept=".pdf, .png, .jpeg, .jpg" name="coverImg" 
                                    className="hidden" id="img"
                                    onChange={(e)=>previewPic(e)}
                                />
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-x-4 text-white mt-8">
                            <button onClick={()=>setStep(0)} className="w-full py-2.5 rounded-lg p3">
                                {'Go Back'}
                            </button>
                            <LoadButton 
                                isLoading={payLoading}
                                onClick={()=>sendPayment()}
                                disabled={!formData.fullName || !formData.email || !fileData?.value || !formData.whatsapp} 
                                className="relative w-full py-2.5 rounded-lg p2 text-white">
                                    Submit Payment
                            </LoadButton>
                        </div>
                        
                    
                    </div>
                </div>
            </div>
        </ModalLayout>
    )
}

// function getDistinctValuesByCount({dataArray, column}) {
//   const counts = {};
  
//   for (const item of dataArray) {
//     const val = item[column];
//     // console.log({val, item, column})
//     if (val !== undefined && val !== null) {
//       counts[val] = (counts[val] || 0) + 1;
//     }
//   }
// //   console.log({counts})
//   return Object.entries(counts)
//     .map(([value, count]) => (value))
//     // .sort((a, b) => b.count - a.count);
// }

// function ColumnDropDown({currInd, onNext}){
//     const {columns}= useContext(DataRequestContext)
//     return(
//         <div className="absolute w-fit left-0 py-2 rounded-lg" style={currInd>2?{top:'50%'}:{bottom:'50%'}}>
//             <p className="text-lg mb-2.5 border-b pb-[6px]">Select Column</p>
//             <div className="max-h-[300px] shadow-lg overflow-y-auto h-fit">
//                 {columns.map((col_x)=>
//                     <p className="text-sm py-3 px-2 border-b" onClick={()=>onNext(col_x.col)}>{col_x.col}</p>
//                 )}
//             </div>
//         </div>
//     )
// }