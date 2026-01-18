const PAGE_ROUTES = {
  HOME:'/',
  CENTER_NAVS:[
    {
      label: 'Features',
      hasSublinks: true,
      routes: [
        {
          feature: 'AI-Driven Visual Generation',
          descr: 'An AI assistant automatically analyzes your data structure and generates suitable visualizations from the start, enabling immediate review and refinement.'
        },
        {
          feature: 'Rich Visualization Library',
          descr: 'Create professional-grade visuals including bar charts, grouped bar charts, histograms, line plots, area charts, box plots, violin plots, heatmaps, radar charts, scatter plots, and bubble charts.'
        },
        {
          feature: 'Data Modelling & Relationships',
          descr: 'Structure datasets by defining data types, relationships, and entities to ensure accurate and accurate analysis across multiple connected data files.'
        },
        {
          feature: 'LLM-Powered Data Exploration',
          descr: 'Interact with your datasets using natural language. Ask questions, explore trends, and gain insights through an LLM-powered assistant.'
        },
        {
          feature: 'Intelligent Chart Selection',
          descr: 'An automated chart selection system that evaluates data compatibility and presents only valid, meaningful visualization options.'
        },
        {
          feature: 'Advanced Filtering & Drill-Down',
          descr: 'Apply dynamic filters and drill-down operations to focus on specific segments, categories, or time ranges.'
        },
        {
          feature: 'Customizable Visuals',
          descr: 'Fine-tune chart styles, axes, labels, and values to align with analytical and presentation requirements.'
        },
        {
          feature: 'Annotated Insights',
          descr: 'Add contextual explanations directly to visuals to support clearer data storytelling.'
        },
        {
          feature: 'Export Visuals for Presentations',
          descr: 'Export high-quality visuals and reports optimized for presentations and stakeholder communication.'
        }
      ]
    },
    {label:'Community', route:'/community'},
    {label:'FAQs', route:'/faqs'},
    {label:'Pricing', route:'/pricing'},
    {label:'Log In', isAuth:true, route:'/auth/login'},
    {label:'Register', isAuth:true, route:'/auth/register'},
  ],
  AUTH_ROUTES:{
    LOGIN:'/auth/sign-in',
    REGISTER:'/auth/sign-up'
  },

  A_REQ:(id)=>{
    return '/analysis/'+id
  },
  A_COMP_EDIT:(id)=>{
    return '/competition/edit/'+id
  },
  ONE_USER:(fId)=>{
    return '/users/p/'+fId
  },
  A_REQUEST_PAGE:(fId)=>{
    return '/analysis/'+fId
  }
  
  
};

export default PAGE_ROUTES