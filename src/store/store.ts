import { configureStore } from "@reduxjs/toolkit";
import { apiSlice } from "../api/api";
import authReducer from "../features/authSlice";
import userReducer from "../features/userSlice";
import alertReducer from "../features/alertSlice";
export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,

    auth: authReducer,
    user: userReducer,
    alert: alertReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
