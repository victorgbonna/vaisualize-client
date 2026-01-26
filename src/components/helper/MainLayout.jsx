import { consolelog, PAGE_ROUTES } from "@/configs";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { Fragment, useEffect, useState } from "react";

export default function MainLayout({children}){
    const [mount, setMount]= useState(0)
    const router= useRouter()
    const {status}= useSession()
    useEffect(()=>{
        if(!router) return
        if(!status || status==='loading') return

        const isLoggedIn= status==='authenticated'
        const isUserProtectedPath= router?.pathname?.includes('app')
        const isGuestOnlyPath = router?.pathname?.includes('auth/')
        // console.log({status,isLoggedIn, isUserProtectedPath, isGuestOnlyPath, router:router?.pathname})

        if(isLoggedIn && isGuestOnlyPath){
            window.location.href=PAGE_ROUTES.DASHBOARD;
            return
        }
        if(!isLoggedIn && isUserProtectedPath){
            window.location.hraef=PAGE_ROUTES.AUTH_ROUTES.LOGIN+'?r='+encodeURIComponent(router.pathname);
            return
        }

        if(isGuestOnlyPath || isUserProtectedPath) return setMount(-1)
        
        setMount(1)
    },[router.pathname, status])

    if (!mount){
        return null
    }

  return (
    <>
        {mount>0?
        <>
        <Nav isLoggedIn={status==='authenticated'}/>
        <div className="overflow-x-hidden">
            {children}
        </div>
        <Footer/>
        </>
        :
        <div className="overflow-x-hidden">
            {children}
        </div>
        }
    </>
  );
};



function Nav({isLoggedIn}){
    return (
        <nav className="bg-white border border-slate-200 shadow-sm sticky top-0 z-[99] left-0 right-0">
            <PcNav isLoggedIn={isLoggedIn}/>
            <TabletNav isLoggedIn={isLoggedIn}/>
        </nav>
    )
}

function PcNav({isLoggedIn}){
    const [showSubLinks, setShowSubLinks]= useState(null)
    return(
        <div className="tablet:hidden relative  flex items-center justify-between py-4 px-[50px]">
            <Brand/>
            <div className="flex text-[15px] gap-8 font-medium items-center">
                {PAGE_ROUTES.CENTER_NAVS
                    .filter(({isAuth})=>!isAuth)
                    .map(({label, route, routes, hasSublinks},index)=>
                    <Fragment key={index}>
                        {!hasSublinks?
                            <Link href={route} className="hover:text-primary transition-colors">{label}</Link>:
                            <button onClick={()=>{
                                if(!showSubLinks) return setShowSubLinks(routes)
                                return setShowSubLinks(null)
                            }} 
                                style={showSubLinks?{color:'#607AFB'}:{}}
                                className="flex items-center gap-x-[8px] transition-colors">
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
            {isLoggedIn?
            <Link href={PAGE_ROUTES.DASHBOARD} className="rounded-full bg-primary text-white text-[15px] font-semibold px-5 py-2.5 rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all">
                Go To Dashboard
            </Link>
            :<div className="flex items-center gap-x-4">
                <Link href={PAGE_ROUTES.AUTH_ROUTES.LOGIN} className="font-semibold px-5 py-2.5 text-[15px]">
                    Log In
                </Link>
                <Link href={PAGE_ROUTES.AUTH_ROUTES.REGISTER} className="rounded-full bg-primary text-white text-[15px] font-semibold px-5 py-2.5 rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all">
                    Start for Free
                </Link>
            </div>}
        </div>
    )
}

function TabletNav({isLoggedIn}){
    const [showSubLinks, setShowSubLinks]= useState(null)
    const [showNav, setShowNav]= useState(false)
    
    return(
        <div>
        <div className="pc:hidden bgpc:hidden tablet:flex items-center justify-between px-4 py-4">
            <Brand/> 
            <div className="flex gap-x-4 items-center">
                {!isLoggedIn?
                <Link href={PAGE_ROUTES.AUTH_ROUTES.REGISTER} className="rounded-full bg-primary text-white text-[14px] font-semibold px-5 py-2.5 rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all">
                    Start for Free
                </Link>:
                <Link href={PAGE_ROUTES.DASHBOARD} className="rounded-full bg-primary text-white text-[14px] font-semibold px-5 py-2.5 rounded-full hover:shadow-lg hover:shadow-primary/30 transition-all">
                    Dashboard
                </Link>
                }
                <button className="cursor-pointer" onClick={()=>setShowNav(!showNav)}>
                    <img src="/svg/bar-code.svg" alt="bar code" className="w-6 h-6" />
                </button>
            </div>
            
        </div>
        <div className="relative">
            <div 
                className={`${showNav? "max-h-[600px] opacity-1" : "max-h-0 opacity-0"} transition-[max-height] transition-all duration-300 ease-out flex flex-col absolute top-0 bg-white border-b overflow-y-hidden left-0 right-0 text-[15px] gap-8 font-medium p-5 border-t`}>
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
        </div>
    )
}

function Brand(){
    return(
        <Link href='/' className="flex items-center gap-x-[5px]">
            <img className="w-[40px] h-[40px]" src="/images/webbi.png" alt="webbi logo" />
            <h1 className=" text-2xl font-bold tracking-tight">WebBi</h1>
        </Link>
    )
}

function Footer(){
  return(
  <footer className="bg-slate-50 border-t border-slate-200 pt-24 pb-12">
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-20 px-6">
        <h2 className="font-display text-4xl tablet:text:3xl font-bold mb-6 ">Start making sense of your data.</h2>
        <p className="text-slate-600 max-w-2xl mx-auto mb-10 text-lg tablet:text-base">WebBi helps you understand your data instantly, without technical expertise. Join 20,000+ teams visualizing better.</p>
        <div className="flex tablet:flex-row items-center justify-center gap-4 tablet:flex-col tablet:w-full">
          <Link href={PAGE_ROUTES.AUTH_ROUTES.REGISTER} className="w-fit tablet:w-full bg-primary text-white px-10 py-4 rounded-full font-bold text-lg hover:shadow-xl hover:shadow-primary/40 transition-all">Start for free</Link>
          <Link href={'/mvp'} className="w-fit tablet:w-full px-10 py-4 rounded-full font-bold text-lg border border-slate-300 dark:border-slate-700 hover:bg-white  transition-all">See examples</Link>
        </div>
      </div>
      <div className="grid tablet:grid-cols-1 grid-cols-5 gap-12 border-t border-slate-200  pt-16 tablet:pt-10 tablet:px-5 tablet:pr-8">
      <div className="col-span-2 lg:col-span-2">
        <div className="flex items-center gap-2 mb-6">
          {/* <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center"> */}
            <img src="/images/webbi.png" alt="webbi logo" className="w-8 h-8" />
          {/* </div> */}
          <span className="font-display text-xl font-bold tracking-tight">
            WebBi
          </span>
        </div>

        <p className="text-slate-500 text-sm max-w-xs mb-8">
          The modern BI tool for the rest of us. Turning spreadsheets into stories since 2026.
        </p>

        <div className="flex gap-4">
          <Link href={'/'}
            className="w-10 h-10 rounded-full border p-2 border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all"
           
          >
            <img src="/svg/socials/linkedin.svg" className="w-full h-full" style={{
              filter: 'grayscale(100%) brightness(0%)'
            }}/>
            
          </Link>

          <Link href={'/'}
            className="w-10 h-10 rounded-full border p-2 border-slate-200 dark:border-slate-800 flex items-center justify-center hover:bg-primary hover:text-white transition-all"
           
          >
            <img src="/svg/socials/twitter-x.svg" className="w-full h-full" style={{
              filter: 'grayscale(100%) brightness(0%)'
            }}/>
            
          </Link>

        </div>
      </div>

      <div>
        <h4 className="font-bold mb-6">Product</h4>
        <ul className="space-y-4 text-sm text-slate-500">
          <li><Link href='/' className="hover:text-primary transition-colors" >Integrations</Link></li>
          <li><Link href='/' className="hover:text-primary transition-colors" >Data Security</Link></li>
          <li><Link href='/' className="hover:text-primary transition-colors" >Pricing</Link></li>
          {/* <li><Link href='/' className="hover:text-primary transition-colors">Templates</Link></li> */}
        </ul>
      </div>

      <div>
        <h4 className="font-bold mb-6">Company</h4>
        <ul className="space-y-4 text-sm text-slate-500">
          <li><Link href='/' className="hover:text-primary transition-colors">About Us</Link></li>
          <li><Link href='/' className="hover:text-primary transition-colors">Careers</Link></li>
          <li><Link href='/' className="hover:text-primary transition-colors">Blog</Link></li>
          <li><Link href='/' className="hover:text-primary transition-colors">Contact</Link></li>
        </ul>
      </div>

      <div>
        <h4 className="font-bold mb-6">Legal</h4>
        <ul className="space-y-4 text-sm text-slate-500">
          <li><Link href='/' className="hover:text-primary transition-colors">Privacy Policy</Link></li>
          <li><Link href='/' className="hover:text-primary transition-colors">Terms of Service</Link></li>
          <li><Link href='/' className="hover:text-primary transition-colors">Cookie Policy</Link></li>
        </ul>
      </div>
    </div>

<div className="mt-20 pt-8 border-t border-slate-200 text-center text-xs text-slate-400">
  &copy;{new Date().getFullYear()} WebBi Technologies Inc. All rights reserved. Made for data lovers.
</div>

    </div>
  </footer>

  )
}