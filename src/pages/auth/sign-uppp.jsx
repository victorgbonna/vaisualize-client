import { ImageContainer, InputHelper, LoadButton } from "@/components";
import { API_ENDPOINTS, appLinkConverter, consolelog, PAGE_ROUTES } from "@/configs";
import Image from "next/image";
import Link from "next/link";
import { useRef, useState, useEffect, Fragment } from "react";
import { getProviders, signIn } from "next-auth/react";
import { useRouter } from "next/router";
import { useMutation } from "@tanstack/react-query";
import { useHttpServices, useToast, useValidations } from "@/hooks";
import { setCookie } from "cookies-next";


export default function Signup({providers}){

const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);
  const [agreeTo, setAgreeTo]= useState(false)
  const router = useRouter()
  const {NotifyError, NotifySuccess}= useToast()
  const {postData}= useHttpServices()
  const {isEmail}= useValidations()
  const [formData, setFormData]= useState({})
  const inputFields = [
    {
      label: "First Name",
      value: "firstName",
      type: "text",
      placeholder: "John Doe",
      extraText: ""
    },
    {
      label: "Last Name",
      value: "lastName",
      type: "text",
      placeholder: "John Doe",
      extraText: ""
    },
    {
      label: "Email",
      value: "email",
      type: "email",
      placeholder: "name@company.com",
      extraText: ""
    },
    {
      label: "Phone Number",
      value: "phone",
      type: "phone",
      placeholder: "+234 82728922",
      extraText: ""
    },
    {
      label: "Password",
      value: "password",
      type: "password",
      placeholder: "********",
      extraText: "Minimum 8 characters with at least one number."
    },
    {
      label: "Confirm Password",
      value: "confirm_password",
      type: "password",
      placeholder: "********",
      // extraText: "Minimum 8 characters with at least one number."
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
 
  useEffect(()=>{
    if(!router.isReady) return
    const {error}= router.query
    if(error){
      NotifyError(error)
    }
    return
  },[router.isReady])

// onClick={() => signIn(provider.id, { callbackUrl:appLinkConverter(PAGE_ROUTES.DASHBOARD), state: JSON.stringify({ action: "sign-up" }) })}
// "credentials", {
//       email,
//       password,
//       redirect: false, // 👈 CRITICAL
//     }
const regFuncQuery=async()=>{
  return await postData({
    path:API_ENDPOINTS.AUTH_ROUTES.NORMAL_SIGNUP, 
    body:{...formData, medium:'normal'}
  })
}
  const {mutate:regFunc, isPending:regLoading}=useMutation({
    mutationFn: ()=>regFuncQuery(),
    onError:({error})=>{
      return NotifyError(error.message || 'Could not get data')
    },
    onSuccess:()=>{
      setFormData({})
      return NotifySuccess('You have registered. Check your email for activation link.')
    }})
  return(
    <main
        ref={elementRef}
        className={`  hero ${isVisible?" hero-v ":"  "} bg-indigo-400/10 relative  flex flex-col justify-center items-center tablet:h-fit`}>        
       
        <div className=" flex items-center w-full tablet:flex-col">
            <div className="w-[800px] px-5 tablet:w-full overflow-y-scroll register-scroll  h-screen pt-20 flex flex-col justify-center items-center z-[3] tablet:h-fit tablet:pt-5">
                <div className="z-[3] w-full flex py-10  flex-col justify-center p-4 mt-10 tablet:mt-0 tablet:py-8">
                    <Link href={PAGE_ROUTES.HOME} className="flex gap-x-2 items-center mb-3">
                        <img src={'/images/webbi.png'} className={'w-10 h-10'}/>
                        <p className="text-2xl font-semibold">WebBi</p>
                        {/* <p>The future of data visualization</p> */}
                    </Link>
                    <div className="text-left mb-8">
                        <h1 className="text-2xl mb-2 font-semibold">Signup for free</h1>
                    </div>
                    <div className="w-full">
                      {Object.values(providers).filter(({name})=>name!=='Credentials').map((provider) => (
                          <button
                            key={provider.name}
                            onClick={() => {
                              setCookie("oauth_intent", "sign-up", {
                                maxAge: 600
                              }); 
                              signIn(provider.id, {callbackUrl: appLinkConverter(PAGE_ROUTES.DASHBOARD)})
                            }}
                            className="border border-gray-300 flex items-center justify-center w-full flex items-center gap-x-3 rounded-2xl bg-white mb-5 py-3"
                          >
                            <img src="/svg/socials/google.svg" alt="socials" className="w-5 h-5"/>
                            <p>Signup with {provider.name}</p>
                          </button>
                        ))}
                        
                        <div className="relative mb-6 w-full flex justify-center">
                            <div className=" absolute left-0 right-0 mt-2.5">
                                <div className="w-full border-t border-slate-600 h-2"></div>
                            </div>
                            <div className="relative flex z-[2] justify-center text-sm ">
                                <span className="px-4 bg-background-light text-slate-500 uppercase tracking-widest text-[10px] font-bold">Or continue with email</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="w-full grid grid-cols-2 gap-5 tablet:grid-cols-1">

                        {inputFields.map((props,ind)=>
                            <Fragment key={ind}>
                                <InputHelper {...props} showLabel={true} 
                                    value={formData[props.value]}
                                    onChange={(e)=>setFormData({...formData, [props.value]:e.target.value})}
                                />
                            </Fragment>
                        )}
                    </div>
                    <div className="w-full">
                        <div className="flex items-center gap-x-2 mt-4 w-full">
                            <input type="radio" className="w-6 h-6" checked={agreeTo} onChange={()=>setAgreeTo(!agreeTo)}/>
                            <p className="text-gray-600 text-sm">I agree to the <Link href={'/'} className="text-primary">Terms of Service</Link> and <Link className="text-primary" href={'/'}>Privacy Policy</Link></p>
                        </div>
                        <LoadButton 
                          isLoading={regLoading}
                          onClick={()=>regFunc()}
                          disabled={
                            !agreeTo || !isEmail(formData.email) 
                            || !formData.password || !formData.firstName 
                            || !formData.lastName || !formData.phone  
                          }
                          className="mt-4 bg-primary text-lg px-8 py-2.5 w-full text-white rounded-2xl my-4">
                            Create Account
                        </LoadButton>
                        <p className="text-center">Already have an account? <Link href={PAGE_ROUTES.AUTH_ROUTES.LOGIN} className="text-primary">Log in</Link></p>
                    </div>
                </div>
            </div>
            <div className=" tablet:hidden bg-gray-50 h-screen w-full pt-[100px] pl-[200px] overflow-y-hidden">
                <div className="mb-10">
                    <h2 className="text-3xl mb-2">Get into the lightweight BI tool for visual analysis</h2>
                    <p className="text-gray-600 text-lg">Join 10,000 teams turning data into visuals.</p>
                </div>
                <ImageContainer src={'/images/webbi-cover.png'} 
                    imgClass={'object-cover object-left'} className={'w-full h-full'}/>
            </div>
        </div>
        
        
    </main>
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
export async function getServerSideProps() {
  const providers = await getProviders();
  return { props: { providers } };
}