import API_ENDPOINTS from "../apiEndpoints";

const chatFormChecker = (form_data) => {
    const form_plot_type= form_data.chartType
    // const rules_for_chart=API_ENDPOINTS.LIST_CHARTS[form_plot_type]
    const chart_props=['x', 'y','z', 'group_by', 'aggregate', 'unit']
    
    const max_min={
      'matrix heatmap':{max:6, min:1},
      'radar chart':{max:5,min:3}
    }
    if (!form_plot_type) {
      return { error: 'Please choose a plot type.' };
    }

    if (typeof form_data.x === 'string' && !form_data.x) {
      return { error: 'A horizontal (X) column is required for this chart.' };
    }

    // if (typeof form_data.x !== 'string' && !form_data.x?.length) {
    //   return { error: 'At least one horizontal (X) column is required for this chart.' };
    // }

    if (
      form_plot_type === 'area chart' ||
      form_plot_type === 'line chart'
    ) {
      if (!form_data.unit) {
        return { error: 'Please provide a unit value for this chart.' };
      }

      if (form_data.aggregate !== 'count' && !form_data.y) {
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
      if (!form_data.x) {
        return { error: 'Please select an X-axis column for this chart.' };
      }

      if (!form_data.y) {
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
      if (!form_data.y) {
        return { error: 'Please select a Y-axis column for this chart.' };
      }

      if (form_plot_type === 'bubble chart' && !form_data.z) {
        return { error: 'Please select a Z-axis column for the bubble chart.' };
      }
    }

    else if (
      form_plot_type === 'histogram' ||
      form_plot_type === 'bar chart'
    ) {
      if (form_data.aggregate !== 'count' && !form_data.y) {
        return {
          error:
            'A Y-axis column is required for the selected aggregate. ' +
            'Please choose a Y column or select the "count" aggregate instead.',
        };
      }
    }

    // pie chart handled separately
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

function getDisabledCharts(columns = []) {
  let disabled_list = [];

  for (const cat of ['numerical_column', 'date_column', 'categorical_column']) {
    const hasColumn = columns.some(col => col.cat === cat);

    if (!hasColumn) {
      disabled_list.push(...CHART_DEPENDENCIES[cat]);
    }
  }

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
const chartChecker= {chatFormChecker, getDisabledCharts, no_cat_fields, CHART_DEPENDENCIES}
export default chartChecker


    // https://football-cleansheet-data-api.onrender.com/seasons/get-new-league-info
