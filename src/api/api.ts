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
      const token = (getState() as RootState).auth.accessToken as any;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ["Event", "Profile", "Category", "UserEvents"],
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
    getEvents: builder.query<any, any>({
      query: ({ categoryId, search, radius, userLat, userLng }) => {
        console.log(categoryId, search, radius, userLat, userLng);
        let url = "/events";
        const params: string[] = [];
        if (categoryId && categoryId > 0) {
          params.push(`categoryId=${categoryId}`);
        }
        if (search && search.trim().length > 0) {
          params.push(`search=${encodeURIComponent(search.trim())}`);
        }
        if (radius && userLat !== undefined && userLng !== undefined) {
          params.push(`radius=${radius}`);
          params.push(`userLat=${userLat}`);
          params.push(`userLng=${userLng}`);
        }
        if (params.length > 0) {
          url += `?${params.join("&")}`;
        }
        return url;
      },
      providesTags: (result: any) =>
        result
          ? [
              ...result.map((event: any) => ({ type: "Event", id: event.id })),
              { type: "Event", id: "LIST" },
            ]
          : [{ type: "Event", id: "LIST" }],
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
      invalidatesTags: () => [
        { type: "Event", id: "LIST" },
        { type: "UserEvents", id: "LIST" },
        { type: "Profile", id: "LIST" },
      ],
    }),
    getProfile: builder.query<any, void>({
      query: () => "profile",
      providesTags: () => [{ type: "Profile", id: "LIST" }],
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
      invalidatesTags: () => [
        { type: "Event", id: "LIST" },
        { type: "UserEvents", id: "LIST" },
      ],
    }),
    getCategories: builder.query<any, void>({
      query: () => "/categories",
      providesTags: (result: any) =>
        result
          ? [
              ...result.map((cat: any) => ({ type: "Category", id: cat.id })),
              { type: "Category", id: "LIST" },
            ]
          : [{ type: "Category", id: "LIST" }],
    }),
    updateProfile: builder.mutation<any, FormData>({
      query: (formData) => ({
        url: "/profile",
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: () => [{ type: "Profile", id: "LIST" }],
    }),
    deleteAccount: builder.mutation<void, void>({
      query: () => ({
        url: "/profile",
        method: "DELETE",
      }),
      invalidatesTags: () => [{ type: "Profile", id: "LIST" }],
    }),
    leaveEvent: builder.mutation<void, number>({
      query: (eventId) => ({
        url: `events/${eventId}/leave`,
        method: "DELETE",
      }),
      invalidatesTags: () => [
        { type: "Event", id: "LIST" },
        { type: "UserEvents", id: "LIST" },
      ],
    }),
    getUserEvents: builder.query<any, void>({
      query: () => `events/user`,
      providesTags: (result: any) =>
        result
          ? [
              ...result.map((event: any) => ({
                type: "UserEvents",
                id: event.id,
              })),
              { type: "UserEvents", id: "LIST" },
            ]
          : [{ type: "UserEvents", id: "LIST" }],
    }),
    updateEvent: builder.mutation<any, { id: number; data: FormData }>({
      query: ({ id, data }) => ({
        url: `/events/${id}`,
        method: "PUT",
        body: data,
      }),
    }),
    getMyEvents: builder.query<Event[], void>({
      query: () => "/events/my",
      providesTags: (result: any) =>
        result
          ? [
              ...result.map((event: any) => ({ type: "Event", id: event.id })),
              { type: "Event", id: "LIST" },
            ]
          : [{ type: "Event", id: "LIST" }],
    }),
    getUsers: builder.query<any, any>({
      query: () => "/profile/users",
    }),
    toggleUserBlock: builder.mutation<void, any>({
      query: ({ userId, blocked }) => ({
        url: `/profile/users/${userId}/block`,
        method: "POST",
        body: { blocked },
      }),
    }),
    deleteEvent: builder.mutation<void, number>({
      query: (eventId) => ({
        url: `/events/${eventId}`,
        method: "DELETE",
      }),
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
  useGetMyEventsQuery,
  useUpdateEventMutation,
  useGetUsersQuery,
  useToggleUserBlockMutation,
  useDeleteEventMutation,
} = apiSlice;
