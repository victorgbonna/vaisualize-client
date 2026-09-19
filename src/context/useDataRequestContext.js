import { useToast } from '@/hooks'
import {createContext, useCallback, useContext, useEffect, useState} from 'react'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

export const DataRequestContext = createContext()

export default function UseDataRequestContextComponent(
    {children}){ 
    const [dataArray, setDataArray]=useState([])
    // const [project, setProject]= useState([])
    const [compl_dataArray, setCompDataArray]=useState([])
    //old guard
    const [x, setX]=useState([])
    const [y, setY]=useState([])
    const [z, setZ]=useState([])
    const {NotifySuccess, NotifyError}= useToast()
    const [visualsSugg, setVisualsSugg]=useState(null)
    const [newVisualsSugg, setNewVisualsSugg]=useState(null)
    const [dataMetrics, setDataMetrics]=useState(null)
    const [aggregation, setAggregation]=useState('')
    const [del_visualsSugg, setDelVisualsSugg]=useState([])
    const [filter_x, setFilter]= useState(null)

    //new guard
    const [columns, setColumns]=useState([])
    const [distinctValues, setDistinctValues]=useState({})
    const [datasets, setDatasets]= useState({})
    const [project, setProject]= useState({})
    const [newVisuals, setNewVisuals]=useState([])
    const [visuals, setVisuals]= useState([])
    // this are distinct values -> an object of table_name containing a column object of array of distinct values in case of relationships
    // useEffect(()=>{
    //     // console.log('filter_x changed')
    //     if(!visualsSugg) return
    //     if(!filter_x) return
    //     if(filter_x.length===1 && filter_x[0].length===1 && Object.keys(filter_x[0][0]).length === 0){
    //         console.log('yes')
    //         setDataArray([...compl_dataArray])
    //         return
    //     }
    //     let new_data= [...compl_dataArray]
    //     let filter_data=new_data?.filter((data_row)=>{
    //         return filter_x.some((filter_or_set)=>
    //         filter_or_set.every((filter_and_set)=>{
    //             const col_value=data_row[filter_and_set.column]
    //             // console.log({col_value,filter_and_set, data_row})
    //             if(filter_and_set.filterOpt==='eq'){
    //                 return col_value==filter_and_set.value
    //             }
    //             if(filter_and_set.filterOpt==='neq'){
    //                 return col_value!=filter_and_set.value
    //             }
    //             if(filter_and_set.filterOpt==='gt'){
    //                 return +col_value>filter_and_set.value
    //             }
    //             if(filter_and_set.filterOpt==='lt'){
    //                 return +col_value<filter_and_set.value
    //             }
    //             if(filter_and_set.filterOpt==='contains'){
    //                 return col_value.includes(filter_and_set.value)
    //             }
    //             return false;
    //             // let passed_test=filter_and_set.filterOpt==='eq'?col_value==filter_and_set.value:col_value!=filter_and_set.value
    //             // return passed_test
    //         }))
    //     })
    //     if(!filter_data.length){
    //         return NotifyError('There would be nothing left of the data with this filter.') 
    //     }
    //     setDataArray(filter_data)

    //     return NotifySuccess('Filter applied')
    // },[filter_x])
    

    const getFileExt = (fileName = '') =>
        fileName.toLowerCase().split('.').pop()

    const parseCsv = (fileUrl) =>
        new Promise((resolve) => {
            Papa.parse(fileUrl, {
                download: true,
                header: true,
                skipEmptyLines: true,
                complete: (result) => resolve(result.data || []),
                error: () => resolve([])
            })
        })

    const parseXlsx = async (fileUrl) => {
        try {
            const buffer = await (await fetch(fileUrl)).arrayBuffer()
            const workbook = XLSX.read(buffer, { type: 'array' })
            const sheet = workbook.Sheets[workbook.SheetNames[0]]
            return XLSX.utils.sheet_to_json(sheet, { defval: '' })
        } catch {
            return []
        }
    }

    const parseJson = async (fileUrl) => {
        try {
            const rows = await (await fetch(fileUrl)).json()
            return Array.isArray(rows)
                ? rows.map((row) => normalizeJsonRow(row))
                : []
        } catch {
            return []
        }
    }

    const normalizeJsonRow = (row) => {
        if (!row || typeof row !== 'object') return row

        return Object.fromEntries(
            Object.entries(row).map(([key, value]) => {
                if (value && typeof value === 'object' && '$date' in value) {
                    return [key, value.$date]
                }

                if (value && typeof value === 'object' && '$oid' in value) {
                    return [key, value.$oid]
                }

                return [key, value]
            })
        )
    }

    const parseDatasetFile = (fileUrl, fileName) => {
        switch (getFileExt(fileName)) {
            case 'csv':
                return parseCsv(fileUrl)
            case 'xlsx':
            case 'xls':
                return parseXlsx(fileUrl)
            case 'json':
                return parseJson(fileUrl)
            default:
                return Promise.resolve([])
        }
    }
    useEffect(() => {
        if (!project) return

        setVisuals(project.visualizations || [])

        const columns =
            project?.datasets?.flatMap((dataset) =>
                dataset?.columns?.column_data_types
                    ?.filter(({ col }) =>
                        dataset?.columns?.active_columns?.includes(col)
                    )
                    ?.map(({ col, data_type }) => ({
                        col,
                        cat: data_type,
                        table: dataset.file_name
                    }))
            ) || []
        setColumns(columns)

        let cancelled = false

        const loadDatasets = async () => {
            if (!project?.datasets?.length) {
                if (!cancelled) setDatasets({})
                return
            }

            const entries = await Promise.all(
                project.datasets.map(async (dataset) => {
                    if (!dataset?.file_url || !dataset?.file_name) {
                        return [dataset?.file_name, []]
                    }
                    const rows = await parseDatasetFile(dataset.file_url, dataset.file_name)
                    return [dataset.file_name, rows]
                })
            )

            if (!cancelled) {
                setDatasets(Object.fromEntries(entries))
            }
        }

        loadDatasets()

        return () => { cancelled = true }
    }, [project])
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
            newVisualsSugg, setNewVisualsSugg,
            //new guard
            newVisuals, setNewVisuals,
            visuals, setVisuals,
            project, setProject,
            distinctValues, setDistinctValues,
            datasets, setDatasets
        }}>
            {children}
        </DataRequestContext.Provider>
    )
}