import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  convertToSecureUrl,
  generateSignature,
  RSAEncryptor,
} from "../utils/encrypt";

export const generateData = (data) => {
  const newData = { ...data, timestamp: new Date().getTime() };

  const jsonString = JSON.stringify(newData);

  const keySize = 1024; // Key size in bits (e.g., 1024, 2048)
  const encryptor = new RSAEncryptor(import.meta.env.VITE_PUBLIC_KEY, keySize);

  const encryptedData = encryptor.encryptPKCS1(jsonString);

  const signature = generateSignature(encryptedData);

  return {
    pack: encryptedData,
    signature,
  };
};

const customFetchBaseQuery = async (args, api, extraOptions) => {
  const result = await fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_URL,
    prepareHeaders: (headers) => {
      // Get token from localStorage
      const token = localStorage.getItem("token");

      // If a token exists, add it to the headers
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      console.log("Request Headers:", headers.get("Authorization"));
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
    getUserInfo: builder.query({
      query: () => {
        let url = `panel/post/creator/info`;
        return convertToSecureUrl(url);
      },
    }),
    getConfig: builder.query({
      query: () => {
        let url = `/panel/social/config`;
        return convertToSecureUrl(url);
      },
    }),

    updateDomain: builder.mutation({
      query: (data) => ({
        url: `panel/social/config/save`,
        method: "POST",
        body: generateData(data),
      }),
      transformResponse: (response) => response,
    }),

    getList: builder.query({
      query: (data) => {
        const {
          page,
          status,
          q,
          type,
          filter,
          order,
          from_date,
          to_date,
          post_type,
        } = data;

        let url = `panel/post/list?page=${page}&status=${status}&post_type=${post_type}`;
        if (q) {
          url += `&q=${encodeURIComponent(q)}&type=${type}`; // Append query parameter if it exists
        }
        if (filter !== "all") {
          url += `&filter=${filter}`;
        }
        if (filter !== "all" && filter !== "top") {
          url += `&order=${order}`;
        }
        if (from_date) {
          url += `&from_date=${from_date}`;
        }
        if (to_date) {
          url += `&to_date=${to_date}`;
        }

        return convertToSecureUrl(url);
      },
    }),
    getCommentList: builder.query({
      query: ({ page, id, q, type, status }) => {
        if (id) {
          let url = `panel/post/comment/list?post_id=${id}&page=${page}`;
          if (q) {
            url += `&q=${encodeURIComponent(q)}&type=${type}`; // Append query parameter if it exists
          }
          return convertToSecureUrl(url);
        } else {
          let url = `panel/post/comment/list?page=${page}`;
          if (q) {
            url += `&q=${encodeURIComponent(q)}&type=${type}`; // Append query parameter if it exists
          }
          if (status !== "all") {
            url += `&status=${status}`; // Append query parameter if it exists
          }

          return convertToSecureUrl(url);
        }
      },
    }),
    getReplyList: builder.query({
      query: ({ pageReply, q, selectedCommentId, type, status }) => {
        if (selectedCommentId) {
          let url = `panel/post/reply/list?comment_id=${selectedCommentId}&page=${pageReply}&ignore_safe_check=true`;
          if (q) {
            url += `&q=${encodeURIComponent(q)}&type=${type}`; // Append query parameter if it exists
          }
          return convertToSecureUrl(url);
        } else {
          let url = `panel/post/reply/list?page=${pageReply}`;
          if (q) {
            url += `&q=${encodeURIComponent(q)}&type=${type}`; // Append query parameter if it exists
          }
          if (status !== "all") {
            url += `&status=${status}`; // Append query parameter if it exists
          }

          return convertToSecureUrl(url);
        }
      },
    }),
    getCreators: builder.query({
      query: ({ page, pageSize }) => {
        return convertToSecureUrl(
          `panel/post/creator/list?page=${page}&pageSize=${pageSize || 10}`
        );
      },
    }),
    allgetCreators: builder.query({
      query: ({ role }) => {
        return convertToSecureUrl(`panel/post/all/creator/list?role=${role}}`);
      },
    }),
    actionCreator: builder.mutation({
      query: (data) => ({
        url: `panel/post/creator/action`,
        method: "POST",
        body: generateData(data),
      }),
      transformResponse: (response) => response,
    }),

    CreatePost: builder.mutation({
      query: (data) => ({
        url: `panel/post/save`,
        method: "POST",
        body: generateData(data),
      }),
      transformResponse: (response) => response,
    }),
    DeletePost: builder.mutation({
      query: (ids) => ({
        url: `panel/post/delete`,
        method: "POST",
        body: generateData({ post_ids: ids }),
      }),
      transformResponse: (response) => response,
    }),
    DeleteComment: builder.mutation({
      query: (data) => ({
        url: `panel/post/comment/delete`,
        method: "POST",
        body: generateData({ ids: data?.ids, is_reply: data?.is_reply }),
      }),
      transformResponse: (response) => response,
    }),
    UpdateComment: builder.mutation({
      query: (data) => ({
        url: `panel/post/comment/status/update`,
        method: "POST",
        body: generateData({
          ids: data?.ids,
          is_reply: data?.is_reply,
          status: data?.status,
        }),
      }),
      transformResponse: (response) => response,
    }),
    createWebViewPost: builder.mutation({
      query: (data) => ({
        url: `panel/post/web-view/create`,
        method: "POST",
        body: generateData(data),
      }),
      transformResponse: (response) => response,
    }),
    updateWebViewPost: builder.mutation({
      query: (data) => ({
        url: `panel/post/web-view/update`,
        method: "POST",
        body: generateData(data),
      }),
      transformResponse: (response) => response,
    }),
    getDetail: builder.query({
      query: (id) => {
        let url = `/post/detail?post_id=${id}`;
        return convertToSecureUrl(url);
      },
    }),
  }),
});

export const {
  useGetConfigQuery,
  useUpdateDomainMutation,
  useCreatePostMutation,
  useDeletePostMutation,
  useGetListQuery,
  useGetCreatorsQuery,
  useActionCreatorMutation,
  useGetCommentListQuery,
  useDeleteCommentMutation,
  useUpdateCommentMutation,
  useGetReplyListQuery,
  useGetUserInfoQuery,
  useAllgetCreatorsQuery,
  useCreateWebViewPostMutation,
  useUpdateWebViewPostMutation,
  useGetDetailQuery,
} = PostApi;
