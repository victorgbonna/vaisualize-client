

import {useState, useRef} from 'react'
import { useHttpServices } from '..';
import { consolelog } from '@/configs';
const getFileName=(path) => {
  return path.replace(/^.*[\\\/]/, '');
};

const useFileInputs = (len, presets) => {
  const CLOUD_NAME = "greyhairedgallery";
  const CLOUD_PRESETS = presets ?? "vaisualize_doc_urls_364637732837";
    const [isLoadState, setIsLoadState] = useState(false);
    const [fileData, setFileData] = useState(Array.from({length: len}, (_) => ""));

    const [loadingPics, setLoadingPics] = useState({});
    const {postDataWithoutBaseUrl}= useHttpServices()
    const imageDiv = useRef(null);

    // const previewPic = async (e, index,tag) => {
    //     const reader = new FileReader();

    //     const selectedFile = e.target.files[0];
    //     consolelog({selectedFile})
    //     if(!selectedFile) return
        
    //     // consolelog({selectedFile})
    //     reader.onload = (readerEvent) => {
    //         const [newProductPics, newProductValues, newProductNames, newProductTags] = [productPics,productValues, productNames, productTags];
    //         consolelog({newProductPics, newProductValues})
    //         newProductPics[index] = readerEvent.target.result;
    //         newProductValues[index] = selectedFile;
    //         newProductNames[index] = getFileName(e.target.value);
    //         newProductTags[index] = tag
    //         // consolelog({reader:readerEvent.target.result})
    //         consolelog({newProductValues})
    //         setProductPics(newProductPics);
    //         setProductValues([...newProductPics])
    //         setProductNames(newProductNames)
    //         setProductTags(newProductTags)
    //         setLoadingPics({ id: index, fileName: selectedFile.name });
    //     };
    //     if (selectedFile) {
    //         reader.readAsDataURL(selectedFile);
    //         setLoadingPics({});
    //     }
        
    // };
    // "#productImage" + 
    const openPic = (picId) => {
        const div = imageDiv.current;
        const imageInp = div.querySelector(picId);
        consolelog({imageInp, picId})
        imageInp?.click();
    };
    const uploadImages = async () => {
      let imagesURLs=[]
      for (let i = 0; i < fileData.length; i++) {
        // if(!productPics[i]) continue
        // productImgForm.append(
        //   "file",
        //   productValues[i]
        //   // productFormRef.get("productImage" + (i + 1))
        // );
        // console.log({productPics, productImgForm,productValues})
        // productImgForm.append("file", );
        // console.log({CLOUD_PRESETS})
        const formData = new FormData();
        formData.append("file", fileData[i].file);
        formData.append("upload_preset", CLOUD_PRESETS);
        formData.append("folder", "uploads/files");
        

        try{
          const { data, error } = await postDataWithoutBaseUrl({
            path: `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
            body: formData,
          });

          if (error || !data?.secure_url) {
            consolelog({ error });
            return { error: "Cloudinary upload failed" };
          }
          // width:data.width, height:data.height,
          imagesURLs.push({
            url:data.secure_url, index:i, 
            delete_token: data.delete_token,
            fileName
          });
          // setIsLoadState(false)
        } catch(error){
          // setIsLoadState(false)
          return error.message || "Cloudinary not working";
        }
      }
      return { imagesURLs };
    };
    return {
        openPic, 
        isLoadState, setIsLoadState,loadingPics,
        uploadImages, setFileData, fileData,
        imageDiv
    };
};

export default useFileInputs
