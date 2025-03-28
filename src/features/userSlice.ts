import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserState {
  userId: string | null;
  email?: string | null;
  name?: string | null;
  isAdmin: boolean;
}

const initialState: UserState = {
  userId: null,
  email: null,
  name: null,
  isAdmin: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{ userId: string; isAdmin: boolean }>
    ) => {
      state.userId = action.payload.userId;
      state.isAdmin = action.payload.isAdmin;
    },
    clearUser: (state) => {
      state.userId = null;
      state.isAdmin = false;
    },
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
