import { useState } from "react";
import { useHttpServices } from "..";
import { consolelog } from "@/configs";

const useFileInput = (presets=null) => {
  const CLOUD_NAME = "greyhairedgallery";
  const CLOUD_PRESETS = presets ?? "vaisualize_doc_urls_364637732837";

  const [fileData, setFileData] = useState({});

  const [imageUrl, setImageUrl]= useState({})
  const [imageSrc, setImageSrc]= useState('')

  const [previewSrc, setPreviewSrc] = useState("");

  const { postDataWithoutBaseUrl } = useHttpServices();

  const getFileName = (path) => path.replace(/^.*[\\\/]/, "");

  const previewPic = (e) => {
    const selectedFile = e.target.files[0];
    const value = e.target.value;
    // console.log({value, selectedFile})

    if (!selectedFile || !value) return;

    // Only preview if it's an image
    if (selectedFile.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (readerEvent) => {
        setPreviewSrc(readerEvent.target.result);
      };
      reader.readAsDataURL(selectedFile);
    }

    setFileData({ file: selectedFile, value });
  };


  const uploadFile = async () => {
    const { file } = fileData;
    if (!file) return { error: "No file selected" };

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUD_PRESETS);
      formData.append("folder", "uploads/files");

      const { data, error } = await postDataWithoutBaseUrl({
        path: `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
        body: formData,
      });

      if (error || !data?.secure_url) {
        consolelog({ error });
        return { error: "Cloudinary upload failed" };
      }

      return {
        url: data.secure_url,
        delete_token: data.delete_token,
        resource_type: data.resource_type,
        public_id: data.public_id,
      };
    } catch (err) {
      console.error("Upload error:", err);
      return { error: "Something went wrong" };
    }
  };

  return {
    uploadFile,
    previewPic,
    fileData,
    previewSrc,
    getFileName,
    setPreviewSrc,
    setFileData,
  };
};

export default useFileInput;


