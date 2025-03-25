import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store/store";

interface LoginRequest {
  firstName: string;
  lastName: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

interface RegisterRequest {
  firstName: string;
  lastName: string;
  password: string;
  telegram?: string;
  whatsapp?: string;
  avatar?: string;
}

interface RegisterResponse {
  message: string;
  userId: number;
}

export interface Event {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  latitude: number;
  longitude: number;
  description?: string;
  avatar?: string;
}

const API_URL = "http://192.168.1.110:3000/api/";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: API_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
        console.log("token", token);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: "login",
        method: "POST",
        body: credentials,
      }),
    }),
    register: builder.mutation<RegisterResponse, FormData>({
      query: (data) => ({
        url: "register",
        method: "POST",
        body: data,
      }),
    }),
    getEvents: builder.query<any, { categoryId?: any; search?: string }>({
      query: ({ categoryId, search }) => {
        let url = "/events";
        const params = [];

        const categoryIdNum = Number(categoryId);
        if (!isNaN(categoryIdNum) && categoryIdNum > 0) {
          params.push(`categoryId=${categoryIdNum}`);
        }
        if (search && search.trim().length > 0) {
          params.push(`search=${encodeURIComponent(search.trim())}`);
        }
        if (params.length > 0) {
          url += `?${params.join("&")}`;
        }
        return url;
      },
    }),
    createEvent: builder.mutation<
      { message: string; eventId: number },
      FormData
    >({
      query: (eventData) => ({
        url: "events",
        method: "POST",
        body: eventData,
      }),
    }),
    getProfile: builder.query<any, void>({
      query: () => "profile",
    }),
    refresh: builder.mutation<
      { accessToken: string },
      { refreshToken: string }
    >({
      query: ({ refreshToken }) => ({
        url: "refresh",
        method: "POST",
        body: { token: refreshToken },
      }),
    }),
    joinEvent: builder.mutation<{ message: string }, number>({
      query: (eventId) => ({
        url: `events/${eventId}/join`,
        method: "POST",
      }),
    }),
    getCategories: builder.query<any, void>({
      query: () => "/categories",
    }),
    updateProfile: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: "/profile",
        method: "PUT",
        body: formData,
      }),
    }),
    deleteAccount: builder.mutation<void, void>({
      query: () => ({
        url: "/profile",
        method: "DELETE",
      }),
    }),
    leaveEvent: builder.mutation<void, number>({
      query: (eventId) => ({
        url: `events/leave/${eventId}`,
        method: "DELETE",
      }),
    }),
    getUserEvents: builder.query<any, any>({
      query: ({ userId }) => `events/user/${userId}`,
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetEventsQuery,
  useCreateEventMutation,
  useGetProfileQuery,
  useRefreshMutation,
  useJoinEventMutation,
  useGetCategoriesQuery,
  useUpdateProfileMutation,
  useDeleteAccountMutation,
  useLeaveEventMutation,
  useGetUserEventsQuery,
} = apiSlice;
