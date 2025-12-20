import { AutoSlider, iconSvgPath, ImageContainer } from "@/components"
import { API_ENDPOINTS, consolelog, PAGE_ROUTES } from "@/configs"
import moment from "moment"
import Link from "next/link"
import { Fragment, useState, useEffect, useRef } from "react"

export default function VisualCard({cards}){
    const [teamCurr, setTeamCurr]= useState(0)
    const elementRef = useRef(null);
    const [seen,setSeen]= useState(false)
     useEffect(() => {
        if(!seen) return
        const interval = setInterval(() => {
            setTeamCurr(prevIndex => (prevIndex + 1) % cards?.length);
          
        }, 3000);
    
        return () => clearInterval(interval);
    }, [seen, teamCurr]);
    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setSeen(true);
          }
        },
        { threshold: 0.3 } 
      );

      if (elementRef.current) {
        observer.observe(elementRef.current);
      }

      return () => {
        if (elementRef.current) {
          observer.unobserve(elementRef.current);
        }
      };
    }, []);
    return(
    <div className="mb-10 mt-10" ref={elementRef}>

      <div className=" tablet:hidden flex justify-center gap-x-7 items-center mb-6">
        <button
          disabled={teamCurr === 0}
          onClick={() => setTeamCurr(teamCurr - 1)}
          className="w-fit h-full flex items-center justify-center"
        >
          <img src="/svg/arrow-left.svg" />
        </button>

        <button
          disabled={teamCurr === cards.length - 1}
          onClick={() => setTeamCurr(teamCurr + 1)}
          style={{ transform: "rotate(180deg)" }}
          className="w-fit h-full flex items-center justify-center"
        >
          <img src="/svg/arrow-left.svg" />
        </button>
      </div>

      <div className=" tablet:hidden overflow-x-hidden px-[20px]">
        <div
          id="carousel-slides"
          style={{ transform: `translateX(-${teamCurr * 33.5}%)` }}
          className="flex flex-nowrap gap-6 transition-transform duration-500 ease-in-out"
        >
          {[...cards, ...cards.slice(0,4)].map((card, ind) => (
            <Fragment key={ind}>
              <AnalysisCard key={ind} data={card} index={ind} /> 
            </Fragment>   
          ))}
        </div>
      </div>
      <AutoSlider
        teamCurr={teamCurr}
        cards={cards}
        setTeamCurr={setTeamCurr}
      >
        {cards?.map((card, ind) => (
          <AnalysisCard key={ind} data={card} index={ind} />
        ))}
      </AutoSlider>
    </div>

    )
}
const getGradientClass = (index) => `grad-${index % 3}`;

function AnalysisCard({ data, index }){
  const { _id, title, category, visuals_obj, description, createdAt } = data;

  return (
    <div
      className="step-card min-w-[32%] tablet:min-w-full rounded-lg bg-white pb-4"
      style={{ boxShadow: "0px 4px 4px rgba(0,0,0,0.25)" }}
    >
      <div
        className={`relative card h-[190px] rounded-t-lg flex flex-col justify-center items-center px-10 text-center ${getGradientClass(index)}`}
      >
        <p className="text-white font-semibold">{title}</p>
        <p className="absolute right-0 bottom-[-10px] px-5 py-1 text-xs font-semibold bg-blue-500 text-white">
          {category}
        </p>
      </div>
      <div className="px-5">
        <div className="h-[90px] mt-9 mb-3">
          <p className="text-graySubHd text-[14px] leading-[22px]">
            {description?.length < 160
              ? description
              : description.slice(0, 160) + "..."}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <p
            className="text-xs text-gray-600 p-2 rounded-sm"
            style={{ background: "rgba(240, 244, 246, 0.8)" }}
          >
            {moment(createdAt).startOf("day").fromNow()}
          </p>

          {visuals_obj?.visuals && (
            <ChartIcons chart_icons={visuals_obj.visuals} />
          )}
        </div>

        <div className="mt-4">
          <Link
            href={PAGE_ROUTES.A_REQUEST_PAGE(_id) || "/"}
            className="herobtn hoverbutton w-full flex justify-center items-center px-10 py-3 rounded-md"
          >
            <p className="text-white font-medium">View Analysis</p>
          </Link>
        </div>
      </div>
    </div>
  );
};



function ChartIcons({chart_icons}){
  
  const [count, setCount]= useState({})
  const [setIcons, setSetIcons]= useState([])
  useEffect(()=>{
    const no_dupl_icons=chart_icons.filter(({plot_type})=>
      !plot_type.includes(',')
    ).filter((v,i,a)=>
      a.findIndex(t=>(t.plot_type === v.plot_type))===i
    )
    setSetIcons(no_dupl_icons)

    setCount({
      fullCount:no_dupl_icons.length,
      errorCount:0,
      showCount:5
    })
  },[])
  // console.log({plot_type})
  return(
    <div className="flex items-end space-x-2.5">
      <div className="flex gap-x-3 items-end">
      {setIcons?.slice(0,2)?.map(({plot_type},ind)=>
        <Fragment key={ind}>
          <ChartIcon src={
            plot_type?.toLowerCase()?.replace(' ','')
          } minusCount={()=>setCount({...count, errorCount:count.errorCount+1})}/>
        </Fragment>
      )}
      </div>
      <p className="text-xs">{'+'+(count.fullCount-(2-count.errorCount) || '')+' chart(s)'}</p>
    </div>
  )
}
// (count.showCount-count.errorCount)
function ChartIcon({src, minusCount}){
  const [visible, setVisible] = useState(true);
  if (!visible || !src) return null; 
  
  return (
    <img
      src={iconSvgPath('visuals/'+src.split(',')[0])}
      className={'w-4 h-4'}
      onError={() => {
        minusCount()
        
        setVisible(false)
      }} 
    />
  );
}
