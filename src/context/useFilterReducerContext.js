import { createContext, useContext, useState } from "react";

export const FilterContext = createContext();

const EMPTY_AND = () => ({});

const reduce = (state, action) => {
  switch (action.type) {
    case "RESET":
      return [[EMPTY_AND()]];
    case 'GET':
        return state
    case "SET_ALL":
      return action.payload.map(orSet =>
        orSet.map(andSet => ({ ...andSet }))
      );

    case "ADD_OR":
      return [...state, [EMPTY_AND()]];

    case "ADD_AND":
      return state.map((orSet, i) =>
        i === action.or_ind ? [...orSet, EMPTY_AND()] : orSet
      );

    case "UPDATE_AND":
      return state.map((orSet, i) =>
        i === action.or_ind
          ? orSet.map((andSet, j) =>
              j === action.and_ind
                ? {
                    ...andSet,
                    [action.key]: action.value,
                    ...(action.key === "column"
                      ? { value: "", filterOpt: "" }
                      : {})
                  }
                : andSet
            )
          : orSet
      );

    case "DELETE_AND":
      return state
        .map((orSet, i) =>
          i === action.or_ind
            ? orSet.length === 1
              ? null
              : orSet.filter((_, j) => j !== action.and_ind)
            : orSet
        )
        .filter(Boolean);

    case "DELETE_OR":
      return state.filter((_, i) => i !== action.or_ind);

    default:
      return state;
  }
};

export default function FilterContextComponent({ children }) {
  const [filterArr, setFilterArr] = useState([[{}]]);

  const dispatch = action => {
    setFilterArr(prev => reduce(prev, action));
  };
 
  return (
    <FilterContext.Provider value={{ filterArr, dispatch }}>
      {children}
    </FilterContext.Provider>
  );
}

// export const useFilterContext = () => {
//   const ctx = useContext(FilterContext);
//   if (!ctx) throw new Error("");
//   return ctx;
// };
