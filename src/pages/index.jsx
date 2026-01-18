
import { EnterChatModal, ModalLayout } from "@/components/modal";
import { API_ENDPOINTS, consolelog, PAGE_ROUTES } from "@/configs";
import { EnterChatContext } from "@/context";
import { useHttpServices } from "@/hooks";
import { useQuery } from "@tanstack/react-query";
import Head from "next/head";
import { useContext, Fragment, useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
// import sampleData from "@/data/extracted_responses.json";
import { AutoSlider, DataFetch, iconSvgPath, ImageContainer, VaisualizeForm, VisualCard } from "@/components";
import { useRouter } from "next/router";

export default function Home() {
  const { showModal, setShowModal } = useContext(EnterChatContext);
  const socials=[
    // {href:'/', src:'twitter-x.svg'},
    {href:API_ENDPOINTS.MY_DETAILS.LINKEDIN, src:'linkedin.svg', extra:true},
    // {href:'/', src:'insta.svg'},
  ]
  
  return (
    <main className="overflow-x-hidden">
      <Head>
        <title>{"WebBi – Turn Spreadsheets Into Clean Visuals in Minutes"}</title>
        <meta name="description" 
          content="WebBi is a straight-to-the-point tool that helps businesses, freelancers and analysts instantly visualize data. Filter, plot and modify visuals quickly — no coding needed." />
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>
      <div className="overflow-hidden">

      <HeroSection/>

      <NextSection/>
      <CSteps/>
      <Features/>
      <LLM/>
      <Scale/>
      {/* <Footer/> */}
      </div>
    </main>

  );
}

function HeroSection(){
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);
  // const router = useRouter()
  const chartVisuals = [
    {
      id: "bar",
      sector: "E-commerce",
      header: "Top-Selling Products",
      svgPath: "barchart.svg",
      position: { x: 0, y: 0 },
      color: "#4F46E5"
    },
    // {
    //   id: "box",
    //   sector: "Finance",
    //   header: "Monthly Transactions",
    //   svgPath: "box.svg",
    //   position: { x: 1, y: 0 },
    //   color: "#16A34A"
    // },
    {
      id: "heatmap",
      sector: "Operations",
      header: "Peak Usage Hours",
      svgPath: "heatmap.svg",
      position: { x: 2, y: 0 },
      color: "#DC2626"
    },
    {
      id: "line",
      sector: "SaaS",
      header: "Users Growth",
      svgPath: "lineplot.svg",
      position: { x: 0, y: 1 },
      color: "#0284C7"
    },
    {
      id: "pie",
      sector: "Marketing",
      header: "Acquisition Share",
      svgPath: "piechart.svg",
      position: { x: 1, y: 1 },
      color: "#F59E0B"
    },
    {
      id: "radar",
      sector: "HR / Performance",
      header: "Skill Comparison",
      svgPath: "radarplot.svg",
      position: { x: 2, y: 1 },
      color: "#9333EA"
    },
    {
      id: "scatter",
      sector: "Sales",
      header: "CP vs SP",
      svgPath: "scatterplot.svg",
      position: { x: 0, y: 2 },
      color: "#0D9488"
    }
  ];
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
        className={`  hero ${isVisible?" hero-v ":"  "} bg-indigo-400/10 relative h-[80vh] w-screen flex flex-col justify-center items-center tablet:h-fit p-6 overflow-visible tablet:pt-20`}>        
        <div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden">
          <div className="absolute bottom-[-10%] left-[-10%] w-[100%] h-[40%] bg-blue-400/10 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[20%] z-3 right-[-10%] w-[40%] h-[80%] bg-indigo-400/10 blur-[120px] rounded-full"></div>
          </div>
        </div>
        <div className="w-full flex flex-col justify-center items-center z-[3]">
        <div className="z-[3] w-fit flex flex-col justify-center items-center">
          <p className="py-1 px-4 rounded-full bg-blue-100 w-fit text-primary text-xs font-bold tracking-widest uppercase mb-6 text-center">AI-POWERED BI TOOL</p>
          <div className="text-center w-[700px] tablet:w-fit">
            <p className="font-display text-6xl tablet:text-4xl  tablet:px-14 font-bold leading-[1.1] mb-6 max-w-4xl mx-auto">
                Turn Spreadsheets Into <span className="block text-primary">Clear Visuals</span>
            </p>
            <p className="text-lg tablet:px-2 tablet:text-base">WebBi is a lightweight BI tool that helps businesses, freelancers and analysts visualize data easily, without needing a technical expertise.</p>
          </div>
          <div className="flex tablet:flex-col gap-y-6 items-center mt-10 justify-center gap-x-6 z-[20] relative">
            {[
              {label:'Start for Free',svg:'arrow-back-white.svg', href:'', className:'tablet:w-full bg-primary text-white px-8 py-4 rounded-full font-bold text-lg hover:shadow-lg hover:shadow-primary/40 transition-all gap-2 group'},
              {label:'Book a Demo', svg:'calendar.svg', href:'', className:'tablet:w-full px-8 py-4 rounded-full font-bold text-lg border border-slate-200 dark:border-slate-700 hover:bg-white transition-all flex items-center justify-center gap-2'}
            ].map(({label, svg, className},ind)=>
              <Link href={'/'} key={ind} 
                className={` w-fit flex justify-between gap-x-2 items-center ${className}`}>
                <img style={ind?{}:{transform:'rotate(180deg)', order:3}} src={"/svg/"+svg} className="w-7 h-6"/>
                <p>{label}</p>
              </Link>
            )}
          </div>
        </div>
        </div>
        <div className="tablet:hidden absolute z-1 top-10 bottom-10 grid grid-cols-2 left-0 right-0 px-20 justify-between">
          {chartVisuals.map(({header:label, svgPath,id},ind)=>
            <Fragment key={ind}>
              <Box svg={svgPath} label={label} id={id} index={ind}>
                <div className="flex items-center gap-x-[10px] mb-2">
                  <div className="p-[4px] rounded-lg bg-blue-100 ">
                    <img src={'/svg/visuals/new/'+svgPath} alt="box" className="w-5 h-5 "/>
                  </div>
                  <p className="text-xs text-gray-600 ">{label}</p>
                </div>
              </Box>
            </Fragment>
          )}
        </div>
    </section>
  )
}

function Box({svg, label, id, children, index}){
  return(
    <>
      
      {id==='pie'?
      <div 
      style={{ animationDelay: `${index * 120}ms` }}
        className="floating-chart-card floating-animate rounded-lg p-3 border shadow-lg bg-white relative left-4 top-[-20px] w-44">
        {children}
        <div className="h-16 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full border-[6px] border-blue-500 border-r-blue-100 border-b-indigo-200"></div>

          </div>
      </div>:
      id==='bar'?
      <div 
      style={{ animationDelay: `${index * 120}ms` }}
        className="floating-chart-card floating-animate rounded-lg p-3 border shadow-lg bg-white left-20 top-[180px] w-52">
        {children}
        <div className="flex items-end justify-between gap-1 h-12">
          <div className="w-full bg-blue-400/40 h-[40%] rounded-sm"></div>
          <div className="w-full bg-blue-500/60 h-[70%] rounded-sm"></div>
          <div className="w-full bg-blue-600 h-[100%] rounded-sm"></div>
          <div className="w-full bg-indigo-400 h-[60%] rounded-sm"></div>
          <div className="w-full bg-blue-200 h-[30%] rounded-sm"></div>
        </div>
      </div>:
      id==='scatter'?
      <div 
      style={{ animationDelay: `${index * 120}ms` }}
      className="floating-chart-card floating-animate rounded-lg p-3 border shadow-lg bg-white left-8 bottom-[-19%] w-48">
        {children}
        <div className="h-16 relative">
          <div className="absolute top-2 left-4 w-2 h-2 rounded-full bg-blue-500/80"></div>
          <div className="absolute top-8 left-10 w-2 h-2 rounded-full bg-indigo-500/80"></div>
          <div className="absolute top-4 left-24 w-1.5 h-1.5 rounded-full bg-blue-400/80"></div>
          <div className="absolute top-12 left-28 w-2 h-2 rounded-full bg-purple-500/80"></div>
          <div className="absolute top-6 left-36 w-1.5 h-1.5 rounded-full bg-blue-300/80"></div>
        </div>
      </div>:
      id==='radar'?
      <div 
      style={{ animationDelay: `${index * 120}ms` }}
      className="floating-chart-card floating-animate rounded-lg p-3 border shadow-lg bg-white right-8 top-[-10px] w-48">
        {children}
        <div className="h-16 flex items-center justify-center">
          <img src="/svg/visuals/new/radarplot.svg" alt="" className="h-20 w-20" />
        </div>
      </div>
      :
      id==='heatmap'?
      <div 
      style={{ animationDelay: `${index * 120}ms` }}
      className="floating-chart-card floating-animate rounded-lg p-3 border shadow-lg bg-white right-24 top-[160px] w-52">
        {children}
        <div className="grid grid-cols-5 gap-1">
          <div className="aspect-square bg-blue-100 dark:bg-blue-900/30 rounded-sm"></div>
          <div className="aspect-square bg-blue-300 dark:bg-blue-700/50 rounded-sm"></div>
          <div className="aspect-square bg-blue-500 rounded-sm"></div>
          <div className="aspect-square bg-indigo-400 rounded-sm"></div>
          <div className="aspect-square bg-blue-200 dark:bg-blue-800/50 rounded-sm"></div>
          <div className="aspect-square bg-blue-400 rounded-sm"></div>
          <div className="aspect-square bg-blue-600 rounded-sm"></div>
          <div className="aspect-square bg-purple-400 rounded-sm"></div>
          <div className="aspect-square bg-indigo-200 dark:bg-indigo-900/30 rounded-sm"></div>
          <div className="aspect-square bg-blue-500 rounded-sm"></div>
        </div>
      </div>
      :id==='line'?
      <div 
      style={{ animationDelay: `${index * 120}ms` }}
      className="floating-chart-card floating-animate rounded-lg p-3 border shadow-lg bg-white right-10 bottom-[-15%] w-56">
        {children}
        <div className="h-fit overflow-hidden">
        <img src="/svg/visuals/new/line.svg"/>
        </div>
      </div>:
      id==='box'?
      <div className="floating-chart-card floating-animate rounded-lg p-3 border shadow-lg bg-white right-48 bottom-[40%] w-44 opacity-100">
        {children}
        <img src="/svg/visuals/new/boxplot.svg" className="w-10 h-10"/>
      </div>
      :null
    }
    </>
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
      { threshold: 0.2 } 
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
    <div  
      className={` pt-20 px-20 tablet:px-5 pb-20 tablet:py-10 `}>
        <section className="x flex justify-center flex-col items-center">
          <div ref={elementRef} className={`text-center mb-20 hero ${isVisible?" hero-v ":"  "} hero `}>
            <h2 className="font-display text-4xl tablet:text-3xl font-bold mb-4">From data to insight in minutes</h2>
            <p className="text-slate-600 mx-auto">{"Stop wasting hours on manual formatting. WebBi's provided AI assistant does the heavy lifting for you."}</p>
          </div>
          <div className="u">
            <Steps/>
          </div>
          
          {/* <div className="h-full flex flex-col items-center justify-center z-10 relative tablet:px-4">
              <div className="relative w-fit h-fit mt-8">
                  <Link href='/#form' className="p1 flex justify-center gap-x-5 items-center h-full px-12 tablet:px-10 py-3 rounded-[30px]">
                      <p className="text-white font-medium">Get Started</p>
                  </Link>
              </div>
          </div> */}
      </section>
      </div>
  )
}

function Features(){
   const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.4 } 
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
  const features = [
    {
      id: "no-technical-overload",
      title: "No technical overload",
      description:
        "Built for human beings, not data professional. No complex macros required.",
      svg: "red-bolt.svg",     
      color: "red",   
    },
    {
      id: "faster-insights",
      title: "Faster insights",
      description:
        "Go from raw spreadsheet to boardroom-ready presentation in less than 2 minutes.",
      svg: "speed.svg",
      color: "green",
    },
    {
      id: "clear-visuals",
      title: "Clear visuals",
      description:
        "Beautiful, interactive charts that help you tell a compelling story with your data.",
      svg: "style.svg",
      color: "blue",
    },
  ];

  return(
    <section className={` py-24 bg-slate-50 px-20  tablet:px-4 tablet:grid-cols-1`}>
      <div ref={elementRef} className={` card-slides ${isVisible?' card-slides-ac  ':'  '} grid grid-cols-3 gap-8 tablet:grid-cols-1`}>
      {features.map(({title, description, svg, color},ind)=>  
        <div key={ind} className="  p-8 bg-white rounded-3xl border border-slate-100 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all">
          <div className={`p-2 w-fit 
              ${color==='red'?' bg-red-100 ':color==='green'?' bg-green-100 ':' bg-blue-100 '} 
              flex items-center justify-center rounded-2xl mb-6`}>
              <img src={'/svg/'+svg} className="w-7 h-7"/>
          </div>
          <div className="">
            <h3 className=" text-xl font-bold mb-3">{title}</h3>
            <p className="text-slate-600">{description}</p>
          </div>
        </div>

      )}
      </div>
    </section>
  )
}
function LLM(){
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.4 } 
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
    <section className="h-fit py-24 px-7 tablet:px-3 relative bg-slate-100">
      <div ref={elementRef} className={` grid grid-cols-5 tablet:grid-cols-1 `}>
      <div className="shadow-2xl bg-slate-800 pl-10 h-[80vh] tablet:h-fit rounded-l-[20px] tablet:py-12 tablet:rounded-bl-none tablet:rounded-t-[20px]  flex flex-col justify-center col-span-2 tablet:px-2 ">
        <span className="text-blue-400 font-bold uppercase tracking-widest text-xs mb-4">Interactive AI</span>
        <h2 className="text-white text-4xl font-bold mb-6">Chat with your data.</h2>
        <p className="text-slate-400 mb-8 text-lg w-[85%]">{"Just ask. WebBi's AI understands context and nuances in your business data."}</p>
        <div>
          <Questions/>
        </div>
      </div>

      <div className="col-span-3 shadow-2xl min-h-[300px] bg-slate-700 tablet:p-8 p-12 relative flex flex-col rounded-r-[20px] items-center justify-center tablet:py-12 tablet:rounded-tr-none tablet:rounded-b-[20px]">  
        {isVisible?<ChatBotDummy/>:null}
      </div>
      </div>
    </section>
  )
}
function ChatBotDummy(){
  const fullText ="Show me revenue growth this year";

    const [visible, setVisible] = useState(false);
    const [text, setText] = useState("");
    const [textFull, setTextFull]= useState(false)
    const [showReply, setShowReply]= useState(false)

    useEffect(() => {
    setVisible(true);
    }, []);

    useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
        setText(fullText.slice(0, i + 1));
        i++;
        if (i === fullText.length) {
          clearInterval(interval);
          setTextFull(true)
        }
    }, 35); 
    return () => clearInterval(interval);
    }, []);
    useEffect(()=>{
      if(!textFull) return
      setTimeout(() => {
        setShowReply(true)
      }, 3000);
    },[textFull])
  return(
    <div className={`flex flex-col items-end  ${
      visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
    }`}>
      <div className="mb-5 w-fit min-w-[100px] bg-primary flex px-5 py-3 rounded-2xl rounded-tr-none shadow-lg">
        <p className="text-right text-white">{text}</p>                     
      </div>
      
      <div style={text!==fullText?{visibility:'hidden'}:{}} className="flex items-start gap-x-3">
        <div className="bg-primary p-1 rounded-full tablet:p-2">
          <img src="/svg/robot.svg" alt="robot" className="w-7 h-7 tablet:h-4"/>
        </div>
        <div className={"bg-white p-5 w-full "}  style={{borderTopRightRadius:20, borderBottomRightRadius:20, borderBottomLeftRadius:20}}>
        
        {
          0?
          <div className="h-48 tablet:h-[130px] tablet:w-full">
            <p className="text-gray-500 thinking" style={{letterSpacing:'3px'}}></p>
          </div>:
          <div className={'relative'}>
            {!showReply?
            <div className={`${!showReply?' skeleton-white ':'  '} z-[2] absolute inset-0 bg-white`}>

            </div>:null}
            <div style={showReply?{}:{opacity:'0.1'}}>
            <p className="text-sm mb-4 w-[80%]">Here is your revenue growth. You saw a <span className="text-green-500 font-bold">+24%</span> increase in Q4 compared to Q3.</p>
            <div className="h-48 tablet:h-[130px] bg-slate-50 rounded-xl p-4 flex items-end justify-between gap-2">
              <div className="w-full bg-primary/20 h-[30%] rounded-t-sm"></div>
              <div className="w-full bg-primary/30 h-[45%] rounded-t-sm"></div>
              <div className="w-full bg-primary/40 h-[40%] rounded-t-sm"></div>
              <div className="w-full bg-primary/60 h-[65%] rounded-t-sm"></div>
              <div className="w-full bg-primary/80 h-[80%] rounded-t-sm"></div>
              <div className="w-full bg-primary h-full rounded-t-sm"></div>
            </div>
            </div>
          </div>
        }
        </div>
      </div>
      
    </div>
  )

}
function Scale(){
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef(null);
    
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
  const features = [
    {
      title: "Advanced Filtering",
      description:
        "Drill down into your data with multi-layer conditional filters.",
      svg: "features/filter.svg",
    },
    {
      title: "Auto Chart Selection",
      description:
        "Automatically selects the most effective chart type for your data.",
      svg: "features/custom-charts.svg",
    },
    {
      title: "Customizable Charts",
      description:
        "Perform AED operations on visuals to keep charts accurate and up to date.",
      svg: "features/auto-charts.svg",
    },
    {
      title: "Annotations & Insights",
      description:
        "Add annotations, highlights, and fine-tune colors to clearly explain what your data means.",
      svg: "features/notes.svg",
    },
    {
      title: "AI LLM Assistant",
      description:
        "Talk to a personal AI assistant that understands your data and helps you explore insights through conversation.",
      svg: "features/brain.svg",
    },
    {
      title: "Export Charts",
      description:
        "Professional high-resolution exports for reports and decks.",
      svg: "features/export.svg",
    },
  ];

  return(
    <div ref={elementRef} className={`hero ${isVisible?' hero-v ':'  '} relative bg-slate-100 py-20 tablet:py-5 tablet:px-5`}>
      
      <div className="text-center mb-16">
        <h2 className="text-4xl tablet:text-3xl font-bold mb-4">Everything you need to scale</h2>
        <p className="text-slate-600 ">Power packed features for heavy-duty analysis.</p>
      </div>

      <div className="grid grid-cols-3 justify-between px-24 gap-6 tablet:px-6 tablet:grid-cols-1" >
        {features.map(({title, description, svg}, index)=>
          <div key={index} className="p-8 rounded-3xl border border-slate-300 hover:border-primary transition-all group">
            <img src={'/svg/'+svg} alt={svg} className="w-5 h-5"/>
            <h3 className="text-lg font-bold mb-2 mt-4">{title}</h3>
            <p className="text-sm text-slate-500">{description}</p>
          </div>
        )}
      </div>
    </div>
  )
}

function Questions(){
  const questions=[
    '"What was the growth in Q3?"',
    '"Compares sales by category"',
    '"What is the top 2 selling Product?"',
    '"Find the outlier in this dataset"'
  ]
  return(
    <div className="space-y-3">
      {questions.map((x,ind)=>
        <div key={ind} 
          className="slide-up-item flex gap-x-[6px] items-center "
          style={{ animationDelay: `${ind * 0.5}s`  }}
        >
          <img src="/svg/blue-tick.svg" className="w-5 h-5" />
          <p className="text-slate-300">{x}</p>
        </div>
      )}
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
  const router= useRouter()
  const [colors_s, set_colors_s]= useState([])
  const visualizeSteps = [
    {
      step: 1,
      title: "Upload Your Data",
      description:
        "Connect your live Google Sheets, upload a CSV, or simply paste your values. WebBi ingests it all seamlessly.",
      image: "upload-step.jpg",
      component: 
      <div 
          className="slide-up-item cursor-pointer p-6 bg-slate-50 rounded-xl border-2 border-dotted border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-3"
        onClick={()=>router.push(PAGE_ROUTES.AUTH_ROUTES.LOGIN)}>
        <img
          src="/svg/file.svg"
          alt="file"
          className="w-8 h-8 animate-shake"
        />
        <p className="text-sm text-slate-500">Drop your file here</p>
      </div>
    },
    {
      step: 2,
      title: "Data Modelling",
      description:  
        "Our system identifies your columns and suggests the best mappings. Clean your data without writing a single formula.",
      image: "modelling-2.jpg",
      component: 
      <div className="gap-y-3 flex flex-col">
        {[
          { label: "Revenue", type: "Numerical" },
          { label: "Onboarding Date", type: "Date" },
          { label: "Product_ID", type: "Foreign Key", linkTo: 'Product"s Table' },
        ].map(({ label, type, linkTo }, ind) => (
          
          <div
            key={ind}
            className="slide-up-item flex gap-x-[6px] items-center justify-between text-sm border rounded-lg py-2 px-4"
            style={{ animationDelay: `${ind * 0.5}s`  }}
          >
            <p className="text-[15px]">{label}</p>

            {linkTo ? (
              <div className="gap-x-[6px] text-[13px] flex items-center">
                <p className="bg-gray-800 px-2 py-0.5 rounded text-xs text-white">
                  FK
                </p>
                <img
                  src="/svg/arrow-back2.svg"
                  alt="arrow"
                  className="w-4 h-4 rotate-180"
                />
                <p className="text-gray-400">{linkTo}</p>
              </div>
            ) : (
              <span className="bg-blue-100 text-primary px-2 py-0.5 rounded text-[13px]">
                {type}
              </span>
            )}
          </div>
        ))}
      </div>
      },
    {
      step: 3,
      title: "Generate Visuals",
      description:
        "Build visuals manually, or enable AI to automatically generate insightful, interactive charts from your data.",
      image: "plotting-3.jpg",
      component: 
        <div className=" slide-up-item p-4 bg-primary/10 border border-primary/20 rounded-xl">
          <div className="flex items-center gap-x-[8px] w-full">
            <div className="bg-primary rounded-full p-2">
              <img src="/svg/metric/twinkle.svg" alt="magic" className="w-3 h-3"/>
            </div>
            <div className="h-2 w-3/4 bg-primary/20 rounded skeleton-blue"></div>

          </div>
          <div className="grid mt-4 grid-cols-2 gap-x-4">
            {[1,2].map((x)=>
              <div key={x} className="h-16 skeleton-white rounded-lg">

              </div>
            )}
          </div>
        </div>,
    },
    {
      step: 4,
      title: "Review & Modify",
      description:
        "Easily tweak colors, change chart types and add annotations using a powerful, intuitive editor.",
      image: "fine-tune-step.jpg",
      component: 
      <div className="floating-animate-left grid grid-cols-10 relative gap-[3px] tablet:grid-cols-8 max-w-[350px] items-center">
        <div className=" w-8 h-8 rounded-xl bg-red-400"></div>
        <div  className=" w-8 h-8 rounded-xl bg-blue-400"></div>
        <div className=" w-8 h-8 rounded-xl bg-amber-400"></div>
        {colors_s.map((x,ind)=>
          <div key={ind} style={{background:x}} 
            className="w-8 h-8 rounded-xl"></div>
        )}
        <div className="relative inline-flex items-center gap-x-2">
          <label
            htmlFor="color-picker"
            className="animate-shake cursor-pointer w-8 h-8 rounded-xl border-2 border-slate-200 flex items-center justify-center hover:border-primary"
          >
            <img src="/svg/palette.svg" />
          </label>

          <input
            id="color-picker"
            type="color"
            className="absolute opacity-0 pointer-events-none"
            onChange={(e) => set_colors_s((prev) => [...prev, e.target.value])}
          />
        </div>
        
      </div>
    },
  ];
  

    return(
        <div className="pb-5 grid grid-cols-1 mt-10 px-8 tablet:px-5 justify-center gap-y-20 tablet:gap-y-10 tablet:grid-cols-1 items-start tablet:mt-10 ">
            {visualizeSteps.map((props,ind)=>
                <Fragment key={ind}>
                  <Order {...props} ind={ind}/>
                </Fragment>
                
            )}
        </div>
    )
}
function Order({step, title, description, image, component, ind}){
  const [isVisible, setIsVisible] = useState(false);
  const [isVisibleComp, setIsVisibleComp] = useState(false);

  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {

        if (entry.isIntersecting) {
          setIsVisible(true);
        }
        // reset when scrolling out
        // else {
        //   setIsVisible(false);
        // }
      },
      { 
        threshold: 0.2,
        rootMargin: '0px 0px -100px 0px'
      } 
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

  useEffect(()=>{
    if(!isVisible) return setIsVisibleComp(false)
    setTimeout(() => {
      return setIsVisibleComp(true)
    }, 1000);
  },[isVisible])
// const isVisibleComp= useMemo(()=>{
//   if(!isVisible) return false
//   setTimeout(() => {
//     return true
//   }, 500);
// },[isVisible])

  return(
    <div 
      ref={elementRef}
      className={`flex tablet:flex-col tablet:gap-y-2 gap-x-14 items-center 
        transition-all duration-700 ease-out
        ${isVisible 
          ? 'opacity-100 translate-y-0 step-card' 
          : 'opacity-0 translate-y-16'
        }`}
    >
      <div className="w-[800px] tablet:w-full" style={ind%2 ? {order:3} : {}}>
        <div 
          className={`flex items-center gap-x-2 transition-all duration-500 delay-100
            ${isVisible 
              ? 'opacity-100 translate-x-0 step-number' 
              : 'opacity-0 -translate-x-8'
            }`}
        >
          <p className="bg-primary w-10 h-10 rounded-full text-white flex justify-center items-center text-center text-sm">
            {step}
          </p>
          <h3 className="text-2xl font-bold">{title}</h3>
        </div>
        
        <div 
          className={`transition-all duration-500 delay-200
            ${isVisible 
              ? 'opacity-100 translate-y-0 step-content' 
              : 'opacity-0 translate-y-8'
            }`}
        >
          <div className="text-slate-600 mt-3">
            <p>{description}</p>
          </div>
          {isVisibleComp?
          <div className="mt-4 " style={{}}>
            {component}
          </div>:
          <div className="h-[200px]" style={ind===3?{height:'50px'}:{}}>

          </div>
          }
        </div>
      </div>
      
      <ImageContainer 
        className={`h-64 w-full tablet:order-[4] transition-all duration-700 delay-300
          ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}
        imgClass={'rounded-2xl object-cover object-center'}
        src={'/images/steps/'+image}
      />
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
          id="samples"
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

function NextSection(){
  return(
    <div className=" bg-indigo-400/10 h-fit w-screen mt-[120px] tablet:mt-0 relative pb-20 pt-20 tablet:px-5 tablet:py-24 px-10">
      <div className="flex justify-center absolute top-[-15%] left-0 right-0 tablet:hidden">
        <div className="rounded-full w-[200px] h-[200px] bg-white">
          
        </div>
      </div>
      <div className="w-full px-20 tablet:px-3">
        <div
          className="flex justify-center w-full"
          style={{
            transform: "none",
          }}
        >
          <video
            src="/gif/webbi-promo.mp4"
            loop
            preload="auto"
            // poster="https://framerusercontent.com/images/Wi55f4nQkOCpflNW1C4KjyJZsco.png?width=1683&height=947"
            muted
            playsInline
            autoPlay
            style={{
              cursor: "auto",
              width: "100%",
              height: "100%",
              borderRadius: "8px",
              display: "block",
              objectFit: "cover",
              backgroundColor: "rgba(0, 0, 0, 0)",
              objectPosition: "50% 50%",
            }}
          />
        </div>
      </div>
      <Partnership/>
    </div>
  )
}



function Partnership(){
  const partners = [
    "SMARTHUB ACADEMY",
    "DATACUBE",
    "VOID.IO",
    "STRATA",
    "Z-CORP",
    "AURORA",
  ];
  return(
    
    <div className="mt-[80px] tablet:mt-14 tablet px-5">
        <p className="text-center  text-sm font-semibold text-slate-500 mb-10 uppercase tracking-widest">Trusted by freelancers, analysts and startups</p>
         <div className="relative w-full overflow-hidden">
        <div className="flex w-max animate-marquee gap-x-10  -translate-x-1/2 justify-between">
        
          {partners.map((item, index) => (
            <span
              key={`first-${index}`}
              className="text-2xl font-black font-display tracking-tight whitespace-nowrap"
            >
              {item}
            </span>
          ))}

          {partners.map((item, index) => (
            <span
              key={`second-${index}`}
              className="text-2xl font-black font-display tracking-tight whitespace-nowrap"
            >
              {item}
            </span>
          ))}
          {partners.map((item, index) => (
            <span
              key={`third-${index}`}
              className="text-2xl font-black font-display tracking-tight whitespace-nowrap"
            >
              {item}
            </span>
          ))}
         
        </div>
        </div>
      </div>
  )
}



// import { EnterChatModal, ModalLayout } from "@/components/modal";
// import { API_ENDPOINTS, consolelog } from "@/configs";
// import { EnterChatContext } from "@/context";
// import { useHttpServices } from "@/hooks";
// import { useQuery } from "@tanstack/react-query";
// import Head from "next/head";
// import { useContext, Fragment, useEffect, useState, useRef } from "react";
// import Link from "next/link";
// // import sampleData from "@/data/extracted_responses.json";
// import { AutoSlider, DataFetch, iconSvgPath, ImageContainer, VaisualizeForm, VisualCard } from "@/components";
// // import Image from "next/image";


// export default function Home() {
//   const { showModal, setShowModal } = useContext(EnterChatContext);
//   const socials=[
//     // {href:'/', src:'twitter-x.svg'},
//     {href:API_ENDPOINTS.MY_DETAILS.LINKEDIN, src:'linkedin.svg', extra:true},
//     // {href:'/', src:'insta.svg'},
//   ]
  
//   return (
//     <main className="overflow-x-hidden pb-10">
//       <Head>
//         <title>{"WebBi – Turn Spreadsheets Into Clean Visuals in Minutes"}</title>
//         <meta name="description" 
//           content="WebBi is a straight-to-the-point tool that helps businesses, freelancers and analysts instantly visualize data. Filter, plot and modify visuals quickly — no coding needed." />
//         {/* <link rel="icon" href="/favicon.ico" /> */}
//       </Head>
//       <>
//         {/* <h1 className={"text-black text-5xl "}>v<span className="text-purple-700">AI</span>sualize</h1> */}
//       {/* <div className="justify-center flex py-3">

//       </div> */}
//       <HeroSection/>
//       </>
//     </main>

//   );
// }

// function HeroSection(){
//   const [isVisible, setIsVisible] = useState(false);
//   const elementRef = useRef(null);
//   // const router = useRouter()

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         if (entry.isIntersecting) {
//           setIsVisible(true);
//         }
//       },
//       { threshold: 0.3 } 
//     );

//     if (elementRef.current) {
//       observer.observe(elementRef.current);
//     }

//     return () => {
//       if (elementRef.current) {
//         observer.unobserve(elementRef.current);
//       }
//     };
//   }, []);
//   return(
//     <section
//         ref={elementRef}
//         className={` bg-opacity-[10%] hero ${isVisible?" hero-v ":"  "} relative h-fit w-screen tablet:h-fit p-6`}>
//         <div className="h-full flex flex-col items-center justify-center z-10 relative">
//             <div className="div items-center gap-x-2 flex py-1.5 px-6 rounded-[30px] mt-6 bg-white">
//                 <img className="w-5 h-5" src="/svg/magic.svg"/>
//                 <p className="font-semibold text-[15px]">Powered by <span className="gradient-text">AI</span></p>
//               </div>
//             {/* <p className="text-[60px] font-semibold">v<span className="gradient-text">AI</span>sualize</p> */}
//             <h1 className="text-[60px] tablet:text-[40px] font-semibold">WebBi</h1>
//             <div className="text-center u flex flex-col items-center">
//             <p className=" text-[40px] font-medium text-[#5345E6] tablet:text-[20px] tablet:text-center">Turn Spreadsheets Into Clear Visuals.</p>
//             <p className="tablet:text-center ">WebBi is a straight-to-the-point tool that helps businesses, freelancers and analysts visualize data fast, with no tech skills needed.</p>
//             <p className="mb-2 tablet:text-center tablet:mt-3">Filter, plot and modify visuals quickly — no coding needed.</p>
//             <div className="relative w-fit h-fit mt-8 flex gap-x-4 gap-y-5 tablet:flex-col tablet:justify-center">
//                 <Link href={'/#samples'} className="herobtn3 border-dashed bg-white border-2 border-black flex justify-center gap-x-5 items-center h-full px-10 py-3 rounded-[30px]">
//                     {/* <img style={{filter:'brightness(0) invert(1)'}} src="/svg/upload.svg" alt="upload" /> */}
//                     <p className=" font-medium">Explore Samples</p>
//                 </Link>

//                 <Link href={'/#form'} className="herobtn flex justify-center gap-x-3 items-center h-full px-10 py-3 rounded-[30px]">
//                     <img style={{filter:'brightness(0) invert(1)'}} src="/svg/upload.svg" alt="upload" />
//                     <p className="text-white font-medium">{'Analyze Now (Free)'}</p>
//                 </Link>
//             </div>
//             <div className="mt-10 flex flex-col gap-6 tablet:gap-4 tablet:w-full">
//                 <div className="shadow-xl rounded-xl"
//                   style={{
//                     borderColor:'rgba(56, 56, 56, 0.12)',
//                     borderWidth:'1.5px'
//                 }}
//                 >
//                   <ImageContainer 
//                     src={'/images/snapshot/card_visuals.png'} 
//                     className={'w-[1000px] h-[400px] tablet:w-full rounded-xl tablet:h-[300px]'} 
//                     imgClass={' object-top object-cover object-left tablet:object-left'}
//                   />            
//                 </div>
//               {[4].map((x,ind)=>
//                 <div key={ind} className="shadow-xl rounded-xl"
//                   style={{
//                     borderColor:'rgba(56, 56, 56, 0.12)',
//                     borderWidth:'1.5px'
//                 }}
//                 >
//                   <ImageContainer src={'/images/snapshot/card_visuals_'+x+'.png'} 
//                     imgClass={' object-top object-cover object-left tablet:object-left'}                  
//                   className={'w-[1000px] h-[400px] tablet:w-full rounded-xl tablet:h-[350px]'}/>            
//                 </div>
//               )}

//             </div>
//             </div>
//         </div>
//         <div className="herobg absolute h-full border border-black inset-0 z-[-2] pointer-events-none">
//         </div>
        


//     </section>
//   )
// }

// function CSteps(){
//   const [isVisible, setIsVisible] = useState(false);
//   const elementRef = useRef(null);
//   // const router = useRouter()

//   useEffect(() => {
//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         if (entry.isIntersecting) {
//           setIsVisible(true);
//         }
//       },
//       { threshold: 0.3 } 
//     );

//     if (elementRef.current) {
//       observer.observe(elementRef.current);
//     }

//     return () => {
//       if (elementRef.current) {
//         observer.unobserve(elementRef.current);
//       }
//     };
//   }, []);
//   return(
//     <div ref={elementRef} 
//       className={` bg-opacity-[10%] hero ${isVisible?" hero-v ":"  "} bg-white hero pt-20 tablet:px-4 pb-20 tablet:py-10 `}>
//         <section className="x flex justify-center flex-col items-center">
//           <div className="text-center">
//               <p className="text-[35px] font-semibold tablet:text-lg">How <span>WebBi</span> works</p>
//               <p className="text-[#5D5C5C]">{"(Just)4 simple steps to unlock your business potential"}</p>
//           </div>
//           <div className="u">
//             <Steps/>
//           </div>
          
//           <div className="h-full flex flex-col items-center justify-center z-10 relative tablet:px-4">
//               <div className="relative w-fit h-fit mt-8">
//                   <Link href='/#form' className="p1 flex justify-center gap-x-5 items-center h-full px-12 tablet:px-10 py-3 rounded-[30px]">
//                       {/* <img style={{filter:'brightness(0) invert(1)'}} src="/svg/upload.svg" alt="upload" /> */}
//                       <p className="text-white font-medium">Get Started</p>
//                   </Link>
//               </div>
//           </div>
//       </section>
//       </div>
//   )
// }

// function ChartIcons({chart_icons}){
//   const [count, setCount]= useState({})
//   const [setIcons, setSetIcons]= useState([])
//   useEffect(()=>{
//     const no_dupl_icons=chart_icons.filter(({plot_type})=>
//       !plot_type.includes(',')
//     ).filter((v,i,a)=>
//       a.findIndex(t=>(t.plot_type === v.plot_type))===i
//     )
//     consolelog({no_dupl_icons})
//     setSetIcons(no_dupl_icons)

//     setCount({
//       fullCount:no_dupl_icons.length,
//       errorCount:0,
//       showCount:5
//     })
//   },[])
//   return(
//     <div className="flex items-end space-x-2">
//       <div className="flex gap-x-3 items-end">
//       {setIcons?.map(({plot_type},ind)=>
//         <Fragment key={ind}>
//           <ChartIcon src={
//             plot_type?.toLowerCase()?.replace(' ','')
//           } minusCount={()=>setCount({...count, errorCount:count.errorCount+1})}/>
//         </Fragment>
//       )}
//       </div>
//       <p className="text-xs text-purple-500">{'+'+(count.fullCount-(count.showCount-count.errorCount))+'chart(s)'}</p>
//     </div>
//   )
// }

// function ChartIcon({src, minusCount}){
//   const [visible, setVisible] = useState(true);
//   if (!visible || !src) return null; 

//   return (
//     <img
//       src={iconSvgPath('visuals/'+src.split(',')[0])}
//       className={'w-6 h-6'}
//       onError={() => {
//         minusCount()
//         setVisible(false)
//       }} 
//     />
//   );
// }

// function Steps(){
//     const vaisualizeSteps = [
//     {
//         title: "Upload Your Data",
//         description: "Start by uploading your dataset to the platform. Make sure your file is in a supported format so our AI can read it easily.",
//         image: "upload.svg" 
//     },
//     {
//         title: "Column Setup",
//         description: "Arrange your columns according to their specific data types. Highlight or remove columns that are unnecessary to ensure accurate visualization.",
//         image: "gear.svg" 
//     },
//     {
//         title: "Generate AI Visuals",
//         description: "Sit back and wait as our AI automatically processes your data and transforms it into insightful, interactive visuals.",
//         image: "magic.svg" 
//     },{
//         title: "Review & Modify", 
//         description: "Review your visuals and make adjustments instantly. Modify chart styles, update values and apply filters as needed.",
//         image: "gear.svg"
//     }
//     ];
//     return(
//         <div className="pb-5 grid grid-cols-2 mt-20 px-10 tablet:px-5 justify-center gap-10 tablet:grid-cols-1 items-start tablet:mt-10">
//             {vaisualizeSteps.map(({title, description, image},ind)=>
//                 <div key={ind} className="step-card flex flex-col items-center">
//                     <div className="card bg-[#E34AA5] p-3 rounded-md p-[24px] mb-3 rounded-lg w-fit">
//                         <img src={'/svg/steps/'+image} alt={image} className="w-6 h-6"/>
//                     </div>
//                     <div className="text-center w-[350px] tablet:w-full">
//                         <p className="font-semibold text-xl">STEP {ind+1}</p>
//                         <p className={`font-semibold text-lg gradient-p ${ind===0?' p1 ':ind===1?' p2 ':ind===2?' p3 ':' p1 '}`}>{title}</p>
//                         <p className="text-[#5D5C5C] mt-4 text-[15px]">{description}</p>
//                     </div>

//                 </div>
//             )}
//         </div>
//     )
// }

// function RecentWorks(){
//     const {getData}= useHttpServices()
//     const getAllCharts=async()=>{    
//         return await getData({path:API_ENDPOINTS.GET_ALL_PUBLIC_REQUESTS})
//     }
    
//     const {isLoading:reqLoading, data:req_data, error, isError:isReqError}= useQuery(
//         {
//         queryKey:['all-public-request'],
//         queryFn:()=>getAllCharts(),
//         refetchOnWindowFocus: false,
//         retry:false, enabled:true
//         }
//     )
//     const [activeIndex, setActiveIndex] = useState(0);
//     const content = ["1","5", "4", "2"]

//     const [isVisible, setIsVisible] = useState(false);
//     const elementRef = useRef(null);
//     // const router = useRouter()

//     useEffect(() => {
//         const observer = new IntersectionObserver(
//         ([entry]) => {
//             if (entry.isIntersecting) {
//             setIsVisible(true);
//             }
//         },
//         { threshold: 0.3 } 
//         );

//         if (elementRef.current) {
//         observer.observe(elementRef.current);
//         }

//         return () => {
//         if (elementRef.current) {
//             observer.unobserve(elementRef.current);
//         }
//         };
//     }, []);

    
//     useEffect(() => {
//         const interval = setInterval(() => {
//         setActiveIndex(prevIndex => (prevIndex + 1) % content.length);
//         }, 5000);

//         return () => clearInterval(interval);
//     }, [content.length]);

//     return(
//         <section 
//           id="samples"
//           className={` bg-[#EEF4FA] mt-20 py-14 px-20 tablet:px-5`}>
//             <div className="text-center x">
//                 <h2 className="text-3xl mb-[6px] font-semibold text-[#5345E6]">Recent Analysis</h2>
//                 <p className="text-[#5D5C5C] text-sm">Showing what others are discovering with WebBi</p>
//             </div>
//             <DataFetch
//               isLoading={reqLoading}
//               isError={isReqError}
//               errorMsg={error?.message}
//             >
//               <div className="x">
//                 <VisualCard cards={req_data?.requests}/>
//               </div>
//             </DataFetch>

//         </section>
//     )
// }



