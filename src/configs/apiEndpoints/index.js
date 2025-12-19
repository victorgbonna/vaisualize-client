const API_ENDPOINTS = {
  MY_DETAILS:{
    NAME:'Victor Chiedo Ogbonn',
    EMAIL:'victorgbonna',
    PHONE:'08102603301',
    WHATSAPP:'https://wa.me/2348102603301',
    FB:'',
    X:'',
    
    LINKEDIN:'https://www.linkedin.com/in/victorgbonna/',
    ACCOUNT_DETAILS:[
      {
        COUNTRY:'NGN  ',
        ACCOUNT_NAME:'OGBONNA VICTOR CHIEDOZIE',
        BANK_NAME:'UBA',
        ACCOUNT_NUMBER:'2096277247'
      },
      {
        COUNTRY:'USD',
        ACCOUNT_NAME:'VICTOR CHIEDOZIE OGBONNA',
        BANK_NAME:'LEAD BANK',
        ACCOUNT_NUMBER:'214425731185'
      }
    ]
  },
  MAKE_A_REQUEST:'requests/prompt-visuals',
  GET_REQUEST:(x)=>{
    return 'requests/get/one/'+x
  },
  ADD_FILTER:'visuals/filter/add',
  GET_ALL_PUBLIC_REQUESTS:'requests/get/all-public',
  SEND_PAYMENT:'payments/initialize',
  
  GET_FILTER_FOR_VISUALS:(id)=>'visuals/filter/get-all/'+id,
  GET_ALL_FILTERS:'visuals/filter/get-all/',
  RESET_FILTERS:'visuals/filter/reset',
  MASS_UPDATE_VISUALS:'visuals/mass-update',
  EDIT_CHART:'visuals/edit', 
  DELETE_CHART:'visuals/delete',
  ADD_CHART:'visuals/add',
  METRIC_ICONS:[
    {match:'Rating', value:'star.svg'},
    {match:'Maxdate', value:'calendar.svg'},
    {match:'Mindate', value:'calendar.svg'},

    {match:'Max', value:'trend-up.svg'},
    {match:'Min', value:'trend-down.svg'},
    
    {match:'Age', value:'person.svg'},
    {match:'Revenue', value:'cash.svg'},
    {match:'Purchase', value:'purchase.svg'},
    {match:'Amount', value:'cash.svg'},
    
  ],
  CONTACT_LINE:'https://wa.me/2348102603301',
  PLOT_DATA: [
  {
    "plot_type": "bar chart",
    "title": "Clients by state of residence",
    "description": "Number of clients in each state to highlight the most represented locations.",
    "x": "state of residence",
    "y": "Email Address",
    "aggregate": "count",
    "why": "Bar charts effectively compare frequencies across categories."
  },
  {
    "plot_type": "bar chart",
    "title": "Occupation distribution of clients",
    "description": "Counts of clients by occupation to see dominant professions.",
    "x": "Occupation",
    "y": "Email Address",
    "aggregate": "count",
    "why": "Useful for visualizing categorical frequency distributions."
  },
  {
    "plot_type": "pie chart",
    "title": "Gender breakdown of clients",
    "description": "Proportion of clients by gender.",
    "x": "Gender",
    "y": "Email Address",
    "aggregate": "count",
    "why": "Pie charts show how each category contributes to the whole."
  },
  {
    "plot_type": "heatmap",
    "title": "Gender mix across states",
    "description": "Density of clients by gender within each state of residence.",
    "x": "state of residence",
    "y": "Gender",
    "aggregate": "count",
    "why": "Heatmaps reveal concentrations across two categorical dimensions."
  },
  {
    "plot_type": "heatmap",
    "title": "Marital status by occupation",
    "description": "Distribution of marital statuses across occupations.",
    "x": "Occupation",
    "y": "Marital Status",
    "aggregate": "count",
    "why": "Highlights patterns between two categorical variables."
    }
  ],

  GET_COLORS:[
    "rgba(255, 0, 0, 1)",       // Red
  "rgba(0, 0, 255, 1)",       // Blue
  "rgba(0, 170, 0, 1)",       // Green
  "rgba(255, 127, 0, 1)",     // Orange
  "rgba(139, 0, 255, 1)",     // Violet
  "rgba(255, 215, 0, 1)",     // Gold
  "rgba(0, 206, 209, 1)",     // Dark Turquoise
  "rgba(255, 20, 147, 1)",    // Deep Pink
  "rgba(0, 255, 0, 1)",       // Neon Green
  "rgba(30, 144, 255, 1)",    // Dodger Blue
  "rgba(255, 69, 0, 1)",      // Orange Red
  "rgba(148, 0, 211, 1)",     // Dark Violet
  "rgba(255, 255, 0, 1)",     // Yellow
  "rgba(0, 250, 154, 1)",     // Medium Spring Green
  "rgba(220, 20, 60, 1)",     // Crimson
  "rgba(127, 255, 0, 1)",     // Chartreuse
  "rgba(255, 0, 255, 1)",     // Magenta
  "rgba(0, 191, 255, 1)",     // Deep Sky Blue
  "rgba(165, 42, 42, 1)",     // Brown
  "rgba(0, 0, 0, 1)"  
  ],
  LIST_CHARTS:{
    'area chart':
      {
        x:{
          colType:['date_column']
        },
        y:{
          colType:['numerical_column'],
          isOptional:true
        },
        group_by:{
          colType:['categorical_column'],
          isOptional:true
        },
        unit:{
          isOptional:true
        },
        aggregate:{
          isOptional:false
        }
      }
     ,
    'line chart':
      {
        x:{
          colType:['date_column']
        },
        y:{
          colType:['numerical_column'],
          isOptional:true
        },
        group_by:{
          colType:['categorical_column'],
          isOptional:true
        },
        unit:{
          isOptional:true
        },
        aggregate:{
          isOptional:false
        }
      },
    'histogram':
      {
        x:{
          colType:['numerical_column']
        },
        y:{
          colType:['numerical_column'],
          isOptional:true
        },
        // group_by:{
        //   colType:['categorical_column'],
        //   isOptional:true
        // },
        aggregate:{
          isOptional:false
        }
      }, 
    'box plot':
      {
        x:{
          colType:['categorical_column']
        },
        y:{
          colType:['numerical_column'],
          isOptional:false
        },
        // unit:{
        //   isOptional:true
        // }
      }, 
    'violin plot':
      {
        x:{
          colType:['categorical_column']
        },
        y:{
          colType:['numerical_column'],
          isOptional:false
        },
        // unit:{
        //   isOptional:true
        // }
      },
    'scatter plot':
      {
        x:{
          colType:['numerical_column']
        },
        y:{
          colType:['numerical_column']
        },
        group_by:{
          isOptional:true,
          colType:['categorical_column'],

        }
      }, 
    'bubble chart':
      {
        x:{
          colType:['numerical_column']
      },
        y:{
          colType:['numerical_column']
        },
        group_by:{
          isOptional:true,
          colType:['categorical_column'],
        },
        z:{
          colType:['numerical_column']
        }
      },
    'bar chart':
      {
        x:{
          colType:['categorical_column', 'date_column']
        },
        y:{
          colType:['numerical_column'],
          isOptional:true
        },
        group_by:{
          isOptional:true,
          colType:['categorical_column'],

        },
        aggregate:{
          isOptional:false
        }
      },
    'pie chart':
      {
        x:{
          colType:['categorical_column']
        },
        aggregate:{
          isOptional:false
        }
      },
    'radar chart':
      {
        x:{
          isArray:true,
          length:4,
          colType:[ 'numerical_column']
        },
        y:{
          colType:['categorical_column']
        },
      },
    'matrix heatmap':{
      x:{
          isArray:true,
          max_length: 6,
          colType:[ 'numerical_column']
        },
        y:{
          colType:['categorical_column']
        },
    }
    
  }
};

export default API_ENDPOINTS


// const filters = [
//   [
//     { column: "status", filterOpt: "eq", value: "active" },
//     { column: "role", filterOpt: "neq", value: "admin" }
//   ],
//   [
//     { column: "age", filterOpt: "eq", value: 25 }
//   ]
// ];

// const data = [
//   { name: "John", status: "active", role: "user", age: 25 },
//   { name: "Doe", status: "inactive", role: "admin", age: 30 },
//   { name: "Sam", status: "active", role: "editor", age: 25 },
// ];
// data.filter((data_row)=>{
//     filters.some((filter_or_set)=>
//     filter_or_set.every((filter_and_set)=>{
//         const col_value=data_row[filter_and_set.column]
//         let passed_test=filter_and_set.filterOpt==='eq'?col_value==filter_and_set.value:col_value!=filter_and_set.value
//         return passed_test
//     }))
// })
