import { Button, Checkbox, Flex, Input, Select, Typography } from "antd";
import { CheckboxChangeEvent } from "antd/es/checkbox";
import TextArea from "antd/es/input/TextArea";
<<<<<<< HEAD
import { useState, useEffect, useCallback } from "react";
import {
  useAllgetCreatorsQuery,
  useCreateWebViewPostMutation,
  useGetUserInfoQuery,
} from "../services/postApi";
=======
import { useState, useCallback } from "react";
import { useAllgetCreatorsQuery, useCreateWebViewPostMutation } from "../services/postApi";
>>>>>>> 89579f1 (Resolve Conflict)
import { useDropzone } from "react-dropzone";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import FileDropzone from "./FileDropzone";
import { message } from "antd";
import axios from "axios";
import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

const MAX_COVER_IMAGES = 1;
const MAX_VIDEOS = 1;
const MAX_IMAGES = 9;

interface CreateUnlockPostProps {
<<<<<<< HEAD
  post: any;
=======
>>>>>>> 89579f1 (Resolve Conflict)
  onClose?: () => void;
  setLoading?: (loading: boolean) => void;
  loading?: boolean;
  setUploadPercentage?: (percentage: number) => void;
}

// FilePreview Component
const FilePreview = ({ file, index, moveFile, onRemove, type }: any) => {
  const [, ref] = useDrag({
    type: "FILE",
    item: { index },
  });

  const [, drop] = useDrop({
    accept: "FILE",
    hover: (draggedItem: any) => {
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
        <video src={previewUrl} className="preview-video" />
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

const CreateUnlockPost: React.FC<CreateUnlockPostProps> = ({
<<<<<<< HEAD
  post,
=======
>>>>>>> 89579f1 (Resolve Conflict)
  onClose,
  setLoading: setLoadingProp,
  loading: loadingProp,
  setUploadPercentage: setUploadPercentageProp,
}) => {
  const [status, setStatus] = useState("published");
  const [level, setLevel] = useState<number | null>(null);
  const [is_recommend, setIs_recommend] = useState(0);
  const [is_top, setIs_top] = useState(0);
  const [user_id, setUserId] = useState<string | number | null>(null);
<<<<<<< HEAD
  const { data: userData, isLoading: isUserLoading } =
    useGetUserInfoQuery(undefined);
  const { data, isLoading: isUsersLoading } = useAllgetCreatorsQuery({
    role: 0,
  });
=======
  const { data, isLoading: isUsersLoading } = useAllgetCreatorsQuery(undefined);
>>>>>>> 89579f1 (Resolve Conflict)
  const users = data?.data?.list || [];
  const [localLoading, setLocalLoading] = useState(false);
  const [createWebViewPost] = useCreateWebViewPostMutation();

  // Use prop loading state if provided, otherwise use local state
  const loading = loadingProp !== undefined ? loadingProp : localLoading;
  const setLoading = setLoadingProp || setLocalLoading;
  const setUploadPercentage = setUploadPercentageProp || (() => {});

  // Form fields state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topContent, setTopContent] = useState("");
  const [bottomContent, setBottomContent] = useState("");
  const [websiteLink, setWebsiteLink] = useState("");
  const [requirePoints, setRequirePoints] = useState<number | null>(null);

  // Cover Image state
  const [coverImages, setCoverImages] = useState<any[]>([]);

  // Video state
  const [videos, setVideos] = useState<any[]>([]);

  // Images state
  const [images, setImages] = useState<any[]>([]);

<<<<<<< HEAD
  useEffect(() => {
    if (!post && userData) {
      setUserId(userData?.data.user_id);
    }
  }, [userData, post]);

=======
>>>>>>> 89579f1 (Resolve Conflict)
  // Utility functions
  const getImageDimensions = (
    file: File
  ): Promise<{ width: string; height: string }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width.toString(), height: img.height.toString() });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  const getVideoDimensions = (
    file: File
  ): Promise<{ width: string; height: string }> => {
    return new Promise((resolve) => {
      const video = document.createElement("video");
      video.onloadedmetadata = () => {
        resolve({
          width: video.videoWidth.toString(),
          height: video.videoHeight.toString(),
        });
      };
      video.src = URL.createObjectURL(file);
    });
  };

  const getFileSuffix = (filePath: string) => {
    const parts = filePath.split(".");
    return parts.length > 1 ? parts[parts.length - 1] : "";
  };

  // Cover Image handlers
  const onCoverDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newImages = acceptedFiles.filter((file) =>
        file.type.startsWith("image/")
      );

      if (newImages.length + coverImages.length > MAX_COVER_IMAGES) {
        message.error(
          `You can only upload a maximum of ${MAX_COVER_IMAGES} cover image`
        );
        return;
      }

      const processedFiles = await Promise.all(
        newImages.map(async (file) => {
          const { width, height } = await getImageDimensions(file);
          const suffix = getFileSuffix(file.name || "");
          return {
            image: file,
            size: file.size,
            width,
            height,
            suffix,
            type: "image",
          };
        })
      );
      setCoverImages((prevFiles) => [...prevFiles, ...processedFiles]);
    },
    [coverImages]
  );

  const { getRootProps: getCoverRootProps, getInputProps: getCoverInputProps } =
    useDropzone({
      accept: { "image/*": [] },
      onDrop: onCoverDrop,
    });

  const handleRemoveCover = (fileToRemove: any) => {
    setCoverImages((prevFiles) =>
      prevFiles.filter((file) => file.image !== fileToRemove)
    );
  };

  const moveCoverFile = (fromIndex: number, toIndex: number) => {
    setCoverImages((prevFiles) => {
      const updatedFiles = [...prevFiles];
      const [movedFile] = updatedFiles.splice(fromIndex, 1);
      updatedFiles.splice(toIndex, 0, movedFile);
      return updatedFiles;
    });
  };

  // Video handlers
  const onVideoDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const videoFiles = acceptedFiles.filter((file) =>
        file.type.startsWith("video/")
      );

      if (acceptedFiles.length > 1) {
        message.error("You can only upload one video.");
        return;
      }

      if (videoFiles.length + videos.length > MAX_VIDEOS) {
        message.error(`You can only upload a maximum of ${MAX_VIDEOS} video`);
        return;
      }

      const processedFiles = await Promise.all(
        videoFiles.map(async (file) => {
          const { width, height } = await getVideoDimensions(file);
          const suffix = getFileSuffix(file.name || "");
          return {
            video: file,
            size: file.size,
            width,
            height,
            suffix,
            type: "video",
          };
        })
      );
      setVideos((prevFiles) => [...prevFiles, ...processedFiles]);
    },
    [videos]
  );

  const { getRootProps: getVideoRootProps, getInputProps: getVideoInputProps } =
    useDropzone({
      accept: { "video/*": [] },
      onDrop: onVideoDrop,
    });

  const handleRemoveVideo = (fileToRemove: any) => {
    setVideos((prevFiles) =>
      prevFiles.filter((file) => file.video !== fileToRemove)
    );
  };

  const moveVideoFile = (fromIndex: number, toIndex: number) => {
    setVideos((prevFiles) => {
      const updatedFiles = [...prevFiles];
      const [movedFile] = updatedFiles.splice(fromIndex, 1);
      updatedFiles.splice(toIndex, 0, movedFile);
      return updatedFiles;
    });
  };

  // Images handlers
  const onImagesDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const newImages = acceptedFiles.filter((file) =>
        file.type.startsWith("image/")
      );

      if (newImages.length + images.length > MAX_IMAGES) {
        message.error(`You can only upload a maximum of ${MAX_IMAGES} images`);
        return;
      }

      const processedFiles = await Promise.all(
        newImages.map(async (file) => {
          const { width, height } = await getImageDimensions(file);
          const suffix = getFileSuffix(file.name || "");
          return {
            image: file,
            size: file.size,
            width,
            height,
            suffix,
            type: "image",
          };
        })
      );
      setImages((prevFiles) => [...prevFiles, ...processedFiles]);
    },
    [images]
  );

  const {
    getRootProps: getImagesRootProps,
    getInputProps: getImagesInputProps,
  } = useDropzone({
    accept: { "image/*": [] },
    onDrop: onImagesDrop,
  });

  const handleRemoveImage = (fileToRemove: any) => {
    setImages((prevFiles) =>
      prevFiles.filter((file) => file.image !== fileToRemove)
    );
  };

  const moveImageFile = (fromIndex: number, toIndex: number) => {
    setImages((prevFiles) => {
      const updatedFiles = [...prevFiles];
      const [movedFile] = updatedFiles.splice(fromIndex, 1);
      updatedFiles.splice(toIndex, 0, movedFile);
      return updatedFiles;
    });
  };

  const onChange = (e: CheckboxChangeEvent) => {
    if (e.target.checked) {
      setIs_recommend(1);
    } else {
      setIs_recommend(0);
    }
  };

  const onChangeTop = (e: CheckboxChangeEvent) => {
    if (e.target.checked) {
      setIs_top(1);
    } else {
      setIs_top(0);
    }
  };

  const handleSubmit = async () => {
    // Validation
    if (!title) {
      message.error("Title is required!");
      return;
    }
    if (!description) {
      message.error("Description is required!");
      return;
    }
    if (!user_id) {
      message.error("Please select a user!");
      return;
    }
<<<<<<< HEAD
    if (
      coverImages.length === 0 &&
      videos.length === 0 &&
      images.length === 0
    ) {
      message.error(
        "Please upload at least one file (cover image, video, or images)!"
      );
=======
    if (coverImages.length === 0 && videos.length === 0 && images.length === 0) {
      message.error("Please upload at least one file (cover image, video, or images)!");
>>>>>>> 89579f1 (Resolve Conflict)
      return;
    }

    setLoading(true);
    setUploadPercentage(0);

    try {
      // Get S3 credentials
      const response = await axios.get(
        "http://movie_upload_api.qdhgtch.com:5343/uploadv2.php"
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

      // Create S3 client
      const s3 = new S3Client({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
          sessionToken,
        },
      });

      // Upload cover images separately
      const uploadedCoverImages: any[] = [];
      const totalFiles = coverImages.length + videos.length + images.length;
      let uploadedCount = 0;

      for (const fileItem of coverImages) {
        const file = fileItem.image;
<<<<<<< HEAD
        const key = `image_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}.${fileItem.suffix}`;

=======
        const key = `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileItem.suffix}`;
        
>>>>>>> 89579f1 (Resolve Conflict)
        const uploadParams = {
          Bucket: bucket,
          Key: `${directory}/${key}`,
          Body: file,
          ContentType: file.type,
          ContentDisposition: "inline",
        };

        const upload = new Upload({
          client: s3,
          leavePartsOnError: false,
          params: uploadParams,
        });

        upload.on("httpUploadProgress", (progressEvent) => {
          if (progressEvent.loaded && progressEvent.total) {
            const fileProgress = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            );
            const totalProgress = Math.round(
              ((uploadedCount + fileProgress / 100) / totalFiles) * 100
            );
            setUploadPercentage(totalProgress);
          }
        });

        await upload.done();

        const resourceURL = `${publicUrl}${directory}/${key}`;
        uploadedCoverImages.push(resourceURL);
        uploadedCount++;
        setUploadPercentage(Math.round((uploadedCount / totalFiles) * 100));
      }

      // Upload videos separately
      let videoURL = "";
      for (const fileItem of videos) {
        const file = fileItem.video;
<<<<<<< HEAD
        const key = `video_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}.${fileItem.suffix}`;

=======
        const key = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileItem.suffix}`;
        
>>>>>>> 89579f1 (Resolve Conflict)
        const uploadParams = {
          Bucket: bucket,
          Key: `${directory}/${key}`,
          Body: file,
          ContentType: file.type,
          ContentDisposition: "inline",
        };

        const upload = new Upload({
          client: s3,
          leavePartsOnError: false,
          params: uploadParams,
        });

        upload.on("httpUploadProgress", (progressEvent) => {
          if (progressEvent.loaded && progressEvent.total) {
            const fileProgress = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            );
            const totalProgress = Math.round(
              ((uploadedCount + fileProgress / 100) / totalFiles) * 100
            );
            setUploadPercentage(totalProgress);
          }
        });

        await upload.done();

        videoURL = `${publicUrl}${directory}/${key}`;
        uploadedCount++;
        setUploadPercentage(Math.round((uploadedCount / totalFiles) * 100));
      }

      // Upload images (files) separately
      const uploadedImageFiles: any[] = [];
      for (const fileItem of images) {
        const file = fileItem.image;
<<<<<<< HEAD
        const key = `image_${Date.now()}_${Math.random()
          .toString(36)
          .substr(2, 9)}.${fileItem.suffix}`;

=======
        const key = `image_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileItem.suffix}`;
        
>>>>>>> 89579f1 (Resolve Conflict)
        const uploadParams = {
          Bucket: bucket,
          Key: `${directory}/${key}`,
          Body: file,
          ContentType: file.type,
          ContentDisposition: "inline",
        };

        const upload = new Upload({
          client: s3,
          leavePartsOnError: false,
          params: uploadParams,
        });

        upload.on("httpUploadProgress", (progressEvent) => {
          if (progressEvent.loaded && progressEvent.total) {
            const fileProgress = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            );
            const totalProgress = Math.round(
              ((uploadedCount + fileProgress / 100) / totalFiles) * 100
            );
            setUploadPercentage(totalProgress);
          }
        });

        await upload.done();

        const resourceURL = `${publicUrl}${directory}/${key}`;
<<<<<<< HEAD

=======
        
>>>>>>> 89579f1 (Resolve Conflict)
        uploadedImageFiles.push({
          resourceURL,
          size: fileItem.size.toString(),
          height: fileItem.height || "",
          width: fileItem.width || "",
          suffix: fileItem.suffix,
          type: "image",
        });
        uploadedCount++;
        setUploadPercentage(Math.round((uploadedCount / totalFiles) * 100));
      }

      // Prepare payload for web-view post
      const postPayload: any = {
        title,
        description,
        top_content: topContent,
        bottom_content: bottomContent,
        jump_url: websiteLink || "",
<<<<<<< HEAD
        user_id:
          typeof user_id === "number" ? user_id : parseInt(user_id as string),
=======
        user_id: typeof user_id === "number" ? user_id : parseInt(user_id as string),
>>>>>>> 89579f1 (Resolve Conflict)
        status,
        is_recommend,
        is_top,
      };

      // Add cover images as "images" field
      if (uploadedCoverImages.length > 0) {
        postPayload.images = uploadedCoverImages;
      }

      // Add video URL
      if (videoURL) {
        postPayload.video_url = videoURL;
      }

      // Add image files as "files" field
      if (uploadedImageFiles.length > 0) {
        postPayload.files = uploadedImageFiles;
      }

      // Add optional fields
      if (requirePoints !== null) {
        postPayload.point = requirePoints;
      }
      if (level !== null) {
        postPayload.level_id = level;
      }

      console.log("Payload:", postPayload);

      // Submit to API
      await createWebViewPost(postPayload).unwrap();

      message.success("Post created successfully!");
<<<<<<< HEAD

=======
      
>>>>>>> 89579f1 (Resolve Conflict)
      // Reset form
      setTitle("");
      setDescription("");
      setTopContent("");
      setBottomContent("");
      setWebsiteLink("");
      setRequirePoints(null);
      setLevel(null);
      setCoverImages([]);
      setVideos([]);
      setImages([]);
      setIs_recommend(0);
      setIs_top(0);
      setUserId(null);
<<<<<<< HEAD

      setLoading(false);
      setUploadPercentage(0);

=======
      
      setLoading(false);
      setUploadPercentage(0);
      
>>>>>>> 89579f1 (Resolve Conflict)
      // Close modal if onClose is provided
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Upload failed:", error);
      message.error("Failed to create post. Please try again.");
      setLoading(false);
      setUploadPercentage(0);
    }
<<<<<<< HEAD
  };
=======
  }
>>>>>>> 89579f1 (Resolve Conflict)

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="file-upload-container">
        <Flex vertical gap={16}>
          <Flex vertical gap={8} className="w-full">
            <Typography.Text>Title</Typography.Text>
            <Input
              placeholder="Write Title..."
              className="w-full p-2 bg-transparent title des"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </Flex>
          <Flex vertical gap={8} className="w-full">
            <Typography.Text>Description</Typography.Text>
            <TextArea
              placeholder="Write Description..."
              className="w-full p-2 bg-transparent des"
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Flex>
          <Flex vertical gap={8} className="w-full">
            <Typography.Text>Top Content</Typography.Text>
            <TextArea
              placeholder="Write Top Content..."
              className="w-full p-2 bg-transparent des"
              rows={4}
              value={topContent}
              onChange={(e) => setTopContent(e.target.value)}
            />
          </Flex>
          <Flex vertical gap={8} className="w-full">
            <Typography.Text>Bottom Content</Typography.Text>
            <TextArea
              placeholder="Write Bottom Content..."
              className="w-full p-2 bg-transparent des"
              rows={4}
              value={bottomContent}
              onChange={(e) => setBottomContent(e.target.value)}
            />
          </Flex>

          <Flex gap={8} className="w-full items-center">
            <Select
              value={status}
              onChange={(value) => {
                setStatus(value);
              }}
              style={{ marginBottom: 10, marginRight: 10 }}
            >
              <Select.Option value="published">Published</Select.Option>
              <Select.Option value="review">Review</Select.Option>
              <Select.Option value="declined">Declined</Select.Option>
            </Select>
            <Select
              value={user_id} // Bind selected user_id here
              onChange={(value) => setUserId(value)} // Update user_id on selection
              placeholder="Select User"
              style={{ marginBottom: 10, marginRight: 10, width: 120 }}
              loading={isUsersLoading} // Show loading state when fetching users
            >
              {users?.map((user: any) => (
                <Select.Option key={user.id} value={user.id}>
                  {user.nickname}
                </Select.Option>
              ))}
              <Select.Option value={"custom"}>Custom id</Select.Option>
            </Select>
            <Checkbox
              onChange={onChange}
              checked={is_recommend === 1 ? true : false}
              style={{ marginBottom: 10, marginRight: 10 }}
            >
              Recommend
            </Checkbox>
            <Checkbox
              onChange={onChangeTop}
              checked={is_top === 1 ? true : false}
              style={{ marginBottom: 10, marginRight: 10 }}
            >
              Top Pick
            </Checkbox>
          </Flex>
          <Flex vertical gap={8} className="w-full">
            <Typography.Text>Website Link</Typography.Text>
            <Input
              placeholder="Write Website Link..."
              className="w-full p-2 bg-transparent title des"
              value={websiteLink}
              onChange={(e) => setWebsiteLink(e.target.value)}
            />
          </Flex>
          <Flex gap={8} className="w-full">
            <Flex vertical gap={8} className="w-full">
              <Typography.Text>Require Points</Typography.Text>
              <Input
                placeholder="Enter require points..."
                className="w-full p-2 bg-transparent title des"
                type="number"
                value={requirePoints || ""}
<<<<<<< HEAD
                onChange={(e) =>
                  setRequirePoints(
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
=======
                onChange={(e) => setRequirePoints(e.target.value ? parseInt(e.target.value) : null)}
>>>>>>> 89579f1 (Resolve Conflict)
              />
            </Flex>
            <Flex vertical gap={8} className="w-full">
              <Typography.Text>Require Level</Typography.Text>
              <Select
                value={level}
                placeholder="---Select Level---"
                onChange={(value) => {
                  setLevel(value);
                }}
                size="large"
                style={{ marginBottom: 10, marginRight: 10 }}
              >
                <Select.Option value={1}>Qi Refining Level 1</Select.Option>
                <Select.Option value={2}>Qi Refining Level 2</Select.Option>
                <Select.Option value={3}>Qi Refining Level 3</Select.Option>
                <Select.Option value={4}>Qi Refining Level 4</Select.Option>
                <Select.Option value={5}>Qi Refining Level 5</Select.Option>
                <Select.Option value={6}>Qi Refining Level 6</Select.Option>
              </Select>
            </Flex>
          </Flex>
          <Flex gap={8} className="w-full">
            {/* Cover Image Upload */}
            <FileDropzone
              getRootProps={getCoverRootProps}
              getInputProps={getCoverInputProps}
              title="Click + to select cover image (Max 1 image)"
              supportFormats="Support format: JPG, PNG"
              files={coverImages}
              fileType="image"
              moveFile={moveCoverFile}
              handleRemoveFile={handleRemoveCover}
              handleVideoClick={() => {}}
              handleImgClick={() => {}}
              FilePreview={FilePreview}
              className="flex-1"
            />
            {/* Video Upload */}
            <FileDropzone
              getRootProps={getVideoRootProps}
              getInputProps={getVideoInputProps}
              title="Click + to select a video file (Max 1 video)"
              supportFormats="Support format: MP4"
              files={videos}
              fileType="video"
              moveFile={moveVideoFile}
              handleRemoveFile={handleRemoveVideo}
              handleVideoClick={() => {}}
              handleImgClick={() => {}}
              FilePreview={FilePreview}
              className="flex-1"
            />
          </Flex>

          {/* Images Upload */}
          <Flex vertical gap={8} className="w-full">
            <Typography.Text>Images (Max 9)</Typography.Text>
            <FileDropzone
              getRootProps={getImagesRootProps}
              getInputProps={getImagesInputProps}
              title="Click to select images (Max 9 images)"
              supportFormats="Support format: JPG, PNG"
              files={images}
              fileType="image"
              moveFile={moveImageFile}
              handleRemoveFile={handleRemoveImage}
              handleVideoClick={() => {}}
              handleImgClick={() => {}}
              FilePreview={FilePreview}
            />
          </Flex>
          <div className="flex items-center justify-between">
            <div></div>
            <Button
              onClick={handleSubmit}
              className={`mt-2 ${loading ? "hover:bg-transparent" : "save"}`}
              type="primary"
              disabled={loading}
            >
              {loading ? "Loading..." : "Upload Post"}
            </Button>
          </div>
        </Flex>
      </div>
    </DndProvider>
  );
};

export default CreateUnlockPost;
