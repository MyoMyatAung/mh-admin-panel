import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { ModalSlice } from "./slice/ModalSlice";
import { PostApi } from "./services/postApi";

const rootReducer = combineReducers({
  modal: ModalSlice,
  [PostApi.reducerPath]: PostApi.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(PostApi.middleware),
});
