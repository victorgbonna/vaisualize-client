import {createContext, useMemo, useEffect, useState} from 'react'

export const ProjectDataContext = createContext()

export default function ProjectDataContextComponent(
    {children}){ 
    const [formData, setFormData] = useState('');
    const [chartColors, setChartColors] = useState(['#4FC3F7']);
    const [dataCollection, setDataCollection] = useState([]);
    const [multiselect, setMultiselect] = useState({
        unique_columns: [], columns: [], all_columns: [],
        categorical_columns: [], numerical_columns: [],
        date_columns: [], non_placed_columns: []
    });
    const [step, setStep] = useState(2);

    const [first5rows, setFirst5Rows] = useState([]);

    const [relationships, setRelationships] = useState([]);

    const [defaults, setDefaults] = useState({
        background_color: '#FFFFFF',
        font_color: '#000000',
        font_family: {label:'Oswald', value:'Oswald'}
        // chart_colors:['#4E79A7']
        // , '#F28E2B', '#E15759', '#76B7B2', '#59A14F', '#EDC948', '#B07AA1', '#FF9DA7', '#9C755F', '#BAB0AC']
    });

    const isDisabled = useMemo(() => {
        // const hasFormData = Object.keys(formData).length > 0
        const hasData = dataCollection.length > 0;
        return !(hasData);
    }, [dataCollection]);

    return(
        <ProjectDataContext.Provider value={{
            step, setStep, formData, setFormData,
            dataCollection, setDataCollection,
            relationships, setRelationships,
            chartColors, setChartColors,
            default_chart_colors: '#4FC3F7',
            multiselect, setMultiselect, setFirst5Rows, first5rows,
            defaults, setDefaults,
            isDisabled
        }}>
            {children}
        </ProjectDataContext.Provider>
    )
}