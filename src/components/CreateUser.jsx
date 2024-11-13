import React, { useState } from "react";

import { message, Button, Input } from "antd";
import { useActionCreatorMutation } from "../services/postApi";

const CreateUser = ({ setLoading, loading, refetch, closeDiv }) => {
  const [user_id, setUserId] = useState("");
  const [createUser] = useActionCreatorMutation();

  const handleSubmit = async () => {
    setLoading(true);
    if (user_id) {
      try {
        await createUser({ user_id, status: 1 }).unwrap();
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
      message.error("User Id is required!");
      setLoading(false);
    }
  };

  return (
    <div>
      <Input
        type="text"
        placeholder="Enter UserId"
        className="w-full p-2 my-5 bg-transparent des"
        onChange={(e) => setUserId(e.target.value)}
        value={user_id}
      />

      <div className="flex justify-between items-center">
        <div></div>
        <Button
          onClick={handleSubmit}
          className={`mt-2 ${loading ? "hover:bg-transparent" : "save"}`}
          type="primary"
          disabled={loading}
        >
          {loading ? "Loading..." : "Create User"}
        </Button>
      </div>
    </div>
  );
};

export default CreateUser;
