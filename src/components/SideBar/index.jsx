import Link from "next/link";
import { ImageContainer, iconSvgPath } from "..";

const Sidebar=({onClick, active})=> {
    const sides=[
        {
            tab:"General",
            value:"general",
            imgSrc:"chart"
        },{
            tab:"Goals",
            value:"goals",
            imgSrc:"match"
        },{
            tab:"Cleansheets",
            value:"clean-sheets",
            imgSrc:"gloves"
        },{
            tab:"Matches",
            value:"matches",
            imgSrc:"match2"
        },{
            tab:"Teams",
            value:"teams",
            imgSrc:"team"
        },{
            tab:"Gameweek",
            value:"gameweek",
            imgSrc:"gameweek"
        },{
            tab:"Referee",
            value:"referee",
            imgSrc:"whistle"
        },{
            tab:"Stadium",
            value:"stadium",
            imgSrc:"stadium"
        }
    ]
    return (
        <aside className="sticky overflow-y-hidden top-0 p-[30px] w-[230px] rounded-[18px] text-[#4D4D4D] border-r-2">
            <div>
                <h2 className="text-[#E51837] text-[19px] font-medium ">FootyDataScraper</h2>
                <p style={{textAlign:"right"}} className="text-xs italic mt-2 mb-8">project done by <Link className="underline" href={'https://greyhaired-victorgbonna.vercel.app/'}>victorgbonna</Link></p>
            </div>
            {/* background:"#1B59F81A", color:"#1B59F8", backgroundOpacity:"10%" */}
            <div className="flex flex-col gap-5 gap-y-4">
                {sides.slice(0,4).map(({tab, value, imgSrc},ind)=>
                    <button key={ind} style={active===value?{borderBottom:"3px solid #1B59F8", borderBottomColor:"#1B59F8"}:{}} 
                        className="flex items-center gap-x-[10px] py-2 px-3 w-full text-sm" onClick={()=>onClick(value)}>
                        <ImageContainer src={iconSvgPath(imgSrc)} className={'w-[22px] h-[22px]'}/>
                        <p>
                            {tab}
                        </p>
                    </button>
                )}
                <p className="mt-[-2px] text-gray-500 text-sm">Extra</p>
                {sides.slice(4).map(({tab, value, imgSrc},ind)=>
                    <button key={ind} style={active===value?{borderBottom:"3px solid #1B59F8", borderBottomColor:"#1B59F8"}:{}} 
                        className="flex items-center gap-x-[10px] py-2 px-3 w-full text-sm" onClick={()=>onClick(value)}>
                        <ImageContainer src={iconSvgPath(imgSrc)} className={'w-[22px] h-[22px]'}/>
                        <p>
                            {tab}
                        </p>
                    </button>
                )}
            </div>
        </aside>
    );
}

export default Sidebar