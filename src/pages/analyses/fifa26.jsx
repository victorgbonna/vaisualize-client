"use client";
import { Fragment, useContext, useEffect, useMemo, useState } from "react";
import Papa from "papaparse";
import ChartLayout from "@/components/default";
// import data_json from "@/data/extracted_responses2.json";
// import { AreaChart, BarChart, BoxPlot, 
//     BubbleChart, ChloroplethMap, GroupedBarChart, HeatmapChart, 
//     HistogramGrouped, 
//     LinePlot, PieChart, RadarPlot, ScatterPlot, 
//     StackedBarChart, SwarmPlot, ViolinPlot } from "@/components/chart/chartTools";

import {HistogramGrouped, BoxPlot, ViolinPlot, ScatterPlot, BubbleChart, BarChart, HeatmapChart,RadarChart} from "@/components/chart/chartTools";
import { SelectOption } from "@/components";
import { consolelog } from "@/configs";
import { DataRequestContext, UseDataRequestContextComponent } from "@/context";

export default function Analysis() {
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
        fetch("/vaisualize_test_files/fc26.csv")
        .then((res) => res.text())
        .then((csvText) => {
            const result = Papa.parse(csvText, {
                header: true,
                skipEmptyLines: true,
            });
            const {visuals_sugg, request}= response_data().data
            setData(result.data);
            setRequest(request)
            consolelog({visuals_sugg})
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
           {visuals_sugg?.map(({plot_type, title, description,x,y,group_by,z},ind)=>{
                    return(
                        <Fragment key={ind}>
                            <ChartComponent 
                                plot_type={plot_type} title={title}
                                x={x} y={y} z={z}
                                description={description}
                                group_by={group_by}
                            />
                        </Fragment>
                    )
                }

            )} 
        </section>
    )
}

function ChartComponent({plot_type, x, z=null, y, title, description, group_by=null}){
    const [chartType, setChartType]= useState(plot_type.split(', ')[0])
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
    ]
    const componentMap = {
        'histogram': HistogramGrouped,'box plot': BoxPlot,
        'violin plot': ViolinPlot, 'scatter plot': ScatterPlot,
        'radar chart': RadarChart, 'bar chart': BarChart,
        'bubble chart': BubbleChart,
        'matrix heatmap':HeatmapChart,   
        // 'area chart': AreaChart, 'line chart': LinePlot,'pie chart':PieChart, 'chloropleth map': ChloroplethMap, 
        // 'bar chart': BarChart, 'stacked bar chart': StackedBarChart,
        // 'grouped bar chart':GroupedBarChart, 'swarm plot': SwarmPlot
    };
    const Chart= useMemo(()=>{
        return componentMap[chartType]
    },[chartType])
    let aggregation='count'
    if(title?.toLowerCase()?.includes('sum') || description?.toLowerCase()?.includes('sum')){
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
                    x={[x]} y={[y]} group_by={group_by} 
                    aggregation={aggregation} 
                    z={z}
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
    const data={
    "status": "success",
    "message": "Request created",
    "data": {
      "request": {
        "columns": [
          "player_id",
          "player_url",
          "short_name",
          "long_name",
          "age",
          "dob",
          "height_cm",
          "weight_kg",
          "nationality",
          "club_name",
          "league_name",
          "overall",
          "potential",
          "value_eur",
          "wage_eur",
          "preferred_foot",
          "international_reputation",
          "weak_foot",
          "skill_moves",
          "attacking_crossing",
          "attacking_finishing",
          "defending_marking",
          "goalkeeping_diving",
          "goalkeeping_handling",
          "goalkeeping_speed",
          "goalkeeping_reflexes",
          "pace",
          "shooting",
          "passing",
          "dribbling",
          "defending",
          "physic"
        ],
        "description": "This dataset contains detailed player information from EA Sports FC 26, scraped from sofifa.com. It includes personal info (dob, height, weight, nationality), player ratings (overall, potential, skill attributes), financials (value, wage), and contextual details (club, league, national team). Intended for research and educational purposes.",
        "goal": "Support football analytics research, player scouting simulations, performance prediction models, sports data visualization, and educational exercises in data science.",
        "indices": [
          "player_id"
        ],
        "sample_data": [
          {
            "player_id": 270717,
            "short_name": "L. Messi",
            "long_name": "Lionel Messi",
            "age": 38,
            "dob": "1987-06-24",
            "overall": 87,
            "potential": 87,
            "club_name": "Inter Miami",
            "league_name": "Major League Soccer"
          },
          {
            "player_id": 20801,
            "short_name": "C. Ronaldo",
            "long_name": "Cristiano Ronaldo",
            "age": 40,
            "dob": "1985-02-05",
            "overall": 83,
            "potential": 83,
            "club_name": "Al Nassr",
            "league_name": "Saudi Pro League"
          },
          {
            "player_id": 231747,
            "short_name": "K. De Bruyne",
            "long_name": "Kevin De Bruyne",
            "age": 34,
            "dob": "1991-06-28",
            "overall": 90,
            "potential": 90,
            "club_name": "Manchester City",
            "league_name": "Premier League"
          }
        ],
        "file_url": [],
        "categorical_columns": [
          "short_name",
          "long_name",
          "nationality",
          "club_name",
          "league_name",
          "preferred_foot"
        ],
        "numerical_columns": [
          "age",
          "height_cm",
          "weight_kg",
          "overall",
          "potential",
          "value_eur",
          "wage_eur",
          "international_reputation",
          "weak_foot",
          "skill_moves",
          "attacking_crossing",
          "attacking_finishing",
          "defending_marking",
          "goalkeeping_diving",
          "goalkeeping_handling",
          "goalkeeping_speed",
          "goalkeeping_reflexes",
          "pace",
          "shooting",
          "passing",
          "dribbling",
          "defending",
          "physic"
        ],
        "date_columns": [
          "dob"
        ],
        "unique_columns": [
          "player_id"
        ],
        "suggestions": [],
        "status": "active",
        "chatGPT_response": [],
        "_id": "68e0f8afbeefb13f88bde3d9",
        "createdAt": "2025-10-04T10:36:31.707Z",
        "updatedAt": "2025-10-04T10:36:31.707Z",
        "__v": 0
      },
      "visuals_sugg": [
        {
          "plot_type": "histogram",
          "title": "Age Distribution of Players",
          "description": "Shows the distribution of player ages across the dataset to understand experience mix.",
          "x": "age",
          "y": "count",
          "why": "Age structure informs scouting pipelines and career stage analysis."
        },
        {
          "plot_type": "box plot",
          "title": "Overall Rating by League",
          "description": "Compares the distribution of overall ratings across leagues (median, spread, outliers).",
          "x": "league_name",
          "y": "overall",
          "why": "Highlights league strength and variability for benchmarking and transfer targeting."
        },
        {
          "plot_type": "scatter plot, bubble chart",
          "title": "Age vs Overall (Bubble size = Potential)",
          "description": "Plots player age against overall rating; bubble size encodes potential and color groups by preferred foot.",
          "x": "age",
          "y": "overall",
          "z": "potential",
          "group_by": "preferred_foot",
          "why": "Useful for identifying undervalued older/younger players and growth ceilings."
        },
        {
          "plot_type": "bubble chart, scatter plot",
          "title": "Market Value vs Overall (Bubble size = Wage)",
          "description": "Shows how market value relates to overall rating; bubble size reflects wage and colors denote leagues.",
          "x": "overall",
          "y": "value_eur",
          "z": "wage_eur",
          "group_by": "league_name",
          "why": "Supports valuation benchmarking and wage-value efficiency scouting by league."
        },
        {
          "plot_type": "heatmap",
          "title": "Correlation Heatmap of Player Attributes",
          "description": "Correlation matrix across all numerical attributes to reveal relationships and redundancy.",
          "x": [
            "age",
            "height_cm",
            "weight_kg",
            "overall",
            "potential",
            "value_eur",
            "wage_eur",
            "international_reputation",
            "weak_foot",
            "skill_moves",
            "attacking_crossing",
            "attacking_finishing",
            "defending_marking",
            "goalkeeping_diving",
            "goalkeeping_handling",
            "goalkeeping_speed",
            "goalkeeping_reflexes",
            "pace",
            "shooting",
            "passing",
            "dribbling",
            "defending",
            "physic"
          ],
          "y": [
            "age",
            "height_cm",
            "weight_kg",
            "overall",
            "potential",
            "value_eur",
            "wage_eur",
            "international_reputation",
            "weak_foot",
            "skill_moves",
            "attacking_crossing",
            "attacking_finishing",
            "defending_marking",
            "goalkeeping_diving",
            "goalkeeping_handling",
            "goalkeeping_speed",
            "goalkeeping_reflexes",
            "pace",
            "shooting",
            "passing",
            "dribbling",
            "defending",
            "physic"
          ],
          "why": "Guides feature selection for predictive models and reveals linked skills (e.g., pace-dribbling)."
        },
        {
          "plot_type": "matrix heatmap",
          "title": "Correlation Heatmap of Player Attributes",
          "description": "Correlation matrix across all numerical attributes to reveal relationships and redundancy.",
          "x": "short_name",
          "y": [
            "overall",
            "potential",
            "attacking_crossing",
            "attacking_finishing",
            "defending_marking",
            "goalkeeping_diving",
            "goalkeeping_handling",
            "goalkeeping_speed",
            "goalkeeping_reflexes",
            "pace",
            "shooting",
            "passing",
            "dribbling",
            "defending",
            "physic"
          ],
          "z":"overall",
          "why": "Guides feature selection for predictive models and reveals linked skills (e.g., pace-dribbling)."
        },
        {
          "plot_type": "violin plot, box plot",
          "title": "Wage Distribution by League",
          "description": "Visualizes the distribution and spread of wages per league, including tails and multi-modality.",
          "x": "league_name",
          "y": "wage_eur",
          "why": "Shows compensation structure differences that impact transfer targets and budget planning."
        },
        {
          "plot_type": "bar chart",
          "title": "Top Clubs by Average Potential",
          "description": "Ranks clubs by mean potential (aggregate: mean), optionally filtered to clubs with sufficient sample size.",
          "x": "club_name",
          "y": "potential",
          "why": "Identifies academies/teams with strong growth prospects for scouting partnerships."
        },
        {
          "plot_type": "radar chart",
          "title": "Player Attribute Profiles (Pace/Shoot/Pass/Dribble/Defend/Physic)",
          "description": "Compares multi-attribute skill profiles across selected players.",
          "x": [
            "pace",
            "shooting",
            "passing",
            "dribbling",
            "defending",
            "physic"
          ],
          "y": [
            "pace",
            "shooting",
            "passing",
            "dribbling",
            "defending",
            "physic"
          ],
          "group_by": "short_name",
          "why": "Ideal for scouting reports and stylistic comparisons between players."
        },
        {
          "plot_type": "scatter plot, bubble chart",
          "title": "Dribbling vs Passing by Preferred Foot (Size = Skill Moves)",
          "description": "Maps technical ability by plotting dribbling against passing; bubble size encodes skill moves and color by preferred foot.",
          "x": "dribbling",
          "y": "passing",
          "z": "skill_moves",
          "group_by": "preferred_foot",
          "why": "Highlights creative profiles and two-footedness tendencies for role fit."
        },
        {
          "plot_type": "box plot, violin plot",
          "title": "Weak Foot Rating by Preferred Foot",
          "description": "Compares distributions of weak-foot ratings across left- and right-footed players.",
          "x": "preferred_foot",
          "y": "weak_foot",
          "why": "Assesses ambidexterity differences relevant to tactical flexibility."
        },
        {
          "plot_type": "bar chart",
          "title": "Average Wage by International Reputation",
          "description": "Shows mean wage for each international reputation level (aggregate: mean).",
          "x": "international_reputation",
          "y": "wage_eur",
          "why": "Quantifies market premium associated with global reputation."
        },
        {
          "plot_type": "scatter plot",
          "title": "Overall vs Potential",
          "description": "Plots overall against potential to identify underdeveloped talents (gap to potential).",
          "x": "overall",
          "y": "potential",
          "group_by": "league_name",
          "why": "Useful for talent ID and forecasting development trajectories by league context."
        }
      ]
    }
  }
    return data
}
