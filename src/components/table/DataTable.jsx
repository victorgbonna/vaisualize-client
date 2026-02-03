import { useEffect, useMemo, useState } from "react";

import moment from 'moment'
import TableLayout from "./TableLayout";
import { consolelog, timeStampControl } from "@/configs";
import { SelectOption } from "..";

function DataTable({
    data, tableCols, data_type_collection, 
    modifyColumn, excludedColumns
}){
    
    return (
        <>
        <div className="overflow-x-auto ">
            <section className="text-[13px] mt-2 bg-slate-200/20 rounded-md border shadow-lg datatable overflow-x-auto z-[2] rounded-t-md w-screen ">            
                <TableLayout
                    className="mb-6 rounded-t-md"
                    theadBg={'#'}
                    th={<TableHead 
                        tableCols={tableCols} 

                        modifyColumn={modifyColumn}
                        excludedColumns={excludedColumns}
                        data_type_collection={data_type_collection}/>} 
                    td={
                        <TableBody entries={data}
                        tableCols={tableCols}  
            
                    />}
                /> 
            </section>
        </div>
        </>
    )
}
const TableHead= ({
        tableCols, data_type_collection, 
        excludeColumn, excludedColumns
    }) =>{    
    return (
        <>
            {tableCols?.map((col, index) => (
                <th className={`py-4 text-left text-gray-600 border-b border-gray-200 tablet:px-6 ${col!=="GENDER"?" tablet:min-w-[170px]":""}`} key={index} >
                    <div className="pl-3 uppercase">
                        <p>{col}</p>    
                        <DataTypeSelection
                            col={col}
                            excludeColumn={excludeColumn} 
                            isIncluded={!excludedColumns?.includes(col)}
                            data_type={data_type_collection?.find((item)=>item.col===col)?.data_type}
                        />
                    </div>
                </th>
            ))}
        </>
    );
};

const TableBody= ({entries, tableCols}) =>{ 
    const {isDate}= timeStampControl
    return (
        <>
        {entries?.map((row,index)=>{
            return(
            <tr key={index} className="h-14 tablet:h-20 bg-white text-sm text-left">
                {tableCols.map((columnProp,ind)=>
                    <td key={ind} className={`pl-3`}>
                        {isDate(row[columnProp])?
                            <p className=" w-fit text-xs py-1 px-2 bg-gray-100 rounded-md text-gray-600">{moment(row[columnProp]).format("YYYY-MM-DD")}</p>:
                            row[columnProp]}
                    </td>
                )}
            </tr>
            )}
        )}
        </>
    );
};

function DataTypeSelection({
    data_type,col,
    modifyColumn,
    isIncluded
}){
    const filtered_options= useMemo(()=>{
        return ['identifier','number', 'date', 'string']
    },[data_type])
    
    return(
        <div className="mt-2 w-fit flex gap-x-1.5 items-center">
            <SelectOption options={filtered_options} value={data_type}
                sideImageValue={
                    <img src={`/svg/datatype/${data_type}.svg`} className="w-3 h-3"/>
                }
                onChange={(new_data_type)=>modifyColumn({mod_type:'switch', data:{col,new_data_type}})}
                label={'Column'} valueStyle={{fontSize:12, fontWeight:500}}
                containerClass={'px-2.5 border bg-white'}
                extraOptionClass='text-[11px] font-normal py-1 px-2'
            />
            <button onClick={()=>modifyColumn(
                {mod_type:isIncluded?'exclude':'add', data:col}
            )}>
                <img src={`/svg/${isIncluded?'eye.svg':'eye-closed.svg'}`} alt="eyes" className="w-5 h-5"/>
            </button>
        </div>
    )
}

export default DataTable