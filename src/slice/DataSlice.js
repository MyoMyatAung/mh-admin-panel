// store/postSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  description: "",
  status: "published",
  score: "",
  is_recommend: 0,
  is_top: 0,
};

export const DataSlice = createSlice({
  name: "post",
  initialState,
  reducers: {
    setDescription: (state, action) => {
      state.description = action.payload;
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    setScore: (state, action) => {
      state.score = action.payload;
    },
    setIsRecommend: (state, action) => {
      state.is_recommend = action.payload;
    },
    setIsTop: (state, action) => {
      state.is_top = action.payload;
    },
    resetPostState: () => initialState,
  },
});

export const {
  setDescription,
  setStatus,
  setScore,
  setIsRecommend,
  setIsTop,
  resetPostState,
} = DataSlice.actions;

export default DataSlice.reducer;
