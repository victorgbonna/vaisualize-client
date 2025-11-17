import { baseURL, consolelog } from "@/configs";
import axios from "axios";


const useHttpServices = () => {
  const postData = async ({path, body}) => {
    //clear whitespace in body
    // body=trimObject(body)
    consolelog({body,baseURL})
    try {
      const { data } = await axios.post(`${baseURL}/${path}`, body);
      return {data};
    } catch (e) {
      consolelog(e?.response?.data?.error?.message);
      const error=e?.response?.data;
      throw error;
    } finally {
      
    }
  };
  const postDataWithoutBaseUrl = async ({path,body}) => {
    try {

      const { data } = await axios.post(`${path}`, body);
      consolelog({data})
      return {data};
    } catch (e) {
      consolelog(e?.response?.data?.error?.message);
      const error=e?.response?.data;
      throw error;
    } finally {
      
    }
  };
    const getDataWithoutBaseUrl = async ({path}) => {
    try {

      const { data } = await axios.get(`${path}`);
      consolelog({data})
      return {data};
    } catch (e) {
      consolelog(e?.response?.data?.error?.message);
      const error=e?.response?.data;
      throw error;
    } finally {
      
    }
  };
  const postProtectedData = async ({path, body={}, userType}) => {
    consolelog({path})

    const headers={
      authorization: `Bearer ${userType==="vendor"?vendor_token:token}`,
    }
    try {
      
      const { data } = await axios.post(`${baseURL}/${path}`, body, {headers});
      consolelog(data.status);
      return {data}
    } catch (e) {
        consolelog(e?.response?.data?.error?.message);
        const error=e?.response?.data;
        consolelog(e.response)
        throw error;
    } finally {
      
      
    }
  };
  
  const putProtectedData = async ({path, body={}, userType}) => {
    consolelog({path})

    const headers={
      authorization: `Bearer ${userType==="vendor"?vendor_token:token}`,
    }
    try {
;
      // const response=await axios.put(`${baseUrl}/bootcamps/edit/${btcId}`, formData,{headers})
      const { data } = await axios.put(`${baseURL}/${path}`, body, {headers});
      consolelog(data.status);
      return {data}
    } catch (e) {
        consolelog(e?.response?.data?.error?.message);
        const error=e?.response?.data;
        throw error;
    } finally {
      
      
    }
  };
  const patchProtectedData = async ({path, body={}, userType}) => {
    consolelog({path})

    const headers={
      authorization: `Bearer ${userType==="vendor"?vendor_token:token}`,
    }
    try {

      // const response=await axios.put(`${baseUrl}/bootcamps/edit/${btcId}`, formData,{headers})
      const { data } = await axios.patch(`${baseURL}/${path}`, body, {headers});
      consolelog(data.status);
      return {data}
    } catch (e) {
        consolelog(e?.response?.data?.error?.message);
        const error=e?.response?.data;
        throw error;
    } finally {
      
      
    }
  };
  const deleteProtectedData = async ({path, body={}, userType}) => {
    consolelog({path})

    const headers={
      authorization: `Bearer ${userType==="vendor"?vendor_token:token}`,
    }
    try {

      const { data } = await axios.delete(`${baseURL}/${path}`, {headers, data:body});
      consolelog(data.status);
      return {data}
    }  catch (e) {
      consolelog(e?.response?.data?.error?.message);
      const error=e?.response?.data;
      throw error;
    } finally {
      
      
    }
  };
  const getProtectedData = async ({path, userType}) => {
    consolelog({path})
    // consolelog({token})
    try {
      // consolelog({vendor_token})
      // const { data } 
      const {data}= await axios.get(`${baseURL}/${path}`, {
        headers: {
          authorization: `Bearer ${userType==="vendor"?vendor_token:token}`,
        },
      });
      return data;
    } catch (error) {
      const e=error?.response?.data;
      throw e
    } finally {
    
    }
  };
  const getData = async ({path}) => {
    try {
      const { data } = await axios.get(`${baseURL}/${path}`);
      
      return data;
    } catch (e) {
      // consolelog(error?.response?.status);
      // consolelog(error?.response?.data?.error?.message);
      const error=e?.response?.data;
      throw error;
    } finally {
    }
  };

  // const parseCSVFile=async(filePath) => {
  //   const data = [];

  //   await new Promise((resolve, reject) => {
  //       const stream = fs.createReadStream(filePath)
  //           .pipe(csv())
  //           .on('data', (row) => {
  //               data.push(row);
  //           })
  //           .on('end', () => {
  //               resolve();
  //           })
  //           .on('error', (error) => {
  //               reject(error);
  //           });
  //   });

  //   return data;
  // }
  return {
    postData,
    postProtectedData,
    putProtectedData,
    patchProtectedData,
    getProtectedData,
    deleteProtectedData,
    postDataWithoutBaseUrl,
    getData,
    getDataWithoutBaseUrl
    //  parseCSVFile
  };
};

export default useHttpServices