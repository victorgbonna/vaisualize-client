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
        fetch("/vaisualize_test_files/gdp.csv")
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
          "Country",
          "2005",
          "2006",
          "2007",
          "2008",
          "2009",
          "2010",
          "2011",
          "2012",
          "2013",
          "2014",
          "2015",
          "2016",
          "2017",
          "2018",
          "2019",
          "2020",
          "2021",
          "2022",
          "2023",
          "2024",
          "2025"
        ],
        "description": "This dataset provides annual GDP data for 196 countries from 2005 to 2025, measured in USD billions. Data is sourced from the IMF and includes both historical (2005–2024) and projected (2025) values. It captures major global economic events such as the 2008 financial crisis and the 2020 COVID-19 pandemic. Some values may be missing for countries that did not report data.",
        "goal": "Enable analysis of global and regional GDP growth, build forecasting models, benchmark economic performance, assess impacts of global crises, and support visualization, education, and policy research.",
        "indices": [
          "Country"
        ],
        "sample_data": [
          {
            "2005": 6167,
            "2010": 15325,
            "2015": 20057,
            "2020": 20136,
            "2025": null,
            "Country": "Afghanistan"
          },
          {
            "2005": 8148,
            "2010": 12079,
            "2015": 11525,
            "2020": 15271,
            "2025": 28372,
            "Country": "Albania"
          },
          {
            "2005": 107047,
            "2010": 177785,
            "2015": 187494,
            "2020": 164774,
            "2025": 268885,
            "Country": "Algeria"
          }
        ],
        "file_url": [],
        "categorical_columns": [
          "Country"
        ],
        "numerical_columns": [
          "2005",
          "2006",
          "2007",
          "2008",
          "2009",
          "2010",
          "2011",
          "2012",
          "2013",
          "2014",
          "2015",
          "2016",
          "2017",
          "2018",
          "2019",
          "2020",
          "2021",
          "2022",
          "2023",
          "2024",
          "2025"
        ],
        "date_columns": [],
        "unique_columns": [
          "Country"
        ],
        "suggestions": [],
        "status": "active",
        "chatGPT_response": [],
        "_id": "68e0f6fcebbd5dd97cff9423",
        "createdAt": "2025-10-04T10:29:16.265Z",
        "updatedAt": "2025-10-04T10:29:16.265Z",
        "__v": 0
      },
      "visuals_sugg": [
          {
            "plot_type": "area chart",
            "title": "Global GDP (Sum) 2005–2025",
            "description": "Total world GDP by year (sum across all countries), showing historical levels and the 2025 projection.",
            "x": "Year",
            "y": "Global GDP (USD billions, sum across countries)",
            "why": "Aggregating to the global level highlights macro trends and the impact of events like 2008 and 2020."
          },
          {
            "plot_type": "line chart",
            "title": "GDP Trajectories by Country (2005–2025)",
            "description": "Country-level GDP over time; filter to a subset (e.g., top economies or regions) for clarity.",
            "x": "Year",
            "y": "GDP (USD billions)",
            "group_by": "Country",
            "why": "Enables benchmarking and comparative analysis of economic performance over time."
          },
          {
            "plot_type": "heatmap",
            "title": "GDP Heatmap by Country and Year",
            "description": "Color-encoded GDP values for each country-year, revealing patterns, outliers, and structural shifts.",
            "x": "Year",
            "y": "Country",
            "z": "GDP (USD billions)",
            "why": "Compactly shows cross-country and temporal variation; missing values are easily spotted."
          },
          {
            "plot_type": "bar chart",
            "title": "Top 10 Economies: 2024 Projection",
            "description": "2024 actual GDP for the top 10 countries by 2024 GDP.",
            "x": "Country",
            "y": '2024',
            'aggregate':'sum',
            "why": "Highlights near-term changes and projected shifts among the largest economies."
          },
          {
            "plot_type": "line chart",
            "title": "YoY GDP Growth Rate by Country",
            "description": "Year-over-year percent growth of GDP for each country; smooth or filter to selected countries as needed.",
            "x": "Year",
            "y": "YoY Growth (%)",
            "group_by": "Country",
            "why": "Growth rates normalize size differences and reveal expansions, recessions, and volatility."
          },
          {
            "plot_type": "bubble chart, scatter plot",
            "title": "Financial Crisis Impact: 2008 vs 2009 GDP",
            "description": "Each point is a country; position shows 2008 vs 2009 GDP, bubble size encodes percent change.",
            "x": "2008",
            "y": "2009",
            "z": "YoY change (%) to 2009",
            "why": "Points below the diagonal indicate contraction in 2009, quantifying the 2008–09 shock."
          },
          {
            "plot_type": "box plot",
            "title": "Distribution of YoY Growth During COVID-19",
            "description": "Cross-country distribution of YoY growth for 2020 (vs 2019) and 2021 (vs 2020).",
            "x": "Year (YoY label: 2020, 2021)",
            "y": "YoY Growth (%)",
            "why": "Summarizes how broadly countries contracted in 2020 and recovered in 2021."
          },
          {
            "plot_type": "violin plot, box plot",
            "title": "GDP Distribution Across Countries in Key Years",
            "description": "Distribution of country GDPs for 2007, 2009, 2020, and 2025 to compare pre/post-crisis and projections.",
            "x": "Year (2007, 2009, 2020, 2025)",
            "y": "GDP (USD billions)",
            "why": "Shows changes in dispersion and skewness across major economic periods."
          },
          {
            "plot_type": "pie chart",
            "title": "Share of Global GDP by Country (Top 10) — 2024",
            "description": "Top 10 countries by 2024 GDP plus an 'Others' slice to show concentration of global GDP.",
            "x": "Country",
            "y": "2024",
            "aggregate":'total',
            "why": "Communicates how GDP is concentrated among leading economies."
          },
          {
            "plot_type": "scatter plot",
            "title": "Pre- vs Post-COVID Growth: Country CAGRs",
            "description": "Each point is a country; compares CAGR in 2005–2019 to CAGR in 2019–2024.",
            "x": "CAGR 2005–2019 (%)",
            "y": "CAGR 2019–2024 (%)",
            "why": "Identifies countries with structural growth slowdowns or accelerations after COVID-19."
          },
          {
            "plot_type": "heatmap",
            "title": "Missing GDP Data Matrix",
            "description": "Binary heatmap of data availability (present/missing) by country and year.",
            "x": "Year",
            "y": "Country",
            "z": "Missing (1 if null, 0 otherwise)",
            "why": "Helps assess data quality and informs imputation or filtering strategies."
          }
        ]
    }
  }
    return data
}
