import { PAGE_ROUTES } from "@/configs";
import Link from "next/link";

export default function AppHeader({active}){
    return(
        <div className="border-b flex items-center justify-between w-full py-3 px-5">
            <div className="flex items-center gap-x-2">
                <Link className="text-gray-500" href={PAGE_ROUTES.HOME}>WebBi</Link>
                <img src="/svg/arrow-right-black.svg" alt="arrow" className="w-2 h-2"/>
                <p>{active}</p>
            </div>
            <div className="flex gap-x-5">
                <button className="relative">
                    {/* <div className="absolute top-2 right-[2px] bg-red-500 text-white w-2 h-2 rounded-full"></div> */}
                    <img src="/svg/bell.svg" alt="bell" className="w-6 h-6" />
                </button>
                <Banner initials={'vo'} imageUrl={''}/>
            </div>
        </div>
    )
}

function Banner({initials, imageUrl}){
    return(
        <div className="p-1 rounded-full bg-primary w-fit h-fit">
            {imageUrl?
                <img className="w-[40px] h-[40px]" src={imageUrl}/>:
                <div className="w-[40px] h-[40px] bg-gray-700 rounded-full flex items-center justify-center">
                    <p className="text-lg uppercase tracking-wider text-white font-semibold text-center">{initials}</p>
                </div>
            }
        </div>
    )
}

