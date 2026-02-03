import { PAGE_ROUTES } from "@/configs";
import Link from "next/link";
import { Fragment } from "react";

export default function SideBar({active}){
    return(
    <aside className="bg-slate-50 border-r pl-8 pt-6 pb-9 w-[250px]">
            <div className="flex sticky top-0 items-center gap-x-3 mb-0">
                <Link href={PAGE_ROUTES.HOME}>
                    <img src="/images/webbi.png" alt="webbi" className="w-10 h-10"/>
                </Link>
                <div>
                    <h1 className="text-xl font-semibold">WebBi</h1>
                    <p className="text-gray-600">Victor Ogbonna</p>
                </div>
            </div>
            <div className=" h-[82vh] overflow-y-scroll pr-5 pt-5">
                <div className="space-y-2">
                    
                    {PAGE_ROUTES.PROTECTED_SIDEBARS.filter(({isNotPage})=>isNotPage)
                        .map((props,ind)=>
                            <Fragment key={ind}>
                                <SideBarLink {...props} isActive={props.label===active}/>
                            </Fragment>
                        )}
                </div>
                <div>
                    <p className="text-sm text-gray-500 mt-6 ml-2 mb-3">PAGES</p>
                    <div className="space-y-2">
                        {PAGE_ROUTES.PROTECTED_SIDEBARS.filter(({isNotPage})=>!isNotPage)
                        .map(({label, link, disabled, svg, alt},ind)=>
                            <Fragment key={ind}>
                                {disabled?
                                    <button disabled={true} className="flex w-full py-2 pl-2 items-center gap-x-4 pl-4">
                                        <img src={'/svg/sidebar/'+svg} alt={alt || svg} className="w-6 h-6"/>
                                        <p>{label}</p>
                                    </button>:
                                    <SideBarLink isActive={label===active} alt={alt} link={link} label={label} disabled={disabled} svg={svg}/>
                                }
                            </Fragment>
                        )}
                    </div>
                </div>
            </div>
       
    </aside>
    )
}

function SideBarLink({link, svg, alt, label, isActive}){
    return(
        <Link style={isActive?{background:'#FFFFFF', border:'1px solid #e5e7eb'}:{}} href={link ?? '/'} className=" w-full pl-4 rounded-lg py-2 flex items-center gap-x-4">
            <img src={'/svg/sidebar/'+svg} alt={alt || svg} className="w-6 h-6"/>
            <p>{label}</p>
        </Link>
    )
}
