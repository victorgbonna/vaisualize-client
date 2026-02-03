import { useOnClickOutside } from "@/hooks";
import { useEffect, useRef, useState } from "react"
import iconSvgPath from "../iconSvgPath";

export default function SelectOption(
  {options, onChange, value,label, leftSibling=null,
    showActiveOption=true,disabled=false,
    fullContainerClass, sideImageValue,
    displayDropOnRelative=false,
    dropdownSrc, errorProp= null, 
    disabled_options=null,
    valueStyle={},extraOptionClass='',
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
    <div ref={ref} className="w-full"
        style={{...style}}
    >
    <div style={{position:"relative", width:"100%"}} onClick={() => toggle(!show)} >
        <div 
        className=
            {fullContainerClass ?? ` z-[4] relative cursor-pointer flex justify-between items-center text-sm tablet:text-base  gap-x-2 w-full tablet:text-base  rounded-md py-1 ${containerClass || ' px-1 bg-white'} 
            ${isInput && !options.includes(value)?' border-red-100 ':''}`}  
            >
                {leftSibling && leftSibling}
                {!isInput
                    ?<>
                    {value?
                        <>
                        {sideImageValue}
                        <p style={valueStyle} className="w-fit text-[15px] text-black cursor-pointer">
                            {value}
                        </p>
                        </>:
                        <p className="opacity-50 text-[15px] text-black cursor-pointer">
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
                background: '#FFFFFF', zIndex:"6",
                border: '1px solid #CABECF',borderRadius: '4px'
            }}>
                {/* {new_options.map((option,index)=>
                    <li style={value===option?{
                        background:"#CABECF", padding:"9px 10px"
                    }:{ padding:"9px 10px"}} className="cursor-pointer" key={index} 
                    onClick={()=>onChange(option)}>{option}</li>           
                )} */}
                {(!isInput || !value?new_options: new_options.filter((option)=>option?.toLowerCase()?.startsWith(value?.toLowerCase()))).map((option,index)=>
                    <button style={value===option?{
                        background:"#CABECF",
                    }:{ padding:"12px 10px"}} className={"block w-full text-sm border-b-2 cursor-pointer "+(extraOptionClass || ' py-2 px-2.5 ')} key={index} 
                    onClick={()=>onChange(option)} disabled={(disabled_options?.length)?disabled_options.includes(option):false}>{option}</button>           
                )}


            </ul>
        ):null}
    </div>
    </div>
)}