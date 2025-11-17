import { commafy, consolelog } from "@/configs"
import { useEffect, useMemo, useState } from "react";
import { RadarPlot, LinePlot, MultipleBarChart, PieChart } from "./chartTools";
import { ImageContainer } from '..';
import { EnterChatContext } from "@/context";
// import SwarmPlot from "./chartTools/SwarmPlot";


function General({data, monthOptions, season_data}){
    const stringWithNumbers = (x)=>{
        return x+''.split('').filter(char => !isNaN(char)).join(''); 
    }

    const updateGeneralOptions=(data)=>{
        if(!data) return {}
        const total_goal_scored=data.reduce(function (acc, obj) { 
            const stringWithNumbers = obj.total_goals+''.split('').filter(char => !isNaN(char)).join('');
            return acc + parseInt(stringWithNumbers); 
        }, 0);
        const tt_games_given=data.length

        const tt_cleansheet_kept=data.reduce(function (acc, obj) { 
            const {home_goals, away_goals}=obj
            const total_clean_sheets_for_the_match=(+home_goals==0?1:0)+(+away_goals==0?1:0)
            // const total_goal_for_the_match= parseInt(stringWithNumbers(home_goals))+parseInt(stringWithNumbers(away_goals))
            return acc +total_clean_sheets_for_the_match; 
        }, 0);

        const tt_goalless_min=data.reduce(function (acc, obj) { 
            const goalless_min_for_the_match=(+obj['min 1-15 goals']==0?15:0)+(+obj['min 16-30 goals']==0?15:0)+(+obj['min 31-45+ goals']==0?15:0)+(+obj['min 46-60 goals']==0?15:0)+(+obj['min 61-75 goals']==0?15:0)+(+obj['min 76-90 goals']==0?15:0)
            return acc +goalless_min_for_the_match; 
        }, 0);
        const tt_goalless_draws=data.reduce(function (acc, obj) { 
            const goalless_draws_for_the_match=obj.total_goals==0?1:0
            return acc +goalless_draws_for_the_match; 
        }, 0);
        const stoppage_goals= data.reduce(function (acc, obj) { 
            return acc+parseInt(obj['stoppage_time goals'])
        }, 0);

        const end_time_stoppage_goals= data.reduce(function (acc, obj) { 
            return acc+parseInt(obj['90+ goals']) 
        }, 0);
        const fst_half_goals= data.reduce(function (acc, obj) { 
            return acc+parseInt(obj['1st_half goals']) 
        }, 0);
        const away_wins= data.reduce(function (acc, obj) { 
            const if_away_won=(parseInt(obj['away_goals'])>parseInt(obj['home_goals']))?1:0
            return acc+if_away_won 
        }, 0);

        //second visuals
        const {
            one_to_15,sixtn_to_30,thrty_1_to_45,
            frty_6_to_60,sxty_1_to_75,seventy_6_to_90
        }=data.reduce(function (acc, obj) { 
            // console.log('min is'+acc.sixty_1_to_75+' '+obj['min 61-75 goals'])
            acc.one_to_15+=parseInt(obj['min 1-15 goals'])
            acc.sixtn_to_30+=parseInt(obj['min 16-30 goals'])
            acc.thrty_1_to_45+=parseInt(obj['min 31-45+ goals'])
            acc.frty_6_to_60+=parseInt(obj['min 46-60 goals'])
            acc.sxty_1_to_75+=parseInt(obj['min 61-75 goals'])
            acc.seventy_6_to_90+=parseInt(obj['min 76-90+ goals'])
            return acc
        }, {
            one_to_15:0,
            sixtn_to_30:0,
            thrty_1_to_45:0,
            frty_6_to_60:0,
            sxty_1_to_75:0,
            seventy_6_to_90:0,
        });

        const {
            one_to_15_clnsht,sixtn_to_30_clnsht,thrty_1_to_45_clnsht,
            frty_6_to_60_clnsht,sxty_1_to_75_clnsht,seventy_6_to_90_clnsht
        }=data.reduce(function (acc, obj) { 
            // console.log('min is'+acc.sixty_1_to_75+' '+obj['min 61-75 goals'])
            acc.one_to_15_clnsht+=(parseInt(obj['min 1-15 home goals'])==0?1:0)+(parseInt(obj['min 1-15 away goals'])==0?1:0)
            acc.sixtn_to_30_clnsht+=(parseInt(obj['min 16-30 home goals'])==0?1:0)+(parseInt(obj['min 16-30 away goals'])==0?1:0)
            acc.thrty_1_to_45_clnsht+=(parseInt(obj['min 31-45+ home goals'])==0?1:0)+(parseInt(obj['min 31-45+ away goals'])==0?1:0)
            acc.frty_6_to_60_clnsht+=(parseInt(obj['min 46-60 home goals'])==0?1:0)+(parseInt(obj['min 46-60 away goals'])==0?1:0)
            acc.sxty_1_to_75_clnsht+=(parseInt(obj['min 61-75 home goals'])==0?1:0)+(parseInt(obj['min 61-75 away goals'])==0?1:0)
            acc.seventy_6_to_90_clnsht+=(parseInt(obj['min 76-90+ home goals'])==0?1:0)+(parseInt(obj['min 76-90+ away goals'])==0?1:0)
            return acc
        }, {
            one_to_15_clnsht:0,
            sixtn_to_30_clnsht:0,
            thrty_1_to_45_clnsht:0,
            frty_6_to_60_clnsht:0,
            sxty_1_to_75_clnsht:0,
            seventy_6_to_90_clnsht:0,
        });

        // visual line plot by months

        const first_half_goals_agg=[]
        const away_wins_agg=[]

        for (let index = 0; index < monthOptions.length; index++) {
            const month = monthOptions[index];
            const matches_on_selected_month=data.filter(({match_date})=>match_date.includes(month))
            
            const {first_half_goals, away_wins}=matches_on_selected_month.reduce(function (acc, obj) {
                acc.away_wins+=(parseInt(obj['away_goals'])>parseInt(obj['home_goals']))?1:0
                acc.first_half_goals+=parseInt(obj["1st_half goals"])
                return acc
            },{away_wins:0, first_half_goals:0})
            first_half_goals_agg.push(first_half_goals)
            away_wins_agg.push(away_wins)
        }

        //top teams
        const teamsNoDu= data.map((({home_team})=>home_team))
        const teams = [... new Set(teamsNoDu)];

        let teamsGoals=[]
        for (let index = 0; index < teams.length; index++) {
            const team = teams[index];
            const matches_with_selected_team=data.filter(({home_team, away_team})=>home_team == team || away_team==team)
            
            const {total_goals,total_first_half_goals_conceded,total_cleansheets, total_stoppage_goals,total_goals_conceded,stoppage_goals_conceded,total_first_half_goals}=matches_with_selected_team.reduce(function (acc, obj) {
                acc.total_goals+= obj['home_team']==team?parseInt(obj['home_goals']):obj['away_team']==team?parseInt(obj['away_goals']):{}
                acc.total_stoppage_goals+= obj['home_team']==team?parseInt(obj['stoppage_time home goals']):obj['away_team']==team?parseInt(obj['stoppage_time away goals']):{}
                acc.total_goals_conceded+= obj['home_team']==team?parseInt(obj['away_goals']):obj['away_team']==team?parseInt(obj['home_goals']):{}
                acc.total_first_half_goals+= obj['home_team']==team?parseInt(obj["1st_half home goals"]):obj['away_team']==team?parseInt(obj['1st_half away goals']):{} //i used bracket so i can get an error when aggregating
                acc.total_first_half_goals_conceded+=obj['home_team']==team?parseInt(obj["1st_half away goals"]):obj['away_team']==team?parseInt(obj['1st_half home goals']):{}
                acc.stoppage_goals_conceded+= obj['home_team']==team?parseInt(obj['stoppage_time away goals']):obj['away_team']==team?parseInt(obj['stoppage_time home goals']):{}
                if(obj['home_team'] ==team && obj['away_goals']==0){
                    // consolelog(obj['home_team']+ ' vs '+obj['away_team'])
                    acc.total_cleansheets+=1
                }
                if(obj['away_team'] ==team && obj['home_goals']==0){
                    acc.total_cleansheets+=1
                    // consolelog(obj['home_team']+ ' vs '+obj['away_team'])

                }
                return acc
            },{
                total_goals:0, total_stoppage_goals:0,total_goals_conceded:0,stoppage_goals_conceded:0,
                total_first_half_goals:0,total_first_half_goals_conceded:0,total_cleansheets:0
            })
            teamsGoals.push({
                team,total_goals,total_stoppage_goals,total_goals_conceded,stoppage_goals_conceded,
                total_first_half_goals, total_first_half_goals_conceded,total_cleansheets
            })
        }

        //referee most goals ratio
        const refreesXduplicates=data.map((({referee})=>referee)).filter((isReferee)=>!!isReferee) 
        const referees=[... new Set(refreesXduplicates)] 
        
        const refereeStats=[]
        for (let index = 0; index < referees.length; index++) {
            const ref = referees[index];
            const matches_with_selected_referee=data.filter(({referee})=>referee==ref)
            
            const {ref_total_goals,  ref_total_cleansheets, ref_total_points}=matches_with_selected_referee.reduce(function (acc, obj) {
                acc.ref_total_goals+= parseInt(obj['total_goals'])
                acc.ref_total_cleansheets+= parseInt(obj['total_goals'])==0?1:0
                acc.ref_total_points+= obj.home_goals!=obj.away_goals?3:1
                return acc
            },{
                ref_total_goals:0, ref_total_cleansheets:0,ref_total_points:0
            })
            refereeStats.push({
                ref_total_goal_ratio:Math.round(ref_total_goals/matches_with_selected_referee.length)*100/100,
                ref_total_goals, ref_total_games:matches_with_selected_referee.length,

                ref_total_cleansheets,
                // :Math.round((ref_total_cleansheets/matches_with_selected_referee.length)/100*100),
                ref_total_points, ref
            })
        }        
        
        //stadium most goals
        const stadiumXduplicates=data.map((({stadium})=>stadium)).filter((stadium)=>!!stadium) 
        const stadiums=[... new Set(stadiumXduplicates)] 
        
        const stadiumStats=[]
        for (let index = 0; index < stadiums.length; index++) {
            const stad = stadiums[index];
            const matches_with_selected_referee=data.filter(({stadium})=>stadium==stad)
            
            const {stadium_total_goals, stadium_total_home_goals,stadium_highest_scoreline}=matches_with_selected_referee.reduce(function (acc, obj) {
                acc.stadium_total_goals+= parseInt(obj['total_goals'])
                acc.stadium_total_home_goals+= parseInt(obj['home_goals'])
                if(acc.stadium_highest_scoreline.length){
                    if(acc.stadium_highest_scoreline[0].total_goals==obj.total_goals){
                        acc.stadium_highest_scoreline.push({
                            home_goals:+obj['home_goals'], away_goals:+obj['away_goals'],
                            home_team:obj['home_team'], away_team:obj['away_team'],
                            total_goals:+obj.total_goals, score_line:obj.score_line
                        })
                    }
                    else if(acc.stadium_highest_scoreline[0].total_goals<obj.total_goals){
                        acc.stadium_highest_scoreline=[{
                            home_goals:+obj['home_goals'], away_goals:+obj['away_goals'],
                            home_team:obj['home_team'], away_team:obj['away_team'],
                            total_goals:+obj.total_goals, score_line:obj.score_line
                        }] 
                    }
                }
                else{
                    acc.stadium_highest_scoreline=[{
                        home_goals:+obj['home_goals'], away_goals:+obj['away_goals'],
                        home_team:obj['home_team'], away_team:obj['away_team'],
                        total_goals:+obj.total_goals
                    }]
                }
                return acc
            },{
                stadium_total_goals:0, stadium_total_home_goals:0, stadium_highest_scoreline:[]
            })
            stadiumStats.push({
                stadium_total_goals, stadium_total_home_goals, stad,
                team:matches_with_selected_referee[0].home_team,
                stadium_highest_scoreline
            })
        }        
        // consolelog({stadiumStats})
        return {
            total_goal_scored, tt_games_given,away_wins,
            tt_cleansheet_kept,tt_goalless_min, 
            tt_goalless_draws, stoppage_goals, 
            end_time_stoppage_goals,fst_half_goals,
            
            one_to_15,sixtn_to_30,thrty_1_to_45,
            frty_6_to_60,sxty_1_to_75,seventy_6_to_90,

            one_to_15_clnsht,sixtn_to_30_clnsht,thrty_1_to_45_clnsht,
            frty_6_to_60_clnsht,sxty_1_to_75_clnsht,seventy_6_to_90_clnsht,

            first_half_goals_agg, away_wins_agg,

            teamsGoals,

            refereeStats,

            stadiumStats
        }
    }
    const {
        
        total_goal_scored, tt_games_given,tt_cleansheet_kept,tt_goalless_min, 
        tt_goalless_draws, end_time_stoppage_goals,stoppage_goals,
        away_wins, fst_half_goals,
        one_to_15,sixtn_to_30,thrty_1_to_45,
        frty_6_to_60,sxty_1_to_75,seventy_6_to_90,

        one_to_15_clnsht,sixtn_to_30_clnsht,thrty_1_to_45_clnsht,
        frty_6_to_60_clnsht,sxty_1_to_75_clnsht,seventy_6_to_90_clnsht,
        ...rest
    } = useMemo(() => updateGeneralOptions(data), [data]);
    consolelog({season_Data:season_data})
    return (
        <section>
            <div className="grid grid-cols-2 gap-4 tablet:grid-cols-1 mb-5">
                <div className="grid grid-cols-3 gap-2">
                        <div className="rounded-xl shadow-lg px-3 py-8 bg-white ">
                            <p className="text-sm mb-5">Goal Scored</p>
                            
                            <p className="font-semibold text-xl mb-2">{total_goal_scored || '0'}</p>
                            <p className="text-md">{Math.round((total_goal_scored/tt_games_given)*100)/100} <span className="opacity-75 text-xs">goals per game</span></p>
                        </div>
                        <div className="rounded-xl shadow-lg px-3 py-8 bg-white ">
                            <p className="text-sm mb-5">Cleansheets Kept</p>
                            
                            <p className="font-semibold text-xl mb-2">{tt_cleansheet_kept}</p>
                            <p className="text-md">{Math.round((tt_cleansheet_kept/tt_games_given)*100)/100} <span className="opacity-75 text-xs">sheet{'(s)'} ratio</span></p>
                        </div>
                        <div className="rounded-xl shadow-lg px-3 py-8 bg-white">
                            <p className="text-sm mb-5">Total Goalless Period</p>
                            
                            <p className="font-semibold text-xl mb-2">{parseInt(tt_goalless_min/60)+'hrs '+ ((tt_goalless_min/60+'').split('.')[1] || '0')+ 'min'}</p>
                            <p className="text-md">{tt_goalless_draws} <span className="opacity-75 text-xs">goalless games</span></p>
                        </div>

                        <div className="rounded-xl shadow-lg px-3 py-8 bg-white">
                            <p className="text-sm mb-5">Stoppage Time Goals</p>
                            <p className="font-semibold text-xl mb-2">{stoppage_goals}</p>
                            <div className="h-[20px]">
                                <p className="text-md">{end_time_stoppage_goals} <span className="opacity-75 text-xs">90+ goals</span></p>
                            </div>
                        </div>
                        <div  className="rounded-xl shadow-lg px-3 py-8 bg-white">
                            <p className="text-sm mb-5">1rst half goals</p>
                            <p className="font-semibold text-xl mb-2">

                                {Math.round(((fst_half_goals/total_goal_scored)*100)*100)/100}%
                            </p>
                            <div className="h-[20px]">
                                <LinePlot data={
                                    {
                                        labels: monthOptions,
                                        values: rest.first_half_goals_agg
                                      }
                                }/>
                            </div>
                        </div>
                        <div className="rounded-xl shadow-lg px-3 py-8 bg-white">
                            <p className="text-sm mb-5">Away Wins</p>
                            <p className="font-semibold text-xl mb-2">
                                {Math.round(((away_wins/tt_games_given)*100)*100)/100}%

                            </p>
                            <div className="h-[20px]">
                                <LinePlot data={
                                    {
                                        labels: monthOptions,
                                        values: rest.away_wins_agg
                                      }
                                }/>
                            </div>
                        </div>
                </div>
                <div className="border border-2 bg-white rounded-md pt-5 px-2">
                    <h6 className="text-sm text-center font-medium mb-2">Total Number of Goals and Clean Sheets Recorded Every 15 Minutes Interval</h6>
                    <MultipleBarChart customlabel={["1-15", "16-30", "31-45+","46-60", "61-75","76-90+"]} 
                        data={[one_to_15,sixtn_to_30,thrty_1_to_45,frty_6_to_60,sxty_1_to_75,seventy_6_to_90]}
                        data2={[one_to_15_clnsht,sixtn_to_30_clnsht,thrty_1_to_45_clnsht,frty_6_to_60_clnsht,sxty_1_to_75_clnsht,seventy_6_to_90_clnsht]}
                        datalabel={{
                            label:"Goals",backgroundColor:"#90EE90",
                            borderColor:"#2E8B57"
                        }}
                        data2label={{
                            label:"Cleansheets",backgroundColor:"#CCCCCC",
                            borderColor:"#A9A9A9"
                        }}
                    />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 tablet:grid-cols-1 mb-5">
                <div className="rounded-lg shadow-lg p-4 border bg-white">
                    <p className="text-sm mb-4 text-[#808080] font-medium ">Best Attacking Teams</p>
                    <div className="space-y-4">
                        {rest?.teamsGoals?.sort((a,b)=>b.total_goals-a.total_goals)?.slice(0,4)?.map((({team, total_goals,total_first_half_goals, stoppage_goals,total_stoppage_goals},ind)=>
                            <div key={ind} className="flex items-center justify-between gap-x-3">
                                <div className="flex items-center gap-x-3">
                                    <ImageContainer  
                                        onError={({ currentTarget }) => {
                                            currentTarget.onerror = null; // prevents looping
                                            currentTarget.src='/images/no-club-crest.png';
                                        }}
                                            src={'/images/'+season_data?.league?.replace(' ', '').toLowerCase()+'/teams/'+team.toLowerCase().replace(' ','')+'.png'} 
                                            className={'w-10 h-10 rounded-md'}
                                        /> 
                                    <div>
                                        <p className="text-sm font-black mb-[4px]">{team}</p>
                                        <div className="w-[330px]">
                                            {/* 2FEA9B */}
                                            {/* light green #D3F8D3 */}
                                            {/* #2E8B57 */}
                                            <div className="bg-[#D3F8D3] rounded-md h-2.5">
                                                <div style={{width:((total_goals/Math.max(...rest?.teamsGoals.map(({total_goals})=>total_goals))))*100+'%'}} className="bg-[#2FEA9B] rounded-md h-full">
                                                    
                                                </div>                                                
                                            </div>
                                            <div className="w-full">
                                                <p className="text-xs text-center"><b>{Math.round((total_first_half_goals/total_goals)*100)*100/100}</b>{'% in the first half'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p className=" text-[#4D4D4D] font-medium">{total_goals+' goals'}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="rounded-lg shadow-lg p-4 border bg-white">
                    <p className="text-sm mb-4 text-[#808080] font-medium ">Best Defensive Teams</p>
                    <div className="space-y-4">
                        {rest?.teamsGoals?.sort((a,b)=>a.total_goals_conceded-b.total_goals_conceded)?.slice(0,4)?.map((({team, total_goals_conceded, stoppage_goals,total_stoppage_goals, total_first_half_goals_conceded,total_cleansheets},ind)=>
                            <div key={ind} className="flex items-center justify-between gap-x-3">
                                <div className="flex items-center gap-x-3">
                                    <ImageContainer 
                                        onError={({ currentTarget }) => {
                                            currentTarget.onerror = null; // prevents looping
                                            currentTarget.src='/images/no-club-crest.png';
                                        }}
                                        src={'/images/'+season_data?.league?.replace(' ', '').toLowerCase()+'/teams/'+team.toLowerCase().replace(' ','')+'.png'} 
                                        className={'w-10 h-10 rounded-md'}
                                    /> 
                                    <div>
                                        <p className="text-sm font-black mb-[4px]">{team}</p>
                                        <div className="w-[330px]">
                                            {/* 2FEA9B */}
                                            {/* light green #D3F8D3 */}
                                            {/* #2E8B57 */}
                                            <div className="bg-[#D3F8D3] rounded-md h-2.5">
                                                <div style={
                                                    {width:
                                                    ((total_goals_conceded/
                                                    (rest?.teamsGoals
                                                        .sort((a,b)=>a.total_goals_conceded-b.total_goals_conceded))
                                                        .slice(0,4
                                                    )[3].total_goals_conceded))*100+'%'}} 
                                                    className="bg-[#2FEA9B] rounded-md h-full">
                                                    
                                                </div>                                                
                                            </div>
                                            <div className="w-full">
                                                <p className="text-xs text-center"><b>{total_cleansheets}</b>{' cleansheets kept'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <p className=" text-[#4D4D4D] font-medium">{total_goals_conceded+' goals'}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 tablet:grid-cols-1 mb-5">
                <div className="rounded-lg shadow-lg p-4 border bg-white">
                    <p className="text-sm mb-4 text-[#808080] font-medium ">Referees with the Most Goal Ratio</p>
                    <div className="space-y-4">
                        {rest?.refereeStats?.sort((a,b)=>b.ref_total_goal_ratio-a.ref_total_goal_ratio)?.slice(0,4)?.map((
                            ({ref,ref_total_goal_ratio,ref_total_goals, ref_total_games,ref_total_cleansheets,ref_total_points},ind)=>
                            <div key={ind} className="flex items-center justify-between gap-x-3">
                                <div className="flex items-center gap-x-3">
                                    <ImageContainer src={'/images/no-person.png'} className={'w-10 h-10 rounded-md'}/> 
                                    <div>
                                        <p className="text-sm font-black mb-[4px]">{ref}</p>
                                        <span className="flex items-center text-xs font-medium">
                                            <p>{ref_total_games} game{'(s)'}</p>&nbsp;-&nbsp;
                                            <p>{ref_total_goals} goal{'(s)'}</p>&nbsp;-&nbsp;
                                            <p>{ref_total_points} point{'(s)'}</p>&nbsp;-&nbsp;
                                            <p>{ref_total_cleansheets} cleansheet{'(s)'}</p>
                                        </span>
                                    </div>
                                </div>
                                <p className=" text-[#4D4D4D] font-medium text-xs">{ref_total_goal_ratio+' goals per game'}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="rounded-lg shadow-lg p-4 border bg-white">
                    <p className="text-sm mb-4 text-[#808080] font-medium ">Blockbuster Stadiums</p>
                    <div className="space-y-4">
                        {rest?.stadiumStats?.sort((a,b)=>b.stadium_total_goals-a.stadium_total_goals)?.slice(0,4)?.map(
                            (({stadium_total_goals,stadium_total_home_goals,stadium_highest_scoreline,stad,team},ind)=>
                            <div key={ind} className="flex items-center justify-between gap-x-3">
                                <div className="flex items-center gap-x-3"> 
                                    <ImageContainer  
                                        onError={({ currentTarget }) => {
                                            currentTarget.onerror = null; // prevents looping
                                            currentTarget.src='/images/no-club-crest.png';
                                        }}
                                        src={'/images/'+season_data?.league?.replace(' ', '').toLowerCase()+'/teams/'+team.toLowerCase().replace(' ','')+'.png'} 
                                        className={'w-10 h-10 rounded-md'}
                                        /> 
                                    <div>
                                        <p className="text-sm font-black mb-[4px]">{stad}</p>
                                        <div className="">
                                            <span className="flex items-center">
                                                <p className="text-xs">Highest scoring games:&nbsp;</p>
                                                <div className="flex items-center">
                                                    {stadium_highest_scoreline?.map(function({score_line, home_goals, away_goals, away_team}, i)
                                                        
                                                        {
                                                            let comma=', '
                                                            if(i>1){
                                                              comma="+"  
                                                            }
                                                            else if(i+1==stadium_highest_scoreline.length){
                                                                comma=''
                                                            }

                                                            return <small key={i} className="text-xs mr-[3px]"><b>{home_goals}</b>-{away_goals+'(vs '+away_team?.slice(0,3)+')'+comma}</small>
                                                        })
                                                    }                                                    
                                                </div>

                                            </span>

                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <p className=" text-[#4D4D4D] font-medium text-right">{stadium_total_goals+' goals'}</p>
                                    <p className=" text-[#4D4D4D] text-xs"><b>
                                        {Math.round((stadium_total_home_goals/stadium_total_goals)*100)*100/100}</b>
                                        {'% were home goals'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    )
}

function Goals({data, monthOptions, season_data}){
    const stringWithNumbers = (x)=>{
        return x+''.split('').filter(char => !isNaN(char)).join(''); 
    }

    const updateGoalOptions=(data)=>{
        if(!data) return {}
        const total_goal_scored=data.reduce(function (acc, obj) { 
            const stringWithNumbers = obj.total_goals+''.split('').filter(char => !isNaN(char)).join('');
            return acc + parseInt(stringWithNumbers); 
        }, 0);
        const tt_games_given=data.length
        let goal_margin_games=[]
        let goal_margin_threshold=0
        
        for (let index = 0; index < data.length; index++) {
            const match = data[index];
            const goal_margin=Math.abs(+match.home_goals- +match.away_goals)
            if(goal_margin_threshold<goal_margin){
                goal_margin_threshold=goal_margin
                goal_margin_games=[{
                    goal_margin,
                    ...match
                }]
            }
            else if(goal_margin_threshold==goal_margin){
                goal_margin_games.push({
                    goal_margin,
                    ...match
                })
            }
            
        }

        //most goals
        let goal_scoring_games=[]
        let goal_scoring_threshold=0

        for (let index = 0; index < data.length; index++) {
            const match = data[index];
            if(goal_scoring_threshold<  +match.total_goals){
                
                goal_scoring_threshold= +match.total_goals
                goal_scoring_games=[{...match}]
            }
            else if(goal_scoring_threshold== +match.total_goals){
                // const findTeam=goal_scoring_games.find(({home_team, away_team})=>home_team)
                goal_scoring_games.push({...match})
            }
            
        }
        //months with interval category multiple line

        //intervals with the most goal AND HEAT MAP OF INTERVALS AND MONTHS
        const monthsWithIntervals=[]
        const intervals=["1-15", "16-30", "31-45+","46-60", "61-75","76-90+"]
        for (let index = 0; index < intervals.length; index++) {
            const monthsInTime=[]
            const time= intervals[index];
            for (let index2 = 0; index2 < monthOptions.length; index2++) {
                const month = monthOptions[index2];
                const matches_in_selected_month= data.filter(({match_date})=>match_date.includes(month))
                const stats=matches_in_selected_month.reduce(function (acc, obj) { 
                    acc.total_goal_scored+= parseInt(obj['min '+time+' goals'])
                    return acc
                },{
                    month,time,
                    total_goal_scored:0
                }
                // [
                //     ...Array(monthOptions.length).keys()
                // ]
                );  
                monthsInTime.push(stats)              
            }
            monthsWithIntervals.push(monthsInTime)
        }


        
    // const matches_with_gmwk=data.filter(({game_week})=>game_week==index+1)
    // const gmwksXintervals_goals=matches_with_gmwk.reduce(function (acc, obj) { 
    //     for (let time_index = 0; time_index < intervals; time_index++) {
    //         let time= intervals[time_index]
    //         acc[time]+=obj['min '+time+' goals']
    //     }
    //     return acc
    // },{
    //    ...intervals.reduce((a, v) => ({ ...a, [v]: 0}), {}) 
    // })
    // const matches_with_interval=data.filter(({game_week})=>game_week==index+1)

        //HEAT MAP OF GAMEWEEKS AGAINST INTERVALS 
        const max_gmwk= Math.max(...data.map(({game_week})=>parseInt(game_week)))
        const gmwkWithIntervals=[]
        const every_goals_count=[]
        const gameweeks=[...Array(max_gmwk).keys()].map(gmwk=>gmwk+1)
        let total_intervals=max_gmwk*intervals
        let total_interval_goals=0
        for (let index = 0; index < intervals.length; index++) {
            let time= intervals[index]
            const gamewk_goals_per_week={}
            
            for (let wk_index = 0; wk_index < max_gmwk; wk_index++) {
                let wk= gameweeks[wk_index]
                const matches_with_gmwk=data.filter(({game_week})=>game_week==wk)
                const goals_for_that_week= matches_with_gmwk.reduce((a, v) => (a+=parseInt(v['min '+time+' goals'])), 0)
                
                total_interval_goals+=goals_for_that_week
                every_goals_count.push(goals_for_that_week)
                gamewk_goals_per_week['Wk-'+wk]=goals_for_that_week
            }
            gmwkWithIntervals.push(gamewk_goals_per_week)
        }

        // get mean goal
        const mean_goal = every_goals_count.reduce((a, b) => a + b) / every_goals_count.length;
        const max_goal_for_a_week= Math.max(...every_goals_count)
        // alert(max_goal_for_a_week)
        // consolelog({gmwkWithIntervals})
        
        const firstHalfGoalsOverMonths=[]
        for (let index = 0; index < monthOptions.length; index++) {
            const month = monthOptions[index];
            const goals_in_first_half_for_month= parseInt(monthsWithIntervals[0][index].total_goal_scored)+parseInt(monthsWithIntervals[1][index].total_goal_scored)+parseInt(monthsWithIntervals[2][index].total_goal_scored)
            firstHalfGoalsOverMonths.push(goals_in_first_half_for_month)
        }
        const secHalfGoalsOverMonths=[]
        for (let index = 0; index < monthOptions.length; index++) {
            const month = monthOptions[index];
            const goals_in_sec_half_for_month= parseInt(monthsWithIntervals[3][index].total_goal_scored)+parseInt(monthsWithIntervals[4][index].total_goal_scored)+parseInt(monthsWithIntervals[5][index].total_goal_scored)
            secHalfGoalsOverMonths.push(goals_in_sec_half_for_month)
        }

        //RADAR PLOT OF BOTH HOME AND AWAY GOALS
        const monthHxA=[]
        for (let i = 0; i < monthOptions.length; i++) {
            const month = monthOptions[i];
            const matches_in_selected_month= data.filter(({match_date})=>match_date.includes(month))
            const stats=matches_in_selected_month.reduce(function (acc, obj) { 
                acc.total_home_goal_scored+=parseInt(obj.home_goals)
                acc.total_away_goal_scored+=parseInt(obj.away_goals)
                return acc
            },{
                total_home_goal_scored:0,total_away_goal_scored:0
            }
            // [
            //     ...Array(monthOptions.length).keys()
            // ]
            );  
            monthHxA.push(stats)              
        }


        const monthsGoals=[]
        let highest_scoring_month={
            total_goal_scored:0
        }
        for (let index = 0; index < monthOptions.length; index++) {
            const month = monthOptions[index];
            const matches_with_selected_month=data.filter(({match_date})=>match_date.includes(month))

            const stats=matches_with_selected_month.reduce(function (acc, obj) { 
                acc.total_goal_scored+=parseInt(obj.total_goals)
                acc.total_matches+=1
                return acc
            }, {
                total_goal_scored:0,
                total_matches:0
            });
            // consolelog({stats, highest_scoring_month})
            if(stats.total_goal_scored>highest_scoring_month.total_goal_scored){
                highest_scoring_month={...stats, month}
            }
            else if (stats.total_goal_scored==highest_scoring_month.total_goal_scored){
                highest_scoring_month.not_alone+=1
            }
            monthsGoals.push(stats)            
        } 
        // consolelog({highest_scoring_month})
        
        //piechart of goals in 30min
        
        const min30interval_goals=data.reduce(function (acc, obj) { 
            acc[0]+= +obj["min 1-15 goals"]+(+obj["min 16-30 goals"])
            acc[1]+=+obj["min 31-45+ goals"]+(+obj["min 46-60 goals"])
            acc[2]+=+obj["min 61-75 goals"]+(+obj["min 76-90+ goals"])
            return acc
        },[0,0,0]);

        //home goals per game for the top 4 teams

        const teamsNoDu= data.map((({home_team})=>home_team))
        const teams = [... new Set(teamsNoDu)];

        const teamsPoints=[]
        for (let index = 0; index < teams.length; index++) {
            const team = teams[index];
            const matches_with_selected_team=data.filter(({home_team, away_team})=>home_team == team || away_team==team)
            
            const acc_points=matches_with_selected_team.reduce(function (acc, obj,index) {
                let team_score= 0
                let opp_score=0
                if(obj["home_team"]==team){
                    team_score,opp_score= +obj["home_goals"],+obj["away_goals"]
                }
                if(obj["away_team"]==team){
                    team_score,opp_score= +obj["away_goals"],+obj["home_goals"]
                }
                let point=(team_score>opp_score?3:team_score==opp_score?1:0)
                acc.acc_points=acc.acc_points+point,
                acc.matches.push({
                    gamemonth:monthOptions.indexOf(obj['match_date'].split(' ')[1])+ parseFloat('0.'+index),point,
                    team_score,point 
                })
                return acc
            },{
                acc_points:0,
                matches:[]
            })

            teamsPoints.push({
                team,points:acc_points,
            })
        }
        const sortedTeamsByPoints= teamsPoints.sort((a,b)=>a.points-b.points)


        return {
            total_goal_scored, tt_games_given, goal_margin_games, goal_margin_threshold,
            goal_scoring_threshold, goal_scoring_games,

            monthsGoals,
            gmwkWithIntervals,max_gmwk,intervals, gameweeks,

            total_intervals,total_interval_goals,
            average_total_interval_goals:Math.round((total_intervals/total_intervals)*100/100),

            min30interval_goals, highest_scoring_month,

            monthHxA, monthsWithIntervals,half_goals_over_months:[firstHalfGoalsOverMonths, secHalfGoalsOverMonths],

            sortedTeamsByPoints:sortedTeamsByPoints.slice(0,3),

            mean_goal, max_goal_for_a_week,
        }
    }
    
    const goal_stats = useMemo(() => updateGoalOptions(data), [data]);
    

    return (
        <section>
            <div className="grid grid-cols-1 gap-4 tablet:grid-cols-1 mb-5">
                <div className="grid grid-cols-5 gap-4">
                        <div className="rounded-xl shadow-lg px-3 py-8 bg-white ">
                            <p className="text-sm mb-5">Goal Scored</p>
                            
                            <p className="font-semibold text-xl mb-2">{goal_stats?.total_goal_scored || '0'}</p>
                            <p className="text-md">{Math.round((goal_stats?.total_goal_scored/goal_stats?.tt_games_given)*100)/100} <span className="opacity-75 text-xs">goals per game</span></p>
                        </div>
                        <div className="rounded-xl shadow-lg px-3 py-8 bg-white ">
                            <p className="text-sm mb-5">Goal Scored per month</p>
                            
                            <p className="font-semibold text-xl mb-2">{((goal_stats?.total_goal_scored/monthOptions.length)*100)/100 || '0'}</p>
                            <div className="flex gap-x-1 items-start">
                                <p className="text-md">{goal_stats?.highest_scoring_month.month}</p>

                                <span className="opacity-75 text-xs">{(goal_stats?.highest_scoring_month.not_alone?'is among':'is')} the highest scoring month{'('+goal_stats?.highest_scoring_month.total_goal_scored+' goals)'}</span>
                            </div>
                            {/* +' with '+goal_stats?.highest_scoring_month.total_goal_scored} <span className="opacity-75 text-xs">has the most goals</span></p> */}
                        </div>
                        <div className="w-full col-span-3 grid grid-cols-2  gap-4 ">
                        <div className="rounded-xl shadow-lg px-3 py-4 bg-white">
                            <p className="text-sm mb-4">Highest Scoring Game{'(s)'} - <span className="opacity-75 text-xs">{goal_stats.goal_scoring_threshold} goals</span></p>
                            <div className="space-y-[6px] border-t-1">
                                {goal_stats.goal_scoring_games.slice(0,4).map(
                                (({home_team, away_team, score_line, ...rest},ind)=>
                                    <div key={ind}>
                                    <div className="flex items-end w-full gap-x-1">
                                        <p className="text-sm font-medium">{home_team}</p>
                                        <p className="opacity-2 text-xs opacity-75">{score_line}</p>
                                        <p className="text-sm font-medium">{away_team}</p>
                                    </div>
                                    <div className="pl-2 mt-1">
                                        <div className="flex justify-end">
                                            <p className="text-xs"><i>1rst half</i>{"=>"}
                                            <span className="opacity-75">
                                                {rest["1st_half home goals"]+'-'+rest["1st_half away goals"]+','}
                                                &nbsp;
                                            </span>
                                            </p>
                                            <p className="text-xs"><i>2nd half</i>{"=>"}
                                            <span className="opacity-75">
                                                {rest["2nd_half home goals"]+'-'+rest["2nd_half away goals"]} 
                                            </span>
                                            </p>
                                        </div>
                                    </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="rounded-xl shadow-lg px-3 py-3 bg-white ">
                            <p className="text-sm mb-4">Heavy defeat{'(s)'} - <span className="opacity-75 text-xs">{goal_stats.goal_margin_threshold} goals</span></p>
                            <div className="space-y-[6px]">
                                {goal_stats.goal_margin_games.slice(0,4).map(
                                    (({home_team, away_team, home_goals, away_goals, score_line,...rest},ind)=>
                                    <div key={ind} >
                                        <div className="flex items-end w-full gap-x-1">
                                            <p className="text-sm font-medium">{home_team}</p>
                                            <p className="opacity-2 text-xs opacity-75">{score_line}</p>
                                            <p className="text-sm font-medium">{away_team}</p>
                                        </div>
                                        <div className="pl-2 mt-1">
                                            <div className="flex justify-end">
                                                <p className="text-xs"><i>1rst half</i>{"=>"}
                                                <span className="opacity-75">
                                                    {rest["1st_half home goals"]+'-'+rest["1st_half away goals"]+','}
                                                    &nbsp;
                                                </span>
                                                </p>
                                                <p className="text-xs"><i>2nd half</i>{"=>"}
                                                <span className="opacity-75">
                                                    {rest["2nd_half home goals"]+'-'+rest["2nd_half away goals"]} 
                                                </span>
                                                </p>
                                                {/* <p className="text-xs"><i>31-45+min</i>{"=>"}
                                                <span>
                                                    {rest["min 31-45+ home goals"]+'-'+rest["min 31-45+ away goals"]} 
                                                
                                                </span> */}
                                                {/* </p> */}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
                {/* {goal_stats.min30interval_goals} */}
                

                <div className="grid grid-cols-2 gap-4">
                    <div className="shadow-xl rounded-lg py-2 pt-4 bg-white">
                        <h6 className="text-sm text-center font-medium mb-2">Goals scored within 30 min intervals</h6>
                        <div>
                        <PieChart data={{
                            labels:['Minute 01-30', 'Minute 31-75', 'Minute 76-90+'],
                            values:goal_stats.min30interval_goals,
                            colors: [
                                'rgba(255, 99, 132, 0.7)',
                                'rgba(54, 162, 235, 0.7)',
                                'rgba(255, 206, 86, 0.7)',
                                'rgba(75, 192, 192, 0.7)',
                                'rgba(153, 102, 255, 0.7)',
                                'rgba(255, 159, 64, 0.7)'
                              ]
                        }}/>
                        </div>
                    </div>
                    <div className="shadow-xl rounded-lg py-2 pt-4 bg-white">
                        <h6 className="text-sm text-center font-medium mb-2">Goals scored between halves over months</h6>
                        <div className="h-[320px]">
                            <LinePlot 
                                displayLabel={true}
                                data={{
                                labels:monthOptions,
                                // values:goal_stats.min30interval_goals,
                                datasets: 
                                ["First-half", 'Second-half'].map((interval,ind)=>
                                    ({
                                        label:interval, 
                                        data:goal_stats.half_goals_over_months[ind]
                                    })
                                )       
                            }}/>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div className="shadow-xl rounded-lg py-2 pt-4 bg-white">
                        <h6 className="text-sm text-center font-medium mb-4 ">Frequency of goals in intervals across gameweeks</h6>
                        <div className="flex justify-center mb-3">
                            <div className="w-[80%]">
                                <div className="flex justify-between w-full text-sm text-gray-500">
                                    <p>Low</p>
                                    <p>Average</p>
                                    <p>High</p>
                                </div>
                                <div className="w-full flex h-[20px] rounded-md border-2">
                                    <div className="w-[10%] bg-white h-full"></div>
                                    <div className="w-[10%] bg-green-100 h-full"></div>
                                    <div className="w-[10%] bg-green-200 h-full"></div>
                                    <div className="w-[10%] bg-green-300 h-full"></div>
                                    <div className="w-[10%] bg-green-400 h-full"></div>
                                    <div className="w-[10%] bg-green-500 h-full"></div>
                                    <div className="w-[10%] bg-green-600 h-full"></div>
                                    <div className="w-[10%] bg-green-700 h-full"></div>
                                    <div className="w-[10%] bg-green-800 h-full"></div>
                                    <div className="w-[10%] bg-green-900 h-full rounded-r-md"></div>
                                </div>
                            </div>
                        </div>
                        {/* gmwkWithIntervals */}
                        <div className="overflow-x-auto">
                            <table className={` border-separate border-spacing-2`}>
                                <thead>
                                <tr className="text-sm">
                                    <th className="font-medium">Interval</th>
                                    {goal_stats.gameweeks.map((wk)=>
                                        <th className="min-w-[50px] font-semibold text-gray-600 text-xs" key={wk}>{'wk-'+(wk)}</th>
                                    )}
                                    
                                </tr>
                                </thead>
                                <tbody>
                                {goal_stats.gmwkWithIntervals.map((interval_stats,ind)=>{
                                    return(
                                    <tr key={ind}>
                                        <td className="text-gray-600 text-xs">{goal_stats.intervals[ind]}</td>
                                        {goal_stats.gameweeks.map((wk)=>{
                                            const no_of_goals=+interval_stats['Wk-'+wk]
                                            let no_of_goals_to_900=(no_of_goals/goal_stats.max_goal_for_a_week)*900
                                            let rounded_no_of_goals_to_900=Math.round(no_of_goals_to_900/100)*100
                                            return(
                                                <td 
                                                style={{
                                                    backgroundColor:
                                                    rounded_no_of_goals_to_900==100?"rgb(220 252 231)":
                                                    rounded_no_of_goals_to_900==200?"rgb(187 247 208)":
                                                    rounded_no_of_goals_to_900==300?"rgb(134 239 172)":
                                                    rounded_no_of_goals_to_900==400?"rgb(74 222 128)":
                                                    rounded_no_of_goals_to_900==500?"rgb(34 197 94)":
                                                    rounded_no_of_goals_to_900==600?"rgb(22 163 74)":
                                                    rounded_no_of_goals_to_900==700?"rgb(21 128 61)":
                                                    rounded_no_of_goals_to_900==800?"rgb(22 101 52)":
                                                    rounded_no_of_goals_to_900==900?"rgb(20 83 45)":
                                                    "#ffffff"
                                                }}
                                                className={`text-sm border border-slate-300 text-center h-12 text-black`} 
                                                key={wk}>
                                                    {no_of_goals}
                                                </td>
                                            )
                                        }

                                        )}
                                        
                                    </tr>)
                                    })}
                                </tbody>
                                {/* <tr>
                                    <td>Alfreds Futterkiste</td>
                                    <td>Maria Anders</td>
                                    <td>Germany</td>
                                </tr>
                                <tr>
                                    <td>Centro comercial Moctezuma</td>
                                    <td>Francisco Chang</td>
                                    <td>Mexico</td>
                                </tr> */}
                            </table>
                            {/* {goal_stats.gmwkWithIntervals.map(())} */}
                        </div>
                    </div>
                    {/* {
                    label: 'Dataset 1',
                    data: Utils.numbers(NUMBER_CFG),
                    borderColor: Utils.CHART_COLORS.red,
                    backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
                    },{
                    label: 'Dataset 2',
                    data: Utils.numbers(NUMBER_CFG),
                    borderColor: Utils.CHART_COLORS.blue,
                    backgroundColor: Utils.transparentize(Utils.CHART_COLORS.blue, 0.5),
                    } */}
                    <div className="shadow-xl rounded-lg py-2 pt-4 bg-white">
                        <h6 className="text-sm text-center font-medium mb-2">Goal scored in each month by sides</h6>
                        <div className=" h-[450px] flex justify-center">
                            <RadarPlot 
                                data={{
                                    labels:monthOptions,
                                    // ['Home goals', 'Away Goals']} 
                                    datasets:['Away Goals', 'Home Goals'].map((side,ind)=>
                                            ({
                                                label:side,
                                                data:goal_stats.monthHxA.map(
                                                    (stats)=>side=="Home Goals"?stats.total_home_goal_scored:stats.total_away_goal_scored
                                                )
                                            })
                                        )   
                                    }}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

function Cleansheets({data, monthOptions}){
    
    // const clnsht_stats = useMemo(() => updateGoalOptions(data), [data]);


    return null
   
}

function Match({data, monthOptions}){
    return null
}

export default function Chart({data, tab, monthOptions, season_data}){
    console.log({Season_data:season_data})
    return(
        <>
        {   tab=="general"?
                
                // <HeatmapChart data = {{
                //     labels: ['January', 'February', 'March', 'April', 'May'],
                //     datasets: [{
                //       data: [
                //         [10, 20, 30, 40, 50],  // Row 1
                //         [20, 30, 40, 50, 60],  // Row 2
                //         [30, 40, 50, 60, 70],  // Row 3
                //         [40, 50, 60, 70, 80],  // Row 4
                //         [50, 60, 70, 80, 90],  // Row 5
                //       ],
                //       borderWidth: 1,
                //     }]
                // }}/>:
                <General data={data} monthOptions={monthOptions} season_data={season_data}/>:
                tab=="goals"?
                <Goals data={data} monthOptions={monthOptions} season_data={season_data}/>:
                <div className="h-[400px] flex place-items-center item-center justify-center">
                    <p>Coming soon</p>
                </div>
                // :
                
                // <ScatterPlot data={xdata} 

                //   />
                
                // null
        }
        </>
    )

}

{/* <section className="grid items-start grid-cols-2 gap-4 tablet:grid-cols-1">
<div className="mb-5">
    <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl shadow-lg px-3 py-8 bg-white ">
            <p className="text-sm mb-5">Goal Scored</p>
            
            <p className="font-semibold text-xl mb-2">{total_goal_scored || '0'}</p>
            <p className="text-md">{Math.round((total_goal_scored/tt_games_given)*100)/100} <span className="opacity-75 text-xs">goals per game</span></p>
        </div>
        <div className="rounded-xl shadow-lg px-3 py-8 bg-white ">
            <p className="text-sm mb-5">Cleansheets Kept</p>
            
            <p className="font-semibold text-xl mb-2">{tt_cleansheet_kept}</p>
            <p className="text-md">{Math.round((tt_cleansheet_kept/tt_games_given)*100)/100} <span className="opacity-75 text-xs">cleansheet{'(s)'} ratio</span></p>
        </div>
        <div className="rounded-xl shadow-lg px-3 py-8 bg-white">
            <p className="text-sm mb-5">Total Goalless Period</p>
            
            <p className="font-semibold text-xl mb-2">{parseInt(tt_goalless_min/60)+'hrs '+ ((tt_goalless_min/60+'').split('.')[1] || '0')+ 'min'}</p>
            <p className="text-md">{tt_goalless_draws} <span className="opacity-75 text-xs">goalless games</span></p>
        </div>

        <div className="rounded-xl shadow-lg px-3 py-8 bg-white">
            <p className="text-sm mb-5">Stoppage Time Goals</p>
            <p className="font-semibold text-xl mb-2">{stoppage_goals}</p>
            <div className="h-[20px]">
                <p className="text-md">{end_time_stoppage_goals} <span className="opacity-75 text-xs">90+ goals</span></p>
            </div>
        </div>
        <div  className="rounded-xl shadow-lg px-3 py-8 bg-white">
            <p className="text-sm mb-5">1rst half goals</p>
            <p className="font-semibold text-xl mb-2">

                {Math.round(((fst_half_goals/total_goal_scored)*100)*100)/100}%
            </p>
            <div className="h-[20px]">
                
            </div>
        </div>
        <div className="rounded-xl shadow-lg px-3 py-8 bg-white">
            <p className="text-sm mb-5">Away Wins</p>
            <p className="font-semibold text-xl mb-2">
                {Math.round(((away_wins/tt_games_given)*100)*100)/100}%

            </p>
            <div className="h-[20px]">
                
            </div>
        </div>
    </div>
    <div>

    </div>
</div>
<div className="border border-2 bg-blue-300 h-[400px]">

</div>
</section> */}