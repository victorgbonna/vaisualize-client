import { useHttpServices, useToast } from "@/hooks";
import { Fragment, useContext, useEffect, useState } from "react";
import { DataRequestContext, FilterContext, FilterContextComponent } from "@/context";
import { ModalLayout, Ok } from "@/components/modal";
import { SelectFilters, SelectOption, SelectOptionAsObjectValue } from "@/components";
import { useMutation, useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/configs";
import { useRouter } from "next/router";

function FilterBoxInner({
  setShowModal,
  data,
  openColumn,
}) {
  const { filterArr, dispatch } = useContext(FilterContext);
  const [formData, setFormData]= useState(null)
  const { NotifyError,NotifySuccess } = useToast();
  const [mount, setMount]= useState(false)
  const {setFilter, filter_x}= useContext(DataRequestContext)

  const hasMeaningfulValue = obj =>
    Object.values(obj).some(v => v !== "" && v !== null && v !== undefined);

  const if_filter_cleared=()=>{
    const arr= [...filterArr]
    if(arr.length===1 && arr[0].length===1 && !hasMeaningfulValue(arr[0])){
        return true
    }
    return false
  }
  const cleanFilter=()=>{
    const arr= [...filterArr]
    const cleaned = [];
    for (let i = 0; i < arr.length; i++) {
        const orSet = arr[i];
        const last = orSet[orSet.length - 1];
        if (!hasMeaningfulValue(last)) {
            if (orSet.length === 1) {
                return { error: "A filter group contains an empty value" };
            }
            cleaned.push(orSet.slice(0, -1));
        } else {
            cleaned.push(orSet);
        }
    }
    return { filter_data: cleaned }; 
  }
  const cleanAndSetFilter = () => {
    const check_if_reset=if_filter_cleared()
    if(check_if_reset){
        setFilter([[{}]])
        setShowModal()
        return NotifySuccess('Filter resets successfully')
    }
    const { error, filter_data } = cleanFilter();
    if (error) return NotifyError(error);
    setFilter(filter_data)
    setShowModal()
  };

  const deleteFilterChoice = ({ or_ind, and_ind }) =>
    dispatch({ type: "DELETE_AND", or_ind, and_ind });

  const deleteOr = ({ or_ind }) =>
    dispatch({ type: "DELETE_OR", or_ind });

  const addFilterChoice = ({ or_ind }) =>
    dispatch({ type: "ADD_AND", or_ind });

  const addOrFilterChoice = () =>
    dispatch({ type: "ADD_OR" });

  const router= useRouter()

  const onChangeFilterChoice = ({ or_ind, and_ind, obj_val }) =>
    dispatch({
      type: "UPDATE_AND",
      or_ind,
      and_ind,
      key: obj_val.label,
      value: obj_val.value
    });

//   useEffect(() => {
//     if (data?.active_filter?.length) {
//       dispatch({ type: "SET_ALL", payload: data.active_filter });
//     }
//     setMo
//   }, []);

    useEffect(()=>{ 
        if(mount) return 
        // console.log({data})
        const curr_filter=filter_x ?? data?.active_filter?.filters
        if(curr_filter){ 
            dispatch({ type: "SET_ALL", payload: curr_filter });
        }
        setTimeout(()=>setMount(true), 1000) 
    } , [])
    const {postData}= useHttpServices()
    const saveResetQuery= async()=>{
        console.log('reset here')
        return await postData(
            {
                path:API_ENDPOINTS.RESET_FILTERS,
                body:{id:router?.query?.id}
            })
    }

    const {mutate:resetFilter, isPending:resLoading}=useMutation({
        mutationFn: ()=>saveResetQuery(),
        onError:({error})=>{
            
            return NotifyError(error.message || 'Could not get data')
        },
        onSuccess:()=>{
            NotifySuccess('Filter resets successfully') 
            setShowModal()  
            window.location.reload()   
            return
        }
    })
    
    // useEffect(()=>{ if(mount) return console.log({filterx}) if(filterx?.length){ setFilterArr([...]) } setTimeout(()=>setMount(true), 1000) } , [])
  return (
    <>
      <ModalLayout onClose={setShowModal}>
        <div
          onClick={(e) => e.stopPropagation()}
          className={"bg-white rounded-lg py-10 w-[900px] tablet:w-full "}
        >
          <div style={mount ? {} : { visibility: "hidden" }}>
            <div className=" px-6 top-0 sticky">
              <div className="flex justify-between items-start mb-4">
                <div className="">
                  <p className="text-3xl tablet:text-xl mb-[4px] text-[#8F34E9] font-semibold">
                    Filter Your Data
                  </p>
                  <p className="text-[#5D5C5C] text-sm">
                    Drill down to quickly isolate key patterns.
                  </p>
                </div>
                <button onClick={() => setShowModal()}>
                  <img
                    alt="icon"
                    src={"/svg/close.svg"}
                    className="w-[18px] h-[18px]"
                  />
                </button>
              </div>
            </div>

            <div className="bg-gray-100 px-6 h-[350px] tablet:[250px] overflow-y-auto relative pb-4">
              <div className="flex justify-between items-center mt-4 mb-4">
                <button
                  className="text-[#9400d3] font-semibold"
                  onClick={() => dispatch({ type: "RESET" })}
                >
                  Clear Filters
                </button>
                <div>
                  <SelectFilters
                    onChange={(e) =>
                      dispatch({ type: "SET_ALL", payload: e.filters })
                    }
                    
                    active_filter={data.active_filter}
                    id={data.id}
                  />
                </div>
              </div>

              {filterArr.length > 0 ? (
                <CompleteBox
                  deleteFilterChoice={deleteFilterChoice}
                  addFilterChoice={addFilterChoice}
                  filters={filterArr}
                  deleteOr={deleteOr}
                  onChangeFilterChoice={onChangeFilterChoice}
                />
              ) : null}

              <div className="mt-4 flex gap-x-4 relative">
                <button
                  onClick={addOrFilterChoice}
                  className=" p1 flex items-center py-2 px-5 rounded-full gap-x-1.5"
                >
                  <p className="text-sm font-semibold text-white">OR</p>
                </button>
                
              </div>
            </div>

            <div className="flex items-center px-6 gap-x-3 justify-end mt-8">
              <button
                onClick={() => {
                  cleanAndSetFilter();
                }}
                className="p2 rounded-[22px] px-5 text-white py-2 font-semibold"
              >
                Apply
              </button>

              <button
                disabled={resLoading}
                onClick={() => {
                    const check_if_reset=if_filter_cleared()
                    if(check_if_reset){
                        NotifySuccess('Clearing the filters..')
                        resetFilter()
                        return
                    }
                  const { error, filter_data } = cleanFilter();
                  if (error) return NotifyError(error);
                  setFormData({...formData, id: data.id, filter_data });
                }}
                className="p3 rounded-[22px] px-5 text-white py-2 font-semibold"
              >
                Save & Apply
              </button>
            </div>
          </div>
        </div>
      </ModalLayout>

      {formData?.id ? 
        <FilterSaveNext
          setFormData={setFormData}
          formData={formData}
          onNext={() => {
            setFilter(formData.filter_data)
            setFormData(null);
            setShowModal()
            // cleanAndSetFilter();
            return;
          }}
          onClose={() => setFormData({name:formData.name})}
        />
      : null}
    </>
  );
}

export default function FilterBox(props) {
  return (
    <FilterContextComponent>
        <FilterBoxInner {...props} />
    </FilterContextComponent>
  );
}


function AndItemBox({existing_val, and_ind, addFilterChoice,or_ind, deleteFilterChoice, isLatest,onChangeFilterChoice}){
    // const [filterChoice, setFilterChoice]= useState({})

    return(
        <div className="p-3">
            {/* {and_ind>0?
                <p className="text-xl uppercase mb-3">OR</p>
            :null} */}
            {/* <div style={{display:'none'}}>
                <div className="flex items-center justify-between pr-3">
                    <p className="font-semibold">{column}</p>
                    <button onClick={()=>deleteFilterChoice({and_ind, or_ind})}>
                        <img alt="icon" src={'/svg/close.svg'} className="w-[15px] h-[15px]"/>                      
                    </button>
                </div>
                <div className="pl-3 mt-3 items-center gap-x-7 rounded-full flex border border-gray-500 w-[400px] tablet:w-full">
                    <p className="p-2 border-r pr-3 border-gray-500 text-gray-900 text-sm">{filterOpt==='eq'?'equal to':'not equal to'}</p>
                    <p className="p-2 pl-0">{value}</p>
                </div>
            </div> */}
            <div className="bg-white rounded-xl border mt-4 p-3">
                <div className="flex items-center justify-between gap-x-4">
                    <InputBox
                        // NotifyError={NotifyError} 
                        existing_val={existing_val} 
                        // onChangeFilterChoice={(obj_val)=>onChangeFilterChoice({obj_val, and_ind, or_ind})}  
                        filterChoice={existing_val} 
                        setFilterChoice={(obj_val)=>onChangeFilterChoice({obj_val, and_ind, or_ind})}
                    />
                    {isLatest?
                    <button 
                        disabled={
                            !existing_val?.value || !existing_val?.column 
                            || !existing_val?.filterOpt
                        } 
                        onClick={()=>addFilterChoice({and_ind, or_ind})} 
                        className="min-w-fit p1 flex items-center py-2 px-2.5 rounded-full gap-x-2">
                        <img src="/svg/add-dark.svg" className="w-5 h-5"/>
                        <p className="text-sm font-semibold text-white">AND</p>
                    </button>:
                    <button onClick={()=>deleteFilterChoice({and_ind, or_ind})} className="bg-gray-200 border py-2 px-2.5 rounded-full">
                        <img alt="icon" src={'/svg/close.svg'} className="w-[15px] h-[15px]"/>                      
                    </button>
                    }
                </div>
            </div>

        </div>
    )
}

function ActualInputBox({ filterChoice, setFilterChoice }) {
  return (
    <input
      value={filterChoice.value || ""}
      onChange={e =>
        setFilterChoice({ label: "value", value: e.target.value })
      }
    />
  );
}
function FilterSaveNext({
    formData, onClose, onNext,
    filterArr, setFormData
}){
    const formChange=(e, key, option=false)=>{
        if (option) return setFormData({...formData,[key]:e})
        return setFormData({...formData,[key]:e.target.value})
    }
    const {postData}= useHttpServices()
    const {NotifyError, NotifySuccess}= useToast()
    const router= useRouter()
    const saveFilterQuery= async()=>{
        console.log('yes oo')
        return await postData(
            {
                path:API_ENDPOINTS.ADD_FILTER,
                body:{filters:formData.filter_data, name:formData.name, req_id:router?.query?.id}
            })
    }

    const {mutate:saveFilter, isPending:filLoading}=useMutation({
        mutationFn: ()=>saveFilterQuery(),
        onError:({error})=>{
            return NotifyError(error.message || 'Could not get data')
        },
        onSuccess:()=>{
            NotifySuccess('Filter saved successfully')   
            onNext()         
        }
    })
    return(
        <Ok onClose={onClose} 
            onNext={onNext} 
            btnDisabled={!formData.name}
            isLoading={filLoading}
            isBtnLoader={true}
            onClick={()=>saveFilter()}
            >
            <p className="mb-2 text-left">Attach a name to give to the filter</p>
            <input onChange={(e)=>formChange(e, 'name')}
                value={formData.name || ''} 
                className="w-full border border-gray-400 rounded-lg px-4 py-2.5" 
                placeholder="Enter name"
            />
        </Ok>
    )
}
function InputBox({filterChoice, setFilterChoice}){
    const {columns, dataArray}= useContext(DataRequestContext)
    const clause_def=[ 
        {label:'Equal to', value:'eq'},
        {label:'Not Equal to', value:'neq'},
        {label:'Contains', value:'contains', notNum:true},
        {label:'Greater Than', value:'gt', notStr:true},
        {label:'Less Than', value:'lt', notStr:true},
    ]
    const datasetInfo = [
        {
            label: "Select Column",
            name: "column",
            valueProp:'col',
            labelProp:'col'
        },
        {
            label:'Select Filter Option',
            name:'filterOpt',
            valueProp:'value',
            labelProp:'label',
            options:[]
        },{
            label: "Enter Value",
            name: "value",
            type: "text",
            placeholder: "Enter value",
        }
    ];
    const [clauseOptions, setClauseOptions]= useState([])
    // const [disable_clause_list, set_disable_clause_list]= useState('')
    const [valueChoices, setValueChoices]= useState([])
    useEffect(()=>{
        if(!filterChoice.column) return
        const column_choice=columns?.find(({col})=>filterChoice?.column===col)
        
        const distinctValues= getDistinctValuesByCount(
            {dataArray, column:filterChoice?.column}
        )
        setValueChoices(distinctValues)
        if(column_choice.cat==='numerical_column'){
            const only_num_cols= clause_def.filter(({notNum})=>!notNum)
            return setClauseOptions(only_num_cols)
        }
        else{
            const only_cat_cols= clause_def.filter(({notStr})=>!notStr)
            return setClauseOptions(only_cat_cols)
        }


    },[filterChoice.column])

    return(
    <div className="grid grid-cols-3 w-full tablet:grid-cols-1 items-center gap-4 tablet:items-end mt-3 mb-3">
        {datasetInfo.map(({label, name, type, options, placeholder, maxlength, valueProp, labelProp},ind)=>
            <div key={ind} className="">
                {type==='text'?
                    <div className="w-full" style={!filterChoice?.column?{visibility:'hidden'}:{}}>
                        {(filterChoice?.filterOpt==='eq' || filterChoice?.filterOpt==='neq' )?
                            <SelectOption isInput={true}
                                limitOptions={6}
                                options={valueChoices}
                                disabled={!filterChoice.column}
                                fullContainerClass='text-sm py-2.5 flex items-center border px-4 rounded-full border-gray-300 justify-between'
                                label={label} value={filterChoice[name] || ''} 
                                style={{margin:'0 0'}}

                                onChange={(e)=>
                                    {
                                        setFilterChoice({label:name, value:e})
                                        // if(name==='column'){
                                        //     valueOptions()
                                        // }
                                    }
                                }
                            />:
                            <input
                                className='w-full text-sm py-2.5 flex items-center border px-4 rounded-full border-gray-300 justify-between'
                                value={filterChoice[name] || ''}
                                onChange={(e)=>setFilterChoice({label:name, value:e.target.value})}
                            />
                        }
                    </div>
                :
                    <div className="w-full" style={(!filterChoice?.column && options)?{visibility:'hidden'}:{}}>
                    <SelectOptionAsObjectValue 
                        containerClass={'text-sm py-2 border-gray-300'}
                        style={{margin:'0 0'}}
                        label={label}
                        valueProp={valueProp} 
                        labelProp={labelProp}
                        value={((!options?columns:clauseOptions)?.find((x)=>filterChoice[name]===x[valueProp])) || {}} 
                        onChange={(e)=>
                            {
                                // setFilterChoice({...filterChoice, [name]:e})
                                setFilterChoice({label:name, value:e})
                            }
                        }
                        options={options? clauseOptions: columns}
                    />
                    </div>
                }
            </div>
        )}
        
    </div>
    )

}
function CompleteBox(
    {   
        filters, deleteFilterChoice, onChangeFilterChoice, 
        addFilterChoice, deleteOr,setFilterChoice
    }){
    const filters_dummy = [
  [
    { column: "status", filterOpt: "eq", value: "active" },
    { column: "role", filterOpt: "neq", value: "admin" }
  ],
  [
    { column: "age", filterOpt: "eq", value: 25 }
  ]
];

    return(
        <div className="flex flex-col gap-y-3 w-full">
            {filters
                .map((filter_or_set,or_ind)=>{
                    return(
                        <div key={or_ind} className="border-gray-100 border">
                            {or_ind>0?
                                <div className="gap-x-2 items-center mb-3 flex justify-between">
                                    <p className="text-xl uppercase font-medium text-gray-500">OR</p>
                                    <div className="h-[2px] bg-gray-200 w-full"></div>
                                    <button className="p-1.5 p3 rounded-lg top-2 right-2 w-fit" 
                                        onClick={()=>deleteOr({or_ind})}>
                                        <img src="/svg/bin.svg" className="w-4 h-4"/>
                                    </button>
                                </div>
                            :null}
                            <div className="rounded-lg bg-white relative">
                                 
                                {filter_or_set
                                .map((existing_val,and_ind)=>
                                    <Fragment key={and_ind}>
                                        <AndItemBox existing_val={existing_val} and_ind={and_ind}
                                            addFilterChoice={addFilterChoice}
                                            deleteFilterChoice={deleteFilterChoice}
                                            or_ind={or_ind}
                                            onChangeFilterChoice={onChangeFilterChoice}
                                            isLatest={and_ind===filter_or_set.length-1}
                                        />
                                    </Fragment>
                                )}
                                {/* <div className="pl-2 pb-2">
                                    <button 
                                        onClick={
                                            ()=>setOpenColumnOptions(
                                                {status:'and'}
                                            ) 
                                        } 
                                        className=" p1 flex items-center py-2 px-2 rounded-full gap-x-2">
                                        <img src="/svg/add-dark.svg" className="w-5 h-5"/>
                                        <p className="text-sm font-semibold text-white">AND</p>
                                    </button>
                                </div> */}
                                
                            </div>
                            
                        </div>
                    )
                }
            )}
            
        </div>
    )
}

function getDistinctValuesByCount({dataArray, column}) {
  const counts = {};
  
  for (const item of dataArray) {
    const val = item[column];
    // console.log({val, item, column})
    if (val !== undefined && val !== null) {
      counts[val] = (counts[val] || 0) + 1;
    }
  }
//   console.log({counts})
  return Object.entries(counts)
    .map(([value, count]) => (value))
    // .sort((a, b) => b.count - a.count);
}


