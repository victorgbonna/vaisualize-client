/**
 * Datasets Page
 * Allows users to connect a project, browse its tables,
 * apply AI-powered filters, and inspect foreign key relationships.
 */
import { AppLayout, FilterBox, LoadButton, SelectOptionAsObjectValue } from "@/components";
import { ModalLayout } from "@/components/modal";
import { API_ENDPOINTS } from "@/configs";
import { DataRequestContext, UseDataRequestContextComponent } from "@/context";
import { useHttpServices, useToast } from "@/hooks";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useContext, useEffect, useMemo, useState } from "react";

const ROWS_PER_PAGE = 20;

const FILTER_OPERATORS = {
    eq: (a, b) => String(a ?? '').toLowerCase() === String(b ?? '').toLowerCase(),
    neq: (a, b) => String(a ?? '').toLowerCase() !== String(b ?? '').toLowerCase(),
    gt: (a, b) => Number(a) > Number(b),
    lt: (a, b) => Number(a) < Number(b),
    contains: (a, b) => String(a ?? '').toLowerCase().includes(String(b ?? '').toLowerCase()),
};

function resolveFilterConditionValue(row, condition, { activeTable, relationships, datasets }) {
    const table = condition.table || activeTable;
    if (table === activeTable) return row[condition.column];

    const relationship = relationships.find(
        (rel) => (rel.from_table === activeTable && rel.to_table === table) ||
            (rel.to_table === activeTable && rel.from_table === table)
    );
    if (!relationship) return undefined;

    const [localColumn, foreignColumn] = relationship.from_table === activeTable
        ? [relationship.from_column, relationship.to_column]
        : [relationship.to_column, relationship.from_column];

    const foreignRows = datasets?.[table] || [];
    const match = foreignRows.find((foreignRow) => String(foreignRow[foreignColumn]) === String(row[localColumn]));
    return match?.[condition.column];
}

function rowMatchesFilterGroups(row, filterGroups, context) {
    if (!filterGroups?.length) return true;
    return filterGroups.some((andGroup) =>
        andGroup.every((condition) => {
            if (!condition?.column || !condition?.filterOpt) return true;
            const operator = FILTER_OPERATORS[condition.filterOpt];
            if (!operator) return true;
            return operator(resolveFilterConditionValue(row, condition, context), condition.value);
        })
    );
}

function mapDataTypeToCat(dataType) {
    if (dataType === 'number') return 'numerical_column';
    if (dataType === 'date') return 'date_column';
    return 'categorical_column';
}

function mapDataTypeToType(dataType) {
    return dataType === 'identifier' ? 'string' : (dataType || 'string');
}

export default function Datasets() {
    const active = 'Datasets';

    return (
        <AppLayout active={active}>
            <UseDataRequestContextComponent>
                <DatasetChildren />
            </UseDataRequestContextComponent>
        </AppLayout>
    );
}

function DatasetChildren(){
    const { NotifyError, NotifySuccess } = useToast();
    const { getProtectedData, postProtectedData } = useHttpServices();
    const { project, setProject, columns, setColumns, datasets, setDatasets } = useContext(DataRequestContext);

    const [projectSelected, setProjectSelected] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [activeTable, setActiveTable] = useState('');
    const [filters, setFilters] = useState({});
    const [filterRelationships, setFilterRelationships] = useState([]);
    const [query, setQuery] = useState('');
    const [showFilterBox, setShowFilterBox] = useState(false);
    const [previewFk, setPreviewFk] = useState(null);
    const [page, setPage] = useState(1);

    const {data: req_data}= useQuery(
        {
            queryKey:['owned-projects'],
            queryFn:()=>getProtectedData({path:API_ENDPOINTS.OWNED_ALL}),
            refetchOnWindowFocus: true,
            retry:false
        }
    )

    // Get One Project - populates DataRequestContext's project, which in turn parses each dataset's file_url/file_name into columns + rows.
    const fetchSelectedProject = async () => {
        return await getProtectedData({ path: API_ENDPOINTS.OWNED_BY_ID(projectSelected?._id) });
    };

    const { mutate: connectProject, isPending: connectLoading } = useMutation({
        mutationFn: fetchSelectedProject,
        onError: (error) => NotifyError(error?.error?.message || 'Could not connect to project'),
        onSuccess: (data ) => {
            console.log({datxa:data});
            setProject(data?.project);
            // setDatasets(data?)
            setIsConnected(true);
            NotifySuccess('Project connected');
        }
    });

    const disconnectProject = () => {
        setProject(null);
        setColumns([]);
        setDatasets({});
        setIsConnected(false);
        setActiveTable('');
        setPage(1);
        NotifySuccess('Project disconnected');
    };

    // const tables = useMemo(() => (project?.datasets || []).map((dataset) => ({
    //     id: dataset.file_name,
    //     label: dataset.file_name,
    //     rows: dataset.total_rows
    // })), [project, datasets]);
    const tables = useMemo(() => (project?.datasets || []).map((dataset) => ({
        id: dataset.file_name,
        label: dataset.file_name,
        rows: dataset.total_rows
    })), [project, datasets]);
    // console.log({previewFk})
    useEffect(() => {
        if (tables.length && !tables.some((table) => table.id === activeTable)) {
            setActiveTable(tables[0].id);
        }
    }, [tables]);
  
    useEffect(() => { setPage(1); }, [activeTable]);

    const activeTableMeta = useMemo(() => tables.find((table) => table.id === activeTable), [tables, activeTable]);

    const activeColumns = useMemo(() => {
        return (columns || [])
            .filter((column) => column.table === activeTable)
            .map((column) => {
                const relationship = (project?.table_relationships || []).find(
                    (rel) => rel.from_table === activeTable && rel.from_column === column.col
                );
                return {
                    key: column.col,
                    label: column.col,
                    type: column.cat,
                    badge: column.cat === 'identifier' && !relationship ? 'PK' : relationship ? 'FK' : null,
                    fkTable: relationship?.to_table,
                    fkColumn: relationship?.to_column
                };
            });
    }, [columns, activeTable, project]);
    const rawActiveRows = useMemo(() => datasets?.[activeTable] || [], [datasets, activeTable]);
    const activeTableFilters = filters[activeTable];
    const effectiveRelationships = filterRelationships.length ? filterRelationships : (project?.table_relationships || []);
    const activeRows = useMemo(() => {
        if (!activeTableFilters?.length) return rawActiveRows;
        return rawActiveRows.filter((row) =>
            rowMatchesFilterGroups(row, activeTableFilters, { activeTable, relationships: effectiveRelationships, datasets })
        );
    }, [rawActiveRows, activeTableFilters, effectiveRelationships, activeTable, datasets]);
    // console.log({activeRows:activeRows?.slice(0,5), activeTable})
    
    const pageCount = Math.max(1, Math.ceil(activeRows.length / ROWS_PER_PAGE));
    const pagedRows = useMemo(
        () => activeRows.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE),
        [activeRows, page]
    );

    const pageNumbers = useMemo(() => {
        return Array.from({ length: pageCount }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === pageCount || Math.abs(p - page) <= 1)
            .reduce((acc, p, i, arr) => {
                if (i && p - arr[i - 1] > 1) acc.push('...');
                acc.push(p);
                return acc;
            }, []);
    }, [pageCount, page]);

    const openFkPreview = (column, value) => {
        const match = (datasets?.[column.fkTable] || []).find((row) => String(row[column.fkColumn]) === String(value));
        console.log({column, value, match})
        setPreviewFk({ table: column.fkTable, column: column.fkColumn, value, match });
    };

    const buildFilterPlanBody = () => {
        const tableRelationships = project?.table_relationships || [];
        const relevantRelationships = tableRelationships.filter(
            (rel) => rel.from_table === activeTable || rel.to_table === activeTable
        );
        const relatedTableNames = Array.from(new Set(
            relevantRelationships.map((rel) => (rel.from_table === activeTable ? rel.to_table : rel.from_table))
        ));

        const buildColumns = (tableName) => (columns || [])
            .filter((column) => column.table === tableName)
            .map((column) => ({
                col: column.col,
                cat: mapDataTypeToCat(column.cat),
                type: mapDataTypeToType(column.cat)
            }));

        return {
            activeTable: { name: activeTable, columns: buildColumns(activeTable) },
            relatedTables: relatedTableNames.map((name) => ({ name, columns: buildColumns(name) })),
            relationships: relevantRelationships,
            prompt: query
        };
    };
// combo-free

    const { mutate: generateFilterPlan, isPending: filterPlanLoading } = useMutation({
        mutationFn: async() => {
            return await postProtectedData({ path: API_ENDPOINTS.GENERATE_FILTER_PLAN, body: buildFilterPlanBody()})
        },
        onError: (error) => {
            const message = Array.isArray(error?.error?.message) ? error.error.message[0] : (error?.error?.message || 'Could not generate filter');
            NotifyError(message);
        },
        
       onSuccess: ({ data }) => {
            if (data?.status === "success") {
                console.log({ data });

                const filters = data?.filters || [];
                const relationships = data?.relationships || [];
                if (!relationships.length) {
                    setFilters((prev) => ({
                        ...prev,
                        [activeTable]: filters,
                    }));

                    NotifySuccess("Filter applied from your prompt");
                    return;
                }

            
                let convertedFilters = [];

                filters.forEach((andGroup) => {
                
                    let groups = [[]];

                    andGroup.forEach((filter) => {
                    
                        if (
                            !filter?.table ||
                            filter.table === activeTable
                        ) {
                            groups = groups.map((group) => [
                                ...group,
                                {
                                    column: filter.column,
                                    filterOpt: filter.filterOpt,
                                    value: filter.value,
                                },
                            ]);

                            return;
                        }

                        
                        const relationship = relationships.find(
                            (rel) =>
                                rel.from_table === activeTable &&
                                rel.to_table === filter.table
                        );

                        if (!relationship) {
                            console.warn(
                                "No relationship found for filter:",
                                filter
                            );

                            return;
                        }

                        
                        const relatedRows =
                            datasets?.[relationship.to_table] || [];

                        const matchingRows = relatedRows.filter((row) => {
                            const rowValue = row?.[filter.column];
                            const filterValue = filter?.value;

                            switch (filter.filterOpt) {
                                case "eq":
                                    return rowValue === filterValue;

                                case "neq":
                                    return rowValue !== filterValue;

                                case "contains":
                                    return String(rowValue ?? "")
                                        .toLowerCase()
                                        .includes(
                                            String(filterValue ?? "").toLowerCase()
                                        );

                                case "gt":
                                    return rowValue > filterValue;

                                case "lt":
                                    return rowValue < filterValue;

                                default:
                                    return false;
                            }
                        });

                    
                        const foreignKeyValues = [
                            ...new Set(
                                matchingRows
                                    .map(
                                        (row) =>
                                            row?.[relationship.to_column]
                                    )
                                    .filter(
                                        (value) =>
                                            value !== undefined &&
                                            value !== null
                                    )
                            ),
                        ];

                        
                        if (!foreignKeyValues.length) {
                            groups = [];
                            return;
                        }

                        
                        const expandedGroups = [];

                        groups.forEach((group) => {
                            foreignKeyValues.forEach((foreignKeyValue) => {
                                expandedGroups.push([
                                    ...group,
                                    {
                                        column: relationship.from_column,
                                        filterOpt: "eq",
                                        value: foreignKeyValue,
                                    },
                                ]);
                            });
                        });

                        groups = expandedGroups;
                    });

                    
                    convertedFilters.push(...groups);
                });

                
                convertedFilters = convertedFilters.filter(
                    (group) => group.length > 0
                );

                console.log({
                    originalFilters: filters,
                    relationships,
                    convertedFilters,
                });

                
                setFilters((prev) => ({
                    ...prev,
                    [activeTable]: convertedFilters,
                }));

                NotifySuccess("Filter applied from your prompt");
                return;
            }

            NotifyError(
                data?.message ||
                    "Could not build a filter from that prompt"
            );
        }
    });

    const removeFilterGroup = (groupIndex) => setFilters((prev) => ({
        ...prev,
        [activeTable]: (prev[activeTable] || []).filter((_, i) => i !== groupIndex)
    }));
    const refreshView = () => setFilters((prev) => ({ ...prev, [activeTable]: [] }));

    return(
        <div className="h-fit px-1 pt-6 pb-10 tablet:px-1">
            <div className="max-w-7xl mx-auto tablet:px-3 space-y-6">
                <div className="flex flex-col  px-7 tablet:flex-col justify-between pb-2">
                    
                    <h2 className="font-semibold text-3xl mb-1">Datasets</h2>
                    <p className="text-gray-600">Explore raw tables, inspect schema relationships, query with AI and filter records.</p>
                </div>
                <div className='h-[430px] space-y-5 overflow-y-auto  px-7'>
                    <section className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
                        <div className="flex flex-col tablet:flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            {isConnected ? 
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center text-primary shrink-0">
                                    <img src="/svg/database.svg" alt="" className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Connected Project</span>
                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800">Active Sync</span>
                                    </div>
                                    <h3 className="text-base font-bold text-slate-900">{project?.title ?? 'connect a project'}</h3>
                                </div>
                            </div>:
                            <div className="flex items-center gap-2">
                                <img src="/svg/danger.svg" alt="Danger" className="w-6 h-6" />
                                <p className='italic text-slate-500 text-sm'>connect to a project to get started</p>
                            </div>
                            }

                            <div className="flex items-center gap-2.5">
                                <div className='w-[400px]'>
                                <SelectOptionAsObjectValue
                                    disabled={isConnected}
                                    options={req_data?.projects || []}
                                    value={projectSelected || {}}
                                    changeAll={true}
                                    containerClass="bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg pl-3 pr-3 py-2 outline-none focus:ring-2 focus:ring-primary cursor-pointer"
                                    valueProp="_id"
                                    label='Select a project'
                                    labelProp="title"
                                    onChange={(e) => setProjectSelected(e)}
                                />
                                </div>
                                {isConnected?
                                <button
                                    type="button"
                                    onClick={disconnectProject}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg"
                                >
                                    Disconnect
                                </button>:
                                <LoadButton
                                    isLoading={connectLoading}
                                    disabled={!projectSelected?._id}
                                    loadingLabel=''
                                    onClick={() => connectProject()}
                                    className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg"
                                >
                                    {connectLoading ? 'Connecting...' : 'Connect'}
                                </LoadButton>
                                }
                            </div>
                        </div>

                        <div className="pt-3 border-t border-slate-100">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Project Tables</span>
                                <span style={activeTable?{}:{visibility:'hidden'}} className="text-xs text-slate-400">{tables.length} {'total table(s) in project'}</span>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                {tables.length ? tables.map((table) => (
                                    <button
                                        key={table.id}
                                        type="button"
                                        onClick={() => setActiveTable(table.id)}
                                        className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-lg transition-all ${activeTable === table.id
                                            ? 'text-primary bg-blue-50 border-2 border-primary shadow-sm'
                                            : 'text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 border border-slate-200'
                                            }`}
                                    >
                                        <span className={`w-2 h-2 rounded-full ${activeTable === table.id ? 'bg-primary ring-2 ring-blue-200' : 'bg-slate-300'}`}></span>
                                        {table.label}
                                        <span className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-200/70 text-slate-600 rounded">{table.rows.toLocaleString()} rows</span>
                                    </button>
                                )) : (
                                    <p className="text-sm text-slate-500 italic">Connect a project to see its tables.</p>
                                )}
                            </div>
                        </div>
                    </section>

                    <section style={!activeTable?{display:'none'}:{}} className="relative bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50/50 p-2.5 rounded-2xl border border-blue-100 shadow-sm">
                        <div className="flex items-center bg-white rounded-xl border border-blue-200/80 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-blue-100">
                            <div className="pl-3.5 pr-2 text-primary flex items-center justify-center">
                                <img src="/svg/magic.svg" alt="" className="w-5 h-5" />
                            </div>
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Tell us what to find in this dataset..."
                                className="w-full py-3 px-2 text-sm text-slate-800 placeholder-slate-400 bg-transparent outline-none"
                            />
                            <div className="pr-2 py-1.5 flex items-center gap-x-2">
                                <button
                                    type="button"
                                    onClick={() => setShowFilterBox(true)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-slate-700 bg-white w-[150px] flex justify-center hover:bg-slate-50 border border-slate-300 rounded-lg shadow-sm"
                                >
                                    Open Filter Builder
                                </button>
                                <LoadButton
                                    isLoading={filterPlanLoading}
                                    disabled={!query.trim()}
                                    loadingLabel=''
                                    onClick={() => generateFilterPlan()}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm"
                                >
                                    {filterPlanLoading ? 'Filtering...' : 'Filter'}
                                </LoadButton>
                            </div>
                        </div>
                    </section>

                    <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 flex flex-col tablet:flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/40">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary text-white rounded-lg shadow-sm">
                                    <img src="/svg/sidebar/table.svg" alt="" className="w-4 h-4 invert" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">{activeTableMeta?.label || 'No table selected'}</h3>
                                        <span style={activeTable?{}:{visibility:'hidden'}} className="inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded bg-slate-100 text-slate-600 border border-slate-200">active table</span>
                                    </div>
                                </div>
                            </div>

                            {isConnected ? (
                                <div className="flex flex-wrap items-center gap-2.5">
                                    {(filters[activeTable] || [])?.slice(0,3)?.map((group, groupIndex) => (
                                        <div key={groupIndex} className="inline-flex items-center bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-700 shadow-sm">
                                            {groupIndex > 0 ? <span className="text-primary font-bold mr-1.5">OR</span> : null}
                                            <span className="font-semibold text-slate-800">
                                                {group.map((condition) => `${condition.table && condition.table !== activeTable ? `${condition.table}.` : ''}${condition.column} ${condition.filterOpt} ${condition.value}`).join(' AND ')}
                                            </span>
                                            <button type="button" onClick={() => removeFilterGroup(groupIndex)} className="ml-2 text-slate-400 hover:text-slate-600">
                                                <img src="/svg/close.svg" className="w-2 h-2"/>
                                            </button>
                                            {groupIndex===2 && filters[activeTable]?.length>3?<p>++</p>:null}

                                        </div>
                                    ))}
                                    { filters[activeTable]?.length>3?<p className="text-xs text-gray-300 ml-[-4px]">+{filters[activeTable]?.length-3}</p>:null}

                                    <button
                                        type="button"
                                        onClick={() => setShowFilterBox(true)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-sm"
                                    >
                                        + Add Filter
                                    </button>

                                    <button
                                        type="button"
                                        disabled={!filters[activeTable]?.length}
                                        onClick={refreshView}
                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg border border-transparent hover:border-slate-200"
                                    >
                                        Refresh ↻
                                    </button>
                                </div>
                            ) : null}
                        </div>

                        {isConnected && project ? (
                            <>
                                <div className="overflow-x-auto border-b border-slate-200">
                                    <table className="border-seperate w-full text-left border-collapse min-w-[900px]">
                                        <thead className="bg-slate-50 text-slate-700 text-xs uppercase tracking-wider sticky top-0 z-10 border-b border-slate-200">
                                            <tr>
                                                <th scope="col" className="py-3 px-3 text-center text-slate-400 font-mono text-[11px] w-12 border-r border-slate-200/60">#</th>
                                                {activeColumns.map((column) => (
                                                    <th key={column.key} scope="col" className="py-3 px-4 border-r border-slate-200/60 last:border-r-0">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="font-bold text-slate-900 normal-case text-xs">{column.label}</span>
                                                            {column.badge ? (
                                                                <span
                                                                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold border ${column.badge === 'PK'
                                                                        ? 'bg-amber-100 text-amber-800 border-amber-300/80'
                                                                        : 'bg-indigo-100 text-indigo-800 border-indigo-300/80'
                                                                        }`}
                                                                >
                                                                    {column.badge}
                                                                </span>
                                                            ) : null}
                                                        </div>
                                                        <span className="text-[10px] normal-case font-mono font-medium text-slate-400 block mt-0.5">{column.type}</span>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                    </table>

                                    {/* Only the row body scrolls — header above and pagination below stay fixed */}
                                    <div className="max-h-[200px] overflow-y-auto">
                                        <table className="w-full text-left border-collapse min-w-[900px]">
                                            <tbody className="divide-y divide-slate-100 text-xs font-normal text-slate-700 bg-white">
                                                {pagedRows.length ? pagedRows.map((row, index) => (
                                                    <tr key={(page - 1) * ROWS_PER_PAGE + index} className="hover:bg-blue-50/30">
                                                        <td className="py-2.5 px-3 text-center text-slate-400 font-mono border-r border-slate-100 w-12">{(page - 1) * ROWS_PER_PAGE + index + 1}</td>
                                                        {activeColumns.map((column) => (
                                                            <td key={column.key} className="py-2.5 px-4 border-r border-slate-100 last:border-r-0 max-w-[220px] truncate" title={String(row[column.key] ?? '')}>
                                                                {column.badge === 'FK' ? (
                                                                    <div className='relative'>
                                                                    <div className="flex items-center justify-between gap-2 bg-slate-50/80 px-2 py-1 rounded border border-slate-200/80">
                                                                        <span className="font-mono font-semibold text-slate-900 text-[11px] truncate">{row[column.key]}</span>
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => openFkPreview(column, row[column.key])}
                                                                            title={`View related record in ${column.fkTable}`}
                                                                            className="w-5 h-5 shrink-0 rounded bg-white hover:bg-primary hover:text-white text-primary border border-slate-200 hover:border-primary flex items-center justify-center font-bold text-xs"
                                                                        >
                                                                            +
                                                                        </button>
                                                                    </div>
                                                                   
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-slate-600">{String(row[column.key] ?? '')}</span>
                                                                )}
                                                            </td>
                                                        ))}
                                                    </tr>
                                                )) : (
                                                    <tr>
                                                        <td colSpan={activeColumns.length + 1} className="py-8 text-center text-sm text-slate-400 italic">
                                                            No rows to display for this table.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="px-5 py-3.5 flex flex-col tablet:flex-col sm:flex-row items-center justify-between gap-3 text-xs bg-slate-50/40">
                                    {/* <div className="flex items-center gap-2">
                                        <span className="text-slate-500">Showing</span>
                                        <span className="font-semibold text-slate-900">{activeRows.length ? `${(page - 1) * ROWS_PER_PAGE + 1}\u2013${Math.min(page * ROWS_PER_PAGE, activeRows.length)}` : '0'}</span>
                                        <span className="text-slate-500">of</span>
                                        <span className="font-semibold text-slate-900">{activeRows.length}</span>
                                        <span className="text-slate-500">records{activeTableMeta ? ` (${activeTableMeta.label})` : ''}</span>
                                    </div> */}

                                    <div className="flex items-center space-x-1">
                                        <button
                                            type="button"
                                            disabled={page <= 1}
                                            onClick={() => setPage((p) => Math.max(1, p - 1))}
                                            className={`px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-xs font-semibold ${page <= 1 ? 'text-slate-300 cursor-not-allowed' : 'text-slate-700 hover:bg-slate-50'}`}
                                        >
                                            {"‹"}
                                        </button>
                                        {pageNumbers.map((p, i) => p === '...' ? (
                                            <span key={`ellipsis-${i}`} className="px-2 text-slate-400">...</span>
                                        ) : (
                                            <button
                                                key={p}
                                                type="button"
                                                onClick={() => setPage(p)}
                                                className={`px-3 py-1.5 rounded-md text-xs font-semibold ${p === page ? 'bg-primary text-white shadow-sm' : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 font-medium'}`}
                                            >
                                                {p}
                                            </button>
                                        ))}
                                        <button
                                            type="button"
                                            disabled={page >= pageCount}
                                            onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                                            className={`px-2.5 py-1.5 rounded-md border border-slate-200 bg-white text-xs font-semibold ${page >= pageCount ? 'text-slate-300 cursor-not-allowed' : 'text-slate-700 hover:bg-slate-50'}`}
                                        >
                                            {'›'}
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="py-10 text-center text-sm text-slate-400 italic">
                                Connect a project to view its data.
                            </div>
                        )}
                    </section>
                </div>
                
            </div>

            {showFilterBox ? (
                <FilterBox
                    data={{ id: project?._id, active_filter:filters[activeTable] }}
                    setShowModal={() => setShowFilterBox(false)}
                    activeTable={activeTable}
                    activeColumns={activeColumns}
                    relationships={project?.table_relationships || []}
                    rows={rawActiveRows}
                    openFkPreview={openFkPreview}
                    onApply={(filterGroups) => setFilters((prev) => ({ ...prev, [activeTable]: filterGroups }))}
                />
            ) : null}

             {previewFk ? (
    <ModalLayout onClose={() => setPreviewFk(null)}>
        <div className="section bg-white rounded-xl border border-indigo-100 shadow-sm p-4 ">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                        <img src="/svg/link-attached.svg" alt="" className="w-4 h-4" />
                    </div>
                    <div>
                        <div className=" gap-2">
                            <p className="text-sm font-bold text-indigo-900">Foreign Key Reference Preview</p>
                            <p className="px-2 py-0.5 rounded text-xs font-semibold bg-indigo-100 text-indigo-800">
                                Referenced: {previewFk.table} → {previewFk.column} = {previewFk.value}
                            </p>
                        </div>
                    </div>
                </div>
                <button
                    type="button"
                    onClick={() => setPreviewFk(null)}
                    className="text-slate-400 hover:text-slate-600 text-sm font-bold"
                >
                    <img src="/svg/close.svg" alt="Close" className="w-4 h-4" />
                </button>
            </div>

            {previewFk.match ? (
                <div className="mt-3 bg-white rounded-lg border border-indigo-100/80 overflow-hidden">
                    <div className="grid grid-cols-2 sm:grid-cols-3">
                        {Object.entries(previewFk.match).slice(0, 6).map(([key, value], ind) => (
                            <div
                                key={key}
                                className="p-2.5 border-b border-r border-indigo-100/60 last:border-r-0 [&:nth-child(3n)]:border-r-0"
                            >
                                <div className="text-[10px] uppercase tracking-wide text-slate-400 font-mono truncate">
                                    {key}
                                </div>
                                <div className="text-xs font-mono font-semibold text-slate-800 truncate mt-0.5">
                                    {String(value)}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                        ) : (
                            <p className="text-xs text-slate-500 mt-2">No matching record found in {previewFk.table}.</p>
                        )}
                    </div>
                </ModalLayout>
            ) : null}
        </div>
    )
}