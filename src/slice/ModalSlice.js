import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  openCreateModal: false,
};

export const ModalSlice = createSlice({
  name: "modal",
  initialState,
  reducers: {
    setCreateOpen: (state, { payload }) => {
      state.openCreateModal = payload;
    },
  },
});

export const { setCreateOpen } = ModalSlice.actions;
export const selectTypesData = (state) => state.modal;
export default ModalSlice.reducer;
