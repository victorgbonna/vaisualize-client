import { AppLayout, ColorPicker, DataFetch, InputHelper, LoadButton, ProgressBar, SelectOption, SelectOptionAsObjectValue} from "@/components";
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
import { HexColorPicker } from "react-colorful";
import { SampleChart } from "@/components/chart/D3Charts";

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
    const {step}= useContext(ProjectDataContext)

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
        <div style={step===3?{height:'fit-content'}:{}} className="h-screen w-screen overflow-y-hidden">
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
                    <FourthStep project_name={project_data?.project?.title}/>
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
    const {dataCollection, setDataCollection, setStep, relationships}= useContext(ProjectDataContext)
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

    const deleteDataCollItem=({fileName,ind:indexToDelete})=>{
        if(relationships.length){
            const hasRelationships= relationships.find(rel=>rel.from_table===fileName || rel.to_table===fileName)
            if(hasRelationships){
                NotifyError('You cannot delete this dataset as it has defined relationships. Please remove the relationships first.')
                return  
            }
        }
        setDataCollection(prev =>
            prev.filter((_, index) => index !== indexToDelete)
        );
        return
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
                                        <button onClick={()=>deleteDataCollItem({fileName,ind})}>
                                            <img src="/svg/bin-dark.svg" className="w-5 h-5 hover:scale-125 duration-200"/>
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
            <button onClick={
            ()=>{
                if(!dataCollection.length){
                    return NotifyError('Please add at least one dataset to proceed.')
                }
                setStep(3)
            }} className="hover:bg-primary/90 flex items-center bg-primary gap-x-2 text-white px-8 py-2 rounded-lg ">
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
        <section className="">
            <div className="flex items-stretch bg-gray-50">
               <div id='preview' className="bg-white pt-5">
                    <div className=" border-b pb-3 pl-4 w-full pr-4">
                        <p className="text-[19px] font-semibold mb-2">DATASETS</p>
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
                    <div className="px-4 mt-2">
                       <ActiveMapping/>
                    </div>
                </div>
                <section style={{flexGrow:1, overflowX:'auto'}} className="pl-4 pt-5 border-l bg-gray-50 h-full pr-8">
                    <DataPreview activeColl={activeColl}/>
                    {dataCollection.length>1?<div className="bg-white rounded-md p-3 border shadow-md mb-4">
                        <DataRelationship dataCollection={dataCollection}/>   
                    </div>:null}
                    
                     
                </section>
                
            </div>
            <div className="flex justify-between  border-t w-full py-3 items-center px-8 bg-white">
                <button onClick={()=>setStep(2)} className="hover:underline w-fit items-center gap-x-2 py-2 rounded-lg ">
                    <p>Back: Add Datasets</p>
                </button>
                <button onClick={()=>{
                    
                    setStep(4)
                }} className="hover:bg-primary/80 flex items-center bg-primary gap-x-2 text-white px-8 py-2 rounded-lg ">
                    <p className="">Next : Customize Charts</p>
                    <img src="/svg/line-white.svg" alt="" 
                        className="w-4 h-4"
                    />
                </button>
            </div>
           
        </section>
    )
}

function FourthStep({project_name}){
    const {NotifyError, NotifySuccess}= useToast()
    const {postProtectedData}= useHttpServices()
    const router= useRouter()

    const {dataCollection, setStep, step, defaults, setDefaults, chartColors, setChartColors, default_chart_colors, isDisabled, relationships}= useContext(ProjectDataContext)
    const forms=[
        {label:'Font Selection', value:'font_family', type:'options', options:PAGE_ROUTES.FONT_SELECTIONS},
        {label:'Background Color', value:'background_color'},
        {label:'Text Color', value:'font_color'},
        {label:'Chart Color(s)', value:'chart_colors', type:'multi_options'},
    ]
    const finalizeProjQuery= async()=>{
        const datasets = dataCollection.map(ds => ({
            proj_title:project_name,
            file_name: ds.fileName,
            file_size: ds.size,
            total_rows: ds.row_length ||  0,
            columns: {
                all_columns: ds.col?.all_columns || [],
                active_columns: ds.col?.columns || [],
                column_data_types: ds?.col_data_type || []
            }
        }));

        const table_relationships = relationships;
        const visualization_settings = {
            defaults: {
                background_color: defaults.background_color,
                font_color: defaults.font_color,
                font_family: defaults.font_family
            },
            chart_colors: chartColors
        };
        console.log({table_relationships})
        const body = {
            project_draft_id: router.query?.id,
            enable_ai_charts: false,
            datasets,
            table_relationships,
            visualization_settings
        };

        console.log({body})

        return await postProtectedData({
            path: API_ENDPOINTS.FINALIZE_PROJECT,
            body
        });
    }

    const {mutate:createProject, isPending:finalizing}=useMutation({
      mutationFn: ()=>finalizeProjQuery(),
      onError:({error})=>{
        return NotifyError(error.message || 'Could not finalize project')
      },
      onSuccess:({data})=>{
        NotifySuccess('Project created successfully')
        // console.log({finalize_project_data:data})
        window.location.href=PAGE_ROUTES.CREATE_CHARTS(data?.project_id)      
        // router.push(VIEW_PROJECT(data?.project_id))
        return
      }
  })

    const addNewColorLengthBox=()=>{
        // return setDefaults(prev=>{
        //     const current = Array.isArray(prev.chart_colors)
        //         ? [...prev.chart_colors]
        //         : [prev.chart_colors ?? "#000000"];
        //     current.push("#000000");
        //     return {...prev, chart_colors: current}
        // })
    }
    return(
        <section>
            <div className="py-5 bg-gray-50 px-5">
                <div className="flex items-stretch bg-gray-50">
                    <section style={{flexGrow:1, overflowX:'auto'}} className=" pl-4 bg-gray-50 h-full pr-[20px]">
                        <div>
                            <h2 className="text-2xl">Customize Charts</h2>
                            <p className="text-gray-500 mb-1.5">Define the default look and feel for your dashboards</p>
                        </div>
                        <div className="flex w-full items-start justify-between gap-x-4">
                            <div className="">
                                <SampleChart data={[10, 20, 30, 40]} bgColor={defaults.background_color}
                                    textColor={defaults.font_color} 
                                    font={defaults.font_family}
                                    chartColors={chartColors}
                                    type="bar"
                                />
                            </div>
                            <div className="">
                                <SampleChart data={[10, 20, 30, 40]} bgColor={defaults.background_color}
                                    textColor={defaults.font_color} font={defaults.font_family}
                                    chartColors={chartColors}
                                />
                            </div>
                        </div>

                    </section>
                    <div className="bg-white pt-5 pb-5 rounded-md shadow-md border">
                        <div className="h-[250px] overflow-y-auto">
                            {forms.map(({label, value, type, options}, ind)=>
                                <div className="px-4 mb-4" key={ind}>
                                    {type==='options'?  
                                        <div>
                                            <p className="mb-1.5">{label}</p>
                                            <SelectOptionAsObjectValue 
                                                options={options} 
                                                changeAll={true}
                                                label={label} 
                                                value={defaults[value] ?? {}} 
                                                onChange={(val)=>setDefaults({...defaults, [value]:val})}
                                            />
                                        </div>
                                    :   
                                    type==='multi_options'?
                                        <div>
                                            {/* <div className="flex justify-between items-end mb-2 relative"> */}
                                            <p className="mb-1.5">{label}</p>
                                            {/* </div>                                            */}
                                            {chartColors?.map((color, index) => (
                                                    <div key={index} className="flex items-center gap-x-[5px] mb-2">

                                                    <input
                                                        type="text"
                                                        value={color}
                                                        onChange={(e) => {
                                                            const newColor = e.target.value;
                                                            const current = [...chartColors];
                                                            current[index] = newColor;
                                                            setChartColors(current);
                                                        }}
                                                        className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-primary"
                                                    />

                                                    <ColorPicker
                                                        value={color}
                                                        onChange={(newColor) => {
                                                            const current = [...chartColors]
                                                            current[index] = newColor;
                                                            setChartColors(current);
                                                        }}
                                                    />

                                                    {index?<button
                                                        type="button"
                                                        onClick={() => {
                                                            const current = [...chartColors];
                                                            current.splice(index, 1);
                                                            setChartColors(current);
                                                        }}
                                                        className="px-2 text-red-500"
                                                    >
                                                        ✕
                                                    </button>:null}

                                                    </div>
                                                ))}

                                            <button
                                                type="button"
                                                onClick={() => {

                                                    const current_chart_colors= [...chartColors]
                                                    if(current_chart_colors.length>=6){
                                                        return NotifyError('You cannot add more than 6 color sets.')
                                                    }
                                                    current_chart_colors.push(default_chart_colors)
                                                    setChartColors(current_chart_colors)
                                                }}
                                                className="mt-1 px-3 py-1 text-sm border rounded-md hover:bg-gray-50"
                                            >
                                                + Add Color
                                            </button>
                                        </div>:
                                        <div>
                                            <p className="mb-1.5">{label}</p>
                                            <div className="flex items-center gap-x-[5px]">
                                                <input type="text" value={defaults[value] ?? ''} onChange={(e)=>setDefaults({...defaults, [value]:e.target.value})} className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-primary"/>    
                                                {/* <input type="color" /> */}
                                                {/* <HexColorPicker color={defaults[value] ?? '#000000'} onChange={(color)=>setDefaults(prev=>({...prev, [value]:color}))} /> */}
                                                <ColorPicker value={defaults[value] ?? '#000000'} onChange={(color)=>setDefaults(prev=>({...prev, [value]:color}))} />
                                            </div>
                                        </div>
                                    }   
                                </div>
                            )}
                        </div>
                        <div className="px-4 mt-2">
                            
                            <button disabled={true} className="text-left bg-blue-100/50  flex items-start gap-x-3 p-2 rounded-lg border border-blue-300">
                                <input type="checkbox" disabled={true} className="w-5 h-5 mt-2" checked={defaults.enable_ai_charts} onChange={(e)=>setDefaults(prev=>({...prev, enable_ai_charts:e.target.checked}))} />
                                <div className="w-[250px]">
                                    <p className="text-base">Enable AI-generated Charts <span className="italic text-xs">{'(-10 tokens)'}</span></p>
                                    <p className="text-gray-500 text-sm">{"Automatically generate charts based on your model's data structure and trends."}</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex justify-between  border-t w-full py-3 items-center px-8 bg-white">
                <button onClick={()=>setStep(3)} className="hover:underline w-fit items-center gap-x-2 py-2 rounded-lg ">
                    <p>Back: Prepare Data</p>
                </button>
                <LoadButton 
                    // disabled={isDisabled}
                    isLoading={finalizing}
                    onClick={() => createProject()} className="hover:bg-primary/80 flex items-center bg-primary gap-x-2 text-white px-8 py-2 rounded-lg ">
                    <p className="">{'Next : Finish & Launch Dashboard'}</p>
                    <img src="/svg/rocket-white.svg" alt="rocket"
                        style={{rotate:'45deg'}} 
                        className="w-4 h-4"
                    />
                </LoadButton>
            </div>
        </section>
    )
}

function DataPreview({activeColl}){
    const {dataCollection, setDataCollection}= useContext(ProjectDataContext)
    const activeData=useMemo(()=>{
        return dataCollection[activeColl]
    },[activeColl, dataCollection])

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
    const addColumn = ({tableIndex, columnName, newType}) => {
        setDataCollection(prev =>
            prev.map((table, i) => {
            if (i !== tableIndex) return table;

            const existsInAll = table.col.all_columns.includes(columnName);
            const alreadyAdded = table.col.columns.includes(columnName);

            if (!existsInAll || alreadyAdded) return table;

            return {
                ...table,
                col: {
                ...table.col,
                columns: [...table.col.columns, columnName]
                }
            };
            })
        );
    };
    const excludeColumn = ({tableIndex, columnName}) => {
        setDataCollection(prev =>
            prev.map((table, i) => {
            if (i !== tableIndex) return table;

            return {
                ...table,
                col: {
                    ...table.col,
                    columns: table.col.columns.filter(col => col !== columnName)
                }
            };
            })
        );
    };
    
    const switchColumn = ({columnName, newType, tableIndex}) => {
        setDataCollection(prev =>
            prev.map((table, i) => {
                if (i !== tableIndex) return table;

                return {
                ...table,
                col_data_type: table.col_data_type.map(cd =>
                    cd.col === columnName
                    ? { ...cd, data_type: newType }
                    : cd
                )
                };
            })
        );
    };


    const excludedColumns=useMemo(()=>{
        const excluded=activeData?.col?.all_columns?.filter((col)=>!activeData?.col?.columns.includes(col))
        return excluded || []
    },[activeData?.col?.columns])
    
    return(
        <section className='pb-8'>
            <div className="flex items-end justify-between">
                <p className="text-lg text-gray-600">Data Preview: <span className="text-black uppercase">{activeData?.fileName}</span></p>
                <div className="flex items-center text-[15px] gap-x-4 pr-8">
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
                    activeColl={activeColl}
                    data_type_collection={activeData?.col_data_type}
                />
            </div>

        </section>

    )
}
function DataRelationship({dataCollection}){
    const [fromTable, setFromTable]= useState({})
    const [toTable, setToTable]= useState({})
    const {NotifyError}= useToast()
    const {relationships, setRelationships}= useContext(ProjectDataContext)

    const from_columnOptions= useMemo(()=>{
        return fromTable?.columns?.filter((col)=>col.data_type === "identifier" ).map(col=>col.col) || []
    }, [fromTable])
    const to_columnOptions= useMemo(()=>{
        return toTable?.columns?.filter((col)=>col.data_type === "identifier" ).map(col=>col.col) || []
    }, [toTable]) 
    
    const addRelationship=()=>{
        if(!fromTable?.key_column || !toTable?.key_column) return NotifyError('Please select key columns for both tables to create a relationship.')
        const if_rel_exists= relationships.find(({from_column, to_column})=>from_column=== fromTable.key_column  || to_column===toTable.key_column)
        if(if_rel_exists){
            return NotifyError('Relationship already exists.')
        }
        const newRel={
            from_table: fromTable.fileName,
            from_column: fromTable.key_column,
            to_table: toTable.fileName,
            to_column: toTable.key_column
        }
        setRelationships(prev=>[...prev, newRel])
        setFromTable({})
        setToTable({})
        return   
    }   
    const modelData_coll = useMemo(() => {
        const tables_with_id = dataCollection?.filter(table =>
            table?.col_data_type?.some(cd => cd.data_type === "identifier")
        );
        return tables_with_id || [];
    }, [dataCollection]);
    return(
        <section className="p-2">
            <div className="flex items-center gap-x-2 mb-3">
                <img src="/svg/connector.svg" alt="connector" className="w-5 h-5"/>
                <h2 className="font-semibold text-[19px]">
                    DEFINE RELATIONSHIPS
                </h2>
            </div>
            {modelData_coll.length?
                <div className="bg-gray-50 border rounded-md p-3 flex justify-between items-end py-4">
                    <div className="w-[40%] ">
                        <div>
                            <p className="text-sm mb-[6px] font-semibold text-gray-500">FROM TABLE/COLUMN</p>
                        </div>
                        <div className="grid grid-cols-2 items-center gap-3 w-full">
                            <div className="z-[4] relative">
                                <SelectOptionAsObjectValue
                                    sliceValue={true}
                                    label={'TABLE'} valueStyle={{fontSize:12, fontWeight:500}}
                                    containerClass={'px-2.5 border bg-white'}
                                    extraOptionClass='text-[11px] font-normal py-1 px-2'
                                    options={dataCollection.map(({col_data_type, fileName}, index) => ({columns:col_data_type, fileName, index}))} 
                                    value={fromTable} valueProp='index' labelProp="fileName"  
                                    onChange={(newVal)=>setFromTable(newVal)} changeAll={true}
                                />
                            </div>
                            <div className="z-[2] relative">
                                <SelectOption
                                    sliceValue={true}
                                    label={'COLUMN'} valueStyle={{fontSize:15, fontWeight:500}}
                                    containerClass={'px-2.5 border bg-white text-sm py-2.5'}
                                    extraOptionClass='text-[11px] font-normal py-1 px-2'
                                    options={from_columnOptions} 
                                    value={fromTable?.key_column ?? ''} onChange={(newVal)=>setFromTable(prev=>({...prev, key_column:newVal}))}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="z-[1] flex flex-col items-center gap-x-2 relative h-fit">
                        <div className="flex flex-col items-center gap-x-2 w-fit z-[2]  px-2">
                            <img src="/svg/attachment.svg" alt="attachment" className="w-8 h-8"/>
                            <p className="text-sm text-primary">INNER JOIN</p>
                        </div>
                        {/* <div className="absolute z-[1] flex items-center top-0 bottom-0 w-full">
                            <div className="w-full h-[2px] bg-gray-400">

                            </div>
                        </div> */}
                    </div>
                    <div className="items-center w-[40%]">
                        <div>
                            <p className="text-sm mb-[6px]  font-semibold text-gray-500">TO TABLE/COLUMN</p>
                        </div>
                        <div className=" grid grid-cols-2 gap-3 w-full items-center">
                            <div className="z-[4] relative">
                                <SelectOptionAsObjectValue
                                    sliceValue={true}
                                    
                                    label={'TABLE'} valueStyle={{fontSize:12, fontWeight:500}}
                                    containerClass={'px-2.5 border bg-white'}
                                    extraOptionClass='text-[11px] font-normal py-1 px-2'
                                    options={dataCollection.map(({col_data_type, fileName}, index) => ({columns:col_data_type, fileName, index}))} 
                                    value={toTable} valueProp='index' labelProp="fileName"  
                                    onChange={(newVal)=>setToTable(newVal)} changeAll={true}
                                />
                            </div>
                            <div className="z-[2] relative">
                                <SelectOption
                                    sliceValue={true}
                                    label={'COLUMN'} valueStyle={{fontSize:15, fontWeight:500}}
                                    containerClass={'px-2.5 border bg-white text-sm py-2.5'}
                                    extraOptionClass='text-[11px] font-normal py-1 px-2'
                                    options={to_columnOptions} 
                                    value={toTable?.key_column ?? ''} onChange={(newVal)=>setToTable(prev=>({...prev, key_column:newVal}))}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="w-fit ">
                        <button onClick={()=>addRelationship()} className="flex items-center justify-center gap-x-2 items-center bg-primary text-white px-4 py-2 rounded-full ">
                            <img src="/svg/plus-white.svg" alt="plus" className="w-4 h-4"/>
                            <p className="text-base">Join</p>
                        </button>
                    </div>
                </div>:
                <div className="p-3 bg-gray-100 rounded-md">
                    <p className="text-sm text-gray-500">No tables with identifier columns available for relationships. Please ensure your datasets have identifier columns to create relationships.</p>
                </div>   
            }
        </section>

    )
}

function ActiveMapping(){
    const {relationships, setRelationships}= useContext(ProjectDataContext)
    return(
        <div className="pb-4">
            <h2 className="my-3 font-semibold text-[19px]">
                ACTIVE MAPPING
            </h2>
            <div>
                {relationships.length === 0 ? (
                    <p className="text-sm text-gray-500">No active relationships. Once you create joins, they will appear here for quick access and management.</p>
                ) : (
                    <div className="grid grid-cols-1 gap-3">
                        {relationships.map((rel, index) => (
                            <div key={index} className="bg-blue-50 border border-blue-200 rounded-md p-3 relative">
                                <div className="space-y-[3px]">
                                    <p className="text-sm font-medium">{getFileName(rel.from_table)+'.'+rel.from_column}</p>
                                    <p className="text-blue-400 font-semibold">===</p>
                                    <p className="text-sm font-medium">{getFileName(rel.to_table)+'.'+rel.to_column}</p>
                                </div>
                                <img src="/svg/close.svg" alt="close" className="absolute top-2 right-2 w-3.5 h-3.5 cursor-pointer" onClick={() => {
                                    const newRelationships = relationships.filter((_, i) => i !== index);
                                    setRelationships(newRelationships);

                                }} />   
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

const getFileName=(path) => {
    const index = path.lastIndexOf(".");
    const result = [
        path.substring(0, index),
        path.substring(index + 1)
    ];
    return result[0];
}