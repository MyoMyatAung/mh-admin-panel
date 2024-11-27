import React, { useState } from "react";
import {
  Table,
  Button,
  Modal,
  message,
  ConfigProvider,
  theme,
  Spin,
  Tag,
  Select,
  Input,
} from "antd";

import Navbar from "../components/Navbar";

import {
  useDeleteCommentMutation,
  useGetCommentListQuery,
  useGetReplyListQuery,
  useGetUserInfoQuery,
  useUpdateCommentMutation,
} from "../services/postApi";
import { useParams } from "react-router-dom";

const { Option } = Select;
const { Search } = Input;
const Comment = () => {
  const { id } = useParams();
  const [type, setType] = useState("content");
  const [typeReply, setTypeReply] = useState("content");

  const [page, setPage] = useState(1);
  const [query, setQuery] = useState(""); // State for selected rows for comments
  const [queryReply, setQueryReply] = useState(""); // State for selected rows for comments
  const [pageReply, setPageReply] = useState(1);

  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false); // Modal for bulk edit comments/replies
  const [selectedCommentId, setSelectedCommentId] = useState(null);

  const [selectedRowKeys, setSelectedRowKeys] = useState([]); // State for selected rows for comments
  const [selectedReplyRowKeys, setSelectedReplyRowKeys] = useState([]); // State for selected rows for replies

  const [selectedStatus, setSelectedStatus] = useState(1); // Status for bulk edit
  const [editTarget, setEditTarget] = useState("comments"); // 'comments' or 'replies'

  const [deleteComment, { isLoading: isDeleting }] = useDeleteCommentMutation();
  const {
    data: res,
    refetch,
    isFetching,
    isLoading,
  } = useGetCommentListQuery({ page, id, q: query, type });
  const {
    data: replies,
    isFetching: isFetchingReplies,
    refetch: refetchReplies,
  } = useGetReplyListQuery(
    { pageReply, selectedCommentId, q: queryReply, type: typeReply },
    {
      skip: !selectedCommentId,
    }
  );
  const [updateComment, { isLoading: isUpdating }] = useUpdateCommentMutation();
  const { data: user, isLoading: isUserLoading } = useGetUserInfoQuery();

  const userData = user?.data;
  const permission = userData?.permission
    ? JSON.parse(userData?.permission)
    : {};
  const is_admin = userData?.is_admin;

  const comments = res?.data.list;

  const confirmDelete = (ids, isReply = 0) => {
    Modal.confirm({
      title: `Are you sure you want to delete the selected ${
        isReply ? "replies" : "comments"
      }?`,
      okText: "Delete",
      cancelText: "Cancel",
      loading: isDeleting,

      onOk: () => handleDelete(ids, isReply),
      className: "dark-modal",
    });
  };

  const handleEdit = (record, isReply = 0) => {
    Modal.confirm({
      title: `Are you sure you want to change status to ${
        record?.status === 1 ? "Pending" : "Approved"
      } for this ${isReply ? "reply" : "comment"}?`,
      okText: "Change",
      cancelText: "Cancel",
      loading: isUpdating,
      onOk: () => handleEditConfirmOne(record, isReply),
      className: "dark-modal",
    });
  };

  const handleEditConfirmOne = async (record, isReply = 0) => {
    try {
      await updateComment({
        ids: [record?.id],
        is_reply: isReply,
        status: record?.status === 1 ? 0 : 1,
      }).unwrap();
      isReply ? refetchReplies() : refetch();
      message.success(
        `Successfully updated the ${isReply ? "reply" : "comment"}`
      );
    } catch (error) {
      message.error(`Failed to update the ${isReply ? "reply" : "comment"}`);
    }
  };

  const handleBulkEdit = async () => {
    const target =
      editTarget === "comments" ? selectedRowKeys : selectedReplyRowKeys;
    const isReply = editTarget === "replies" ? 1 : 0;

    try {
      await updateComment({
        ids: target,
        is_reply: isReply,
        status: selectedStatus,
      }).unwrap();
      isReply ? refetchReplies() : refetch();
      message.success(
        `Successfully updated the selected ${isReply ? "replies" : "comments"}`
      );
      setEditModalVisible(false);
    } catch (error) {
      message.error(
        `Failed to update the selected ${isReply ? "replies" : "comments"}`
      );
    }
  };

  const handleDelete = async (ids, isReply = 0) => {
    try {
      await deleteComment({ ids, is_reply: isReply }).unwrap();
      isReply ? refetchReplies() : refetch();
      // Remove deleted IDs from the selected keys
      if (isReply) {
        setSelectedReplyRowKeys((prevKeys) =>
          prevKeys.filter((key) => !ids.includes(key))
        );
      } else {
        setSelectedRowKeys((prevKeys) =>
          prevKeys.filter((key) => !ids.includes(key))
        );
      }
      message.success(
        `Successfully deleted the selected ${isReply ? "replies" : "comments"}`
      );
    } catch (error) {
      message.error(
        `Failed to delete the selected ${isReply ? "replies" : "comments"}`
      );
    }
  };

  const getStatusTag = (status) => {
    switch (status) {
      case 1:
        return <Tag color="green">Approved</Tag>;
      case 0:
        return <Tag color="gold">Pending</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const handleViewReplies = (commentId) => {
    setSelectedCommentId(commentId);
    setReplyModalVisible(true);
  };

  const onSearch = (value, _e) => {
    setQuery(value);
    setPage(1);
  };
  const onSearchReply = (value, _e) => {
    setQueryReply(value);
    setPageReply(1);
  };

  const columns = [
    {
      title: "Message Id",
      dataIndex: "id",
      key: "id",
      width: 200,
    },
    {
      title: "Comment",
      dataIndex: "content",
      key: "content",
      render: (text) => (
        <div
          className="description-column"
          style={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: "User_id",
      dataIndex: "user_id",
      key: "user_id",
      width: 80,
    },
    {
      title: "Nickname",
      dataIndex: "nickname",
      key: "nickname",
      width: 120,
    },
    {
      title: "Create_time",
      dataIndex: "create_time",
      key: "create_time",
      width: 80,
    },

    ...(is_admin == 1 || permission?.post_reply?.includes("view")
      ? [
          {
            title: "Reply",
            key: "reply",
            width: 100,
            render: (record) => (
              <button
                type="link"
                className="block"
                onClick={() => handleViewReplies(record.id)}
                style={{
                  textDecoration: "underline",
                  color: "#1890ff",
                }}
              >
                Replies
              </button>
            ),
          },
        ]
      : []),

    {
      title: "Status",
      key: "status",
      width: 100,
      render: (data) => getStatusTag(data?.status),
    },
    ...(is_admin == 1 ||
    permission?.post_comment?.includes("update") ||
    permission?.post_comment?.includes("delete")
      ? [
          {
            title: "Actions",
            key: "actions",
            width: 100,
            render: (text, record) => (
              <div className="flex items-center gap-2">
                {(is_admin == 1 ||
                  permission?.post_comment?.includes("update")) && (
                  <Button
                    type="button"
                    className="action_edit"
                    onClick={() => handleEdit(record)}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="18"
                      height="18"
                      viewBox="0 0 18 18"
                      fill="none"
                    >
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M13.0579 8.19176L14.2851 6.5569C14.8931 5.7469 15.1491 4.74889 15.0061 3.74589C14.8631 2.74289 14.3391 1.85689 13.5291 1.24889C11.8581 -0.00510502 9.47614 0.331895 8.22114 2.00489L1.46913 10.9999C-0.542874 13.6829 1.24713 16.8789 1.32413 17.0139C1.42813 17.1949 1.60313 17.3239 1.80713 17.3709C1.86513 17.3849 2.42513 17.5089 3.20613 17.5089C4.46913 17.5089 6.30713 17.1859 7.53314 15.5519L12.9017 8.39987C12.9329 8.37056 12.962 8.33806 12.9886 8.30266C13.0153 8.26716 13.0384 8.23006 13.0579 8.19176ZM2.47713 15.9619C3.25813 16.0569 5.22813 16.1239 6.33313 14.6509L11.3292 7.99506L7.66454 5.24362L2.66813 11.8999C1.54113 13.4039 2.16113 15.2449 2.47713 15.9619ZM8.56474 4.04449L12.2299 6.79517L13.0851 5.6559C13.8441 4.6459 13.6391 3.20689 12.6291 2.44789C11.6181 1.69089 10.1781 1.89589 9.42014 2.90489L8.56474 4.04449Z"
                        fill="#8AC1FF"
                      />
                      <path
                        d="M16.733 17.2471H10.356C9.94196 17.2471 9.60596 16.9111 9.60596 16.4971C9.60596 16.0831 9.94196 15.7471 10.356 15.7471H16.733C17.147 15.7471 17.483 16.0831 17.483 16.4971C17.483 16.9111 17.147 17.2471 16.733 17.2471Z"
                        fill="#8AC1FF"
                      />
                    </svg>
                  </Button>
                )}
                {(is_admin == 1 ||
                  permission?.post_comment?.includes("delete")) && (
                  <Button
                    type="button"
                    className="action_del"
                    danger
                    onClick={() => confirmDelete([record.id])}
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
                )}
              </div>
            ),
          },
        ]
      : []),
  ];

  const rowSelectionComments = {
    selectedRowKeys,
    onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys),
  };

  const rowSelectionReplies = {
    selectedRowKeys: selectedReplyRowKeys,
    onChange: (selectedKeys) => setSelectedReplyRowKeys(selectedKeys),
  };
  const handleTypeChange = (value) => {
    setType(value);
  };
  const handleTypeReplyChange = (value) => {
    setTypeReply(value);
  };

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

        {is_admin === 1 || permission?.post_comment?.includes("view") ? (
          <>
            <div
              style={{}}
              className="max-md:flex-col max-md:flex-wrap max-md:items-start flex justify-between items-center "
            >
              <div>
                {/* Bulk Actions for Comments */}
                {selectedRowKeys.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    {(is_admin === 1 ||
                      permission?.post_comment?.includes("update")) && (
                      <Button
                        type="primary"
                        onClick={() => {
                          setEditTarget("comments");
                          setEditModalVisible(true);
                        }}
                        style={{ marginRight: 8 }}
                      >
                        Edit Selected
                      </Button>
                    )}
                    {(is_admin === 1 ||
                      permission?.post_comment?.includes("delete")) && (
                      <Button
                        danger
                        onClick={() => confirmDelete(selectedRowKeys)}
                        loading={isDeleting}
                      >
                        Delete Selected
                      </Button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-center max-md:flex-col">
                <Select
                  className="select-pub mb-3"
                  defaultValue="content"
                  value={type}
                  // size="large"
                  onChange={handleTypeChange}
                  style={{ width: 120, marginRight: 10 }}
                >
                  <Option value="content">Content</Option>
                  <Option value="userid">UserId</Option>
                </Select>
                <Search
                  onSearch={onSearch}
                  placeholder="Search comments"
                  className="max-md:w-[280px] w-[300px] mb-3"
                />
              </div>
            </div>

            <div style={{ overflowX: "auto" }}>
              <Table
                rowSelection={
                  is_admin === 1 ||
                  permission?.post_comment.includes("update") ||
                  permission?.post_comment?.includes("delete")
                    ? rowSelectionComments
                    : ""
                }
                columns={columns}
                dataSource={comments || []}
                loading={isFetching || isLoading}
                rowKey="id"
                pagination={{
                  current: res?.data?.page,
                  total: res?.data?.total,
                  pageSize: res?.data?.pageSize,
                  onChange: (page) => setPage(page),
                  showSizeChanger: false,
                }}
                scroll={{ x: 600 }}
              />
            </div>

            {/* Reply List Modal */}
            <Modal
              title="Replies"
              visible={replyModalVisible}
              onCancel={() => {
                setReplyModalVisible(false);
                setSelectedReplyRowKeys([]);
              }}
              footer={
                selectedReplyRowKeys.length > 0 && (
                  <>
                    {(is_admin === 1 ||
                      permission?.post_reply?.includes("update")) && (
                      <Button
                        type="primary"
                        onClick={() => {
                          setEditTarget("replies");
                          setEditModalVisible(true);
                        }}
                        style={{ marginRight: 8 }}
                      >
                        Edit Selected
                      </Button>
                    )}
                    {(is_admin === 1 ||
                      permission?.post_reply?.includes("delete")) && (
                      <Button
                        danger
                        onClick={() => confirmDelete(selectedReplyRowKeys, 1)}
                        loading={isDeleting}
                      >
                        Delete Selected
                      </Button>
                    )}
                  </>
                )
              }
              style={{ zIndex: 1050 }} // Higher z-index for the edit modal
              forceRender
              width={800}
            >
              <div
                style={{
                  marginBottom: 20,
                  marginTop: 20,
                }}
                className="max-md:flex-col max-md:flex-wrap max-md:items-start flex justify-between items-center "
              >
                <div></div>
                <div className=" flex items-center max-md:flex-col max-md:items-start">
                  <Select
                    className="select-pub mb-3"
                    defaultValue="content"
                    value={typeReply}
                    // size="large"
                    onChange={handleTypeReplyChange}
                    style={{ width: 120, marginRight: 10 }}
                  >
                    <Option value="content">Content</Option>
                    <Option value="userid">UserId</Option>
                  </Select>
                  <Search
                    onSearch={onSearchReply}
                    placeholder="Search replies"
                    className="max-md:w-[280px] w-[300px] mb-3"
                  />
                </div>
              </div>
              <Spin spinning={isFetchingReplies}>
                <Table
                  rowSelection={
                    is_admin === 1 ||
                    permission?.post_reply?.includes("update") ||
                    permission?.post_reply?.includes("delete")
                      ? rowSelectionReplies
                      : ""
                  }
                  dataSource={replies?.data?.list || []}
                  columns={[
                    {
                      title: "Reply_id",
                      dataIndex: "id",
                      key: "id",
                      width: 80,
                    },
                    {
                      title: "Reply",
                      dataIndex: "content",
                      key: "content",
                      render: (text) => (
                        <div
                          className="description-column"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {text}
                        </div>
                      ),
                    },

                    {
                      title: "User_id",
                      dataIndex: "user_id",
                      key: "user_id",
                      width: 80,
                    },
                    {
                      title: "Nickname",
                      dataIndex: "nickname",
                      key: "nickname",
                      width: 80,
                    },
                    {
                      title: "Create_time",
                      dataIndex: "create_time",
                      key: "create_time",
                      width: 80,
                    },
                    {
                      title: "Status",
                      dataIndex: "status",
                      key: "status",
                      render: (status) => getStatusTag(status),
                    },
                    ...(is_admin == 1 ||
                    permission?.post_reply?.includes("update") ||
                    permission?.post_reply?.includes("delete")
                      ? [
                          {
                            title: "Actions",
                            key: "actions",
                            width: 100,
                            render: (text, record) => (
                              <div className="flex items-center gap-2">
                                {(is_admin == 1 ||
                                  permission?.post_reply?.includes(
                                    "update"
                                  )) && (
                                  <Button
                                    type="button"
                                    className="action_edit"
                                    onClick={() => handleEdit(record, 1)}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width="18"
                                      height="18"
                                      viewBox="0 0 18 18"
                                      fill="none"
                                    >
                                      <path
                                        fill-rule="evenodd"
                                        clip-rule="evenodd"
                                        d="M13.0579 8.19176L14.2851 6.5569C14.8931 5.7469 15.1491 4.74889 15.0061 3.74589C14.8631 2.74289 14.3391 1.85689 13.5291 1.24889C11.8581 -0.00510502 9.47614 0.331895 8.22114 2.00489L1.46913 10.9999C-0.542874 13.6829 1.24713 16.8789 1.32413 17.0139C1.42813 17.1949 1.60313 17.3239 1.80713 17.3709C1.86513 17.3849 2.42513 17.5089 3.20613 17.5089C4.46913 17.5089 6.30713 17.1859 7.53314 15.5519L12.9017 8.39987C12.9329 8.37056 12.962 8.33806 12.9886 8.30266C13.0153 8.26716 13.0384 8.23006 13.0579 8.19176ZM2.47713 15.9619C3.25813 16.0569 5.22813 16.1239 6.33313 14.6509L11.3292 7.99506L7.66454 5.24362L2.66813 11.8999C1.54113 13.4039 2.16113 15.2449 2.47713 15.9619ZM8.56474 4.04449L12.2299 6.79517L13.0851 5.6559C13.8441 4.6459 13.6391 3.20689 12.6291 2.44789C11.6181 1.69089 10.1781 1.89589 9.42014 2.90489L8.56474 4.04449Z"
                                        fill="#8AC1FF"
                                      />
                                      <path
                                        d="M16.733 17.2471H10.356C9.94196 17.2471 9.60596 16.9111 9.60596 16.4971C9.60596 16.0831 9.94196 15.7471 10.356 15.7471H16.733C17.147 15.7471 17.483 16.0831 17.483 16.4971C17.483 16.9111 17.147 17.2471 16.733 17.2471Z"
                                        fill="#8AC1FF"
                                      />
                                    </svg>
                                  </Button>
                                )}
                                {(is_admin == 1 ||
                                  permission?.post_reply?.includes(
                                    "delete"
                                  )) && (
                                  <Button
                                    type="button"
                                    className="action_del"
                                    danger
                                    onClick={() =>
                                      confirmDelete([record.id], 1)
                                    }
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
                                )}
                              </div>
                            ),
                          },
                        ]
                      : []),
                  ]}
                  rowKey="id"
                  scroll={{ x: 600 }}
                  pagination={{
                    current: replies?.data?.page,
                    total: replies?.data?.total,
                    pageSize: replies?.data?.pageSize,
                    onChange: (page) => setPageReply(page),
                    showSizeChanger: false,
                  }}
                />
              </Spin>
            </Modal>

            {/* Modal for Bulk Edit */}
            <Modal
              title={`Edit Selected ${
                editTarget === "comments" ? "Comments" : "Replies"
              }`}
              visible={editModalVisible}
              onCancel={() => setEditModalVisible(false)}
              onOk={handleBulkEdit}
              style={{ zIndex: 99999 }} // Higher z-index for the edit modal
              confirmLoading={isUpdating} // Add loading state to OK button
              forceRender // Ensure proper rendering order
            >
              <Select
                value={selectedStatus}
                onChange={(value) => setSelectedStatus(value)}
                style={{ width: "100%" }}
              >
                <Option value={1}>Approved</Option>
                <Option value={0}>Pending</Option>
              </Select>
            </Modal>
          </>
        ) : (
          <div className="flex justify-center items-center h-[60vh]">
            <h1 className="text-white text-lg">
              You don't have access to view comments
            </h1>
          </div>
        )}
      </div>
    </ConfigProvider>
  );
};

export default Comment;
