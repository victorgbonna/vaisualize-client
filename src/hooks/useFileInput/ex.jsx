import {useState, useRef} from 'react'
import { useHttpServices } from "..";
import { consolelog } from '@/configs';

const useFileInput = (n) => {
  const userImgForm = new FormData();
  const CLOUD_NAME = 'greyhairedgallery'
  const CLOUD_PRESETS = 'vaisualize_doc_urls_364637732837'
  const [imageUrl, setImageUrl]= useState({})
  const [imageSrc, setImageSrc]= useState('')
  const {postDataWithoutBaseUrl}=useHttpServices()

  const getFileName=(path) => {
    return path.replace(/^.*[\\\/]/, '');
  };

  const previewPic=(e)=> {
    const reader = new FileReader();

    const selectedFile = e.target.files[0];
    const value= e.target.value
    
    // consolelog({selectedFile})
    if(!selectedFile || !value) return
    reader.onload = (readerEvent) => {
      let src = readerEvent.target.result;      
      console.log({src})
      setImageSrc(src)
    }
    // consolelog({selectedFile})
    if (selectedFile) {
      reader.readAsDataURL(selectedFile);
      return setImageUrl({file:selectedFile, value})
    }
  };

  const uploadImage=async()=>{
    if (!imageUrl.file) return {}
    
    const arrayBuffer = await file.arrayBuffer();
    const blob = new Blob([arrayBuffer], { type: file.type });

    userImgForm.append("file", imageUrl.file);
    userImgForm.append("upload_preset", CLOUD_PRESETS);
    try {
        const { data, error } = await postDataWithoutBaseUrl(
          {
            path:`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`
            ,body:userImgForm
          });
        if (error) {
          console.log({error})
            return { error: 'Cloudinary upload not working' }
        }
        return { imageUrl: data.secure_url, delete_token: data.delete_token }
  
    } catch (error) {
        return { error: { message: "Something went wrong" } }
    }
  }
  return {uploadImage, previewPic,imageUrl, imageSrc, getFileName, setImageSrc, setImageUrl};

}


export default useFileInput
