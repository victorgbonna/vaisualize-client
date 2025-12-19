
import { EnterChatModal, ModalLayout } from "@/components/modal";
import { API_ENDPOINTS, consolelog } from "@/configs";
import { EnterChatContext } from "@/context";
import { useHttpServices } from "@/hooks";
import { useQuery } from "@tanstack/react-query";
import Head from "next/head";
import { useContext, Fragment, useEffect, useState, useRef } from "react";
import Link from "next/link";
// import sampleData from "@/data/extracted_responses.json";
import { AutoSlider, DataFetch, iconSvgPath, ImageContainer, VaisualizeForm, VisualCard } from "@/components";
// import Image from "next/image";


export default function Home() {
  const { showModal, setShowModal } = useContext(EnterChatContext);
  const socials=[
    // {href:'/', src:'twitter-x.svg'},
    {href:API_ENDPOINTS.MY_DETAILS.LINKEDIN, src:'linkedin.svg', extra:true},
    // {href:'/', src:'insta.svg'},
  ]
  
  return (
    <main className="overflow-x-hidden pb-10">
      <Head>
        <title>{"WebBi – Turn Spreadsheets Into Clean Visuals in Minutes"}</title>
        <meta name="description" 
          content="WebBi is a straight-to-the-point tool that helps businesses, freelancers and analysts instantly visualize data. Filter, plot and modify visuals quickly — no coding needed." />
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>
      <>
        {/* <h1 className={"text-black text-5xl "}>v<span className="text-purple-700">AI</span>sualize</h1> */}
      {/* <div className="justify-center flex py-3">

      </div> */}
      <HeroSection/>
      <CSteps/>
      
      <RecentWorks/>
      <VaisualizeForm/>
      <section className="pt-16 flex flex-col items-center tablet:px-4">
        <div className="text-center mb-8">
          <h6 className="text-2xl font-medium">NEED HUMAN EXPERTISE?</h6>
          <p className="text-sm text-[#5D5C5C]">Connect with our data professionals for deeper insights</p>
        </div>

        <div className="rounded-lg bg-[#F5F4FF] flex tablet:flex-col  items-center py-7 px-5 gap-x-10" style={{boxShadow: '0px 10px 21px 0px rgba(0, 0, 0, 0.1)'}}>
          <img src="/images/victorgbonna.png" alt="victor ogbonna" className="w-[124px] h-[124px] rounded-full object-top object-cover"/>
          <div className="w-[600px] tablet:w-full tablet:text-center">
            <p className="text-lg font-medium">Victor Chiedo Ogbonna</p>
            <p className="text-[#8F34E9]">Senior Software Engineer & Data Expert</p>
            <p className="italic text-sm mt-4 mb-5">{'“Let me help you interpret complex findings and provide startegic recommendations for your specific use case. With 7+ years of experience, I’ll ensure you get actionable insights.'}</p>
            <div className="flex items-center gap-4 tablet:flex-col">
              <div className="w-fit gap-x-3 flex items-center">
                <div className="flex px-3 py-1 rounded-lg p2 gap-x-2 items-center">
                  {socials.map(({src, href, extra},ind)=>
                    <Link href={href} key={ind} className="flex items-center gap-x-1 py-2">
                      <img src={'/svg/socials/'+src} className="w-5 h-5" style={extra?{marginTop:'-5px',filter: 'brightness(0) invert(1)'}:{filter: 'brightness(0) invert(1)'}}/>
                    </Link>
                  )}
                </div>

                <p className="text-black font-semibold">FOLLOW</p>
              </div>
              <Link href={API_ENDPOINTS.MY_DETAILS.WHATSAPP} className="p1 w-fit rounded-lg px-8 py-2 flex gap-x-3 flex items-center">
                <img src="/svg/comment.svg" className="w-5 h-5"/>
                <p className="text-white">CONTACT EXPERT</p>
              </Link>
            </div>

          </div>
        </div>
      </section>
      </>
    </main>

  );
}

function HeroSection(){
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);
  // const router = useRouter()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
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
    <section
        ref={elementRef}
        className={` bg-opacity-[10%] hero ${isVisible?" hero-v ":"  "} relative h-fit w-screen tablet:h-fit p-6`}>
        <div className="h-full flex flex-col items-center justify-center z-10 relative">
            <div className="div items-center gap-x-2 flex py-1.5 px-6 rounded-[30px] mt-6 bg-white">
                <img className="w-5 h-5" src="/svg/magic.svg"/>
                <p className="font-semibold text-[15px]">Powered by <span className="gradient-text">AI</span></p>
              </div>
            {/* <p className="text-[60px] font-semibold">v<span className="gradient-text">AI</span>sualize</p> */}
            <h1 className="text-[60px] tablet:text-[40px] font-semibold">WebBi</h1>
            <div className="text-center u flex flex-col items-center">
            <p className=" text-[40px] font-medium text-[#5345E6] tablet:text-[20px] tablet:text-center">Turn Spreadsheets Into Clear Visuals.</p>
            <p className="tablet:text-center ">WebBi is a straight-to-the-point tool that helps businesses, freelancers and analysts visualize data fast, with no tech skills needed.</p>
            <p className="mb-2 tablet:text-center tablet:mt-3">Filter, plot and modify visuals quickly — no coding needed.</p>
            <div className="relative w-fit h-fit mt-8 flex gap-x-4 gap-y-5 tablet:flex-col tablet:justify-center">
                <button className="herobtn3 border-dashed bg-white border-2 border-black flex justify-center gap-x-5 items-center h-full px-10 py-3 rounded-[30px]">
                    {/* <img style={{filter:'brightness(0) invert(1)'}} src="/svg/upload.svg" alt="upload" /> */}
                    <p className=" font-medium">Explore Samples</p>
                </button>

                <button className="herobtn flex justify-center gap-x-3 items-center h-full px-10 py-3 rounded-[30px]">
                    <img style={{filter:'brightness(0) invert(1)'}} src="/svg/upload.svg" alt="upload" />
                    <p className="text-white font-medium">{'Analyze Now (Free)'}</p>
                </button>
            </div>
            <div className="mt-10 flex flex-col gap-6 tablet:gap-4 tablet:w-full">
                <div className="shadow-xl rounded-xl"
                  style={{
                    borderColor:'rgba(56, 56, 56, 0.12)',
                    borderWidth:'1.5px'
                }}
                >
                  <ImageContainer 
                    src={'/images/snapshot/card_visuals.png'} 
                    className={'w-[1000px] h-[400px] tablet:w-full rounded-xl tablet:h-[300px]'} 
                    imgClass={' object-top object-cover object-left tablet:object-left'}
                  />            
                </div>
              {[4].map((x,ind)=>
                <div key={ind} className="shadow-xl rounded-xl"
                  style={{
                    borderColor:'rgba(56, 56, 56, 0.12)',
                    borderWidth:'1.5px'
                }}
                >
                  <ImageContainer src={'/images/snapshot/card_visuals_'+x+'.png'} 
                    imgClass={' object-top object-cover object-left tablet:object-left'}                  
                  className={'w-[1000px] h-[400px] tablet:w-full rounded-xl tablet:h-[350px]'}/>            
                </div>
              )}

            </div>
            </div>
        </div>
        <div className="herobg absolute h-full border border-black inset-0 z-[-2] pointer-events-none">
        </div>
        


    </section>
  )
}

function CSteps(){
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);
  // const router = useRouter()

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
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
    <div ref={elementRef} 
      className={` bg-opacity-[10%] hero ${isVisible?" hero-v ":"  "} bg-white hero pt-20 tablet:px-4 pb-20 tablet:py-10 `}>
        <section className="x flex justify-center flex-col items-center">
          <div className="text-center">
              <p className="text-[35px] font-semibold tablet:text-lg">How <span>WebBi</span> works</p>
              <p className="text-[#5D5C5C]">{"(Just)4 simple steps to unlock your business potential"}</p>
          </div>
          <div className="u">
            <Steps/>
          </div>
          
          <div className="h-full flex flex-col items-center justify-center z-10 relative tablet:px-4">
              <div className="relative w-fit h-fit mt-8">
                  <button className="buttonreal flex justify-center gap-x-5 items-center h-full px-10 py-3 rounded-[30px]">
                      {/* <img style={{filter:'brightness(0) invert(1)'}} src="/svg/upload.svg" alt="upload" /> */}
                      <p className="text-white font-medium">Get Started</p>
                  </button>
              </div>
          </div>
      </section>
      </div>
  )
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

function Steps(){
    const vaisualizeSteps = [
    {
        title: "Upload Your Data",
        description: "Start by uploading your dataset to the platform. Make sure your file is in a supported format so our AI can read it easily.",
        image: "upload.svg" 
    },
    {
        title: "Column Setup",
        description: "Arrange your columns according to their specific data types. Highlight or remove columns that are unnecessary to ensure accurate visualization.",
        image: "gear.svg" 
    },
    {
        title: "Generate AI Visuals",
        description: "Sit back and wait as our AI automatically processes your data and transforms it into insightful, interactive visuals.",
        image: "magic.svg" 
    },{
        title: "Review & Modify", 
        description: "Review your visuals and make adjustments instantly. Modify chart styles, update values and apply filters as needed.",
        image: "gear.svg"
    }
    ];
    return(
        <div className="pb-5 grid grid-cols-2 mt-20 px-10 tablet:px-5 justify-center gap-10 tablet:grid-cols-1 items-start tablet:mt-10">
            {vaisualizeSteps.map(({title, description, image},ind)=>
                <div key={ind} className="step-card flex flex-col items-center">
                    <div className="card bg-[#E34AA5] p-3 rounded-md p-[24px] mb-3 rounded-lg w-fit">
                        <img src={'/svg/steps/'+image} alt={image} className="w-6 h-6"/>
                    </div>
                    <div className="text-center w-[350px] tablet:w-full">
                        <p className="font-semibold text-xl">STEP {ind+1}</p>
                        <p className={`font-semibold text-lg gradient-p ${ind===0?' p1 ':ind===1?' p2 ':ind===2?' p3 ':' p1 '}`}>{title}</p>
                        <p className="text-[#5D5C5C] mt-4 text-[15px]">{description}</p>
                    </div>

                </div>
            )}
        </div>
    )
}

function RecentWorks(){
    const {getData}= useHttpServices()
    const getAllCharts=async()=>{    
        return await getData({path:API_ENDPOINTS.GET_ALL_PUBLIC_REQUESTS})
    }
    
    const {isLoading:reqLoading, data:req_data, error, isError:isReqError}= useQuery(
        {
        queryKey:['all-public-request'],
        queryFn:()=>getAllCharts(),
        refetchOnWindowFocus: false,
        retry:false, enabled:true
        }
    )
    const [activeIndex, setActiveIndex] = useState(0);
    const content = ["1","5", "4", "2"]

    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef(null);
    // const router = useRouter()

    useEffect(() => {
        const observer = new IntersectionObserver(
        ([entry]) => {
            if (entry.isIntersecting) {
            setIsVisible(true);
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

    
    useEffect(() => {
        const interval = setInterval(() => {
        setActiveIndex(prevIndex => (prevIndex + 1) % content.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [content.length]);

    return(
        <section 
          className={` bg-[#EEF4FA] mt-20 py-14 px-20 tablet:px-5`}>
            <div className="text-center x">
                <h2 className="text-3xl mb-[6px] font-semibold text-[#5345E6]">Recent Analysis</h2>
                <p className="text-[#5D5C5C] text-sm">Showing what others are discovering with WebBi</p>
            </div>
            <DataFetch
              isLoading={reqLoading}
              isError={isReqError}
              errorMsg={error?.message}
            >
              <div className="x">
                <VisualCard cards={req_data?.requests}/>
              </div>
            </DataFetch>

        </section>
    )
}



