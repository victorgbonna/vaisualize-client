import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { consolelog } from "@/configs";


const useRouterQuery = () => {
  const router = useRouter();
  const [routerQuery, setRouterQuery] = useState({});

  const routerPush = ({ queryKey, queryVal }) => {
    delete routerQuery.page
    const ex_router_query = routerQuery
      // ...routerQuery,
      // ...(queryKey === "page" ? {} : { page: 1 }),
    // };

    let new_router_query = {};
    if (!queryVal) {
      delete ex_router_query[queryKey];
      new_router_query = ex_router_query;
    } else {
      new_router_query = {
        ...ex_router_query,
        [queryKey]: queryVal,
      };
    }
    router.push(
      router.pathname,
      {
        query: new_router_query,
      },
      { shallow: true }
    );
    return setRouterQuery(new_router_query);
  };
  const routerPushSolo=(new_obj)=>{
    router.push(
        router.pathname,
        {
          query: new_obj,
        },
        { shallow: true }
      );
      return setRouterQuery(new_obj);
  }
 const clearQueries = (except_field) => {
    if(!except_field){
      router.push(
        router.pathname,
        {
          query: {},
        },
        { shallow: true }
      );
      return setRouterQuery({});
    }
    const except_value=routerQuery[except_field]
    router.push(
      router.pathname,
      {
        query: {[except_field]:except_value},
      },
      { shallow: true }
    );
    return setRouterQuery({[except_field]:except_value});
  };

  useEffect(() => {
    if (!router.isReady) return;

    setRouterQuery(router.query);
  }, [router.isReady]);

  return {
    routerPush,
    routerQuery,routerPushSolo,
    clearQueries,routerIsReady:router.isReady
  };
};

export default useRouterQuery