import { useState } from "react"

export default function FaqHelper({active_faqs}){
    return(
        <div className="my-14 flex flex-col gap-6">
            {active_faqs.map(({answer,question},ind)=>
                <div key={ind} className=" rounded-[18px] border">                
                    <AnswerQues answer={answer} question={question}/>
                </div>
            )}
        </div>
    )
}

function AnswerQues({answer, question}){
    const [showAns, setShowAns]= useState(false)
    return(
        <>
        <div onClick={()=>setShowAns(!showAns)} className="cursor-pointer font-semibold p-4 flex items-center justify-between">
            <p>{question}</p>
            <img src="/svg/caret-bottom.svg" alt="caret" />
        </div>
        <div className="p-4 border-t" style={!showAns?{display:'none'}:{}}>
            {answer}
        </div>
        </>
    )
}