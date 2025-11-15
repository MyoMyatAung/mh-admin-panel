import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Modal,
  Input,
  message,
  Select,
  ConfigProvider,
  theme,
  Tag,
  Spin,
  Progress,
} from "antd";
import {
  useGetListQuery,
  useDeletePostMutation,
  useGetUserInfoQuery,
} from "../services/postApi";
import Navbar from "../components/Navbar";
import { Link } from "react-router-dom";
import CreateUnlockPost from "../components/CreateUnlockPost";
import { DatePicker } from "antd";
import moment from "moment"; // For formatting dates
import Form from "../components/Form";
import CreateUnlockPost from "../components/CreateUnlockPost";

const { Option } = Select;
const { Search } = Input;

const Home = () => {
  const [type, setType] = useState("content");
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("published");
  const [filter, setFilter] = useState("all");
  const [order, setOrder] = useState("asc");
  const [query, setQuery] = useState(""); // State for selected rows for comments
  const token = localStorage.getItem("token");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [from_date, setfrom_date] = useState(null);
  const [to_date, setto_date] = useState(null);

  const { data, isLoading, isFetching, refetch } = useGetListQuery(
    {
      page,
      status,
      q: query, // Pass the query state here
      type,
      filter,
      order,
      from_date,
      to_date,
      post_type: "post",
    },
    { skip: !token }
  );
  const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();
  const { data: user, isLoading: isUserLoading } = useGetUserInfoQuery(
    undefined,
    { skip: !token }
  );
  const [isFileUploadVisible, setFileUploadVisible] = useState(false);
  const [isCreatePostUnlockVisible, setCreatePostUnlockVisible] = useState(false);
  const [editingPost, setEditingPost] = useState(null); // Track if we are editing
  const [modalKey, setModalKey] = useState(0); // Key to force re-render
  const [loading, setLoading] = useState(false);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]); // State for selected rows for comments
  const [uploadPercentage, setUploadPercentage] = useState(0);

  const userData = user?.data;

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [page]);

  const handleFromDateChange = (dateString) => {
    setFromDate(dateString);
    const formattedDate = dateString?.format("YYYY-MM-DD");

    // Convert to Unix timestamp in milliseconds
    const timestampMilliseconds = moment(formattedDate).unix();
    if (formattedDate) {
      setfrom_date(timestampMilliseconds);
    } else {
      setfrom_date(null);
    }
  };

  const handleToDateChange = (dateString) => {
    setToDate(dateString);
    const formattedDate = dateString?.format("YYYY-MM-DD");

    const timestampMilliseconds = moment(formattedDate).unix();
    if (formattedDate) {
      setto_date(timestampMilliseconds);
    } else {
      setto_date(null);
    }
  };

  const confirmDelete = (ids) => {
    Modal.confirm({
      title: "Are you sure you want to delete this post?",
      okText: "Delete",
      cancelText: "Cancel",
      okButtonProps: { loading: isDeleting },
      onOk: () => handleDelete(ids),
      className: "dark-modal", // Add custom class here
    });
  };

  const handleDelete = async (ids) => {
    try {
      await deletePost(ids).unwrap();
      setSelectedRowKeys((prevKeys) =>
        prevKeys.filter((key) => !ids.includes(key))
      );
      message.success("Post deleted successfully");
      refetch();
    } catch (error) {
      console.error("Failed to delete post:", error);
      message.error("Failed to delete post");
    }
  };

  const handleStatusChange = (value) => {
    refetch();
    setStatus(value);
    setPage(1);
  };
  const handleFilterChange = (value) => {
    refetch();
    setFilter(value);
    setPage(1);
  };

  const handleOrderChange = (value) => {
    refetch();
    setOrder(value);
    setPage(1);
  };

  const permission = userData?.permission
    ? JSON.parse(userData?.permission)
    : {};
  const is_admin = userData?.is_admin;

  const handleEdit = (post) => {
    setEditingPost(post); // Set post data to edit
    setModalKey((prevKey) => prevKey + 1); // Update key to force re-render
    setFileUploadVisible(true); // Open modal
  };

  const getStatusTag = (status) => {
    switch (status) {
      case "published":
        return <Tag color="green">Published</Tag>;
      case "review":
        return <Tag color="gold">Review</Tag>;
      case "declined":
        return <Tag color="red">Declined</Tag>;
      default:
        return <Tag>{status}</Tag>;
    }
  };

  const rowSelectionPosts = {
    selectedRowKeys,
    onChange: (selectedKeys) => setSelectedRowKeys(selectedKeys),
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 80,
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (text) => (
        <div
          className="description-column text-white truncate"
          // style={{
          //   display: "-webkit-box",
          //   WebkitLineClamp: 1,
          //   WebkitBoxOrient: "vertical",
          //   overflow: "hidden",
          //   textOverflow: "ellipsis",
          // }}
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
      render: (timestamp) => (
        <span>
          {timestamp ? moment(timestamp * 1000).format("YYYY-MM-DD") : "N/A"}
        </span>
      ),
      width: 80,
    },
    ...(is_admin == 1 || permission?.post_comment?.includes("view")
      ? [
          {
            title: "Comments",
            key: "comments",
            dataIndex: "comments",
            render: (text, record) => (
              <Link
                to={`/comments/${record.id}`}
                style={{
                  textDecoration: "underline",
                  color: "#1890ff",
                  cursor: "pointer",
                }}
              >
                {text || "Comments"}
              </Link>
            ),
          },
        ]
      : []),

    {
      title: "Score",
      dataIndex: "score",
      key: "score",
      width: 80,
    },

    {
      title: "Type",
      dataIndex: "file_type",
      key: "type",
      width: 80,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => getStatusTag(status), // Use the getStatusTag function here
    },
    ...(is_admin == 1 ||
    permission?.post?.includes("update") ||
    permission?.post?.includes("delete")
      ? [
          {
            title: "Actions",
            key: "actions",
            width: 100,
            render: (_, record) => (
              <div className="flex items-center gap-2">
                {(is_admin == 1 || permission?.post?.includes("update")) && (
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
                        fillRule="evenodd"
                        clipRule="evenodd"
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
                {(is_admin == 1 || permission?.post?.includes("delete")) && (
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

    // {
    //   title: "Actions",
    //   key: "actions",
    //   width: 100,
    //   render: (text, record) => {
    //     if (userData?.admin === 1) {
    //       return (
    //         <div className="flex items-center gap-2">
    //           <Button
    //             type="button"
    //             className="action_edit"
    //             onClick={() => handleEdit(record)}
    //           >
    //             <svg
    //               xmlns="http://www.w3.org/2000/svg"
    //               width="18"
    //               height="18"
    //               viewBox="0 0 18 18"
    //               fill="none"
    //             >
    //               <path
    //                 fill-rule="evenodd"
    //                 clip-rule="evenodd"
    //                 d="M13.0579 8.19176L14.2851 6.5569C14.8931 5.7469 15.1491 4.74889 15.0061 3.74589C14.8631 2.74289 14.3391 1.85689 13.5291 1.24889C11.8581 -0.00510502 9.47614 0.331895 8.22114 2.00489L1.46913 10.9999C-0.542874 13.6829 1.24713 16.8789 1.32413 17.0139C1.42813 17.1949 1.60313 17.3239 1.80713 17.3709C1.86513 17.3849 2.42513 17.5089 3.20613 17.5089C4.46913 17.5089 6.30713 17.1859 7.53314 15.5519L12.9017 8.39987C12.9329 8.37056 12.962 8.33806 12.9886 8.30266C13.0153 8.26716 13.0384 8.23006 13.0579 8.19176ZM2.47713 15.9619C3.25813 16.0569 5.22813 16.1239 6.33313 14.6509L11.3292 7.99506L7.66454 5.24362L2.66813 11.8999C1.54113 13.4039 2.16113 15.2449 2.47713 15.9619ZM8.56474 4.04449L12.2299 6.79517L13.0851 5.6559C13.8441 4.6459 13.6391 3.20689 12.6291 2.44789C11.6181 1.69089 10.1781 1.89589 9.42014 2.90489L8.56474 4.04449Z"
    //                 fill="#8AC1FF"
    //               />
    //               <path
    //                 d="M16.733 17.2471H10.356C9.94196 17.2471 9.60596 16.9111 9.60596 16.4971C9.60596 16.0831 9.94196 15.7471 10.356 15.7471H16.733C17.147 15.7471 17.483 16.0831 17.483 16.4971C17.483 16.9111 17.147 17.2471 16.733 17.2471Z"
    //                 fill="#8AC1FF"
    //               />
    //             </svg>
    //           </Button>
    //           <Button
    //             type="button"
    //             className="action_del"
    //             danger
    //             onClick={() => confirmDelete([record.id])}
    //           >
    //             <svg
    //               xmlns="http://www.w3.org/2000/svg"
    //               width="18"
    //               height="20"
    //               viewBox="0 0 18 20"
    //               fill="none"
    //             >
    //               <path
    //                 d="M16.4666 3.46675C16.7142 3.46675 16.9516 3.56508 17.1266 3.74011C17.3016 3.91515 17.4 4.15255 17.4 4.40008C17.4 4.64762 17.3016 4.88501 17.1266 5.06005C16.9516 5.23508 16.7142 5.33341 16.4666 5.33341H15.5333L15.5305 5.39968L14.6597 17.5993C14.6262 18.0702 14.4155 18.511 14.07 18.8327C13.7244 19.1545 13.2698 19.3334 12.7977 19.3334H5.20131C4.72917 19.3334 4.27457 19.1545 3.92907 18.8327C3.58357 18.511 3.37283 18.0702 3.33931 17.5993L2.46851 5.40061C2.46709 5.37824 2.46647 5.35583 2.46664 5.33341H1.53331C1.28577 5.33341 1.04838 5.23508 0.873343 5.06005C0.698309 4.88501 0.599976 4.64762 0.599976 4.40008C0.599976 4.15255 0.698309 3.91515 0.873343 3.74011C1.04838 3.56508 1.28577 3.46675 1.53331 3.46675H16.4666ZM13.6638 5.33341H4.33611L5.20224 17.4667H12.7977L13.6638 5.33341ZM10.8666 0.666748C11.1142 0.666748 11.3516 0.765081 11.5266 0.940115C11.7016 1.11515 11.8 1.35255 11.8 1.60008C11.8 1.84762 11.7016 2.08501 11.5266 2.26005C11.3516 2.43508 11.1142 2.53341 10.8666 2.53341H7.13331C6.88577 2.53341 6.64838 2.43508 6.47334 2.26005C6.29831 2.08501 6.19998 1.84762 6.19998 1.60008C6.19998 1.35255 6.29831 1.11515 6.47334 0.940115C6.64838 0.765081 6.88577 0.666748 7.13331 0.666748H10.8666Z"
    //                 fill="#F54100"
    //               />
    //             </svg>
    //           </Button>
    //         </div>
    //       );
    //     }
    //     return null;
    //   },
    // },
  ];

  const handleTypeChange = (value) => {
    setType(value);
  };
  const onSearch = (value) => {
    setQuery(value);
    setPage(1);
  };

  if (isUserLoading) {
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
      <div style={{ padding: 20 }} className="container mx-auto">
        <Navbar status={false} />

        {is_admin === 1 || permission?.post?.includes("view") ? (
          <>
            <div
              style={{
                marginTop: 20,
              }}
              className="max-md:flex-col max-xl:flex-wrap max-md:items-start flex justify-between items-center"
            >
              <div className="flex items-center max-xl:flex-wrap max-md:items-start">
                {(is_admin === 1 || permission?.post?.includes("create")) && (
                  <>
                  <Button
                    type="primary"
                    className="add-btn mb-3"
                    onClick={() => {
                      setEditingPost(null); // Clear editingPost for new post
                      setFileUploadVisible(true);
                    }}
                    style={{ marginRight: 10 }}
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
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    Create Post
                  </Button>
                  <Button
                    type="primary"
                    className="add-btn mb-3"
                    onClick={() => {
                      setModalKey((prevKey) => prevKey + 1); // Update key to force re-render
                      setEditingPost(null); // Clear editingPost for new post
                      setCreatePostUnlockVisible(true);
                    }}
                    style={{ marginRight: 10 }}
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
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    Create Unlockable Post
                  </Button>
                  </>
                )}

                <Select
                  className="select-pub mb-3"
                  defaultValue="published"
                  value={status}
                  onChange={handleStatusChange}
                  style={{ width: 120, marginRight: 10 }}
                >
                  <Option value="published">Published</Option>
                  <Option value="review">Review</Option>
                  <Option value="declined">Declined</Option>
                </Select>
                <Select
                  className="select-pub mb-3"
                  defaultValue="all"
                  value={filter}
                  onChange={handleFilterChange}
                  style={{ width: 120, marginRight: 10 }}
                >
                  <Option value="all">All</Option>
                  <Option value="top">Top</Option>
                  <Option value="recommend">Recommend</Option>
                  <Option value="score">Score</Option>
                </Select>
                <Select
                  className="select-pub mb-3"
                  defaultValue="asc"
                  value={order}
                  onChange={handleOrderChange}
                  style={{ width: 120, marginRight: 10 }}
                >
                  <Option value="asc">Asc</Option>
                  <Option value="desc">Desc</Option>
                </Select>
                <DatePicker
                  className="mb-3"
                  placeholder="From Date"
                  style={{ width: 125, marginRight: 10 }}
                  onChange={handleFromDateChange}
                  value={fromDate}
                />
                <DatePicker
                  className="mb-3"
                  placeholder="To Date"
                  style={{ width: 125, marginRight: 10 }}
                  onChange={handleToDateChange}
                  value={toDate}
                />
              </div>

              <div className=" flex items-center max-md:flex-col max-md:items-start">
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
                  placeholder="Search posts"
                  // size="large"
                  className="max-md:w-[280px] w-[300px] mb-3"
                />
              </div>
            </div>
            <div className="">
              {selectedRowKeys.length > 0 && (
                <div className="mb-3">
                  <Button
                    danger
                    onClick={() => confirmDelete(selectedRowKeys)}
                    loading={isDeleting}
                  >
                    Delete Selected
                  </Button>
                </div>
              )}
            </div>

            <div style={{ overflowX: "auto" }}>
              <Table
                rowSelection={
                  is_admin === 1 || permission?.post?.includes("delete")
                    ? rowSelectionPosts
                    : ""
                }
                columns={columns}
                dataSource={data?.data?.list || []}
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
              key={modalKey} // Force re-render on key change
              title={editingPost ? "Edit Post" : "Upload Post"}
              visible={isFileUploadVisible}
              onCancel={() => setFileUploadVisible(false)}
              closable={!loading} // Disable close button while loading
              maskClosable={!loading}
              footer={null}
            >
              <div
                style={{
                  position: "relative", // Make sure the parent div is positioned to allow absolute positioning of the progress bar
                  pointerEvents: loading ? "none" : "auto",
                }}
              >
                {((uploadPercentage > 0 && uploadPercentage < 100) ||
                  loading) && (
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "100%", // Optional: if you want the progress bar to fill the width of the parent container
                      zIndex: 9999, // Ensure the progress bar stays on top
                      opacity: 2,
                    }}
                  >
                    <Progress percent={uploadPercentage} />
                  </div>
                )}
                <div
                  style={{
                    position: "relative", // Make sure the parent div is positioned to allow absolute positioning of the progress bar
                    pointerEvents: loading ? "none" : "auto",
                    opacity: loading ? 0.1 : 1,
                  }}
                >
                  <Form
                    setEditingPost={setEditingPost}
                    onClose={() => {
                      setFileUploadVisible(false);
                      setEditingPost(null);
                    }}
                    setLoading={setLoading}
                    loading={loading}
                    closeDiv={setFileUploadVisible}
                    setPage={setPage}
                    refetch={refetch}
                    post={editingPost} // Pass post data if editing
                    isVisible={isFileUploadVisible} // New prop to trigger reset on modal open
                    setUploadPercentage={setUploadPercentage}
                    uploadPercentage={uploadPercentage}
                  />
                </div>
              </div>
            </Modal>
            <Modal
              key={modalKey} // Force re-render on key change
              title={"Upload Unlockable Post"}
              visible={isCreatePostUnlockVisible}
              onCancel={() => setCreatePostUnlockVisible(false)}
              closable={!loading} // Disable close button while loading
              maskClosable={!loading}
              footer={null}
            >
              <div
                style={{
                  position: "relative", // Make sure the parent div is positioned to allow absolute positioning of the progress bar
                  pointerEvents: loading ? "none" : "auto",
                }}
              >
                {((uploadPercentage > 0 && uploadPercentage < 100) ||
                  loading) && (
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -50%)",
                      width: "100%", // Optional: if you want the progress bar to fill the width of the parent container
                      zIndex: 9999, // Ensure the progress bar stays on top
                      opacity: 2,
                    }}
                  >
                    <Progress percent={uploadPercentage} />
                  </div>
                )}
                <div
                  style={{
                    position: "relative", // Make sure the parent div is positioned to allow absolute positioning of the progress bar
                    pointerEvents: loading ? "none" : "auto",
                    opacity: loading ? 0.1 : 1,
                  }}
                >
                  <CreateUnlockPost
<<<<<<< HEAD
                    post={null}
=======
>>>>>>> 89579f1 (Resolve Conflict)
                    onClose={() => setCreatePostUnlockVisible(false)}
                    setLoading={setLoading}
                    loading={loading}
                    setUploadPercentage={setUploadPercentage}
                  />
                </div>
              </div>
            </Modal>
          </>
        ) : (
          <div className="flex justify-center items-center h-[60vh]">
            <h1 className="text-white text-lg">
              {"You don't have access to view posts"}
            </h1>
          </div>
        )}
      </div>
    </ConfigProvider>
  );
};

export default Home;
