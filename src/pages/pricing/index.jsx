import { ContactTemplate, FaqHelper } from "@/components";
import { commafy, PAGE_ROUTES } from "@/configs";
import Link from "next/link";
import { Fragment, useMemo, useState } from "react";

export default function Pricing(){
const pricingPlans = [
  {
    name: "WebBi Spark",
    price: 0,
    currency: "NGN",
    interval: "month",
    Monthly:0,
    Yearly:0,
    description: "Best for getting started and exploring your data.",
    features: [
      { label: "Up to 3 datasets per project", disabled: false },
      { label: "10 DataAI credits", disabled: false },
      { label: "AI-assisted visual generation", disabled: false },
      { label: "Watermark-free exports", disabled: true},
      { label: "Priority support", disabled: true }
    ],
    cta: "Start for free",
    popular: false,
    type: "free"
  },
  {
    name: "WebBi Flow",
    price: 5000,
    currency: "NGN",
    interval: "month",
    Monthly:5000,
    Yearly: 50000,
    description: "For professionals who need faster insights and clean exports.",
    features: [
      { label: "Unlimited datasets per project", disabled: false },
      { label: "30+ DataAI credits", disabled: false },
      { label: "Advanced AI visual generation", disabled: false },
      { label: "Watermark-free exports", disabled: true },
      { label: "Priority support", disabled: false }
    ],
    cta: "Upgrade to Flow",
    popular: true,
    type: "paid"
  },
  {
    name: "WebBi Scale",
    price: 8000,
    currency: "NGN",
    interval: "month",
    Monthly:8000,
    Yearly: 80000,
    description: "For growing teams that rely heavily on AI-driven insights.",
    features: [
      { label: "Unlimited datasets per project", disabled: false },
      { label: "50 DataAI credits", disabled: false },
      { label: "Advanced AI visual generation", disabled: false },
      { label: "Watermark-free exports", disabled: false },
      { label: "Priority support", disabled: false }
    ],
    cta: "Upgrade to Scale",
    popular: false,
    type: "paid"
  },
  {
    name: "WebBi Enterprise",
    price: null,
    currency: "NGN",
    interval: "custom",
    description: "Custom plans for organizations with advanced security and AI needs.",
    features: [
      { label: "Unlimited datasets", disabled: false },
      { label: "Unlimited DataAI credits", disabled: false },
      { label: "Dedicated infrastructure", disabled: false },
      { label: "Custom integrations", disabled: false },
      { label: "Enterprise-grade support", disabled: false }
    ],
    cta: "Contact Sales",
    popular: false,
    type: "enterprise"
  }
];

const pricingFaqs = [
  {
    question: "Is there a free trial for the Pro plan?",
    answer: (
      <p className="text-slate-600 ">
        Yes. You can start on the free plan to explore WebBi and upgrade to a paid
        plan anytime when you need more datasets, AI credits, or watermark-free exports.
      </p>
    )
  },
  {
    question: "How secure is my data?",
    answer: (
      <p className="text-slate-600 ">
        Your data is securely handled and isolated per project. WebBi follows best
        practices for data protection and access control to ensure your information
        remains private and safe.
      </p>
    )
  },
  {
    question: "Can I cancel my subscription anytime?",
    answer: (
      <p className="text-slate-600 ">
        {"Yes. WebBi subscriptions are billed monthly and you can cancel anytime. You’ll continue to have access until the end of your billing period."}
      </p>
    )
  }
];


    const [subPlan, setSubPlan]= useState('Monthly')
    const [currentPlan, setCurrentPlan]= useState('')
    return(
        <main className="w-full  py-20 flex-col items-center">
            <div className="text-center flex flex-col items-center mb-10  px-[300px] tablet:px-5">
                <h2 className="text-5xl tablet:text-3xl font-bold mb-4">Simple, <span className="text-primary">Transparent</span> Pricing</h2>
                <p className="text-slate-600 ">
                    {`Choose the plan that's right for your data needs.`}<br />{`Unlock the power of lightweight BI with a tool built for modern teams.`}
                </p>
            </div>
            <div className="flex justify-center mb-5">

                <div className="w-fit flex justify-center p-[3px] bg-slate-50 rounded-full ">
                {['Monthly', 'Yearly'].map((plan,ind)=>
                    <Fragment key={ind}>
                        <div 
                            style={subPlan===plan?{background:'#FFFFFF', color:'#607AFB'}:{}} 
                            className="cursor-pointer relative w-fit relative rounded-full py-3 px-10 text-center text-gray-800">
                            <p>{plan}</p>
                            {ind?
                                <span className="absolute -top-3 -right-4 rounded-full bg-emerald-400 px-2 py-0.5 text-[10px] font-semibold text-white uppercase tracking-wider">Save 20%</span>
                                :null}
                        </div>

                    </Fragment>
                )}
                </div>
                
            </div>
            <div className="flex justify-center mb-14">
                <p className="text-slate-700">
                  N.B - While we are giving temporary free access to all features, <strong>pricing becomes effective from <span className="font-medium text-slate-700">July 2026</span></strong>.
                </p>
              </div>
            <div className="grid grid-cols-4 tablet:gap-y-20 gap-4 justify-center tablet:grid-cols-1 px-[80px] mb-[100px] tablet:mb-20 items-center tablet:px-5">
                {pricingPlans.map(({name, price, currency, interval, description, features, type,cta, popular,...rest},ind)=>
                    <div key={ind} onClick={()=>setCurrentPlan(name)} className="relative py-8 px-7 rounded-2xl border bg-gray-50  shadow-lg">
                        {popular?
                        <div className="absolute left-0 right-0 top-[-18px] text-sm flex justify-center">
                            <div className="bg-primary  px-5 py-2 rounded-full text-white">   
                                MOST POPULAR
                            </div>
                        </div>:null}
                        <div className="mb-4 w-fit">
                            <p className="text-lg mb-2">{name}</p>

                            {type==='enterprise'?
                                <p className="text-4xl font-semibold mb-2">CUSTOM</p>
                                :
                                <p className="text-4xl font-semibold mb-2">{'₦'+commafy(rest[subPlan])}<span className="text-gray-600 text-xs">/mo</span></p>}
                        </div>
                        <p className="text-gray-600 h-32 tablet:min-h-32">{description}</p>
                        <div className="mb-7  space-y-2">
                            {features.map(({disabled,label},ind)=>
                                <div key={ind} className="flex gap-x-2 items-center">
                                    <img className="w-5 h-5" src={disabled?'/svg/disabled.svg':'/svg/blue-tick.svg'}/>
                                    <p className={`${disabled?'  text-gray-400 ':' text-gray-800  '}`}>{label}</p>
                                </div>
                            )}
                        </div>
                        <Link href={PAGE_ROUTES.AUTH_ROUTES.REGISTER} className="hover:scale-[1.1] duration-200 flex py-3 bg-gray-800 text-white items-center justify-center border gap-x-2 w-full rounded-full">
                            <p>{cta}</p>
                        </Link>
                    </div>
                )}
            </div>
            <div className="px-[300px] tablet:px-5">
                <h3 className="text-5xl text-center tablet:text-3xl mb-5">Frequently Asked Questions</h3>
                <FaqHelper active_faqs={pricingFaqs}/>
            </div>
            <ContactTemplate
                header={'Need Personalized help?'}
                subheader={'Our engineering team is just one message away if you need technical architecture advice.'}
            />
            
        </main>
    )
}
