import { useFileInput, useHttpServices, useToast } from "@/hooks";
import { Fragment, useEffect, useState } from "react"
import { LoadButton, SelectMultiple, SelectOption } from "..";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { API_ENDPOINTS, consolelog, PAGE_ROUTES, timeStampControl } from "@/configs";
import ModalLayout from "../modal/modalLayout";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/router";
import Link from "next/link";

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
            maxlength:55
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
            label: "Mode",
            name: "mode",
            type: "select",
            placeholder: "Select Display",
            options: ["Public", "Private"],
            required: true,
        },
        {
            label: "Display Status",
            name: "display",
            type: "select",
            placeholder: "Display Mode",
            options: ["Public", "Private"],
            required: true,
        },
        {
            label: "Description",
            name: "description",
            type: "textarea",
            placeholder: "Briefly describe what the dataset is about...",
            required: true,
            maxlength:180
        },
        {
            label: "Goal / Objective",
            name: "goal",
            type: "textarea",
            placeholder: "What do you want to achieve or analyze with this dataset?",
            required: true,
            maxlength:300
        }
    ];
    const [multiselect, setMultiselect]= useState({
        unique_columns:[],columns:[], all_columns:[],
        categorical_columns:[],numerical_columns:[],
        date_columns:[], non_placed_columns:[]
    })
    
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
      <section id="form" className="bg-[#F4E5FD] overflow-x-hidden py-[60px] px-10 tablet:px-5">
        <div className="shadow-xl bg-[#EEF4FA] rounded-[33px] pb-6">
            <div className="rounded-t-[33px] herobtn px-6 py-5 flex items-center gap-x-1.5">
                <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.6875 4.05513V13.0616C10.6875 13.7184 10.1568 14.2491 9.5 14.2491C8.84316 14.2491 8.3125 13.7184 8.3125 13.0616V4.05513L5.58867 6.77895C5.1248 7.24282 4.37148 7.24282 3.90762 6.77895C3.44375 6.31509 3.44375 5.56177 3.90762 5.0979L8.65762 0.3479C9.12148 -0.115967 9.8748 -0.115967 10.3387 0.3479L15.0887 5.0979C15.5525 5.56177 15.5525 6.31509 15.0887 6.77895C14.6248 7.24282 13.8715 7.24282 13.4076 6.77895L10.6875 4.05513ZM2.375 13.0616H7.125C7.125 14.3715 8.19004 15.4366 9.5 15.4366C10.81 15.4366 11.875 14.3715 11.875 13.0616H16.625C17.935 13.0616 19 14.1266 19 15.4366V16.6241C19 17.934 17.935 18.9991 16.625 18.9991H2.375C1.06504 18.9991 0 17.934 0 16.6241V15.4366C0 14.1266 1.06504 13.0616 2.375 13.0616ZM16.0312 16.9209C16.2675 16.9209 16.494 16.8271 16.661 16.6601C16.828 16.4931 16.9219 16.2665 16.9219 16.0303C16.9219 15.7941 16.828 15.5676 16.661 15.4006C16.494 15.2335 16.2675 15.1397 16.0312 15.1397C15.795 15.1397 15.5685 15.2335 15.4015 15.4006C15.2345 15.5676 15.1406 15.7941 15.1406 16.0303C15.1406 16.2665 15.2345 16.4931 15.4015 16.6601C15.5685 16.8271 15.795 16.9209 16.0312 16.9209Z" fill="white"/>
                </svg>
                <p className="font-semibold text-white text-xl">vAIsualize - Upload Your Data</p>
            </div>
            <div>

            </div>
            <div className="grid grid-cols-1 px-6 tablet:grid-cols-1 pt-4 pb-5 gap-10">
                <div className="w-full ">
                    <p className="text-left text-sm font-semibold mb-5 text-xl text-black  uppercase mt-3">DataSet Info</p>
                    <div>
                        <div className="w-full flex flex-col gap-5 grid grid-cols-2 gap-x-5 tablet:grid-cols-1">
                            {datasetInfo.map(({label, name, type, options, placeholder, maxlength},ind)=>
                                <Fragment key={ind}>
                                    {type==='text'?
                                    <div className={ind===0?' col-span-2 ':''}>
                                        <p className="font-medium">{label}</p>
                                        <input type={type} onChange={(e)=>formChange(e, name)}
                                            value={formData[name] || ''} 
                                            className=" py-3 px-3 gap-x-2 w-full mt-2.5 rounded-md text-sm tablet:text-base "
                                            placeholder={placeholder}
                                            maxLength={maxlength}
                                        />
                                    </div>:
                                    type==='select'?
                                    <div className="w-full">
                                        <p className="font-medium">{label}</p>
                                        <SelectOption
                                            options={
                                                options
                                            }
                                            // optionClass=" py-3 px-3 gap-x-2 w-full mt-2.5 rounded-md text-sm tablet:text-base"
                                            value={formData[name] || ''} 
                                            onChange={(e)=>formChange(e,name, true)}
                                            label={label}
                                        />
                                    </div>:
                                    <div>
                                        <p className="font-medium">{label}</p>
                                        <textarea value={formData[name] || ''} 
                                            onChange={(e)=>formChange(e,name)}
                                            className="w-full p-3 h-[100px] rounded-md gap-x-2 w-full mt-2.5 rounded-md text-sm tablet:text-base "
                                            placeholder={placeholder}
                                            maxLength={maxlength}    
                                        />
                                    </div>
                                    }
                                </Fragment>
                            )}
                        </div>
                        <div className="relative py-8 rounded-md border bg-white mt-8 border-dashed border-[#8F34E9] flex flex-col items-center justify-center">
                            <img src="/svg/upload-purple.svg" alt="upload-purple" className="w-10 h-10"/>
                            {fileData?.value? 
                                <p className="text-[18px] font-medium mb-2">{getFileName(fileData?.value)}</p>
                            :  <>
                            
                                <p className="text-[18px] font-medium mb-2">{'Upload your file here'}</p>
                            </>
                            
                            }
                            <p className="text-[14px] font-medium text-gray-600">{'(CSV/Excel)'}</p>                                

                            <button onClick={(e)=>{
                                e.preventDefault()
                                document.querySelector('#img').click()
                            }} className="flex gap-x-2 rounded-md mt-8 p1 py-3.5 px-12 rounded-md items-center">
                                <img src="/svg/link-attached.svg" className="w-5 h-5"/>
                                <p className="text-base text-white">{!fileData?.value?'Add file':'Change file'}</p>
                            </button>
                            
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
                />
                } 
            </div>
            <div className="py-6 px-5">
                <div className="px-5 relative">
                    <LoadButton onClick={()=>requestChatGPT()}
                    activeClass=" button1 "
                    className={"font-medium px-6 text-lg text-white h-full w-full py-3.5"} 
                        disabled={
                            !formData.title  || !formData.goal  || !formData.description 
                            || !fileData?.value || !multiselect.columns.length 
                        }                    
                        isLoading={isLoading}>
                        Start Analyzing
                    </LoadButton>
                </div>
            </div>
            <div className="px-5">
                <div className="rounded-xl bg-[#FFE9F6] py-3.5 px-5 border border-[#E34AA5] flex items-center justify-between ">            
                    <div className="flex items-center gap-x-2">
                        <img src="/svg/info.svg" className="w-5 h-5" />
                        <p>NEED HELP? <span>Contact our AI data experts</span></p>  
                    </div>
                    <Link href={API_ENDPOINTS.MY_DETAILS.WHATSAPP} className="p2 rounded-lg px-4 py-2.5">
                        <p className="text-white">Get Assistance</p>
                    </Link>
                </div>
            </div>

        </div>
        
      </section>
    )
}
function ColumnSetup({multiselect, first5rows, setMultiselect, onClose=()=>null}){
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

    const datasetStructureFields = [
    {
        label: "Columns (Field Names)",
        name: "columns",
        type: "multi-input",
        placeholder: "Enter all column names in your dataset",
        required: true,
    },
    {
        label: "Unique Columns",
        name: "unique_columns",
        type: "multi-select",
        placeholder: "Select columns that uniquely identify each record (e.g. ID, email)",
        optionsSource: "columns",
        required: false,
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
        label: "Non Labelled Columns",
        name: "string_columns",
        type: "multi-input",
        placeholder: "Enter all column names in your dataset",
        required: true,
    },
    {
        label: "Excluded Columns",
        name: "excluded_columns",
        type: "multi-input",
        placeholder: "Enter all column names in your dataset",
        required: true,
    },
    ];
    return (
        <div className="bg-white rounded-lg py-3 ">
            <div>
                <p className="pl-5 text-left text-lg font-semibold pb-3 border-b">Column Setup</p>
                
                <div className="px-5 mt-4">
                    <p className="text-sm font-semibold">Note that:</p> 
                    <p className="text-sm ">{"1) IDs alone may not always represent uniqueness accurately. You can combine fields such as first name and last name into a single unique identifier) before uploading. You may also upload a separate CSV or Excel file if you have preprocessed this combination."}</p>
                    <p className="text-sm mt-3">{"2) For accurate processing, please ensure all numerical fields are converted to plain numbers before uploading. Remove any attached units (e.g., 'kg', '%', '$') or symbols to maintain consistency."}</p>
                    
                </div>
                <div className="gap-5 mt-4 grid-2-no-row-height justify-between">
                    {/* {multiselect?.all_columns?.map((col,ind)=>{
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
                                    <button disabled={!multiselect?.columns?.includes(col)} onClick={()=>{
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
                    })} */}
                    {datasetStructureFields.slice(1,6).map((cat,ind)=>{
                        const belonged_category=cat.name
                        // const columns_under_this_category= multiselect?.all_columns?.filter(())
                        return(
                        <div key={ind} className="px-5 griditem">
                            <div className="flex gap-x-1.5 items-center mb-2">
                                <div className="rounded-full w-3 h-3 p2"></div>
                                <p className="font-medium">{cat.label}</p>
                            </div>
                            <div className="max-h-[500px] overflow-y-auto">
                                <div className="flex-col flex gap-y-2">
                                    {multiselect[cat.name]?.map((col,ind)=>
                                    <div key={ind} className="flex justify-between bg-[#F5F5FA] px-4 py-3 rounded-lg items-center">
                                        <div className="flex flex-col w-[120px]">
                                            <p className="text-sm">{col}</p>
                                            <p className="text-sm text-gray-700 truncate">{first5rows[0][col]}</p>
                                        </div>
                                        <div className="flex flex-col">
                                            {/* <div>
                                                <p>{belonged_category.replace('_', ' ')}</p>
                                            </div> */}
                                            <div className="flex gap-x-2 items-center gap-y-4">
                                                <button disabled={!multiselect?.columns?.includes(col)} onClick={()=>{
                                                    setOpenModal({
                                                        type:'switch',
                                                        value:belonged_category, label:col,
                                                    })
                                                }} className="p1 text-white text-sm px-2 py-1.5 rounded-lg">switch</button>
                                                {multiselect?.columns?.includes(col)?
                                                    <button 
                                                        onClick={()=>{
                                                            excludeColumn({col, cat:belonged_category})
                                                        }}
                                                        className="p3 text-white text-sm px-2 py-1.5 rounded-lg">exclude</button>:
                                                    <button  className="p2 text-white text-sm px-2 py-1.5 rounded-lg" 
                                                    onClick={()=>{
                                                        setOpenModal({
                                                            label:col, type:'add'
                                                        })

                                                    }}>include</button>
                                                }
                                            </div>
                                        </div>
                                        
                                    </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        )
                    })}
                    <div className="px-5 griditem">
                        <div className="flex gap-x-1.5 items-center mb-2">
                            <div className="rounded-full w-3 h-3 bg-red-500"></div>
                            <p className="font-medium">{'Excluded Columns'}</p>
                        </div>
                        <div className="max-h-[500px] overflow-y-auto">
                            <div className="flex-col flex gap-y-2">
                                {multiselect?.all_columns?.filter((col)=>!multiselect?.columns.includes(col))?.map((col,ind)=>
                                <div key={ind} className="flex justify-between bg-[#F5F5FA] px-4 py-3 rounded-lg items-center">
                                    <div className="flex flex-col w-[120px]">
                                        <p className="text-sm">{col}</p>
                                        <p className="text-sm text-gray-700 truncate">{first5rows[0][col]}</p>
                                    </div>
                                    <div className="flex flex-col">
                                        {/* <div>
                                            <p>{belonged_category.replace('_', ' ')}</p>
                                        </div> */}
                                        <div className="flex gap-x-2 items-center gap-y-4">
                                            <button disabled={!multiselect?.columns?.includes(col)} onClick={()=>{
                                                setOpenModal({
                                                    type:'switch',
                                                    value:belonged_category, label:col,
                                                })
                                            }} className="invisible p1 text-white text-sm px-2 py-1.5 rounded-lg">switch</button>
                                            {multiselect?.columns?.includes(col)?
                                                <button 
                                                    onClick={()=>{
                                                        excludeColumn({col, cat:belonged_category})
                                                    }}
                                                    className="bg-[#E64545] text-white text-sm px-2 py-1.5 rounded-lg">exclude</button>:
                                                <button  className="p2 text-white text-sm px-2 py-1.5 rounded-lg" 
                                                onClick={()=>{
                                                    setOpenModal({
                                                        label:col, type:'add'
                                                    })

                                                }}>include</button>
                                            }
                                        </div>
                                    </div>
                                            
                                </div>
                                )}
                            </div>
                        </div>
                    </div>
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
                containerClass={' border'}
            />
            <div className="flex justify-center mt-4">
                <button onClick={()=>onChange(
                    {col:label, cat:option, ex_cat:value})
                } disabled={!option}
                className="p2 text-white w-full py-3 px-8 rounded-lg ">
                    Update
                </button>
            </div>

        </div>
    </ModalLayout>)
}