import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "../store/store";
import Constants from "expo-constants";

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

export interface Participant {
  id: number;
  firstName: string;
  lastName: string;
  telegram: string;
  whatsapp: string;
  avatar: string | null;
  registrationDate: string;
  blocked: boolean;
  admin: boolean;
  createdAt: string;
  updatedAt: string;
}

//const SERVER_URL =Constants.expoConfig?.extra?.SERVER_URL || "http://192.168.1.110:3000/api/";
const SERVER_URL = "http://192.168.1.110:3000/api/";

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: SERVER_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken as any;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  // Добавляем новый тег для участников мероприятия
  tagTypes: ["Event", "Profile", "Category", "UserEvents", "EventParticipants"],
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
    getEvents: builder.query<
      any,
      {
        categoryId?: number | null;
        search?: string;
        radius?: number;
        userLat?: number;
        userLng?: number;
        eventStatus?: "current" | "upcoming";
      }
    >({
      query: ({
        categoryId,
        search,
        radius,
        userLat,
        userLng,
        eventStatus,
      }) => {
        console.log(categoryId, search, radius, userLat, userLng, eventStatus);
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
        if (eventStatus) {
          params.push(`eventStatus=${eventStatus}`);
        }
        if (params.length > 0) {
          url += `?${params.join("&")}`;
        }
        return url;
      },
      providesTags: (result, error, args) =>
        result
          ? [
              // Для каждого полученного события назначаем тег Event с id события
              ...result.map((event: any) => ({ type: "Event", id: event.id })),
              // Добавляем общий тег для списка событий пользователя
              { type: "UserEvents", id: "LIST" },
              // Добавляем общий тег для участников мероприятия
              { type: "EventParticipants", id: "LIST" },
            ]
          : [
              { type: "Event", id: "LIST" },
              { type: "UserEvents", id: "LIST" },
              { type: "EventParticipants", id: "LIST" },
            ],
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
      invalidatesTags: (result, error, eventId) => [
        { type: "Event", id: "LIST" },
        { type: "UserEvents", id: "LIST" },
        { type: "EventParticipants", id: eventId },
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
      invalidatesTags: (result, error, eventId) => [
        { type: "Event", id: "LIST" },
        { type: "UserEvents", id: "LIST" },
        { type: "EventParticipants", id: eventId },
      ],
    }),
    getUserEvents: builder.query<any, void>({
      query: () => "events/user",
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
      invalidatesTags: (result, error, eventId) => [
        { type: "Event", id: "LIST" },
        { type: "UserEvents", id: "LIST" },
      ],
    }),
    getMyEvents: builder.query<Event[], void>({
      query: () => "events/my",
      providesTags: (result: any) =>
        result
          ? [
              ...result.map((event: any) => ({ type: "Event", id: event.id })),
              { type: "Event", id: "LIST" },
            ]
          : [{ type: "Event", id: "LIST" }],
    }),
    getUsers: builder.query<any, void>({
      query: () => "profile/users",
    }),
    toggleUserBlock: builder.mutation<void, any>({
      query: ({ userId, blocked }) => ({
        url: `profile/users/${userId}/block`,
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
    getEventParticipants: builder.query<any, number>({
      query: (eventId) => `/profile/${eventId}/participants`,
      providesTags: (result, error, eventId) => [
        { type: "EventParticipants", id: eventId },
      ],
    }),
    deleteUserEvent: builder.mutation({
      query: ({ id }) => ({
        url: `/events/user/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["UserEvents"],
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
  useGetEventParticipantsQuery,
  useDeleteUserEventMutation,
} = apiSlice;
