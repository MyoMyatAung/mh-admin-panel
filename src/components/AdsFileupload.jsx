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

const { Option } = Select;

const AdsFileupload = ({
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
}) => {
  // const [files, setFiles] = useState([]);

  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("published"); // Track if we're uploading images or videos
  const [score, setScore] = useState(""); // Track if we're uploading images or videos
  const [is_recommend, setIs_recommend] = useState(0); // Track if we're uploading images or videos
  const [is_top, setIs_top] = useState(0); // Track if we're uploading images or videos
  const [createPost] = useCreatePostMutation();
  const { data: userData, isLoading: isUserLoading } =
    useGetUserInfoQuery(undefined);
  const [user_id, setUserId] = useState("");
  const { data, isLoading: isUsersLoading } = useAllgetCreatorsQuery({
    role: 2,
  });

  const { data: config } = useGetConfigQuery();

  const users = data?.data?.list || [];

  const [customStatus, setCustomStatus] = useState(false);
  const [customInput, setCustomInput] = useState(""); // State to hold the custom user ID input
  const [adsTitle, setAdsTitle] = useState("");
  const [adsDescription, setAdsDescription] = useState("");
  const [adsprofileText, setAdsProfileText] = useState("");
  const [adsjumpurl, setAdsJumpurl] = useState("");
  const [iosadsjumpurl, setIosAdsJumpurl] = useState("");
  const [adsBtntext, setAdsBtntext] = useState("");
  const [adsIconUrl, setAdsIconUrl] = useState("");
  const [selectedIconFile, setSelectedIconFile] = useState(null);
  const [iconLoading, setIconLoading] = useState(false);

  const getFileSuffix = (filePath) => {
    const parts = filePath.split(".");
    return parts.length > 1 ? parts[parts.length - 1] : ""; // Get the last part after the dot
  };
  const uploadIcon = async (file) => {
    setIconLoading(true);
    try {
      const response = await axios.get(
        "http://movie_upload_api.qdhgtch.com:5343/uploadv2.php"
        // "http://movie_upload_v2.qdhgtch.com:5343/uploadv2.php"
      );
      const {
        accessKeyId,
        secretAccessKey,
        sessionToken,
        region,
        bucket,
        directory,
        imageUrl,
      } = response.data;

      // Create an S3 client
      const s3 = new S3Client({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
          sessionToken,
        },
      });

      const suffix = getFileSuffix(file.name || file.path);

      const key = `image_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}.${suffix}`;

      const fileContent = file;
      const contentType = "image";

      const uploadParams = {
        Bucket: bucket,
        Key: `${directory}/${key}`,
        Body: fileContent,
        ContentType: contentType,
        ContentDisposition: "inline",
      };

      // Use @aws-sdk/lib-storage for large file uploads with progress
      const upload = new Upload({
        client: s3,
        leavePartsOnError: false,
        params: uploadParams,
      });

      // Wait for upload to finish
      await upload.done();

      // let resourceURL = `${
      //   config?.data?.post_image_url ? config.data.post_image_url : imageUrl
      // }${directory}/${key}`;
      let resourceURL = `/${directory}/${key}`;
      setIconLoading(false);
      return resourceURL;
    } catch {
      setIconLoading(false);
    }
  };

  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedIconFile(file); // Update state with the selected file
  };

  const handleIconUrl = async () => {
    if (selectedIconFile) {
      const result = await uploadIcon(selectedIconFile);
      setAdsIconUrl(result);
      setSelectedIconFile(null);
    } else {
      console.log("No file selected");
    }
  };

  useEffect(() => {
    if (!post && userData) {
      setUserId(userData?.data.user_id);
    }
  }, [userData, post]);

  useEffect(() => {
    if (post && users) {
      const ads_info = JSON.parse(post?.ads_info);
      setDescription(post.description || "");
      setAdsDescription(ads_info?.description || "");
      setAdsTitle(ads_info?.title || "");
      setAdsProfileText(ads_info?.profile_text || "");
      setAdsIconUrl(ads_info?.icon || "");
      setAdsJumpurl(ads_info?.jump_url || "");
      setIosAdsJumpurl(ads_info?.ios_jump_url || "");
      setAdsBtntext(ads_info?.btn_text || "");
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
      console.log(parsedFiles);

      if (parsedFiles.length > 0) {
        setFiles(
          parsedFiles.filter(
            (file) =>
              file.type === "video" ||
              file.type === "image" ||
              file.type === "gif"
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
      setAdsDescription("");
      setAdsTitle("");
      setAdsProfileText("");
      setAdsIconUrl("");
      setAdsJumpurl("");
      setIosAdsJumpurl("");
      setAdsBtntext("");

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

  // console.log(config?.data?.post_image_url);
  // console.log(config?.data?.post_image_url?.endsWith("/"));

  const getFileExtension = (filename) => {
    return filename.split(".").pop();
  };

  const handleSubmit = async () => {
    setLoading(true);
    setUploadPercentage(0);

    if (
      description &&
      adsBtntext &&
      adsDescription &&
      adsIconUrl &&
      adsTitle &&
      adsjumpurl &&
      iosadsjumpurl
    ) {
      if (fileType === "text") {
        try {
          // Handle final post submission
          const postPayload = {
            is_top,
            is_recommend,
            user_id: user_id === "custom" ? +customInput : +user_id,
            description,
            files: [],
            type: "ads",
            ads_info: {
              icon: adsIconUrl,
              title: adsTitle,
              description: adsDescription,
              jump_url: adsjumpurl,
              ios_jump_url: iosadsjumpurl,
              btn_text: adsBtntext,
              profile_text: adsprofileText,
            },
            file_type: fileType,
            status,
            ...(score && score !== "" && { score }), // Conditionally add score if it's not an empty string
            ...(post && { post_id: post.id }),
          };
          setUploadPercentage(100);

          await createPost(postPayload).unwrap();
          setIs_recommend(0);
          setIs_top(0);
          setAdsDescription("");
          setAdsBtntext("");
          setAdsIconUrl("");
          setAdsJumpurl("");
          setIosAdsJumpurl("");
          setAdsTitle("");
          setAdsProfileText("");

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
          console.error("Upload failed:", error);
          message.error("Failed to submit post. Please try again.");
          setLoading(false);
        }
      } else {
        if (
          fileType === "image" ||
          fileType === "gif" ||
          (fileType === "video" && thumbnail)
        ) {
          try {
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

            // Create an S3 client
            const s3 = new S3Client({
              region,
              credentials: {
                accessKeyId,
                secretAccessKey,
                sessionToken,
              },
            });

            const uploadedFileUrls = [];
            let totalFiles = files.length;
            let uploadedFiles = 0;
            let totalProgress = 0;

            // Iterate over files and upload
            for (const file of files) {
              if (file?.resourceURL) {
                uploadedFileUrls.push(file);
                uploadedFiles++;
                totalProgress = Math.round((uploadedFiles / totalFiles) * 100);
                setUploadPercentage(totalProgress);
                continue; // Skip upload for already uploaded files
              }

              const isImage = fileType === "image" || fileType === "gif";
              const key = isImage
                ? `image_${Date.now()}_${Math.random()
                    .toString(36)
                    .substr(2, 9)}.${file.suffix}`
                : `video_${Date.now()}_${Math.random()
                    .toString(36)
                    .substr(2, 9)}.${file.suffix}`;
              const fileContent = file.image || file.video;
              const contentType = isImage ? file.image?.type : file.video?.type;

              const uploadParams = {
                Bucket: bucket,
                Key: `${directory}/${key}`,
                Body: fileContent,
                ContentType: contentType,
                ContentDisposition: "inline",
              };

              // Use @aws-sdk/lib-storage for large file uploads with progress
              const upload = new Upload({
                client: s3,
                leavePartsOnError: false,
                params: uploadParams,
              });

              // Track upload progress
              upload.on("httpUploadProgress", (progressEvent) => {
                const progress = Math.round(
                  (progressEvent.loaded / progressEvent.total) * 100
                );
                totalProgress = Math.round(
                  ((uploadedFiles + progress / 100) / totalFiles) * 100
                );
                setUploadPercentage(totalProgress); // Update global progress
              });

              // Wait for upload to finish
              await upload.done();
              let metadata;

              if (isImage) {
                metadata = {
                  resourceURL: `/${directory}/${key}`,
                  // resourceURL: `${
                  //   config?.data?.post_image_url
                  //     ? config.data.post_image_url
                  //     : imageUrl
                  // }${directory}/${key}`,
                  // resourceURL: `${
                  //   config?.data?.post_image_url
                  //     ? config.data.post_image_url.endsWith("/")
                  //       ? config.data.post_image_url
                  //       : `${config.data.post_image_url}/`
                  //     : imageUrl.endsWith("/")
                  //     ? imageUrl
                  //     : `${imageUrl}/`
                  // }${directory}/${key}`,

                  size: file?.size.toString(),
                  height: file?.height || "",
                  width: file?.width || "",
                  suffix: file?.suffix,
                  type: isImage ? fileType : "video",
                };
              } else {
                metadata = {
                  // resourceURL: `${
                  //   config?.data?.post_public_url
                  //     ? config.data.post_public_url
                  //     : publicUrl
                  // }${directory}/${key}`,
                  resourceURL: `/${directory}/${key}`,
                  // resourceURL: `${
                  //   config?.data?.post_public_url
                  //     ? config.data.post_public_url.endsWith("/")
                  //       ? config.data.post_public_url
                  //       : `${config.data.post_public_url}/`
                  //     : publicUrl.endsWith("/")
                  //     ? publicUrl
                  //     : `${publicUrl}/`
                  // }${directory}/${key}`,
                  // resourceURL: `${
                  //   config?.data?.post_public_url?.endsWith("/")
                  //     ? config.data.post_public_url
                  //     : `${config?.data?.post_public_url || publicUrl}/`
                  // }${directory}/${key}`,

                  size: file?.size.toString(),
                  height: file?.height || "",
                  width: file?.width || "",
                  suffix: file?.suffix,
                  type: isImage ? "image" : "video",
                };
              }

              uploadedFileUrls.push(metadata);
              uploadedFiles++;
              totalProgress = Math.round((uploadedFiles / totalFiles) * 100);
              setUploadPercentage(totalProgress); // Update global progress
            }

            // Handle thumbnail upload (if applicable)
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

                const thumbnailUpload = new Upload({
                  client: s3,
                  leavePartsOnError: false,
                  params: thumbnailParams,
                });

                thumbnailUpload.on("httpUploadProgress", (progressEvent) => {
                  const progress = Math.round(
                    (progressEvent.loaded / progressEvent.total) * 100
                  );
                  totalProgress = Math.round(
                    ((uploadedFiles + progress / 100) / totalFiles) * 100
                  );
                  setUploadPercentage(totalProgress); // Update global progress
                });

                await thumbnailUpload.done();
                // const thumbnailUrl = `${
                //   config?.data?.post_image_url
                //     ? config.data.post_image_url
                //     : imageUrl
                // }${directory}/${thumbnailKey}`;
                const thumbnailUrl = `/${directory}/${thumbnailKey}`;

                // const thumbnailUrl = `${
                //   config?.data?.post_image_url
                //     ? config.data.post_image_url.endsWith("/")
                //       ? config.data.post_image_url
                //       : `${config.data.post_image_url}/`
                //     : imageUrl.endsWith("/")
                //     ? imageUrl
                //     : `${imageUrl}/`
                // }${directory}/${thumbnailKey}`;

                // const thumbnailUrl = `${
                //   config?.data?.post_image_url?.endsWith("/")
                //     ? config.data.post_image_url
                //     : `${config?.data?.post_image_url || imageUrl}/`
                // }${directory}/${thumbnailKey}`;
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
              }
            }

            // Handle final post submission
            const postPayload = {
              is_top,
              is_recommend,
              user_id: user_id === "custom" ? +customInput : +user_id,
              description,
              type: "ads",
              files: uploadedFileUrls,
              ads_info: {
                icon: adsIconUrl,
                title: adsTitle,
                description: adsDescription,
                jump_url: adsjumpurl,
                ios_jump_url: iosadsjumpurl,
                btn_text: adsBtntext,
                profile_text: adsprofileText,
              },
              file_type: fileType,
              status,
              ...(score && score !== "" && { score }), // Conditionally add score if it's not an empty string
              ...(post && { post_id: post.id }),
            };
            console.log(postPayload);
            await createPost(postPayload).unwrap();
            setIs_recommend(0);
            setIs_top(0);
            setAdsDescription("");
            setAdsBtntext("");
            setAdsIconUrl("");
            setAdsJumpurl("");
            setIosAdsJumpurl("");
            setAdsTitle("");
            setAdsProfileText("");
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
            console.error("Upload failed:", error);
            message.error("Failed to submit post. Please try again.");
            setLoading(false);
          }
        } else {
          message.error("Thumbnail and Video are required!");
          setLoading(false);
        }
      }
    } else {
      message.error("Input fields are required!");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user_id === "custom") {
      setCustomStatus(true);
      setCustomInput(""); // Reset the custom input field when "custom" is selected
    } else {
      setCustomStatus(false);
    }
  }, [user_id]);

  const handleInputChange = (e) => {
    setCustomInput(e.target.value); // Update the custom user ID input
  };

  return (
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
        <Option value="text">Text</Option>
        <Option value="gif">Gif</Option>
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

      <br />
      <div>
        <h1>Ads Fields</h1>
        <Input
          className="w-[200px] my-2 mr-2"
          placeholder="Enter Ads icon"
          value={adsIconUrl} // If it's "custom", clear the input
          onChange={(e) => setAdsIconUrl(e.target.value)}
        />

        <input type="file" className="my-2 mr-2" onChange={handleFileChange} />
        <Button
          className="p-2 my-2 save px-4 mr-2"
          type="primary"
          disabled={iconLoading}
          onClick={handleIconUrl}
        >
          {iconLoading ? "loading..." : "Upload icon image"}
        </Button>
        <br />
        <Input
          className="w-[200px] my-2 mr-2"
          placeholder="Enter Ads title"
          value={adsTitle} // If it's "custom", clear the input
          onChange={(e) => setAdsTitle(e.target.value)}
        />
        <Input
          className="w-[200px] my-2 mr-2"
          placeholder="Enter Ads description"
          value={adsDescription} // If it's "custom", clear the input
          onChange={(e) => setAdsDescription(e.target.value)}
        />
        <Input
          className="w-[200px] my-2 mr-2"
          placeholder="Enter Ads jump_url"
          value={adsjumpurl} // If it's "custom", clear the input
          onChange={(e) => setAdsJumpurl(e.target.value)}
        />
        <Input
          className="w-[200px] my-2 mr-2"
          placeholder="Enter Ads ios_jump_url"
          value={iosadsjumpurl} // If it's "custom", clear the input
          onChange={(e) => setIosAdsJumpurl(e.target.value)}
        />
        <Input
          className="w-[200px] my-2 mr-2"
          placeholder="Enter Ads btn_text"
          value={adsBtntext} // If it's "custom", clear the input
          onChange={(e) => setAdsBtntext(e.target.value)}
        />
        <Input
          className="w-[200px] my-2 mr-2"
          placeholder="Enter Ads profile_text"
          value={adsprofileText} // If it's "custom", clear the input
          onChange={(e) => setAdsProfileText(e.target.value)}
        />
      </div>

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
          {loading ? "Loading..." : post ? "Update Ads" : "Save Ads"}
        </Button>
      </div>
    </>
  );
};

export default AdsFileupload;
