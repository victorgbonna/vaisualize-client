/**
 * DATA AI FORMULA EXECUTOR
 *
 * datasets:
 * {
 *   "transactions.csv": [...rows],
 *   "users.json": [...rows],
 *   "competitions.csv": [...rows]
 * }
 *
 * formula:
 * {
 *   operation: "group_aggregate",
 *   main_table: "transactions.csv",
 *   relationships: [...],
 *   filters: [...],
 *   group_by: [...],
 *   calculations: [...],
 *   sort: [...],
 *   limit: 10
 * }
 */

const executeDataAIFormula = (formula, datasets) => {
    if (!formula || !datasets) {
        throw new Error('Formula and datasets are required.');
    }

    const {
        operation,
        main_table,
        relationships = [],
        filters = [],
        group_by = [],
        calculations = [],
        sort = [],
        limit,
    } = formula;

    if (!main_table) {
        throw new Error('Formula must contain main_table.');
    }

    if (!datasets[main_table]) {
        throw new Error(`Dataset "${main_table}" was not found.`);
    }

    switch (operation) {
        case 'aggregate':
            return executeAggregate({
                main_table,
                datasets,
                relationships,
                filters,
                calculations,
                sort,
                limit,
            });

        case 'group_aggregate':
            return executeGroupAggregate({
                main_table,
                datasets,
                relationships,
                filters,
                group_by,
                calculations,
                sort,
                limit,
            });

        case 'filter':
            return executeFilter({
                main_table,
                datasets,
                relationships,
                filters,
                sort,
                limit,
            });

        default:
            throw new Error(`Unsupported operation: ${operation}`);
    }
};

const executeFilter = ({
    main_table,
    datasets,
    relationships,
    filters,
    sort,
    limit,
}) => {
    let rows = [...datasets[main_table]];

    rows = applyFilters({
        rows,
        filters,
        mainTable: main_table,
        datasets,
        relationships,
    });

    rows = applySort(rows, sort);

    if (typeof limit === 'number') {
        rows = rows.slice(0, limit);
    }

    return rows;
};

const executeAggregate = ({
    main_table,
    datasets,
    relationships,
    filters,
    calculations,
    sort,
    limit,
}) => {
    let rows = [...datasets[main_table]];

    rows = applyFilters({
        rows,
        filters,
        mainTable: main_table,
        datasets,
        relationships,
    });

    const result = {};

    for (const calculation of calculations) {
        const value = calculate({
            rows,
            calculation,
        });

        const key =
            calculation.alias ||
            `${calculation.function}_${calculation.field}`;

        result[key] = value;
    }

    let results = [result];

    results = applySort(results, sort);

    if (typeof limit === 'number') {
        results = results.slice(0, limit);
    }

    return results;
};

const executeGroupAggregate = ({
    main_table,
    datasets,
    relationships,
    filters,
    group_by,
    calculations,
    sort,
    limit,
}) => {
    let rows = [...datasets[main_table]];

    rows = applyFilters({
        rows,
        filters,
        mainTable: main_table,
        datasets,
        relationships,
    });

    const enrichedRows = rows.map((row) => {
        const enriched = {
            ...row,
        };

        for (let i = 0; i < group_by.length; i += 1) {
            const group = group_by[i];

            enriched[`__group_${i}`] = resolveFieldValue({
                row,
                requestedTable: group.table,
                field: group.field,
                mainTable: main_table,
                datasets,
                relationships,
            });
        }

        return enriched;
    });

    const groups = new Map();

    for (const row of enrichedRows) {
        const groupValues = group_by.map(
            (_, index) => row[`__group_${index}`]
        );

        const groupKey = JSON.stringify(groupValues);

        if (!groups.has(groupKey)) {
            groups.set(groupKey, []);
        }

        groups.get(groupKey).push(row);
    }

    let results = [];

    for (const [groupKey, groupRows] of groups.entries()) {
        const groupValues = JSON.parse(groupKey);

        const result = {};

        group_by.forEach((group, index) => {
            const outputName = group.alias || group.field;
            result[outputName] = groupValues[index];
        });

        for (const calculation of calculations) {
            const value = calculate({
                rows: groupRows,
                calculation,
            });

            const outputName =
                calculation.alias ||
                `${calculation.function}_${calculation.field}`;

            result[outputName] = value;
        }

        results.push(result);
    }

    results = applySort(results, sort);

    if (typeof limit === 'number') {
        results = results.slice(0, limit);
    }

    return results;
};

const resolveFieldValue = ({
    row,
    requestedTable,
    field,
    mainTable,
    datasets,
    relationships,
}) => {
    if (requestedTable === mainTable) {
        return row[field];
    }

    const relationship = relationships.find((rel) => {
        return (
            rel.from_table === mainTable &&
            rel.to_table === requestedTable
        );
    });

    if (!relationship) {
        throw new Error(
            `No relationship found between "${mainTable}" and "${requestedTable}".`
        );
    }

    const foreignKeyValue = row[relationship.from_column];
    const relatedRows = datasets[relationship.to_table] || [];

    const relatedRow = relatedRows.find((related) => {
        return (
            related[relationship.to_column] === foreignKeyValue
        );
    });

    if (!relatedRow) {
        return undefined;
    }

    return relatedRow[field];
};

const applyFilters = ({
    rows,
    filters,
    mainTable,
    datasets,
    relationships,
}) => {
    if (!filters?.length) {
        return rows;
    }

    return rows.filter((row) => {
        return filters.every((filter) => {
            const actualValue = resolveFieldValue({
                row,
                requestedTable: filter.table || mainTable,
                field: filter.field,
                mainTable,
                datasets,
                relationships,
            });

            return evaluateCondition(
                actualValue,
                filter.operator,
                filter.value
            );
        });
    });
};

const evaluateCondition = (actual, operator, expected) => {
    switch (operator) {
        case '=':
        case '==':
        case '===':
            return actual === expected;

        case '!=':
        case '!==':
            return actual !== expected;

        case '>':
            return Number(actual) > Number(expected);

        case '>=':
            return Number(actual) >= Number(expected);

        case '<':
            return Number(actual) < Number(expected);

        case '<=':
            return Number(actual) <= Number(expected);

        case 'contains':
            return String(actual ?? '')
                .toLowerCase()
                .includes(String(expected ?? '').toLowerCase());

        case 'starts_with':
            return String(actual ?? '')
                .toLowerCase()
                .startsWith(String(expected ?? '').toLowerCase());

        case 'ends_with':
            return String(actual ?? '')
                .toLowerCase()
                .endsWith(String(expected ?? '').toLowerCase());

        case 'in':
            return Array.isArray(expected)
                ? expected.includes(actual)
                : false;

        case 'not_in':
            return Array.isArray(expected)
                ? !expected.includes(actual)
                : true;

        case 'is_null':
            return actual === null || actual === undefined;

        case 'is_not_null':
            return actual !== null && actual !== undefined;

        default:
            throw new Error(`Unsupported filter operator: ${operator}`);
    }
};

const calculate = ({ rows, calculation }) => {
    const {
        field,
        function: fn,
    } = calculation;

    const values = rows
        .map((row) => row[field])
        .filter((value) => value !== null && value !== undefined);

    switch (fn) {
        case 'sum':
            return values.reduce(
                (total, value) => total + Number(value || 0),
                0
            );

        case 'count':
            return values.length;

        case 'count_distinct':
            return new Set(values).size;

        case 'average':
        case 'avg':
            if (!values.length) {
                return 0;
            }

            return (
                values.reduce(
                    (total, value) => total + Number(value || 0),
                    0
                ) / values.length
            );

        case 'min':
            return values.length
                ? Math.min(...values.map(Number))
                : null;

        case 'max':
            return values.length
                ? Math.max(...values.map(Number))
                : null;

        default:
            throw new Error(`Unsupported calculation function: ${fn}`);
    }
};

const applySort = (rows, sort = []) => {
    if (!sort.length) {
        return rows;
    }

    const sorted = [...rows];

    sorted.sort((a, b) => {
        for (const rule of sort) {
            const field = rule.field;
            const aValue = a[field];
            const bValue = b[field];

            if (aValue === bValue) {
                continue;
            }

            const direction = rule.direction === 'desc' ? -1 : 1;

            if (
                typeof aValue === 'number' &&
                typeof bValue === 'number'
            ) {
                return (aValue - bValue) * direction;
            }

            return (
                String(aValue ?? '').localeCompare(
                    String(bValue ?? ''),
                    undefined,
                    {
                        numeric: true,
                        sensitivity: 'base',
                    }
                ) * direction
            );
        }

        return 0;
    });

    return sorted;
};
const resolveTemplate = (
    template,
    result = []
) => {
    if (!template) return "";

    if (!result.length) {
        return template;
    }

    const firstResult = result[0];

    return template.replace(
        /\{([^}]+)\}/g,
        (_, key) => {
            return firstResult?.[key] ?? `{${key}}`;
        }
    );
};

const dataiChatFunctionalities = {
    executeDataAIFormula,
    executeFilter,
    executeAggregate,
    executeGroupAggregate,
    resolveFieldValue,
    applyFilters,
    evaluateCondition,
    calculate,
    applySort,
    resolveTemplate,
};

export default dataiChatFunctionalities;