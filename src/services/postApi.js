import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
const customFetchBaseQuery = async (args, api, extraOptions) => {
  console.log("Request Arguments:", args); // Log args for debugging

  const result = await fetchBaseQuery({
    baseUrl: "https://cc3e497d.qdhgtch.com:2345/api/v1",
    prepareHeaders: (headers) => {
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
      query: (data) => ({
        url: `panel/post/list?page=${data?.page}&status=${data?.status}`,
      }),
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
      query: (id) => ({
        url: `panel/post/delete`,
        method: "POST",
        body: { post_id: id },
      }),
      transformResponse: (response) => response,
    }),
  }),
});

export const { useCreatePostMutation, useDeletePostMutation, useGetListQuery } =
  PostApi;
