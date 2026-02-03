import { AppLayout, DataFetch, InputHelper, LoadButton, ProgressBar} from "@/components";
import { ModalLayout } from "@/components/modal";
import { API_ENDPOINTS, consolelog, PAGE_ROUTES, timeStampControl } from "@/configs";
import ProjectDataContextComponent, { ProjectDataContext } from "@/context/useProjectDataContext";
import { useHttpServices, useMultiFileInputs, useToast } from "@/hooks";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/router";
import { use, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { DataTable } from "@/components/table";

export default function Create(){
    
    return(
        <div>
            <ProjectDataContextComponent>
                <CreateProjects/>
            </ProjectDataContextComponent>
        </div>
    )
}

function CreateProjects(){
    const router = useRouter()

    const {getProtectedData}= useHttpServices()
    const {formData, step, setStep, fr}= useContext(ProjectDataContext)

    const getProjectDraft= async()=>{
        return await getProtectedData({path:API_ENDPOINTS.GET_PROJECT_DRAFT_DATA(router?.query?.id)})
    }
    const {isLoading:draftLoading, error, data:project_data,isError}= useQuery(
      {
        queryKey:['project-draft-'+router?.query?.id],
        queryFn:()=>getProjectDraft(),
        refetchOnWindowFocus: false,
        refetchOnMount:true,
        retry:false, enabled:!!router?.query?.id
      }
    )
    const fileMaxLength=5
    const { 
        fileData,setFileData,
        uploadImages
    }= useMultiFileInputs(fileMaxLength)

    return(
    <DataFetch isLoading={draftLoading} 
         loadingComponent={
            <div className="w-screen bg-stone-100 h-screen"></div>
         }
         errorMsg={error?.message} isError={isError}>
        <div className="h-screen w-screen overflow-y-hidden">
            <div className="flex items-center justify-between px-7 py-3 border-b">
                <div className="flex items-center gap-x-[5px]">
                    <img className="w-[35px] h-[35px]" src="/images/webbi.png" alt="webbi logo" />
                    <h1 className=" text-xl font-bold tracking-tight">WebBi</h1>
                </div>
                <button className="bg-primary px-5 py-2 rounded-lg text-white" disabled={true}>Save Progress</button>
            </div>
            <div className="pt-3 bg-white">
                <StepProgress project_name={project_data?.project?.title}/>

            </div>
            <section className="">
                {step===2?
                    <SecondStep setFileData={setFileData} fileData={fileData} 
                        fileMaxLength={fileMaxLength}
                        uploadImages={uploadImages}
                    />:
                step===3?
                    <ThirdStep/>:
                    <></>
                }
            </section>
            
        </div>
    </DataFetch>
    
    )
}

function StepProgress({project_name}){
    const {step}= useContext(ProjectDataContext)
    const stepLabels=['Upload Datasets','Prepare & Model', 'Chart Setup']
    return(
        <div>
            <div className="flex items-center gap-x-[4px] tracking-wide text-sm px-7 mb-3">
                <p className="text-gray-500">{project_name+' '}</p>
                {stepLabels.map((label,ind)=>
                    <p key={ind} className="text-gray-500" style={(ind+2)===step?{color:'#000000'}:(ind+2)>step?{visibility:'hidden'}:{}}>
                        <span className="text-gray-500">{'/ '}</span>{'Step '+(ind+2)+' : '+label+' '}
                    </p>
                )}
            </div>
            <ProgressBar currentStep={step} totalSteps={4} extraStyle={{height:'2px', borderRadius:'0'}}/>
        </div>
    )
}

function SecondStep({fileData, setFileData, uploadImages, fileMaxLength}){
    const {dataCollection, setDataCollection, setStep}= useContext(ProjectDataContext)
    const data_source_options=[
        {img:'/upload-blue.svg', label:'Upload File', desc:'Support for .csv, xlsx, xls, or JSON files.'},
        {img:'/sheets.svg', label:'Google Sheets',disabled:true, desc:'Import sheets directly from your Google.'},
        {img:'/sql.svg', label:'Direct SQL', disabled:true,desc:'Connect to MySQL, PostgresSQL or SQL Server.'},
        {img:'/form.svg', label:'Forms', disabled:true,desc:'Automatic sync from a customized form.'}
    ]
    
    const daysOfWeek = [
        "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
    ];

    const monthsOfYear = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const years = Array.from({ length: 2028 - 2000 }, (_, i) => 2000 + i);

    const dates_term=[...daysOfWeek, ...monthsOfYear, ...years]
    const MAX_SIZE = 10 * 1024 * 1024;

    const getFileName=(path) => {
        return path.replace(/^.*[\\\/]/, '');
    };
    const {NotifyError, NotifySuccess}= useToast()
    const {isDate, formatBytes, normalizeMongoFields}= timeStampControl
    const previewPic = (e,ind) => {
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

      const processParsed = (headers = [], rows = [], fileName, row_length) => {
        // const categorical_columns = [];
        // const numerical_columns = [];
        // const unique_columns = [];
        // const date_columns = [];
        // const non_placed_columns = [];
        const col_data_type=[]
        const firstRow = rows[0] || {};



        for (let index = 0; index < headers.length; index++) {
          const element = headers[index];
          if (!element) continue;
          if (index === 0 && element.toLowerCase().includes("id")) {
            col_data_type.push({col:element, data_type:'identifier'});
            continue;
          }
          const firstVal = firstRow?.[element];

          if (dates_term.includes(firstVal)) {
            col_data_type.push({col:element, data_type:'date'});
            continue;
          }
          const num = Number(firstVal);
          if (firstVal !== undefined && firstVal !== "" && !Number.isNaN(num)) {
            col_data_type.push({col:element, data_type:'number'});
            continue;
          }
          if (isDate(firstVal)) {
            col_data_type.push({col:element, data_type:'date'});
            continue;
          }
          col_data_type.push({col:element, data_type:'string'});
        }
        let ex_collections= [...dataCollection]

        // setMultiselect({
        //   all_columns:headers,
        //   columns: headers,
        //   numerical_columns,
        //   categorical_columns,
        //   non_placed_columns,
        //   date_columns,
        //   unique_columns,
        // });
        ex_collections[ind]={
            rows,row_length, 
            col:{
                all_columns:headers,
                columns: headers,
            }, 
            fileName, size:file.size,
            col_data_type
        }
        setDataCollection(ex_collections)
      };

      let new_file_data=[...fileData, {file, value, fileName}]
      setFileData(new_file_data);

      if (fileName.endsWith(".csv")) {
        Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const row_length= results.data.length
            const rows = results.data.slice(0, 5);
            const headers = results.meta.fields || Object.keys(rows[0] || {});
            processParsed(headers, rows, fileName, row_length);
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
            const row_length= jsonData.length
            const rows = jsonData.slice(0, 5);
            processParsed(headers, rows, fileName, row_length);
            } catch (err) {
            console.error("XLSX parse error", err);
            processParsed([], []);
            }
        };
        reader.readAsArrayBuffer(file); 
        return;
    }
    if (file.name.endsWith(".json")) {
        const reader = new FileReader();

        reader.onload = (event) => {
            try {
            // Parse the full JSON file
            const jsonData = JSON.parse(event.target.result);

            if (!Array.isArray(jsonData) || jsonData.length === 0) {
                console.warn("Empty or invalid JSON file");
                processParsed([], [], file.name, file.size);
                return;
            }
            const headers = Object.keys(jsonData[0]);
            const row_length=jsonData.length

            const rows = jsonData.slice(0, 5).map(normalizeMongoFields);
            processParsed(headers, rows, file.name, file.size, row_length);

            } catch (err) {
            console.error("JSON parse error", err);
            processParsed([], [], file.name, file.size);
            }
        };

        reader.readAsText(file);
        return;
    }

    };
    const deleteDataCollItem=(indexToDelete)=>{
        setDataCollection(prev =>
            prev.filter((_, index) => index !== indexToDelete)
        );
    }
    return(
    <div>
        <div className="flex items-start gap-x-7 bg-gray-50 px-7 pt-2 pb-6">
            <div>
                <section className="bg-white mt-5 mb-3 rounded-md shadow-lg border">
                    <div className="px-3 py-3 border-b flex justify-between items-center ">
                        <div className="flex items-center gap-x-2">
                            <img src="/svg/database.svg" alt="database" className="w-5 h-5"/>
                            <p className="text-lg font-semibold">Attached Datasets</p>
                        </div>
                        <p className="text-[13px] font-semibold px-2 py-1 rounded-lg bg-gray-100">{dataCollection.length}/{fileMaxLength}</p>
                    </div>
                    <div className="h-[250px]">
                        {!dataCollection.length?
                            <div className="h-full flex items-center justify-center flex-col">
                            <div>
                                <img src="/svg/folder.svg" alt="folder" className="w-9 h-9"/>
                            </div>

                            <div className="w-[400px] px-10 tablet:w-fit text-center">
                                <p className="text-lg my-2 font-semibold">No datasets added yet</p>
                                <p className="text-sm text-gray-500">Upload a file to connect a data source to see it listed here. <br/>You can add multiple sources.</p>
                            </div>
                            </div>
                        :
                            <div className="p-2 h-full overflow-y-auto justify-center space-y-1.5">
                                {dataCollection.map(({rows, col, fileName, size},ind)=>
                                    <div className="text-sm py-2 px-3 flex items-center rounded-md border justify-between" key={ind}>
                                        <div className="flex items-center gap-x-2">
                                            <div className="p-2 bg-gray-100 rounded-md">
                                                <img src={
                                                    `/svg/extension/${fileName.endsWith('.xlsx')?'table.svg':
                                                    fileName.endsWith('.csv')?'sheets.svg':
                                                    fileName.endsWith('.json')?'json.svg':
                                                    fileName.endsWith('.xls')?'table.svg':''}`} alt="file extension" className="w-4 h-4"/>
                                            </div>
                                            <div>
                                                <p>{fileName}</p>
                                                <p className="text-xs text-gray-500">{formatBytes(size)}</p>
                                            </div>
                                        </div>
                                        <button onClick={()=>deleteDataCollItem(ind)}>
                                            <img src="/svg/bin-dark.svg" className="w-5 h-5"/>
                                        </button>
                                    </div>
                                )}
                            </div>
                        }
                    </div>
                </section>
                <div className="mt-3.5 p-2 text-sm rounded-lg bg-primary/5 border border-primary/20 flex gap-3 items-start">
                    <img src="" alt="" />
                    <p className="text-gray-500">You can mix and match different data sources. Once added, we will help you join them in the next step.</p>
                </div>
            </div>
            <section>
                <div className="mt-4">
                    <h3 className="text-2xl font-semibold">Select Data Source</h3>
                    <p className="mt-1 mb-4 text-gray-600">Choose where your data lives to begin your lives. We support various file types and direct connections.</p>
                </div>
                <div className="grid grid-cols-3 gap-6 mt-4">
                    {data_source_options.map(({img, label,desc, disabled},ind)=>
                        <button onClick={(e)=>{
                            if(label==='Upload File'){
                                e.preventDefault()
                                if(dataCollection.length>=5){
                                    return NotifyError('You cannot upload more than 5 datasets.')
                                }
                                document.querySelector('#img-'+(dataCollection.length)).click()
                                // .click()
                            }
                        }} 
                        disabled={disabled} key={ind} 
                        className={"relative flex flex-col items-center justify-center border shadow-lg bg-white  rounded-lg px-3 py-4 "+(disabled?' ':' hover:border-primary hover:border-2 ')}>
                            <div className="mb-2">
                                <img src={'/svg'+img} alt={img} className="w-8 h-8"/>
                            </div>
                            <div className="text-center">
                                <p className="text-lg font-semibold mb-1.5">{label}</p>
                                <p className="text-gray-500 text-sm">{desc}</p>
                            </div>
                            {disabled?
                            <div className="bg-gray-200 p-2 absolute top-2 rounded-md w-fit right-2">
                                <p className="text-[10px] font-semibold">COMING SOON</p>
                            </div>:null}
                        </button>
                    )}
                </div>
                <div className="hidden">
                    {[0,1,2,3,4].map((ind)=>
                        <input type="file" accept=".csv, .xlsx, .xls, .json" name="coverImg" 
                            className="hidden" id={"img-"+ind}
                            onChange={(e)=>previewPic(e,ind)}
                            key={ind}
                        />
                    )}
                </div>
                
            </section>
        </div>
        <div className="border-t bg-white px-7 flex justify-between  h-full flex-1 py-2 items-center">
            <Link href={PAGE_ROUTES.DASHBOARD} className="hover:underline w-fit items-center gap-x-2 py-2 rounded-lg ">
                <p>Back: Project Info</p>
            </Link>
            <button disabled={!dataCollection.length} onClick={()=>setStep(3)} className="hover:bg-primary/90 flex items-center bg-primary gap-x-2 text-white px-8 py-2 rounded-lg ">
                <p className="">Next : Prepare Data</p>
                <img src="/svg/arrow-back-white.svg" alt="" 
                    style={{transform: 'rotate(180deg)'}}
                />
            </button>
        </div>
    </div>
    )
}

function ThirdStep(){
    const {dataCollection, setDataCollection, setStep, step}= useContext(ProjectDataContext)
    const [activeColl, setActiveColl]= useState(0)
    return(
        <section>
            <div className="flex items-start gap-x-7 bg-gray-50 px-7 pt-7 pb-6">
                <div className="bg-white p-3 rounded-md shadow-md ">
                    <p className="text-lg font-semibold mb-3">DATASETS</p>
                    <div className="">
                        <div className="space-y-3 h-fit">
                            {dataCollection.map(({fileName},ind)=>
                                <button onClick={()=>setActiveColl(ind)} className={"w-[300px] text-sm py-2 px-4 flex items-center rounded-md justify-between "+(activeColl===ind?'bg-blue-50':'')} key={ind}>
                                    <div className="w-fit flex items-center gap-x-2 ">
                                        <div className="rounded-md">
                                            <img src={
                                                `/svg/extension/${fileName.endsWith('.xlsx')?'table.svg':
                                                fileName.endsWith('.csv')?'sheets.svg':
                                                fileName.endsWith('.json')?'json.svg':
                                                fileName.endsWith('.xls')?'table.svg':''}`} alt="file extension" className="w-4 h-4"/>
                                        </div>
                                        <div className="text-left">
                                            <p style={activeColl===ind?{fontWeight:500, color:'#000000'}:{}} className="text-gray-500">{fileName}</p>
                                            {activeColl===ind?<p className="text-xs text-primary">{'ACTIVE'}</p>:null}
                                        </div>
                                    </div>
                                </button> 
                            )}
                        </div>
                    </div>
                </div>   
                <section style={{flexGrow:1, overflowX:'auto'}} className='h-[250px]'>
                    <DataPreview activeColl={activeColl}/>
                    <DataRelationship/>
                </section>
            </div>
            
            <div className="border-t bg-white px-7 flex justify-between  h-full flex-1 py-2 items-center">
                <button onClick={()=>setStep(2)} className="hover:underline w-fit items-center gap-x-2 py-2 rounded-lg ">
                    <p>Back: Add Datasets</p>
                </button>
                <button onClick={()=>setStep(4)} className="hover:bg-primary/80 flex items-center bg-primary gap-x-2 text-white px-8 py-2 rounded-lg ">
                    <p className="">Next : Customize Charts</p>
                    <img src="/svg/line-white.svg" alt="" 
                        className="w-4 h-4"
                    />
                </button>
            </div>
        </section>
    )
}

function DataPreview({activeColl}){
    const {dataCollection, setDataCollection}= useContext(ProjectDataContext)
    const activeData=useMemo(()=>{
        return dataCollection[activeColl]
    },[activeColl])

    const modifyColumn=({mod_type, data})=>{
        if(mod_type==='add'){
            return addColumn(data)
        }
        if(mod_type=='switch'){
            return switchColumn(data)
        }
        if(mod_type==='exclude'){
            return excludeColumn(data)
        }
        return
    }
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

    const excludedColumns=useMemo(()=>{
        const excluded=activeData?.col?.all_columns?.filter((col)=>!activeData?.col?.columns.includes(col))
        return excluded || []
    },[activeData?.col?.columns])
    
    return(
        <section>
            <div className="flex items-end justify-between">
                <p className="text-lg text-gray-600">Data Preview: <span className="text-black uppercase">{activeData?.fileName}</span></p>
                <div className="flex items-center text-[15px] gap-x-4 pr-4">
                    <p>Rows: <span>{activeData?.row_length}</span></p>
                    <p>Columns: <span>{activeData?.col?.all_columns?.length}</span></p>
                </div>
            </div>
            <div className="">
                <DataTable
                    excludedColumns={excludedColumns} 
                    // excludeColumn={({mod_type,data, type})=>modifyColumn({mod_type, data, type})} 
                    modifyColumn={({mod_type,data,type})=>modifyColumn({mod_type, data, type})} 
                    tableCols={activeData?.col?.all_columns} 
                    data={activeData?.rows}
                    data_type_collection={activeData?.col_data_type}
                />
            </div>

        </section>

    )
}
function DataRelationship(){
    return(
        <section>
            
        </section>

    )
}