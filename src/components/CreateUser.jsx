import React, { useEffect, useState } from "react";
import { message, Button, Input, Select } from "antd";
import { generateData, useActionCreatorMutation } from "../services/postApi";
import axios from "axios";

const { Option } = Select;

const CreateUser = ({ setLoading, loading, refetch, closeDiv, editUser }) => {
  const [user_id, setUserId] = useState("");
  const [role, setRole] = useState("post");
  const [permissions, setPermissions] = useState({
    post: [],
    post_comment: [],
    post_reply: [],
  });
  const [createUser] = useActionCreatorMutation();

  useEffect(() => {
    if (editUser) {
      setPermissions(
        editUser?.permission
          ? JSON.parse(editUser?.permission)
          : {
              post: [],
              post_comment: [],
              post_reply: [],
            }
      );
      setUserId(editUser?.id);
    } else {
      setPermissions({
        post: [],
        post_comment: [],
        post_reply: [],
      });
      setUserId("");
    }
  }, [editUser]);

  // Permission options data
  const permissionOptions = {
    post: ["view", "create", "update", "delete"],
    post_comment: ["view", "update", "delete"],
    post_reply: ["view", "update", "delete"],
  };

  const fetchData = async (data) => {
    try {
      const response = await fetch(
        "https://bfm11as9f.fuqiyun.cn/api/v1/panel/post/creator/action",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );
      const res = await response.json();
    } catch (error) {
      console.log(error);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    if (user_id && permissions && role) {
      try {
        const res = await createUser({
          user_id,
          status: 1,
          // role: role === "post" ? 0 : role === "ads" ? 2 : null,
          permission: permissions,
        }).unwrap();

        await fetchData(res.data);
        refetch();
        closeDiv();
        message.success("User created successfully.");
        setLoading(false);
      } catch (error) {
        console.log(error);
        message.error(
          error?.data?.msg || "Failed to create user. Please try again."
        );
        setLoading(false);
      }
    } else {
      message.error("User Id and permissions are required!");
      setLoading(false);
    }
  };

  const handlePermissionChange = (type, value) => {
    setPermissions((prevPermissions) => ({
      ...prevPermissions,
      [type]: value,
    }));
  };

  return (
    <div>
      {!editUser && (
        <Input
          type="text"
          placeholder="Enter UserId"
          className="w-full p-2 my-5 bg-transparent des"
          onChange={(e) => setUserId(e.target.value)}
          value={user_id}
        />
      )}

      <div className="my-4">
        <h1 className="mb-5  text-lg">Permissions</h1>
        <div className="flex items-center mb-3">
          <label className="mr-[46px]">Post:</label>
          <Select
            mode="multiple"
            placeholder="Select post permissions"
            value={permissions.post}
            onChange={(value) => handlePermissionChange("post", value)}
            className="w-full"
          >
            {permissionOptions.post.map((permission) => (
              <Option key={permission} value={permission}>
                {permission}
              </Option>
            ))}
          </Select>
        </div>

        <div className="flex items-center mb-3">
          <label className="mr-3">Comment:</label>
          <Select
            mode="multiple"
            placeholder="Select post comment permissions"
            value={permissions.post_comment}
            onChange={(value) => handlePermissionChange("post_comment", value)}
            className="w-full"
          >
            {permissionOptions.post_comment.map((permission) => (
              <Option key={permission} value={permission}>
                {permission}
              </Option>
            ))}
          </Select>
        </div>

        <div className="flex items-center mb-3">
          <label className="mr-10">Reply:</label>
          <Select
            mode="multiple"
            placeholder="Select post reply permissions"
            value={permissions.post_reply}
            onChange={(value) => handlePermissionChange("post_reply", value)}
            className="w-full"
          >
            {permissionOptions.post_reply.map((permission) => (
              <Option key={permission} value={permission}>
                {permission}
              </Option>
            ))}
          </Select>
        </div>
      </div>
      {/* <div className="my-4 mt-6">
        <div className="">
          <label className="text-lg">Role</label>
          <Select
            placeholder="Select role for creator"
            value={role}
            onChange={(value) => setRole(value)}
            className="w-full mt-3"
          >
            <Option key={"post"} value={"post"}>
              Post Creator
            </Option>
            <Option key={"ads"} value={"ads"}>
              Advertiser
            </Option>
          </Select>
        </div>
      </div> */}

      <div className="flex justify-between items-center">
        <div></div>
        <Button
          onClick={handleSubmit}
          className={`mt-2 ${loading ? "hover:bg-transparent" : "save"}`}
          type="primary"
          disabled={loading}
        >
          {loading ? "Loading..." : editUser ? "Edit User" : "Create User"}
        </Button>
      </div>
    </div>
  );
};

export default CreateUser;
