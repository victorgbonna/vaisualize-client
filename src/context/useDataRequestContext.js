import { useToast } from '@/hooks'
import {createContext, useCallback, useContext, useEffect, useState} from 'react'
// import { useHttpServices,useLocalStorage } from '@/hooks';
// import { consolelog } from '@/configs';

export const DataRequestContext = createContext()

export default function UseDataRequestContextComponent(
    {children}){ 
    const [dataArray, setDataArray]=useState([])
    const [compl_dataArray, setCompDataArray]=useState([])
    const [x, setX]=useState([])
    const [y, setY]=useState([])
    const [z, setZ]=useState([])
    const {NotifySuccess, NotifyError}= useToast()
    const [visualsSugg, setVisualsSugg]=useState(null)
    const [newVisualsSugg, setNewVisualsSugg]=useState(null)
    const [columns, setColumns]=useState([])
    const [dataMetrics, setDataMetrics]=useState(null)
    const [aggregation, setAggregation]=useState('')
    const [del_visualsSugg, setDelVisualsSugg]=useState([])
    const [filter_x, setFilter]= useState(null)
    useEffect(()=>{
        // console.log('filter_x changed')
        if(!visualsSugg) return
        if(!filter_x) return
        if(filter_x.length===1 && filter_x[0].length===1 && Object.keys(filter_x[0][0]).length === 0){
            console.log('yes')
            setDataArray([...compl_dataArray])
            return
        }
        let new_data= [...compl_dataArray]
        let filter_data=new_data?.filter((data_row)=>{
            return filter_x.some((filter_or_set)=>
            filter_or_set.every((filter_and_set)=>{
                const col_value=data_row[filter_and_set.column]
                // console.log({col_value,filter_and_set, data_row})
                if(filter_and_set.filterOpt==='eq'){
                    return col_value==filter_and_set.value
                }
                if(filter_and_set.filterOpt==='neq'){
                    return col_value!=filter_and_set.value
                }
                if(filter_and_set.filterOpt==='gt'){
                    return +col_value>filter_and_set.value
                }
                if(filter_and_set.filterOpt==='lt'){
                    return +col_value<filter_and_set.value
                }
                if(filter_and_set.filterOpt==='contains'){
                    return col_value.includes(filter_and_set.value)
                }
                return false;
                // let passed_test=filter_and_set.filterOpt==='eq'?col_value==filter_and_set.value:col_value!=filter_and_set.value
                // return passed_test
            }))
        })
        if(!filter_data.length){
            return NotifyError('There would be nothing left of the data with this filter.') 
        }
        setDataArray(filter_data)

        return NotifySuccess('Filter applied')
    },[filter_x])
    return(
        <DataRequestContext.Provider value={{
            dataArray, setDataArray,
            x, setX,
            y, setY,
            z, setZ,
            visualsSugg, setVisualsSugg,
            dataMetrics, setDataMetrics,
            aggregation, setAggregation,
            del_visualsSugg, setDelVisualsSugg,
            setColumns, columns,
            compl_dataArray, setCompDataArray,
            setFilter, filter_x,
            newVisualsSugg, setNewVisualsSugg
        }}>
            {children}
        </DataRequestContext.Provider>
    )
}