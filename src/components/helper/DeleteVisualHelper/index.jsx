import { ContinueCancel } from "@/components/modal";
import { API_ENDPOINTS } from "@/configs";

import { useHttpServices, useToast } from "@/hooks";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";

export default function DeleteVisualHelper({onClick,active, setActive, onClose, onNext}){
    const {postData}= useHttpServices()
    const {NotifyError, NotifySuccess}= useToast()

    const router= useRouter()

    const deletChartQuery= async()=>{
        return await postData({path:API_ENDPOINTS.DELETE_CHART,body:{mainId:router?.query?.id, chartInd:active.chartInd}})
    }
    
    const {mutate:deleteChart, isPending:delLoading}=useMutation({
    mutationFn: ()=>deletChartQuery(),
    onError:({error})=>{
        return NotifyError(error.message || 'Could not delete chart. Try again later.')
    },
    onSuccess:({data})=>{
        setActive(null)
        NotifySuccess('Done. Chart Deleted.')
        onNext(active.chartInd)
        return
    }})

    return(
        <>
            <ContinueCancel isLoading={delLoading} 
                onClose={
                    // ()=>setActionModal(null)
                    ()=>onClose()
                }
                onNext={()=>deleteChart()}
                html={<p className="text-center text-base">
                    Confirm delete: &quot;<b>{active.title}</b>&quot;?
                </p>}
                continueClass={' p3 '}
                cancelClass=" p1 "
            />
        </>
    )
}