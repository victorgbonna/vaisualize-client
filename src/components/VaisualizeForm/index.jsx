import { useFileInput, useHttpServices, useToast } from "@/hooks";
import { Fragment, useEffect, useState } from "react"
import { LoadButton, SelectMultiple, SelectOption } from "..";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { API_ENDPOINTS, consolelog, PAGE_ROUTES, timeStampControl } from "@/configs";
import ModalLayout from "../modal/modalLayout";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";

export default function VaisualizeForm(){
    const [formData, setFormData]= useState({})
    const {postData}= useHttpServices()
    
    const {  uploadFile, fileData, previewSrc, getFileName, setPreviewSrc, setFileData} =useFileInput()


    const datasetInfo = [
        {
            label: "Title",
            name: "title",
            type: "text",
            placeholder: "Enter dataset name (e.g. Hypertension Risk Data)",
            required: true,
        },
        {
            label: "Category",
            name: "category",
            type: "select",
            placeholder: "Select category",
            options: ["Health", "Sports", "Finance", "Education", "Environment",'Entertainment', "Technology",'Housing','Hospitality', "Other"],
            required: true,
        },
        {
            label: "Description",
            name: "description",
            type: "textarea",
            placeholder: "Briefly describe what the dataset is about...",
            required: true,
        },
        {
            label: "Goal / Objective",
            name: "goal",
            type: "textarea",
            placeholder: "What do you want to achieve or analyze with this dataset?",
            required: true,
        }
    ];
    const [multiselect, setMultiselect]= useState({
        unique_columns:[],columns:[], all_columns:[],
        categorical_columns:[],numerical_columns:[],
        date_columns:[], non_placed_columns:[]
    })
    const datasetStructureFields = [
    {
        label: "Columns (Field Names)",
        name: "columns",
        type: "multi-input",
        placeholder: "Enter all column names in your dataset",
        required: true,
    },
    {
        label: "Categorical Columns",
        name: "categorical_columns",
        type: "multi-select",
        placeholder: "Select categorical columns (e.g. gender, region)",
        optionsSource: "columns", 
        required: false,
    },
    {
        label: "Numerical Columns",
        name: "numerical_columns",
        type: "multi-select",
        placeholder: "Select numeric columns (e.g. age, income)",
        optionsSource: "columns",
        required: false,
    },
    {
        label: "Date Columns",
        name: "date_columns",
        type: "multi-select",
        placeholder: "Select columns with date/time values (if any)",
        optionsSource: "columns",
        required: false,
    },
    {
        label: "Unique Columns",
        name: "unique_columns",
        type: "multi-select",
        placeholder: "Select columns that uniquely identify each record (e.g. ID, email)",
        optionsSource: "columns",
        required: false,
    }
    ];
    const formChange=(e, key, option=false)=>{
        if (option) return setFormData({...formData,[key]:e})
        return setFormData({...formData,[key]:e.target.value})
    }

    // const [mount, setMount]= useState(false)
    const daysOfWeek = [
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ];

    const {NotifyError, NotifySuccess}= useToast()
    const monthsOfYear = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const {isDate}= timeStampControl
    const [first5rows, setFirst5Rows]= useState([])
    const years = Array.from({ length: 2028 - 2000 }, (_, i) => 2000 + i);

    const dates_term=[...daysOfWeek, ...monthsOfYear, ...years]
    const MAX_SIZE = 10 * 1024 * 1024;

    const previewPic = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

        if (file.size > MAX_SIZE) {
            e.target.value = "";    
            e.preventDefault();     
            NotifyError("File too large! Maximum allowed is 10MB.");
            return;
        }
      const value = e.target.value;
      if (!file || !value) return;

      const fileName = getFileName(value || "").toLowerCase();

      const processParsed = (headers = [], rows = []) => {
        const categorical_columns = [];
        const numerical_columns = [];
        const unique_columns = [];
        const date_columns = [];
        const non_placed_columns = [];

        const firstRow = rows[0] || {};

        for (let index = 0; index < headers.length; index++) {
          const element = headers[index];
          if (!element) continue;
          if (index === 0 && element.toLowerCase().includes("id")) {
            unique_columns.push(element);
            continue;
          }
          const firstVal = firstRow?.[element];

          if (dates_term.includes(firstVal)) {
            date_columns.push(element);
            continue;
          }
          const num = Number(firstVal);
          if (firstVal !== undefined && firstVal !== "" && !Number.isNaN(num)) {
            numerical_columns.push(element);
            continue;
          }
          if (isDate(firstVal)) {
            date_columns.push(element);
            continue;
          }

          categorical_columns.push(element);
        }
        setFirst5Rows(rows)
        // console.log({categorical_columns, headers, numerical_columns, categorical_columns, date_columns,numerical_columns})
        setMultiselect({
          all_columns:headers,
          columns: headers,
          numerical_columns,
          categorical_columns,
          non_placed_columns,
          date_columns,
          unique_columns,
        });
      };

      // quick preview url for UI
    //   setPreviewSrc(URL.createObjectURL(file));
      setFileData({ file, value });

      if (fileName.endsWith(".csv")) {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const rows = results.data.slice(0, 5);
            const headers = results.meta.fields || Object.keys(rows[0] || {});
            processParsed(headers, rows);
          },
        });
        return;
      }

      if (fileName.endsWith(".xlsx") || fileName.endsWith(".xls")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const arrayBuffer = event.target.result;
          try {
            const workbook = XLSX.read(arrayBuffer, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { defval: "" });
            const headers = Object.keys(jsonData[0] || {});
            const rows = jsonData.slice(0, 5);
            processParsed(headers, rows);
          } catch (err) {
            console.error("XLSX parse error", err);
            processParsed([], []);
          }
        };
        reader.readAsArrayBuffer(file); 
        return;
      }
    };

    const requestChatGPTQuery= async()=>{
        // const {error:fileError}= formValidator(formData, imageUrl?.value)
        // if (fileError) {
        //     consolelog({fileError})
        //     throw {error:fileError}
        // }
        
        const { url, delete_token, error: imageError } = await uploadFile()
        
        if (imageError) {
            console.log({imageError})
            throw {error:imageError}
        }

        const body={...multiselect, ...formData, file_url:url, sample_data:first5rows}
        return await postData({path:API_ENDPOINTS.MAKE_A_REQUEST,body})
    }
    // const router= useRouter()

    const {mutate:requestChatGPT, isPending:isLoading}=useMutation({
    mutationFn: ()=>requestChatGPTQuery(),
    onError:({error})=>{
        console.log({error})
        return NotifyError(error.message || 'Could not get data')
    },
    onSuccess:({data})=>{
        // consolelog({mutation:data})
        // data:{request, visuals_sugg}
        NotifySuccess('Done. Request Gotten. Wait 2 secs.')
        setTimeout(() => {
            window.location.href=PAGE_ROUTES.GET_ONE_VISUAL(data?.data?._id)      
        }, 2000);
        return
    }})
    return(
      <section id="form" className="overflow-x-hidden  px-10 tablet:px-5">
            <div>
                <h2 className="text-center mt-6">Let vAIsualize be your personal data assistant</h2>
            </div>
            <div className="grid grid-cols-2 tablet:grid-cols-1 pt-4 pb-5 gap-10">
                <div className="w-full">
                    <p className="text-left text-sm text-gray-600 mb-3">DataSet Info</p>
                    <div>
                        <div className="w-full flex flex-col gap-5">
                            {datasetInfo.map(({label, name, type, options, placeholder},ind)=>
                                <Fragment key={ind}>
                                    {type==='text'?
                                    <div>
                                        <p>{label}</p>
                                        <input type={type} onChange={(e)=>formChange(e, name)}
                                            value={formData[name] || ''} 
                                            className="border-gray-400 py-2.5 px-3 gap-x-2 w-full border rounded-md text-sm tablet:text-base  py-1 border-gray-600 px-3"
                                            placeholder={placeholder}
                                        />
                                    </div>:
                                    type==='select'?
                                    <div className="w-full">
                                        <p>{label}</p>
                                        <SelectOption
                                            options={
                                                options
                                            }
                                            value={formData[name] || ''} 
                                            onChange={(e)=>formChange(e,name, true)}
                                            label={label}
                                        />
                                    </div>:
                                    <div>
                                        <p>{label}</p>
                                        <textarea value={formData[name] || ''} 
                                            onChange={(e)=>formChange(e,name)}
                                            className="w-full h-[100px] border-gray-400 border rounded-md text-sm tablet:text-base  py-1 border-gray-600 px-3"
                                            placeholder={placeholder}/>
                                    </div>
                                    }
                                </Fragment>
                            )}
                        </div>
                        <div className="relative">
                            <p className="text-[14px] font-medium mb-2">{'Upload Dataset(CSV/Excel)'}</p>
                            <button onClick={(e)=>{
                                e.preventDefault()
                                document.querySelector('#img').click()
                            }} className="flex gap-x-2 rounded-md bg-white border border-[#0D6EFD] p-2">
                                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M7 12V3.85L4.4 6.45L3 5L8 0L13 5L11.6 6.45L9 3.85V12H7ZM0 16V11H2V14H14V11H16V16H0Z" fill="#4AA5FF"/>
                                </svg>
                                <p className="text-base tablet:text-sm">{!fileData?.value?'Add file':'Edit file'}</p>
                            </button>
                            {fileData?.value? 
                                <p className="absolute left-[40%] bottom-0 text-sm font-medium w-[200px]">{getFileName(fileData?.value)}</p>
                            :null
                            }
                            <input type="file" accept=".csv, .xlsx" name="coverImg" 
                                className="hidden" id="img"
                                onChange={(e)=>previewPic(e)}
                            />
                        </div>
                    </div>
                </div>
                {!!fileData?.value && 
                <ColumnSetup multiselect={multiselect} 
                    setMultiselect={setMultiselect}
                    first5rows={first5rows}
                />}
            </div>
            <div className="pb-6">
                <LoadButton onClick={()=>requestChatGPT()}
                className="bg-blue-500 py-2 px-6 rounded-md text-white" 
                    disabled={!formData.title  || !formData.goal  || !formData.description || !fileData?.value}                    
                    isLoading={isLoading}>
                    Submit 
                </LoadButton>
            </div>
      </section>
    )
}
function ColumnSetup({multiselect, first5rows, setMultiselect}){
    const [openModal, setOpenModal]= useState(null)

    const addColumn = ({col, cat}) => {
        console.log({cat, col})
      setMultiselect(prev => {
        const next = { ...prev };
        
        next[cat] = [...prev[cat], col];
        next.columns= [...prev.columns, col]
        return next;
      });
      setOpenModal(null)
    };
    const excludeColumn = ({col, cat}) => {
      setMultiselect(prev => {
        const next = { ...prev };
        next.columns = prev.columns.filter(c => c !== col);
        next[cat]=prev[cat].filter(c => c!==col)
        return next;
      });
      setOpenModal(null)
    };

    const switchColumn = ({col, cat, ex_cat}) => {
      setMultiselect(prev => {
        const next = { ...prev };
        next[ex_cat]=prev[ex_cat].filter(c => c !== col)
        next[cat] = [...prev[cat], col];

        return next;
      });
      setOpenModal(null)
    };
    // console.log({multi_select})
    return (
        <div>
            <div className="">
                <p className="text-left text-sm text-gray-600 mb-3">Column Setup</p>
                <div>
                    <p className="text-sm">Note that:</p> 
                    <p className="text-xs italic">{"1) IDs alone may not always represent uniqueness accurately. You can combine fields such as first name and last name into a single unique identifier) before uploading. You may also upload a separate CSV or Excel file if you have preprocessed this combination."}</p>
                    <p className="text-xs italic">{"2) For accurate processing, please ensure all numerical fields are converted to plain numbers before uploading.Remove any attached units (e.g., 'kg', '%', '$') or symbols to maintain consistency."}</p>
                    
                </div>
                <div className="gap-5 flex flex-col mt-4">
                    {multiselect?.all_columns?.map((col,ind)=>{
                        let belonged_category=''

                        for (const key of Object.keys(multiselect).slice(2)) {
                            if(multiselect[key].includes(col)){
                                belonged_category=key
                                break
                            }   
                        }
                        // for (let index = 0; index < Object.keys(multi_select).length; index++) {
                        //     const element = multi_select[index];
                        //     console.log({element, multi_select})
                        //     if(element.includes(belonged_category)){
                        //         belonged_category=element
                        //         break
                        //     }   
                        // }
                        return(
                        <div key={ind} className="flex justify-between items-center">
                            <div className="flex flex-col w-[120px]">
                                <p >{col}</p>
                                <p className="text-sm text-gray-700 truncate">{first5rows[0][col]}</p>
                            </div>
                            <div className="flex flex-col justify-end items-end">
                                <div>
                                    <p>{belonged_category.replace('_', ' ')}</p>
                                </div>
                                <div className="flex gap-x-2 items-center">
                                    <button onClick={()=>{
                                        setOpenModal({
                                            type:'switch',
                                            value:belonged_category, label:col,
                                        })
                                    }} className="bg-blue-600 text-white text-sm px-2 py-1.5 rounded-lg">switch</button>
                                    {multiselect?.columns?.includes(col)?
                                        <button 
                                            onClick={()=>{
                                                excludeColumn({col, cat:belonged_category})
                                            }}
                                            className="bg-red-600 text-white text-sm px-2 py-1.5 rounded-lg">exclude</button>:
                                        <button  className="bg-emerald-600 text-white text-sm px-2 py-1.5 rounded-lg" 
                                        onClick={()=>{
                                            setOpenModal({
                                                label:col, type:'add'
                                            })

                                        }}>include</button>
                                    }
                                </div>
                            </div>
                            
                        </div>
                        )
                    })}
                </div>
            </div>
            {openModal? 
            <SelectColumn onClose={()=>setOpenModal(null)}
                value={openModal?.value} label={openModal?.label}
                options={multiselect.columns} 
                first5rows={first5rows}
                onChange={({col, cat, ex_cat})=>{
                    if(openModal.type==='add'){
                        addColumn({col,cat})
                    }
                    else{
                        switchColumn({col, cat, ex_cat})
                    }
                }}
            />:null}
        </div>
    )
}
function SelectColumn({onClose, onChange, label, options, value}){
    const [option, setOption]= useState(value)
    return(
    <ModalLayout onClose={onClose}>
        <div
            onClick={(e)=> e.stopPropagation()} 
            className="bg-white rounded-md px-10 py-10 text-center w-fit"
        >
            <p className="mb-2">Change the kind of column for {label}</p>
            <SelectOption options={[
                'categorical_columns','numerical_columns',
                'date_columns','unique_columns', 'non_placed_columns'
            ]} 
                value={option} 
                label={label}
                onChange={(e)=>{
                    setOption(e)
                }}
            />
            <div className="flex justify-center mt-4">
                <button onClick={()=>onChange(
                    {col:label, cat:option, ex_cat:value})
                } disabled={!option}
                className="bg-blue-600 text-white text-sm py-2 px-3 rounded-md ">
                    Update
                </button>
            </div>

        </div>
    </ModalLayout>)
}