const API_ENDPOINTS = {
  MY_DETAILS:{
    NAME:'Victor Chiedo Ogbonn',
    EMAIL:'victorgbonna',
    PHONE:'08102603301',
    WHATSAPP:'https://wa.me/2348102603301',
    FB:'',
    X:'',
    
    LINKEDIN:'https://www.linkedin.com/in/victorgbonna/',
    ACCOUNT_DETAILS:{
      NAIRA:{
        ACCOUNT_NAME:'OGBONNA VICTOR CHIEDOZIE',
        BANK_NAME:'UBA',
        ACCOUNT_NUMBER:'2096277247'
      },
      DOLLARS:{
        ACCOUNT_NAME:'OGBONNA VICTOR CHIEDOZIE',
        BANK_NAME:'UBA',
        ACCOUNT_NUMBER:'2096277247'
      }
    }
  },
  MAKE_A_REQUEST:'requests/prompt-visuals',
  GET_REQUEST:(x)=>{
    return 'requests/get/one/'+x
  },
  GET_ALL_PUBLIC_REQUESTS:'requests/get/all-public',
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
  BLOGS:[
    
    {
      id: -15,
      title:'Inside Our Site Tour: What We Discovered on the Land',
      text:'On Friday, 14th November 2025, we hosted a site tour where our realtors experienced the property beyond what pictures can show.',
      date:'15/11/2025',
      category:'public',
      type:'site',
      link:'/blogs/men-at-work/site-tour-2025',
      src:'blog/realtor-tour/climax-site-tour.jpg'
    },
    {
      id: -14,
      title: "Building Bonds with Ikoku, Fostering Growth and Impact.",
      text: "Climax Properties proudly hosted the Eastlake Garden Allocation Ceremony with members of the Excellence 44 Line Motor Spare Part Dealers Union (INC), Ikoku.",
      date: "27/10/2025",
      category: ["public"],
      type: "event",
      link: "/blogs/allocation-ceremony/eastlake-garden",
      src: "blog/eastlake-allocation/happy-clients.png"
    },
    {
        id:-13,
        title:"Celebrating Culture, Diversity, Inclusion and Unity.",
        text:"Climax Properties Cultural Day Celebration, a colorful and vibrant day where staff showcased their heritage, unity and diversity.",
        date:"29/09/2025",
        category:["public"],type:"event",
        link:"/blogs/events/cultural_day_with_climax",
        src:"blog/cultural-day/collage.png"
    },
    {
        id:-12,
        title:"Climax Properties at the Port Harcourt Realtors Conference 2025.",
        text:"Highlights from Climax Properties' sponsorship and participation at the biggest real estate conference in Port Harcourt, hosted by the Port Harcourt Realtors Association.",
        date:"15/09/2025",
        category:["public"],type:"event",
        link:"/blogs/events/realtor_conference2025",
        src:"blog/realtor-conference/conferencecollage.png"
    },
    {
        id:-11,
        title:"A Landmark Moment in Atali, Portharcourt.",
        text:'We are thrilled to share highlights from the successful allocation ceremony of Joe’s Villa Phase 1.',
        date:"13/07/2025",
        category:["public"],type:"event",
        link:"/blogs/allocation-ceremony/joes-villa",
        src:"blog/joe-allocation-ceremony/compilation.png"
    },
    {
        id:-10,
        title:"Climax Court Keeps Growing Strong.",
        text:'The much-anticipated gatehouse for Climax Court Phase 2 is nearing completion, and it"s a true symbol of the premium living experience we envisioned.',
        date:"23/06/2025",
        category:["public"],type:"site update",
        link:"/blogs/men-at-work/climax-court-update",
        src:"blog/climax-court-new-2.jpeg"
    },
    {
        id:-9,
        
        title:"Climax Court Phase 3 Now Selling at Prelaunch Price for just 50 plots.",
        text:'With phases 1 & 2 sold out, don"t miss your chance on the new one...',
        date:"16/06/2025",
        category:["public"],type:"new estate alert",
        link:"/blogs/climax-court-update/phase3-opening",
        src:"blog/climax-court-new-3.jpeg"
    },
    {
        id:-8,
        title:"Another Day, Another Award for Climax Properties Consult Limited.",
        text:'It"s no surprise that we bagged two awards at the 2025 Port Harcourt Real Estate Awards.',
        date:"06/06/2025",
        category:["public"],type:"blog",
        link:"/blogs/award-night/ph-real-estate-2025",
        src:"blog/ph-real-estate-award2025-2.jpg"
    },
    {
        id:-7,
        title:"Site Progress Update: Eastlake Gardens Gaining Ground",
        text:'After the exciting progress at Joes Villa, site development continues across our estates with gatehouse constructions now underway at Eastlake Gardens...',
        date:"12/05/2025",
        category:["public"],type:"site update",
        link:"/blogs/men-at-work/eastlake-update",
        src:"estates/eastlake/eastlake_photo2.jpeg"
    },
    {
        id:-6,
        title:"Behind the Gates: Joe's Villa Moves from Sold-Out Success to Site Development Progress",
        text:'From gatehouse development to a site visit by our project manager, see how Climax Properties continues to deliver on its promise of premium living.',
        date:"05/05/2025",
        category:["public"],type:"site update",
        link:"/blogs/men-at-work/joes-villa-update",
        src:"estates/joes_villa/joes_villa.jpeg"
    },
    {
        id:-5,
        title:"He Turned ₦15M into ₦30M While Others Were Still Thinking",
        text:'While others were stuck analyzing and overthinking, Okwudili wasted no time securing land at a prelaunch price. Now, the price has doubled, and his investment is already paying off.',
        date:"18/03/2025",
        category:["public"],type:"story time",
        link:"/blogs/prelaunch-jackpot",
        src:"blog/okwudili.jpg"
    },
    {
        id:-3,
        title:"Valentine's Day Broke You? Josh Played the Game Well.",
        text:'While some are dodging bank alerts after February 14th, others are cashing out stress-free. That is the story about Francis (broke lover boy) and Josh (money-wise playboy)',
        date:"24/02/2025",
        category:["public"],type:"story time",
        link:"/blogs/financial-mistakes-vs-smart-investments",
        src:"blog/josh-the-playboy.jpg"
    },
    {
        id:-2,
        title:"Theo's Valentine Scam - Don't Let This Happen to You!",
        text:'He thought he was securing their future with a big romantic gesture, but things didn’t go as planned. What seemed like the perfect surprise quickly turned into a painful lesson he never expected.',
        date:"15/02/2025",
        category:["public"],type:"story time",
        link:"/blogs/valentine-love-scams",
        src:"blog/valentine-scams.jpg"
    },
    {
        id:-1,
        title:"GIFT LAND, GIFT LOVE: A VALENTINE'S SPECIAL",
        text:'Ah, Valentine"s Day, the annual scramble to find a gift that says, "I love you more than overpriced chocolates and wilting roses." This year, why not up the ante and give your beloved something truly enduring? Forget the cliched teddy bears; let"s talk about gifting a plot of land.',
        date:"10/02/2025",
        category:["public"],type:"blog",
        link:"/blogs/gift-a-plot-this-valentine",
        src:"blog/gift_a_plot.png"
    },{
        id:1,
        title:"The 5 Cheat Codes of Real Estate – How to Pick the Right Property & Win Big.",
        text:"Discover the 5 key real estate property types — residential, commercial, industrial, agricultural, and mixed-use. Find out which investment is right for you and secure your future.",
        date:"04/02/2025",
        category:["public"],type:"blog",
        link:"/blogs/cheat-codes-of-real-estate",
        src:"blog/cheat-blog-cover.jpg"
    },
    {
        id:2,
        title:"A Heartfelt Thanksgiving for a Year of Real Estate Success.",
        text:"As the year comes to a close, we at Climax Properties pause to give thanks to God for an incredible year filled with remarkable achievements and milestones in real estate. From successful launches to satisfied clients, every step of this journey has been guided by His grace. We held a special thanksgiving service to express our gratitude for his blessings.",
        date:"21/12/2024",
        category:["public"],type:"event",
        // link:"/",
        src:"blog/thanksgiving.jpg"
    },{
        id:3,
        title:"Climax Properties wins another Big Award in Abuja.",
        text:"We are thrilled to announce that Climax Properties has been recognized once again for our outstanding contributions to the real estate sector. At a prestigious Pan-African ceremony in Abuja, we were honored. This is a testament to our unwavering commitment to excellence, innovation, and customer satisfaction.",
        date:"25/11/2024",type:"event",
        category:["public"],
        // link:"/",
        src:"blog/joel_award_with.jpg"
    },
    {
        id:4,
        title:"Climax City Estate Officially Launched!!",
        text:"The long-awaited launch of Climax City Estate is finally here! This iconic development marks a new chapter in our journey to provide exceptional housing and investment opportunities. The event was a moment of celebration and gratitude, as we gathered to unveil this masterpiece, blessed with prayers and goodwill.",
        date:"28/08/2024",type:"event",
        category:["public"],
        // link:"/",
        src:"blog/climax_launch.jpg"
    }
    ,
    {
        id:5,
        title:"Common Real Estate Jargons",
        // title:"Climax Court now selling off 30%, until 3rd December!",
        text:"Discover over 80 relevant real estate terms, from property transactions to investment insights. Master the lingo and make educated choices in the real estate market!",
        date:"01/07/2024",
        category:["public"],
        link:"/blogs/real-estate-terms-2024",src:"blog/estate_terms.jpg"
    },{
        id:6,
        title:"Avoid Getting Scammed: 6 Crucial Land Title Documents Every Investor Must Know in Nigeria.",
        text:"Important Documents for Proof of Land Ownership in Nigeria - Certificate of Occupancy(C of O), Deed of Assignment, Survey Plan, Gazette, Governor's Consent, Receipt.",
        date:"10/07/2024",
        category:["public"],
        link:"/blogs/real-estate-title-documents",src:"blog/title_doc.jpg"
    },
    {
        id:7,
        title:"Why the Rainy Season is the Best Time for Real Estate Investment.",
        text:"The rainy season may seem like an odd time to invest in real estate, but it's actually a strategic opportunity in spotting potential property issues to securing better deals.",
        date:"09/19/2024",
        category:["public"],
        link:"/blogs/rainy-season-in-real-estate",src:"blog/rainy_season.jpg"
    }
  ],
};

export default API_ENDPOINTS