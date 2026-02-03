
import {createContext, useContext, useEffect, useState} from 'react'

export const ProjectDataContext = createContext()

export default function ProjectDataContextComponent(
    {children}){ 
    const [formData, setFormData]=useState('')
    const [dataCollection, setDataCollection]= useState([])
    const [multiselect, setMultiselect]= useState({
        unique_columns:[],columns:[], all_columns:[],
        categorical_columns:[],numerical_columns:[],
        date_columns:[], non_placed_columns:[]
    })

    const [loadingState, setLoadingState]= useState('')
    
    const formChange=(e, key, option=false)=>{
        if (option) return setFormData({...formData,[key]:e})
        return setFormData({...formData,[key]:e.target.value})
    }
    const [step, setStep] =useState(3)



    const daysOfWeek = [
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ];

    const monthsOfYear = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    // const {isDate}= timeStampControl
    const {isDate}= true

    const [first5rows, setFirst5Rows]= useState([])
    const years = Array.from({ length: 2028 - 2000 }, (_, i) => 2000 + i);

    const dates_term=[...daysOfWeek, ...monthsOfYear, ...years]
    const MAX_SIZE = 10 * 1024 * 1024;

   
    return(
        <ProjectDataContext.Provider value={{
            step,setStep, formData, setFormData,
            dataCollection, setDataCollection,
            multiselect, setMultiselect, setFirst5Rows, first5rows
        }}>
            {children}
        </ProjectDataContext.Provider>
    )
}