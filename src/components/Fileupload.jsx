import React, { useState, useEffect } from "react";

import {
  useAllgetCreatorsQuery,
  useCreatePostMutation,
  useGetConfigQuery,
  useGetUserInfoQuery,
} from "../services/postApi";
import {
  message,
  Button,
  Select,
  Checkbox,
  Modal,
  Input,
  InputNumber,
} from "antd";

import axios from "axios";
import TextArea from "antd/es/input/TextArea";

import { S3Client } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { md5 } from "js-md5"; // You'll need to install js-md5: npm install js-md5

const { Option } = Select;

const Fileupload = ({
  thumbnail,
  setThumbnail,
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
  files,
  setFiles,
  fileType,
  setFileType,
  audioFile,
  setaudioFile,
  setFileName,
}) => {
  // const [files, setFiles] = useState([]);

  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("published"); // Track if we're uploading images or videos
  const [score, setScore] = useState(""); // Track if we're uploading images or videos
  const [is_recommend, setIs_recommend] = useState(0); // Track if we're uploading images or videos
  const [is_top, setIs_top] = useState(0); // Track if we're uploading images or videos
  const [audioDuration, setaudioDuration] = useState("");
  const [createPost] = useCreatePostMutation();
  const { data: userData, isLoading: isUserLoading } =
    useGetUserInfoQuery(undefined);
  const [user_id, setUserId] = useState("");
  const { data, isLoading: isUsersLoading } = useAllgetCreatorsQuery({
    role: 0,
  });

  const { data: config } = useGetConfigQuery();

  const users = data?.data?.list || [];

  const [customStatus, setCustomStatus] = useState(false);
  const [customInput, setCustomInput] = useState(""); // State to hold the custom user ID input

  useEffect(() => {
    if (!post && userData) {
      setUserId(userData?.data.user_id);
    }
  }, [userData, post]);

  useEffect(() => {
    if (post && users) {
      setDescription(post.description || "");
      setFileType(post.file_type || "image");
      setStatus(post.status || "published");
      setScore(post.score || "");

      // setUserId(post?.user_id || "");
      setIs_recommend(post?.is_recommend || 0);
      setIs_top(post?.is_top || 0);

      // Check if post.user_id exists in the users array
      const userExists = users.some((user) => user.id === post.user_id);

      if (userExists) {
        // If post.user_id exists in the users array, set it normally
        setUserId(post.user_id);
        setCustomStatus(false); // No custom input needed
        setCustomInput(""); // Clear custom input
      } else {
        // If post.user_id doesn't exist in the users array, set it as custom
        setUserId("custom");
        setCustomStatus(true); // Show custom input
        setCustomInput(post.user_id); // Set the custom user_id
      }

      const parsedFiles = post.files ? JSON.parse(post.files) : [];

      if (post?.file_type === "audio") {
        setFileName(parsedFiles[0]?.resourceURL || "");
      }

      if (parsedFiles.length > 0) {
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
      setIs_recommend(0);
      setIs_top(0);
      setScore("");
      setFileName("");
      setDescription("");
      setFiles([]);
      setThumbnail(null);
    }
  }, [isVisible, post, users]);

  const onChange = (e) => {
    if (e.target.checked) {
      setIs_recommend(1);
    } else {
      setIs_recommend(0);
    }
  };

  const onChangeTop = (e) => {
    if (e.target.checked) {
      setIs_top(1);
    } else {
      setIs_top(0);
    }
  };

  const getFileExtension = (filename) => {
    return filename.split(".").pop();
  };
  const getVideoDurationFromUrl = (videoUrl) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      video.src = videoUrl;
      video.onloadedmetadata = () => {
        resolve(video.duration); // Convert duration to milliseconds
      };
      video.onerror = () => {
        reject("Error loading video file for duration calculation.");
      };
    });
  };
  const removeFileExtension = (filename) => {
    const dotIndex = filename.lastIndexOf(".");
    if (dotIndex === -1) {
      return filename; // If no dot is found, return the filename as is
    }
    return filename.substring(0, dotIndex); // Return the part before the last dot
  };

  /**
   * 生成金山云 CDN 鉴权 URL (React 版本)
   *
   * @param {string} baseUrl - 例如 http://ksyun.cdn.com
   * @param {string} path - 例如 /home/test.dat
   * @param {string} secret - 主或备秘钥
   * @param {number} [expireIn=300] - 有效期（秒），默认 300 秒
   * @param {number} [type=1] - 鉴权类型（1 或 2）
   * @returns {string}
   */
  function generateKsCdnAuthUrl(
    baseUrl,
    path,
    secret,
    expireIn = 3600,
    type = 1
  ) {
    const timestamp = Math.floor(Date.now() / 1000) + expireIn;

    const normalizedPath = "/" + path.replace(/^\/+/, "");
    const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
    const sign = md5(secret + normalizedPath + timestamp);

    if (type === 1) {
      return `${normalizedBaseUrl}${normalizedPath}?t=${timestamp}&k=${sign}`;
    } else {
      return `${normalizedBaseUrl}/${sign}/${timestamp}${normalizedPath}`;
    }
  }

  const handleSubmit = async () => {
    setLoading(true);
    setUploadPercentage(0);

    if (!description) {
      message.error("Description is required!");
      setLoading(false);
      return;
    }

    const resetForm = () => {
      setIs_recommend(0);
      setIs_top(0);
      setDescription("");
      setFiles([]);
      setThumbnail(null);
      setPage(1);
      refetch();
      setEditingPost(null);
      closeDiv(false);
      setLoading(false);
    };

    const handleSuccessMessage = () => {
      message.success(
        post ? "Post updated successfully." : "Post created successfully."
      );
    };

    const handleError = (error) => {
      console.error("Upload failed:", error);
      message.error("Failed to submit post. Please try again.");
      setLoading(false);
    };

    const preparePostPayload = (uploadedFileUrls = []) => ({
      is_top,
      is_recommend,
      type: "post",
      user_id: user_id === "custom" ? +customInput : +user_id,
      description,
      files: uploadedFileUrls,
      file_type: fileType,
      status,
      ...(score && score !== "" && { score }),
      ...(post && { post_id: post.id }),
    });

    try {
      if (fileType === "text") {
        const postPayload = preparePostPayload();
        setUploadPercentage(100);
        await createPost(postPayload).unwrap();
        handleSuccessMessage();
        resetForm();
        return;
      }

      if (
        fileType !== "image" &&
        fileType !== "video" &&
        fileType !== "audio"
      ) {
        message.error("Invalid file type!");
        setLoading(false);
        return;
      }

      if (fileType === "video" && !thumbnail) {
        message.error("Thumbnail and Video are required!");
        setLoading(false);
        return;
      }

      const response = await axios.get(
        // "http://movie_upload_v2.qdhgtch.com:5343/uploadv2.php"
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
        imageUrl,
      } = response.data;

      const s3 = new S3Client({
        region,
        credentials: { accessKeyId, secretAccessKey, sessionToken },
      });

      const uploadFileToS3 = async (file, key, contentType) => {
        const uploadParams = {
          Bucket: bucket,
          Key: `${directory}/${key}`,
          Body: file,
          ContentType: contentType,
          ContentDisposition: "inline",
        };

        const upload = new Upload({
          client: s3,
          leavePartsOnError: false,
          params: uploadParams,
        });

        return new Promise((resolve, reject) => {
          upload.on("httpUploadProgress", (progressEvent) => {
            const progress = Math.round(
              (progressEvent.loaded / progressEvent.total) * 100
            );
            setUploadPercentage(progress);
          });

          upload.done().then(resolve).catch(reject);
        });
      };

      const uploadedFileUrls = [];
      for (const file of files) {
        if (file?.resourceURL) {
          if (file?.type === "video") {
            const a = config?.data?.post_public_url;
            const b = file?.resourceURL;
            const cdnUrl = generateKsCdnAuthUrl(
              a,
              b,
              config?.data?.social_cdn_secret,
              config?.data?.social_cdn_expire,
              config?.data?.social_cdn_type
            );
            const duration = await getVideoDurationFromUrl(cdnUrl);

            file.duration = Math.floor(duration).toString(); // Use Math.floor to round down
          }

          uploadedFileUrls.push(file);
          continue;
        }

        const isImage = fileType === "image";
        const key = `${
          isImage ? "image" : "video"
        }_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${
          file.suffix
        }`;
        const fileContent = isImage ? file.image : file.video;
        const contentType = isImage ? file.image?.type : file.video?.type;

        await uploadFileToS3(fileContent, key, contentType);

        const path_img = `/${directory}/${key}`;

        const path_vod = `/${directory}/${key}`;

        const resourceURL = `${isImage ? path_img : path_vod}`;
        console.log(resourceURL, " resourceURL");

        if (!isImage) {
          const a = config?.data?.post_public_url;
          const b = resourceURL;
          const cdnUrl = generateKsCdnAuthUrl(
            a,
            b,
            config?.data?.social_cdn_secret,
            config?.data?.social_cdn_expire,
            config?.data?.social_cdn_type
          );
          // const duration = await getVideoDurationFromUrl(
          //   `${config?.data?.post_public_url}${resourceURL}`
          // );
          const duration = await getVideoDurationFromUrl(cdnUrl);
          uploadedFileUrls.push({
            resourceURL,
            duration: Math.floor(duration).toString(),
            size: file?.size.toString(),
            height: file?.height || "",
            width: file?.width || "",
            suffix: file?.suffix,
            type: isImage ? "image" : "video",
          });
        } else {
          uploadedFileUrls.push({
            resourceURL,
            size: file?.size.toString(),
            height: file?.height || "",
            width: file?.width || "",
            suffix: file?.suffix,
            type: isImage ? "image" : "video",
          });
        }
      }

      if (fileType === "video" && thumbnail) {
        if (typeof thumbnail === "string") {
          uploadedFileUrls[0].thumbnail = thumbnail;
        } else {
          const thumbnailKey = `thumbnail_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}.${getFileExtension(thumbnail.name)}`;
          await uploadFileToS3(thumbnail, thumbnailKey, thumbnail.type);
          let img_url = `/${directory}/${thumbnailKey}`;
          // let img_url = `${
          //   config?.data?.post_image_url ? config.data.post_image_url : imageUrl
          // }${directory}/${thumbnailKey}`;
          // let img_url = `${
          //   config?.data?.post_image_url
          //     ? config.data.post_image_url.endsWith("/")
          //       ? config.data.post_image_url
          //       : `${config.data.post_image_url}/`
          //     : imageUrl.endsWith("/")
          //     ? imageUrl
          //     : `${imageUrl}/`
          // }${directory}/${thumbnailKey}`;
          // const thumbnailUrl = `${imageUrl}${directory}/${thumbnailKey}`;
          uploadedFileUrls[0].thumbnail = img_url;
        }
      }

      // Handle audio file
      if (fileType === "audio" && audioFile) {
        const audio_key = `${removeFileExtension(
          audioFile.name
        )}_${Date.now()}.${getFileExtension(audioFile.name)}`;
        await uploadFileToS3(audioFile, audio_key, audioFile.type);

        // let audio_url = `${
        //   config?.data?.post_public_url?.endsWith("/")
        //     ? config.data.post_public_url
        //     : `${config?.data?.post_public_url || publicUrl}/`
        // }${directory}/${audio_key}`;
        // let audio_url = `${
        //   config?.data?.post_public_url
        //     ? config.data.post_public_url
        //     : publicUrl
        // }${directory}/${audio_key}`;

        let audio_url = `/${directory}/${audio_key}`;
        // Create an Audio element to get the duration
        const audio = new Audio(URL.createObjectURL(audioFile));

        // Wait until the metadata is loaded before proceeding
        const audioDuration = await new Promise((resolve, reject) => {
          audio.onloadedmetadata = () => {
            resolve(audio.duration); // Return duration when loaded
          };
          audio.onerror = () => {
            reject("Error loading audio file for duration calculation.");
          };
        });

        const audioDurationString = audioDuration.toString();

        // Push audio info to the uploadedFileUrls array
        uploadedFileUrls.push({
          resourceURL: audio_url,
          duration: audioDurationString, // Duration in seconds
        });
      }

      const postPayload = preparePostPayload(uploadedFileUrls);

      await createPost(postPayload).unwrap();
      handleSuccessMessage();
      resetForm();
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    if (user_id === "custom") {
      setCustomStatus(true);
      // setCustomInput(""); // Reset the custom input field when "custom" is selected
    } else {
      setCustomStatus(false);
    }
  }, [user_id]);

  const handleInputChange = (e) => {
    setCustomInput(e.target.value); // Update the custom user ID input
  };

  return (
    // <DndProvider backend={HTML5Backend}>
    <>
      <TextArea
        type="text"
        placeholder="Write Description..."
        className="w-full p-2 my-5 bg-transparent des"
        onChange={(e) => setDescription(e.target.value)}
        value={description}
        rows={4}
      />
      <div>
        <label className="mr-2">Score</label>
        <InputNumber
          value={score}
          placeholder="Enter score"
          className="mb-3 w-[200px]"
          onChange={(value) => setScore(value)}
        />
      </div>

      <Select
        value={fileType}
        onChange={(value) => {
          setFileType(value);
          setFiles([]);
          setThumbnail(null);
        }}
        style={{ marginBottom: 10, marginRight: 10 }}
      >
        <Option value="image">Images</Option>
        <Option value="video">Videos</Option>
        <Option value="audio">Auido</Option>
        <Option value="text">Text</Option>
      </Select>
      <Select
        value={status}
        onChange={(value) => {
          setStatus(value);
        }}
        style={{ marginBottom: 10, marginRight: 10 }}
      >
        <Option value="published">Published</Option>
        <Option value="review">Review</Option>
        <Option value="declined">Declined</Option>
      </Select>
      <Select
        value={user_id} // Bind selected user_id here
        onChange={(value) => setUserId(value)} // Update user_id on selection
        placeholder="Select User"
        style={{ marginBottom: 10, marginRight: 10, width: 120 }}
        loading={isUsersLoading || isUserLoading} // Show loading state when fetching users
      >
        {users?.map((user) => (
          <Option key={user.id} value={user.id}>
            {user.nickname}
          </Option>
        ))}
        <Option value={"custom"}>Custom id</Option>
      </Select>
      {customStatus && (
        <Input
          className="w-[150px] my-2 mr-2"
          placeholder="Enter userId"
          value={customInput} // If it's "custom", clear the input
          onChange={handleInputChange}
        />
      )}
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

      <div className="flex items-center justify-between">
        <div></div>
        <Button
          onClick={handleSubmit}
          className={`absolute right-0 bottom-0 mt-2 ${
            loading ? "hover:bg-transparent" : "save"
          }`}
          type="primary"
          disabled={loading}
        >
          {loading ? "Loading..." : post ? "Update Post" : "Save Post"}
        </Button>
      </div>
    </>
  );
};

export default Fileupload;

// const handleSubmit = async () => {
//   setLoading(true);
//   setUploadPercentage(0);

//   if (description) {
//     if (fileType === "text") {
//       try {
//         // Handle final post submission
//         const postPayload = {
//           is_top,
//           is_recommend,
//           type: "post",
//           user_id: user_id === "custom" ? +customInput : +user_id,
//           description,
//           files: [],
//           file_type: fileType,
//           status,
//           ...(score && score !== "" && { score }), // Conditionally add score if it's not an empty string
//           ...(post && { post_id: post.id }),
//         };
//         setUploadPercentage(100);

//         await createPost(postPayload).unwrap();
//         setIs_recommend(0);
//         setIs_top(0);

//         setDescription("");
//         setFiles([]);
//         setThumbnail(null);
//         setPage(1);
//         refetch();
//         setEditingPost(null);
//         closeDiv(false);
//         message.success(
//           post ? "Post updated successfully." : "Post created successfully."
//         );
//         setLoading(false);
//       } catch (error) {
//         console.error("Upload failed:", error);
//         message.error("Failed to submit post. Please try again.");
//         setLoading(false);
//       }
//     } else {
//       if (fileType === "image" || (fileType === "video" && thumbnail)) {
//         try {
//           const response = await axios.get(
//             "http://movie_upload_api.qdhgtch.com:5343/uploadv2.php"
//           );
//           const {
//             accessKeyId,
//             secretAccessKey,
//             sessionToken,
//             region,
//             bucket,
//             publicUrl,
//             directory,
//             imageUrl,
//           } = response.data;

//           // Create an S3 client
//           const s3 = new S3Client({
//             region,
//             credentials: {
//               accessKeyId,
//               secretAccessKey,
//               sessionToken,
//             },
//           });

//           const uploadedFileUrls = [];
//           let totalFiles = files.length;
//           let uploadedFiles = 0;
//           let totalProgress = 0;

//           // Iterate over files and upload
//           for (const file of files) {
//             if (file?.resourceURL) {
//               uploadedFileUrls.push(file);
//               uploadedFiles++;
//               totalProgress = Math.round((uploadedFiles / totalFiles) * 100);
//               setUploadPercentage(totalProgress);
//               continue; // Skip upload for already uploaded files
//             }

//             const isImage = fileType === "image";
//             const key = isImage
//               ? `image_${Date.now()}_${Math.random()
//                   .toString(36)
//                   .substr(2, 9)}.${file.suffix}`
//               : `video_${Date.now()}_${Math.random()
//                   .toString(36)
//                   .substr(2, 9)}.${file.suffix}`;
//             const fileContent = file.image || file.video;
//             const contentType = isImage ? file.image?.type : file.video?.type;

//             const uploadParams = {
//               Bucket: bucket,
//               Key: `${directory}/${key}`,
//               Body: fileContent,
//               ContentType: contentType,
//               ContentDisposition: "inline",
//             };

//             // Use @aws-sdk/lib-storage for large file uploads with progress
//             const upload = new Upload({
//               client: s3,
//               leavePartsOnError: false,
//               params: uploadParams,
//             });

//             // Track upload progress
//             upload.on("httpUploadProgress", (progressEvent) => {
//               const progress = Math.round(
//                 (progressEvent.loaded / progressEvent.total) * 100
//               );
//               totalProgress = Math.round(
//                 ((uploadedFiles + progress / 100) / totalFiles) * 100
//               );
//               setUploadPercentage(totalProgress); // Update global progress
//             });

//             // Wait for upload to finish
//             await upload.done();
//             let metadata;

//             if (isImage) {
//               metadata = {
//                 resourceURL: `${
//                   config?.data?.post_image_url?.endsWith("/")
//                     ? config.data.post_image_url
//                     : `${config?.data?.post_image_url || imageUrl}/`
//                 }${directory}/${key}`,

//                 size: file?.size.toString(),
//                 height: file?.height || "",
//                 width: file?.width || "",
//                 suffix: file?.suffix,
//                 type: isImage ? "image" : "video",
//               };
//             } else {
//               metadata = {
//                 resourceURL: `${
//                   config?.data?.post_public_url?.endsWith("/")
//                     ? config.data.post_public_url
//                     : `${config?.data?.post_public_url || publicUrl}/`
//                 }${directory}/${key}`,

//                 size: file?.size.toString(),
//                 height: file?.height || "",
//                 width: file?.width || "",
//                 suffix: file?.suffix,
//                 type: isImage ? "image" : "video",
//               };
//             }

//             uploadedFileUrls.push(metadata);
//             uploadedFiles++;
//             totalProgress = Math.round((uploadedFiles / totalFiles) * 100);
//             setUploadPercentage(totalProgress); // Update global progress
//           }

//           // Handle thumbnail upload (if applicable)
//           if (fileType === "video" && thumbnail) {
//             if (typeof thumbnail !== "string") {
//               const thumbnailKey = `thumbnail_${Date.now()}_${Math.random()
//                 .toString(36)
//                 .substr(2, 9)}.${getFileExtension(thumbnail.name)}`;
//               const thumbnailParams = {
//                 Bucket: bucket,
//                 Key: `${directory}/${thumbnailKey}`,
//                 Body: thumbnail,
//                 ContentType: thumbnail?.type,
//                 ContentDisposition: "inline",
//               };

//               const thumbnailUpload = new Upload({
//                 client: s3,
//                 leavePartsOnError: false,
//                 params: thumbnailParams,
//               });

//               thumbnailUpload.on("httpUploadProgress", (progressEvent) => {
//                 const progress = Math.round(
//                   (progressEvent.loaded / progressEvent.total) * 100
//                 );
//                 totalProgress = Math.round(
//                   ((uploadedFiles + progress / 100) / totalFiles) * 100
//                 );
//                 setUploadPercentage(totalProgress); // Update global progress
//               });

//               await thumbnailUpload.done();

//               const thumbnailUrl = `${
//                 config?.data?.post_image_url?.endsWith("/")
//                   ? config.data.post_image_url
//                   : `${config?.data?.post_image_url || imageUrl}/`
//               }${directory}/${thumbnailKey}`;
//               if (
//                 uploadedFileUrls.length > 0 &&
//                 uploadedFileUrls[0].type === "video"
//               ) {
//                 uploadedFileUrls[0].thumbnail = thumbnailUrl;
//               }
//             } else {
//               if (
//                 uploadedFileUrls.length > 0 &&
//                 uploadedFileUrls[0].type === "video"
//               ) {
//                 uploadedFileUrls[0].thumbnail = thumbnail;
//               }
//             }
//           }

//           // Handle final post submission
//           const postPayload = {
//             is_top,
//             is_recommend,
//             type: "post",
//             user_id: user_id === "custom" ? +customInput : +user_id,
//             description,
//             files: uploadedFileUrls,
//             file_type: fileType,
//             status,
//             ...(score && score !== "" && { score }), // Conditionally add score if it's not an empty string
//             ...(post && { post_id: post.id }),
//           };

//           await createPost(postPayload).unwrap();
//           setIs_recommend(0);
//           setIs_top(0);

//           setDescription("");
//           setFiles([]);
//           setThumbnail(null);
//           setPage(1);
//           refetch();
//           setEditingPost(null);
//           closeDiv(false);
//           message.success(
//             post ? "Post updated successfully." : "Post created successfully."
//           );
//           setLoading(false);
//         } catch (error) {
//           console.error("Upload failed:", error);
//           message.error("Failed to submit post. Please try again.");
//           setLoading(false);
//         }
//       } else {
//         message.error("Thumbnail and Video are required!");
//         setLoading(false);
//       }
//     }
//   } else {
//     message.error("Description is required!");
//     setLoading(false);
//   }
// };