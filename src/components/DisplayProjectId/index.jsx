import { useRouter } from "next/router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useContext, useEffect, useMemo, useState } from "react";

import { API_ENDPOINTS, PAGE_ROUTES } from "@/configs";
import { Chart, DataFetch, LoadButton } from "..";
import { DataRequestContext, UseDataRequestContextComponent } from "@/context";
import { useHttpServices, useToast } from "@/hooks";
import { ActionChartModal, ModalLayout } from "@/components/modal";
import D3Container from "../chart/D3Charts/container";


export default function DisplayProjectId({status='owned'}) {
    return (
        <UseDataRequestContextComponent>
            <DisplayProjectIdContent status={status} />
        </UseDataRequestContextComponent>
    );
}

function DisplayProjectIdContent({status='owned'}) {
    const router = useRouter();
    const { getProtectedData } = useHttpServices();
    const { visualsSugg, setNewVisualsSugg,  setColumns, newVisuals, setProject, setVisuals, setNewVisuals, visuals } = useContext(DataRequestContext);
    const [showChartModal, setShowChartModal] = useState(false);
    const {NotifyError, NotifySuccess}= useToast()
    const fetchProject = async () => {
        return await getProtectedData({ path: API_ENDPOINTS.OWNED_BY_ID(router?.query?.id) });
    };

    
    const { isLoading, error, data, isError } = useQuery({
        queryKey: ["project", router?.query?.id],
        queryFn: fetchProject,
        enabled: !!router?.query?.id,
        refetchOnWindowFocus: false,
        retry: false,
    });
    const { postProtectedData } = useHttpServices();
    const addVisualsQuery = async () => {
        console.log({ newVisuals });
        return await postProtectedData({
            body:newVisuals,
            path: API_ENDPOINTS.ADD_VISUALIZATION(router?.query?.id)
        });
    };
            
    const {
        mutate: addVisChart,
        isPending: addVisLoading
    } = useMutation({
        mutationFn: () => addVisualsQuery(),

        onError: (error) => {
            console.log({ error })

            return NotifyError(
                error?.error?.message ||
                'Could not add to chart. Try again later.'
            )
        },

        onSuccess: ({ data }) => {
            NotifySuccess('Done. Chart Added.')
            setNewVisuals([])
            setVisuals([...visuals, ...newVisuals])
            // onNext({
            //     ...formData
            // })
            // router.reload()
            return
        }
    })
   
    useEffect(() => {
        console.log({ data })
        setProject(data?.project)
        // setNewVisualsSugg(data?.project?.visualization_settings?.defaults)

        // const columns =
        //     data?.project?.datasets?.flatMap((dataset) =>
        //         dataset?.columns?.column_data_types
        //             ?.filter(({ col }) =>
        //                 dataset?.columns?.active_columns?.includes(col)
        //             )
        //             ?.map(({ col, data_type }) => ({
        //                 col,
        //                 cat: data_type,
        //                 table: dataset.file_name
        //             }))
        //     ) || []
        // setColumns(columns)

    }, [data])
    const combinedVisuals = useMemo(() => {
        return [...visuals, ...newVisuals];
    }, [newVisuals, visuals]);
    return (
        <DataFetch 
            isLoading={isLoading} isError={isError} errorMsg={error?.message}>
            <section className="">
                <div className="px-5 flex justify-between items-center flex py-4 border-b items-center">
                    <div className=" gap-y-1 ">
                        <h1 className="text-2xl font-bold">{data?.project?.title || "Sample Project"}</h1>
                        {data?.project?.description ? <p>{data.project.description}</p> : null}
                    </div>
                    <div className="flex items-center gap-x-4">
                        <LoadButton onClick={addVisChart} 
                            isLoading={addVisLoading}
                            disabled={newVisuals?.length === 0} className="bg-primary flex items-center gap-x-2 rounded-xl text-base py-2 px-5 shadow-sm">
                            <img src="/svg/save.svg" alt="filter" className="w-5 h-5" />
                            <p className="text-white">Save</p>
                        </LoadButton>
                        
                        {/* <button className="flex items-center gap-x-2 bg-gray-200 rounded-xl text-base py-2 px-5 shadow-sm">
                            <img src="/svg/share.svg" alt="filter" className="w-5 h-5" />
                            <p>Share</p>
                        </button> */}
                        <button 
                        onClick={() => setShowChartModal(true)}
                        className="flex items-center gap-x-2 bg-gray-200 rounded-xl text-base py-2 px-5 shadow-sm">
                            <img style={{ filter: 'invert(1)' }} src="/svg/add-dark.svg" alt="filter" className="w-5 h-5" />
                            <p>Add</p>
                        </button>
                    </div>
                </div>
                <div>
                    {!combinedVisuals?.length ? 
                    (  
                    <div className=" flex flex-col items-center py-10">
                        {/* <div className="relative mb-6">
                            <div className="absolute inset-0 bg-primary/5 rounded-full scale-150 blur-3xl"></div>
                        </div> */}
                        <div className="relative bg-white p-5 rounded-2xl border border-slate-200  shadow-xl shadow-slate-200/50 ">
                            <div className="grid grid-cols-2 gap-4 w-44">
                            <div className="h-14 bg-slate-200  rounded-lg"></div>
                            <div className="h-20 bg-slate-200  rounded-lg"></div>
                            <div className="h-30 bg-slate-200  rounded-lg -mt-8"></div>
                            <div className="h-16 bg-slate-200  rounded-lg"></div></div>
                        </div>
                        <div className="mt-8 flex flex-col items-center text-center">
                            <p className="text-lg font-semibold">No Charts Added Yet</p>
                            <div className="w-[500px] text-gray-500">
                                <p className="my-1">Start building your dasboard by creating your first visualization. Your insights are just few clicks away.</p>
                            </div>
                            <button
                                onClick={() => setShowChartModal(true)}
                                className="mt-5 inline-flex items-center gap-x-2 bg-primary rounded-lg text-white py-2 px-5 shadow-sm"
                            >
                                <img src="/svg/plus-white.svg" alt="filter" className="w-5 h-5" />
                                <p>Add Your First Chart</p>
                            </button>
                        </div>
                    </div>)
                    :
                    <section>
                        <D3Container combinedVisuals={combinedVisuals} />
                    </section> 
                    }
                </div>
                {showChartModal ? (
                    <ModalLayout
                      onClose={() => setShowChartModal(false)}
                    >   
                    <ActionChartModal
                        status="add"
                        onClose={() => setShowChartModal(false)}
                        onNext={() => setShowChartModal(false)}
                        // columns={columns}
                        // project_data={data.project}
                        
                        visualsSugg={visualsSugg}
                        setNewVisualsSugg={setNewVisualsSugg}
                    />
                    </ModalLayout>
                ) : null}
            </section>
        </DataFetch>
    );
}