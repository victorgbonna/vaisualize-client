import { API_ENDPOINTS, consolelog, PAGE_ROUTES } from "@/configs"
import { useHttpServices } from "@/hooks"
import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { DataFetch } from ".."
import moment from "moment"
import Link from "next/link"

export default function ProjectHelper({fromVisuals=false}){
    const {getData, getProtectedData}= useHttpServices()
    const getMyCharts=async()=>{    
        return await getProtectedData({path:API_ENDPOINTS.OWNED_ALL})
    }
    
    const {isLoading:reqLoading, data:req_data, error, isError:isReqError}= useQuery(
        {
            queryKey:['owned-projects'],
            queryFn:()=>getMyCharts(),
            refetchOnWindowFocus: true,
            retry:false
        }
    )
    const getMyDraftCharts=async()=>{    
        return await getProtectedData({path:API_ENDPOINTS.GET_ALL_DRAFTS})
    }
    
    const {isLoading:draftLoading, data:draftData, error:draftError, isError:isDraftError}= useQuery(
        {
            queryKey:['draft-projects'],
            queryFn:()=>getMyDraftCharts(),
            refetchOnWindowFocus: false,
            retry:false, enabled:!!req_data?.projects && !fromVisuals
        }
    )
    console.log({req_data, draftData})
    // console.log({req_data, draftError})
    // const get_all_project_visuals= useMemo(()=>{
    //     if(!req_data) return []
    //     const visuals=req_data?.requests?.map(
    //         ({visuals_obj})=>[
    //         visuals_obj?.visuals[0]?.plot_type?.split(',')[0], 
    //         visuals_obj.visuals[1]?.plot_type?.split(',')[0]
    //     ])
    //     consolelog({visuals})
    // },[req_data])

    // const chooseCards=()=>{
    //     const get_all_project_visuals= 3

    // }
    return(
        <section className="overflow-y-scroll h-[380px] pb-8 pt-5">
            <DataFetch
                isLoading={reqLoading}
                isError={isReqError}
                errorMsg={error?.message}
            >
                <div className="grid grid-cols-3 gap-6 px-8 justify-between">
                    {req_data?.projects?.map((data,ind)=>
                        fromVisuals
                            ? <ProjectItem key={ind} ind={ind} {...data} />
                            : <ProjectCard key={ind} ind={ind} {...data} />
                    )}
                    
                </div>
            </DataFetch>
            {!fromVisuals && 
            <>
            {
                draftData?.projects?.length > 0 && <p className="px-8 py-10 text-2xl font-semibold">In Drafts</p>
            }
             <DataFetch
                isLoading={draftLoading}
                isError={isDraftError}
                errorMsg={draftError?.message}
            >
                <div className="grid grid-cols-3 gap-6 px-8 justify-between">
                    {draftData?.projects?.map((data,ind)=>
                        <ProjectCard isDraft={true} key={ind} ind={ind} {...data} />
                    )}
                    
                </div>
            </DataFetch>
            </> 
            }
        </section>
    )
}

function ProjectItem(props){
    return(
        <Link target="_blank" href={props?.isDraft?PAGE_ROUTES.VIEW_A_DRAFT(props?._id):PAGE_ROUTES.VIEW_PROJECT(props?._id)} className="border rounded-xl hover:border-primary hover:border-2  shadow-lg bg-slate-50 flex flex-col">
            
            {props?.visualizations?.[0]?.chartType && !props?.isDraft ? <ChartSelection firstVisual={props?.visualizations?.[0]?.chartType}/> : 
               <div className="h-48 p-6 relative overflow-hidden flex items-center justify-center">
                    <img src="/svg/question.svg" alt="question" className="w-8 h-8"/>
               </div> 
                }
            <div className="bg-white flex-1 w-full flex items-center justify-between rounded-b-xl px-4 py-5">
                <div>
                    <p className="text-lg font-semibold mb-2">{props?.title}</p>
                    <p className="text-sm text-gray-600">Last edited <span>{moment(props?.updatedAt).startOf("day").fromNow()}</span></p>
                </div>
                <button className="cursor-pointer">
                    <img src="/svg/more-vert.svg" alt="more" className="w-8 h-8"/>
                </button>
            </div>
        </Link>
    )
}

function ProjectCard(props){
    const {
        _id,
        title,
        category,
        mode,
        isDraft,
        datasets = [],
        table_relationships = [],
        visualizations = [],
        updatedAt,
    } = props

    const tablesCount = datasets?.length || 0
    const relationshipsCount = table_relationships?.length || 0
    const visualsCount = visualizations?.length || 0

    // published-only metrics aren't guaranteed to exist yet on a draft
    const showMetrics = !isDraft

    const handleMenuClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
    }

    return(
        <Link
            target="_blank"
            href={isDraft ? PAGE_ROUTES.VIEW_A_DRAFT(_id) : PAGE_ROUTES.VIEW_PROJECT(_id)}
            className="group border border-gray-200 rounded-xl bg-white p-5 flex flex-col gap-4 transition-all duration-200 hover:border-primary hover:shadow-lg hover:-translate-y-0.5"
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-3 min-w-0">
                    <span className="shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                        <img src="/svg/sidebar/projects.svg" alt="project" className="w-4 h-4" />
                    </span>
                    <div className="min-w-0">
                        <p className="text-base font-semibold text-gray-900 truncate" title={title}>{title}</p>
                        <p className="text-xs text-gray-500 mt-0.5 truncate">{category}</p>
                    </div>
                </div>
                <button onClick={handleMenuClick} className="cursor-pointer shrink-0 p-1 rounded-md hover:bg-gray-100">
                    <img src="/svg/more-vert.svg" alt="more" className="w-5 h-5" />
                </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border ${isDraft ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-green-50 text-green-700 border-green-200"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isDraft ? "bg-amber-500" : "bg-green-500"}`}></span>
                    {isDraft ? "Draft" : "Published"}
                </span>
                {!isDraft && mode &&
                    <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                        <img src={mode === "Public" ? "/svg/eye.svg" : "/svg/eye-closed.svg"} alt={mode} className="w-3.5 h-3.5" />
                        {mode}
                    </span>
                }
            </div>

            {showMetrics &&
                <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-lg py-3">
                    <div className="flex flex-col items-center gap-1">
                        <img src="/svg/sidebar/table.svg" alt="tables" className="w-4 h-4 opacity-70" />
                        <p className="text-sm font-semibold text-gray-900">{tablesCount}</p>
                        <p className="text-[11px] text-gray-500">Tables</p>
                    </div>
                    <div className="flex flex-col items-center gap-1 border-x border-gray-200">
                        <img style={{ transform: "rotate(45deg)", filter: "brightness(0%)" }} src="/svg/link-attached.svg" alt="relationships" className="w-4 h-4 opacity-70" />
                        <p className="text-sm font-semibold text-gray-900">{relationshipsCount}</p>
                        <p className="text-[11px] text-gray-500">Relationships</p>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                        <img style={{ filter: "brightness(0%)" }} src="/svg/visuals/barchart.svg" alt="visuals" className="w-4 h-4 opacity-70" />
                        <p className="text-sm font-semibold text-gray-900">{visualsCount}</p>
                        <p className="text-[11px] text-gray-500">Visuals</p>
                    </div>
                </div>
            }

            <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-auto pt-1 border-t border-gray-100">
                <img src="/svg/calendar.svg" alt="updated" className="w-3.5 h-3.5 opacity-70" />
                Updated {moment(updatedAt).format("MMM D, YYYY")}
            </div>
        </Link>
    )
}

function ChartSelection({firstVisual}){
    return(
        <div className="h-48 p-6 relative overflow-hidden flex items-center justify-center">
            {firstVisual.includes('bar')?
                <div className="w-full h-full flex items-end gap-2 opacity-60">
                    <div className="w-full bg-blue-400/40 h-[40%] rounded-sm"></div>
                    <div className="w-full bg-blue-500/60 h-[70%] rounded-sm"></div>
                    <div className="w-full bg-blue-600 h-[100%] rounded-sm"></div>
                    <div className="w-full bg-indigo-400 h-[60%] rounded-sm"></div>
                    <div className="w-full bg-blue-200 h-[30%] rounded-sm"></div>
                </div>:
            firstVisual.includes('pie')?
                <div className="h-48 bg-slate-50 dark:bg-slate-800/50 p-8 relative overflow-hidden flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full border-[16px] border-indigo-500/30 border-t-indigo-500 border-r-indigo-400 opacity-60"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-white/20 dark:from-slate-900/40 to-transparent"></div>
                </div>:
            firstVisual.includes('scatter')?
                <div className="h-16 relative">
                    <div className="absolute top-2 left-4 w-2 h-2 rounded-full bg-blue-500/80"></div>
                    <div className="absolute top-8 left-10 w-2 h-2 rounded-full bg-indigo-500/80"></div>
                    <div className="absolute top-4 left-24 w-1.5 h-1.5 rounded-full bg-blue-400/80"></div>
                    <div className="absolute top-12 left-28 w-2 h-2 rounded-full bg-purple-500/80"></div>
                    <div className="absolute top-6 left-36 w-1.5 h-1.5 rounded-full bg-blue-300/80"></div>
                </div>:
            firstVisual.includes('radar')?
                <div className="h-16 flex items-center justify-center">
                    <img src="/svg/visuals/new/radarplot.svg" alt="" className="h-20 w-20" />
                </div>:
            firstVisual.includes('line')?
                <div className="group rounded-3xl overflow-hidden  hover:border-[var(--primary)] transition-all duration-300 flex flex-col">
                    <div className="h-48 p-6 relative overflow-hidden flex items-center justify-center">
                    <svg className="w-full h-24 opacity-60" preserveAspectRatio="none" viewBox="0 0 100 40">
                    <path d="M0 35 Q 25 35 50 15 T 100 5" fill="none" stroke="#F59E0B" strokeLinecap="round" strokeWidth="3"></path>
                    </svg>
                    <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"></div>
                    </div>
                </div>:
                
                <div className="grid grid-cols-4 gap-1 w-full h-full opacity-40">
                <div className="bg-blue-600 rounded"></div><div className="bg-blue-400 rounded"></div><div className="bg-blue-200 rounded"></div><div className="bg-blue-500 rounded"></div>
                <div className="bg-blue-300 rounded"></div><div className="bg-blue-700 rounded"></div><div className="bg-blue-500 rounded"></div><div className="bg-blue-400 rounded"></div>
                <div className="bg-blue-100 rounded"></div><div className="bg-blue-500 rounded"></div><div className="bg-blue-600 rounded"></div><div className="bg-blue-300 rounded"></div>
                </div>
            
            }
        </div>
    )
}