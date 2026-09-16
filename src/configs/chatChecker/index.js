import API_ENDPOINTS from "../apiEndpoints";

const CHART_TYPE_ALIASES = {
  area: 'area chart',
  'area chart': 'area chart',
  line: 'line chart',
  'line chart': 'line chart',
  bar: 'bar chart',
  'bar chart': 'bar chart',
  hbar: 'bar chart',
  pie: 'pie chart',
  'pie chart': 'pie chart',
  scatter: 'scatter plot',
  'scatter plot': 'scatter plot',
  bubble: 'bubble chart',
  'bubble chart': 'bubble chart',
  heatmap: 'matrix heatmap',
  'matrix heatmap': 'matrix heatmap',
  radar: 'radar chart',
  'radar chart': 'radar chart',
  boxplot: 'box plot',
  'box plot': 'box plot',
  violin: 'violin plot',
  'violin plot': 'violin plot',
  histogram: 'histogram',
};

const normalizeChartType = (value) => {
  if (!value || typeof value !== 'string') return value;
  const cleaned = value.trim().toLowerCase();
  return CHART_TYPE_ALIASES[cleaned] || cleaned;
};

const normalizeColumnType = (value) => {
  if (!value || typeof value !== 'string') return null;

  const normalized = value.trim().toLowerCase();

  if (
    ['number', 'numeric', 'float', 'float64', 'double', 'decimal', 'int', 'integer', 'bigint', 'int64', 'real', 'money', 'percent', 'percentage'].includes(normalized)
    || normalized.includes('int')
    || normalized.includes('float')
    || normalized.includes('num')
    || normalized.includes('decimal')
    || normalized.includes('double')
  ) {
    return 'numerical_column';
  }

  if (
    ['date', 'datetime', 'timestamp', 'time', 'year', 'month', 'day', 'date-time', 'datetime64', 'datestamp'].includes(normalized)
    || normalized.includes('date')
    || normalized.includes('time')
  ) {
    return 'date_column';
  }

  if (
    ['string', 'text', 'varchar', 'char', 'uuid', 'identifier', 'category', 'categorical', 'boolean', 'bool', 'object', 'enum', 'foreign key', 'fk'].includes(normalized)
    || normalized.includes('char')
    || normalized.includes('text')
    || normalized.includes('bool')
    || normalized.includes('string')
    || normalized.includes('id')
  ) {
    return 'categorical_column';
  }

  return null;
};


const extractRelationshipColumns = (table_relationships = []) => {
  const relationshipNames = new Set();

  if (!Array.isArray(table_relationships)) return relationshipNames;

  table_relationships.forEach((relationship) => {
    if (!relationship || typeof relationship !== 'object') return;

    const keys = [
      ['source_column', 'target_column'],
      ['source_col', 'target_col'],
      ['source_field', 'target_field'],
      ['source_key', 'target_key'],
      ['from_column', 'to_column'],
      ['from_field', 'to_field'],
      ['left_column', 'right_column'],
      ['left_key', 'right_key'],
      ['fk_column', 'pk_column'],
      ['child_column', 'parent_column'],
      ['column_a', 'column_b'],
    ];

    keys.forEach(([sourceKey, targetKey]) => {
      const sourceCol = relationship[sourceKey];
      const targetCol = relationship[targetKey];

      if (sourceCol) relationshipNames.add(String(sourceCol));
      if (targetCol) relationshipNames.add(String(targetCol));
    });

    Object.entries(relationship).forEach(([key, value]) => {
      if (typeof value === 'string' && /(?:id|key)/i.test(key)) {
        relationshipNames.add(value);
      }
    });
  });

  return relationshipNames;
};

const buildRelationshipMap = (table_relationships = []) => {
  const relationshipMap = new Map();

  if (!Array.isArray(table_relationships)) return relationshipMap;

  table_relationships.forEach((relationship) => {
    if (!relationship || typeof relationship !== 'object') return;

    const sourceTable = relationship.source_table || relationship.from_table || relationship.left_table;
    const targetTable = relationship.target_table || relationship.to_table || relationship.right_table;
    const pairs = [
      ['source_column', 'target_column'],
      ['source_col', 'target_col'],
      ['source_field', 'target_field'],
      ['from_column', 'to_column'],
      ['from_field', 'to_field'],
      ['left_column', 'right_column'],
      ['left_field', 'right_field'],
      ['fk_column', 'pk_column'],
      ['child_column', 'parent_column'],
    ];

    if (!sourceTable || !targetTable) return;

    pairs.forEach(([sourceKey, targetKey]) => {
      const sourceColumn = relationship[sourceKey];
      const targetColumn = relationship[targetKey];

      if (!sourceColumn || !targetColumn) return;

      relationshipMap.set(`${sourceTable}::${sourceColumn}`, {
        table: targetTable,
        column: targetColumn,
      });
      relationshipMap.set(`${targetTable}::${targetColumn}`, {
        table: sourceTable,
        column: sourceColumn,
      });
    });
  });

  return relationshipMap;
};

const getDirectlyRelatedTables = (table_relationships = [], tableNames = []) => {
  const selectedTables = new Set(Array.isArray(tableNames) ? tableNames : [tableNames]);
  const relatedTables = new Set(selectedTables);

  if (!Array.isArray(table_relationships)) return relatedTables;

  table_relationships.forEach((relationship) => {
    if (!relationship || typeof relationship !== 'object') return;

    const sourceTable = relationship.source_table || relationship.from_table || relationship.left_table;
    const targetTable = relationship.target_table || relationship.to_table || relationship.right_table;

    if (!sourceTable || !targetTable) return;
    if (selectedTables.has(sourceTable)) relatedTables.add(targetTable);
    if (selectedTables.has(targetTable)) relatedTables.add(sourceTable);
  });

  return relatedTables;
};

const groupColumnsByTable = (columns = [], table_relationships = []) => {
  const relationshipMap = buildRelationshipMap(table_relationships);
  const columnsByTable = {};

  if (!Array.isArray(columns)) return columnsByTable;

  columns.forEach((column) => {
    if (!column || !column.col) return;

    const table = column.table || column.datasetName || column.tableName || 'Unknown';
    const relationship = relationshipMap.get(`${table}::${column.col}`) || null;

    if (!columnsByTable[table]) columnsByTable[table] = [];

    columnsByTable[table].push({
      ...column,
      table,
      references: relationship,
    });
  });

  return columnsByTable;
};

const resolveProjectColumns = (columns = [], project_data = null) => {
  if (Array.isArray(columns) && columns.length && !project_data) return columns;

  const datasets = Array.isArray(project_data?.datasets) ? project_data.datasets : [];
  const relationshipKeys = extractRelationshipColumns(project_data?.table_relationships || []);

  const resolvedColumns = [];

  datasets.forEach((dataset, datasetIndex) => {
    const datasetName = dataset?.file_name || dataset?.name || dataset?.title || `dataset_${datasetIndex + 1}`;
    const columnTypeMap = new Map();

    const typedColumns = Array.isArray(dataset?.columns?.column_data_types)
      ? dataset.columns.column_data_types
      : [];

    typedColumns.forEach((entry) => {
      const key = entry?.column_name || entry?.name || entry?.field || entry?.column || entry?.key;
      if (!key) return;
      const value = entry?.data_type || entry?.type || entry?.column_data_type || entry?.category;
      const normalized = normalizeColumnType(value || entry?.cat || '');
      if (normalized) {
        columnTypeMap.set(String(key), normalized);
      }
    });

    const rawNames = [];
    if (Array.isArray(dataset?.columns?.all_columns)) rawNames.push(...dataset.columns.all_columns);
    if (Array.isArray(dataset?.columns?.active_columns)) rawNames.push(...dataset.columns.active_columns);
    if (Array.isArray(dataset?.columns)) rawNames.push(...dataset.columns.map((item) => item?.column || item?.name || item));

    if (!rawNames.length && Array.isArray(dataset?.first_five_rows) && dataset.first_five_rows[0]) {
      rawNames.push(...Object.keys(dataset.first_five_rows[0]));
    }

    const uniqueNames = [...new Set(rawNames.filter(Boolean).map((item) => String(item)))];

    uniqueNames.forEach((columnName) => {
      const directMatch = columnTypeMap.get(columnName);
      const matchEntry = Array.isArray(dataset?.col_data_type)
        ? dataset.col_data_type.find((item) => item?.column === columnName || item?.name === columnName || item?.field === columnName)
        : null;

      const fallbackCat = normalizeColumnType(
        matchEntry?.data_type || matchEntry?.type || matchEntry?.category || ''
      );

      const cat = directMatch || fallbackCat;
      if (!cat) return;

      resolvedColumns.push({
        col: columnName,
        cat,
        datasetName,
        datasetIndex,
        isRelationshipKey: relationshipKeys.has(columnName),
      });
    });
  });

  return resolvedColumns.length ? resolvedColumns : columns;
};

const chatFormChecker = (form_data) => {
    const form_plot_type = normalizeChartType(form_data.chartType)
    const chart_props=['x', 'y','z', 'group_by', 'aggregate', 'unit']
    const selectedValue = (value) => value && typeof value === 'object' && !Array.isArray(value)
      ? value.col
      : value
    
    const max_min={
      'matrix heatmap':{max:6, min:1},
      'radar chart':{max:5,min:3}
    }
    if (!form_plot_type) {
      return { error: 'Please choose a plot type.' };
    }

    if (!selectedValue(form_data.x)) {
      return { error: 'A horizontal (X) column is required for this chart.' };
    }

    if (
      form_plot_type === 'area chart' ||
      form_plot_type === 'line chart'
    ) {
      if (!form_data.unit) {
        return { error: 'Please provide a unit value for this chart.' };
      }

      if (form_data.aggregate !== 'count' && !selectedValue(form_data.y)) {
        return {
          error:
            'A Y-axis column is required for the selected aggregate. ' +
            'Please choose a Y column or select the "count" aggregate instead.',
        };
      }
    }

    else if (
      form_plot_type === 'box plot' ||
      form_plot_type === 'violin plot'
    ) {
      if (!selectedValue(form_data.x)) {
        return { error: 'Please select an X-axis column for this chart.' };
      }

      if (!selectedValue(form_data.y)) {
        return { error: 'Please select a Y-axis column for this chart.' };
      }
    }

    else if (
      form_plot_type === 'matrix heatmap' ||
      form_plot_type === 'radar chart'
    ) {
      if (form_data.x?.length < max_min[form_plot_type].min) {
        return {
          error:
            `Please select at least ${max_min[form_plot_type].min} X-axis values.`,
        };
      }

      if (form_data.x?.length > max_min[form_plot_type].max) {
        return {
          error:
            `Please select no more than ${max_min[form_plot_type].max} X-axis values.`,
        };
      }
    }

    else if (
      form_plot_type === 'scatter plot' ||
      form_plot_type === 'bubble chart'
    ) {
      if (!selectedValue(form_data.y)) {
        return { error: 'Please select a Y-axis column for this chart.' };
      }

      if (form_plot_type === 'bubble chart' && !selectedValue(form_data.z)) {
        return { error: 'Please select a Z-axis column for the bubble chart.' };
      }
    }

    else if (
      form_plot_type === 'histogram' ||
      form_plot_type === 'bar chart'
    ) {
      if (form_data.aggregate !== 'count' && !selectedValue(form_data.y)) {
        return {
          error:
            'A Y-axis column is required for the selected aggregate. ' +
            'Please choose a Y column or select the "count" aggregate instead.',
        };
      }
    }

    return {};
  }
const CHART_DEPENDENCIES = {
 numerical_column: [
    'histogram',
    'box plot',
    'scatter plot',
    'violin plot',
    'bubble chart',
    'radar chart',
    'matrix heatmap',
  ],

  categorical_column: [
    'pie chart',
    'box plot',
    'violin plot',
    'radar chart',
    'matrix heatmap',
  ],

  date_column: [
    'area chart',
    'line chart',
  ],
};

function getDisabledCharts(columns = [], project_data = null) {
  const resolvedColumns = resolveProjectColumns(columns, project_data);

  const availableTypes = new Set(
    resolvedColumns
      .map((column) => {
        if (['numerical_column', 'categorical_column', 'date_column'].includes(column.cat)) {
          return column.cat;
        }
        return normalizeColumnType(column.cat);
      })
      .filter(Boolean)
  );

  const disabled_list = [];

  Object.entries(API_ENDPOINTS.LIST_CHARTS || {}).forEach(([chartName, fields]) => {
    const requiredFields = Object.values(fields || {}).filter(
      (field) => field && Array.isArray(field.colType) && field.isOptional !== true
    );

    const canBeUsed = requiredFields.every((field) =>
      field.colType.some((type) => availableTypes.has(type))
    );

    if (!canBeUsed) {
      disabled_list.push(chartName);
    }
  });

  return [...new Set(disabled_list)];
}
const no_cat_fields={
        numerical_column:
        'No numerical column found. Charts like ' +
        'histogram(x) box plot(y), scatter plot(x,y),' +
        'violin plot(y), bubble chart(x,y,z), ' +
        'radar chart(x) and matrix heatmap(x) ' +
        'will not be available.',

        categorical_column:
        'No categorical column found. Charts like ' +
        'pie chart(x), ' +
        'box plot(x), violin plot(x), ' +
        'radar chart(y) and matrix heatmap(y) ' +
        'will not be available.',

        date_column:
        'No date column found. Charts like ' +
        'area chart(x) and line chart(x) ' +
        'will not be available.',
    }
const chartChecker= {chatFormChecker, getDisabledCharts, no_cat_fields, CHART_DEPENDENCIES, normalizeChartType, resolveProjectColumns, extractRelationshipColumns, buildRelationshipMap, getDirectlyRelatedTables, groupColumnsByTable, normalizeColumnType}
export default chartChecker


    // https://football-cleansheet-data-api.onrender.com/seasons/get-new-league-info
