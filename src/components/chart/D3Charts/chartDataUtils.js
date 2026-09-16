
import { pagination, timeStampControl } from "@/configs";

const EMPTY_RELATIONSHIPS = [];

// ============================================================
// NUMBER FORMATTING
// ============================================================

export function formatCompactNumber(value) {
  const numericValue = Number(value);

  if (!Number.isFinite(numericValue)) return value;

  if (Math.abs(numericValue) < 1000) {
    return d3FormatNumber(numericValue);
  }

  return d3FormatCompact(numericValue);
}

function d3FormatNumber(value) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 2,
  }).format(value);
}

function d3FormatCompact(value) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: 2,
  })
    .format(value)
    .replace(/([KMBT])$/, (_, suffix) => suffix.toLowerCase());
}


// ============================================================
// TABLE DATA
// ============================================================

export function getTableRows(dataArray, table) {
  if (Array.isArray(dataArray)) return dataArray;

  if (!dataArray || !table) return [];

  if (Array.isArray(dataArray[table])) {
    return dataArray[table];
  }

  const matchingTable = Object.keys(dataArray).find(
    (key) => key.toLowerCase() === String(table).toLowerCase()
  );

  return matchingTable && Array.isArray(dataArray[matchingTable])
    ? dataArray[matchingTable]
    : [];
}


// ============================================================
// RELATIONSHIPS
// ============================================================

export function getRelationshipParts(relationship) {
  if (!relationship) return null;

  const fromTable = relationship.from_table;
  const toTable = relationship.to_table;
  const fromColumn = relationship.from_column;
  const toColumn = relationship.to_column;

  return fromTable && toTable && fromColumn && toColumn
    ? {
        fromTable,
        toTable,
        fromColumn,
        toColumn,
      }
    : null;
}

export function findRelationship(
  currentTable,
  targetTable,
  relationships = EMPTY_RELATIONSHIPS
) {
  if (!currentTable || !targetTable || currentTable === targetTable) {
    return null;
  }

  return (
    relationships
      .map(getRelationshipParts)
      .find(
        (relationship) =>
          relationship &&
          (
            (
              relationship.fromTable === currentTable &&
              relationship.toTable === targetTable
            ) ||
            (
              relationship.toTable === currentTable &&
              relationship.fromTable === targetTable
            )
          )
      ) || null
  );
}


/**
 * Get ALL rows related to the current row.
 *
 * Example:
 *
 * users
 * --------------------------------
 * id    name
 * 1     Victor
 *
 * transactions
 * --------------------------------
 * userId    amount
 * 1         5000
 * 1         3000
 *
 * Relationship:
 *
 * transactions.userId -> users.id
 *
 * Calling this from the users row returns:
 *
 * [
 *   { userId: 1, amount: 5000 },
 *   { userId: 1, amount: 3000 }
 * ]
 *
 * NOT just the first transaction.
 */
export function getRelatedRows({
  row,
  currentTable,
  targetTable,
  dataArray,
  relationships = EMPTY_RELATIONSHIPS,
}) {
  if (!row) return [];

  // Same table = direct row access
  if (currentTable === targetTable) {
    return [row];
  }

  const relationship = findRelationship(
    currentTable,
    targetTable,
    relationships
  );

  if (!relationship) {
    return [];
  }

  let currentColumn;
  let targetColumn;

  /*
   * Relationship direction:
   *
   * from_table.from_column
   *          ↓
   * to_table.to_column
   *
   * We dynamically determine which column belongs
   * to the current table and which belongs to the
   * target table.
   */
  if (relationship.fromTable === currentTable) {
    currentColumn = relationship.fromColumn;
    targetColumn = relationship.toColumn;
  } else {
    currentColumn = relationship.toColumn;
    targetColumn = relationship.fromColumn;
  }

  const currentValue = row?.[currentColumn];

  if (currentValue === undefined || currentValue === null) {
    return [];
  }

  const targetRows = getTableRows(dataArray, targetTable);

  /*
   * IMPORTANT:
   *
   * filter() instead of find()
   *
   * because one row can have MANY related rows.
   */
  return targetRows.filter(
    (targetRow) =>
      String(targetRow?.[targetColumn]) === String(currentValue)
  );
}


/**
 * Resolve a single related column value.
 *
 * This is still useful when you know that the relationship
 * should resolve to one row, such as:
 *
 * transaction -> user
 *
 * where one transaction belongs to one user.
 *
 * For one-to-many chart assembly, use getRelatedRows()
 * instead.
 */
export function resolveRelatedColumnValue({
  row,
  currentTable,
  targetTable,
  targetColumn,
  dataArray,
  relationships = EMPTY_RELATIONSHIPS,
}) {
  if (!row) return undefined;

  if (currentTable === targetTable) {
    return row[targetColumn];
  }

  const relatedRows = getRelatedRows({
    row,
    currentTable,
    targetTable,
    dataArray,
    relationships,
  });

  return relatedRows[0]?.[targetColumn];
}


// ============================================================
// CONFIG
// ============================================================

export function normalizeConfig(value, table) {
  if (Array.isArray(value)) {
    return normalizeConfig(value[0], table);
  }

  if (value && typeof value === "object") {
    return value;
  }

  return value
    ? {
        table,
        col: value,
      }
    : null;
}


// ============================================================
// CHART ROW ASSEMBLY
// ============================================================

export function assembleChartRows({
  dataArray,
  workingData,
  x,
  y,
  groupBy,
  relationships = EMPTY_RELATIONSHIPS,
}) {
  if (!x?.table || !x?.col) {
    return [];
  }

  const hasY = Boolean(y?.table && y?.col);

  // Count aggregations can be based on X alone.
  if (!hasY) {
    const baseData = workingData || getTableRows(dataArray, x.table);

    if (!Array.isArray(baseData)) {
      return [];
    }

    return baseData.map((row) => {
      let groupValue;

      if (groupBy?.table && groupBy?.col) {
        if (groupBy.table === x.table) {
          groupValue = row[groupBy.col];
        } else {
          groupValue = getRelatedRows({
            row,
            currentTable: x.table,
            targetTable: groupBy.table,
            dataArray,
            relationships,
          })[0]?.[groupBy.col];
        }
      }

      return {
        ...row,
        __x: row[x.col],
        ...(groupBy?.table && groupBy?.col
          ? { __group_by: groupValue }
          : {}),
      };
    });
  }

  /*
   * Same-table chart
   *
   * Example:
   *
   * sales.csv
   *   product
   *   amount
   *
   * X = product
   * Y = amount
   */
  if (x.table === y.table) {
    const baseData = workingData || getTableRows(dataArray, x.table);

    if (!Array.isArray(baseData)) {
      return [];
    }

    return baseData.map((row) => {
      let groupValue;

      if (groupBy?.table && groupBy?.col) {
        if (groupBy.table === x.table) {
          groupValue = row[groupBy.col];
        } else {
          const relatedGroupRows = getRelatedRows({
            row,
            currentTable: x.table,
            targetTable: groupBy.table,
            dataArray,
            relationships,
          });

          groupValue = relatedGroupRows[0]?.[groupBy.col];
        }
      }

      return {
        ...row,

        __x: row[x.col],

        __y: row[y.col],

        ...(groupBy
          ? {
              __group_by: groupValue,
            }
          : {}),
      };
    });
  }


  /*
   * ============================================================
   * CROSS-TABLE CHART
   * ============================================================
   *
   * When X and Y belong to different tables, we need to start
   * from the table on the "many" side of the relationship.
   *
   * Example:
   *
   * users
   * ----------------
   * id
   * name
   *
   * transactions
   * ----------------
   * userId
   * amount
   *
   * relationship:
   *
   * transactions.userId -> users.id
   *
   * We use transactions as the base table because it contains
   * the foreign key and therefore represents the many side.
   *
   * That gives:
   *
   * transaction 1 -> Victor -> 5000
   * transaction 2 -> Victor -> 3000
   *
   * which can then be aggregated:
   *
   * Victor -> 8000
   */

  const relationship = findRelationship(
    x.table,
    y.table,
    relationships
  );

  if (!relationship) {
    return [];
  }


  /*
   * Determine which table owns the foreign key.
   *
   * from_table is the table containing from_column.
   *
   * In:
   *
   * transactions.userId -> users.id
   *
   * transactions is the many/foreign-key side.
   */
  const manyTable = relationship.fromTable;
  const manyColumn = relationship.fromColumn;

  const oneTable = relationship.toTable;
  const oneColumn = relationship.toColumn;


  /*
   * Start from the MANY side.
   *
   * This is the important correction.
   */
  const baseTable = manyTable;

  const baseData = workingData || getTableRows(dataArray, baseTable);

  if (!Array.isArray(baseData)) {
    return [];
  }


  /*
   * Build one chart row for every row on the many side.
   */
  return baseData
    .map((baseRow) => {
      /*
       * Resolve X.
       */
      let xValue;

      if (x.table === baseTable) {
        xValue = baseRow[x.col];
      } else {
        /*
         * X is on the one/parent side.
         *
         * Example:
         *
         * baseRow = transaction
         * X = users.name
         *
         * transaction.userId
         *       ↓
         * users.id
         */
        const relatedXRows = getRelatedRows({
          row: baseRow,
          currentTable: baseTable,
          targetTable: x.table,
          dataArray,
          relationships,
        });

        xValue = relatedXRows[0]?.[x.col];
      }


      /*
       * Resolve Y.
       */
      let yValue;

      if (y.table === baseTable) {
        yValue = baseRow[y.col];
      } else {
        /*
         * Y is on the one/parent side.
         */
        const relatedYRows = getRelatedRows({
          row: baseRow,
          currentTable: baseTable,
          targetTable: y.table,
          dataArray,
          relationships,
        });

        yValue = relatedYRows[0]?.[y.col];
      }


      /*
       * Resolve GROUP BY.
       */
      let groupValue;

      if (groupBy?.table && groupBy?.col) {
        if (groupBy.table === baseTable) {
          groupValue = baseRow[groupBy.col];
        } else {
          const relatedGroupRows = getRelatedRows({
            row: baseRow,
            currentTable: baseTable,
            targetTable: groupBy.table,
            dataArray,
            relationships,
          });

          groupValue = relatedGroupRows[0]?.[groupBy.col];
        }
      }


      return {
        ...baseRow,

        __x: xValue,

        __y: yValue,

        ...(groupBy
          ? {
              __group_by: groupValue,
            }
          : {}),
      };
    })
    .filter((row) => row.__x !== undefined && row.__x !== null);
}


// ============================================================
// SORTING
// ============================================================

function sortByUnit(items, unit) {
  const {
    shortMonths,
    shortWeekdays,
    weekGroups,
  } = timeStampControl;

  if (!unit) {
    return items.sort((a, b) => b.value - a.value);
  }

  if (unit.includes("week")) {
    return items.sort(
      (a, b) =>
        weekGroups.indexOf(a.key) -
        weekGroups.indexOf(b.key)
    );
  }

  if (unit.includes("day")) {
    return items.sort(
      (a, b) =>
        shortWeekdays.indexOf(a.key) -
        shortWeekdays.indexOf(b.key)
    );
  }

  if (unit.includes("mon")) {
    return items.sort(
      (a, b) =>
        shortMonths.indexOf(a.key) -
        shortMonths.indexOf(b.key)
    );
  }

  return items.sort((a, b) => b.value - a.value);
}


// ============================================================
// AGGREGATION
// ============================================================

function aggregateValue(total, count, aggregate) {
  if (aggregate === "sum") {
    return total;
  }

  if (aggregate === "count") {
    return count;
  }

  if (aggregate === "average") {
    return count ? total / count : 0;
  }

  return 0;
}


export function aggregateSingle({
  data,
  unit,
  aggregate,
}) {
  const grouped = {};

  const {
    convertToDigit,
    extractDateUnit,
  } = timeStampControl;

  data.forEach((item) => {
    const key = unit
      ? extractDateUnit({
          value: item.__x,
          unit,
        }) || "N/B"
      : item.__x ?? "N/B";

    if (!grouped[key]) {
      grouped[key] = {
        total: 0,
        count: 0,
      };
    }

    grouped[key].total +=
      item.__y == null
        ? 0
        : convertToDigit(item.__y);

    grouped[key].count += 1;
  });

  return sortByUnit(
    Object.entries(grouped).map(([key, value]) => ({
      key,

      value: aggregateValue(
        value.total,
        value.count,
        aggregate
      ),
    })),
    unit
  );
}


export function aggregateGrouped({
  data,
  unit,
  aggregate,
}) {
  const grouped = {};

  const {
    convertToDigit,
    extractDateUnit,
  } = timeStampControl;

  data.forEach((item) => {
    const timeKey = unit
      ? extractDateUnit({
          value: item.__x,
          unit,
        }) || "N/B"
      : item.__x ?? "N/B";

    const groupKey = String(
      item.__group_by ?? "N/A"
    );

    if (!grouped[timeKey]) {
      grouped[timeKey] = {};
    }

    if (!grouped[timeKey][groupKey]) {
      grouped[timeKey][groupKey] = {
        total: 0,
        count: 0,
      };
    }

    grouped[timeKey][groupKey].total +=
      item.__y == null
        ? 0
        : convertToDigit(item.__y);

    grouped[timeKey][groupKey].count += 1;
  });

  const groupKeys = [
    ...new Set(
      Object.values(grouped).flatMap(
        Object.keys
      )
    ),
  ];

  return groupKeys.map((groupKey) => ({
    groupKey,

    data: sortByUnit(
      Object.entries(grouped).map(
        ([key, groups]) => ({
          key,

          value: aggregateValue(
            groups[groupKey]?.total || 0,
            groups[groupKey]?.count || 0,
            aggregate
          ),
        })
      ),
      unit
    ),
  }));
}


// ============================================================
// GROUP VALUES
// ============================================================

export function getGroupValues(dataArray, groupBy) {
  if (!groupBy) return [];

  return [
    ...new Set(
      getTableRows(
        dataArray,
        groupBy.table
      ).map(
        (row) => row?.[groupBy.col]
      )
    ),
  ];
}


// ============================================================
// PAGINATION
// ============================================================

export function getPage(value, meta) {
  return value.slice(
    meta.skip || 0,
    (meta.skip || 0) + meta.limit
  );
}


// ============================================================
// EXPORTS
// ============================================================

export {
  EMPTY_RELATIONSHIPS,
  pagination,
};

