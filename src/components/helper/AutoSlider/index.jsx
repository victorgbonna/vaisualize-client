import ImageContainer from "../ImageContainer"
import iconSvgPath from "../iconSvgPath"

export default function AutoSlider({children, teamCurr, setTeamCurr, cards}){
    return (
        <section className='tablet:block bgpc:hidden pc:hidden'>
            <div className="flex mt-10 space-between items-center gap-x-2 relative">
                <div className="flex mt-[-20px] mt-10 space-between items-center gap-x-2 min-w-fit position-center left-0">
                    <button
                        disabled={teamCurr === 0}
                        onClick={() => setTeamCurr(teamCurr - 1)}
                        className=" rounded-r-lg w-fit bg-white h-full flex items-center justify-center"
                        >
                        <img src="/svg/arrow-left.svg" />
                    </button>
                </div>
                <div className="overflow-x-hidden w-full">
                    <div
                        style={{ transform: `translateX(-${teamCurr * 100}%)` }}
                        className="flex flex-nowrap transition-transform duration-500 ease-in-out"
                    >
                        {children}
                    </div>
                </div>
                <div className="flex mt-[-20px] space-between items-center gap-x-2 min-w-fit position-center right-0">
                    <button onClick={teamCurr===cards?.length-1?()=>null:()=>setTeamCurr(+teamCurr+1)} 
                        // style={teamCurr===cards.length-1?{opacity:"0.3"}:{}}
                        disabled={teamCurr === cards?.length - 1}
                        style={{ transform: "rotate(180deg)" }}
                        className="w-fit bg-white rounded-r-lg h-full flex items-center justify-center"

                        >
                        <img src="/svg/arrow-left.svg" />
                    </button>
                </div>
            
            </div>
            <div className="mt-[10px] flex justify-center gap-x-2.5 items-center" id="carousel-slides">
                {cards.map((_,ind)=>
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