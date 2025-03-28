// src/store/alertSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

type AlertState = {
  message: string;
  type: "success" | "error";
  visible: boolean;
};

const initialState: AlertState = {
  message: "",
  type: "success",
  visible: false,
};

const alertSlice = createSlice({
  name: "alert",
  initialState,
  reducers: {
    showAlert: (
      state,
      action: PayloadAction<{ message: string; type: "success" | "error" }>
    ) => {
      state.message = action.payload.message;
      state.type = action.payload.type;
      state.visible = true;
    },
    hideAlert: (state) => {
      state.visible = false;
    },
  },
});

export const { showAlert, hideAlert } = alertSlice.actions;
export default alertSlice.reducer;
