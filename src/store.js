import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { ModalSlice } from "./slice/ModalSlice";
import { PostApi } from "./services/postApi";
import { UserSlice } from "./slice/userSlice";

const rootReducer = combineReducers({
  modal: ModalSlice,
  user: UserSlice,
  [PostApi.reducerPath]: PostApi.reducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(PostApi.middleware),
});
