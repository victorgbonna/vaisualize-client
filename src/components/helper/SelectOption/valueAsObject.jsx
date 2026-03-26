import { useOnClickOutside } from "@/hooks";
import { useEffect, useRef, useState } from "react"
import iconSvgPath from "../iconSvgPath";


export default function SelectOptionAsObjectValue(
  {options, onChange,label, value,
    leftSibling=null,style={},
    showActiveOption=true,
    changeAll=false,sliceValue,
    dropdownSrc, errorProp= null, 
    containerClass, valueProp="value", labelProp="label",
    optionClass="absolute bg-white rounded overflow-auto py-2.5 space-y-2 min-w-fit"
}) {
    const [show,toggle]= useState(false)
    const new_options= showActiveOption?options:options.filter((opt)=>opt[valueProp]!==value[valueProp])
    const ref = useRef(); 
    
    useOnClickOutside(ref, () => toggle(false));
    // onMouseLeave={show?() => toggle(false):()=>null}
    return (   
    <div ref={ref} className="z-[8]">
    <div style={{position:"relative", width:"100%"}} onClick={() => toggle(!show)} >
        <div className={"z-[1] cursor-pointer flex justify-between border rounded-md py-2 px-2.5 gap-x-2 items-center "+containerClass}  
            style={{
            background: '#FFFFFF',
            ...style
            // border: '1px solid #CABECF',
            // borderRadius: '10px'
        }}>
            <div className="flex items-center gap-x-[3px]">
                {leftSibling &&
                leftSibling}
                {value[labelProp]?
                    <p className="w-fit font-medium text-[15px]">
                        {sliceValue?value[labelProp]?.slice(0,20)+'.':value[labelProp]}
                    </p>:
                    <p className="opacity-50 text-[15px]">
                        {label}
                    </p>
                }
            </div>
            <div>
                <img src={dropdownSrc || iconSvgPath('caret-bottom')}
                    className="transition duration-150"
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
        {show && (
            <ul className={'z-[8] absolute bg-white rounded overflow-auto py-2.5 space-y-2 min-w-fit '+optionClass} style={{
                top:"100%", maxHeight:"200px", width:"100%",
                background: '#FFFFFF', zIndex:"4",
                border: '1px solid #CABECF',borderRadius: '10px'
            }}>
                {new_options.map((option,index)=>
                    <li style={value[valueProp]===option[valueProp]?{
                        background:"#CABECF", padding:"9px 10px"
                    }:{ padding:"9px 10px"}} className="text-sm cursor-pointer" key={index} 
                    onClick={()=>onChange(changeAll?option:option[valueProp])}>{option[labelProp]}</li>           
                )}

            </ul>
        )}
    </div>
    </div>
)}