import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import { Button, ConfigProvider, Input, theme, message, Spin } from "antd";
import {
  useGetConfigQuery,
  useGetUserInfoQuery,
  useUpdateDomainMutation,
} from "../services/postApi";
import { useNavigate } from "react-router-dom";

const Setting = () => {
  const { data: user, isLoading } = useGetUserInfoQuery({});
  const { data: config, isLoading: loadConfig } = useGetConfigQuery();
  const [publicUrl, setPublicUrl] = useState(config?.data?.post_public_url);
  const [imageUrl, setImageUrl] = useState(config?.data?.post_image_url);
  const [loading, setLoading] = useState(false);
  const [updateDomain] = useUpdateDomainMutation();
  const userData = user?.data;

  const is_admin = userData?.is_admin;
  const navigate = useNavigate();

  useEffect(() => {
    if (config?.data?.post_public_url) {
      setPublicUrl(config?.data?.post_public_url);
    }
  }, [config?.data?.post_public_url]);

  useEffect(() => {
    if (config?.data?.post_image_url) {
      setImageUrl(config?.data?.post_image_url);
    }
  }, [config?.data?.post_image_url]);

  useEffect(() => {
    if (is_admin === 0) {
      // Redirect to login if token is missing
      navigate("/", { replace: true });
    }
  }, [is_admin, navigate]);

  const handleSubmit = async () => {
    setLoading(true);
    if (publicUrl.length > 0 || imageUrl?.length > 0) {
      try {
        const data = {
          post_image_url: imageUrl,
          post_public_url: publicUrl,
        };
        await updateDomain(data).unwrap();
        message.success("Domain url updated successfully.");
        // setImageUrl("");
        // setPublicUrl("");
        setLoading(false);
      } catch (error) {
        console.error("Update failed:", error);
        message.error("Failed to submit post. Please try again.");
        setLoading(false);
      }
    } else {
      message.error("Input should not be empty");
      setLoading(false);
    }
  };

  if (isLoading || loadConfig) {
    return <Spin fullscreen />;
  }

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#323235",
        },
      }}
    >
      {is_admin !== 0 && (
        <div style={{ padding: 20 }} className="container mx-auto">
          <Navbar status={true} />
          <div className="text-white">
            <h1 className="text-2xl mb-10">Update domain Url</h1>

            <div className="mt-2">
              <div>
                <label className="mr-2">Public Url:</label>
                <Input
                  value={publicUrl}
                  placeholder="Enter publicUrl"
                  className="mb-3 w-[300px]"
                  onChange={(e) => setPublicUrl(e.target.value)}
                />
              </div>
              <div>
                <label className="mr-2">Image Url:</label>
                <Input
                  value={imageUrl}
                  placeholder="Enter imageUrl"
                  className="mb-3 w-[300px]"
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
              <div>
                <Button
                  onClick={handleSubmit}
                  className={`mt-2 `}
                  type="primary"
                  disabled={loading}
                >
                  Update Domain Url
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ConfigProvider>
  );
};

export default Setting;
