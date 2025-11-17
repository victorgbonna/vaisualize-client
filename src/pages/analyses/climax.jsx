"use client";
import { Fragment, useContext, useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import ChartLayout from "@/components/default";

import {RadarChart,HistogramGrouped, BoxPlot, ViolinPlot, ScatterPlot, BubbleChart, BarChart, HeatmapChart, LinePlot, 
        AreaChart, PieChart} from "@/components/chart/chartTools";

import { SelectOption } from "@/components";
import { consolelog } from "@/configs";
import { DataRequestContext, UseDataRequestContextComponent } from "@/context";

export default function CryptoAnalysis() {
    return (
        <UseDataRequestContextComponent>
            <AnalysisC/>
        </UseDataRequestContextComponent>
    )
}



function AnalysisC() {

    // const dataList = data_json;
    const {setDataArray:setData, setVisualsSugg, setDataRequest:setRequest}= useContext(DataRequestContext)

    useEffect(() => {
        fetch("/vaisualize_test_files/.csv")
        .then((res) => res.text())
        .then((csvText) => {
            const result = Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
            });
            const {visuals_sugg, request}= response_data().data
            setData(result.data);
            setRequest(request)
            // consolelog({visuals_sugg})
            setVisualsSugg(visuals_sugg)
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
                
                <CardBox/>
                <section>
                    <VisualCharts/>
                </section>
                
            </div>
        </section>
    </div>
  );
}

function CardBox(){
    const {dataArray:data, dataRequest:request}= useContext(DataRequestContext)
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
    const stats= useMemo(()=>{
        if (!data || data.length===0) return {
            unique: {},
            categorical: {},    
            numerical: {},
            date: {},
        }
        return analyzeColumnsOnce({data, request})
    },[data, request])

    // console.log(request.unique_columns)
    if(!data) return null
    return(
    <div className="grid grid-cols-6 gap-x-20 items-center number_card">
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
  </div>
)}


function VisualCharts(){
    
    
    const {visualsSugg:visuals_sugg}= useContext(DataRequestContext)
    // if(!data.length, !chartType) return null
    return(
        <section className="grid grid-cols-2 gap-x-5 gap-y-8 w-full items-start">
           {visuals_sugg?.map(({plot_type, title, aggregate, description,x,y,group_by,z, why},ind)=>{
                    return(
                        <Fragment key={ind}>
                            <ChartComponent 
                                plot_type={plot_type} title={title}
                                x={x} y={y} z={z}
                                description={description}
                                group_by={group_by}
                                why={why} aggregate={aggregate}
                            />
                        </Fragment>
                    )
                }

            )} 
        </section>
    )
}

function ChartComponent({plot_type, x, z=null, y,why, title, description, group_by=null, aggregate}){
    const [chartType, setChartType]= useState(plot_type.split(',')[0])
    const [mount, setMount]= useState(false)
    const charts_done=[
        'histogram', 
        'box plot', 
        'violin plot', 
        'scatter plot', 
        'bubble chart',
        'bar chart',
        'radar chart',
        'matrix heatmap'
        ,'line chart'
        ,'line plot','pie chart',
        'radar plot', 'area chart'
    ]
    const componentMap = {
        'histogram': HistogramGrouped,'box plot': BoxPlot,
        'violin plot': ViolinPlot, 'scatter plot': ScatterPlot,
        'radar chart': RadarChart, 'bar chart': BarChart,
        'bubble chart': BubbleChart, 'pie chart':PieChart,
        'matrix heatmap':HeatmapChart,   
        'line chart':LinePlot,
        'line plot':LinePlot,   
        'radar plot':RadarChart,
        'area chart': AreaChart, 
        // 'line chart': LinePlot,'pie chart':PieChart, 'chloropleth map': ChloroplethMap, 
        // 'bar chart': BarChart, 'stacked bar chart': StackedBarChart,
        // 'grouped bar chart':GroupedBarChart, 'swarm plot': SwarmPlot
    };
    const Chart= useMemo(()=>{
        if(!chartType) return null
        return componentMap[chartType]
    },[chartType])
    let aggregation='count'
    if(title?.toLowerCase()?.includes('sum') || description?.toLowerCase()?.includes('sum')){
            aggregation='sum'
        }
    if(title?.toLowerCase()?.includes('total') || description?.toLowerCase()?.includes('total')){
            aggregation='sum'
        }
    else if(title?.toLowerCase()?.includes('average') || description?.toLowerCase()?.includes('average')){
        aggregation='average'
    }
    else if (title?.toLowerCase()?.includes('frequency') || description?.toLowerCase()?.includes('frequency') || title?.toLowerCase()?.includes('count') || description?.toLowerCase()?.includes('count') ){
        aggregation='count'
    }
    // if(!mount) return null
    if(!charts_done.includes(chartType)) return null 
    return(
        <div className="relative">
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-x-2">
                    <p className="">{title}</p>

                    {plot_type.split(',').length>1?
                        <div className="">
                            <SelectOption options={plot_type.split(',').map((opt)=>(opt.trim()))}
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
                    aggregation={ aggregate || aggregation} 
                    why={why}
                    z={z} title={title} description={description}
                />
            </div>
        </div>
    )
}

function analyzeColumnsOnce({data, request}) {
  const result = {
    unique: {},
    categorical: {},
    numerical: {},
    date: {},
  };

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

function response_data(){
    const data= {
    "status": "success",
    "message": "Request created",
    "data": {
      "request": {
        "columns": [
          "Store",
          "Date",
          "Weekly_Sales",
          "Holiday_Flag",
          "Temperature",
          "Fuel_Price",
          "CPI",
          "Unemployment"
        ],
        "description": "This dataset represents weekly sales records of one of the largest retail chains in the world. It includes information about store identifiers, weekly sales figures, holidays, weather conditions, fuel prices, consumer price index (CPI), and unemployment rate.",
        "goal": "To analyze how various economic and environmental factors, such as temperature, fuel price, CPI, and unemployment, influence the store's weekly sales. The analysis can also help build a machine learning model to forecast sales and identify cost-reduction opportunities.",
        "indices": [
          "Store",
          "Date"
        ],
        "sample_data": [
          {
            "Store": 1,
            "Date": "2010-02-05",
            "Weekly_Sales": 1643690.9,
            "Holiday_Flag": 0,
            "Temperature": 42.31,
            "Fuel_Price": 2.572,
            "CPI": 211.0963582,
            "Unemployment": 8.106
          },
          {
            "Store": 2,
            "Date": "2010-02-05",
            "Weekly_Sales": 1641957.44,
            "Holiday_Flag": 0,
            "Temperature": 38.51,
            "Fuel_Price": 2.548,
            "CPI": 211.2421698,
            "Unemployment": 8.324
          },
          {
            "Store": 3,
            "Date": "2010-02-05",
            "Weekly_Sales": 1611968.17,
            "Holiday_Flag": 0,
            "Temperature": 39.93,
            "Fuel_Price": 2.514,
            "CPI": 210.7501048,
            "Unemployment": 8.623
          }
        ],
        "file_url": [],
        "categorical_columns": [
          "Store",
          "Holiday_Flag"
        ],
        "numerical_columns": [
          "Weekly_Sales",
          "Temperature",
          "Fuel_Price",
          "CPI",
          "Unemployment"
        ],
        "date_columns": [
          "Date"
        ],
        "unique_columns": [
          "Store",
          "Date"
        ],
        "suggestions": [],
        "status": "active",
        "chatGPT_response": [],
        "_id": "68e0e193e440392ee57b7af5",
        "createdAt": "2025-10-04T08:57:55.910Z",
        "updatedAt": "2025-10-04T08:57:55.910Z",
        "__v": 0
      },
      "visuals_sugg": [
        {
          "plot_type": "line chart",
          "title": "Weekly Sales Over Time by Store",
          "description": "Trends of weekly sales for each store across the full time period.",
          "x": "Date",
          "y": "Weekly_Sales",
          "group_by": "Store",
          "why": "Highlights seasonality, store-level trends, and anomalies that can inform forecasting and store benchmarking."
        },
        {
          "plot_type": "area chart",
          "title": "Total Weekly Sales Over Time (All Stores)",
          "description": "Aggregated total weekly sales across all stores to show overall trend and seasonality.",
          "x": "Date",
          "y": "Weekly_Sales",
          "group_by": "None",
          "why": "Gives an overall view of demand cycles to guide forecasting and capacity planning."
        },
        {
          "plot_type": "area chart, line chart",
          "title": "Weekly Sales Over Time by Holiday vs Non-Holiday",
          "description": "Compares weekly sales dynamics during holiday weeks versus non-holiday weeks.",
          "x": "Date",
          "y": "Weekly_Sales",
          "group_by": "Holiday_Flag",
          "why": "Quantifies holiday impact on sales to support promotional planning and inventory decisions."
        },
        {
          "plot_type": "box plot",
          "title": "Weekly Sales Distribution by Holiday Flag",
          "description": "Distribution of weekly sales during holiday (1) and non-holiday (0) weeks.",
          "x": "Holiday_Flag",
          "y": "Weekly_Sales",
          "why": "Shows median and variability differences that indicate uplift and volatility around holidays."
        },
        {
          "plot_type": "violin plot",
          "title": "Weekly Sales Distribution by Store",
          "description": "Distribution of weekly sales for each store.",
          "x": "Store",
          "y": "Weekly_Sales",
          "why": "Reveals store performance dispersion and outliers to identify best/worst performers."
        },
        {
          "plot_type": "scatter plot",
          "title": "Weekly Sales vs Temperature",
          "description": "Relationship between temperature and weekly sales, differentiated by holiday flag.",
          "x": "Temperature",
          "y": "Weekly_Sales",
          "group_by": "Holiday_Flag",
          "why": "Assesses weather sensitivity and whether holidays moderate the temperature-sales effect."
        },
        {
          "plot_type": "scatter plot",
          "title": "Weekly Sales vs Unemployment",
          "description": "Relationship between unemployment rate and weekly sales, split by holiday flag.",
          "x": "Unemployment",
          "y": "Weekly_Sales",
          "group_by": "Holiday_Flag",
          "why": "Evaluates macroeconomic pressure on demand and possible differences during holiday periods."
        },
        {
          "plot_type": "bubble chart",
          "title": "Fuel Price vs Weekly Sales Sized by CPI",
          "description": "Fuel price on the x-axis, sales on the y-axis, CPI encoded as bubble size; color by holiday flag.",
          "x": "Fuel_Price",
          "y": "Weekly_Sales",
          "z": "CPI",
          "group_by": "Holiday_Flag",
          "why": "Explores combined effects of fuel costs and inflation on sales with holiday context."
        },
        {
          "plot_type": "scatter plot",
          "title": "Weekly Sales vs CPI",
          "description": "Direct relationship between CPI and weekly sales.",
          "x": "CPI",
          "y": "Weekly_Sales",
          "group_by": "Holiday_Flag",
          "why": "Tests price-level sensitivity of demand to inform pricing and promotions."
        },
        {
          "plot_type": "heatmap",
          "title": "Correlation Matrix of Sales and Drivers",
          "description": "Correlation heatmap for Weekly_Sales, Temperature, Fuel_Price, CPI, and Unemployment.",
          "x": [
            "Weekly_Sales",
            "Temperature",
            "Fuel_Price",
            "CPI",
            "Unemployment"
          ],
          "y": [
            "Weekly_Sales",
            "Temperature",
            "Fuel_Price",
            "CPI",
            "Unemployment"
          ],
          "why": "Quickly identifies linear relationships to guide feature selection for forecasting models."
        }
      ]
    }
  }
    return data
}
