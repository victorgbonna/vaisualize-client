import { PAGE_ROUTES } from "@/configs";
import Link from "next/link";
import { Fragment, useState } from "react";

export default function MainLayout({children}){
  return (
    <>
        <Nav/>
        <main>
            {children}
        </main>
    </>
  );
};



function Nav(){

    return (
        <nav className="bg-white border border-slate-200 shadow-sm sticky top-0 z-[99] left-0 right-0">
            <PcNav/>
            <TabletNav/>
        </nav>
    )
}

function PcNav(){
    const [showSubLinks, setShowSubLinks]= useState(null)
    return(
        <div onMouseLeave={()=>setShowSubLinks(null)} className="tablet:hidden relative  flex items-center justify-between py-4 px-[50px]">
            <Brand/>
            <div className="flex text-[15px] gap-8 font-medium items-center">
                {PAGE_ROUTES.CENTER_NAVS
                    .filter(({isAuth})=>!isAuth)
                    .map(({label, route, routes, hasSublinks},index)=>
                    <Fragment key={index}>
                        {!hasSublinks?
                            <Link href={route} className="hover:text-primary transition-colors">{label}</Link>:
                            <button 
                                onMouseEnter={()=>setShowSubLinks(routes)} 
                                className="flex items-center gap-x-[8px] hover:text-primary transition-colors">
                                <p style={showSubLinks?{color:'#607AFB'}:{}}>{label}</p>
                                <img className="mt-[2px]" src={!showSubLinks?"/svg/caret-bottom.svg":'/svg/caret-blue-bottom.svg'}  alt="caret" />
                                
                            </button>
                        }
                    </Fragment>
                )}
                {showSubLinks?
                <div className="w-fit absolute top-[110%] gap-6 grid grid-cols-3 bg-white rounded-md p-5 border">
                    {showSubLinks?.map(
                        ({feature, descr},ind)=>
                        <div key={ind}>
                            <p className="underline">{feature}</p>
                            <p className="text-xs w-[200px] text-gray-500 mt-2">{descr}</p>
                        </div>
                    )}
                </div>:null}
            </div>
            <div className="flex items-center gap-x-4">
                <Link href={'/'} className="font-semibold px-4 py-2 text-[15px]">
                    Log In
                </Link>
                <Link href={'/'} className="rounded-full bg-primary text-white text-[15px] font-semibold px-5 py-2.5 rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all">
                    Start for Free
                </Link>
            </div>
        </div>
    )
}

function TabletNav(){
    const [showSubLinks, setShowSubLinks]= useState(null)
    const [showNav, setShowNav]= useState(false)
    
    return(
        <div className="pc:hidden largepc:hidden tablet:flex items-center justify-between px-6 py-4 relative">
            <Brand/> 
            <div className="flex gap-x-2 items-center">
                <Link href={'/'} className="rounded-full bg-primary text-white text-[14px] font-semibold px-5 py-2.5 rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all">
                    Start for Free
                </Link>
                <button className="cursor-pointer" onClick={()=>setShowNav(!showNav)}>
                    <img src="/svg/bar-code.svg" alt="bar code" className="w-6 h-6" />
                </button>
            </div>
            <div style={showNav?{}:{display:'none'}} className="flex flex-col absolute top-full bg-white left-0 right-0 h-fit text-[15px] gap-8 font-medium p-5 border-t">
                {PAGE_ROUTES.CENTER_NAVS
                    .filter(({isAuth})=>!isAuth)
                    .map(({label, route, routes, hasSublinks},index)=>
                    <Fragment key={index}>
                        {!hasSublinks?
                            <Link href={route} className="hover:text-primary transition-colors">{label}</Link>:
                            <div>
                                <button 
                                    onClick={showSubLinks?()=>setShowSubLinks(null):()=>setShowSubLinks(routes)} 
                                    className="flex items-center gap-x-[8px] hover:text-primary transition-colors">
                                    <p>{label}</p>
                                    <img className="mt-[2px]" src={1?"/svg/caret-bottom.svg":'/svg/caret-blue-bottom.svg'}  alt="caret" />
                                    
                                </button>
                                {showSubLinks?
                                <div className="w-fit p-5 pb-0 space-y-3">
                                    {showSubLinks?.map(
                                        ({feature, descr},ind)=>
                                        <div key={ind} className="flex items-center gap-x-[10px]">
                                            <div className="w-2 h-2 bg-black rounded-full"></div>
                                            <p className="">{feature}</p>
                                            {/* <p className="text-xs w-[200px] text-gray-500 mt-2">{descr}</p> */}
                                        </div>
                                    )}
                                </div>:null}
                            </div>
                            
                        }
                    </Fragment>
                )}
                
            </div>
        </div>
    )
}

function Brand(){
    return(
        <div className="flex items-center gap-x-[5px]">
            <img className="w-[40px] h-[40px]" src="/images/webbi.png" alt="webbi logo" />
            <h1 className=" text-2xl font-bold tracking-tight">WebBi</h1>
        </div>
    )
}