import {createContext, useContext, useEffect, useState} from 'react'
// import { useHttpServices,useLocalStorage } from '@/hooks';
// import { consolelog } from '@/configs';

export const DataRequestContext = createContext()

export default function UseDataRequestContextComponent(
    {children}){ 
    const [dataArray, setDataArray]=useState('')
    const [x, setX]=useState([])
    const [y, setY]=useState([])
    const [z, setZ]=useState([])
    const [visualsSugg, setVisualsSugg]=useState(null)
    const [dataMetrics, setDataMetrics]=useState(null)
    const [aggregation, setAggregation]=useState('')

    return(
        <DataRequestContext.Provider value={{
            dataArray, setDataArray,
            x, setX,
            y, setY,
            z, setZ,
            visualsSugg, setVisualsSugg,
            dataMetrics, setDataMetrics,
            aggregation, setAggregation
        }}>
            {children}
        </DataRequestContext.Provider>
    )
}