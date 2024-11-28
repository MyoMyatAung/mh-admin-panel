import React, { useEffect, useState } from "react";
import { message, Button, Input, Select } from "antd";
import { useActionCreatorMutation } from "../services/postApi";

const { Option } = Select;

const CreateUser = ({ setLoading, loading, refetch, closeDiv, editUser }) => {
  const [user_id, setUserId] = useState("");
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

  const handleSubmit = async () => {
    setLoading(true);
    if (user_id && permissions) {
      try {
        await createUser({
          user_id,
          status: 1,
          permission: permissions,
        }).unwrap();
        refetch();
        closeDiv();
        message.success("User created successfully.");
        setLoading(false);
      } catch (error) {
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
