import { PAGE_ROUTES } from "@/configs";
import Link from "next/link";

export default function AppHeader({active}){
    return(
        <div className="items-center justify-between w-full py-4 px-5">
            <div>
                <Link href={PAGE_ROUTES.HOME}>WebBi</Link>
                <img src="/svg/arrow-right-black.svg" alt="arrow" />
                <p>{active}</p>
            </div>
            <div>
                <Banner initials={'vo'} imageUrl={''}/>
            </div>
        </div>
    )
}

function Banner({initials, imageUrl}){

    return(
        <div className="p-1 rounded-full w-[50px] h-[50px]">
            {imageUrl?
                <img className="w-full h-full" src={imageUrl}/>:
                <div className="w-full h-full items-center justify-center">
                    <p className="text-lg font-semibold">{initials}</p>
                </div>
            }
        </div>
    )
}

