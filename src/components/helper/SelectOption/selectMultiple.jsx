import { useOnClickOutside } from "@/hooks";
import { useEffect, useRef, useState } from "react"
import iconSvgPath from "../iconSvgPath";

export default function SelectMultiple(
  {options, onChange, values,label, leftSibling=null,valueProp,
    showActiveOption=true, labelProp="label",
    dropdownSrc, errorProp= null, extraClass,
    containerClass, isInput=false,posAttribute={
        bottom:"100%"
    }, displayDropOnRelative=false,
    optionClass="absolute bg-white rounded overflow-auto py-2.5 space-y-2 min-w-fit"
}) {
    const [show,toggle]= useState(false)
    const [text, setText]= useState('') 
    const [new_options, setOptions]= useState(options)
    const ref = useRef(); 
    useOnClickOutside(ref, () => toggle(false));
    // console.log(options[0], valueProp)
    // onMouseLeave={show?() => toggle(false):()=>null}
    useEffect(()=>{
        // console.log({text})
        if(!text) {
            toggle(false)
            return 
        }
        if(isInput){
            const filterOptions= options.filter(
                ({email, first_name, last_name})=>
                    email.includes(text) || first_name.includes(text) || last_name.includes(text))?.slice(0,10)
            setOptions(filterOptions)
            if(!show) {
                // alert('true')
                toggle(true)
            }
            return
        }
        return
    },[text])
    return (   
    <div ref={ref} className="z-[8]">
    <div style={{position:"relative", width:"100%"}} onClick={!isInput?() => toggle(!show):()=>null} >
        {/* ${isInput && value && !options.includes(value)?' border-red-100 ':''} */}
        {!isInput?<div 
        className={`${containerClass || 'w-full bg-white cursor-pointer flex justify-between border border-gray-400 rounded-md text-sm tablet:text-base py-2.5 px-3 gap-x-2 items-center   '}`}  
            >
                {leftSibling && leftSibling}
                
                    <>
                    {values.length?
                        <p className="w-fit text-black cursor-pointer truncate">
                            {values.length+' selected'}
                        </p>:
                        <p className="opacity-50 cursor-pointer">
                            {label}
                        </p>
                    }</>
                
            <div style={displayDropOnRelative?{display:'none'}:{}}>
                <img src={dropdownSrc || iconSvgPath('caret-bottom')}
                    className="transition duration-150 cursor-pointer"
                    style={show? 
                    {
                        transform: "rotate(180deg)",
                    }
                    :{ 
                        transform: "rotate(0deg)" 
                    }
                    }
                    alt="dropdown icon" 
                    width={10} height={10}
                /> 
            </div>        
        </div>
        :<input className={`${containerClass || 'w-full bg-white  border rounded-md text-sm tablet:text-base py-2.5 px-3 gap-x-2 items-center'}`}
            value={text} onChange={(e)=>setText(e.target.value)}
        /> } 
        {show ? (
            <ul className={`${displayDropOnRelative?'  ':' absolute '} h-fit absolute bg-white w-full rounded overflow-auto min-w-fit ${extraClass}`} style={{
                ...posAttribute, maxHeight:"200px", height:'400px',
                background: '#FFFFFF', zIndex:"4",
                border: '1px solid #CABECF',borderRadius: '10px'
            }}>
                {/* {new_options.map((option,index)=>
                    <li style={value===option?{
                        background:"#CABECF", padding:"9px 10px"
                    }:{ padding:"9px 10px"}} className="cursor-pointer" key={index} 
                    onClick={()=>onChange(option)}>{option}</li>           
                )} */}
                {options?.map((option,index)=>
                    <li style={values.includes(option)?{
                        background:"#CABECF", padding:"12px 10px"
                    }:{ padding:"12px 10px"}} className="text-sm border-b-2 cursor-pointer flex items-center gap-x-3" key={index} 
                    >
                        <input 
                        onChange={(e)=>onChange(e)}
                            value={option} type="checkbox" 
                            className="w-5 h-5 cursor-pointer" 
                            checked={values.includes(option)}/>
                        <p>{option}</p>
                    </li>           
                )}


            </ul>
        ):null}
    </div>
    </div>

    
)}



// function ExSelectMultiple(
//   {options, onChange, values,label, leftSibling=null,valueProp,
//     showActiveOption=true, labelProp="label",
//     dropdownSrc, errorProp= null, extraClass,
//     containerClass, isInput=false,posAttribute={
//         bottom:"100%"
//     }, displayDropOnRelative=false,
//     optionClass="absolute bg-white rounded overflow-auto py-2.5 space-y-2 min-w-fit"
// }) {
//     const [show,toggle]= useState(false)
//     const [text, setText]= useState('') 
//     const [new_options, setOptions]= useState(options)
//     const ref = useRef(); 
//     useOnClickOutside(ref, () => toggle(false));
//     // console.log(options[0], valueProp)
//     // onMouseLeave={show?() => toggle(false):()=>null}
//     useEffect(()=>{
//         // console.log({text})
//         if(!text) {
//             toggle(false)
//             return 
//         }
//         if(isInput){
//             const filterOptions= options.filter(
//                 ({email, first_name, last_name})=>
//                     email.includes(text) || first_name.includes(text) || last_name.includes(text))?.slice(0,10)
//             setOptions(filterOptions)
//             if(!show) {
//                 // alert('true')
//                 toggle(true)
//             }
//             return
//         }
//         return
//     },[text])
//     return (   
//     <div ref={ref} className="z-[8]">
//     <div style={{position:"relative", width:"100%"}} onClick={!isInput?() => toggle(!show):()=>null} >
//         {/* ${isInput && value && !options.includes(value)?' border-red-100 ':''} */}
//         {!isInput?<div 
//         className={`${containerClass || 'w-full bg-white cursor-pointer flex justify-between border border-gray-400 rounded-md text-sm tablet:text-base py-2.5 px-3 gap-x-2 items-center   '}`}  
//             >
//                 {leftSibling && leftSibling}
                
//                     <>
//                     {values.length?
//                         <p className="w-fit text-black cursor-pointer truncate">
//                             {values.length+' selected'}
//                         </p>:
//                         <p className="opacity-50 cursor-pointer">
//                             {label}
//                         </p>
//                     }</>
                
//             <div style={displayDropOnRelative?{display:'none'}:{}}>
//                 <img src={dropdownSrc || iconSvgPath('caret-bottom')}
//                     className="transition duration-150 cursor-pointer"
//                     style={show? 
//                     {
//                         transform: "rotate(180deg)",
//                     }
//                     :{ 
//                         transform: "rotate(0deg)" 
//                     }
//                     }
//                     alt="dropdown icon" 
//                     width={10} height={10}
//                 /> 
//             </div>        
//         </div>
//         :<input className={`${containerClass || 'w-full bg-white  border rounded-md text-sm tablet:text-base py-2.5 px-3 gap-x-2 items-center'}`}
//             value={text} onChange={(e)=>setText(e.target.value)}
//         /> } 
//         {show ? (
//             <ul className={`${displayDropOnRelative?'  ':' absolute '} h-fit absolute bg-white w-full rounded overflow-auto min-w-fit ${extraClass}`} style={{
//                 ...posAttribute, maxHeight:"200px",
//                 background: '#FFFFFF', zIndex:"4",
//                 border: '1px solid #CABECF',borderRadius: '10px'
//             }}>
//                 {/* {new_options.map((option,index)=>
//                     <li style={value===option?{
//                         background:"#CABECF", padding:"9px 10px"
//                     }:{ padding:"9px 10px"}} className="cursor-pointer" key={index} 
//                     onClick={()=>onChange(option)}>{option}</li>           
//                 )} */}
//                 {(new_options)?.map((option,index)=>
//                     <li style={values.includes(option[valueProp])?{
//                         background:"#CABECF", padding:"12px 10px"
//                     }:{ padding:"12px 10px"}} className="text-sm border-b-2 cursor-pointer flex items-center gap-x-3" key={index} 
//                     >
//                         <input 
//                         onChange={(e)=>onChange(e)}
//                             value={option[valueProp]} type="checkbox" 
//                             className="w-5 h-5 cursor-pointer" 
//                             checked={values.includes(option[valueProp])}/>
//                         <p>{option[labelProp]}</p>
//                     </li>           
//                 )}


//             </ul>
//         ):null}
//     </div>
//     </div>
// )}