import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AuthState {
  accessToken?: string | null;
  refreshToken?: string | null;
  userId?: string | null;
  lastName?: string | null;
  firstName?: string | null;
}

const initialState: AuthState = {
  accessToken: null,
  refreshToken: null,
  userId: null,
  lastName: null,
  firstName: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        accessToken?: string;
        refreshToken?: string;
        userId?: string;
        lastName?: string;
        firstName?: string;
      }>
    ) => {
      state.accessToken = action.payload.accessToken;
      if (action.payload.refreshToken) {
        state.refreshToken = action.payload.refreshToken;
      }
      if (action.payload.userId) {
        state.userId = action.payload.userId;
      }
      if (action.payload.lastName) {
        state.lastName = action.payload.lastName;
      }
      if (action.payload.firstName) {
        state.firstName = action.payload.firstName;
      }
    },
    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.userId = null;
      state.lastName = null;
      state.firstName = null;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
