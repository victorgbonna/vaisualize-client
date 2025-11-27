import ImageContainer from "../ImageContainer"
import iconSvgPath from "../iconSvgPath"

export default function AutoSlider({children, teamCurr, setTeamCurr, team}){
    return (
        <section className='pc:hidden bgpc:hidden tablet:block'>
            <div className="flex mt-10 space-between items-center gap-x-2 relative">
            <div className="flex mt-10 space-between items-center gap-x-2 min-w-fit position-center left-0">
                <button
                //  onClick={()=>{
                //   console.log({teamCurr})
                //   setTeamCurr(+teamCurr-1)
                // }} 
                onClick={!teamCurr?()=>null:()=>setTeamCurr(+teamCurr-1)} 
                    style={!teamCurr?{opacity:"0.3"}:{}}
                    
                >
                    <ImageContainer
                    src={iconSvgPath('arrow-slider-left')} className="min-w-12 h-12"/>
                </button>
            </div>
            <div className="flex overflow-x-hidden flex-nowrap w-full items-start">
                {children}
            </div>
            <div className="flex mt-10 space-between items-center gap-x-2 min-w-fit position-center right-0">
                <button onClick={teamCurr===team.length-1?()=>null:()=>setTeamCurr(+teamCurr+1)} 
                    style={teamCurr===team.length-1?{opacity:"0.3"}:{}}>
                    <ImageContainer src={iconSvgPath('arrow-slider-right')} className="min-w-12 h-12"/>
                </button>
            </div>
            
            </div>
            <div className="mt-[10px] flex justify-center gap-x-2.5 items-center" id="carousel-slides">
                {team.map((_,ind)=>
                    <div 
                    className="cursor-pointer w-[9px] h-[9px] rounded-full" key={ind}
                    // style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                    style={
                    teamCurr===ind?
                    {background:'rgba(13, 110, 253, 1)'}:
                    {background:'rgba(206, 232, 255, 1)'}
                    }> 
                    </div>
                )}
            </div>
        </section>
    )
}