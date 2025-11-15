import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { message, Modal } from "antd";

import FilePreview from "./FilePreview";

import AdsFileupload from "./AdsFileupload";
import { useGetConfigQuery } from "../services/postApi";

const AdsForm = ({
  setEditingPost,
  closeDiv,
  setPage,
  refetch,
  post,
  setLoading,
  loading,
  isVisible,
  uploadPercentage,
  setUploadPercentage,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalOpenImg, setIsModalOpenImg] = useState(false);
  const [currentVideo, setCurrentVideo] = useState(null);
  const [currentImg, setCurrentImg] = useState(null);
  const [fileType, setFileType] = useState("image"); // Track if we're uploading images or videosm
  const [files, setFiles] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const { data: config } = useGetConfigQuery();
  const MAX_IMAGES = 9;

  const handleVideoClick = (videoUrl) => {
    setCurrentVideo(videoUrl);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentVideo(null);
  };

  const getFileSuffix = (filePath) => {
    const parts = filePath.split(".");
    return parts.length > 1 ? parts[parts.length - 1] : ""; // Get the last part after the dot
  };

  const handleImgClick = (img) => {
    setCurrentImg(img);
    setIsModalOpenImg(true);
  };

  const closeModalImg = () => {
    setIsModalOpenImg(false);
    setCurrentImg(null);
  };

  const generateThumbnail = (videoFile) => {
    return new Promise((resolve, reject) => {
      // Ensure the input is a File or Blob
      if (!(videoFile instanceof File || videoFile instanceof Blob)) {
        reject(new Error("Invalid video file provided"));
        return;
      }

      const video = document.createElement("video");
      video.src = URL.createObjectURL(videoFile);

      video.onloadeddata = () => {
        // Seek to a specific timestamp for a meaningful frame
        video.currentTime = 1;
      };

      video.onseeked = () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert the canvas to a Blob and resolve with a File object
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const fileName = `${Date.now()}.jpg`; // Generate a unique file name
              const file = new File([blob], fileName, {
                type: "image/jpeg",
              });
              resolve(file); // Resolve with the File object
            } else {
              reject(new Error("Failed to convert canvas to Blob"));
            }
          },
          "image/jpeg",
          0.9 // Quality factor for JPEG compression
        );

        URL.revokeObjectURL(video.src); // Clean up resources
      };

      video.onerror = () => reject(new Error("Failed to generate thumbnail"));
    });
  };

  // Cache to store the generated thumbnails for each video file

  const onThumbnailDrop = useCallback(async (acceptedFiles) => {
    const thumbnailImage = acceptedFiles.find((file) =>
      file.type.startsWith("image/")
    );
    if (acceptedFiles.length > 1) {
      message.error("You can only upload one image for the thumbnail.");
      return;
    }
    if (thumbnailImage) {
      setThumbnail(thumbnailImage);
    } else {
      message.error("Please upload a valid image for the thumbnail.");
    }
  }, []);

  const {
    getRootProps: getThumbnailRootProps,
    getInputProps: getThumbnailInputProps,
  } = useDropzone({
    accept: "image/*",
    onDrop: onThumbnailDrop,
  });

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (fileType === "image" || fileType === "gif") {
        const newImages = acceptedFiles.filter((file) =>
          file.type.startsWith("image/")
        );
        const hasVideo = acceptedFiles.some((file) =>
          file.type.startsWith("video/")
        );

        if (hasVideo) {
          message.error("Please select only images in Image mode.");
          return;
        }

        if (newImages.length + files.length > MAX_IMAGES) {
          message.error(
            `You can only upload a maximum of ${MAX_IMAGES} images`
          );
          return;
        }

        const processedFiles = await Promise.all(
          newImages.map(async (file) => {
            const { width, height } = await getImageDimensions(file);
            const suffix = getFileSuffix(file.name || file.path);
            return {
              image: file,
              size: file.size,
              width,
              height,
              suffix, // e.g., 'jpeg' or 'png'
              type: "image",
            };
          })
        );
        setFiles((prevFiles) => [...prevFiles, ...processedFiles]);
      } else if (fileType === "video") {
        const videoFile = acceptedFiles.find((file) =>
          file.type.startsWith("video/")
        );
        const hasImage = acceptedFiles.some((file) =>
          file.type.startsWith("image/")
        );

        if (hasImage) {
          message.error("Please select only a video in Video mode.");
          return;
        }

        if (acceptedFiles.length > 1) {
          message.error("You can only upload one video.");
          return;
        }

        if (videoFile) {
          const { width, height } = await getVideoDimensions(videoFile);
          const suffix = getFileSuffix(videoFile.name || videoFile.path);
          setFiles([
            {
              video: videoFile,
              size: videoFile.size,
              width,
              height,
              suffix,
              type: "video",
            },
          ]);
          const generatedThumbnail = await generateThumbnail(videoFile);
          setThumbnail(generatedThumbnail);
          // setFiles([{ video: videoFile }]);
        } else {
          message.error("You can only upload one video.");
        }
      }
    },
    [files, fileType]
  );

  const { getRootProps, getInputProps } = useDropzone({
    accept:
      fileType === "image" || fileType === "gif"
        ? { "image/*": [] }
        : { "video/*": [] },
    onDrop,
  });

  const getImageDimensions = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.width.toString(),
          height: img.height.toString(),
        });
      };
      img.src = URL.createObjectURL(file); // Set the source to a temporary URL of the image file
    });
  };

  const getVideoDimensions = (file) => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.onloadedmetadata = () => {
        resolve({
          width: video.videoWidth.toString(),
          height: video.videoHeight.toString(),
        });
      };
      video.src = URL.createObjectURL(file); // Set the source to a temporary URL of the video file
    });
  };

  const handleRemoveFile = (fileToRemove) => {
    if (fileType === "image" || fileType === "gif") {
      if (files[0].resourceURL) {
        setFiles((prevFiles) =>
          prevFiles.filter((file) => file !== fileToRemove)
        );
      } else {
        setFiles((prevFiles) =>
          prevFiles.filter((file) => file.image !== fileToRemove)
        );
      }
    } else {
      if (files[0].resourceURL) {
        setFiles((prevFiles) =>
          prevFiles.filter((file) => file !== fileToRemove)
        );
      } else {
        setFiles((prevFiles) =>
          prevFiles.filter((file) => file.video !== fileToRemove)
        );
      }
    }
  };

  const moveFile = (fromIndex, toIndex) => {
    setFiles((prevFiles) => {
      const updatedFiles = [...prevFiles];
      const [movedFile] = updatedFiles.splice(fromIndex, 1);
      updatedFiles.splice(toIndex, 0, movedFile);
      return updatedFiles;
    });
  };

  let imgUrl;

  if (typeof thumbnail === "string") {
    imgUrl = thumbnail?.includes("https://")
      ? thumbnail
      : `${config?.data?.post_image_url}${thumbnail}`;
  }

  console.log(post);

  return (
    <>
      <DndProvider backend={HTML5Backend}>
        <div className="file-upload-container relative pb-10">
          <AdsFileupload
            thumbnail={thumbnail}
            setThumbnail={setThumbnail}
            setEditingPost={setEditingPost}
            closeDiv={closeDiv}
            setPage={setPage}
            refetch={refetch}
            post={post}
            setLoading={setLoading}
            loading={loading}
            isVisible={isVisible}
            uploadPercentage={uploadPercentage}
            setUploadPercentage={setUploadPercentage}
            files={files}
            setFiles={setFiles}
            fileType={fileType}
            setFileType={setFileType}
          />
          {fileType !== "text" && (
            <div
              className={
                fileType === "video"
                  ? "grid grid-cols-2 max-md:grid-cols-1"
                  : ""
              }
            >
              <div>
                <div>
                  <p className="my-2">
                    Click to select{" "}
                    {fileType === "image"
                      ? "images"
                      : fileType === "gif"
                      ? "gif"
                      : "a video"}{" "}
                    file{" "}
                    {fileType === "image"
                      ? `(Max ${MAX_IMAGES} images)`
                      : fileType === "gif"
                      ? "(1 gif allowed)"
                      : "(1 video allowed)"}
                  </p>
                  <p className="support">
                    {fileType === "image"
                      ? "Support format: JPG, PNG"
                      : fileType === "gif"
                      ? "Support format: GIF"
                      : "Support format: MP4"}
                  </p>
                </div>
                <div className="mt-5 preview-container">
                  <div {...getRootProps()} className="dropzone">
                    <div className="flex items-center justify-center">
                      <input {...getInputProps()} />
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="13"
                        height="13"
                        viewBox="0 0 13 13"
                        fill="none"
                      >
                        <path
                          d="M12.0498 6.05005H7.5498V1.55005C7.5498 1.35114 7.47079 1.16037 7.33013 1.01972C7.18948 0.879067 6.99872 0.800049 6.7998 0.800049C6.60089 0.800049 6.41013 0.879067 6.26947 1.01972C6.12882 1.16037 6.0498 1.35114 6.0498 1.55005V6.05005H1.5498C1.35089 6.05005 1.16013 6.12907 1.01947 6.26972C0.878822 6.41037 0.799805 6.60114 0.799805 6.80005C0.799805 6.99896 0.878822 7.18973 1.01947 7.33038C1.16013 7.47103 1.35089 7.55005 1.5498 7.55005H6.0498V12.05C6.0498 12.249 6.12882 12.4397 6.26947 12.5804C6.41013 12.721 6.60089 12.8 6.7998 12.8C6.99872 12.8 7.18948 12.721 7.33013 12.5804C7.47079 12.4397 7.5498 12.249 7.5498 12.05V7.55005H12.0498C12.2487 7.55005 12.4395 7.47103 12.5801 7.33038C12.7208 7.18973 12.7998 6.99896 12.7998 6.80005C12.7998 6.60114 12.7208 6.41037 12.5801 6.26972C12.4395 6.12907 12.2487 6.05005 12.0498 6.05005Z"
                          fill="white"
                        />
                      </svg>
                    </div>
                  </div>

                  {files.map((file, index) => (
                    <FilePreview
                      key={index}
                      file={
                        file?.resourceURL ? file : file?.image || file?.video
                      }
                      index={index}
                      moveFile={moveFile}
                      onRemove={handleRemoveFile}
                      type={fileType}
                      handleVideoClick={handleVideoClick}
                      handleImgClick={handleImgClick}
                    />
                  ))}
                </div>
              </div>

              {fileType === "video" && (
                <div className="mt-0 max-md:mt-2">
                  <div>
                    <p className="my-2">Select Thumbnail</p>
                    <p className="support">Support format : PNG, JPG</p>
                  </div>
                  <div className="preview-container">
                    <div {...getThumbnailRootProps()} className="mt-5 dropzone">
                      <div className="flex items-center justify-center">
                        <input {...getThumbnailInputProps()} />
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="13"
                          height="13"
                          viewBox="0 0 13 13"
                          fill="none"
                        >
                          <path
                            d="M12.0498 6.05005H7.5498V1.55005C7.5498 1.35114 7.47079 1.16037 7.33013 1.01972C7.18948 0.879067 6.99872 0.800049 6.7998 0.800049C6.60089 0.800049 6.41013 0.879067 6.26947 1.01972C6.12882 1.16037 6.0498 1.35114 6.0498 1.55005V6.05005H1.5498C1.35089 6.05005 1.16013 6.12907 1.01947 6.26972C0.878822 6.41037 0.799805 6.60114 0.799805 6.80005C0.799805 6.99896 0.878822 7.18973 1.01947 7.33038C1.16013 7.47103 1.35089 7.55005 1.5498 7.55005H6.0498V12.05C6.0498 12.249 6.12882 12.4397 6.26947 12.5804C6.41013 12.721 6.60089 12.8 6.7998 12.8C6.99872 12.8 7.18948 12.721 7.33013 12.5804C7.47079 12.4397 7.5498 12.249 7.5498 12.05V7.55005H12.0498C12.2487 7.55005 12.4395 7.47103 12.5801 7.33038C12.7208 7.18973 12.7998 6.99896 12.7998 6.80005C12.7998 6.60114 12.7208 6.41037 12.5801 6.26972C12.4395 6.12907 12.2487 6.05005 12.0498 6.05005Z"
                            fill="white"
                          />
                        </svg>
                      </div>
                    </div>
                    {thumbnail && (
                      <>
                        <div className="mt-5 thumbnail-preview">
                          <img
                            src={
                              typeof thumbnail === "string"
                                ? imgUrl
                                : URL.createObjectURL(thumbnail)
                            }
                            alt="thumbnail preview"
                            className="preview-image"
                          />
                          <button
                            onClick={() => setThumbnail(null)}
                            className="remove-btn"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="10"
                              height="10"
                              viewBox="0 0 10 10"
                              fill="none"
                            >
                              <path
                                d="M5 3.88906L8.88906 0L10 1.11094L6.11094 5L10 8.88906L8.88906 10L5 6.11094L1.11094 10L0 8.88906L3.88906 5L0 1.11094L1.11094 0L5 3.88906Z"
                                fill="white"
                                fillOpacity="0.8"
                              />
                            </svg>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        <Modal
          visible={isModalOpen}
          footer={null}
          onCancel={closeModal}
          title="Video Preview"
          centered
          width={400}
        >
          {currentVideo && (
            <video
              src={currentVideo}
              controls
              className="max-h-[450px] w-full mt-5"
            />
          )}
        </Modal>
        <Modal
          visible={isModalOpenImg}
          footer={null}
          onCancel={closeModalImg}
          title="Image Preview"
          centered
          width={400}
        >
          {currentImg && (
            <img src={currentImg} className="max-h-[450px] w-full mt-5" />
          )}
        </Modal>
      </DndProvider>
    </>
  );
};

export default AdsForm;
