const PAGE_ROUTES = {
  DASHBOARD:"",
  USERS:"/users",
  COMPS:"/competition",
  CREATE_COMP:"/competition/create",
  NOTI:"/notification",
  REQ:"/requests",
  SUGG:"/suggestion",
  TRANSC:"/transactions",
  ADMINS:"/admin",
  MAIL:"/send-mail",

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