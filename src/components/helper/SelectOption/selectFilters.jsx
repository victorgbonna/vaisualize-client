import { useHttpServices } from "@/hooks";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import SelectOptionAsObjectValue from "./valueAsObject";
import { API_ENDPOINTS } from "@/configs";

export default function SelectFilters({onChange, id}){
    const [saved_filters, set_saved_filters]=useState([])
    // const [filters_dec, set_filters_dec]= useState(null)

    const {getData}= useHttpServices()
    const getAllFilters=async()=>{    
        return await getData({path:API_ENDPOINTS.GET_FILTER_FOR_VISUALS(id)})
    }
    
    const {isLoading:filterLoading, data:filter_data, error, isError:isFilError}= useQuery(
        {
        queryKey:['all-filters-by-'+id],
        queryFn:()=>getAllFilters(),
        refetchOnWindowFocus: false,
        refetchOnMount:true,
        retry:false, enabled:!!id
        }
    )

    useEffect(()=>{
        if(!filter_data) return
        set_saved_filters(filter_data?.data?.filters)
        
        // const def_filter= filter_data?.filters?.find(({_id})=>data?.active_filter===_id)
        // if(!def_filter) return
        // set_filters_dec(def_filter)
    },[filter_data])


    return(
        <div>
            <SelectOptionAsObjectValue options={saved_filters} 
                label={'Select a saved filter'}
                changeAll={true}
                onChange={(e)=>{
                    // set_filters_dec(e)
                    onChange(e)
                }}
                labelProp='name' valueProp="_id"
                value={{}}
                containerClass={(filterLoading?' invisible ':' ')+' border rounded-[22px] mt-0'}
            />
        </div>
        
    )
}