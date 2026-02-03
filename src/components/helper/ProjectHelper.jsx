import { API_ENDPOINTS, consolelog } from "@/configs"
import { useHttpServices } from "@/hooks"
import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { DataFetch } from ".."
import moment from "moment"
import Link from "next/link"

export default function ProjectHelper(){
    const {getData, getProtectedData}= useHttpServices()
    const getMyCharts=async()=>{    
        return await getProtectedData({path:API_ENDPOINTS.GET_MY_REQUESTS})
    }
    
    const {isLoading:reqLoading, data:req_data, error, isError:isReqError}= useQuery(
        {
            queryKey:['personal-visuals'],
            queryFn:()=>getMyCharts(),
            refetchOnWindowFocus: false,
            retry:false
        }
    )
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
                    {req_data?.requests?.map((data,ind)=>
                        <ProjectItem key={ind} ind={ind} {...data} />
                    )}
                </div>
            </DataFetch>
        </section>
    )
}

function ProjectItem(props){
    return(
        <Link href={'/'} className="border rounded-xl hover:border-primary hover:border-2  shadow-lg bg-slate-50 flex flex-col">
            <ChartSelection firstVisual={props?.visuals_obj?.visuals[0]?.plot_type?.split(',')[0]}/>
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