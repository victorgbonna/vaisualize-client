import { AppLayout, InputHelper, LoadButton, ProgressBar, ProjectHelper} from "@/components";
import { ModalLayout } from "@/components/modal";
import { API_ENDPOINTS, consolelog, PAGE_ROUTES } from "@/configs";
import { useHttpServices, useToast } from "@/hooks";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";

export default function VisualsDashboard(){
  const active='Visuals'
  const [openModal, setOpenModal]= useState()

  return(
    <AppLayout active={active}>
      <div className="h-fit px-1 pt-6 pb-2">
        <div className="flex justify-between items-end px-8">
            <div>
                <h2 className="font-semibold text-3xl mb-2">Recent Visuals</h2>
                <p className="text-gray-600">Manage your latest data visualizations and reports.</p>
            </div>
        </div>
        <div className="mt-5">
            <ProjectHelper fromVisuals={true}/>
        </div>
      </div>
      {/* {openModal?<AddModal onClose={()=>setOpenModal(false)}/>:null} */}
    </AppLayout>
  )
}
