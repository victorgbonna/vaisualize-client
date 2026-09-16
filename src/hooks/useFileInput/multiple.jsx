import { useState, useRef } from "react";
import { useHttpServices } from "..";
import { consolelog } from "@/configs";

const getFileName = (path) => {
  return path.replace(/^.*[\\\/]/, "");
};

const useMultiFileInputs = (len, presets = null) => {
  const CLOUD_NAME = "greyhairedgallery";
  const CLOUD_PRESETS =
    presets ?? "vaisualize_doc_urls_364637732837";

  const [isLoadState, setIsLoadState] = useState(false);

  // Each position represents a specific input.
  // Example:
  // fileData[0] = file from img-0
  // fileData[1] = file from img-1
  // ...
  const [fileData, setFileData] = useState(
    Array.from({ length: len }, () => null)
  );

  const [loadingPics, setLoadingPics] = useState({});

  const { postDataWithoutBaseUrl } = useHttpServices();

  const imageDiv = useRef(null);

  const openPic = (picId) => {
    const div = imageDiv.current;
    if (!div) return;

    const imageInp = div.querySelector(picId);

    consolelog({
      imageInp,
      picId,
    });

    imageInp?.click();
  };

  const uploadImages = async () => {
    const imagesURLs = [];

    for (let i = 0; i < fileData.length; i++) {
      const currentFile = fileData[i];

      // Skip slots where no file was selected
      if (!currentFile?.file) {
        continue;
      }

      const formData = new FormData();

      formData.append("file", currentFile.file);
      formData.append("upload_preset", CLOUD_PRESETS);
      formData.append("folder", "uploads/files");

      try {
        const { data, error } = await postDataWithoutBaseUrl({
          path: `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`,
          body: formData,
        });

        if (error || !data?.secure_url) {
          consolelog({
            error,
            index: i,
          });

          return {
            error: "Cloudinary upload failed",
          };
        }

        imagesURLs.push({
          url: data.secure_url,
          index: i,
          delete_token: data.delete_token,
          resource_type: data.resource_type,
          public_id: data.public_id,
          fileName:
            currentFile.fileName || currentFile.file.name,
        });
      } catch (error) {
        consolelog({
          error,
          index: i,
        });

        return {
          error: error.message || "Cloudinary not working",
        };
      }
    }

    return {
      imagesURLs,
    };
  };

  return {
    openPic,

    isLoadState,
    setIsLoadState,

    loadingPics,

    uploadImages,

    setFileData,
    fileData,

    imageDiv,
  };
};

export default useMultiFileInputs;