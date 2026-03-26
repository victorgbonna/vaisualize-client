import { useRouter } from "next/router";
import { useQuery } from "@tanstack/react-query";

import { API_ENDPOINTS, PAGE_ROUTES } from "@/configs";
import { DataFetch } from "..";
import { useHttpServices } from "@/hooks";
import Link from "next/link";

export default function DisplayProjectId({status='owned'}) {
    const router = useRouter();
    const { getProtectedData } = useHttpServices();

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

    return (
        <DataFetch 
            isLoading={isLoading} isError={isError} errorMsg={error?.message}>
            <section className="">
                <div className="px-5 flex justify-between items-center flex py-4 border-b items-center">
                    <div className=" gap-y-1 ">
                        <h1 className="text-2xl font-bold">{data?.name || "Sample Project"}</h1>
                        {data?.description ? <p>{data.description}</p> : null}
                    </div>
                    <div className="flex items-center gap-x-4">
                        <button className="bg-primary flex items-center gap-x-2 rounded-xl text-base py-2 px-5 shadow-sm">
                            <img src="/svg/filter.svg" alt="filter" className="w-5 h-5" />
                            <p className="text-white">Add Filter</p>
                        </button>
                        <button className="flex items-center gap-x-2 bg-gray-200 rounded-xl text-base py-2 px-5 shadow-sm">
                            <img src="/svg/share.svg" alt="filter" className="w-5 h-5" />
                            <p>Share</p>
                        </button>
                    </div>
                </div>
                <div>
                    {1?
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
                            <Link href={PAGE_ROUTES.CREATE_CHARTS(router?.query?.id)} className="mt-5 inline-flex items-center gap-x-2 bg-primary rounded-lg text-white py-2 px-5 shadow-sm">
                                <img src="/svg/plus-white.svg" alt="filter" className="w-5 h-5" />
                                <p>Add Your First Chart</p>
                            </Link>
                        </div>
                    </div>
                    :null}
                </div>
            </section>
        </DataFetch>
    );
}