

import { DeleteVisualHelper, LoadButton, SelectOption } from "@/components";
// import ModalLayout from "../modalLayout"
import {  useContext, useEffect, useMemo, useState } from "react";
import { DataRequestContext } from "@/context";
import { API_ENDPOINTS, chartChecker, commafy, consolelog } from "@/configs";
import { useHttpServices, useToast } from "@/hooks";
import { useRouter } from "next/router";
import { useMutation } from "@tanstack/react-query";
import { ModalLayout } from "..";


function ColumnPickerModal({ open, onClose, columnsByTable, colType, onSelect }) {
    const [expandedTable, setExpandedTable] = useState(null)
    const [expandedRef, setExpandedRef] = useState(null)

    if (!open) return null

    const matchesType = (column) =>
        !colType?.length || colType.includes(column.cat)

    const selectColumn = (table, column) => {
        onSelect({ table, col: column.col })
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-[480px] max-h-[70vh] overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-slate-900">Select a Column</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-lg leading-none text-slate-400 hover:text-slate-700"
                        aria-label="Close column picker"
                    >
                        <img src="/svg/close.svg" alt="Close" className="w-3 h-3" />
                    </button>
                </div>

                {Object.entries(columnsByTable).map(([table, tableColumns]) => {
                    const matchingColumns = tableColumns.filter(matchesType)
                    if (!matchingColumns.length) return null

                    return (
                        <div key={table} className="mb-2 border border-slate-200 rounded-lg">
                            <button
                                type="button"
                                onClick={() => setExpandedTable(expandedTable === table ? null : table)}
                                className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-700 bg-slate-50 rounded-t-lg flex justify-between items-center"
                            >
                                <span className="truncate pr-2">{table}</span>
                                <span>{expandedTable === table ? '-' : '+'}</span>
                            </button>

                            {expandedTable === table && (
                                <div className="p-2 space-y-1">
                                    {matchingColumns.map((column) => {
                                        const referenceKey = `${table}::${column.col}`
                                        const referenceColumns = column.references
                                            ? (columnsByTable[column.references.table] || []).filter(matchesType)
                                            : []

                                        return (
                                            <div key={column.col}>
                                                <button
                                                    type="button"
                                                    onClick={() => selectColumn(table, column)}
                                                    className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-indigo-50 flex justify-between items-center"
                                                >
                                                    <span>{column.col}</span>
                                                    {column.references && (
                                                        <span className="text-[10px] text-indigo-500">linked</span>
                                                    )}
                                                </button>

                                                {column.references && referenceColumns.length > 0 && (
                                                    <div className="ml-4 mt-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => setExpandedRef(expandedRef === referenceKey ? null : referenceKey)}
                                                            className="text-[11px] text-slate-400 hover:text-indigo-500"
                                                        >
                                                            {expandedRef === referenceKey ? 'Hide' : 'Show'} columns from {column.references.table}
                                                        </button>

                                                        {expandedRef === referenceKey && (
                                                            <div className="mt-1 space-y-1">
                                                                {referenceColumns.map((referenceColumn) => (
                                                                    <button
                                                                        key={referenceColumn.col}
                                                                        type="button"
                                                                        onClick={() => selectColumn(column.references.table, referenceColumn)}
                                                                        className="w-full text-left px-2 py-1 text-xs rounded hover:bg-indigo-50 text-slate-600"
                                                                    >
                                                                        {referenceColumn.col}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}

function MultiColumnPickerModal({
    open,
    onClose,
    columnsByTable,
    colType,
    value = [],
    minValues,
    maxValues,
    onSelect,
}) {
    const [selectedTable, setSelectedTable] = useState('')
    const [selectedColumns, setSelectedColumns] = useState(value)

    useEffect(() => {
        if (!open) return

        const initialTable = value[0]?.table || Object.keys(columnsByTable)[0] || ''
        setSelectedTable(initialTable)
        setSelectedColumns(value)
    }, [open, value, columnsByTable])

    if (!open) return null

    const tableColumns = (columnsByTable[selectedTable] || [])
        .filter(({cat}) => !colType?.length || colType.includes(cat))

    const selectedForTable = selectedColumns.filter(({table}) => table === selectedTable)
    const toggleColumn = (column) => {
        const columnValue = { table: selectedTable, col: column.col }
        const isSelected = selectedColumns.some(
            ({table, col}) => table === selectedTable && col === column.col
        )

        if (isSelected) {
            setSelectedColumns((current) => current.filter(
                ({table, col}) => !(table === selectedTable && col === column.col)
            ))
            return
        }

        if (selectedColumns.length >= maxValues) return
        setSelectedColumns((current) => [...current, columnValue])
    }

    const saveSelection = () => {
        if (selectedColumns.length < minValues) return
        onSelect(selectedColumns)
        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
            <div className="w-full max-w-[480px] rounded-xl bg-white p-4 shadow-xl">
                <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">Select Columns</h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-lg leading-none text-slate-400 hover:text-slate-700"
                        aria-label="Close column picker"
                    >
                        <img src="/svg/close.svg" alt="Close" className="h-3 w-3" />
                    </button>
                </div>

                <label className="mb-1 block text-xs font-medium text-slate-700">Table</label>
                <SelectOption
                    options={Object.keys(columnsByTable)}
                    value={selectedTable}
                    label="Select table"
                    onChange={(table) => setSelectedTable(table)}
                    containerClass="border border-slate-200 bg-white"
                    extraOptionClass="text-sm py-2 px-3"
                />
            
                <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between">
                        <label className="block text-xs font-medium text-slate-700">Columns</label>
                        <span className="text-[11px] text-slate-400">{selectedColumns.length}/{maxValues}</span>
                    </div>
                    <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200">
                        {tableColumns.map((column) => {
                            const checked = selectedForTable.some(({col}) => col === column.col)
                            const disabled = !checked && selectedColumns.length >= maxValues

                            return (
                                <label key={column.col} className="flex cursor-pointer items-center gap-3 border-b border-slate-100 px-3 py-2 text-sm last:border-b-0 hover:bg-indigo-50">
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        disabled={disabled}
                                        onChange={() => toggleColumn(column)}
                                        className="h-4 w-4"
                                    />
                                    <span>{column.col}</span>
                                </label>
                            )
                        })}
                    </div>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                    <button type="button" onClick={onClose} className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                    <button
                        type="button"
                        disabled={selectedColumns.length < minValues}
                        onClick={saveSelection}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Apply
                    </button>
                </div>
            </div>
        </div>
    )
}


export default function ActionChartModal({ data, onNext, onClose }) {
    const [formData, setFormData] = useState({})

    const { newVisuals, columns, project} = useContext(DataRequestContext);
    // console.log({columns})
    return (
        <ChartInputBox
            goBack={true}
            columns={columns}
            formData={formData}
            setFormData={setFormData}
            isEdit={false}
            project_data={project}
            onNext={(form) => {
                onNext(form)
            }}
            onClose={onClose}
            data={data}
        />
    )
}


function ChartInputBox({
    formData,
    onNext,
    setFormData,
    onClose = () => null,
    excludeBtn = false,
    columns,
    goBack,
    isEdit,
    project_data,
    data
}) {
    const rules_for_chartTypes = API_ENDPOINTS.LIST_CHARTS
    // console.log({ project_data })
    const {setNewVisuals}= useContext(DataRequestContext)
    const { NotifySuccess, NotifyError } = useToast()
    const { postData } = useHttpServices()
    const router = useRouter()
    const [dataiPrompt, setDataiPrompt] = useState('')
    const [askDataiOpen, setAskDataiOpen] = useState(false)
    const normalizedColumns = useMemo(() => {
        const projectColumns = chartChecker.resolveProjectColumns(columns, project_data)
        if (!projectColumns) return []
        return projectColumns.map((column) => ({
            ...column,
            cat: chartChecker.normalizeColumnType(column.cat) || column.cat
        }))
    }, [columns, project_data])
    const columnsByTable = useMemo(
        () => chartChecker.groupColumnsByTable(
            normalizedColumns,
            project_data?.table_relationships
        ),
        [normalizedColumns, project_data?.table_relationships]
    )
    const selectedAxisTables = useMemo(() => {
        const getTable = (selection) => {
            if (!selection) return []

            const selections = Array.isArray(selection) ? selection : [selection]
            return selections.flatMap((value) => {
                if (value && typeof value === 'object') {
                    return value.table || value.datasetName ? [value.table || value.datasetName] : []
                }

                const column = normalizedColumns.find(({col}) => col === value)
                return column?.table || column?.datasetName ? [column.table || column.datasetName] : []
            })
        }

        return [...new Set(getTable(formData.x))]
    }, [formData.x, normalizedColumns])
    const hasSelectedX = selectedAxisTables.length > 0
    const selectedYTables = useMemo(() => {
        const selections = Array.isArray(formData.y)
            ? formData.y
            : formData.y
                ? [formData.y]
                : []

        return [...new Set(selections.map((value) => {
            if (value && typeof value === 'object') return value.table || value.datasetName
            const column = normalizedColumns.find(({col}) => col === value)
            return column?.table || column?.datasetName
        }).filter(Boolean))]
    }, [formData.y, normalizedColumns])
    const directlyRelatedTables = useMemo(
        () => chartChecker.getDirectlyRelatedTables(
            project_data?.table_relationships,
            selectedAxisTables
        ),
        [project_data?.table_relationships, selectedAxisTables]
    )
    const yColumnsByTable = useMemo(
        () => Object.fromEntries(
            Object.entries(columnsByTable).filter(([table]) => directlyRelatedTables.has(table))
        ),
        [columnsByTable, directlyRelatedTables]
    )
    const groupByColumnsByTable = useMemo(() => {
        if (!hasSelectedX) return {}

        const groupByType = rules_for_chartTypes[
            chartChecker.normalizeChartType(formData?.chartType)
        ]?.group_by?.colType || []
        const isValidGroupColumn = ({cat}) => !groupByType.length || groupByType.includes(cat)

        const allowedTables = formData.y && selectedYTables.length
            ? new Set([...selectedAxisTables, ...selectedYTables])
            : directlyRelatedTables

        return Object.fromEntries(
            Object.entries(columnsByTable)
                .filter(([table]) => allowedTables.has(table))
                .map(([table, tableColumns]) => [table, tableColumns.filter(isValidGroupColumn)])
        )
    }, [columnsByTable, directlyRelatedTables, formData?.chartType, formData.y, hasSelectedX, selectedAxisTables, selectedYTables])
    const hasGroupByOptions = Object.values(groupByColumnsByTable).some(
        (tableColumns) => tableColumns.length > 0
    )
    const [pickerOpen, setPickerOpen] = useState(null)

    const getSelectedFormTables = (currentFormData) => [
        currentFormData.x,
        currentFormData.y,
        currentFormData.group_by
    ]
        .flatMap((selection) => Array.isArray(selection) ? selection : [selection])
        .map((selection) => selection?.table)
        .filter(Boolean)

    const getFormRelationships = (currentFormData) => {
        const selectedTables = new Set(getSelectedFormTables(currentFormData))

        return (project_data?.table_relationships || []).filter((relationship) => {
            const fromTable = relationship?.from_table || relationship?.source_table
            const toTable = relationship?.to_table || relationship?.target_table

            return fromTable && toTable && selectedTables.has(fromTable) && selectedTables.has(toTable)
        })
    }

    const plotForm = () => {
        const selectedTables = [...new Set(getSelectedFormTables(formData))]

        if (selectedTables.length > 2) {
            return NotifyError('You can use no more than 2 tables for a plot.')
        }

        const relationships = getFormRelationships(formData)
        const plottedFormData = {
            ...formData,
            relationships
        }   
        console.log({plottedFormData})
        setFormData(plottedFormData)
        setNewVisuals((prev) => [...prev, plottedFormData])
        onClose()
    }

    useEffect(() => {
        const selectedGroupBy = formData.group_by
        if (!selectedGroupBy || !selectedGroupBy.col) return

        const isStillAvailable = Object.values(groupByColumnsByTable).some((tableColumns) =>
            tableColumns.some(({col, table}) =>
                col === selectedGroupBy.col && table === selectedGroupBy.table
            )
        )

        if (!isStillAvailable) {
            setFormData((current) => ({...current, group_by: null}))
        }
    }, [formData.group_by, groupByColumnsByTable])

    const editChartQuery = async () => {
        const { chartType, status, ...rest_form_data } = formData
        const body = {
            ...rest_form_data,
            plot_type: chartType
        }

        const columnFields = ['x', 'y', 'z', 'group_by']
        columnFields.forEach((field) => {
            const selectedColumn = body[field]
            if (!selectedColumn || typeof selectedColumn !== 'object' || Array.isArray(selectedColumn)) return

            body[field] = selectedColumn.col
            body[`${field}_table`] = selectedColumn.table
        })

        if (!isEdit) {
            const { error } = chartChecker.chatFormChecker(formData)

            if (error) {
                return NotifyError(error)
            }
        }

        return await postData({
            path: isEdit
                ? API_ENDPOINTS.EDIT_CHART
                : API_ENDPOINTS.ADD_CHART,

            body: {
                mainId: router?.query?.id,
                chartInd: isEdit ? data.chartInd : 22,
                ...body
            }
        })
    }
   
    const chartCards = [
        {
            value: "area chart",
            label: "Area Chart",
            tag: "Trends",
            icon: (
                <svg
                    className="w-14 h-8 text-indigo-600"
                    fill="none"
                    viewBox="0 0 56 32"
                >
                    <path
                        d="M2 28L14 18L26 23L42 7L54 14V30H2V28Z"
                        fill="currentColor"
                        fillOpacity="0.2"
                    />

                    <path
                        d="M2 28L14 18L26 23L42 7L54 14"
                        stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.2"
                        />
                </svg>
            )
        },
        {
            value: "bar chart",
            label: "Vertical Bar",
            tag: "Comparison",
            icon: (
                <div className="h-10 w-full flex items-end justify-center gap-1.5 mb-2">
                    <div className="w-2.5 h-4 bg-slate-300 group-hover:bg-slate-400 rounded-t" />
                    <div className="w-2.5 h-7 bg-indigo-500 rounded-t" />
                    <div className="w-2.5 h-5 bg-slate-300 group-hover:bg-slate-400 rounded-t" />
                    <div className="w-2.5 h-8 bg-slate-300 group-hover:bg-slate-400 rounded-t" />
                </div>
            )
        },

        {
            value: "bar chart",
            label: "Horizontal Bar",
            tag: "Ranking",
            icon: (
                <div className="h-10 w-full flex flex-col justify-center gap-1.5 px-2 mb-2">
                    <div className="w-3/4 h-2 bg-slate-300 group-hover:bg-slate-400 rounded-r" />
                    <div className="w-full h-2 bg-indigo-400 rounded-r" />
                    <div className="w-1/2 h-2 bg-slate-300 group-hover:bg-slate-400 rounded-r" />
                </div>
            )
        },

        {
            value: "line chart",
            label: "Line Chart",
            tag: "Trends",
            icon: (
                <svg
                    className="w-14 h-7 text-slate-400 group-hover:text-slate-600"
                    fill="none"
                    viewBox="0 0 56 28"
                >
                    <path
                        d="M2 22L16 12L28 17L42 5L54 11"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                    />

                    <circle cx="28" cy="17" fill="currentColor" r="2.5" />
                    <circle cx="42" cy="5" fill="currentColor" r="2.5" />
                </svg>
            )
        },

        {
            value: "pie chart",
            label: "Pie Chart",
            tag: "Share %",
            icon: (
                <svg
                    className="w-8 h-8 text-slate-400 group-hover:text-slate-600"
                    viewBox="0 0 32 32"
                >
                    <circle
                        cx="16"
                        cy="16"
                        r="14"
                        fill="#e2e8f0"
                    />

                    <path
                        d="M16 16 L16 2 A14 14 0 0 1 30 16 Z"
                        fill="#6366f1"
                    />

                    <path
                        d="M16 16 L30 16 A14 14 0 0 1 16 30 Z"
                        fill="#a5b4fc"
                    />
                </svg>
            )
        },

        {
            value: "bar chart",
            label: "Stacked Bar",
            tag: "Segments",
            icon: (
                <div className="h-10 w-full flex items-end justify-center gap-2 mb-2">
                    <div className="w-3 flex flex-col gap-0.5">
                        <div className="h-3 bg-indigo-600 rounded-xs" />
                        <div className="h-4 bg-indigo-300 rounded-xs" />
                    </div>

                    <div className="w-3 flex flex-col gap-0.5">
                        <div className="h-5 bg-indigo-600 rounded-xs" />
                        <div className="h-2 bg-indigo-300 rounded-xs" />
                    </div>
                </div>
            )
        },

        {
            value: "scatter plot",
            label: "Scatter Plot",
            tag: "Correlation",
            icon: (
                <div className="h-10 w-full flex items-center justify-center mb-2 relative">
                    <span className="w-2 h-2 bg-slate-400 rounded-full absolute top-2 left-3" />
                    <span className="w-2.5 h-2.5 bg-indigo-500 rounded-full absolute top-4 left-6" />
                    <span className="w-2 h-2 bg-slate-400 rounded-full absolute top-1 right-5" />
                    <span className="w-3 h-3 bg-slate-300 rounded-full absolute bottom-1 right-2" />
                </div>
            )
        },

        {
            value: "bubble chart",
            label: "Bubble Chart",
            tag: "3D Metrics",
            icon: (
                <div className="h-10 w-full flex items-center justify-center mb-2 relative">
                    <span className="w-3 h-3 rounded-full border border-indigo-400 bg-indigo-100/60 absolute top-1 left-3" />
                    <span className="w-5 h-5 rounded-full border border-indigo-600 bg-indigo-200/60 absolute top-3 left-6" />
                    <span className="w-3.5 h-3.5 rounded-full border border-slate-400 bg-slate-200/60 absolute top-1.5 right-4" />
                </div>
            )
        },

        {
            value: "matrix heatmap",
            label: "Heatmap",
            tag: "Density",
            icon: (
                <div className="h-10 w-full grid grid-cols-3 gap-1 px-4 mb-2">
                    <div className="bg-indigo-100 rounded-xs" />
                    <div className="bg-indigo-300 rounded-xs" />
                    <div className="bg-indigo-600 rounded-xs" />
                    <div className="bg-indigo-400 rounded-xs" />
                    <div className="bg-indigo-200 rounded-xs" />
                    <div className="bg-indigo-500 rounded-xs" />
                </div>
            )
        },

        {
            value: "radar chart",
            label: "Radar Chart",
            tag: "Multi-metric",
            icon: (
                <svg
                    className="w-8 h-8 text-slate-400 group-hover:text-slate-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <polygon
                        points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"
                        strokeWidth="1.5"
                    />

                    <polygon
                        fill="currentColor"
                        fillOpacity="0.2"
                        points="12 6 18 10 18 14 12 18 6 14 6 10"
                        strokeWidth="1.2"
                    />
                </svg>
            )
        },

        {
            value: "box plot",
            label: "Box Plot",
            tag: "Distribution",
            icon: (
                <div className="h-10 w-full flex items-center justify-center gap-3 mb-2">
                    <div className="flex flex-col items-center">
                        <div className="w-0.5 h-1.5 bg-slate-400" />
                        <div className="w-3 h-4 border border-slate-400 rounded-xs bg-slate-100 flex items-center justify-center">
                            <div className="w-full h-0.5 bg-indigo-500" />
                        </div>
                        <div className="w-0.5 h-1.5 bg-slate-400" />
                    </div>

                    <div className="flex flex-col items-center">
                        <div className="w-0.5 h-1 bg-slate-400" />
                        <div className="w-3 h-5 border border-indigo-400 rounded-xs bg-indigo-50 flex items-center justify-center">
                            <div className="w-full h-0.5 bg-indigo-600" />
                        </div>
                        <div className="w-0.5 h-1 bg-slate-400" />
                    </div>
                </div>
            )
        },

        {
            value: "violin plot",
            label: "Violin Plot",
            tag: "Spread",
            icon: (
                <svg
                    className="w-8 h-8 text-slate-400 group-hover:text-slate-600"
                    viewBox="0 0 32 32"
                    fill="currentColor"
                >
                    <path
                        d="M16 3 C13 8 10 11 12 16 C10 21 13 24 16 29 C19 24 22 21 20 16 C22 11 19 8 16 3 Z"
                        fillOpacity="0.2"
                        stroke="currentColor"
                        strokeWidth="1.5"
                    />

                    <line
                        x1="16"
                        y1="7"
                        x2="16"
                        y2="25"
                        stroke="#4f46e5"
                        strokeWidth="1.5"
                    />
                </svg>
            )
        },

        {
            value: "histogram", 
            label: "Histogram",
            tag: "Frequencies",
            icon: (
                <div className="h-10 w-full flex items-end justify-center gap-0.5 mb-2">
                    <div className="w-2 h-2 bg-slate-300 group-hover:bg-slate-400 rounded-t" />
                    <div className="w-2 h-4 bg-indigo-300 rounded-t" />
                    <div className="w-2 h-7 bg-indigo-600 rounded-t" />
                    <div className="w-2 h-5 bg-indigo-400 rounded-t" />
                    <div className="w-2 h-3 bg-slate-300 group-hover:bg-slate-400 rounded-t" />
                    <div className="w-2 h-1 bg-slate-300 group-hover:bg-slate-400 rounded-t" />
                </div>
            )
        }
    ]
   
    const formChange = (e, key, option = false, status = false) => {

        if (key === 'chartType') {
            setFormData({
                ...formData,
                chartType: e,
                x: null,
                y: null,
                group_by: null,
                aggregate: 'count',
                unit: null,
            })

            return
        }

        if (key === 'x') {
            setFormData({
                ...formData,
                x: e,
                y: null,
                group_by: null,
                unit: null,
            })

            return
        }

        if (status) {
            const value = e.target.value
            const currentArray = formData[key] || []
            const updatedArray = [...currentArray, value]

            return setFormData({
                ...formData,
                [key]: updatedArray
            })
        }

        if (option) {
            return setFormData({
                ...formData,
                [key]: e
            })
        }

        return setFormData({
            ...formData,
            [key]: e.target.value
        })
    }

    const askDataiQuery = async () => postData({
        path: API_ENDPOINTS.ASK_DATAI,
        body: {
            input: dataiPrompt.trim(),
            project_details: project_data,
            formData
        }
    })

    const { mutate: askDatai, isPending: askDataiLoading } = useMutation({
        mutationFn: askDataiQuery,
        onError: ({ error }) => NotifyError(error?.message || 'Could not get chart assistance'),
        onSuccess: ({ data }) => {
            const suggestedFormData = data?.formData || data?.chart || data?.data?.formData || data?.data

            if (!suggestedFormData || typeof suggestedFormData !== 'object') {
                return NotifyError('Datai returned an invalid chart configuration.')
            }

            setFormData({
                ...suggestedFormData,
                chartType: chartChecker.normalizeChartType(
                    suggestedFormData.chartType || suggestedFormData.plot_type
                )
            })
            setDataiPrompt('')
            setAskDataiOpen(false)
            NotifySuccess('Chart parameters updated')
        }
    })


    const [rules_for_chartType, setRulesForChartType] = useState({})

    const no_cat_fields = chartChecker.no_cat_fields

    const disabledChartTypes = useMemo(() => {
        if (!columns) return [];
        // console.log({disabledChartTypes:chartChecker.getDisabledCharts(columns, project_data)})
        return chartChecker.getDisabledCharts(columns, project_data)
    }, [columns, project_data])


    useEffect(() => {
        if (!formData?.chartType) return

        setRulesForChartType(
            rules_for_chartTypes[chartChecker.normalizeChartType(formData?.chartType)] || {}
        )
    }, [formData?.chartType])
    useEffect(() => {
        if (!data) return

        setFormData({
            ...data,
            chartType: chartChecker.normalizeChartType(data.chartType)
        })
    }, [data])



    const box_inp = [
        {
            label: 'Title',
            id: 'title',
            type: 'text',
            name: 'title',
            placeholder: 'e.g. Monthly Revenue by Region',
            maxlength: 55
        },

        {
            label: 'X (Horizontal Values)',
            id: 'x',
            name: 'x',
            type: 'select',
            placeholder: 'name, brand...'
        },

        {
            label: 'Y (Vertical Values)',
            id: 'y',
            name: 'y',
            type: 'select',
            placeholder: 'price, amount...'
        },

        {
            label: 'Z (Bubble size)',
            id: 'z',
            name: 'z',
            type: 'select',
            placeholder: 'size, speed...'
        },

        {
            label: 'Group By',
            id: 'group_by',
            name: 'group_by',
            type: 'select',
            placeholder: 'gender, clubs..'
        },

        {
            label: 'Aggregate',
            id: 'group_by',
            name: 'aggregate',
            type: 'select',
            placeholder: 'count, sum...',
            options: ['count', 'sum', 'average']
        },

        {
            label: 'Date Unit',
            id: 'unit',
            name: 'unit',
            type: 'select_unit',
            placeholder: 'months, year..',
            options: ['none', 'hour', 'day', 'months', 'weeks', 'year']
        },

        // {
        //     label: 'Why this? (optional)',
        //     type: 'textarea',
        //     id: 'why',
        //     name: 'why',
        //     placeholder: 'Describe why this analysis is important',
        //     maxlength: 200
        // }
    ]
const chartCategories = [
    { label: "All", disabled: false },
    { label: "Trend", disabled: true },
    { label: "Comparison", disabled: true },
    { label: "Composition", disabled: true },
];

    return (
        <div className="space-y-5 w-[800px] tablet:w-full px-6 tablet:px-4 py-5 bg-white rounded-md relative">

            

            {/* <div className="flex flex-col gap-1 mb-4 text-xs bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
                {['number', 'date', 'string'].map((x, ind) => {

                    const get_cats = columns.filter(
                        ({ cat }) => cat === x
                    )

                    return (
                        <div
                            key={ind}
                            style={
                                get_cats.length
                                    ? { order: ind }
                                    : { order: 5 }
                            }
                        >
                            {!get_cats.length ? (
                                <div className="max-w-[700px]">
                                    <p className="italic text-slate-400">
                                        {no_cat_fields[x]}
                                    </p>
                                </div>
                            ) : (
                                <p className="font-semibold text-slate-700">
                                    {x.replace('_', ' ')}:{' '}
                                    <span className="font-medium text-indigo-600">
                                        {get_cats.length}
                                    </span>
                                </p>
                            )}
                        </div>
                    )
                })}
            </div> */}

            

            {askDataiOpen && (
                <ModalLayout
                    open={askDataiOpen}
                    onClose={() => setAskDataiOpen(false)}
                    title="Ask Datai"
                >
                    <div className="w-full max-w-lg rounded-xl bg-white p-5 shadow-2xl">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h2 id="ask-datai-modal-heading" className="text-base font-semibold text-slate-900">
                                    Ask Datai
                                </h2>
                                <p className="mt-1 text-xs text-slate-500">
                                    Describe what you want to plot and Datai will fill in the parameters.
                                </p>
                            </div>
                            <button
                                type="button"
                                aria-label="Close Ask Datai"
                                onClick={() => setAskDataiOpen(false)}
                                className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                            >
                                <img src="/svg/close.svg" alt="Close" className="h-3.5 w-3.5" />
                            </button>
                        </div>

                        <textarea
                            autoFocus
                            value={dataiPrompt}
                            onChange={(event) => setDataiPrompt(event.target.value)}
                            className="mt-4 min-h-[110px] w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                            placeholder="e.g. Show monthly revenue by region as a bar chart"
                            maxLength={500}
                        />

                        <div className="mt-4 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={() => setAskDataiOpen(false)}
                                className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                            >
                                Cancel
                            </button>
                            <LoadButton
                                type="button"
                                isLoading={askDataiLoading}
                                load
                                disabled={!dataiPrompt.trim() || askDataiLoading}
                                onClick={() => askDatai()}
                                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {askDataiLoading ? 'Thinking...' : 'Ask Datai'}
                            </LoadButton>
                        </div>
                    </div>
                </ModalLayout>
            )}

            <section aria-labelledby="visual-selection-heading">

                <div className="flex items-center justify-between mb-3">

                    <div>
                        <h2
                            className="text-sm font-semibold text-slate-900"
                            id="visual-selection-heading"
                        >
                            Visual Display Type
                        </h2>

                        <p className="text-xs text-slate-500">
                            Select an interactive layout template for this chart component
                        </p>
                    </div>

                   <div
                        className="flex items-center space-x-1 bg-slate-100 p-1 rounded-lg text-xs"
                        role="tablist"
                    >
                        {chartCategories.map((category) => (
                            <button
                                key={category.label}
                                aria-selected={category.label === "All"}
                                disabled={category.disabled}
                                className={`px-2.5 py-1 font-medium rounded-md ${
                                    category.label === "All"
                                        ? "bg-white text-slate-900 shadow-xs"
                                        : "text-slate-400 cursor-not-allowed"
                                }`}
                                type="button"
                            >
                                {category.label}
                            </button>
                        ))}
                    </div>
                </div>


                <div
                    className="flex flex-nowrap overflow-x-auto gap-3 pb-2 custom-scrollbar"
                    style={{ scrollbarWidth: "thin" }}
                >

                    {chartCards.map((card) => {

                        const normalizedSelected = chartChecker.normalizeChartType(formData?.chartType);
                        const isChecked = normalizedSelected === card.value;
                        const isDisabledCard = disabledChartTypes.includes(card.value);

                        return (
                            <label
                                key={card.value + card.label}
                                className={
                                    "relative flex flex-col items-center justify-between p-3 rounded-xl border-2 shadow-xs transition group flex-shrink-0 " +
                                    (
                                        isDisabledCard
                                            ? "cursor-not-allowed opacity-45 border-slate-200 bg-slate-50 "
                                            : isChecked
                                                ? "border-indigo-600 bg-indigo-50/40 cursor-pointer "
                                                : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs cursor-pointer "
                                    )
                                }
                                style={{
                                    width: "140px",
                                    minWidth: "140px"
                                }}
                            >

                                <input
                                    type="radio"
                                    name="chart_type"
                                    value={card.value}
                                    checked={isChecked}
                                    className="sr-only peer"
                                    disabled={isDisabledCard}
                                    onChange={() => {
                                        if (isDisabledCard) return;
                                        formChange(card.value, 'chartType');
                                    }}
                                />


                                {isDisabledCard ? (
                                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px]">
                                        <img src="/svg/info.svg" alt="info" className="w-3 h-3" />
                                    </div>
                                ) : isChecked ? (
                                    <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">

                                        <svg
                                            className="w-3 h-3"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                d="M5 13l4 4L19 7"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="3"
                                            />
                                        </svg>

                                    </div>
                                ) : (
                                    <div className="absolute top-2 right-2 w-4 h-4 rounded border border-slate-300 group-hover:border-slate-400 bg-white" />
                                )}


                                <div className="h-10 w-full flex items-end justify-center px-1 mb-2">
                                    {card.icon}
                                </div>

                                <span
                                    className={
                                        "text-xs font-semibold text-center " +
                                        (
                                            isDisabledCard
                                                ? "text-slate-400"
                                                : isChecked
                                                    ? "text-indigo-900"
                                                    : "text-slate-700"
                                        )
                                    }
                                >
                                    {card.label}
                                </span>

                                <span
                                    className={
                                        "text-[10px] mt-0.5 " +
                                        (
                                            isDisabledCard
                                                ? "text-slate-400"
                                                : isChecked
                                                    ? "text-indigo-600"
                                                    : "text-slate-400"
                                        )
                                    }
                                >
                                    {card.tag}
                                </span>

                            </label>
                        )
                    })}

                </div>

            </section>


            <section
                aria-label="Visual Configuration Parameters"
                className="space-y-4"
            >

                <div className="flex items-center justify-between">

                <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                    <span>Data Mapping &amp; Parameters</span>
                </h2>
                <section className="flex items-center justify-between gap-4 rounded-xl border border-indigo-100 bg-indigo-50/40 px-5 py-1.5 tablet:items-start tablet:flex-col">
                    <div>
                        <p className="text-sm font-semibold text-slate-900">
                            Need assistance in what to plot?
                        </p>
                        {/* <p className="mt-1 text-xs text-slate-500">
                            Ask Datai to help choose your chart parameters.
                        </p> */}
                    </div>
                    <button
                            type="button"
                            onClick={() => setAskDataiOpen(true)}
                            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-1.5 text-[13px] text-white transition hover:bg-indigo-700"
                        >
                            Ask Datai
                    </button>
                </section>
                </div>

                <div>

                    <label className="block text-xs font-medium text-slate-700 mb-1">
                        Visual Title <span className="text-rose-500">*</span>
                    </label>

                    <input
                        type="text"
                        value={formData.title || ''}
                        onChange={(e) =>
                            formChange(e, 'title')
                        }
                        className="w-full text-sm rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder-slate-400 outline-none transition py-2.5 px-3"
                        placeholder="e.g. Monthly Revenue by Region"
                        maxLength={55}
                    />

                </div>


              

                <div className="grid grid-cols-3 gap-4">

                    {box_inp
                        .filter(({ name }) =>
                            ['x', 'y', 'z', 'group_by'].includes(name)
                        )
                        .map(({ label, name, placeholder }, ind) => {

                            const visible =
                                rules_for_chartTypes?.[
                                    formData?.chartType
                                ]?.[name]

                            if (!visible) return null

                            return (
                                <div key={name}>

                                    <label className="flex items-center justify-between text-xs font-medium text-slate-700 mb-1">

                                        <span>
                                            {label}{' '}

                                            {rules_for_chartType?.[name]?.isOptional && (
                                                <span className="text-slate-400 font-normal">
                                                    {'(optional)'}
                                                </span>
                                            )}
                                        </span>

                                    </label>


                                    {name === 'x' &&
                                    (
                                        formData?.chartType === 'matrix heatmap' ||
                                        formData?.chartType === 'radar chart'
                                    ) ? (

                                        <>
                                            <button
                                                type="button"
                                                disabled={!hasSelectedX && name !== 'x'}
                                                onClick={() => setPickerOpen(name)}
                                                className={`w-full text-left text-sm rounded-lg border border-slate-200 px-3 py-2.5 bg-white transition ${
                                                    !formData[name]?.length
                                                        ? 'text-slate-400 hover:border-slate-300'
                                                        : 'text-slate-700 hover:border-slate-300'
                                                }`}
                                            >
                                                {formData[name]?.length
                                                    ? `${formData[name].length} columns selected`
                                                    : `Select ${label}`}
                                            </button>
                                            <MultiColumnPickerModal
                                                open={pickerOpen === name}
                                                onClose={() => setPickerOpen(null)}
                                                columnsByTable={columnsByTable}
                                                colType={rules_for_chartType?.[name]?.colType}
                                                value={formData[name] || []}
                                                minValues={formData?.chartType === 'matrix heatmap' ? 1 : 3}
                                                maxValues={formData?.chartType === 'matrix heatmap' ? 6 : 5}
                                                onSelect={(value) => formChange(value, name, true)}
                                            />
                                        </>

                                    ) : (
                                                        <>
                                                            <button
                                                                type="button"
                                                                disabled={(name !== 'x' && !hasSelectedX) || (name === 'group_by' && !hasGroupByOptions)}
                                                                onClick={() => setPickerOpen(name)}
                                                                className={`w-full text-left text-sm rounded-lg border border-slate-200 px-3 py-2.5 bg-white transition ${
                                                                    (name !== 'x' && !hasSelectedX) || (name === 'group_by' && !hasGroupByOptions)
                                                                        ? 'cursor-not-allowed bg-slate-100 text-slate-400'
                                                                        : 'hover:border-slate-300'
                                                                }`}
                                                            >
                                                                {formData[name]?.col
                                                                    ? `${formData[name].col} (${formData[name].table})`
                                                                    : formData[name] || `Select ${label}`}
                                                            </button>
                                                            <ColumnPickerModal
                                                                open={pickerOpen === name && (name !== 'group_by' || hasGroupByOptions)}
                                                                onClose={() => setPickerOpen(null)}
                                                                columnsByTable={name === 'x'
                                                                    ? columnsByTable
                                                                    : name === 'group_by'
                                                                        ? groupByColumnsByTable
                                                                        : yColumnsByTable}
                                                                colType={rules_for_chartType?.[name]?.colType}
                                                                onSelect={(value) => formChange(value, name, true)}
                                                            />
                                                        </>

                                    )}

                                </div>
                            )
                        })}

                </div>
                <div className="grid grid-cols-2 gap-4">
                    {rules_for_chartTypes?.[
                        formData?.chartType
                    ]?.aggregate && (

                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                                Aggregate Function
                            </label>

                            <div className="grid grid-cols-3 gap-2">
                                {['count', 'sum', 'average'].map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        disabled={!hasSelectedX || (
                                            option !== 'count' &&
                                            normalizedColumns.find(({col}) =>
                                                col === (formData.y?.col || formData.y)
                                            )?.cat !== 'numerical_column'
                                        )}
                                        onClick={() => {
                                            formChange(
                                                option,
                                                'aggregate',
                                                true
                                            )
                                        }}
                                        className={`px-3 py-2 rounded-lg border text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50
                                            ${
                                                formData.aggregate === option
                                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                            }
                                        `}
                                    >
                                        {option.charAt(0).toUpperCase() + option.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                   {(
                        ['bar chart', 'area chart', 'line chart']
                            .includes(formData?.chartType) &&
                        normalizedColumns.find(
                            ({ col }) =>
                            col === (formData?.x?.col || formData?.x)
                        )?.cat === 'date_column'             
                    ) && (

                        <div>
                            <label className="block text-xs font-medium text-slate-700 mb-1">
                                Date Time Granularity
                            </label>

                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    'none',
                                    'hour',
                                    'day',
                                    'months',
                                    'weeks',
                                    'year'
                                ].map((option) => (
                                    <button
                                        key={option}
                                        type="button"
                                        disabled={!hasSelectedX}
                                        onClick={() => {
                                            formChange(
                                                option,
                                                'unit',
                                                true
                                            )
                                        }}
                                        className={`px-3 py-2 rounded-lg border text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50
                                            ${
                                                formData.unit === option
                                                    ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                                                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                            }
                                        `}
                                    >
                                        {option.charAt(0).toUpperCase() + option.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </section>


            {/* WHY THIS VISUAL */}
{/* 
            <section
                aria-label="Annotation & Key Takeaway Section"
                className="space-y-2"
            >

                <div className="flex items-center justify-between">

                    <label className="block text-xs font-medium text-slate-700">
                        Why this visual?{' '}
                        <span className="text-slate-400 font-normal">
                            (optional notes for collaborators)
                        </span>
                    </label>

                    <span className="text-[11px] text-slate-400">
                        Markdown supported
                    </span>

                </div>


                <textarea
                    value={formData.why || ''}
                    onChange={(e) =>
                        formChange(e, 'why')
                    }
                    className="w-full text-xs tablet:text-sm rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder-slate-400 transition p-3 outline-none"
                    placeholder="Describe why this analysis is important and highlight key targets or thresholds..."
                    rows={3}
                    maxLength={200}
                />

            </section> */}


            {!excludeBtn && (

                <div className=" items-center px-0 py-4 bg-slate-50 border-t border-slate-200/80 flex items-center justify-between gap-3">

                    <button
                        type="button"
                        onClick={() => onClose()}
                        className="w-fit px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 transition shadow-xs"
                        style={!goBack ? { visibility: 'hidden' } : {}}
                    >
                        Go Back
                    </button>


                    <div className="flex items-center gap-3 w-fit tablet:w-auto justify-end">

                        <button
                            // isLoading={edLoading}
                            onClick={plotForm}
                            disabled={formData?.title?.trim() === '' || !formData?.title}
                            className="w-full tablet:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md hover:shadow-indigo-500/25 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition duration-150"
                        >
                            <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    d="M5 13l4 4L19 7"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2.5"
                                />
                            </svg>

                            Plot
                        </button>

                    </div>

                </div>
            )}

        </div>
    )
}
// export default function ActionChartModal(
//     {btnLoadingState=false,onClose,isLoading=null, extraClass="", data, status, onNext}) {
//     const {columns, visualsSugg, setNewVisualsSugg}= useContext(DataRequestContext)
//     const [mount, setMount]= useState(false)

//     useEffect(()=>{
//         if(mount) return
//         setTimeout(()=>setMount(true), 1000)
//     } , [])

//     return (
//         <ModalLayout onClose={onClose}>
//             <div
//                 style={isLoading?{
//                     opacity:'0.5'
//                 }:{

//                 }}
//                 onClick={(e)=> e.stopPropagation()}
//                 className={"bg-white relative rounded-2xl shadow-2xl border border-slate-200/80 text-left w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-sm "+extraClass}>

//                 {/* Header */}
//                 <header className="px-6 tablet:px-8 py-5 border-b border-slate-100 flex items-start justify-between bg-white sticky top-0 z-20">
//                     <div>
//                         <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
//                             <span>Visual Studio</span>
//                             <span className="text-slate-300">&bull;</span>
//                             <span className="text-slate-500 font-medium normal-case tracking-normal">
//                                 {status==='add'?'Configure Visual':'Edit Visual'}
//                             </span>
//                         </div>
//                         <h1 className="text-xl tablet:text-2xl font-bold text-slate-900 tracking-tight">
//                             {status==='add'?'Configure Visual':'Edit Visual'}
//                         </h1>
//                         <p className="text-xs tablet:text-sm text-slate-500 mt-0.5">
//                             Map dataset dimensions, choose a visual layout, and set analysis parameters.
//                         </p>
//                     </div>
//                     <button
//                         aria-label="Close dialog"
//                         onClick={onClose}
//                         type="button"
//                         className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition duration-150 shrink-0"
//                     >
//                         <img src={'/svg/close.svg'} className="w-4 h-4"/>
//                     </button>
//                 </header>

//                 {/* Scrollable body */}
//                 <div
//                     style={mount?{}:{visibility:'hidden'}}
//                     className="overflow-y-auto custom-scrollbar flex-1 px-6 tablet:px-8 py-6"
//                 >
//                     <div>
//                     {status==='add'?
//                         <AddCharts
//                             setNewVisualsSugg={setNewVisualsSugg}
//                             columns={columns}
//                             onNext={onNext}
//                             visualsSugg={visualsSugg}
//                             data={data}
//                         />:
//                         <EditCharts
//                             noAutoEdit={true}
//                             data={data}
//                             columns={columns}
//                             visualsSugg={visualsSugg}
//                             onNext={onNext}
//                         />
//                     }
//                     </div>
//                 </div>
//             </div>
//             <style jsx>{`
//                 .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
//                 .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 9999px; }
//                 .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 9999px; }
//                 .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
//             `}</style>
//         </ModalLayout>

//     );
//   }
// // x, y, z, group_by, aggregate, unit,why,chartInd:ind, chartType, title, status:'edit'

// function AddCharts({columns, visualsSugg, data, onNext}){
//     const [step, setStep]= useState(-2)
//     const [actionModal, setActionModal]= useState({ status: 'add' })
//     const [formData, setFormData]=useState({})

//     const tableCols= ['s/n','chart-type','x', 'y', 'group_by', 'aggregate', 'unit', 'ACTION']
//     const [new_add_visuals, set_new_add_visuals]= useState([])
//     const [new_visuals_sugg, setNewVisualsSugg]= useState([])

//     const marked4Deleting=(ind, status)=>{
//         const visuals=[...new_visuals_sugg]
//         visuals[ind].marked4Delete= true
//         // console.log({ind, visuals:visuals[ind]})
//         setNewVisualsSugg(visuals)
//     }
//     const updateVisuals=(form)=>{
//         if(actionModal.status==='add'){
//             const visuals=[...new_add_visuals, form]
//             set_new_add_visuals(visuals)
//             return
//         }
//         const visuals=[...new_visuals_sugg]
//         visuals[step-1]= form
//         setNewVisualsSugg(visuals)
//         return
//     }

//     useEffect(()=>{
//         if(!visualsSugg?.length) return
//         const visuals= [...visualsSugg]
//         setNewVisualsSugg(visuals.map(({_id, ...props})=>(props)))
//     },[visualsSugg])

//     return(
//         <>
//          <div>
//             <div className="flex items-center justify-between mb-3">
//                 <div>
//                     <h2 className="text-sm font-semibold text-slate-900">
//                         All Visuals {step>0?' — Edit Visual':''}
//                     </h2>
//                     <p className="text-xs text-slate-500">Everything you've configured for this dashboard so far</p>
//                 </div>
//             </div>
//             <div>
//                 {step===0 && !actionModal?.status?
//                 <div>
//                     <div className="max-h-[350px] overflow-y-auto h-fit custom-scrollbar rounded-xl border border-slate-200">
//                     <table className={'border-separate w-[900px] tablet:w-full'}>
//                         <thead className="bg-slate-50">
//                             <tr>
//                                 {tableCols.map((col, index) => (
//                                     <th className='py-2.5 px-3 text-slate-500 uppercase tracking-wider text-[11px] font-semibold' key={index}
//                                         style={
//                                             col==="group_by"?{textAlign:"left", paddingLeft:"12px"}:
//                                             col==="ACTION"?{textAlign:"right", paddingRight:"24px"}:
//                                             {textAlign:"left"}
//                                             }
//                                         >
//                                         {col}
//                                     </th>
//                                 ))}
//                             </tr>
//                         </thead>
//                         <tbody className="bg-white">
//                             {new_visuals_sugg?.map(({status,...data},index)=>{
//                             const chart_types=data?.plot_type?.split(',') ?? []
//                             return(
//                                 <tr key={index} className={(data.marked4Delete?'opacity-50 ':'')+"text-[#414141] border-b border-slate-100 hover:bg-slate-50/60 transition"}>
//                                     <td className="text-left px-3 py-2.5">
//                                         <p className="text-slate-500">{index+1}</p>
//                                     </td>
//                                     <td className="text-left px-3 py-2.5">
//                                         <p className="font-medium text-slate-700">{chart_types[0]}{chart_types.length>1?'++':''}</p>
//                                     </td>
//                                     <td className="text-left px-3 py-2.5">
//                                         <p>{typeof data.x ==='string'? data.x:data.x[0]+'++'}</p>
//                                     </td>
//                                     <td className="text-left px-3 py-2.5">
//                                         <p>{data.y ?? 'N/A'}</p>

//                                     </td>
//                                     <td className="text-left px-3 py-2.5">
//                                         <div className="pl-3">
//                                         {data?.group_by ?? 'N/A'}
//                                         </div>
//                                     </td>
//                                     <td className="text-left px-3 py-2.5">
//                                         {data.aggregate ?? 'N/A'}
//                                     </td>
//                                     <td className="px-3 py-2.5">
//                                         {data.unit ?? 'N/A'}
//                                     </td>
//                                     <td className="px-3 py-2.5">
//                                         {1?

//                                         <div className="flex items-center gap-x-2 justify-end">
//                                             <button disabled={data.marked4Delete} className="text-indigo-600 hover:text-indigo-700 disabled:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition font-medium text-xs"
//                                             onClick={()=>
//                                             {
//                                                 setActionModal({
//                                                     ...data,status:'edit',
//                                                      chartInd:index,
//                                                     chartType:chart_types[0]
//                                                 })
//                                                 setStep(index+1)
//                                             }}>
//                                                 <p>Edit</p>
//                                             </button>
//                                             <button disabled={data.marked4Delete}
//                                                 className="p-1.5 rounded-lg hover:bg-rose-50 transition disabled:opacity-40"
//                                                 onClick={()=>setActionModal({
//                                                     ...data,status:'delete', chartInd:index
//                                                 })}>
//                                                 <img src="/svg/bin.svg" className="w-3.5 h-3.5"/>
//                                             </button>

//                                         </div>
//                                         :
//                                         <div className="flex justify-end">
//                                             <button  onClick={()=>marked4Deleting(index, false)}
//                                                 className="bg-indigo-600 hover:bg-indigo-700 w-fit text-white text-sm rounded-xl py-1.5 px-4 transition">
//                                                 {'Undo Delete'}
//                                             </button>
//                                         </div>
//                                         }
//                                     </td>
//                                 </tr>
//                             )})}
//                             {new_add_visuals?.map(({status,...data},index)=>{
//                             const chart_types=data?.chartType?.split(',') ?? []
//                             return(
//                                 <tr key={index} className="text-slate-800 border-b border-slate-100 bg-emerald-50/40">
//                                     <td className="text-left px-3 py-2.5">
//                                         <p className="text-slate-500">{visualsSugg?.length+index+1}</p>
//                                     </td>
//                                     <td className="text-left px-3 py-2.5">
//                                         <p className="font-medium">{chart_types[0]}{chart_types.length>1?'++':''}</p>
//                                     </td>
//                                     <td className="text-left px-3 py-2.5">
//                                         <p>{data.x  ?? 'N/A'}</p>
//                                     </td>
//                                     <td className="text-left px-3 py-2.5">
//                                         <p>{data.y ?? 'N/A'}</p>

//                                     </td>
//                                     <td className="text-left px-3 py-2.5">
//                                         <div className="pl-3">
//                                         {data?.group_by ?? 'N/A'}
//                                         </div>
//                                     </td>
//                                     <td className="text-left px-3 py-2.5">
//                                         {data.aggregate ?? 'N/A'}
//                                     </td>
//                                     <td className="px-3 py-2.5">
//                                         {data.unit ?? 'N/A'}
//                                     </td>
//                                     <td className="px-3 py-2.5">
//                                         <div className="flex items-center gap-x-2 justify-end">
//                                             <span className="text-emerald-700 text-xs font-semibold px-2 py-1 rounded-full bg-emerald-100">
//                                                 New
//                                             </span>
//                                             <span
//                                                 className="p-1.5 bg-white border border-slate-200 rounded-lg"
//                                             >
//                                                 <img src="/svg/tick.svg" className="w-3.5 h-3.5"/>
//                                             </span>

//                                         </div>
//                                     </td>
//                                 </tr>
//                             )})}
//                         </tbody>
//                     </table>
//                     </div>
//                     <div className="mt-4 flex justify-end gap-x-3">
//                         <button
//                             onClick={()=>{
//                                 setActionModal({
//                                     status:'add'
//                                 })
//                                 setStep(-2)
//                             }}
//                             className="text-xs tablet:text-sm font-medium rounded-xl border border-dashed border-slate-300 text-slate-600 hover:border-indigo-400 hover:text-indigo-600 flex items-center gap-x-2 px-4 py-2 transition">
//                             <p>Add More</p>
//                             <img src="/svg/arrow-back2.svg" className="w-3.5 h-3.5"
//                                 style={{
//                                     filter: 'brightness(0%)',
//                                     transform:'rotate(180deg)'
//                                 }}
//                             />
//                         </button>
//                         <button
//                             onClick={()=>onNext()}
//                             className="text-xs tablet:text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-md hover:shadow-indigo-500/25 flex items-center gap-x-2 px-5 py-2 transition">
//                             <p>{"That's all for now"}</p>
//                         </button>
//                     </div>
//                 </div>:

//                 null}
//                 {(step === -2 || actionModal?.status==='edit' || actionModal?.status==='add' )?
//                     <ChartInputBox goBack={true} columns={columns}
//                         formData={formData} setFormData={setFormData}
//                         isEdit={actionModal?.status==='edit'} data={actionModal}
//                         onNext={(form)=>{
//                             updateVisuals(form)
//                             setActionModal(null)
//                             setStep(0)

//                         }}
//                         onClose={()=>{
//                             setActionModal(null)
//                             setStep(0)
//                         }}
//                     />
//                     :
//                     null
//                 }
//                 {actionModal?.status==='delete'?
//                     <DeleteVisualHelper
//                         active={actionModal}
//                         setActive={setActionModal}
//                         onClose={()=>setActionModal(null)}
//                         onNext={(e)=>marked4Deleting(e)}
//                     />:null}
//             </div>

//         </div>

//         </>
//     )
// }

// function EditCharts({data, columns, visualsSugg, onClose, onNext}){
//     const {NotifyError, NotifySuccess}= useToast()
//     const {postData}= useHttpServices()
//     const [formData, setFormData]=useState({})
//     const router= useRouter()
//     const editChartQuery= async()=>{
//         const {chartType, status, ...rest_form_data}= formData
//         return await postData({path:API_ENDPOINTS.EDIT_CHART,
//             body:{
//                 mainId:router?.query?.id,
//                 chartInd:data.chartInd,
//                 ...rest_form_data,
//                 plot_type:chartType
//         }})
//     }

//     const {mutate:editChart, isPending:edLoading}=useMutation({
//         mutationFn: ()=>editChartQuery(),
//         onError:(error)=>{
//             console.log({error})
//             return NotifyError(error?.error?.message || 'Could not edit chart. Try again later.')
//         },
//         onSuccess:({data})=>{
//             NotifySuccess('Done. Chart Edited.')
//             onNext()
//             return
//         }})

//     return(
//         <div className="tablet:w-full tablet:h-fit">
//             <h2 className="text-sm font-semibold text-slate-900 mb-3">Edit Visual</h2>

//             <ChartInputBox columns={columns} isEdit={true}
//                 data={data} excludeBtn={true} formData={formData}
//                 setFormData={setFormData}
//             />

//             <div className="flex justify-end mt-2 tablet:px-0">
//                 <LoadButton
//                     isLoading={edLoading}
//                     onClick={()=>editChart()}
//                     className={"mt-5 px-8 py-2.5 w-fit bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl shadow-md hover:shadow-indigo-500/25 font-semibold text-sm transition"}
//                 >
//                     Save Changes
//                 </LoadButton>
//             </div>
//         </div>
//     )
// }

// function ChartInputBox({formData, onNext, setFormData,onClose=()=>null,excludeBtn=false,columns, goBack, isEdit, data}){
//     const charts=[...Object.keys(API_ENDPOINTS.LIST_CHARTS)]
//     const rules_for_chartTypes= API_ENDPOINTS.LIST_CHARTS
//     const {NotifySuccess, NotifyError}= useToast()
//     const {postData}= useHttpServices()

//     const router= useRouter()
//     const editChartQuery= async()=>{
//         const {chartType, status, ...rest_form_data}= formData
//         if(!isEdit){
//             const {error}= chartChecker.chatFormChecker(formData)
//             if(error){
//                 return NotifyError(error)
//             }
//         }
//         return await postData({
//             path:isEdit?API_ENDPOINTS.EDIT_CHART:API_ENDPOINTS.ADD_CHART,
//             body:{
//                 mainId:router?.query?.id,
//                 chartInd:isEdit?data.chartInd:22,
//                 ...rest_form_data,
//                 plot_type:chartType
//         }})
//     }

//     const {mutate:editChart, isPending:edLoading}=useMutation({
//         mutationFn: ()=>editChartQuery(),
//         onError:(error)=>{
//             console.log({error})
//             return NotifyError(error?.error?.message || 'Could not edit chart. Try again later.')
//         },
//         onSuccess:({data})=>{
//             NotifySuccess('Done. Chart Edited.')
//             onNext({...formData})
//             return
//         }})

//     const box_inp=[
//         {label:'Title', id:"", type:'text', name:'title', placeholder:'e.g. Monthly Revenue by Region', maxlength:55},
//         {label:'Select Visual', id:"", name:'chartType',type:'select_chart_type', options:charts},
//         {label:'X (Horizontal Values)', id:"x", name:'x',type:'select', placeholder:'name, brand...'},
//         {label:'Y (Vertical Values)', id:"y", name:'y',type:'select', placeholder:'price, amount...'},
//         {label:'Z (Bubble size)', id:"z", name:'z',type:'select', placeholder:'size, speed...'},
//         {label:'Group By', id:'group_by', name:'group_by',type:'select', placeholder:'gender, clubs..'},
//         {label:'Aggregate', id:'group_by', name:'aggregate',type:'select', placeholder:'count, sum...', options:['count','sum','average']},
//         {label:'Date Unit', id:'unit', name:'unit',type:'select_unit', placeholder:'months, year..', options:['none','hour','day','months','weeks','year']},
//         {label:'Why this? (optional)', type:'textarea', id:"why", name:'why', placeholder:'Describe why this analysis is important', maxlength:200},

//     ]

//     const formChange=(e, key, option=false, status=false)=>{
//         if(key==='chartType'){
//             setFormData({
//                 ...formData,
//                 chartType:e,
//                 x:'',
//                 y:'',
//                 group_by:'',
//                 aggregate:'count',
//                 unit:'month',
//             })
//             return
//         }
//         if(key==='x'){
//             setFormData({
//                 ...formData,
//                 x:e,
//                 unit:'month',
//             })
//             return
//         }
//         if(status){
//             const value = e.target.value;
//             const currentArray = formData[key] || [];
//             const updatedArray = [...currentArray, value];
//             return setFormData({ ...formData, [key]: updatedArray });
//             // return setFormData({...formData,[key]:[...formData[key], e]})

//         }

//         if (option) return setFormData({...formData,[key]:e})
//         return setFormData({...formData,[key]:e.target.value})
//     }
//     const [rules_for_chartType, setRulesForChartType]= useState({})

//     const no_cat_fields= chartChecker.no_cat_fields

//     const permitted_columns=useMemo(()=>{
//         if(!columns) return []
//         return chartChecker.getDisabledCharts(columns)
//     },[columns])
//     useEffect(()=>{
//         if(!formData?.chartType) return

//         setRulesForChartType(rules_for_chartTypes[formData?.chartType] || {})
//         return
//     },[formData?.chartType])
//     useEffect(()=>{
//         if(!data) return
//         setFormData(data)
//     },[])
//     return(
//         <div>
//             <div className="flex flex-col gap-1 mb-4 text-xs bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
//                 {['numerical_column','date_column', 'categorical_column'].map((x,ind)=>{
//                     const get_cats= columns.filter(({cat})=>cat===x)
//                     return(
//                         <div key={ind} style={
//                             get_cats.length?
//                                 {order:ind}:
//                                 {order:5}
//                             }>
//                             {!get_cats.length?
//                                 <div className="max-w-[700px]">
//                                 <p className="italic text-slate-400">{no_cat_fields[x]}</p>
//                                 </div>:
//                                 <p className="font-semibold text-slate-700">
//                                     {x.replace('_',' ')}{': '}
//                                     <span className="font-medium text-indigo-600">{get_cats.length}</span>
//                                 </p>
//                             }
//                         </div>
//                     )
//                 })}
//             </div>

//             <div className="w-[700px] relative tablet:w-full gap-5 grid grid-cols-3 gap-x-5 tablet:h-[400px] tablet:overflow-y-auto tablet:grid-cols-1">

//                 {box_inp.map((
//                     {label, id, name, placeholder, options, type, maxlength},ind)=>{
//                     return(
//                     <Fragment key={ind}>
//                         {type==='text'?
//                         <div className={ind===0?' col-span-2 tablet:col-span-1':''}>
//                             <p className="text-xs font-medium text-slate-700 mb-1">{label}</p>
//                             <input type={type} onChange={(e)=>formChange(e, name)}
//                                 value={formData[name] || ''}
//                                 className="w-full text-sm rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder-slate-400 outline-none transition py-2.5 px-3"
//                                 placeholder={placeholder}
//                                 maxLength={maxlength}
//                             />
//                         </div>:
//                         type==='select_chart_type'?
//                         <div
//                             className="w-full">
//                             <p className="text-xs font-medium text-slate-700 mb-1">{label}
//                             </p>
//                             {isEdit?
//                             <p className="text-left bg-slate-50 border border-slate-200 py-2.5 px-3 w-full rounded-lg text-sm">{formData[name]}</p>:
//                             <>
//                             <SelectOption
//                                 options={options}
//                                 disabled_options={permitted_columns}
//                                 value={formData[name]}
//                                 onChange={(e)=>formChange(e,name, true)}
//                                 label={label}
//                                 containerClass={'w-full text-sm rounded-lg border border-slate-200 hover:border-slate-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 bg-white transition'}
//                             />
//                             </>
//                             }
//                         </div>:
//                         type==='select'?
//                         <div
//                             style={!rules_for_chartTypes?.[formData?.chartType]?.[name]?{display:'none'}:{}}
//                             className="w-full">
//                             <p className="text-xs font-medium text-slate-700 mb-1">{label}
//                                 <span className="text-slate-400 font-normal">
//                                     {(rules_for_chartType?.[name]?.isOptional?' (optional)':'')}
//                                 </span>
//                             </p>
//                             {isEdit && name==='chartType'?
//                             <p className="text-left bg-slate-50 border border-slate-200 py-2.5 px-3 w-full rounded-lg text-sm">{formData[name]}</p>:
//                             <>
//                             {
//                             ((name==='x')  && (formData?.chartType==='matrix heatmap' || formData?.chartType==='radar chart'))
//                             ?
//                             <SelectMultiple
//                                 options={
//                                     columns.filter(({col, cat})=>{
//                                         if(rules_for_chartType?.[name]?.colType?.some((type)=> type===cat)) return true
//                                         return false
//                                     }).map(({col})=>col)
//                                 }
//                                 values={formData[name]}
//                                 minValues={formData?.chartType==='matrix heatmap'?1:3}
//                                 maxValues={formData?.chartType==='matrix heatmap'?6:5}
//                                 onChange={(e)=>formChange(e,name, true, 'multiple')}
//                                 label={label}
//                                 containerClass={'w-full text-sm rounded-lg border border-slate-200 hover:border-slate-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 bg-white transition'}
//                             />
//                             :
//                             <SelectOption
//                                 options={
//                                     options ?? columns.filter(({col, cat})=>{
//                                         if(rules_for_chartType?.[name]?.colType?.some((type)=> type===cat)) return true
//                                         return false
//                                     }).map(({col})=>col)
//                                 }
//                                 value={formData[name]}
//                                 onChange={(e)=>formChange(e,name, true)}
//                                 label={label}
//                                 containerClass={'w-full text-sm rounded-lg border border-slate-200 hover:border-slate-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 bg-white transition'}
//                             />}
//                             </>
//                             }
//                         </div>:
//                             type==='select_unit'?
//                         <div style={(
//                             ['bar chart', 'area chart', 'line chart'].includes(formData?.chartType) &&
//                             columns.find(({col})=>col===formData?.x)?.cat==='date_column'
//                         )?{}:{display:'none'}}
//                             className="w-full">
//                             <p className="text-xs font-medium text-slate-700 mb-1">{label}
//                             </p>
//                             <SelectOption
//                                 options={options}
//                                 value={formData[name]}
//                                 onChange={(e)=>formChange(e,name, true)}
//                                 label={label}
//                                 containerClass={'w-full text-sm rounded-lg border border-slate-200 hover:border-slate-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 bg-white transition'}
//                             />

//                         </div>:
//                         <div className="col-span-3 tablet:col-span-1">
//                             <p className="text-xs font-medium text-slate-700 mb-1">{label}</p>
//                             <textarea value={formData[name] || ''}
//                                 onChange={(e)=>formChange(e,name)}
//                                 className="w-full h-[80px] rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder-slate-400 outline-none transition p-3 text-sm"
//                                 placeholder={placeholder}
//                                 maxLength={maxlength}
//                             />
//                         </div>
//                         }
//                     </Fragment>
//                     )}
//                 )}

//             </div>
//             {!excludeBtn?<div className="flex justify-between w-full items-center mt-6 pt-4 border-t border-slate-100">
//                 <button onClick={()=>onClose()} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 hover:border-slate-400 transition" style={!goBack?{visibility:'hidden'}:{}}>Go Back</button>
//                 <LoadButton isLoading={edLoading}
//                     onClick={()=>editChart()}
//                     className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md hover:shadow-indigo-500/25 transition">Save</LoadButton>
//             </div>:null}
//         </div>
//     )
// }


// // import { DeleteVisualHelper, LoadButton, SelectMultiple, SelectOption } from "@/components";
// // import ModalLayout from "../modalLayout"
// // import { Fragment, use, useCallback, useContext, useEffect, useMemo, useState } from "react";
// // import { DataRequestContext } from "@/context";
// // import { API_ENDPOINTS, chartChecker, commafy, consolelog } from "@/configs";
// // import { useHttpServices, useToast } from "@/hooks";
// // import { ContinueCancel } from "..";
// // import { useRouter } from "next/router";
// // import { useMutation } from "@tanstack/react-query";


// // export default function ActionChartModal(
// //     {btnLoadingState=false,onClose,isLoading=null, extraClass="", data, status, onNext}) {
// //     const {columns, visualsSugg, setNewVisualsSugg}= useContext(DataRequestContext)
// //     const [mount, setMount]= useState(false)

// //     useEffect(()=>{
// //         if(mount) return
// //         setTimeout(()=>setMount(true), 1000)
// //     } , [])

// //     return (
// //         <ModalLayout onClose={onClose}>
// //             <div
// //                 style={isLoading?{
// //                     opacity:'0.5'   
// //                 }:{

// //                 }} 
// //                 onClick={(e)=> e.stopPropagation()} 
// //                 className={"bg-white relative rounded-md px-6 py-10 text-left w-fit text-sm "+extraClass}>
// //                 <img src={'/svg/close.svg'} className="w-5 h-5 cursor-pointer absolute right-5 top-5" onClick={onClose}/>
// //                 <div
// //                     style={mount?{}:{visibility:'hidden'}}
                
// //                 >
// //                     <div>
// //                     {status==='add'?
// //                         <AddCharts 
// //                             setNewVisualsSugg={setNewVisualsSugg} 
// //                             columns={columns} 
// //                             onNext={onNext} 
// //                             visualsSugg={visualsSugg} 
// //                             data={data}
// //                         />:
// //                         <EditCharts 
// //                             noAutoEdit={true} 
// //                             data={data} 
// //                             columns={columns} 
// //                             visualsSugg={visualsSugg} 
// //                             onNext={onNext}
// //                         />
// //                     }
// //                     </div>
                    

// //                 </div>
// //             </div>
// //         </ModalLayout>

// //     );
// //   }
// // // x, y, z, group_by, aggregate, unit,why,chartInd:ind, chartType, title, status:'edit'

// // function AddCharts({columns, visualsSugg, data, onNext}){   
// //     const [step, setStep]= useState(0)
// //     const [actionModal, setActionModal]= useState(null)
// //     const [formData, setFormData]=useState({})

// //     const tableCols= ['s/n','chart-type','x', 'y', 'group_by', 'aggregate', 'unit', 'ACTION']
// //     const [new_add_visuals, set_new_add_visuals]= useState([])
// //     const [new_visuals_sugg, setNewVisualsSugg]= useState([])
    
// //     const marked4Deleting=(ind, status)=>{
// //         const visuals=[...new_visuals_sugg]
// //         visuals[ind].marked4Delete= true
// //         // console.log({ind, visuals:visuals[ind]})
// //         setNewVisualsSugg(visuals)
// //     }
// //     const updateVisuals=(form)=>{
// //         if(actionModal.status==='add'){
// //             const visuals=[...new_add_visuals, form]
// //             set_new_add_visuals(visuals)
// //             return
// //         }
// //         const visuals=[...new_visuals_sugg]
// //         visuals[step-1]= form
// //         setNewVisualsSugg(visuals)
// //         return
// //     }

// //     useEffect(()=>{
// //         if(!visualsSugg?.length) return
// //         const visuals= [...visualsSugg]
// //         setNewVisualsSugg(visuals.map(({_id, ...props})=>(props)))
// //     },[visualsSugg])

// //     return(
// //         <>
// //          <div className="">
// //             <p className="text-xl font-semibold mb-2">All Visuals {step>0?' - Edit Visual':' '}</p>
// //             <div className="">
// //                 {step===0?
// //                 <div>
// //                     <div className="max-h-[350px] overflow-y-auto h-fit">
// //                     <table className={'border-seperate w-[900px] tablet:w-full'}>
// //                         <thead style={{background:'#FFFFFF'}}>
// //                             <tr>
// //                                 {tableCols.map((col, index) => (
// //                                     <th className='py-2 text-black uppercase text-[15px]' key={index} 
// //                                         style={
// //                                             col==="group_by"?{textAlign:"left", paddingLeft:"12px"}:
// //                                             col==="ACTION"?{textAlign:"right", paddingRight:"40px"}:
// //                                             {textAlign:"left"}
// //                                             }
// //                                         >
// //                                         {col}
// //                                     </th>
// //                                 ))}
// //                             </tr>
// //                         </thead>
// //                         <tbody className="">
// //                             {new_visuals_sugg?.map(({status,...data},index)=>{
// //                             const chart_types=data?.plot_type?.split(',') ?? []
// //                             return(
// //                                 <tr key={index} className={data.marked4Delete?' delete-tr ':''+" text-[#414141] border-b"}>
// //                                     <td className="text-left">
// //                                         <p>{index+1}</p>
// //                                     </td>
// //                                     <td className="text-left">
// //                                         <p>{chart_types[0]}{chart_types.length>1?'++':''}</p>
// //                                     </td>
// //                                     <td className="text-left">
// //                                         <p>{typeof data.x ==='string'? data.x:data.x[0]+'++'}</p>
// //                                     </td>
// //                                     <td className="text-left">
// //                                         <p>{data.y ?? 'N/A'}</p>
                                        
// //                                     </td> 
// //                                     <td className="text-left">
// //                                         <div className="pl-3">
// //                                         {data?.group_by ?? 'N/A'}
// //                                         </div>
// //                                     </td> 
// //                                     <td className="text-left ">
// //                                         {data.aggregate ?? 'N/A'}
// //                                     </td> 
// //                                     <td>
// //                                         {data.unit ?? 'N/A'}
// //                                     </td>
// //                                     <td >
// //                                         {/* {!data.marked4Delete? */}
// //                                         {1?

// //                                         <div className="flex items-center gap-x-5 justify-end gap-x-4">
// //                                             <button disabled={data.marked4Delete} className="text-white px-4 py-1.5 p1 rounded-lg" 
// //                                             onClick={()=>
// //                                             {
// //                                                 setActionModal({
// //                                                     ...data,status:'edit',
// //                                                      chartInd:index,
// //                                                     chartType:chart_types[0]
// //                                                 })
// //                                                 setStep(index+1)
// //                                             }}>
// //                                                 <p>Edit</p>
// //                                             </button>
// //                                             <button disabled={data.marked4Delete} 
// //                                                 className="p-1.5 p3 rounded-lg" 
// //                                                 onClick={()=>setActionModal({
// //                                                     ...data,status:'delete', chartInd:index
// //                                                 })}>
// //                                                 <img src="/svg/bin.svg" className="w-3.5 h-3.5"/>
// //                                             </button>
                                            
// //                                         </div>
// //                                         :
// //                                         <div className="flex justify-end">
// //                                             <button  onClick={()=>marked4Deleting(index, false)} 
// //                                                 className="p2 w-fit text-white monte text-sm rounded-lg py-1.5 px-4">
// //                                                 {'Undo Delete'}
// //                                             </button>
// //                                         </div>
// //                                         }
// //                                     </td>
// //                                 </tr>
// //                             )})}
// //                             {new_add_visuals?.map(({status,...data},index)=>{
// //                             const chart_types=data?.chartType?.split(',') ?? []
// //                             return(
// //                                 <tr key={index} className=" text-black border-b">
// //                                     <td className="text-left">
// //                                         <p>{visualsSugg?.length+index+1}</p>
// //                                     </td>
// //                                     <td className="text-left">
// //                                         <p>{chart_types[0]}{chart_types.length>1?'++':''}</p>
// //                                     </td>
// //                                     <td className="text-left">
// //                                         <p>{data.x  ?? 'N/A'}</p>
// //                                     </td>
// //                                     <td className="text-left">
// //                                         <p>{data.y ?? 'N/A'}</p>
                                        
// //                                     </td> 
// //                                     <td className="text-left">
// //                                         <div className="pl-3">
// //                                         {data?.group_by ?? 'N/A'}
// //                                         </div>
// //                                     </td> 
// //                                     <td className="text-left ">
// //                                         {data.aggregate ?? 'N/A'}
// //                                     </td> 
// //                                     <td>
// //                                         {data.unit ?? 'N/A'}
// //                                     </td>
// //                                     <div className="flex items-center gap-x-[3px] justify-end gap-x-4">
// //                                             <p className="text-emerald-700 py-1.5" >
// //                                                 New
// //                                             </p>
// //                                             <p 
// //                                                 className="p-1.5 bg-white border rounded-lg" 
// //                                             >
// //                                                 <img src="/svg/tick.svg" className="w-3.5 h-3.5"/>
// //                                             </p>
                                            
// //                                         </div>
                                    
// //                                 </tr>
// //                             )})}
// //                         </tbody>
// //                     </table>
// //                     </div>
// //                     <div className="mt-3 flex justify-end gap-x-7">
// //                         <button 
// //                             onClick={()=>{
// //                                 setActionModal({
// //                                     status:'add'
// //                                 })
// //                                 setStep(-2)
// //                             }}
// //                             className="text-[15px] rounded-full border border-dashed border-black flex items-center gap-x-2 px-4 py-2 mt-6">
// //                             <p>Add More</p>
// //                             <img src="/svg/arrow-back2.svg" 
// //                                 style={{
// //                                     filter: 'brightness(0%)',
// //                                     transform:'rotate(180deg)'
// //                                 }}
// //                             />
// //                         </button>
// //                         <button 
// //                             onClick={()=>onNext()}
// //                             className="text-[15px] rounded-full p2 text-white flex items-center gap-x-2 px-4 py-2 mt-6">
// //                             <p>{"That's all for now"}</p>
// //                         </button>                    
// //                     </div>
// //                 </div>:

// //                 null}
// //                 {(actionModal?.status==='edit' || actionModal?.status==='add' )?
// //                     <ChartInputBox goBack={true} columns={columns} 
// //                         formData={formData} setFormData={setFormData}
// //                         isEdit={actionModal?.status==='edit'} data={actionModal} 
// //                         onNext={(form)=>{
// //                             updateVisuals(form)
// //                             setActionModal(null)
// //                             setStep(0)
                            
// //                         }}
// //                         onClose={()=>{
// //                             setActionModal(null)
// //                             setStep(0)
// //                         }}
// //                     />
// //                     :
// //                     null
// //                 }
// //                 {/* {actionModal?.status==='delete'?
// //                     <ContinueCancel isLoading={false} 
// //                         onClose={()=>setActionModal(null)}
// //                         onNext={()=>deleteChart()}
// //                         html={<p className="text-center text-base">
// //                             Confirm delete: "<b>{actionModal.title}</b>"?
// //                         </p>}
// //                         continueClass={' p3 '}
// //                         cancelClass=" p1 "
// //                     />:
// //                     null
// //                 } */}
// //                 {actionModal?.status==='delete'?
// //                     <DeleteVisualHelper
// //                         active={actionModal}
// //                         setActive={setActionModal}
// //                         onClose={()=>setActionModal(null)}
// //                         onNext={(e)=>marked4Deleting(e)}
// //                     />:null}
// //                 {/* <ChartInputBox columns={columns} setFormData={setFormData} formData={formData}/> */}
// //             </div>
            
// //         </div>

// //         </>
// //     )
// // }
  
// // function EditCharts({data, columns, visualsSugg, onClose, onNext}){
// //     const {NotifyError, NotifySuccess}= useToast()
// //     const {postData}= useHttpServices()
// //     const [formData, setFormData]=useState({})
// //     const router= useRouter()
// //     const editChartQuery= async()=>{
// //         const {chartType, status, ...rest_form_data}= formData
// //         return await postData({path:API_ENDPOINTS.EDIT_CHART,
// //             body:{
// //                 mainId:router?.query?.id, 
// //                 chartInd:data.chartInd,
// //                 ...rest_form_data,
// //                 plot_type:chartType
// //         }})
// //     }
    
// //     const {mutate:editChart, isPending:edLoading}=useMutation({
// //         mutationFn: ()=>editChartQuery(),
// //         onError:(error)=>{
// //             console.log({error})
// //             return NotifyError(error?.error?.message || 'Could not edit chart. Try again later.')
// //         },
// //         onSuccess:({data})=>{
// //             NotifySuccess('Done. Chart Edited.')
// //             onNext()
// //             return
// //         }})

// //     return(
// //         <div className="max-h-[450px] tablet:w-full tablet:h-fit">
// //             <p className="text-xl font-semibold mb-2">Edit Visual</p>
            
// //             <div className="max-h-[350px] overflow-y-auto h-fit">
// //             <ChartInputBox columns={columns} isEdit={true} 
// //                 data={data} excludeBtn={true} formData={formData}
// //                 setFormData={setFormData}
// //             />    
// //             </div>
            
// //             <div className="flex justify-end tablet:px-0">
// //                 <LoadButton
// //                     isLoading={edLoading}
// //                     onClick={()=>editChart()} 
// //                     className={"mt-5 pl-10 pr-10 w-fit p2 text-white rounded-full py-3 font-semibold text-sm"}
// //                 >
// //                     Save Changes
// //                 </LoadButton>
// //             </div>
// //         </div>
// //     )
// // }

// // function ChartInputBox({formData, onNext, setFormData,onClose=()=>null,excludeBtn=false,columns, goBack, isEdit, data}){
// //     const charts=[...Object.keys(API_ENDPOINTS.LIST_CHARTS)]
// //     const rules_for_chartTypes= API_ENDPOINTS.LIST_CHARTS
// //     const {NotifySuccess, NotifyError}= useToast()
// //     const {postData}= useHttpServices()

// //     const router= useRouter()
// //     const editChartQuery= async()=>{
// //         const {chartType, status, ...rest_form_data}= formData
// //         if(!isEdit){
// //             const {error}= chartChecker.chatFormChecker(formData)
// //             if(error){
// //                 return NotifyError(error)
// //             }
// //         }
// //         return await postData({
// //             path:isEdit?API_ENDPOINTS.EDIT_CHART:API_ENDPOINTS.ADD_CHART,
// //             body:{
// //                 mainId:router?.query?.id, 
// //                 chartInd:isEdit?data.chartInd:22,
// //                 ...rest_form_data,
// //                 plot_type:chartType
// //         }})
// //     }
    
// //     const {mutate:editChart, isPending:edLoading}=useMutation({
// //         mutationFn: ()=>editChartQuery(),
// //         onError:(error)=>{
// //             console.log({error})
// //             return NotifyError(error?.error?.message || 'Could not edit chart. Try again later.')
// //         },
// //         onSuccess:({data})=>{
// //             NotifySuccess('Done. Chart Edited.')
// //             onNext({...formData})
// //             return
// //         }})

// //     const box_inp=[
// //         {label:'Title', id:"", type:'text', name:'title', placeholder:'Perfect Summary', maxlength:55},
// //         {label:'Select Visual', id:"", name:'chartType',type:'select_chart_type', options:charts},
// //         {label:'X(Horizontal Values)', id:"x", name:'x',type:'select', placeholder:'name, brand...'},
// //         {label:'Y(Vertical Values)', id:"y", name:'y',type:'select', placeholder:'price, amount...'},
// //         {label:'Z(Bubble size)', id:"z", name:'z',type:'select', placeholder:'size, speed...'},
// //         {label:'Group By', id:'group_by', name:'group_by',type:'select', placeholder:'gender, clubs..'},
// //         {label:'Aggregate', id:'group_by', name:'aggregate',type:'select', placeholder:'count, sum...', options:['count','sum','average']},
// //         {label:'Date Unit', id:'unit', name:'unit',type:'select_unit', placeholder:'months, year..', options:['none','hour','day','months','weeks','year']},
// //         {label:'Why this?(optional)', type:'textarea', id:"why", name:'why', placeholder:'Describe why this analysis is important', maxlength:200},

// //     ]
    
// //     const formChange=(e, key, option=false, status=false)=>{
// //         if(key==='chartType'){
// //             setFormData({
// //                 ...formData,
// //                 chartType:e,
// //                 x:'',
// //                 y:'',
// //                 group_by:'',
// //                 aggregate:'count',
// //                 unit:'month',
// //             })
// //             return
// //         }
// //         if(key==='x'){
// //             setFormData({
// //                 ...formData,
// //                 x:e,
// //                 unit:'month',
// //             })
// //             return
// //         }
// //         if(status){
// //             const value = e.target.value;
// //             const currentArray = formData[key] || [];
// //             const updatedArray = [...currentArray, value];    
// //             return setFormData({ ...formData, [key]: updatedArray });
// //             // return setFormData({...formData,[key]:[...formData[key], e]})

// //         }
        
// //         if (option) return setFormData({...formData,[key]:e})
// //         return setFormData({...formData,[key]:e.target.value})
// //     }
// //     const [rules_for_chartType, setRulesForChartType]= useState({})

// //     const no_cat_fields= chartChecker.no_cat_fields

// //     const permitted_columns=useMemo(()=>{
// //         if(!columns) return []
// //         return chartChecker.getDisabledCharts(columns)
// //     },[columns])
// //     useEffect(()=>{
// //         if(!formData?.chartType) return 

// //         setRulesForChartType(rules_for_chartTypes[formData?.chartType] || {})
// //         return 
// //     },[formData?.chartType])
// //     useEffect(()=>{
// //         if(!data) return
// //         setFormData(data)
// //     },[])
// //     return(
// //         <div>
// //             <div className="space-y-1 mb-3 text-[13px] flex flex-col bg-gray-100 p-3 rounded-lg">
// //                 {['numerical_column','date_column', 'categorical_column'].map((x,ind)=>{
// //                     const get_cats= columns.filter(({cat})=>cat===x)
// //                     return(
// //                         <div key={ind} className="" style={
// //                             get_cats.length?
// //                                 {order:ind}:
// //                                 {order:5}
// //                             }>
// //                             {!get_cats.length?
// //                                 <div className="max-w-[700px]">
// //                                 <p className="italic">{no_cat_fields[x]}</p>
// //                                 </div>:
// //                                 <p className="uppercase font-semibold">
// //                                     {x.replace('_',' ')}{': '}
// //                                     <span className="font-medium text-gray-500">{get_cats.length}</span>
// //                                 </p>
// //                             }
// //                         </div>
// //                     )
// //                 })}
// //             </div>

// //             <div className="w-[700px] relative tablet:w-full gap-5 grid grid-cols-3 gap-x-5 tablet:h-[400px] tablet:overflow-y-auto tablet:grid-cols-1">
                    
// //                 {box_inp.map((
// //                     {label, id, name, placeholder, options, type, maxlength},ind)=>{
// //                     return(
// //                     <Fragment key={ind}>
// //                         {type==='text'?
// //                         <div className={ind===0?' col-span-2 tablet:col-span-1':''}>
// //                             <p className="font-medium text-left">{label}</p>
// //                             <input type={type} onChange={(e)=>formChange(e, name)}
// //                                 value={formData[name] || ''} 
// //                                 className="border py-3 px-3 gap-x-2 w-full mt-2.5 rounded-md text-sm tablet:text-base "
// //                                 placeholder={placeholder}
// //                                 maxLength={maxlength}
// //                             />
// //                         </div>:
// //                         type==='select_chart_type'?
// //                         <div 
// //                         // (!rules_for_chartType?.[name]?' hidden ':'') 
// //                             className="w-full ">
// //                             <p className="font-medium text-left">{label}
// //                             </p>
// //                             {isEdit?
// //                             <p className="text-left bg-gray-50  border py-3 px-3 gap-x-2 w-full mt-2.5 rounded-md text-sm tablet:text-base ">{formData[name]}</p>:
// //                             <>
// //                             <SelectOption
// //                                 options={options}
// //                                 disabled_options={permitted_columns}
// //                                 // optionClass=" py-3 px-3 gap-x-2 w-full mt-2.5 rounded-md text-sm tablet:text-base"
// //                                 value={formData[name]} 
// //                                 onChange={(e)=>formChange(e,name, true)}
// //                                 label={label}
// //                                 containerClass={' border '}
// //                             />
// //                             </>
// //                             }
// //                         </div>:
// //                         type==='select'?
// //                         <div 
// //                         // (!rules_for_chartType?.[name]?' hidden ':'')
// //                             style={!rules_for_chartTypes?.[formData?.chartType]?.[name]?{display:'none'}:{}} 
// //                             className="w-full ">
// //                             <p className="font-medium text-left">{label}
// //                                 <span className="text-stone-600 text-xs">
// //                                     {(rules_for_chartType?.[name]?.isOptional?' (optional)':'')}
// //                                 </span>
// //                             </p>
// //                             {isEdit && name==='chartType'?
// //                             <p className="text-left bg-gray-50  border py-3 px-3 gap-x-2 w-full mt-2.5 rounded-md text-sm tablet:text-base ">{formData[name]}</p>:
// //                             <>
// //                             {
// //                             ((name==='x')  && (formData?.chartType==='matrix heatmap' || formData?.chartType==='radar chart'))                            
// //                             ?
// //                             <SelectMultiple
// //                                 options={
// //                                     columns.filter(({col, cat})=>{
// //                                         // console.log({rules_for_chartType:rules_for_chartType?.[name]?.colType, cat})
// //                                         if(rules_for_chartType?.[name]?.colType?.some((type)=> type===cat)) return true
// //                                         return false
// //                                     }).map(({col})=>col)        
// //                                 }
// //                                 // optionClass=" py-3 px-3 gap-x-2 w-full mt-2.5 rounded-md text-sm tablet:text-base"
// //                                 values={formData[name]} 
// //                                 minValues={formData?.chartType==='matrix heatmap'?1:3}
// //                                 maxValues={formData?.chartType==='matrix heatmap'?6:5}
// //                                 onChange={(e)=>formChange(e,name, true, 'multiple')}
// //                                 label={label}
// //                                 containerClass={'border '}
// //                             />
// //                             :
// //                             <SelectOption
// //                                 options={
// //                                     options ?? columns.filter(({col, cat})=>{
// //                                         // console.log({rules_for_chartType:rules_for_chartType?.[name]?.colType, cat})
// //                                         if(rules_for_chartType?.[name]?.colType?.some((type)=> type===cat)) return true
// //                                         return false
// //                                     }).map(({col})=>col)        
// //                                 }
// //                                 // optionClass=" py-3 px-3 gap-x-2 w-full mt-2.5 rounded-md text-sm tablet:text-base"
// //                                 value={formData[name]} 
// //                                 onChange={(e)=>formChange(e,name, true)}
// //                                 label={label}
// //                                 containerClass={'border '}
// //                             />}
// //                             </>
// //                             }
// //                         </div>:
// //                             type==='select_unit'?
// //                         <div style={(
// //                             ['bar chart', 'area chart', 'line chart'].includes(formData?.chartType) && 
// //                             columns.find(({col})=>col===formData?.x)?.cat==='date_column'
// //                         )?{}:{display:'none'}} 
// //                         // (!rules_for_chartType?.[name]?' hidden ':'') 
// //                             className="w-full ">
// //                             <p className="font-medium text-left">{label}
// //                             </p>
// //                             <SelectOption
// //                                 options={options}      
// //                                 // optionClass=" py-3 px-3 gap-x-2 w-full mt-2.5 rounded-md text-sm tablet:text-base"
// //                                 value={formData[name]} 
// //                                 onChange={(e)=>formChange(e,name, true)}
// //                                 label={label}
// //                                 containerClass={'border '}
// //                             />
                            
// //                         </div>:
// //                         <div className="col-span-3 tablet:col-span-1">
// //                             <p className="font-medium text-left">{label}</p>
// //                             <textarea value={formData[name] || ''} 
// //                                 onChange={(e)=>formChange(e,name)}
// //                                 className="w-full p-3 h-[80px] rounded-md gap-x-2 w-full mt-2.5 rounded-md text-sm tablet:text-base border"
// //                                 placeholder={placeholder}
// //                                 maxLength={maxlength}    
// //                             />
// //                         </div>
// //                         }
// //                     </Fragment>
// //                     )}
// //                 )}
                
// //             </div>
// //             {!excludeBtn?<div className="flex justify-between w-full items-center mt-6">
// //                 <button onClick={()=>onClose()} className="px-8 py-2 p3 text-white rounded-full " style={!goBack?{visibility:'hidden'}:{}}>Go Back</button>
// //                 <LoadButton isLoading={edLoading} 
// //                     onClick={()=>editChart()} 
// //                     className="px-8 py-2 p1 text-white rounded-full ">Save</LoadButton>
// //             </div>:null}
// //         </div>
// //     )
// // }

// import { DeleteVisualHelper, LoadButton, SelectMultiple, SelectOption } from "@/components";
// import ModalLayout from "../modalLayout"
// import { Fragment, use, useCallback, useContext, useEffect, useMemo, useState } from "react";
// import { DataRequestContext } from "@/context";
// import { API_ENDPOINTS, chartChecker, commafy, consolelog } from "@/configs";
// import { useHttpServices, useToast } from "@/hooks";
// import { ContinueCancel } from "..";
// import { useRouter } from "next/router";
// import { useMutation } from "@tanstack/react-query";


// export default function ActionChartModal(
//     {btnLoadingState=false,onClose,isLoading=null, extraClass="", data, status, onNext}) {
//     const {columns, visualsSugg, setNewVisualsSugg}= useContext(DataRequestContext)
//     const [mount, setMount]= useState(false)

//     useEffect(()=>{
//         if(mount) return
//         setTimeout(()=>setMount(true), 1000)
//     } , [])

//     return (
//         <ModalLayout onClose={onClose}>
//             <div
//                 style={isLoading?{
//                     opacity:'0.5'
//                 }:{

//                 }}
//                 onClick={(e)=> e.stopPropagation()}
//                 className={"bg-white relative rounded-2xl shadow-2xl border border-slate-200/80 text-left w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-sm "+extraClass}>

//                 {/* Header */}
//                 <header className="px-6 tablet:px-8 py-5 border-b border-slate-100 flex items-start justify-between bg-white sticky top-0 z-20">
//                     <div>
//                         <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-1">
//                             <span>Visual Studio</span>
//                             <span className="text-slate-300">&bull;</span>
//                             <span className="text-slate-500 font-medium normal-case tracking-normal">
//                                 {status==='add'?'Configure Visual':'Edit Visual'}
//                             </span>
//                         </div>
//                         <h1 className="text-xl tablet:text-2xl font-bold text-slate-900 tracking-tight">
//                             {status==='add'?'Configure Visual':'Edit Visual'}
//                         </h1>
//                         <p className="text-xs tablet:text-sm text-slate-500 mt-0.5">
//                             Map dataset dimensions, choose a visual layout, and set analysis parameters.
//                         </p>
//                     </div>
//                     <button
//                         aria-label="Close dialog"
//                         onClick={onClose}
//                         type="button"
//                         className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-2 rounded-xl transition duration-150 shrink-0"
//                     >
//                         <img src={'/svg/close.svg'} className="w-4 h-4"/>
//                     </button>
//                 </header>

//                 {/* Scrollable body */}
//                 <div
//                     style={mount?{}:{visibility:'hidden'}}
//                     className="overflow-y-auto custom-scrollbar flex-1 px-6 tablet:px-8 py-6"
//                 >
//                     <div>
//                     {status==='add'?
//                         <AddCharts
//                             setNewVisualsSugg={setNewVisualsSugg}
//                             columns={columns}
//                             onNext={onNext}
//                             visualsSugg={visualsSugg}
//                             data={data}
//                         />:
//                         <EditCharts
//                             noAutoEdit={true}
//                             data={data}
//                             columns={columns}
//                             visualsSugg={visualsSugg}
//                             onNext={onNext}
//                         />
//                     }
//                     </div>
//                 </div>
//             </div>
//             <style jsx>{`
//                 .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
//                 .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 9999px; }
//                 .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 9999px; }
//                 .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
//             `}</style>
//         </ModalLayout>

//     );
//   }
// // x, y, z, group_by, aggregate, unit,why,chartInd:ind, chartType, title, status:'edit'

// function AddCharts({columns, visualsSugg, data, onNext}){
//     const [step, setStep]= useState(0)
//     const [actionModal, setActionModal]= useState(null)
//     const [formData, setFormData]=useState({})

//     const tableCols= ['s/n','chart-type','x', 'y', 'group_by', 'aggregate', 'unit', 'ACTION']
//     const [new_add_visuals, set_new_add_visuals]= useState([])
//     const [new_visuals_sugg, setNewVisualsSugg]= useState([])

//     const marked4Deleting=(ind, status)=>{
//         const visuals=[...new_visuals_sugg]
//         visuals[ind].marked4Delete= true
//         // console.log({ind, visuals:visuals[ind]})
//         setNewVisualsSugg(visuals)
//     }
//     const updateVisuals=(form)=>{
//         if(actionModal.status==='add'){
//             const visuals=[...new_add_visuals, form]
//             set_new_add_visuals(visuals)
//             return
//         }
//         const visuals=[...new_visuals_sugg]
//         visuals[step-1]= form
//         setNewVisualsSugg(visuals)
//         return
//     }

//     useEffect(()=>{
//         if(!visualsSugg?.length) return
//         const visuals= [...visualsSugg]
//         setNewVisualsSugg(visuals.map(({_id, ...props})=>(props)))
//     },[visualsSugg])

//     return(
//         <>
//          <div>
//             <div className="flex items-center justify-between mb-3">
//                 <div>
//                     <h2 className="text-sm font-semibold text-slate-900">
//                         All Visuals {step>0?' — Edit Visual':''}
//                     </h2>
//                     <p className="text-xs text-slate-500">Everything you've configured for this dashboard so far</p>
//                 </div>
//             </div>
//             <div>
//                 {step===0?
//                 <div>
//                     <div className="max-h-[350px] overflow-y-auto h-fit custom-scrollbar rounded-xl border border-slate-200">
//                     <table className={'border-separate w-[900px] tablet:w-full'}>
//                         <thead className="bg-slate-50">
//                             <tr>
//                                 {tableCols.map((col, index) => (
//                                     <th className='py-2.5 px-3 text-slate-500 uppercase tracking-wider text-[11px] font-semibold' key={index}
//                                         style={
//                                             col==="group_by"?{textAlign:"left", paddingLeft:"12px"}:
//                                             col==="ACTION"?{textAlign:"right", paddingRight:"24px"}:
//                                             {textAlign:"left"}
//                                             }
//                                         >
//                                         {col}
//                                     </th>
//                                 ))}
//                             </tr>
//                         </thead>
//                         <tbody className="bg-white">
//                             {new_visuals_sugg?.map(({status,...data},index)=>{
//                             const chart_types=data?.plot_type?.split(',') ?? []
//                             return(
//                                 <tr key={index} className={(data.marked4Delete?'opacity-50 ':'')+"text-[#414141] border-b border-slate-100 hover:bg-slate-50/60 transition"}>
//                                     <td className="text-left px-3 py-2.5">
//                                         <p className="text-slate-500">{index+1}</p>
//                                     </td>
//                                     <td className="text-left px-3 py-2.5">
//                                         <p className="font-medium text-slate-700">{chart_types[0]}{chart_types.length>1?'++':''}</p>
//                                     </td>
//                                     <td className="text-left px-3 py-2.5">
//                                         <p>{typeof data.x ==='string'? data.x:data.x[0]+'++'}</p>
//                                     </td>
//                                     <td className="text-left px-3 py-2.5">
//                                         <p>{data.y ?? 'N/A'}</p>

//                                     </td>
//                                     <td className="text-left px-3 py-2.5">
//                                         <div className="pl-3">
//                                         {data?.group_by ?? 'N/A'}
//                                         </div>
//                                     </td>
//                                     <td className="text-left px-3 py-2.5">
//                                         {data.aggregate ?? 'N/A'}
//                                     </td>
//                                     <td className="px-3 py-2.5">
//                                         {data.unit ?? 'N/A'}
//                                     </td>
//                                     <td className="px-3 py-2.5">
//                                         {1?

//                                         <div className="flex items-center gap-x-2 justify-end">
//                                             <button disabled={data.marked4Delete} className="text-indigo-600 hover:text-indigo-700 disabled:text-slate-300 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition font-medium text-xs"
//                                             onClick={()=>
//                                             {
//                                                 setActionModal({
//                                                     ...data,status:'edit',
//                                                      chartInd:index,
//                                                     chartType:chart_types[0]
//                                                 })
//                                                 setStep(index+1)
//                                             }}>
//                                                 <p>Edit</p>
//                                             </button>
//                                             <button disabled={data.marked4Delete}
//                                                 className="p-1.5 rounded-lg hover:bg-rose-50 transition disabled:opacity-40"
//                                                 onClick={()=>setActionModal({
//                                                     ...data,status:'delete', chartInd:index
//                                                 })}>
//                                                 <img src="/svg/bin.svg" className="w-3.5 h-3.5"/>
//                                             </button>

//                                         </div>
//                                         :
//                                         <div className="flex justify-end">
//                                             <button  onClick={()=>marked4Deleting(index, false)}
//                                                 className="bg-indigo-600 hover:bg-indigo-700 w-fit text-white text-sm rounded-xl py-1.5 px-4 transition">
//                                                 {'Undo Delete'}
//                                             </button>
//                                         </div>
//                                         }
//                                     </td>
//                                 </tr>
//                             )})}
//                             {new_add_visuals?.map(({status,...data},index)=>{
//                             const chart_types=data?.chartType?.split(',') ?? []
//                             return(
//                                 <tr key={index} className="text-slate-800 border-b border-slate-100 bg-emerald-50/40">
//                                     <td className="text-left px-3 py-2.5">
//                                         <p className="text-slate-500">{visualsSugg?.length+index+1}</p>
//                                     </td>
//                                     <td className="text-left px-3 py-2.5">
//                                         <p className="font-medium">{chart_types[0]}{chart_types.length>1?'++':''}</p>
//                                     </td>
//                                     <td className="text-left px-3 py-2.5">
//                                         <p>{data.x  ?? 'N/A'}</p>
//                                     </td>
//                                     <td className="text-left px-3 py-2.5">
//                                         <p>{data.y ?? 'N/A'}</p>

//                                     </td>
//                                     <td className="text-left px-3 py-2.5">
//                                         <div className="pl-3">
//                                         {data?.group_by ?? 'N/A'}
//                                         </div>
//                                     </td>
//                                     <td className="text-left px-3 py-2.5">
//                                         {data.aggregate ?? 'N/A'}
//                                     </td>
//                                     <td className="px-3 py-2.5">
//                                         {data.unit ?? 'N/A'}
//                                     </td>
//                                     <td className="px-3 py-2.5">
//                                         <div className="flex items-center gap-x-2 justify-end">
//                                             <span className="text-emerald-700 text-xs font-semibold px-2 py-1 rounded-full bg-emerald-100">
//                                                 New
//                                             </span>
//                                             <span
//                                                 className="p-1.5 bg-white border border-slate-200 rounded-lg"
//                                             >
//                                                 <img src="/svg/tick.svg" className="w-3.5 h-3.5"/>
//                                             </span>

//                                         </div>
//                                     </td>
//                                 </tr>
//                             )})}
//                         </tbody>
//                     </table>
//                     </div>
//                     <div className="mt-4 flex justify-end gap-x-3">
//                         <button
//                             onClick={()=>{
//                                 setActionModal({
//                                     status:'add'
//                                 })
//                                 setStep(-2)
//                             }}
//                             className="text-xs tablet:text-sm font-medium rounded-xl border border-dashed border-slate-300 text-slate-600 hover:border-indigo-400 hover:text-indigo-600 flex items-center gap-x-2 px-4 py-2 transition">
//                             <p>Add More</p>
//                             <img src="/svg/arrow-back2.svg" className="w-3.5 h-3.5"
//                                 style={{
//                                     filter: 'brightness(0%)',
//                                     transform:'rotate(180deg)'
//                                 }}
//                             />
//                         </button>
//                         <button
//                             onClick={()=>onNext()}
//                             className="text-xs tablet:text-sm font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white shadow-md hover:shadow-indigo-500/25 flex items-center gap-x-2 px-5 py-2 transition">
//                             <p>{"That's all for now"}</p>
//                         </button>
//                     </div>
//                 </div>:

//                 null}
//                 {(actionModal?.status==='edit' || actionModal?.status==='add' )?
//                     <ChartInputBox goBack={true} columns={columns}
//                         formData={formData} setFormData={setFormData}
//                         isEdit={actionModal?.status==='edit'} data={actionModal}
//                         onNext={(form)=>{
//                             updateVisuals(form)
//                             setActionModal(null)
//                             setStep(0)

//                         }}
//                         onClose={()=>{
//                             setActionModal(null)
//                             setStep(0)
//                         }}
//                     />
//                     :
//                     null
//                 }
//                 {actionModal?.status==='delete'?
//                     <DeleteVisualHelper
//                         active={actionModal}
//                         setActive={setActionModal}
//                         onClose={()=>setActionModal(null)}
//                         onNext={(e)=>marked4Deleting(e)}
//                     />:null}
//             </div>

//         </div>

//         </>
//     )
// }

// function EditCharts({data, columns, visualsSugg, onClose, onNext}){
//     const {NotifyError, NotifySuccess}= useToast()
//     const {postData}= useHttpServices()
//     const [formData, setFormData]=useState({})
//     const router= useRouter()
//     const editChartQuery= async()=>{
//         const {chartType, status, ...rest_form_data}= formData
//         return await postData({path:API_ENDPOINTS.EDIT_CHART,
//             body:{
//                 mainId:router?.query?.id,
//                 chartInd:data.chartInd,
//                 ...rest_form_data,
//                 plot_type:chartType
//         }})
//     }

//     const {mutate:editChart, isPending:edLoading}=useMutation({
//         mutationFn: ()=>editChartQuery(),
//         onError:(error)=>{
//             console.log({error})
//             return NotifyError(error?.error?.message || 'Could not edit chart. Try again later.')
//         },
//         onSuccess:({data})=>{
//             NotifySuccess('Done. Chart Edited.')
//             onNext()
//             return
//         }})

//     return(
//         <div className="tablet:w-full tablet:h-fit">
//             <h2 className="text-sm font-semibold text-slate-900 mb-3">Edit Visual</h2>

//             <ChartInputBox columns={columns} isEdit={true}
//                 data={data} excludeBtn={true} formData={formData}
//                 setFormData={setFormData}
//             />

//             <div className="flex justify-end mt-2 tablet:px-0">
//                 <LoadButton
//                     isLoading={edLoading}
//                     onClick={()=>editChart()}
//                     className={"mt-5 px-8 py-2.5 w-fit bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl shadow-md hover:shadow-indigo-500/25 font-semibold text-sm transition"}
//                 >
//                     Save Changes
//                 </LoadButton>
//             </div>
//         </div>
//     )
// }

// function ChartInputBox({formData, onNext, setFormData,onClose=()=>null,excludeBtn=false,columns, goBack, isEdit, data}){
//     const charts=[...Object.keys(API_ENDPOINTS.LIST_CHARTS)]
//     const rules_for_chartTypes= API_ENDPOINTS.LIST_CHARTS
//     const {NotifySuccess, NotifyError}= useToast()
//     const {postData}= useHttpServices()

//     const router= useRouter()
//     const editChartQuery= async()=>{
//         const {chartType, status, ...rest_form_data}= formData
//         if(!isEdit){
//             const {error}= chartChecker.chatFormChecker(formData)
//             if(error){
//                 return NotifyError(error)
//             }
//         }
//         return await postData({
//             path:isEdit?API_ENDPOINTS.EDIT_CHART:API_ENDPOINTS.ADD_CHART,
//             body:{
//                 mainId:router?.query?.id,
//                 chartInd:isEdit?data.chartInd:22,
//                 ...rest_form_data,
//                 plot_type:chartType
//         }})
//     }

//     const {mutate:editChart, isPending:edLoading}=useMutation({
//         mutationFn: ()=>editChartQuery(),
//         onError:(error)=>{
//             console.log({error})
//             return NotifyError(error?.error?.message || 'Could not edit chart. Try again later.')
//         },
//         onSuccess:({data})=>{
//             NotifySuccess('Done. Chart Edited.')
//             onNext({...formData})
//             return
//         }})

//     const box_inp=[
//         {label:'Title', id:"", type:'text', name:'title', placeholder:'e.g. Monthly Revenue by Region', maxlength:55},
//         {label:'Select Visual', id:"", name:'chartType',type:'select_chart_type', options:charts},
//         {label:'X (Horizontal Values)', id:"x", name:'x',type:'select', placeholder:'name, brand...'},
//         {label:'Y (Vertical Values)', id:"y", name:'y',type:'select', placeholder:'price, amount...'},
//         {label:'Z (Bubble size)', id:"z", name:'z',type:'select', placeholder:'size, speed...'},
//         {label:'Group By', id:'group_by', name:'group_by',type:'select', placeholder:'gender, clubs..'},
//         {label:'Aggregate', id:'group_by', name:'aggregate',type:'select', placeholder:'count, sum...', options:['count','sum','average']},
//         {label:'Date Unit', id:'unit', name:'unit',type:'select_unit', placeholder:'months, year..', options:['none','hour','day','months','weeks','year']},
//         {label:'Why this? (optional)', type:'textarea', id:"why", name:'why', placeholder:'Describe why this analysis is important', maxlength:200},

//     ]

//     const formChange=(e, key, option=false, status=false)=>{
//         if(key==='chartType'){
//             setFormData({
//                 ...formData,
//                 chartType:e,
//                 x:'',
//                 y:'',
//                 group_by:'',
//                 aggregate:'count',
//                 unit:'month',
//             })
//             return
//         }
//         if(key==='x'){
//             setFormData({
//                 ...formData,
//                 x:e,
//                 unit:'month',
//             })
//             return
//         }
//         if(status){
//             const value = e.target.value;
//             const currentArray = formData[key] || [];
//             const updatedArray = [...currentArray, value];
//             return setFormData({ ...formData, [key]: updatedArray });
//             // return setFormData({...formData,[key]:[...formData[key], e]})

//         }

//         if (option) return setFormData({...formData,[key]:e})
//         return setFormData({...formData,[key]:e.target.value})
//     }
//     const [rules_for_chartType, setRulesForChartType]= useState({})

//     const no_cat_fields= chartChecker.no_cat_fields

//     const permitted_columns=useMemo(()=>{
//         if(!columns) return []
//         return chartChecker.getDisabledCharts(columns)
//     },[columns])
//     useEffect(()=>{
//         if(!formData?.chartType) return

//         setRulesForChartType(rules_for_chartTypes[formData?.chartType] || {})
//         return
//     },[formData?.chartType])
//     useEffect(()=>{
//         if(!data) return
//         setFormData(data)
//     },[])
//     return(
//         <div>
//             <div className="flex flex-col gap-1 mb-4 text-xs bg-slate-50 border border-slate-100 p-3.5 rounded-xl">
//                 {['numerical_column','date_column', 'categorical_column'].map((x,ind)=>{
//                     const get_cats= columns.filter(({cat})=>cat===x)
//                     return(
//                         <div key={ind} style={
//                             get_cats.length?
//                                 {order:ind}:
//                                 {order:5}
//                             }>
//                             {!get_cats.length?
//                                 <div className="max-w-[700px]">
//                                 <p className="italic text-slate-400">{no_cat_fields[x]}</p>
//                                 </div>:
//                                 <p className="font-semibold text-slate-700">
//                                     {x.replace('_',' ')}{': '}
//                                     <span className="font-medium text-indigo-600">{get_cats.length}</span>
//                                 </p>
//                             }
//                         </div>
//                     )
//                 })}
//             </div>

//             <div className="w-[700px] relative tablet:w-full gap-5 grid grid-cols-3 gap-x-5 tablet:h-[400px] tablet:overflow-y-auto tablet:grid-cols-1">

//                 {box_inp.map((
//                     {label, id, name, placeholder, options, type, maxlength},ind)=>{
//                     return(
//                     <Fragment key={ind}>
//                         {type==='text'?
//                         <div className={ind===0?' col-span-2 tablet:col-span-1':''}>
//                             <p className="text-xs font-medium text-slate-700 mb-1">{label}</p>
//                             <input type={type} onChange={(e)=>formChange(e, name)}
//                                 value={formData[name] || ''}
//                                 className="w-full text-sm rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder-slate-400 outline-none transition py-2.5 px-3"
//                                 placeholder={placeholder}
//                                 maxLength={maxlength}
//                             />
//                         </div>:
//                         type==='select_chart_type'?
//                         <div
//                             className="w-full">
//                             <p className="text-xs font-medium text-slate-700 mb-1">{label}
//                             </p>
//                             {isEdit?
//                             <p className="text-left bg-slate-50 border border-slate-200 py-2.5 px-3 w-full rounded-lg text-sm">{formData[name]}</p>:
//                             <>
//                             <SelectOption
//                                 options={options}
//                                 disabled_options={permitted_columns}
//                                 value={formData[name]}
//                                 onChange={(e)=>formChange(e,name, true)}
//                                 label={label}
//                                 containerClass={'w-full text-sm rounded-lg border border-slate-200 hover:border-slate-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 bg-white transition'}
//                             />
//                             </>
//                             }
//                         </div>:
//                         type==='select'?
//                         <div
//                             style={!rules_for_chartTypes?.[formData?.chartType]?.[name]?{display:'none'}:{}}
//                             className="w-full">
//                             <p className="text-xs font-medium text-slate-700 mb-1">{label}
//                                 <span className="text-slate-400 font-normal">
//                                     {(rules_for_chartType?.[name]?.isOptional?' (optional)':'')}
//                                 </span>
//                             </p>
//                             {isEdit && name==='chartType'?
//                             <p className="text-left bg-slate-50 border border-slate-200 py-2.5 px-3 w-full rounded-lg text-sm">{formData[name]}</p>:
//                             <>
//                             {
//                             ((name==='x')  && (formData?.chartType==='matrix heatmap' || formData?.chartType==='radar chart'))
//                             ?
//                             <SelectMultiple
//                                 options={
//                                     columns.filter(({col, cat})=>{
//                                         if(rules_for_chartType?.[name]?.colType?.some((type)=> type===cat)) return true
//                                         return false
//                                     }).map(({col})=>col)
//                                 }
//                                 values={formData[name]}
//                                 minValues={formData?.chartType==='matrix heatmap'?1:3}
//                                 maxValues={formData?.chartType==='matrix heatmap'?6:5}
//                                 onChange={(e)=>formChange(e,name, true, 'multiple')}
//                                 label={label}
//                                 containerClass={'w-full text-sm rounded-lg border border-slate-200 hover:border-slate-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 bg-white transition'}
//                             />
//                             :
//                             <SelectOption
//                                 options={
//                                     options ?? columns.filter(({col, cat})=>{
//                                         if(rules_for_chartType?.[name]?.colType?.some((type)=> type===cat)) return true
//                                         return false
//                                     }).map(({col})=>col)
//                                 }
//                                 value={formData[name]}
//                                 onChange={(e)=>formChange(e,name, true)}
//                                 label={label}
//                                 containerClass={'w-full text-sm rounded-lg border border-slate-200 hover:border-slate-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 bg-white transition'}
//                             />}
//                             </>
//                             }
//                         </div>:
//                             type==='select_unit'?
//                         <div style={(
//                             ['bar chart', 'area chart', 'line chart'].includes(formData?.chartType) &&
//                             columns.find(({col})=>col===formData?.x)?.cat==='date_column'
//                         )?{}:{display:'none'}}
//                             className="w-full">
//                             <p className="text-xs font-medium text-slate-700 mb-1">{label}
//                             </p>
//                             <SelectOption
//                                 options={options}
//                                 value={formData[name]}
//                                 onChange={(e)=>formChange(e,name, true)}
//                                 label={label}
//                                 containerClass={'w-full text-sm rounded-lg border border-slate-200 hover:border-slate-300 focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 bg-white transition'}
//                             />

//                         </div>:
//                         <div className="col-span-3 tablet:col-span-1">
//                             <p className="text-xs font-medium text-slate-700 mb-1">{label}</p>
//                             <textarea value={formData[name] || ''}
//                                 onChange={(e)=>formChange(e,name)}
//                                 className="w-full h-[80px] rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 placeholder-slate-400 outline-none transition p-3 text-sm"
//                                 placeholder={placeholder}
//                                 maxLength={maxlength}
//                             />
//                         </div>
//                         }
//                     </Fragment>
//                     )}
//                 )}

//             </div>
//             {!excludeBtn?<div className="flex justify-between w-full items-center mt-6 pt-4 border-t border-slate-100">
//                 <button onClick={()=>onClose()} className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-xl hover:bg-slate-100 hover:border-slate-400 transition" style={!goBack?{visibility:'hidden'}:{}}>Go Back</button>
//                 <LoadButton isLoading={edLoading}
//                     onClick={()=>editChart()}
//                     className="px-6 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl shadow-md hover:shadow-indigo-500/25 transition">Save</LoadButton>
//             </div>:null}
//         </div>
//     )
// }
