import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { useCreatePostMutation } from "../services/postApi";
import { message, Button, Select } from "antd";
import axios from "axios";
import TextArea from "antd/es/input/TextArea";

const MAX_IMAGES = 9;

const { Option } = Select;

const FilePreview = ({ file, index, moveFile, onRemove, type }) => {
  const [, ref] = useDrag({
    type: "FILE",
    item: { index },
  });

  const [, drop] = useDrop({
    accept: "FILE",
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveFile(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  const previewUrl = file?.resourceURL || URL.createObjectURL(file);

  return (
    <div ref={(node) => ref(drop(node))} className="preview-item">
      {type === "image" ? (
        <img src={previewUrl} alt="preview" className="preview-image" />
      ) : (
        <video src={previewUrl} controls className="preview-video" />
      )}
      <button onClick={() => onRemove(file)} className="remove-btn">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="none"
        >
          <path
            d="M9.24264 8.18191L6.06066 4.99993L9.24264 1.81795C9.38329 1.6773 9.46231 1.48653 9.46231 1.28762C9.46231 1.08871 9.38329 0.897941 9.24264 0.757289C9.10199 0.616637 8.91122 0.537619 8.71231 0.53762C8.5134 0.537619 8.32263 0.616637 8.18198 0.757289L5 3.93927L1.81802 0.757289C1.67737 0.616637 1.4866 0.537619 1.28769 0.53762C1.08878 0.537619 0.898012 0.616637 0.757359 0.757289C0.616707 0.897941 0.53769 1.08871 0.53769 1.28762C0.53769 1.48653 0.616707 1.6773 0.757359 1.81795L3.93934 4.99993L0.757359 8.18191C0.616707 8.32256 0.537689 8.51333 0.537689 8.71224C0.537689 8.91115 0.616707 9.10192 0.757359 9.24257C0.898012 9.38322 1.08878 9.46224 1.28769 9.46224C1.4866 9.46224 1.67737 9.38322 1.81802 9.24257L5 6.06059L8.18198 9.24257C8.32263 9.38322 8.5134 9.46224 8.71231 9.46224C8.91122 9.46224 9.10199 9.38322 9.24264 9.24257C9.38329 9.10192 9.46231 8.91115 9.46231 8.71224C9.46231 8.51333 9.38329 8.32256 9.24264 8.18191Z"
            fill="white"
          />
        </svg>
      </button>
    </div>
  );
};

const Fileupload = ({
  setEditingPost,
  closeDiv,
  setPage,
  refetch,
  post,
  setLoading,
  loading,
  isVisible,
}) => {
  const [files, setFiles] = useState([]);
  const [thumbnail, setThumbnail] = useState(null);
  const [description, setDescription] = useState("");
  const [fileType, setFileType] = useState("image"); // Track if we're uploading images or videos
  const [status, setStatus] = useState("published"); // Track if we're uploading images or videos
  const [createPost] = useCreatePostMutation();

  useEffect(() => {
    if (post) {
      setDescription(post.description || "");
      setFileType(post.file_type || "image");
      setStatus(post.status || "published");

      if (post.files) {
        // Parse and set files for editing
        const parsedFiles = JSON.parse(post.files);
        setFiles(
          parsedFiles.filter(
            (file) => file.type === "video" || file.type === "image"
          )
        );
        if (parsedFiles[0].type === "video") {
          setThumbnail(parsedFiles[0]?.thumbnail || null);
        }
      }
    } else {
      setStatus("published");
      setDescription("");
      setFiles([]);
      setThumbnail(null);
    }
  }, [isVisible, post]);

  const onDrop = useCallback(
    async (acceptedFiles) => {
      if (fileType === "image") {
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
          // setFiles([{ video: videoFile }]);
        } else {
          message.error("You can only upload one video.");
        }
      }
    },
    [files, fileType]
  );

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
  const { getRootProps, getInputProps } = useDropzone({
    accept: fileType === "image" ? { "image/*": [] } : { "video/*": [] },
    onDrop,
  });

  const {
    getRootProps: getThumbnailRootProps,
    getInputProps: getThumbnailInputProps,
  } = useDropzone({
    accept: "image/*",
    onDrop: onThumbnailDrop,
  });

  const handleRemoveFile = (fileToRemove) => {
    if (fileType === "image") {
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

  const getImageDimensions = (file) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width.toString(), height: img.height.toString() });
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

  const getFileExtension = (filename) => {
    return filename.split(".").pop();
  };

  const getFileSuffix = (filePath) => {
    const parts = filePath.split(".");
    return parts.length > 1 ? parts[parts.length - 1] : ""; // Get the last part after the dot
  };

  const handleSubmit = async () => {
    setLoading(true);
    if (description && files.length > 0) {
      if (fileType === "image" || (fileType === "video" && thumbnail)) {
        try {
          const response = await axios.get(
            "http://movie_upload_api.qdhgtch.com:5343/upload.php"
          );
          const {
            accessKeyId,
            secretAccessKey,
            sessionToken,
            region,
            bucket,
            publicUrl,
            directory,
          } = response.data;
          const s3Client = new S3Client({
            region,
            credentials: { accessKeyId, secretAccessKey, sessionToken },
          });

          const uploadedFileUrls = []; // Array to store uploaded file URLs with the new structure

          for (const file of files) {
            if (file?.resourceURL) {
              uploadedFileUrls.push(file);
            } else {
              try {
                // Determine key and content for each file
                const isImage = fileType === "image";
                const key = isImage
                  ? `image_${Date.now()}_${Math.random()
                      .toString(36)
                      .substr(2, 9)}.${file.suffix}`
                  : `video_${Date.now()}_${Math.random()
                      .toString(36)
                      .substr(2, 9)}.${file.suffix}`;
                const fileContent = file.image || file.video;
                const contentType = isImage
                  ? file.image?.type
                  : file.video?.type;
                const uploadParams = {
                  Bucket: bucket,
                  Key: `${directory}/${key}`,
                  Body: fileContent,
                  ContentType: contentType,
                  ContentDisposition: "inline",
                };

                // Upload each file individually
                await s3Client.send(new PutObjectCommand(uploadParams));

                // Get file metadata (example placeholders for demonstration)
                const metadata = {
                  resourceURL: `${publicUrl}${directory}/${key}`,
                  size: file?.size.toString(),
                  height: file?.height || "", // Replace with actual height if available
                  width: file?.width || "", // Replace with actual width if available
                  suffix: file?.suffix,
                  type: isImage ? "image" : "video",
                };

                // Add metadata to the array
                uploadedFileUrls.push(metadata);
              } catch (error) {
                console.error(
                  `Failed to upload ${
                    fileType === "image" ? "image" : "video"
                  }:`,
                  error
                );
                message.error(
                  `Failed to upload ${
                    fileType === "image" ? "image" : "video"
                  }. Please try again.`
                );
                break; // Optionally, break the loop if an error occurs
              }
            }
          }

          // Add thumbnail metadata if fileType is videos
          if (fileType === "video" && thumbnail) {
            if (typeof thumbnail !== "string") {
              const thumbnailKey = `thumbnail_${Date.now()}_${Math.random()
                .toString(36)
                .substr(2, 9)}.${getFileExtension(thumbnail.name)}`;

              const thumbnailParams = {
                Bucket: bucket,
                Key: `${directory}/${thumbnailKey}`,
                Body: thumbnail,
                ContentType: thumbnail?.type,
                ContentDisposition: "inline",
              };
              await s3Client.send(new PutObjectCommand(thumbnailParams));
              const thumbnailUrl = `${publicUrl}${directory}/${thumbnailKey}`;

              if (
                uploadedFileUrls.length > 0 &&
                uploadedFileUrls[0].type === "video"
              ) {
                uploadedFileUrls[0].thumbnail = thumbnailUrl;
              }
            } else {
              if (
                uploadedFileUrls.length > 0 &&
                uploadedFileUrls[0].type === "video"
              ) {
                uploadedFileUrls[0].thumbnail = thumbnail;
              }
              // uploadedFileUrls.push(thumbnail);
            }
          }

          const postPayload = {
            user_id: 615270615,
            description,
            files: uploadedFileUrls,
            file_type: fileType,
            status,
            ...(post && { post_id: post.id }),
          };

          await createPost(postPayload).unwrap();
          setDescription("");
          setFiles([]);
          setThumbnail(null);
          setPage(1);
          refetch();
          setEditingPost(null);
          closeDiv(false);
          message.success(
            post ? "Post updated successfully." : "Post created successfully."
          );
          setLoading(false);
        } catch (error) {
          message.error("Failed to submit post. Please try again.");
          setLoading(false);
        }
      } else {
        message.error("Thumbnail and Video are required!");
        setLoading(false);
      }
    } else {
      message.error("Description and Files are required!");
      setLoading(false);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="file-upload-container">
        <TextArea
          type="text"
          placeholder="Write Description..."
          className="w-full p-2 my-5 bg-transparent des"
          onChange={(e) => setDescription(e.target.value)}
          value={description}
          rows={4}
        />

        <Select
          value={fileType}
          onChange={(value) => {
            setFileType(value);
            setFiles([]);
            setThumbnail(null);
          }}
          style={{ marginBottom: 10 }}
        >
          <Option value="image">Images</Option>
          <Option value="video">Videos</Option>
        </Select>
        <Select
          value={status}
          onChange={(value) => {
            setStatus(value);
          }}
          style={{ marginBottom: 10, marginLeft: 10 }}
        >
          <Option value="published">Published</Option>
          <Option value="review">Review</Option>
          <Option value="declined">Declined</Option>
        </Select>

        <div
          className={
            fileType === "video" ? "grid grid-cols-2 max-md:grid-cols-1" : ""
          }
        >
          <div>
            <div>
              <p className="my-2">
                Click to select {fileType === "image" ? "images" : "a video"}{" "}
                file{" "}
                {fileType === "image"
                  ? `(Max ${MAX_IMAGES} images)`
                  : "(1 video allowed)"}
              </p>
              <p className="support">
                {fileType === "image"
                  ? "Support format: JPG, PNG"
                  : "Support format: MP4"}
              </p>
            </div>
            <div className="preview-container mt-5">
              <div {...getRootProps()} className="dropzone">
                <div className="flex justify-center items-center">
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
                  file={file?.resourceURL ? file : file?.image || file?.video}
                  index={index}
                  moveFile={moveFile}
                  onRemove={handleRemoveFile}
                  type={fileType}
                />
              ))}
            </div>
          </div>

          {fileType === "video" && (
            <div className="max-md:mt-2 mt-0">
              <div>
                <p className="my-2">Select Thumbnail</p>
                <p className="support">Support format : PNG, JPG</p>
              </div>
              <div className="preview-container">
                <div {...getThumbnailRootProps()} className="dropzone mt-5">
                  <div className="flex justify-center items-center">
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
                    <div className="thumbnail-preview mt-5">
                      <img
                        src={
                          typeof thumbnail === "string"
                            ? thumbnail
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
        <div className="flex justify-between items-center">
          <div></div>
          <Button
            onClick={handleSubmit}
            className={`mt-2 ${loading ? "hover:bg-transparent" : "save"}`}
            type="primary"
            disabled={loading}
          >
            {loading ? "Loading..." : post ? "Update Post" : "Save Post"}
          </Button>
        </div>
      </div>
    </DndProvider>
  );
};

export default Fileupload;
