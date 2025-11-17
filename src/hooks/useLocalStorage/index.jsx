import { consolelog } from '@/configs';

const useLocalStorage = () => {

  const storeItemInLS = ({key, val}) => {
    if(!window) return null
    window.localStorage.setItem(key, JSON.stringify(val))
    consolelog({key,val})
    return {key,val}
  };
  const getItemInLS= (key)=>{
    if(!window) return null
    const jsonData=window.localStorage.getItem(key)
    if(jsonData===null) return null
    // consolelog(JSON.parse(jsonData))

    return JSON.parse(jsonData)
  }
//   const deleteItemInLS=()=>{

//   }
  return {
    getItemInLS, storeItemInLS
  };
};

export default useLocalStorage