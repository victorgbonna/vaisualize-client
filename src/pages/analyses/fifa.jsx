"use client";
import { Fragment, useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import ChartLayout from "@/components/default";
import data_json from "@/data/extracted_responses2.json";
// import { AreaChart, BarChart, BoxPlot, 
//     BubbleChart, ChloroplethMap, GroupedBarChart, HeatmapChart, 
//     HistogramGrouped, 
//     LinePlot, PieChart, RadarPlot, ScatterPlot, 
//     StackedBarChart, SwarmPlot, ViolinPlot } from "@/components/chart/chartTools";

import {
    HistogramGrouped, BoxPlot,RadarChart, ViolinPlot, 
    ScatterPlot, BubbleChart, BarChart} from "@/components/chart/chartTools";
import { SelectOption } from "@/components";
import { consolelog } from "@/configs";

export default function Analysis() {

    const dataList = data_json;
    const {visuals_sugg, request}= dataList[1].data
    const [data, setData] = useState([]);

    useEffect(() => {
        fetch("/vaisualize_test_files/fc26.csv")
        .then((res) => res.text())
        .then((csvText) => {
            const result = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            });
            setData(result.data);
        });
    }, []);

    return (
    <div className="p-6">
        <h1 className="text-xl font-semibold mb-4">CSV Data</h1>
        {/* <pre className="bg-gray-100 p-3 rounded">{JSON.stringify(data, null, 2)}</pre> */}

        <section className="grid grid">
            <div>
                <div>
                    <h2>This dataset contains detailed player information from EA Sports FC 26, scraped from sofifa.com...</h2>
                    <p>Support football analytics research, player scouting simulations.</p>
                </div>
                
                <CardBox request={request} data={data}/>
                <section>
                    <VisualCharts data={data} 
                        visuals_sugg={visuals_sugg} 
                        request={request}
                    />
                </section>
                
            </div>
        </section>
    </div>
  );
}

function CardBox({request, data}){

    const dashboardCards = [
        {
            title: "Total Orders",
            value: 75,
            change: "+4%",
            period: "30 Days"
        },
        {
            title: "Total Delivered",
            value: 75,
            change: "+4%",
            period: "30 Days"
        },
        {
            title: "Total Revenue",
            value: 75,
            change: "+4%",
            period: "30 Days"
        },
        {
            title: "Total Canceled",
            value: 75,
            change: "+4%",
            period: "30 Days"
        }
    ];


    // console.log(request.unique_columns)
    if(!data) return null
    return(
    <div className="grid grid-cols-6 gap-x-20 items-center number_card">
        <div>
            <p className="uppercase">{"Total Entries"}</p>
            <p>{data.length}</p>
        </div>
        {request?.unique_columns?.map((col,index)=>{
            const countHowMayValues=8
            const bring_unique= data.map((item)=>item[col])
            // console.log(bring_unique[0])
            const count=new Set(bring_unique).size

            if(count<=3 || count===data.length) return null

            return(
            <div key={index}>
                <p className="uppercase">{"Total '"}+{col}+{"'"}</p>
                <p>{count}</p>
            </div>)
        }
        )}
        
        {request?.categorical_columns?.slice(0,4)?.map((col,index)=>{
            const bring_unique= data.map((item)=>item[col])
            const count=new Set(bring_unique).size
            if(count<=3 || count===data.length) return null
            return(<div key={index}>
                <p className="uppercase">{"Total '"}+{col}+{"'"}</p>
                <p>{count}</p>
            </div>)
        }
        )}
        {request?.numerical_columns.slice(0,4).map((col,index)=>{
            if(col.includes('id')){
                return null
            }
            // console.log(data[0], col)
            const map_only_col= data.map((item)=>item[col])
            // console.log(map_only_col[0])
            // if(count<=3 || count===data.length) return null

            // const count=new Set(bring_unique).size
            const total_value = map_only_col?.reduce((a, b) => +a + +b, 0);
            if(!total_value) return null
            return(<div key={index}>
                <p className="uppercase">{"Average '"}+{col}+{"'"}</p>
                <p>{Math.round((total_value/data.length) * 100)/100}</p>
            </div>)
        }
        )}
        {request?.date_columns?.slice(0,4)?.map((col,index)=>{
            if(['dob','date of birth'].includes(col.toLowerCase())){
                return null
            }
            const dates= data.map((item)=>item[col])
            const months = new Set(
                dates.map(d => {
                    const date = new Date(d);
                    return `${date.getFullYear()}-${date.getMonth() + 1}`;
                })
            );
            const years = new Set(dates.map(d => new Date(d).getFullYear()));
            
            const months_count=months.size
            const years_count= years.size

            return(<div key={index}>
                <p className="uppercase">{"Total '"}+{col}+{"'"}</p>
                <p>{ years_count+' years ('+months_count+' months)'}</p>
            </div>)
        }
        )}
    </div>
)}


function VisualCharts({visuals_sugg, request, data}){
    
    

    // if(!data.length, !chartType) return null
    return(
        <section className="grid grid-cols-2 gap-x-5 gap-y-8 w-full items-start">
           {visuals_sugg?.map(({plot_type, title, description,x,y,group_by:z},ind)=>{
                    return(
                        <Fragment key={ind}>
                            <ChartComponent 
                                plot_type={plot_type} title={title}
                                x={x} y={y} z={z}
                                description={description}
                                data={data} request={request}
                            />
                        </Fragment>
                    )
                }

            )} 
        </section>
    )
}

function ChartComponent({data, plot_type, x, z=null, y, title, request, description}){
    const [chartType, setChartType]= useState(plot_type.split(', ')[0])
    const charts_done=[
        'histogram', 'box plot', 'violin plot', 'scatter plot', 'bubble chart',
        'bar chart','radar chart'
    ]
    const componentMap = {
        'histogram': HistogramGrouped,'box plot': BoxPlot,
        'violin plot': ViolinPlot, 'scatter plot': ScatterPlot,
        'radar chart': RadarChart, 'bar chart': BarChart,
        'bubble chart': BubbleChart,
        // 'heatmap':HeatmapChart,   
        // 'area chart': AreaChart, 'line chart': LinePlot,'pie chart':PieChart, 'chloropleth map': ChloroplethMap, 
        // 'bar chart': BarChart, 'stacked bar chart': StackedBarChart,
        // 'grouped bar chart':GroupedBarChart, 'swarm plot': SwarmPlot
    };
    const Chart= useMemo(()=>{
        // consolelog({chartType})
        return componentMap[chartType]
    },[chartType])

    const x_t=[x]
    const y_t=[y]
    // const xLabel=x[0].toUpperCase()+x.slice(1)
    const yLabel=y[0].toUpperCase()+y.slice(1)
    
    let isAggregation= 'count'
    if(title?.toLowerCase()?.includes('sum') || description?.toLowerCase()?.includes('sum')){
        isAggregation='sum'
    }
    else if(title?.toLowerCase()?.includes('average') || description?.toLowerCase()?.includes('average')){
        isAggregation='average'
    }

    let xObjs=[]

    let yObjs=[]

    for (let index = 0; index < x_t.length; index++) {
        const xElement= x_t[index]
        const xObj={
            xLabel:xElement[0].toUpperCase()+xElement.slice(1),
            xData:data?.map((item)=>+item[xElement] || item[xElement]), 
            xProp:xElement
        } 
        xObjs.push(xObj)
    }
    for (let index = 0; index < y_t.length; index++) {
        const yElement= y_t[index]
        const yObj={
            yLabel:yElement[0].toUpperCase()+yElement.slice(1),
            yData:data?.map((item)=>+item[yElement] || item[yElement]), 
            yProp:yElement
        } 
        yObjs.push(yObj)
    }
    let zValues=[]
    if(z){
        zValues=data?.map((zElement)=>zElement[z])
    }
    if(!data || !data.length) return null
    if(!charts_done.includes(chartType)) return null 
    return(
        <div className="relative">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-x-2">
                    <p className="">{title}</p>

                    {plot_type.split(', ').length>1?
                        <div className="">
                            <SelectOption options={plot_type.split(', ')}
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
                    dataArray={data}
                    x={xObjs} y={yObjs} 
                    title={title}
                    isAggregation={isAggregation}
                    type='single'
                    z={z}
                    zValues={z? zValues : null}
                />
            </div>
        </div>
    )
}