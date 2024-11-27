import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  message,
  ConfigProvider,
  theme,
  Spin,
} from "antd";

import Navbar from "../components/Navbar";

import CreateUser from "../components/CreateUser";
import {
  useActionCreatorMutation,
  useGetCreatorsQuery,
  useGetUserInfoQuery,
} from "../services/postApi";

const User = () => {
  const [page, setPage] = useState(1);
  const [userCreate, setUserCreate] = useState(false);

  const [loading, setLoading] = useState(false);
  const { data, isLoading, isFetching, refetch } = useGetCreatorsQuery({
    page,
  });
  const [actionUser, { isLoading: isDeleting }] = useActionCreatorMutation();
  const { data: user, isLoading: isUserLoading } = useGetUserInfoQuery();

  const userData = user?.data;

  const users = data?.data?.list || [];

  const confirmDelete = (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this user?",
      okText: "Delete",
      cancelText: "Cancel",
      okButtonProps: { loading: isDeleting },
      onOk: () => handleDelete(id),
      className: "dark-modal", // Add custom class here
    });
  };

  const handleDelete = async (id) => {
    try {
      await actionUser({ user_id: id, status: 0 }).unwrap();
      refetch();
      message.success("Successfully delete this user");
    } catch (error) {
      message.error("Failed to delete this user");
    }
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Username",
      dataIndex: "username",
      key: "username",
      width: 100,
    },
    {
      title: "Nickname",
      dataIndex: "nickname",
      key: "nickname",
      width: 100,
    },
    ...(userData?.is_admin == 0
      ? []
      : [
          {
            title: "Actions",
            key: "actions",
            width: 100,
            render: (text, record) => (
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  className="action_del"
                  danger
                  onClick={() => confirmDelete(record.id)}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="20"
                    viewBox="0 0 18 20"
                    fill="none"
                  >
                    <path
                      d="M16.4666 3.46675C16.7142 3.46675 16.9516 3.56508 17.1266 3.74011C17.3016 3.91515 17.4 4.15255 17.4 4.40008C17.4 4.64762 17.3016 4.88501 17.1266 5.06005C16.9516 5.23508 16.7142 5.33341 16.4666 5.33341H15.5333L15.5305 5.39968L14.6597 17.5993C14.6262 18.0702 14.4155 18.511 14.07 18.8327C13.7244 19.1545 13.2698 19.3334 12.7977 19.3334H5.20131C4.72917 19.3334 4.27457 19.1545 3.92907 18.8327C3.58357 18.511 3.37283 18.0702 3.33931 17.5993L2.46851 5.40061C2.46709 5.37824 2.46647 5.35583 2.46664 5.33341H1.53331C1.28577 5.33341 1.04838 5.23508 0.873343 5.06005C0.698309 4.88501 0.599976 4.64762 0.599976 4.40008C0.599976 4.15255 0.698309 3.91515 0.873343 3.74011C1.04838 3.56508 1.28577 3.46675 1.53331 3.46675H16.4666ZM13.6638 5.33341H4.33611L5.20224 17.4667H12.7977L13.6638 5.33341ZM10.8666 0.666748C11.1142 0.666748 11.3516 0.765081 11.5266 0.940115C11.7016 1.11515 11.8 1.35255 11.8 1.60008C11.8 1.84762 11.7016 2.08501 11.5266 2.26005C11.3516 2.43508 11.1142 2.53341 10.8666 2.53341H7.13331C6.88577 2.53341 6.64838 2.43508 6.47334 2.26005C6.29831 2.08501 6.19998 1.84762 6.19998 1.60008C6.19998 1.35255 6.29831 1.11515 6.47334 0.940115C6.64838 0.765081 6.88577 0.666748 7.13331 0.666748H10.8666Z"
                      fill="#F54100"
                    />
                  </svg>
                </Button>
              </div>
            ),
          },
        ]),
  ];

  if (isUserLoading) {
    return <div></div>;
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
      <div style={{ padding: 20 }} className="container mx-auto">
        <Navbar status={true} />
        {userData?.is_admin === 1 && (
          <div
            style={{
              display: "flex",
              alignItems: "center",

              marginBottom: 10,
              marginTop: 20,
            }}
          >
            <Button
              type="primary"
              className="add-btn"
              onClick={() => {
                setUserCreate(true);
              }}
              style={{ marginRight: 20 }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
              >
                <path
                  d="M1 6.85007H13M7.15021 1L7.15021 13"
                  stroke="white"
                  stroke-width="2"
                  stroke-linecap="round"
                />
              </svg>
              Create User
            </Button>
          </div>
        )}

        <div style={{ overflowX: "auto" }}>
          <Table
            columns={columns}
            dataSource={users || []}
            loading={isFetching || isLoading}
            rowKey="id"
            pagination={{
              current: data?.data?.page,
              total: data?.data?.total,
              pageSize: data?.data?.pageSize,
              onChange: (page) => setPage(page),
              showSizeChanger: false,
            }}
            scroll={{ x: 600 }}
          />
        </div>

        <Modal
          title={"Create User"}
          visible={userCreate}
          onCancel={() => setUserCreate(false)}
          closable={!loading} // Disable close button while loading
          maskClosable={!loading}
          footer={null}
        >
          <Spin spinning={loading}>
            <div
              style={{
                pointerEvents: loading ? "none" : "auto",
                opacity: loading ? 0.5 : 1,
              }}
            >
              <CreateUser
                refetch={refetch}
                onClose={() => {
                  setUserCreate(false);
                }}
                closeDiv={() => {
                  setUserCreate(false);
                }}
                setLoading={setLoading}
                loading={loading}
                isVisible={userCreate} // New prop to trigger reset on modal open
              />
            </div>
          </Spin>
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default User;
