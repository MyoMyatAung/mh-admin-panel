import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const customFetchBaseQuery = async (args, api, extraOptions) => {
  const result = await fetchBaseQuery({
    baseUrl: "https://cc3e497d.qdhgtch.com:2345/api/v1",
    prepareHeaders: (headers) => {
      // Get token from localStorage
      const token = localStorage.getItem("token");

      // If a token exists, add it to the headers
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  })(args, api, extraOptions);

  if (result.error) {
    console.error("RTK Query Error:", result.error);
  }

  return result;
};
export const PostApi = createApi({
  reducerPath: "PostApi",
  baseQuery: customFetchBaseQuery,

  endpoints: (builder) => ({
    getList: builder.query({
      query: (data) => {
        const { page, status, q, type } = data;
        let url = `panel/post/list?page=${page}&status=${status}`;
        if (q) {
          url += `&q=${encodeURIComponent(q)}&type=${type}`; // Append query parameter if it exists
        }
        return { url };
      },
    }),
    getCommentList: builder.query({
      query: ({ page, id, q, type }) => {
        let url = `panel/post/comment/list?post_id=${id}&page=${page}`;
        if (q) {
          url += `&q=${encodeURIComponent(q)}&type=${type}`; // Append query parameter if it exists
        }
        return { url };
      },
    }),
    getReplyList: builder.query({
      query: ({ pageReply, q, selectedCommentId, type }) => {
        let url = `panel/post/reply/list?comment_id=${selectedCommentId}&page=${pageReply}`;
        if (q) {
          url += `&q=${encodeURIComponent(q)}&type=${type}`; // Append query parameter if it exists
        }
        return { url };
      },
    }),
    getCreators: builder.query({
      query: ({ page, pageSize }) => ({
        url: `panel/post/creator/list?page=${page}&pageSize=${pageSize || 10}`,
      }),
    }),
    actionCreator: builder.mutation({
      query: (data) => ({
        url: `panel/post/creator/action`,
        method: "POST",
        body: data,
      }),
      transformResponse: (response) => response,
    }),

    CreatePost: builder.mutation({
      query: (data) => ({
        url: `panel/post/save`,
        method: "POST",
        body: data,
      }),
      transformResponse: (response) => response,
    }),
    DeletePost: builder.mutation({
      query: (ids) => ({
        url: `panel/post/delete`,
        method: "POST",
        body: { post_ids: ids },
      }),
      transformResponse: (response) => response,
    }),
    DeleteComment: builder.mutation({
      query: (data) => ({
        url: `panel/post/comment/delete`,
        method: "POST",
        body: { ids: data?.ids, is_reply: data?.is_reply },
      }),
      transformResponse: (response) => response,
    }),
    UpdateComment: builder.mutation({
      query: (data) => ({
        url: `panel/post/comment/status/update`,
        method: "POST",
        body: {
          ids: data?.ids,
          is_reply: data?.is_reply,
          status: data?.status,
        },
      }),
      transformResponse: (response) => response,
    }),
  }),
});

export const {
  useCreatePostMutation,
  useDeletePostMutation,
  useGetListQuery,
  useGetCreatorsQuery,
  useActionCreatorMutation,
  useGetCommentListQuery,
  useDeleteCommentMutation,
  useUpdateCommentMutation,
  useGetReplyListQuery,
} = PostApi;
