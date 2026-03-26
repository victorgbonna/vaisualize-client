import { AppLayout, ChartEditor, DataFetch, DisplayProjectId } from "@/components"
import { API_ENDPOINTS } from "@/configs"
import { useHttpServices } from "@/hooks"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/router"
import { useMemo } from "react"

export default function AddChart(){
    const router=useRouter()    

    const {getProtectedData}= useHttpServices()

    const getProject= async()=>{
        return await getProtectedData({path:API_ENDPOINTS.OWNED_BY_ID(router?.query?.id)})
    }
    const {isLoading:projLoading, error, data:project_data,isError}= useQuery(
        {
        queryKey:['project-'+router?.query?.id],
        queryFn:()=>getProject(),
        refetchOnWindowFocus: false,
        refetchOnMount:true,
        retry:false, enabled:!!router?.query?.id
        }
    )
    const active_data= useMemo(()=>{
        if(!project_data?.project){
            return 'Chart  >  '+(router?.query?.edit?'Edit-'+router?.query?.edit:'Create')
        }
        return `${project_data?.project?.title}  >  `+(router?.query?.edit?'Edit-'+router?.query?.edit:'Create')
    },[project_data, router?.query?.edit])
    return(
       <AppLayout 
            active={
                active_data
            } excludeSideBar={true}>
            <section>
                <DataFetch 
                    isLoading={projLoading} isError={isError} errorMsg={error?.message}>
                    <ChartEditor data={project_data?.project} />
                </DataFetch>
            </section>

        </AppLayout>
    )
}