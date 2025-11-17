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
        fetch("/vaisualize_test_files/smoking_health.csv")
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
            "age",
            "sex",
            "current_smoker",
            "heart_rate",
            "blood_pressure",
            "cigs_per_day",
            "chol"
            ],
            "description": "This dataset is a filtered subset of a Hypertension Risk dataset (originally by Md Raihan Kahn), refocused on smoking-related health patterns. It highlights differences between smokers and non-smokers, with surprising findings about age groups among the heaviest smokers. It includes demographic, lifestyle, and health indicators relevant to cardiovascular risk.",
            "goal": "Enable exploration of health impacts of smoking vs. non-smoking, analyze smoking patterns by age and sex, and study cardiovascular health markers (cholesterol, blood pressure, heart rate) in relation to smoking behavior.",
            "indices": [],
            "sample_data": [
            {
                "age": 54,
                "sex": "male",
                "current_smoker": "yes",
                "heart_rate": 95,
                "blood_pressure": "110/72",
                "cigs_per_day": null,
                "chol": 219
            },
            {
                "age": 45,
                "sex": "male",
                "current_smoker": "yes",
                "heart_rate": 64,
                "blood_pressure": "121/72",
                "cigs_per_day": null,
                "chol": 248
            },
            {
                "age": 58,
                "sex": "male",
                "current_smoker": "yes",
                "heart_rate": 81,
                "blood_pressure": "127.5/76",
                "cigs_per_day": null,
                "chol": 235
            }
            ],
            "file_url": [],
            "categorical_columns": [
            "sex",
            "current_smoker",
            "blood_pressure"
            ],
            "numerical_columns": [
            "age",
            "heart_rate",
            "cigs_per_day",
            "chol"
            ],
            "date_columns": [],
            "unique_columns": [],
            "suggestions": [],
            "status": "active",
            "chatGPT_response": [],
            "_id": "68e0fae28260073475c10d8c",
            "createdAt": "2025-10-04T10:45:54.479Z",
            "updatedAt": "2025-10-04T10:45:54.479Z",
            "__v": 0
        },
        "visuals_sugg": [
            {
            "plot_type": "histogram",
            "title": "Age Distribution by Smoking Status",
            "description": "Histogram of participant ages, split by current smoker status to compare age profiles.",
            "x": "age",
            "y": "count",
            "group_by": "current_smoker",
            "why": "Reveals whether smokers cluster in specific age ranges versus non-smokers."
            },
            {
            "plot_type": "bar chart",
            "title": "Smoking Prevalence by Sex",
            "description": "Counts or proportions of current smokers vs non-smokers within each sex.",
            "x": "sex",
            "y": "count",
            "group_by": "current_smoker",
            "why": "Highlights sex differences in smoking rates."
            },
            {
            "plot_type": "box plot, violin plot",
            "title": "Cholesterol Levels by Smoking Status and Sex",
            "description": "Distribution of cholesterol (mg/dL) across smoker vs non-smoker groups, split by sex.",
            "x": "current_smoker",
            "y": "chol",
            "group_by": "sex",
            "why": "Assesses how smoking relates to cholesterol with sex-specific patterns."
            },
            {
            "plot_type": "box plot, violin plot",
            "title": "Resting Heart Rate by Smoking Status",
            "description": "Distribution of resting heart rate among smokers and non-smokers.",
            "x": "current_smoker",
            "y": "heart_rate",
            "why": "Evaluates whether smoking is associated with elevated resting heart rate."
            },
            {
            "plot_type": "scatter plot",
            "title": "Age vs Cholesterol Colored by Smoking Status",
            "description": "Scatter of age against cholesterol, colored by current smoker status.",
            "x": "age",
            "y": "chol",
            "group_by": "current_smoker",
            "why": "Separates age-related cholesterol trends by smoker status."
            },
            {
            "plot_type": "histogram",
            "title": "Distribution of Cigarettes per Day (Current Smokers)",
            "description": "Histogram of cigarettes per day for current smokers (exclude nulls), optionally split by sex.",
            "x": "cigs_per_day",
            "y": "count",
            "group_by": "sex",
            "why": "Characterizes smoking intensity and differences by sex among smokers."
            },
            {
            "plot_type": "bubble chart",
            "title": "Age vs Cigarettes per Day with Cholesterol as Bubble Size",
            "description": "For current smokers, plots age against cigarettes per day; bubble size indicates cholesterol.",
            "x": "age",
            "y": "cigs_per_day",
            "z": "chol",
            "group_by": "sex",
            "why": "Links smoking intensity and cholesterol across ages, with sex differences."
            },
            {
            "plot_type": "heatmap",
            "title": "Correlation Heatmap of Numeric Health Metrics",
            "description": "Pairwise correlations among age, heart rate, cigarettes per day, and cholesterol.",
            "x": [
                "age",
                "heart_rate",
                "cigs_per_day",
                "chol"
            ],
            "y": [
                "age",
                "heart_rate",
                "cigs_per_day",
                "chol"
            ],
            "why": "Quantifies linear relationships to guide deeper analysis of risk markers."
            },
            {
            "plot_type": "bar chart",
            "title": "Most Frequent Blood Pressure Readings by Smoking Status",
            "description": "Counts of the most common blood_pressure readings within smokers vs non-smokers (treat readings as categories; consider showing top N to avoid clutter).",
            "x": "blood_pressure",
            "y": "count",
            "group_by": "current_smoker",
            "why": "Provides a coarse view of blood pressure patterns despite BP being stored as text."
            },
            {
            "plot_type": "line chart",
            "title": "Mean Cholesterol by Age (Binned) and Smoking Status",
            "description": "Average cholesterol computed within age bins, with separate lines for smokers and non-smokers.",
            "x": "age",
            "y": "chol",
            "group_by": "current_smoker",
            "why": "Shows how cholesterol changes with age and whether patterns differ by smoking status."
            }
        ]
        }
    }
    return data
}
