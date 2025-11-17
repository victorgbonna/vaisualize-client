"use client";
import { Fragment, useContext, useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import ChartLayout from "@/components/default";

import {RadarChart,HistogramGrouped, BoxPlot, ViolinPlot, ScatterPlot, BubbleChart, BarChart, HeatmapChart, LinePlot, AreaChart, PieChart} from "@/components/chart/chartTools";
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
        fetch("/vaisualize_test_files/cryptocurrency.csv")
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
           {visuals_sugg?.map(({plot_type, title, description,x,y,group_by,z, why},ind)=>{
                    return(
                        <Fragment key={ind}>
                            <ChartComponent 
                                plot_type={plot_type} title={title}
                                x={x} y={y} z={z}
                                description={description}
                                group_by={group_by}
                                why={why}
                            />
                        </Fragment>
                    )
                }

            )} 
        </section>
    )
}

function ChartComponent({plot_type, x, z=null, y,why, title, description, group_by=null}){
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
                    aggregation={aggregation} 
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
          "timestamp",
          "name",
          "symbol",
          "price_usd",
          "vol_24h",
          "total_vol",
          "chg_24h",
          "chg_7d",
          "market_cap"
        ],
        "description": "This dataset contains hourly cryptocurrency and stock market data collected from Coingecko starting in March 2025. The pipeline demonstrates practical ETL and automation skills with ingestion via Python, offloading into BigQuery, and publishing to Kaggle. It is continuously updated and suitable for SQL practice, EDA, time-series forecasting, and correlation analysis between global assets.",
        "goal": "Provide a reproducible, continuously updated dataset for monitoring cryptocurrency markets, practicing SQL, exploring time-series analysis, and building machine learning models for forecasting.",
        "indices": [
          "timestamp",
          "symbol"
        ],
        "sample_data": [
          {
            "timestamp": "2025-10-04 10:39:04",
            "name": "Wrapped stETH",
            "symbol": "wsteth",
            "price_usd": "$5,473.68",
            "vol_24h": "$16,967,327.00",
            "total_vol": "0.00%",
            "chg_24h": "+0.95%",
            "chg_7d": "+12.10%",
            "market_cap": "$17,717,180,801"
          },
          {
            "timestamp": "2025-10-04 10:39:04",
            "name": "Wrapped Beacon ETH",
            "symbol": "wbeth",
            "price_usd": "$4,858.33",
            "vol_24h": "$10,005,863.00",
            "total_vol": "0.00%",
            "chg_24h": "+0.96%",
            "chg_7d": "+12.01%",
            "market_cap": "$15,858,554,368"
          },
          {
            "timestamp": "2025-10-04 10:39:04",
            "name": "Figure Heloc",
            "symbol": "figr_heloc",
            "price_usd": "$1.01",
            "vol_24h": "$16,646,092.00",
            "total_vol": "0.00%",
            "chg_24h": "+0.05%",
            "chg_7d": "-1.60%",
            "market_cap": "$12,943,728,044"
          }
        ],
        "file_url": [],
        "categorical_columns": [
          "name",
          "symbol"
        ],
        "numerical_columns": [
          "price_usd",
          "vol_24h",
          "chg_24h",
          "chg_7d",
          "market_cap"
        ],
        "date_columns": [
          "timestamp"
        ],
        "unique_columns": [
          "timestamp",
          "symbol"
        ],
        "suggestions": [],
        "status": "active",
        "chatGPT_response": [],
        "_id": "68e0f3c4043515411307d586",
        "createdAt": "2025-10-04T10:15:32.305Z",
        "updatedAt": "2025-10-04T10:15:32.305Z",
        "__v": 0
      },
      "visuals_sugg": [
        {
          "plot_type": "line chart",
          "title": "Hourly Price Trends by Asset",
          "description": "Multi-series line chart of price_usd over time, grouped by symbol. Filter to top N by market_cap to avoid clutter.",
          "x": "timestamp",
          "y": "price_usd",
          "group_by": "symbol",
          "why": "Tracks intraday momentum and regime shifts; ideal for monitoring and forecasting."
        },
        {
          "plot_type": "area chart",
          "title": "Total Market Capitalization Over Time",
          "description": "Area chart of the aggregated (sum) market_cap across all symbols per timestamp.",
          "x": "timestamp",
          "y": "market_cap",
          "why": "Shows overall market growth/decline and cycles at an hourly granularity."
        },
        {
          "plot_type": "bar chart",
          "title": "Top Movers: 24h Change by Asset (Latest Hour)",
          "description": "Sorted bar chart of chg_24h for the most recent timestamp to identify winners and losers.",
          "x": "symbol",
          "y": "chg_24h",
          "why": "Quick snapshot of short-term performance for monitoring and alerts."
        },
        {
          "plot_type": "scatter plot",
          "title": "Momentum Map: 7d vs 24h Percentage Change",
          "description": "Scatter of chg_7d (x) vs chg_24h (y) per symbol at the latest timestamp; quadrants indicate trend continuation or reversals.",
          "x": "chg_7d",
          "y": "chg_24h",
          "group_by": "symbol",
          "why": "Assesses momentum and mean-reversion candidates at a glance."
        },
        {
          "plot_type": "bubble chart",
          "title": "Liquidity vs. Price with Market Cap Size (Latest Hour)",
          "description": "Bubble plot of vol_24h (x) vs price_usd (y) with bubble size by market_cap for the latest snapshot.",
          "x": "vol_24h",
          "y": "price_usd",
          "z": "market_cap",
          "group_by": "symbol",
          "why": "Highlights liquid, large-cap assets and potential outliers."
        },
        {
          "plot_type": "heatmap",
          "title": "Correlation Matrix of Market Metrics",
          "description": "Heatmap of pairwise correlations among {price_usd, vol_24h, chg_24h, chg_7d, market_cap} using aligned hourly data.",
          "x": "metric",
          "y": "metric",
          "z": "correlation",
          "why": "Reveals relationships useful for feature engineering and risk management."
        },
        {
          "plot_type": "area chart",
          "title": "Stacked 24h Volume by Asset Over Time (Top N)",
          "description": "Stacked area of vol_24h by symbol across timestamps. Optionally normalize to percentage to view share of volume.",
          "x": "timestamp",
          "y": "vol_24h",
          "group_by": "symbol",
          "why": "Shows shifts in trading activity and market participation over time."
        },
        {
          "plot_type": "box plot,violin plot",
          "title": "Price Dispersion by Asset (Last 7 Days)",
          "description": "Distribution of hourly price_usd per symbol over the last 7 days.",
          "x": "symbol",
          "y": "price_usd",
          "why": "Compares volatility and tail behavior across assets."
        },
        {
          "plot_type": "x heatmap",
          "title": "Intraday Volume Seasonality",
          "description": "Average vol_24h by hour_of_day (derived from timestamp) and day_of_week to uncover time-of-day/week patterns.",
          "x": "hour_of_day",
          "y": "day_of_week",
          "z": "avg_vol_24h",
          "why": "Supports scheduling of trades and detecting predictable liquidity windows."
        },
        {
          "plot_type": "pie chart",
          "title": "Market Cap Share by Asset (Latest Hour)",
          "description": "Pie chart of each symbol’s share of total market_cap at the most recent timestamp. Filter to top N and group the rest as 'Other'.",
          "x": "symbol",
          "y": "market_cap",
          "why": "Summarizes market dominance and concentration at a glance."
        }
      ]
    }
  }
    return data
}
