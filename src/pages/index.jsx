
import { EnterChatModal } from "@/components/modal";
import { API_ENDPOINTS, consolelog } from "@/configs";
import { EnterChatContext } from "@/context";
import { useHttpServices } from "@/hooks";
import { useQuery } from "@tanstack/react-query";
import Head from "next/head";
import { useContext, Fragment, useEffect, useState } from "react";
import Link from "next/link";
import sampleData from "@/data/extracted_responses.json";
import { iconSvgPath, VaisualizeForm } from "@/components";
// import HistogramChart from "@/components/chart/chartTools/Histogram";
// import ViolinPlotExample from "@/components/chart/chartTools/ViolinPlot";
// import BoxPlotExample from "@/components/chart/chartTools/BoxPlot";
// import dynamic from 'next/dynamic';

// const BoxPlotExample = dynamic(
//   () => import('@/components/chart/chartTools/BoxPlot'),
//   { ssr: false }
// );
export default function Home() {
  const { showModal, setShowModal } = useContext(EnterChatContext);

  const {getData}= useHttpServices()
  const getAllSeasonsData=async()=>{    
    return await getData(API_ENDPOINTS.GET_ALL_SEASONS)
  }
  
  const {isLoading:seasonLoading, data:seasons_data, error, isError:isSeasonsError}= useQuery(
    {
      queryKey:['all-seasons'],
      queryFn:()=>getAllSeasonsData(),
      refetchOnWindowFocus: false,
      retry:false, enabled:false
    }
  )
  // consolelog({seasons_data, error})
  
  const data= sampleData

  // console.log({data})
  return (
    <main className="overflow-x-hidden">
      <Head>
        <title>{"vAIsualize – AI-Powered Data Visualization tool for Instant Insights"}</title>
        <meta name="description" content="Explore comprehensive stats and highlights from the football season. Discover match performances, goal-scoring tdends, and key highlights for valuable insights into the season's top moments." />
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>
      <>
      {/* <div className="largepc:hidden pc:hidden tablet:flex justify-center">
          <p>I apologise for the inconvenience. This application is not available on mobile yet, you can only view on PC</p>
      </div> */}
      {/* <HistogramChart/> */}
      {/* <BoxPlotExample/> */}
      {/* <></> */}
      <div 
      // style={{backgroundImage: `}} 
        className="relative h-screen  w-screen tablet:h-fit p-6 flex flex-cols items-center tablet:hidden">
        {/* <img className="z-1 absolute inset-0 h-full w-full" 
        src="https://res.cloudinary.com/greyhairedgallery/image/upload/v1714247792/altaria_hub_uploads/ajvmfxu8s1m4qiqdrytc.jpg"
        
        /> */}
        <div className="z-[3] relative justify-center items-center flex  tablet-max-w-full tablet:flex-col gap-x-[80px] w-full px-[120px]">
            <div className="space-y-4 flex flex-col items-center justify-center ">
              <div className="flex flex-col items-center justify-center space-y-[2px]">
                <h1 className={"text-black text-5xl "}>v<span className="text-purple-700">AI</span>sualize</h1>
                <p className={"text-black"}>{"AI in Data Analysis"}</p>
              </div>
              <div className="flex flex-col justify-center">
                <p className="mb-2">Upload your dataset. Let AI do the analysis for you — for free.</p>
                <button onClick={()=>setShowModal('yes')} className="ring-2 ring-purple-500 rounded-md bg-purple-700 text-base px-6 py-3 text-white shadow-xl">Get Started</button>
              </div>

            </div>
            <div className="max-w-[45%]">
              
                {
                false?
                <div className="h-[300px] w-full">

                </div>
                :
                <div style={0?{visibility:'hidden'}:{}}>
                  <p className="text-center text-lg font-medium uppercase mb-2">
                    Recent Public Prompts - {seasons_data?.data?.seasons?.length || ''}
                  </p>

                  <div className="flex overflow-x-hidden space-x-3 w-full flex-nowrap gap-x-[2%]">
                    {data?.map(({data},ind)=>
                      <Link href={'/visuals/'+ind} key={ind} className="relative min-w-[100%] shadow-xl shadow-indigo-500/50 rounded-md border-purple-600 border">
                        <div className="px-5 py-5">
                          <p className="text-xl text-center mb-3">EPL 2020/2021 STATISTICS</p>
                          <p className="text-sm">{data?.request?.description}</p>
                        </div>
                        <div className="text-black px-2 py-1 rounded-md text-xs w-full">
                          <p className="w-fit text-right bg-purple-500 border border-white p-2 float-right">{'health'}</p>
                        </div>
                        <div className="bg-purple-500 text-black p-2 text-sm italic">
                          <p>{data?.request?.goal.slice(0, 80)+ (data?.request?.goal?.length>80 ? '...':'')}</p>
                        </div>

                         <div className="absolute top-2 right-2 bg-purple-400 text-black px-2 py-1 rounded-md text-xs">
                          <p>{'2 days ago'}</p>
                        </div>
                        <div className="px-5 py-5">
                          <ChartIcons chart_icons={data?.visuals_sugg}/>
                        </div>
                      </Link>
                    )}
                  </div>
                </div>
                }
            </div>
        </div>
        <div className="absolute bottom-[3%] flex justify-center w-[94vw] z-[4] flex items-center ">
          <div className="flex items-center text-black text-base w-fit">
            <p>{'Created by'}&nbsp;</p>
            <Link href="https://www.linkedin.com/in/victorgbonna/" className="font-semibold">Ogbonna Victor</Link> 
            <p>.&ensp;Need my Expertise?</p>&nbsp;
            <Link href="mailto: victorgbonna@gmail.com" className="flex items-center">
              <p className="text-purple-500">Contact me here</p>&nbsp;
              <img src="/svg/mail.svg" className="w-6 h-6"/>
            </Link> 
          </div>
        </div>
      </div>
      <VaisualizeForm/>
      </>
    </main>
  );
}

function ChartIcons({chart_icons}){
  const [count, setCount]= useState({})
  const [setIcons, setSetIcons]= useState([])
  useEffect(()=>{
    const no_dupl_icons=chart_icons.filter(({plot_type})=>
      !plot_type.includes(',')
    ).filter((v,i,a)=>
      a.findIndex(t=>(t.plot_type === v.plot_type))===i
    )
    consolelog({no_dupl_icons})
    setSetIcons(no_dupl_icons)

    setCount({
      fullCount:no_dupl_icons.length,
      errorCount:0,
      showCount:5
    })
  },[])
  return(
    <div className="flex items-end space-x-2">
      <div className="flex gap-x-3 items-end">
      {setIcons?.map(({plot_type},ind)=>
        <Fragment key={ind}>
          <ChartIcon src={
            plot_type?.toLowerCase()?.replace(' ','')
          } minusCount={()=>setCount({...count, errorCount:count.errorCount+1})}/>
        </Fragment>
      )}
      </div>
      <p className="text-xs text-purple-500">{'+'+(count.fullCount-(count.showCount-count.errorCount))+'chart(s)'}</p>
    </div>
  )
}

function ChartIcon({src, minusCount}){
  const [visible, setVisible] = useState(true);
  if (!visible || !src) return null; 

  return (
    <img
      src={iconSvgPath('visuals/'+src.split(',')[0])}
      className={'w-6 h-6'}
      onError={() => {
        minusCount()
        setVisible(false)
      }} 
    />
  );
}