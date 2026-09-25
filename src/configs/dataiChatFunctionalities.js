


/**
 * ============================================================
 * DATA AI FORMULA EXECUTOR
 * ============================================================
 *
 * This file contains the functions responsible for executing
 * Data AI formulas against the datasets available on the client.
 *
 * Each function has one clear responsibility.
 */

import timeStampControl from "./timeStampControl";

const formatNumber = (value) => {
    if (typeof value !== "number") {
        return value;
    }

    const abs = Math.abs(value);

    if (abs >= 1_000_000_000) {
        return `${(value / 1_000_000_000)
            .toFixed(1)
            .replace(/\.0$/, "")}B`;
    }

    if (abs >= 1_000_000) {
        return `${(value / 1_000_000)
            .toFixed(1)
            .replace(/\.0$/, "")}M`;
    }

    if (abs >= 1_000) {
        return `${(value / 1_000)
            .toFixed(1)
            .replace(/\.0$/, "")}K`;
    }

    return Math.round(value).toString();
};
/**
 * ============================================================
 * 1. MAIN FORMULA EXECUTOR
 * ============================================================
 *
 * Receives the complete formula and determines which execution
 * operation should be used.
 */
const executeDataAIFormula = ({
  formula,
  datasets,
  columns = [],
}) => {
  if (!formula || !datasets) {
    throw new Error("Formula and datasets are required.");
  }
  

  const {
    operation,
    main_table,
    relationships = [],
    filters = [],
    group_by = [],
    calculations = [],
    post_aggregate = null,
    sort = [],
    limit = null,
  } = formula;

  if (!main_table) {
    throw new Error("Formula must contain main_table.");
  }

  if (!datasets[main_table]) {
    throw new Error(
      `Dataset "${main_table}" was not found.`
    );
  }

//   console.log("[executeDataAIFormula] operation:", operation);
//   console.log("[executeDataAIFormula] main_table:", main_table);
//   console.log("[executeDataAIFormula] relationships (first 3):", relationships.slice(0, 3));
//   console.log("[executeDataAIFormula] filters (first 3):", filters.slice(0, 3));
//   console.log("[executeDataAIFormula] group_by (first 3):", group_by.slice(0, 3));
//   console.log("[executeDataAIFormula] calculations (first 3):", calculations.slice(0, 3));

  switch (operation) {
    case "filter":
      return executeFilter({
        main_table,
        datasets,
        relationships,
        filters,
      });

    case "aggregate":
      return executeAggregate({
        main_table,
        datasets,
        relationships,
        filters,
        calculations,
        post_aggregate,
        sort,
        limit,
      });

    case "group_aggregate":
      return executeGroupAggregate({
        main_table,
        datasets,
        columns,
        relationships,
        filters,
        group_by,
        calculations,
        post_aggregate,
        sort, limit
      });

    default:
      throw new Error(
        `Unsupported operation: ${operation}`
      );
  }
};


/**
 * ============================================================
 * 2. FILTER EXECUTOR
 * ============================================================
 *
 * Executes a formula whose operation is "filter".
 *
 * This function is responsible only for executing the filter
 * operation.
 */
const executeFilter = ({
  main_table,
  datasets,
  relationships = [],
  filters = [],
}) => {
  let rows = [...datasets[main_table]];
  console.log("[executeFilter] initial rows (first 3):", rows.slice(0, 3));

  if (filters?.length) {
    rows = applyFilters({
      rows,
      filters,
      mainTable: main_table,
      datasets,
      relationships,
    });
  }

  console.log("[executeFilter] result rows (first 3):", rows.slice(0, 3));
  return rows;
};


/**
 * ============================================================
 * 3. AGGREGATE EXECUTOR
 * ============================================================
 *
 * Executes an aggregate operation without group_by.
 */
const executeAggregate = ({
  main_table,
  datasets,
  relationships = [],
  filters = [],
  calculations = [],
  post_aggregate = null,
  sort = [],
  limit = null,
}) => {
  let rows = [...datasets[main_table]];
  console.log("[executeAggregate] initial rows (first 3):", rows.slice(0, 3));

  if (filters?.length) {
    rows = applyFilters({
      rows,
      filters,
      mainTable: main_table,
      datasets,
      relationships,
    });
  }
  console.log("[executeAggregate] filtered rows (first 3):", rows.slice(0, 3));

  const result = {};

  if (calculations?.length) {
    for (const calculation of calculations) {
      const value = calculate({
        rows,
        calculation,
      });

      const outputName =
        calculation.alias ||
        `${calculation.function}_${calculation.field}`;

      result[outputName] = value;
    }
  }
  console.log("[executeAggregate] result:", result);

  let results = [result];

  if (post_aggregate) {
    results = executePostAggregate({
      results,
      post_aggregate,
    });
  }
   if (sort?.length) {
    results = applySort({
      results: results,
      sort: sort,
    });
  }

  if (
    limit
  ) {
    results = applyLimit({
      results: results,
      limit: limit,
    });
  }

  console.log("[executeAggregate] final results (first 3):", results.slice(0, 3));
  return results;
};


/**
 * ============================================================
 * 4. GROUP AGGREGATE EXECUTOR
 * ============================================================
 *
 * Executes an aggregate operation that contains group_by.
 */
const executeGroupAggregate = ({
  main_table,
  datasets,
  columns = [],
  relationships = [],
  filters = [],
  group_by = [],
  calculations = [],
  post_aggregate = null,
  sort,limit
}) => {
    console.log({})
  let rows = [...datasets[main_table]];
  console.log("[executeGroupAggregate] initial rows (first 3):", rows.slice(0, 3));

  if (filters?.length) {
    rows = applyFilters({
      rows,
      filters,
      mainTable: main_table,
      datasets,
      relationships,
    });
  }
  console.log("[executeGroupAggregate] filtered rows (first 3):", rows.slice(0, 3));

  if (!group_by?.length) {
    return executeAggregate({
      main_table,
      datasets: {
        [main_table]: rows,
      },
      relationships,
      filters: [],
      calculations,
      post_aggregate,
    });
  }

  const groups = executeGroupBy({
    rows,
    group_by,
    relationships,
    columns,
    datasets
  });
  console.log("[executeGroupAggregate] groups (first 3):", groups.slice(0, 3));
  // console.log("[executeGroupAggregate] for 6805969270b4062fc1128700:", groups.find(group => group.group?.user === '6805969270b4062fc1128700'));
  let results = [];

  for (const group of groups) {
    const result = {
      ...group.group,
    };

    if (calculations?.length) {
      for (const calculation of calculations) {
        const value = calculate({
          rows: group.rows,
          calculation,
        });

        const outputName =
          calculation.alias ||
          `${calculation.function}_${calculation.field}`;

        result[outputName] = value;
      }
    }
    
    results.push(result);
  }

  if (post_aggregate) {
    results = executePostAggregate({
      results,
      post_aggregate,
    });
  }
   if (sort?.length) {
    results = applySort({
      results: results,
      sort: sort,
    });
  }

  if (
    limit
  ) {
    results = applyLimit({
      results: results,
      limit: limit,
    });
  }


  console.log("[executeGroupAggregate] final results (first 3):", results.slice(0, 3));
  return results;
};


/**
 * ============================================================
 * 5. FILTER FUNCTION
 * ============================================================
 *
 * Applies the filters defined in the formula to the working
 * dataset.
 */
const applyFilters = ({
    rows,
    filters = [],
    mainTable,
    datasets,
    relationships = [],
}) => {
    console.log(
        "[applyFilters] rows (first 3):",
        rows.slice(0, 3)
    );

    console.log(
        "[applyFilters] filters (first 3):",
        filters.slice(0, 3)
    );

    if (!filters?.length) {
        return rows;
    }

    const relatedTableFilters = filters.filter(
        (filter) =>
            filter.table &&
            filter.table !== mainTable
    );

    /*
     * --------------------------------------------------
     * NO RELATIONSHIP FILTER
     * --------------------------------------------------
     *
     * Only filter the main table.
     * No relationship lookup is required.
     */
    if (!relatedTableFilters.length) {
        const finalRows = rows.filter((row) =>
            filters.every((filter) =>
                evaluateOperator({
                    actualValue:
                        row[filter.field],
                    operator:
                        filter.operator,
                    expectedValue:
                        filter.value,
                })
            )
        );

        console.log(
            "[applyFilters] final rows:",
            finalRows.slice(0, 3)
        );

        return finalRows;
    }

    /*
     * --------------------------------------------------
     * RELATIONSHIP FILTER
     * --------------------------------------------------
     */

    const relatedTables = [
        ...new Set(
            relatedTableFilters.map(
                (filter) => filter.table
            )
        ),
    ];

    /*
     * First filter each related table.
     */
    const filteredRelatedRows = {};

    for (const relatedTable of relatedTables) {
        const relatedRows =
            datasets[relatedTable] || [];

        const tableFilters =
            relatedTableFilters.filter(
                (filter) =>
                    filter.table ===
                    relatedTable
            );

        filteredRelatedRows[relatedTable] =
            relatedRows.filter((relatedRow) =>
                tableFilters.every((filter) =>
                    evaluateOperator({
                        actualValue:
                            relatedRow[
                                filter.field
                            ],
                        operator:
                            filter.operator,
                        expectedValue:
                            filter.value,
                    })
                )
            );
    }

    /*
     * --------------------------------------------------
     * FILTER ALL CLAUSES TOGETHER
     * --------------------------------------------------
     *
     * Main-table filters are checked against the main
     * row.
     *
     * Relationship filters are checked by finding the
     * matching row from the already-filtered related
     * table.
     *
     * Only rows that satisfy EVERY filter continue.
     */
    const finalRows = rows
        .filter((row) => {
            return filters.every((filter) => {
                /*
                 * Main-table filter
                 */
                if (
                    !filter.table ||
                    filter.table === mainTable
                ) {
                    return evaluateOperator({
                        actualValue:
                            row[filter.field],
                        operator:
                            filter.operator,
                        expectedValue:
                            filter.value,
                    });
                }

                /*
                 * Relationship filter
                 */
                const relationship =
                    relationships.find(
                        (relationship) =>
                            relationship.from_table ===
                                mainTable &&
                            relationship.to_table ===
                                filter.table
                    );

                if (!relationship) {
                    throw new Error(
                        `No relationship found between "${mainTable}" and "${filter.table}".`
                    );
                }

                const relatedRows =
                    filteredRelatedRows[
                        filter.table
                    ] || [];

                const foreignKeyValue =
                    row[
                        relationship.from_column
                    ];

                const relatedRow =
                    relatedRows.find(
                        (relatedRow) =>
                            relatedRow[
                                relationship.to_column
                            ] ===
                            foreignKeyValue
                    );

                return Boolean(relatedRow);
            });
        })
        /*
         * --------------------------------------------------
         * MERGE MATCHED RELATED ROW
         * --------------------------------------------------
         *
         * At this point the row has already satisfied
         * every filter.
         *
         * Find the matching related row and merge it
         * into the main row.
         */
        .map((row) => {
            const mergedRow = {
                ...row,
            };

            for (const relatedTable of relatedTables) {
                const relationship =
                    relationships.find(
                        (relationship) =>
                            relationship.from_table ===
                                mainTable &&
                            relationship.to_table ===
                                relatedTable
                    );

                if (!relationship) {
                    continue;
                }

                const relatedRows =
                    filteredRelatedRows[
                        relatedTable
                    ] || [];

                const foreignKeyValue =
                    row[
                        relationship.from_column
                    ];

                const relatedRow =
                    relatedRows.find(
                        (relatedRow) =>
                            relatedRow[
                                relationship.to_column
                            ] ===
                            foreignKeyValue
                    );

                if (relatedRow) {
                    Object.assign(
                        mergedRow,
                        relatedRow
                    );
                }
            }

            return mergedRow;
        });

    console.log(
        "[applyFilters] final merged rows:",
        finalRows.slice(0, 3)
    );

    return finalRows;
};


/**
 * ============================================================
 * 6. OPERATOR FUNCTION
 * ============================================================
 *
 * Evaluates the operator used by a filter.
 *
 * Supported operators:
 *
 * =

/**
 * ============================================================
 * 6. OPERATOR FUNCTION
 * ============================================================
 *
 * Evaluates the supported filter operators:
 *
 * =
 * ==
 * ===
 * !=
 * !==
 * >
 * >=
 * <
 * <=
 * contains
 * starts_with
 * ends_with
 * in
 * not_in
 * is_null
 * is_not_null
 */
const evaluateOperator = ({
  actualValue,
  operator,
  expectedValue,
}) => {
  switch (operator) {
    case "=":
    case "==":
      return String(actualValue ?? "").toLowerCase() ===
        String(expectedValue ?? "").toLowerCase();

    case "===":
      return actualValue === expectedValue;

    case "!=":
      return String(actualValue ?? "").toLowerCase() !==
        String(expectedValue ?? "").toLowerCase();

    case "!==":
      return actualValue !== expectedValue;

    case ">":
      return Number(actualValue) > Number(expectedValue);

    case ">=":
      return Number(actualValue) >= Number(expectedValue);

    case "<":
      return Number(actualValue) < Number(expectedValue);

    case "<=":
      return Number(actualValue) <= Number(expectedValue);

    case "contains":
      return String(actualValue ?? "")
        .toLowerCase()
        .includes(String(expectedValue ?? "").toLowerCase());

    case "starts_with":
      return String(actualValue ?? "")
        .toLowerCase()
        .startsWith(String(expectedValue ?? "").toLowerCase());

    case "ends_with":
      return String(actualValue ?? "")
        .toLowerCase()
        .endsWith(String(expectedValue ?? "").toLowerCase());

    case "in":
      return Array.isArray(expectedValue)
        ? expectedValue.some(
            (value) =>
              String(value ?? "").toLowerCase() ===
              String(actualValue ?? "").toLowerCase()
          )
        : false;

    case "not_in":
      return Array.isArray(expectedValue)
        ? !expectedValue.some(
            (value) =>
              String(value ?? "").toLowerCase() ===
              String(actualValue ?? "").toLowerCase()
          )
        : false;

    case "is_null":
      return actualValue === null || actualValue === undefined;

    case "is_not_null":
      return actualValue !== null && actualValue !== undefined;

    default:
      throw new Error(`Unsupported operator: ${operator}`);
  }
};

/**
 * ============================================================
 * 7. FIELD RESOLVER
 * ============================================================
 *
 * Resolves a field from the current working data.
 *
 * Used when a field belongs to the main table or a related
 * table.
 */
const resolveFieldValue = ({
  row,
  table,
  field,
  mainTable,
  datasets,
  relationships = [],
}) => {
  console.log("[resolveFieldValue]", { table, field, mainTable });

  if (table === mainTable) {
    return row[field];
  }

  const relationship =
    relationships.find(
      (relationship) =>
        relationship.from_table ===
          mainTable &&
        relationship.to_table === table
    );

  if (!relationship) {
    throw new Error(
      `No relationship found between "${mainTable}" and "${table}".`
    );
  }

  const relatedRow =
    resolveRelatedRow({
      row,
      relationship,
      datasets,
    });

  if (!relatedRow) {
    return undefined;
  }

  return relatedRow[field];
};



/**
 * ============================================================
 * 8. RELATED DATA RESOLVER
 * ============================================================
 *
 * Finds the related row through the defined relationship.
 *
 * The complete related row can then be used to flatten the
 * relationship data into the working data.
 */
const resolveRelatedRow = ({
  row,
  relationship,
  datasets,
}) => {
  const foreignKeyValue =
    row[relationship.from_column];

  const relatedRows =
    datasets[
      relationship.to_table
    ] || [];
  console.log("[resolveRelatedRow] foreignKeyValue:", foreignKeyValue);
  console.log("[resolveRelatedRow] relatedRows (first 3):", relatedRows.slice(0, 3));

  return relatedRows.find(
    (relatedRow) =>
      relatedRow[
        relationship.to_column
      ] === foreignKeyValue
  );
};


/**
 * ============================================================
 * 9. GROUP BY FUNCTION
 * ============================================================
 *
 * Creates groups from the working data based on the group_by
 * definitions.
 */
const executeGroupBy = ({
  rows,
  group_by = [],
  relationships = [],
  columns,
  datasets
}) => {
  console.log("[executeGroupBy] rows (first 3):", rows.slice(0, 3));
  console.log("[executeGroupBy] group_by (first 3):", group_by.slice(0, 3));

  if (!group_by?.length) {
    return [
      {
        group: {},
        rows,
      },
    ];
  }

  let groupedRows = rows;

  for (const group of group_by) {
    if (group.unit) {
      groupedRows =
        executeTimeGroupBy({
          rows: groupedRows,
          group
        });
    } else {
      groupedRows =
        executeNormalGroupBy({
          rows: groupedRows,
          group,
          relationships,
          columns,
          datasets
        });
    }
  }

  console.log("[executeGroupBy] groupedRows (first 3):", groupedRows.slice(0, 3));
  return groupedRows;
};


/**
 * ============================================================
 * 10. NORMAL GROUP BY
 * ============================================================
 *
 * Handles normal grouping where the field is grouped directly.
 */
const executeNormalGroupBy = ({
  rows,
  group,
  relationships = [],
  columns,
  datasets,
}) => {
  console.log("[executeNormalGroupBy] group:", group);

  const groups = new Map();

  for (const row of rows) {
    const groupValue = row[group.field];

    const groupKey = JSON.stringify(groupValue);

    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        group: {},
        rows: [],
      });
    }

    const currentGroup = groups.get(groupKey);

    currentGroup.rows.push(row);

    const hasShowcase = group.showcase_key?.length > 0;

    const outputKey = hasShowcase
      ? group.showcase_alias
      : group.field;

    if (!outputKey) {
      throw new Error(
        `Missing showcase_alias for group_by field "${group.field}".`
      );
    }

    if (currentGroup.group[outputKey] === undefined) {
      if (hasShowcase) {
        currentGroup.group[outputKey] =
          resolveShowcaseValue({
            row,
            showcase_key: group.showcase_key,
            group,
            groupValue,
            datasets,
            columns,
            relationships,
          });
      } else {
        currentGroup.group[outputKey] = groupValue;
      }
    }
  }

  const normalGroups = Array.from(groups.values());

  console.log(
    "[executeNormalGroupBy] groups (first 3):",
    normalGroups.slice(0, 3)
  );

  return normalGroups;
};



/**
 * ============================================================
 * 11. TIME GROUP BY
 * ============================================================
 *
 * Handles time-based grouping using:
 *
 * day
 * week
 * month
 * quarter
 * year
 */
/**
 * ============================================================
 * TIME GROUP BY
 * ============================================================
 *
 * Groups rows according to the time unit defined in group_by.
 *
 * Supported units:
 *
 * - day
 * - week
 * - month
 * - quarter
 * - year
 *
 * Date values are normalized before being processed so that
 * Mongo-style { $date: "..." } values are also supported.
 */

const executeTimeGroupBy = ({
  rows,
  group,
}) => {
  console.log("[executeTimeGroupBy] group:", group);
  console.log("[executeTimeGroupBy] rows (first 3):", rows.slice(0, 3));
  const groups = new Map();

  for (const row of rows) {
    // console.log('row group')
    const dateInput = timeStampControl.normalizeDateInput(
      row[group.field]
    );

    const date = new Date(dateInput);

    if (Number.isNaN(date.getTime())) {
      continue;
    }

    let groupValue;

    switch (group.unit) {
      case "day":
        groupValue =
          `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}-${String(
            date.getDate()
          ).padStart(2, "0")}`;
        break;

      case "week":
        groupValue =
          `Week ${timeStampControl.getWeekNumber(date)}`;
        break;

      case "month":
        groupValue =
          `${timeStampControl.shortMonths[
            date.getMonth()
          ]} ${date.getFullYear()}`;
        break;

      case "quarter":
        groupValue =
          `Q${
            Math.floor(
              date.getMonth() / 3
            ) + 1
          } ${date.getFullYear()}`;
        break;

      case "year":
        groupValue =
          date.getFullYear();
        break;

      default:
        throw new Error(
          `Unsupported time unit: ${group.unit}`
        );
    }

    const groupKey =
      JSON.stringify(groupValue);

    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        group: {
          [group.alias || group.field]:
            groupValue,
        },
        rows: [],
      });
    }

    groups
      .get(groupKey)
      .rows.push(row);
  }

  const timeGroups = Array.from(
    groups.values()
  );
  console.log("[executeTimeGroupBy] groups (first 3):", timeGroups.slice(0, 3));
  return timeGroups;
};

/**
 * ============================================================
 * 12. SHOWCASE VALUE
 * ============================================================
 *
 * Resolves the human-readable value represented by showcase_key.
 *
 * Example:
 *
 * ["first_name", "last_name"]
 *
 * becomes:
 *
 * "Victor Ogbonna"
 */
const resolveShowcaseValue = ({
  row,
  showcase_key = [],
  group,
  groupValue,
  datasets,
  columns = [],
  relationships = [],
}) => {
  console.log(
    "[resolveShowcaseValue] START"
  );

  console.log(
    "[resolveShowcaseValue] row:",
    row
  );

  console.log(
    "[resolveShowcaseValue] showcase_key:",
    showcase_key
  );

  console.log(
    "[resolveShowcaseValue] group:",
    group
  );

  console.log(
    "[resolveShowcaseValue] groupValue:",
    groupValue
  );

  const showcaseValue = showcase_key
    .map((field) => {
      console.log(
        `[resolveShowcaseValue] Checking field: ${field}`
      );

      // 1. Check the current row first
      if (
        row[field] !== null &&
        row[field] !== undefined
      ) {
        console.log(
          `[resolveShowcaseValue] ${field} found in current row:`,
          row[field]
        );

        return row[field];
      }

      console.log(
        `[resolveShowcaseValue] ${field} not found in current row.`
      );

      // 2. Find which table contains this field
      const columnInfo = columns.find(
        (column) => column.col === field
      );
      console.log(
        `[resolveShowcaseValue] Columns available ${field}:`,
        columns.slice(3,9)
      );


      console.log(
        `[resolveShowcaseValue] Column info for ${field}:`,
        columnInfo
      );

      if (!columnInfo) {
        console.log(
          `[resolveShowcaseValue] No column information found for ${field}.`
        );

        return undefined;
      }

      console.log(
        `[resolveShowcaseValue] ${field} belongs to table:`,
        columnInfo.table
      );

      // 3. Find the relationship between the current table
      // and the table containing the showcase field
      const relationship = relationships.find(
        (rel) =>
          rel.from_table === group?.table &&
          rel.to_table === columnInfo.table
      );

      console.log(
        `[resolveShowcaseValue] Relationship for ${field}:`,
        relationship
      );

      if (!relationship) {
        console.log(
          `[resolveShowcaseValue] No relationship found for ${field}.`
        );

        return undefined;
      }

      console.log(
        `[resolveShowcaseValue] Using relationship:`,
        {
          from_table: relationship.from_table,
          from_column: relationship.from_column,
          to_table: relationship.to_table,
          to_column: relationship.to_column,
        }
      );

      // 4. Get the related table data
      const relatedRows =
        datasets?.[columnInfo.table] || [];

      console.log(
        `[resolveShowcaseValue] Related table ${columnInfo.table} rows:`,
        relatedRows.length
      );

      // 5. Find the related row using groupValue
      console.log(
        `[resolveShowcaseValue] Looking for related row where ${relationship.to_column} ===`,
        groupValue
      );

      const relatedRow = relatedRows.find(
        (relatedRow) =>
          relatedRow[relationship.to_column] === groupValue
      );

      console.log(
        `[resolveShowcaseValue] Matched related row for ${field}:`,
        relatedRow
      );

      if (!relatedRow) {
        console.log(
          `[resolveShowcaseValue] No related row found for ${field}.`
        );

        return undefined;
      }

      // 6. Get the requested showcase field
      const value = relatedRow[field];

      console.log(
        `[resolveShowcaseValue] Retrieved ${field}:`,
        value
      );

      return value;
    })
    .filter(
      (value) =>
        value !== null &&
        value !== undefined &&
        String(value).trim() !== ""
    )
    .join(" ");

  console.log(
    "[resolveShowcaseValue] FINAL RESULT:",
    showcaseValue
  );

  return showcaseValue;
};

/**
 * ============================================================
 * 13. CALCULATION FUNCTION
 * ============================================================
 *
 * Performs calculations inside each group.
 *
 * Supported functions:
 *
 * sum
 * average
 * avg
 * min
 * max
 */
const calculate = ({
  rows,
  calculation,
}) => {
  const {
    field,
    function: fn,
  } = calculation;

  const values = rows
    .map((row) => row[field])
    .filter(
      (value) =>
        value !== null &&
        value !== undefined
    );
  console.log("[calculate] field, function:", field, fn);
  console.log("[calculate] values (first 3):", values.slice(0, 3));
  // if(){
  //   console.log('')
  // }
  switch (fn) {
    case "sum":
      return values.reduce(
        (total, value) =>
          total + Number(value || 0),
        0
      );
    case "count":
      return values.length;
    case "average":
    case "avg":
      if (!values.length) {
        return 0;
      }

      return (
        values.reduce(
          (total, value) =>
            total + Number(value || 0),
          0
        ) / values.length
      );

    case "min":
      return values.length
        ? Math.min(
            ...values.map(Number)
          )
        : null;

    case "max":
      return values.length
        ? Math.max(
            ...values.map(Number)
          )
        : null;

    default:
      throw new Error(
        `Unsupported calculation function: ${fn}`
      );
  }
};


/**
 * ============================================================
 * 14. POST AGGREGATE FUNCTION
 * ============================================================
 *
 * Works on values that have already been calculated.
 *
 * It supports:
 *
 * function:
 * - sum
 * - average
 * - avg
 * - min
 * - max
 *
 * operator:
 * - add
 * - subtract
 * - multiply
 * - divide
 */
const executePostAggregate = ({
  results,
  post_aggregate,
}) => {
  console.log("[executePostAggregate] results (first 3):", results.slice(0, 3));
  console.log("[executePostAggregate] post_aggregate:", post_aggregate);

  if (!post_aggregate) {
    return results;
  }

  if (post_aggregate.function) {
    return executePostAggregateFunction({
      results,
      post_aggregate,
    });
  }

  if (post_aggregate.operator) {
    return executePostAggregateOperator({
      results,
      post_aggregate,
    });
  }

  throw new Error(
    "Post aggregate must contain either a function or operator."
  );
};


/**
 * ============================================================
 * 15. POST AGGREGATE FUNCTION EXECUTOR
 * ============================================================
 *
 * Handles post_aggregate when a function is provided.
 */
const executePostAggregateFunction = ({
  results,
  post_aggregate,
}) => {
  const {
    function: fn,
    field,
    alias,
  } = post_aggregate;

  const values = results
    .map((row) => row[field])
    .filter(
      (value) =>
        value !== null &&
        value !== undefined
    );
  console.log("[executePostAggregateFunction] fn, field:", fn, field);
  console.log("[executePostAggregateFunction] values (first 3):", values.slice(0, 3));

  let value;

  switch (fn) {
    case "sum":
      value = values.reduce(
        (total, current) =>
          total + Number(current || 0),
        0
      );
      break;

    case "average":
    case "avg":
      value = values.length
        ? values.reduce(
            (total, current) =>
              total + Number(current || 0),
            0
          ) / values.length
        : 0;
      break;

    case "min":
      value = values.length
        ? Math.min(
            ...values.map(Number)
          )
        : null;
      break;

    case "max":
      value = values.length
        ? Math.max(
            ...values.map(Number)
          )
        : null;
      break;

    default:
      throw new Error(
        `Unsupported post aggregate function: ${fn}`
      );
  }

  console.log("[executePostAggregateFunction] value:", value);
  return [
    {
      [alias || `${fn}_${field}`]:
        value,
    },
  ];
};


/**
 * ============================================================
 * 16. POST AGGREGATE OPERATOR EXECUTOR
 * ============================================================
 *
 * Handles post_aggregate when an operator is provided.
 */
const executePostAggregateOperator = ({
  results,
  post_aggregate,
}) => {
  const {
    operator,
    fields = [],
    alias,
  } = post_aggregate;

  if (!fields?.length) {
    throw new Error(
      "Post aggregate operator requires fields."
    );
  }

  /*
   * The operator works on the calculated values
   * contained in the result rows.
   */
  const values = fields.map(
    (field) =>
      results[0]?.[field]
  );
  console.log("[executePostAggregateOperator] operator, fields:", operator, fields);
  console.log("[executePostAggregateOperator] values:", values);

  const value =
    executeMathOperator({
      values,
      operator,
    });
  console.log("[executePostAggregateOperator] value:", value);

  return [
    {
      [alias || "result"]:
        value,
    },
  ];
};


/**
 * ============================================================
 * 17. MATH OPERATOR FUNCTION
 * ============================================================
 *
 * Handles mathematical operators used by post_aggregate:
 *
 * add
 * subtract
 * multiply
 * divide
 */
const executeMathOperator = ({
  values,
  operator,
}) => {
  if (!values?.length) {
    throw new Error(
      "Math operator requires values."
    );
  }

  const numbers = values.map(
    (value) => Number(value)
  );
  console.log("[executeMathOperator] operator:", operator);
  console.log("[executeMathOperator] numbers:", numbers);

  switch (operator) {
    case "add":
      return numbers.reduce(
        (total, value) =>
          total + value,
        0
      );

    case "subtract":
      return numbers
        .slice(1)
        .reduce(
          (total, value) =>
            total - value,
          numbers[0]
        );

    case "multiply":
      return numbers.reduce(
        (total, value) =>
          total * value,
        1
      );

    case "divide":
      return numbers
        .slice(1)
        .reduce(
          (total, value) => {
            if (value === 0) {
              throw new Error(
                "Cannot divide by zero."
              );
            }

            return total / value;
          },
          numbers[0]
        );

    default:
      throw new Error(
        `Unsupported math operator: ${operator}`
      );
  }
};


/**
 * ============================================================
 * 18. SORT FUNCTION
 * ============================================================
 *
 * Sorts the calculated final results.
 *
 * Supported directions:
 *
 * asc
 * desc
 */
const applySort = ({
  results,
  sort = [],
}) => {
  console.log("[applySort] sort:", sort);
  console.log("[applySort] results before sort (first 3):", results.slice(0, 3));

  if (!sort?.length) {
    return results;
  }

  const sortedResults = [...results];

  sortedResults.sort((a, b) => {
    for (const rule of sort) {
      const aValue = a[rule.field];
      const bValue = b[rule.field];

      if (aValue === bValue) {
        continue;
      }

      const direction =
        rule.direction === "desc"
          ? -1
          : 1;

      if (
        typeof aValue === "number" &&
        typeof bValue === "number"
      ) {
        return (
          (aValue - bValue) *
          direction
        );
      }

      return (
        String(aValue ?? "").localeCompare(
          String(bValue ?? ""),
          undefined,
          {
            numeric: true,
            sensitivity: "base",
          }
        ) * direction
      );
    }

    return 0;
  });

  console.log("[applySort] results after sort (first 3):", sortedResults.slice(0, 3));
  return sortedResults;
};

/**
 * ============================================================
 * 19. LIMIT FUNCTION
 * ============================================================
 *
 * Applies the final result limit.
 */
const applyLimit = ({
  results,
  limit,
}) => {
  console.log("[applyLimit] limit:", limit);
  console.log("[applyLimit] results before limit (first 3):", results.slice(0, 3));

  if (typeof limit !== "number") {
    return results;
  }

  const limitedResults = results.slice(0, limit);
  console.log("[applyLimit] results after limit (first 3):", limitedResults.slice(0, 3));
  return limitedResults;
};



/**
 * ============================================================
 * 20. TEMPLATE RESOLVER
 * ============================================================
 *
 * Resolves values inside response.template using the final
 * calculated result.
 */
const resolveTemplate = ({
    template = "",
    row = {},
}) => {
    if (!template) {
        return "";
    }

    return template.replace(
        /\{\{([^}]+)\}\}/g,
        (_, alias) => {
            const value = row?.[alias.trim()];

            if (
                value === null ||
                value === undefined
            ) {
                return `{{${alias}}}`;
            }

            return formatNumber(value);
        }
    );
};


/**
 * ============================================================
 * 21. RESULT STRING BUILDER
 * ============================================================
 *
 * Converts the structured result into a readable string.
 */
const buildResultString = ({
    result = [],
    formula = {},
}) => {
    if (!result?.length) {
        return "";
    }

    const calculations = formula.calculations || [];

    return `
        <div class="data-ai-result">
            ${result
                .map(
                    (row) => `
                        <div class="data-ai-result-row">
                            ${Object.entries(row)
                                .map(([key, value]) => {
                                    const calculation =
                                        calculations.find(
                                            (item) =>
                                                (item.alias ||
                                                    `${item.function}_${item.field}`) === key
                                        );
                                        console.log('calculation found', calculations, calculation, key)
                                    const endTag =
                                        calculation?.endTag || "";

                                    const formattedKey = key
                                        .replace(/_/g, " ")
                                        .replace(/\b\w/g, (char) =>
                                            char.toUpperCase()
                                        );

                                    return `
                                        <p>
                                            <strong>${formattedKey}:</strong>
                                            ${formatNumber(value)}
                                            ${endTag ? ` ${endTag}` : ""}
                                        </p>
                                    `;
                                })
                                .join("")}
                        </div>
                    `
                )
                .join("")}
        </div>
    `;
};


/**
 * ============================================================
 * 22. GENERAL RESPONSE BUILDER
 * ============================================================
 *
 * Combines:
 *
 * response.template
 * result
 * response.conclusion
 *
 * into the final response string.
 */
const buildDataAIResponse = ({
    response = {},
    result = [],
    limit = null,
}) => {
    const template = response.template || "";
    const rowTemplate = response.row_template || "";
    const conclusion = response.conclusion || "";

    let content = "";

    /*
     * Single result
     *
     * If limit is 1, or there is only one actual result,
     * use the template with the first result row.
     */
    if (
        limit === 1 ||
        result.length === 1
    ) {
        content += resolveTemplate({
            template,
            row: result[0] || {},
        });
    }

    /*
     * Multiple results
     *
     * Use the template as the introduction,
     * then repeat row_template for every result row.
     */
    else if (result.length > 1) {
        content += template;

        content += resolveRowTemplate({
            rowTemplate,
            rows: result,
        });
    }

    /*
     * No result
     */
    else {
        content += template;
    }

    content += conclusion;

    return `
        <div class="data-ai-response">
            ${content}
        </div>
    `;
};

const resolveRowTemplate = ({
    rowTemplate = "",
    rows = [],
}) => {
    if (!rowTemplate || !rows?.length) {
        return "";
    }

    return rows
        .map((row) =>
            resolveTemplate({
                template: rowTemplate,
                row,
            })
        )
        .join("");
};

/**
 * ============================================================
 * 23. GENERAL DATA AI EXECUTOR
 * ============================================================
 *
 * Receives the complete Data AI request.
 *
 * It executes the formula, receives the calculated result,
 * and combines the result with the AI response.
 */
const executeDataAI = ({
  formula,
  response = {},
  datasets,
}) => {
  if (!formula) {
    throw new Error(
      "Formula is required."
    );
  }

  if (!datasets) {
    throw new Error(
      "Datasets are required."
    );
  }

  console.log("[executeDataAI] formula:", formula);
  console.log("[executeDataAI] response:", response);
  console.log("[executeDataAI] datasets keys:", Object.keys(datasets));

  let result =
    executeDataAIFormula({
      formula: {
        ...formula,
        sort: [],
        limit: null,
      },
      datasets,
    });

  if (formula.sort?.length) {
    result = applySort({
      results: result,
      sort: formula.sort,
    });
  }

  if (
    typeof formula.limit === "number"
  ) {
    result = applyLimit({
      results: result,
      limit: formula.limit,
    });
  }

  console.log("[executeDataAI] final result (first 3):", result.slice(0, 3));

  const responseString =
    buildDataAIResponse({
      response,
      result,
    });

  console.log("[executeDataAI] responseString:", responseString);

  return {
    result,
    responseString,
  };
};


/**
 * ============================================================
 * NAMED EXPORTS
 * ============================================================
 */

export {
  executeDataAIFormula,
  executeFilter,
  executeAggregate,
  executeGroupAggregate,

  applyFilters,
  evaluateOperator,

  resolveFieldValue,
  resolveRelatedRow,

  executeGroupBy,
  executeNormalGroupBy,
  executeTimeGroupBy,
  resolveShowcaseValue,

  calculate,

  executePostAggregate,
  executePostAggregateFunction,
  executePostAggregateOperator,
  executeMathOperator,

  applySort,
  applyLimit,

  resolveTemplate,
  buildResultString,
  buildDataAIResponse,

  executeDataAI,
};


/**
 * ============================================================
 * DEFAULT EXPORT
 * ============================================================
 */

const dataiChatFunctionalities = {
  executeDataAIFormula,
  executeFilter,
  executeAggregate,
  executeGroupAggregate,

  applyFilters,
  evaluateOperator,

  resolveFieldValue,
  resolveRelatedRow,

  executeGroupBy,
  executeNormalGroupBy,
  executeTimeGroupBy,
  resolveShowcaseValue,

  calculate,

  executePostAggregate,
  executePostAggregateFunction,
  executePostAggregateOperator,
  executeMathOperator,

  applySort,
  applyLimit,

  resolveTemplate,
  buildResultString,
  buildDataAIResponse,

  executeDataAI,
};

export default dataiChatFunctionalities;