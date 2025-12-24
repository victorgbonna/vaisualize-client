import { DeleteVisualHelper, LoadButton, SelectMultiple, SelectOption } from "@/components";
import ModalLayout from "../modalLayout"
import { Fragment, use, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DataRequestContext } from "@/context";
import { API_ENDPOINTS, chartChecker, commafy, consolelog } from "@/configs";
import { useHttpServices, useToast } from "@/hooks";
import { ContinueCancel } from "..";
import { useRouter } from "next/router";
import { useMutation } from "@tanstack/react-query";


export default function ActionChartModal(
    {btnLoadingState=false,onClose,isLoading=null, extraClass="", data, status, onNext}) {
    const {columns, visualsSugg, setNewVisualsSugg}= useContext(DataRequestContext)
    const [mount, setMount]= useState(false)

    useEffect(()=>{
        if(mount) return
        setTimeout(()=>setMount(true), 1000)
    } , [])

    return (
        <ModalLayout onClose={onClose}>
            <div
                style={isLoading?{
                    opacity:'0.5'   
                }:{

                }} 
                onClick={(e)=> e.stopPropagation()} 
                className={"bg-white relative rounded-md px-6 py-10 text-left w-fit text-sm "+extraClass}>
                <img src={'/svg/close.svg'} className="w-5 h-5 cursor-pointer absolute right-5 top-5" onClick={onClose}/>
                <div
                    style={mount?{}:{visibility:'hidden'}}
                
                >
                    <div>
                    {status==='add'?
                        <AddCharts 
                            setNewVisualsSugg={setNewVisualsSugg} 
                            columns={columns} 
                            onNext={onNext} 
                            visualsSugg={visualsSugg} 
                            data={data}
                        />:
                        <EditCharts 
                            noAutoEdit={true} 
                            data={data} 
                            columns={columns} 
                            visualsSugg={visualsSugg} 
                            onNext={onNext}
                        />
                    }
                    </div>
                    

                </div>
            </div>
        </ModalLayout>

    );
  }
// x, y, z, group_by, aggregate, unit,why,chartInd:ind, chartType, title, status:'edit'

function AddCharts({columns, visualsSugg, data, onNext}){   
    const [step, setStep]= useState(0)
    const [actionModal, setActionModal]= useState(null)
    const [formData, setFormData]=useState({})

    const tableCols= ['s/n','chart-type','x', 'y', 'group_by', 'aggregate', 'unit', 'ACTION']
    const [new_add_visuals, set_new_add_visuals]= useState([])
    const [new_visuals_sugg, setNewVisualsSugg]= useState([])
    
    const marked4Deleting=(ind, status)=>{
        const visuals=[...new_visuals_sugg]
        visuals[ind].marked4Delete= true
        // console.log({ind, visuals:visuals[ind]})
        setNewVisualsSugg(visuals)
    }
    const updateVisuals=(form)=>{
        if(actionModal.status==='add'){
            const visuals=[...new_add_visuals, form]
            set_new_add_visuals(visuals)
            return
        }
        const visuals=[...new_visuals_sugg]
        visuals[step-1]= form
        setNewVisualsSugg(visuals)
        return
    }

    useEffect(()=>{
        if(!visualsSugg?.length) return
        const visuals= [...visualsSugg]
        setNewVisualsSugg(visuals.map(({_id, ...props})=>(props)))
    },[visualsSugg])

    return(
        <>
         <div className="">
            <p className="text-xl font-semibold mb-2">All Visuals {step>0?' - Edit Visual':' '}</p>
            <div className="">
                {step===0?
                <div>
                    <div className="max-h-[350px] overflow-y-auto h-fit">
                    <table className={'border-seperate w-[900px] tablet:w-full'}>
                        <thead style={{background:'#FFFFFF'}}>
                            <tr>
                                {tableCols.map((col, index) => (
                                    <th className='py-2 text-black uppercase text-[15px]' key={index} 
                                        style={
                                            col==="group_by"?{textAlign:"left", paddingLeft:"12px"}:
                                            col==="ACTION"?{textAlign:"right", paddingRight:"40px"}:
                                            {textAlign:"left"}
                                            }
                                        >
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="">
                            {new_visuals_sugg?.map(({status,...data},index)=>{
                            const chart_types=data?.plot_type?.split(',') ?? []
                            return(
                                <tr key={index} className={data.marked4Delete?' delete-tr ':''+" text-[#414141] border-b"}>
                                    <td className="text-left">
                                        <p>{index+1}</p>
                                    </td>
                                    <td className="text-left">
                                        <p>{chart_types[0]}{chart_types.length>1?'++':''}</p>
                                    </td>
                                    <td className="text-left">
                                        <p>{typeof data.x ==='string'? data.x:data.x[0]+'++'}</p>
                                    </td>
                                    <td className="text-left">
                                        <p>{data.y ?? 'N/A'}</p>
                                        
                                    </td> 
                                    <td className="text-left">
                                        <div className="pl-3">
                                        {data?.group_by ?? 'N/A'}
                                        </div>
                                    </td> 
                                    <td className="text-left ">
                                        {data.aggregate ?? 'N/A'}
                                    </td> 
                                    <td>
                                        {data.unit ?? 'N/A'}
                                    </td>
                                    <td >
                                        {/* {!data.marked4Delete? */}
                                        {1?

                                        <div className="flex items-center gap-x-5 justify-end gap-x-4">
                                            <button disabled={data.marked4Delete} className="text-white px-4 py-1.5 p1 rounded-lg" 
                                            onClick={()=>
                                            {
                                                setActionModal({
                                                    ...data,status:'edit',
                                                     chartInd:index,
                                                    chartType:chart_types[0]
                                                })
                                                setStep(index+1)
                                            }}>
                                                <p>Edit</p>
                                            </button>
                                            <button disabled={data.marked4Delete} 
                                                className="p-1.5 p3 rounded-lg" 
                                                onClick={()=>setActionModal({
                                                    ...data,status:'delete', chartInd:index
                                                })}>
                                                <img src="/svg/bin.svg" className="w-3.5 h-3.5"/>
                                            </button>
                                            
                                        </div>
                                        :
                                        <div className="flex justify-end">
                                            <button  onClick={()=>marked4Deleting(index, false)} 
                                                className="p2 w-fit text-white monte text-sm rounded-lg py-1.5 px-4">
                                                {'Undo Delete'}
                                            </button>
                                        </div>
                                        }
                                    </td>
                                </tr>
                            )})}
                            {new_add_visuals?.map(({status,...data},index)=>{
                            const chart_types=data?.chartType?.split(',') ?? []
                            return(
                                <tr key={index} className=" text-black border-b">
                                    <td className="text-left">
                                        <p>{visualsSugg?.length+index+1}</p>
                                    </td>
                                    <td className="text-left">
                                        <p>{chart_types[0]}{chart_types.length>1?'++':''}</p>
                                    </td>
                                    <td className="text-left">
                                        <p>{data.x  ?? 'N/A'}</p>
                                    </td>
                                    <td className="text-left">
                                        <p>{data.y ?? 'N/A'}</p>
                                        
                                    </td> 
                                    <td className="text-left">
                                        <div className="pl-3">
                                        {data?.group_by ?? 'N/A'}
                                        </div>
                                    </td> 
                                    <td className="text-left ">
                                        {data.aggregate ?? 'N/A'}
                                    </td> 
                                    <td>
                                        {data.unit ?? 'N/A'}
                                    </td>
                                    <div className="flex items-center gap-x-[3px] justify-end gap-x-4">
                                            <p className="text-emerald-700 py-1.5" >
                                                New
                                            </p>
                                            <p 
                                                className="p-1.5 bg-white border rounded-lg" 
                                            >
                                                <img src="/svg/tick.svg" className="w-3.5 h-3.5"/>
                                            </p>
                                            
                                        </div>
                                    
                                </tr>
                            )})}
                        </tbody>
                    </table>
                    </div>
                    <div className="mt-3 flex justify-end gap-x-7">
                        <button 
                            onClick={()=>{
                                setActionModal({
                                    status:'add'
                                })
                                setStep(-2)
                            }}
                            className="text-[15px] rounded-full border border-dashed border-black flex items-center gap-x-2 px-4 py-2 mt-6">
                            <p>Add More</p>
                            <img src="/svg/arrow-back2.svg" 
                                style={{
                                    filter: 'brightness(0%)',
                                    transform:'rotate(180deg)'
                                }}
                            />
                        </button>
                        <button 
                            onClick={()=>onNext()}
                            className="text-[15px] rounded-full p2 text-white flex items-center gap-x-2 px-4 py-2 mt-6">
                            <p>{"That's all for now"}</p>
                        </button>                    
                    </div>
                </div>:

                null}
                {(actionModal?.status==='edit' || actionModal?.status==='add' )?
                    <ChartInputBox goBack={true} columns={columns} 
                        formData={formData} setFormData={setFormData}
                        isEdit={actionModal?.status==='edit'} data={actionModal} 
                        onNext={(form)=>{
                            updateVisuals(form)
                            setActionModal(null)
                            setStep(0)
                            
                        }}
                        onClose={()=>{
                            setActionModal(null)
                            setStep(0)
                        }}
                    />
                    :
                    null
                }
                {/* {actionModal?.status==='delete'?
                    <ContinueCancel isLoading={false} 
                        onClose={()=>setActionModal(null)}
                        onNext={()=>deleteChart()}
                        html={<p className="text-center text-base">
                            Confirm delete: "<b>{actionModal.title}</b>"?
                        </p>}
                        continueClass={' p3 '}
                        cancelClass=" p1 "
                    />:
                    null
                } */}
                {actionModal?.status==='delete'?
                    <DeleteVisualHelper
                        active={actionModal}
                        setActive={setActionModal}
                        onClose={()=>setActionModal(null)}
                        onNext={(e)=>marked4Deleting(e)}
                    />:null}
                {/* <ChartInputBox columns={columns} setFormData={setFormData} formData={formData}/> */}
            </div>
            
        </div>

        </>
    )
}
  
function EditCharts({data, columns, visualsSugg, onClose, onNext}){
    const {NotifyError, NotifySuccess}= useToast()
    const {postData}= useHttpServices()
    const [formData, setFormData]=useState({})
    const router= useRouter()
    const editChartQuery= async()=>{
        const {chartType, status, ...rest_form_data}= formData
        return await postData({path:API_ENDPOINTS.EDIT_CHART,
            body:{
                mainId:router?.query?.id, 
                chartInd:data.chartInd,
                ...rest_form_data,
                plot_type:chartType
        }})
    }
    
    const {mutate:editChart, isPending:edLoading}=useMutation({
        mutationFn: ()=>editChartQuery(),
        onError:(error)=>{
            console.log({error})
            return NotifyError(error?.error?.message || 'Could not edit chart. Try again later.')
        },
        onSuccess:({data})=>{
            NotifySuccess('Done. Chart Edited.')
            onNext()
            return
        }})

    return(
        <div className="max-h-[450px] tablet:w-full tablet:h-fit">
            <p className="text-xl font-semibold mb-2">Edit Visual</p>
            
            <div className="max-h-[350px] overflow-y-auto h-fit">
            <ChartInputBox columns={columns} isEdit={true} 
                data={data} excludeBtn={true} formData={formData}
                setFormData={setFormData}
            />    
            </div>
            
            <div className="flex justify-end tablet:px-0">
                <LoadButton
                    isLoading={edLoading}
                    onClick={()=>editChart()} 
                    className={"mt-5 pl-10 pr-10 w-fit p2 text-white rounded-full py-3 font-semibold text-sm"}
                >
                    Save Changes
                </LoadButton>
            </div>
        </div>
    )
}

function ChartInputBox({formData, onNext, setFormData,onClose=()=>null,excludeBtn=false,columns, goBack, isEdit, data}){
    const charts=[...Object.keys(API_ENDPOINTS.LIST_CHARTS)]
    const rules_for_chartTypes= API_ENDPOINTS.LIST_CHARTS
    const {NotifySuccess, NotifyError}= useToast()
    const {postData}= useHttpServices()

    const router= useRouter()
    const editChartQuery= async()=>{
        const {chartType, status, ...rest_form_data}= formData
        if(!isEdit){
            const {error}= chartChecker.chatFormChecker(formData)
            if(error){
                return NotifyError(error)
            }
        }
        return await postData({
            path:isEdit?API_ENDPOINTS.EDIT_CHART:API_ENDPOINTS.ADD_CHART,
            body:{
                mainId:router?.query?.id, 
                chartInd:isEdit?data.chartInd:22,
                ...rest_form_data,
                plot_type:chartType
        }})
    }
    
    const {mutate:editChart, isPending:edLoading}=useMutation({
        mutationFn: ()=>editChartQuery(),
        onError:(error)=>{
            console.log({error})
            return NotifyError(error?.error?.message || 'Could not edit chart. Try again later.')
        },
        onSuccess:({data})=>{
            NotifySuccess('Done. Chart Edited.')
            onNext({...formData})
            return
        }})

    const box_inp=[
        {label:'Title', id:"", type:'text', name:'title', placeholder:'Perfect Summary', maxlength:55},
        {label:'Select Visual', id:"", name:'chartType',type:'select_chart_type', options:charts},
        {label:'X(Horizontal Values)', id:"x", name:'x',type:'select', placeholder:'name, brand...'},
        {label:'Y(Vertical Values)', id:"y", name:'y',type:'select', placeholder:'price, amount...'},
        {label:'Z(Bubble size)', id:"z", name:'z',type:'select', placeholder:'size, speed...'},
        {label:'Group By', id:'group_by', name:'group_by',type:'select', placeholder:'gender, clubs..'},
        {label:'Aggregate', id:'group_by', name:'aggregate',type:'select', placeholder:'count, sum...', options:['count','sum','average']},
        {label:'Date Unit', id:'unit', name:'unit',type:'select_unit', placeholder:'months, year..', options:['none','hour','day','months','weeks','year']},
        {label:'Why this?(optional)', type:'textarea', id:"why", name:'why', placeholder:'Describe why this analysis is important', maxlength:200},

    ]
    
    const formChange=(e, key, option=false, status=false)=>{
        if(key==='chartType'){
            setFormData({
                ...formData,
                chartType:e,
                x:'',
                y:'',
                group_by:'',
                aggregate:'count',
                unit:'month',
            })
            return
        }
        if(key==='x'){
            setFormData({
                ...formData,
                x:e,
                unit:'month',
            })
            return
        }
        if(status){
            const value = e.target.value;
            const currentArray = formData[key] || [];
            const updatedArray = [...currentArray, value];    
            return setFormData({ ...formData, [key]: updatedArray });
            // return setFormData({...formData,[key]:[...formData[key], e]})

        }
        
        if (option) return setFormData({...formData,[key]:e})
        return setFormData({...formData,[key]:e.target.value})
    }
    const [rules_for_chartType, setRulesForChartType]= useState({})

    const no_cat_fields= chartChecker.no_cat_fields

    const permitted_columns=useMemo(()=>{
        if(!columns) return []
        return chartChecker.getDisabledCharts(columns)
    },[columns])
    useEffect(()=>{
        if(!formData?.chartType) return 

        setRulesForChartType(rules_for_chartTypes[formData?.chartType] || {})
        return 
    },[formData?.chartType])
    useEffect(()=>{
        if(!data) return
        setFormData(data)
    },[])
    return(
        <div>
            <div className="space-y-1 mb-3 text-[13px] flex flex-col bg-gray-100 p-3 rounded-lg">
                {['numerical_column','date_column', 'categorical_column'].map((x,ind)=>{
                    const get_cats= columns.filter(({cat})=>cat===x)
                    return(
                        <div key={ind} className="" style={
                            get_cats.length?
                                {order:ind}:
                                {order:5}
                            }>
                            {!get_cats.length?
                                <div className="max-w-[700px]">
                                <p className="italic">{no_cat_fields[x]}</p>
                                </div>:
                                <p className="uppercase font-semibold">
                                    {x.replace('_',' ')}{': '}
                                    <span className="font-medium text-gray-500">{get_cats.length}</span>
                                </p>
                            }
                        </div>
                    )
                })}
            </div>

            <div className="w-[700px] relative tablet:w-full gap-5 grid grid-cols-3 gap-x-5 tablet:h-[400px] tablet:overflow-y-auto tablet:grid-cols-1">
                    
                {box_inp.map((
                    {label, id, name, placeholder, options, type, maxlength},ind)=>{
                    return(
                    <Fragment key={ind}>
                        {type==='text'?
                        <div className={ind===0?' col-span-2 tablet:col-span-1':''}>
                            <p className="font-medium text-left">{label}</p>
                            <input type={type} onChange={(e)=>formChange(e, name)}
                                value={formData[name] || ''} 
                                className="border py-3 px-3 gap-x-2 w-full mt-2.5 rounded-md text-sm tablet:text-base "
                                placeholder={placeholder}
                                maxLength={maxlength}
                            />
                        </div>:
                        type==='select_chart_type'?
                        <div 
                        // (!rules_for_chartType?.[name]?' hidden ':'') 
                            className="w-full ">
                            <p className="font-medium text-left">{label}
                            </p>
                            {isEdit?
                            <p className="text-left bg-gray-50  border py-3 px-3 gap-x-2 w-full mt-2.5 rounded-md text-sm tablet:text-base ">{formData[name]}</p>:
                            <>
                            <SelectOption
                                options={options}
                                disabled_options={permitted_columns}
                                // optionClass=" py-3 px-3 gap-x-2 w-full mt-2.5 rounded-md text-sm tablet:text-base"
                                value={formData[name]} 
                                onChange={(e)=>formChange(e,name, true)}
                                label={label}
                                containerClass={' border '}
                            />
                            </>
                            }
                        </div>:
                        type==='select'?
                        <div 
                        // (!rules_for_chartType?.[name]?' hidden ':'')
                            style={!rules_for_chartTypes?.[formData?.chartType]?.[name]?{display:'none'}:{}} 
                            className="w-full ">
                            <p className="font-medium text-left">{label}
                                <span className="text-stone-600 text-xs">
                                    {(rules_for_chartType?.[name]?.isOptional?' (optional)':'')}
                                </span>
                            </p>
                            {isEdit && name==='chartType'?
                            <p className="text-left bg-gray-50  border py-3 px-3 gap-x-2 w-full mt-2.5 rounded-md text-sm tablet:text-base ">{formData[name]}</p>:
                            <>
                            {
                            ((name==='x')  && (formData?.chartType==='matrix heatmap' || formData?.chartType==='radar chart'))                            
                            ?
                            <SelectMultiple
                                options={
                                    columns.filter(({col, cat})=>{
                                        // console.log({rules_for_chartType:rules_for_chartType?.[name]?.colType, cat})
                                        if(rules_for_chartType?.[name]?.colType?.some((type)=> type===cat)) return true
                                        return false
                                    }).map(({col})=>col)        
                                }
                                // optionClass=" py-3 px-3 gap-x-2 w-full mt-2.5 rounded-md text-sm tablet:text-base"
                                values={formData[name]} 
                                minValues={formData?.chartType==='matrix heatmap'?1:3}
                                maxValues={formData?.chartType==='matrix heatmap'?6:5}
                                onChange={(e)=>formChange(e,name, true, 'multiple')}
                                label={label}
                                containerClass={'border '}
                            />
                            :
                            <SelectOption
                                options={
                                    options ?? columns.filter(({col, cat})=>{
                                        // console.log({rules_for_chartType:rules_for_chartType?.[name]?.colType, cat})
                                        if(rules_for_chartType?.[name]?.colType?.some((type)=> type===cat)) return true
                                        return false
                                    }).map(({col})=>col)        
                                }
                                // optionClass=" py-3 px-3 gap-x-2 w-full mt-2.5 rounded-md text-sm tablet:text-base"
                                value={formData[name]} 
                                onChange={(e)=>formChange(e,name, true)}
                                label={label}
                                containerClass={'border '}
                            />}
                            </>
                            }
                        </div>:
                            type==='select_unit'?
                        <div style={(
                            ['bar chart', 'area chart', 'line chart'].includes(formData?.chartType) && 
                            columns.find(({col})=>col===formData?.x)?.cat==='date_column'
                        )?{}:{display:'none'}} 
                        // (!rules_for_chartType?.[name]?' hidden ':'') 
                            className="w-full ">
                            <p className="font-medium text-left">{label}
                            </p>
                            <SelectOption
                                options={options}      
                                // optionClass=" py-3 px-3 gap-x-2 w-full mt-2.5 rounded-md text-sm tablet:text-base"
                                value={formData[name]} 
                                onChange={(e)=>formChange(e,name, true)}
                                label={label}
                                containerClass={'border '}
                            />
                            
                        </div>:
                        <div className="col-span-3 tablet:col-span-1">
                            <p className="font-medium text-left">{label}</p>
                            <textarea value={formData[name] || ''} 
                                onChange={(e)=>formChange(e,name)}
                                className="w-full p-3 h-[80px] rounded-md gap-x-2 w-full mt-2.5 rounded-md text-sm tablet:text-base border"
                                placeholder={placeholder}
                                maxLength={maxlength}    
                            />
                        </div>
                        }
                    </Fragment>
                    )}
                )}
                
            </div>
            {!excludeBtn?<div className="flex justify-between w-full items-center mt-6">
                <button onClick={()=>onClose()} className="px-8 py-2 p3 text-white rounded-full " style={!goBack?{visibility:'hidden'}:{}}>Go Back</button>
                <LoadButton isLoading={edLoading} 
                    onClick={()=>editChart()} 
                    className="px-8 py-2 p1 text-white rounded-full ">Save</LoadButton>
            </div>:null}
        </div>
    )
}