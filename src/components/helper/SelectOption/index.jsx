import { useOnClickOutside } from "@/hooks";
import { useEffect, useRef, useState } from "react"
import iconSvgPath from "../iconSvgPath";

export default function SelectOption(
  {options, onChange, value,label, leftSibling=null,
    showActiveOption=true,
    displayDropOnRelative=false,
    dropdownSrc, errorProp= null, 
    containerClass, isInput=false,posAttribute={
        top:"100%"
    },
    optionClass="absolute bg-white rounded overflow-auto py-2.5 space-y-2 min-w-fit"
}) {
    const [show,toggle]= useState(false)
    const new_options= showActiveOption?options:options.filter((opt)=>opt!==value)
    const ref = useRef(); 
    useOnClickOutside(ref, () => toggle(false));
    // onMouseLeave={show?() => toggle(false):()=>null}
    return (   
    <div ref={ref} className="z-[8]">
    <div style={{position:"relative", width:"100%"}} onClick={() => toggle(!show)} >
        <div className={` cursor-pointer flex justify-between border rounded-md text-sm tablet:text-base text-graySubHd py-1 border-gray-400 px-3 py-2.5  gap-x-2 items-center  ${containerClass || ''} ${isInput && !options.includes(value)?' border-red-100 ':''}`}  
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
                    <input className="w-[80%] text-black" 
                        type="text" onClick={show?()=>null:()=>toggle(true)}
                        placeholder={label}
                        onChange={(e)=>onChange(e.target.value)} value={value}/>
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
                {(!isInput || !value?new_options: new_options.filter((option)=>option.toLowerCase().includes(value.toLowerCase()))).map((option,index)=>
                    <li style={value===option?{
                        background:"#CABECF", padding:"12px 10px"
                    }:{ padding:"12px 10px"}} className="text-sm border-b-2 cursor-pointer" key={index} 
                    onClick={()=>onChange(option)}>{option}</li>           
                )}


            </ul>
        ):null}
    </div>
    </div>
)}