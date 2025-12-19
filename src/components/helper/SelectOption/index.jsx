import { useOnClickOutside } from "@/hooks";
import { useEffect, useRef, useState } from "react"
import iconSvgPath from "../iconSvgPath";

export default function SelectOption(
  {options, onChange, value,label, leftSibling=null,
    showActiveOption=true,disabled=false,
    fullContainerClass,
    displayDropOnRelative=false,
    dropdownSrc, errorProp= null, 
    disabled_options=null,
    containerClass, isInput=false,posAttribute={
        top:"100%"
    },
    limitOptions= null,style={},
    optionClass="absolute bg-white rounded overflow-auto py-2.5 space-y-2 min-w-fit"
}) {
    const [show,toggle]= useState(false)
    const new_options= showActiveOption?options:options.filter((opt)=>opt!==value).slice(0, limitOptions || options.length)
    const ref = useRef(); 
    useOnClickOutside(ref, () => toggle(false));
    // onMouseLeave={show?() => toggle(false):()=>null}
    return (   
    <div ref={ref} className="z-[8]"
        style={{...style}}
    >
    <div style={{position:"relative", width:"100%"}} onClick={() => toggle(!show)} >
        <div 
        className=
            {fullContainerClass ?? ` cursor-pointer flex justify-between items-center  text-sm tablet:text-base px-3 gap-x-2 w-full mt-2.5 text-sm tablet:text-base  rounded-md py-3 ${containerClass || ''} 
            ${isInput && !options.includes(value)?' border-red-100 ':''}`}  
            style={{
            background: '#FFFFFF',
            // border: '1px solid #CABECF',
            // borderRadius: '10px'
        }}>
                {leftSibling && leftSibling}
                {!isInput
                    ?<>
                    {value?
                        <p className="w-fit text-black cursor-pointer">
                            {value}
                        </p>:
                        <p className="opacity-50 cursor-pointer">
                            {label}
                        </p>
                    }</>:
                    <input className={"w-[80%] text-black "} 
                        type="text" 
                        placeholder={label}
                        onChange={(e)=>{
                            onChange(e.target.value)
                            if(!show && !disabled){
                                // toggle(true)
                            }
                        }} value={value}
                    />
                }
                {/* {value?
                    <p className="text-black">
                        {value}
                    </p>:
                    <p className="opacity-50">
                        {label}
                    </p>
                } */}
                
            <div>
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
        {(show && !displayDropOnRelative)?(
            <ul className={`
                ${displayDropOnRelative?' relative ':' absolute '} bg-white w-full 
                rounded overflow-auto min-w-fit`} style={{
                ...posAttribute, maxHeight:"200px",
                background: '#FFFFFF', zIndex:"4",
                border: '1px solid #CABECF',borderRadius: '10px'
            }}>
                {/* {new_options.map((option,index)=>
                    <li style={value===option?{
                        background:"#CABECF", padding:"9px 10px"
                    }:{ padding:"9px 10px"}} className="cursor-pointer" key={index} 
                    onClick={()=>onChange(option)}>{option}</li>           
                )} */}
                {(!isInput || !value?new_options: new_options.filter((option)=>option?.toLowerCase()?.startsWith(value?.toLowerCase()))).map((option,index)=>
                    <button style={value===option?{
                        background:"#CABECF", padding:"12px 10px"
                    }:{ padding:"12px 10px"}} className={"block w-full text-sm border-b-2 cursor-pointer"} key={index} 
                    onClick={()=>onChange(option)} disabled={(disabled_options?.length)?disabled_options.includes(option):false}>{option}</button>           
                )}


            </ul>
        ):null}
    </div>
    </div>
)}