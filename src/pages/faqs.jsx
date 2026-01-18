import { ContactTemplate, FaqHelper } from "@/components";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function Faq(){
const faqs = [
  {
    category: "General",
    question: "What makes WebBi different from other BI tools?",
    answerText:
      "WebBi is a lightweight, business-first BI tool focused on speed, clarity, and usability. It avoids complex enterprise setups and allows users to move from raw spreadsheets to meaningful visuals quickly, combining AI-assisted chart generation with clean, customizable dashboards.",
    answer: (
      <div className="space-y-2">
        <p>
          WebBi is built as a lightweight, business-first BI tool focused on speed,
          clarity, and usability. Instead of complex enterprise setups, WebBi lets
          you move from raw spreadsheets to meaningful visuals in minutes.
        </p>
        <p>
          It combines AI-assisted chart generation, clean visual defaults, and
          customizable dashboards that fit naturally into modern web applications.
        </p>
      </div>
    ),
  },
  {
    category: "General",
    question: "Who is WebBi built for?",
    answerText:
      "WebBi is built for founders, analysts, product teams, and developers who need fast insights without deep BI expertise. It works well for startups, internal tools, client reporting, and lightweight analytics.",
    answer: (
      <div className="space-y-2">
        <p>
          WebBi is designed for founders, analysts, product teams, and developers
          who want fast insights without deep BI expertise.
        </p>
        <p>
          It works well for startups, internal tools, client reporting, and
          lightweight analytics use cases.
        </p>
      </div>
    ),
  },
  {
    category: "General",
    question: "Can I use WebBi without Technical or data expertise?",
    answerText:
      "Yes. WebBi uses an AI assistant that analyzes your data and immediately suggests appropriate charts. You can refine visuals and explore insights using simple controls rather than complex queries.",
    answer: (
      <div className="space-y-2">
        <p>
          Yes. WebBi uses an AI assistant that analyzes your data and immediately
          suggests appropriate charts and layouts.
        </p>
        <p>
          You can refine visuals, adjust chart types, and explore insights using
          simple controls instead of complex queries.
        </p>
      </div>
    ),
  },
  {
    category: "General",
    question: "What types of visuals can I create with WebBi?",
    answerText:
      "WebBi supports a wide range of visualizations including bar charts, grouped bar charts, line charts, area charts, histograms, box plots, violin plots, heatmaps, radar charts, scatter plots, and bubble charts.",
    answer: (
      <div className="space-y-2">
        <p>WebBi supports a rich visualization library, including:</p>
        <ul className="list-disc pl-5">
          <li>Bar and grouped bar charts</li>
          <li>Line and area charts</li>
          <li>Histograms, box plots, and violin plots</li>
          <li>Heatmaps and radar charts</li>
          <li>Scatter and bubble charts</li>
        </ul>
      </div>
    ),
  },
  {
    category: "Billing",
    question: "Is WebBi free to use?",
    answerText:
      "WebBi offers a free plan that allows users to upload data, generate visuals, and explore insights. Exports on the free plan include a WebBi watermark.",
    answer: (
      <div className="space-y-2">
        <p>
          WebBi offers a free plan that allows you to upload data, generate visuals,
          and explore insights.
        </p>
        <p>
          Exports on the free plan include a subtle WebBi watermark.
        </p>
      </div>
    ),
  },
  {
    category: "Billing",
    question: "What does the paid plan include?",
    answerText:
      "The paid plan costs ₦5,000 per month and includes watermark-free exports, higher LLM credits for AI visual generation and data chat, and priority access to new features.",
    answer: (
      <div className="space-y-2">
        <p>
          The paid plan costs <strong>₦5,000 per month</strong>.
        </p>
        <ul className="list-disc pl-5">
          <li>Watermark-free exports for presentations and reports</li>
          <li>Higher LLM credits for AI visual generation and data chat</li>
          <li>Priority access to new features</li>
        </ul>
      </div>
    ),
  },
  {
    category: "Billing",
    question: "Can I cancel my subscription anytime?",
    answerText:
      "Yes. WebBi subscriptions are billed monthly and can be canceled at any time without long-term commitments.",
    answer: (
      <div className="space-y-2">
        <p>
          Yes. WebBi subscriptions are billed monthly and can be canceled at any
          time without long-term commitments.
        </p>
      </div>
    ),
  },
  {
    category: "Technical",
    question: "How does WebBi handle data modeling?",
    answerText:
      "WebBi includes built-in data modeling tools that help clean, structure, and prepare data before visualization, ensuring consistent metrics and accurate aggregations.",
    answer: (
      <div className="space-y-2">
        <p>
          WebBi includes built-in data modeling capabilities that allow you to
          clean, structure, and prepare your data before visualization.
        </p>
        <p>
          This ensures consistent metrics, accurate aggregations, and reusable
          datasets across dashboards.
        </p>
      </div>
    ),
  },
  {
    category: "Technical",
    question: "How does the AI visual generation work?",
    answerText:
      "After uploading a dataset, WebBi’s AI analyzes the data and immediately suggests the most effective charts. Users can then adjust chart types, axes, filters, and groupings.",
    answer: (
      <div className="space-y-2">
        <p>
          Once you upload a dataset, the AI assistant automatically analyzes the
          structure and suggests the most effective charts.
        </p>
        <p>
          You can instantly adjust chart types, axes, filters, and groupings
          without starting from scratch.
        </p>
      </div>
    ),
  },
  {
    category: "Technical",
    question: "Can I chat with my data?",
    answerText:
      "Yes. WebBi includes an LLM-powered chat feature that allows users to ask questions in natural language and receive insights, summaries, and visual suggestions.",
    answer: (
      <div className="space-y-2">
        <p>
          {'Yes. WebBi includes an LLM-powered “Chat with your data” feature.'}
        </p>
        <p>
          You can ask questions in natural language and receive insights, summaries,
          and visual suggestions directly from your dataset.
        </p>
      </div>
    ),
  },
  {
    category: "Technical",
    question: "Can I export visuals for presentations?",
    answerText:
      "WebBi allows users to export high-quality visuals for reports and presentations. Paid users can export clean, watermark-free visuals suitable for professional use.",
    answer: (
      <div className="space-y-2">
        <p>
          WebBi allows you to export high-quality visuals suitable for reports and
          presentations.
        </p>
        <p>
          Paid users can export clean, watermark-free visuals optimized for slides
          and stakeholder sharing.
        </p>
      </div>
    ),
  },
];

const [search, setSearch]= useState('')
const [cat, setCat]= useState('General')
const cats=['General', 'Billing', 'Technical']
const active_faqs= useMemo(()=>{
    const cat_faqs=faqs.filter(({category})=>category===cat)
    if(!search) return cat_faqs
    return cat_faqs.filter(({category, question})=>category.includes(search) || question.includes(search))
}, [cat, search])

    return(
        <main className="w-full px-[300px] py-20 tablet:px-5 flex-col items-center">
            <div className="text-center mb-10">
                <h2 className="text-5xl tablet:text-3xl font-bold mb-4">Frequently Asked Questions</h2>
                <p className="text-slate-600 ">Everything you need to know about building high performance data visualizations with WebBi.</p>
            </div>
            <div className="flex items-center justify-between bg-slate-100 py-3 px-5 rounded-[20px]">
                <div className="flex items-center gap-x-3 flex-1">
                    <img src="/svg/search.svg" alt="search" className="w-5 h-5"/>
                    <input type="text" placeholder="Search topics..." 
                        onChange={(e)=>setSearch(e.target.value)}
                        value={search}    
                        className="bg-transparent text-[#39434d] sinput flex-1 pr-4"
                    
                    />
                </div>
                
                <kbd className=" items-center gap-1 px-2 py-1 rounded bg-slate-200 text-xs text-slate-500 font-sans border border-slate-300">
                    <span className="text-sm">⌘</span>K
                </kbd>
            </div>
            <div className="flex justify-center mt-6">
                <div className="justify-center flex items-center w-fit rounded-lg p-1 bg-slate-100">
                    {cats.map((label,ind)=>
                        <button style={cat===label?{background:'#FFFFFF', color:'#607AFB'}:{}} className="w-fit rounded-full text-[15px] text-slate-500 px-5 py-2" onClick={()=>setCat(label)} key={ind}>{label}</button>
                    )}
                </div>
            </div>
           <FaqHelper active_faqs={active_faqs}/>

            <ContactTemplate
                header='Still have questions?'
                subheader="Cannot find the answer you're looking for? Please chat with our friendly team."
            />
            
        </main>
    )
}

