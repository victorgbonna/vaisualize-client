import { AppLayout, InputHelper, LoadButton, ProgressBar, ProjectHelper} from "@/components";
import { ModalLayout } from "@/components/modal";
import { API_ENDPOINTS, consolelog, PAGE_ROUTES } from "@/configs";
import { useHttpServices, useToast } from "@/hooks";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

export default function ProjectsDashboard(){
  const active='Projects'
  const [openModal, setOpenModal]= useState()

  return(
    <AppLayout active={active}>
      <div className="h-fit px-1 pt-6 pb-2">
        <div className="flex justify-between items-end px-8">
            <div>
                <h2 className="font-semibold text-3xl mb-2">Recent Projects</h2>
                <p className="text-gray-600">Manage your latest data visualizations and reports.</p>
            </div>
            <div className="flex gap-x-5">
                {/* <button className="flex items-center gap-x-2 border rounded-xl text-base py-2 px-5 shadow-sm">
                    <img src="/svg/filter-black.svg" alt="filter" className="w-5 h-5"/>
                    <p>Filter</p>
                </button> */}
                <LoadButton href={'/'}  onClick={()=>setOpenModal(true)} className="flex items-center gap-x-2  bg-emerald-500 rounded-xl text-base py-2 px-6 shadow-lg text-white">
                    <img src="/svg/plus.svg" alt="plus" className="w-5 h-5"/>
                    <p>New Project</p>
                </LoadButton>
            </div>
        </div>
        <div className="mt-5">
            <ProjectHelper/>
        </div>
      </div>
      {openModal?<AddModal onClose={()=>setOpenModal(false)}/>:null}
    </AppLayout>
  )
}

function AddModal({onClose}){
  const formInp= [
    {label:'Project Name', placeholder:'e.g., Q4 Sales Analysis',value:'title', type:'text'},
    {label:'Category', placeholder:'e.g., Ecommerce.', value:'category', type:'option',
      options: ["Health", "Sports", "Finance", "Education", "Environment",'Entertainment', 'E-commerce',"Technology",'Housing','Hospitality', "Other"],
    },
    {label:'Display Mode', 
      placeholder:'e.g., Public.', value:'mode', type:'option', 
      options:['Public', 'Private'],
    },
    {label:'Description(optional)', placeholder:'e.g., Visualizing monthly revenue trends and identifying growth opportunities across departments.', value:'description', type:'textarea'}
  ]
  const {postProtectedData}= useHttpServices()
  const [formData, setFormData]= useState({})
  const {NotifySuccess, NotifyError}= useToast()

  const initializeProjQuery= async()=>{
    return await postProtectedData({
        path:API_ENDPOINTS.INITIALIZE_PROJECT,
        body:formData
      })
  }
  
  const {mutate:initializeProj, isPending}=useMutation({
      mutationFn: ()=>initializeProjQuery(),
      onError:({error})=>{
        consolelog({error})
        return NotifyError(error.message || 'Could not send data')
      },
      onSuccess:({data})=>{
        // consolelog({x:data})
        NotifySuccess('Project Initialized')
        onClose()
        window.location.href=PAGE_ROUTES.CREATE_PROJECT(data?.project?._id)
        return
      }
  })

  return(
    <ModalLayout onClose={()=>onClose()}>
      <div onClick={(e)=> e.stopPropagation()} 
        className="w-[500px] tablet:w-full bg-white rounded-md pt-7 relative">
        <div className=" px-6 tablet:px-6 flex items-start justify-between mb-5">
          <div>
            <p className="text-2xl font-semibold">Create New Project</p>
            <p className="mt-1 text-slate-400 text-sm">Step 1 of 4: Basic Information</p>
          </div>
          <button onClick={()=>onClose()}>
            <img src="/svg/close.svg" alt="close" className="w-4 h-4 mt-3"/>
          </button>
        </div>
        <div className=" px-6 tablet:px-6">
          <ProgressBar currentStep={1} totalSteps={4}/>          
        </div>
        <div className="mt-5 space-y-4 px-6 tablet:px-6 grid grid-cols-2 gap-x-4">
          {formInp.map(({label, placeholder, value, type, options},ind)=>
            <div key={ind} className={type!=='option'?"col-span-2":''}>
              <InputHelper 
                onChange={(e)=>setFormData({...formData, [value]:type==='option'?e:e.target.value})} 
                label={label} placeholder={placeholder} options={options}
                value={formData[value] || ''} type={type} showLabel={true}/>
            </div>
          )}
        </div>
        <div className="rounded-b-md mt-7 border-t bg-gray-50 w-full flex justify-end px-6 tablet:px-6 py-6">
          <LoadButton onClick={()=>initializeProj()} 
            isLoading={isPending}
            disabled={!formData.title || !formData.mode}
            className=" hover:bg-primary/90 text-white px-6 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-md shadow-primary/20 bg-primary">
            <p>Next Step</p>
            <img style={{transform:'rotate(180deg)'}} src="/svg/arrow-back-white.svg" alt="arrow-right" className="w-4 h-4"/>
          </LoadButton>
        </div>
      </div>
    </ModalLayout>
  )
}