"use client";
import { Fragment, useCallback, useContext, useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import ChartLayout from "@/components/default";

import {HistogramGrouped, BoxPlot, ViolinPlot, ScatterPlot, BubbleChart, BarChart, HeatmapChart,RadarChart, AreaChart, LinePlot, PieChart} from "@/components/chart/chartTools";
import { DataFetch, SelectOption } from "@/components";
import { API_ENDPOINTS, consolelog, timeStampControl } from "@/configs";
import { DataRequestContext, UseDataRequestContextComponent } from "@/context";
import { useQuery } from "@tanstack/react-query";
import { useHttpServices } from "@/hooks";
import { useRouter } from "next/router";

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
    // useEffect(() => {
    //     fetch("/vaisualize_test_files/fc26.csv")
    //     .then((res) => res.text())
    //     .then((csvText) => {
    //         const result = Papa.parse(csvText, {
    //             header: true,
    //             skipEmptyLines: true,
    //         });
    //         const {visuals_sugg, request}= response_data().data
    //         setData(result.data);
    //         setMetrics(request)
    //         consolelog({visuals_sugg})
    //         setVisualsSugg(visuals_sugg)
    //     });
    // }, [req_data]);
    const read_into_csv=async(data)=>{
        fetch(data?.file_url?.[0])
        .then((res) => res.text())
        .then((csvText) => {
            const result = Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
            });
            console.log({chatGPT_response:data.chatGPT_response})
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

        // ========= EXCEL (xls / xlsx) =========
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
    },[req_data])
    return (
    <DataFetch
        isLoading={reqLoading} 
        isError={isReqError} 
        errorMsg={error?.message}
        isEmpty={false}
    >
        <div className="p-6">
            <h1 className="text-xl font-semibold mb-4">{req_data?.request?.title}</h1>
            
            <section className="grid grid">
                <div>
                    <div>
                        <h2>{req_data?.request?.description}</h2>
                        <p>{req_data?.request?.goal}</p>
                    </div>
                    
                    <CardBox/>
                    <section>
                        <VisualCharts/>
                    </section>
                    
                </div>
            </section>
        </div>
    </DataFetch>
    
  );
}

function CardBox(){
    const {dataArray:data, dataMetrics:metrics}= useContext(DataRequestContext)
    const {isDate, convertToDigit}= timeStampControl
    // console.log({metrics})
    return(
    <div className="grid grid-cols-6 gap-x-20 items-center number_card">
        {metrics?.map(({label, aggregate, column},ind)=>
            {
                let aggregate_value=[]
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
                    const date_type=isDate(data[0][column])
                    let values= data.map(
                        (row)=>date_type?row[column]:convertToDigit(row[column]))?.filter((x)=>!!x)
                    if(date_type){
                        aggregate_value=[minmaxDate({values,aggregate:'max'})]
                    }
                    else{
                        aggregate_value=[Math.min(...values)]
                    }
                }
                else if (aggregate.includes('max')){
                    const date_type=isDate(data[0][column])
                    let values= data.map(
                        (row)=>date_type?row[column]:convertToDigit(row[column]))?.filter((x)=>!!x)
                    if(date_type){
                        aggregate_value=[minmaxDate({values,aggregate:'max'})]
                    }
                    else{
                        aggregate_value=[Math.max(...values)]
                    }
                }
                return(
                <Fragment key={ind}>
                    <div>
                        <p className="uppercase">{label}</p>
                        <p>{aggregate_value?.map((value,ind)=>
                            <span key={ind}>{value}</span>
                        )}</p>
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
    console.log({visuals_sugg})
    return(
        <section className="grid grid-cols-2 gap-x-5 gap-y-8 w-full items-start">
           {visuals_sugg?.map(({plot_type, title,unit, description,x,y,group_by,z, aggregate},ind)=>{
                    return(
                        <Fragment key={ind}>
                            <ChartComponent 
                                plot_type={plot_type} title={title}
                                x={x} y={y} z={z}
                                description={description}
                                group_by={group_by}
                                aggregate={aggregate}
                                unit={unit}
                            />
                        </Fragment>
                    )
                }

            )} 
        </section>
    )
}

function ChartComponent({plot_type, x, z=null, y, title,unit,aggregate, description, group_by=null}){
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
        <div className="relative">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-x-2">
                    <p className="">{title}</p>

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
                <button>
                    <p className="text-xs">info</p>
                </button>
            </div>
            <div>
                <Chart 
                    x={[x]} y={[y]} group_by={group_by} 
                    aggregation={aggregate} 
                    z={z} unit={unit}
                />
            </div>
        </div>
    )
}
function analyzeColumnsOnce({data, metrics}) {
  const result = {
    unique: {},
    categorical: {},
    numerical: {},
    date: {},
  };
  let metrics_render= []

  for (const metric of metrics) {
    const {}= metric
  }
  for (let index = 0; index < metrics_render.length; index++) {
    const element = a;
    
  }
  return result;
}
function ex_analyzeColumnsOnce({data, request}) {
  const result = {
    unique: {},
    categorical: {},
    numerical: {},
    date: {},
  };
  console.log({request})
  const uniqueSets = {};
  const categoricalSets = {};
  const numericalTotals = {};
  const dateSets = {};

  const allCols = {
    unique: request?.unique_columns || [],
    categorical: request?.categorical_columns?.slice(0, 4) || [],
    numerical: request?.numerical_columns?.slice(0, 4) || [],
    date: request?.date_columns?.slice(0, 4) || [],
  };


  allCols.unique.forEach(col => (uniqueSets[col] = new Set()));
  allCols.categorical.forEach(col => (categoricalSets[col] = new Set()));
  allCols.numerical.forEach(col => (numericalTotals[col] = 0));
  allCols.date.forEach(col => (dateSets[col] = { months: new Set(), years: new Set() }));

  data.forEach(item => {
    for (const col in uniqueSets) uniqueSets[col].add(item[col]);
    for (const col in categoricalSets) categoricalSets[col].add(item[col]);
    for (const col in numericalTotals) numericalTotals[col] += +item[col] || 0;
    for (const col in dateSets) {
      const d = new Date(item[col]);
      if (!isNaN(d)) {
        dateSets[col].months.add(`${d.getFullYear()}-${d.getMonth() + 1}`);
        dateSets[col].years.add(d.getFullYear());
      }
    }
  });

  for (const col in uniqueSets) {
    const count = uniqueSets[col].size;
    if (count > 3 && count !== data.length) result.unique[col] = count;
  }

  for (const col in categoricalSets) {
    const count = categoricalSets[col].size;
    if (count > 3 && count !== data.length) result.categorical[col] = count;
  }

  for (const col in numericalTotals) {
    if (col.includes('id')) continue;
    Math.round((numericalTotals[col] / data.length) * 100) / 100
    const avg = Math.round((numericalTotals[col] / data.length) * 100) / 100;
    if (avg) result.numerical[col] = avg;
  }

  for (const col in dateSets) {
    if (['dob', 'date of birth'].includes(col.toLowerCase())) continue;
    const { months, years } = dateSets[col];
    result.date[col] = { years: years.size, months: months.size };
  }

  return result;
}

