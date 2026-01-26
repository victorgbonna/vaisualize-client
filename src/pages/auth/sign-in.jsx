import { ImageContainer, InputHelper, LoadButton } from "@/components";
import { API_ENDPOINTS, appLinkConverter, consolelog, PAGE_ROUTES } from "@/configs";
import Image from "next/image";
import Link from "next/link";
import { getProviders, signIn } from "next-auth/react";
import { useRef, useState, useEffect, Fragment } from "react";
import { useRouter } from "next/router";
import { useToast, useValidations } from "@/hooks";
import { useMutation } from "@tanstack/react-query";
import { setCookie } from "cookies-next";


export default function Signin({ providers }){

const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef(null);
  // const router = useRouter()
  const [formData, setFormData]= useState({})
  const {NotifyError, NotifySuccess}= useToast()
const inputFields = [
  {
    label: "Email",
    value: "email",
    type: "email",
    placeholder: "name@company.com",
    extraText: ""
  },
  
  {
    label: "Password",
    value: "password",
    type: "password",
    placeholder: "********",
    // extraText: "Minimum 8 characters with at least one number."
  }
];
const {isEmail}= useValidations()
const router= useRouter()
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
  console.log(router.query.r)
  if(!router.isReady) return
  const {error}= router.query
  if(error){
    NotifyError(error)
  }
  return
},[router.isReady])
 
const logFuncQuery=async()=>{
  
  const res= await signIn("credentials", {
    email:formData.email,
    password:formData.password,
    redirect: false,
  });
  if(res.error){
    consolelog({res:res.error})
    throw Error(res.error);
  }
  
}
  const {mutate:logFunc, isPending:logLoading}=useMutation({
    mutationFn: ()=>logFuncQuery(),
    onError:(error)=>{
      return NotifyError(error.message || 'Could not get data')
    },
    onSuccess:()=>{
      setFormData({})
      NotifySuccess('Logged in Successfully.')
      window.location.href= router.query?.r ?? PAGE_ROUTES.DASHBOARD
      return
    }})
  
  
  
  return(
    <main
        ref={elementRef}
        className={`  hero ${isVisible?" hero-v ":"  "} bg-indigo-400/10 relative  flex flex-col justify-center items-center tablet:h-fit`}>        
       
        <div className=" flex items-center w-full">
            <div className="w-[800px] px-5 tablet:w-full overflow-y-auto h-screen pt-0 flex flex-col justify-center items-center z-[3] tablet:pt-0">
                <div className="z-[3] w-full flex py-10  flex-col justify-center p-4 py-0">
                   <Link href={PAGE_ROUTES.HOME} className="flex gap-x-2 items-center mb-3">
                        <img src={'/images/webbi.png'} className={'w-10 h-10'}/>
                        <p className="text-2xl font-semibold">WebBi</p>
                        {/* <p>The future of data visualization</p> */}
                    </Link>
                    <div className="text-left mb-8">
                        <h1 className="text-2xl mb-2 font-semibold">Welcome Back</h1>
                    </div>
                    <div className="w-full">
                        {Object.values(providers).filter(({name})=>name!=='Credentials').map((provider) => (
                          <button
                            key={provider.name}
                            onClick={async() => {

                              signIn(provider.id, {
                                callbackUrl: appLinkConverter(PAGE_ROUTES.DASHBOARD), 
                                state: JSON.stringify({
                                  userType: "admin",
                                  intent: "sign-up",
                                })
                              }
                            )}}
                            className="border border-gray-300 flex items-center justify-center w-full flex items-center gap-x-3 rounded-2xl bg-white mb-5 py-3"
                          >
                            <img src="/svg/socials/google.svg" alt="socials" className="w-5 h-5"/>
                            <p>Continue with {provider.name}</p>
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
                    
                    <div className="w-full grid grid-cols-1 gap-5">

                        {inputFields.map((props,ind)=>
                            <Fragment key={ind}>
                                <InputHelper {...props} showLabel={true} 
                                    value={formData[props.value]}
                                    onChange={(e)=>setFormData({...formData, [props.value]:e.target.value})}
                                />
                            </Fragment>
                        )}
                    </div>
                    <div className="w-full mt-5">
            
                        <LoadButton disabled={!isEmail(formData.email) || !formData.password}
                          onClick={()=>logFunc()} 
                          isLoading={logLoading}
                          className="bg-primary text-lg px-8 py-2.5 w-full text-white rounded-2xl my-4">
                          Log In
                        </LoadButton>
                        <p className="text-center">{"Don't have an account? "} <Link href={PAGE_ROUTES.AUTH_ROUTES.REGISTER} className="text-primary">Register</Link></p>
                    </div>
                </div>
            </div>
            <div className="bg-gray-50 h-screen tablet:hidden w-full pt-[100px] pl-[200px] overflow-y-hidden">
                <div className="mb-10">
                    <h2 className="text-3xl mb-2">Log into the lightweight BI tool for visual analysis</h2>
                    <p className="text-gray-600 text-lg">Join 10,000 teams turning data into visuals.</p>
                </div>
                <ImageContainer src={'/images/webbi-cover.png'} 
                    imgClass={'object-cover object-left'} className={'w-full h-full'}/>
            </div>
        </div>
        
        
    </main>
  )
}


export async function getServerSideProps(req) {
  const providers = await getProviders();
  return { props: { providers } };
}