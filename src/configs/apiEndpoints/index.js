const API_ENDPOINTS = {
  MAKE_A_REQUEST:'requests/prompt-visuals',
  GET_REQUEST:(x)=>{
    return 'requests/get/one/'+x
  },

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
  ]
};

export default API_ENDPOINTS