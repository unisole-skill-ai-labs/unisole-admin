import { configureStore, createSlice } from "@reduxjs/toolkit";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import authReducer, { logout } from "./store/auth-slice";

const STORAGE_KEY = "unisole-admin:baseUrl";
const DEFAULT_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:3000";

const settingsSlice = createSlice({
  name: "settings",
  initialState: {
    baseUrl: localStorage.getItem(STORAGE_KEY) || DEFAULT_BASE_URL,
  },
  reducers: {
    setBaseUrl(state, action) {
      state.baseUrl = action.payload;
      localStorage.setItem(STORAGE_KEY, action.payload);
    },
  },
});

export const { setBaseUrl } = settingsSlice.actions;

const baseQuery = fetchBaseQuery({
  baseUrl: "",
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    if (token) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  },
});

const baseQueryWithReauth = async (args, apiInstance, extraOptions) => {
  const result = await baseQuery(args, apiInstance, extraOptions);
  if (result.error && result.error.status === 401) {
    apiInstance.dispatch(logout());
  }
  return result;
};

export const adminApi = createApi({
  reducerPath: "adminApi",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "Students",
    "Colleges",
    "Categories",
    "Pathways",
    "Courses",
    "Modules",
    "Lessons",
    "Enrollments",
    "Payments",
  ],
  endpoints: (build) => ({
    // Students
    getStudents: build.query({
      query: (baseUrl) => ({ url: `${baseUrl}/api/admin/students` }),
      providesTags: ["Students"],
    }),
    updateStudent: build.mutation({
      query: ({ baseUrl, id, body }) => ({
        url: `${baseUrl}/api/admin/students/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Students"],
    }),
    deactivateStudent: build.mutation({
      query: ({ baseUrl, id }) => ({
        url: `${baseUrl}/api/admin/students/${id}/deactivate`,
        method: "POST",
      }),
      invalidatesTags: ["Students"],
    }),

    // Colleges
    getColleges: build.query({
      query: (baseUrl) => ({ url: `${baseUrl}/api/admin/colleges` }),
      providesTags: ["Colleges"],
    }),
    createCollege: build.mutation({
      query: ({ baseUrl, body }) => ({
        url: `${baseUrl}/api/admin/colleges`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Colleges"],
    }),
    updateCollege: build.mutation({
      query: ({ baseUrl, id, body }) => ({
        url: `${baseUrl}/api/admin/colleges/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Colleges"],
    }),

    // Categories
    getCategories: build.query({
      query: (baseUrl) => ({ url: `${baseUrl}/api/admin/categories` }),
      providesTags: ["Categories"],
    }),
    createCategory: build.mutation({
      query: ({ baseUrl, body }) => ({
        url: `${baseUrl}/api/admin/categories`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Categories"],
    }),
    updateCategory: build.mutation({
      query: ({ baseUrl, id, body }) => ({
        url: `${baseUrl}/api/admin/categories/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Categories"],
    }),

    // Pathways
    getPathways: build.query({
      query: (baseUrl) => ({ url: `${baseUrl}/api/admin/pathways` }),
      providesTags: ["Pathways"],
    }),
    getPathway: build.query({
      query: ({ baseUrl, id }) => ({ url: `${baseUrl}/api/admin/pathways/${id}` }),
      providesTags: (_res, _err, { id }) => [{ type: "Pathways", id }],
    }),
    createPathway: build.mutation({
      query: ({ baseUrl, body }) => ({
        url: `${baseUrl}/api/admin/pathways`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Pathways"],
    }),
    updatePathway: build.mutation({
      query: ({ baseUrl, id, body }) => ({
        url: `${baseUrl}/api/admin/pathways/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Pathways"],
    }),
    getPathwayCourses: build.query({
      query: ({ baseUrl, id }) => ({ url: `${baseUrl}/api/admin/pathways/${id}/courses` }),
      providesTags: (_res, _err, { id }) => [{ type: "Pathways", id: `${id}-courses` }],
    }),
    attachPathwayCategory: build.mutation({
      query: ({ baseUrl, pathwayId, categoryId }) => ({
        url: `${baseUrl}/api/admin/pathways/${pathwayId}/categories`,
        method: "POST",
        body: { categoryId },
      }),
      invalidatesTags: ["Pathways"],
    }),
    detachPathwayCategory: build.mutation({
      query: ({ baseUrl, pathwayId, categoryId }) => ({
        url: `${baseUrl}/api/admin/pathways/${pathwayId}/categories/${categoryId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Pathways"],
    }),
    attachPathwayCollege: build.mutation({
      query: ({ baseUrl, pathwayId, collegeId }) => ({
        url: `${baseUrl}/api/admin/pathways/${pathwayId}/colleges`,
        method: "POST",
        body: { collegeId },
      }),
      invalidatesTags: ["Pathways"],
    }),
    detachPathwayCollege: build.mutation({
      query: ({ baseUrl, pathwayId, collegeId }) => ({
        url: `${baseUrl}/api/admin/pathways/${pathwayId}/colleges/${collegeId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Pathways"],
    }),
    attachPathwayCourse: build.mutation({
      query: ({ baseUrl, pathwayId, courseId, position }) => ({
        url: `${baseUrl}/api/admin/pathways/${pathwayId}/courses`,
        method: "POST",
        body: { courseId, position },
      }),
      invalidatesTags: (_res, _err, { pathwayId }) => [
        "Pathways",
        { type: "Pathways", id: `${pathwayId}-courses` },
      ],
    }),
    detachPathwayCourse: build.mutation({
      query: ({ baseUrl, pathwayId, courseId }) => ({
        url: `${baseUrl}/api/admin/pathways/${pathwayId}/courses/${courseId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, { pathwayId }) => [
        "Pathways",
        { type: "Pathways", id: `${pathwayId}-courses` },
      ],
    }),

    // Courses
    getCourses: build.query({
      query: (baseUrl) => ({ url: `${baseUrl}/api/admin/courses` }),
      providesTags: ["Courses"],
    }),
    createCourse: build.mutation({
      query: ({ baseUrl, body }) => ({
        url: `${baseUrl}/api/admin/courses`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Courses"],
    }),
    updateCourse: build.mutation({
      query: ({ baseUrl, id, body }) => ({
        url: `${baseUrl}/api/admin/courses/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Courses"],
    }),
    getCourseModules: build.query({
      query: ({ baseUrl, id }) => ({ url: `${baseUrl}/api/admin/courses/${id}/modules` }),
      providesTags: (_res, _err, { id }) => [{ type: "Courses", id: `${id}-modules` }],
    }),
    attachCourseModule: build.mutation({
      query: ({ baseUrl, courseId, moduleId, position }) => ({
        url: `${baseUrl}/api/admin/courses/${courseId}/modules`,
        method: "POST",
        body: { moduleId, position },
      }),
      invalidatesTags: (_res, _err, { courseId }) => [
        "Courses",
        { type: "Courses", id: `${courseId}-modules` },
      ],
    }),
    detachCourseModule: build.mutation({
      query: ({ baseUrl, courseId, moduleId }) => ({
        url: `${baseUrl}/api/admin/courses/${courseId}/modules/${moduleId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, { courseId }) => [
        "Courses",
        { type: "Courses", id: `${courseId}-modules` },
      ],
    }),

    // Modules
    getModules: build.query({
      query: (baseUrl) => ({ url: `${baseUrl}/api/admin/modules` }),
      providesTags: ["Modules"],
    }),
    createModule: build.mutation({
      query: ({ baseUrl, body }) => ({
        url: `${baseUrl}/api/admin/modules`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Modules"],
    }),
    updateModule: build.mutation({
      query: ({ baseUrl, id, body }) => ({
        url: `${baseUrl}/api/admin/modules/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Modules"],
    }),
    getModuleLessons: build.query({
      query: ({ baseUrl, id }) => ({ url: `${baseUrl}/api/admin/modules/${id}/lessons` }),
      providesTags: (_res, _err, { id }) => [{ type: "Modules", id: `${id}-lessons` }],
    }),
    attachModuleLesson: build.mutation({
      query: ({ baseUrl, moduleId, lessonId, position }) => ({
        url: `${baseUrl}/api/admin/modules/${moduleId}/lessons`,
        method: "POST",
        body: { lessonId, position },
      }),
      invalidatesTags: (_res, _err, { moduleId }) => [
        "Modules",
        { type: "Modules", id: `${moduleId}-lessons` },
      ],
    }),
    detachModuleLesson: build.mutation({
      query: ({ baseUrl, moduleId, lessonId }) => ({
        url: `${baseUrl}/api/admin/modules/${moduleId}/lessons/${lessonId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, { moduleId }) => [
        "Modules",
        { type: "Modules", id: `${moduleId}-lessons` },
      ],
    }),

    // Lessons
    getLessons: build.query({
      query: (baseUrl) => ({ url: `${baseUrl}/api/admin/lessons` }),
      providesTags: ["Lessons"],
    }),
    createLesson: build.mutation({
      query: ({ baseUrl, body }) => ({
        url: `${baseUrl}/api/admin/lessons`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Lessons"],
    }),
    updateLesson: build.mutation({
      query: ({ baseUrl, id, body }) => ({
        url: `${baseUrl}/api/admin/lessons/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Lessons"],
    }),

    // Enrollments
    getEnrollments: build.query({
      query: (baseUrl) => ({ url: `${baseUrl}/api/admin/enrollments` }),
      providesTags: ["Enrollments"],
    }),
    createEnrollment: build.mutation({
      query: ({ baseUrl, body }) => ({
        url: `${baseUrl}/api/admin/enrollments`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Enrollments"],
    }),
    updateEnrollment: build.mutation({
      query: ({ baseUrl, id, body }) => ({
        url: `${baseUrl}/api/admin/enrollments/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Enrollments"],
    }),

    // Payments
    getPayments: build.query({
      query: (baseUrl) => ({ url: `${baseUrl}/api/admin/payments` }),
      providesTags: ["Payments"],
    }),
  }),
});

export const {
  // Students
  useGetStudentsQuery,
  useUpdateStudentMutation,
  useDeactivateStudentMutation,
  // Colleges
  useGetCollegesQuery,
  useCreateCollegeMutation,
  useUpdateCollegeMutation,
  // Categories
  useGetCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  // Pathways
  useGetPathwaysQuery,
  useGetPathwayQuery,
  useCreatePathwayMutation,
  useUpdatePathwayMutation,
  useGetPathwayCoursesQuery,
  useAttachPathwayCategoryMutation,
  useDetachPathwayCategoryMutation,
  useAttachPathwayCollegeMutation,
  useDetachPathwayCollegeMutation,
  useAttachPathwayCourseMutation,
  useDetachPathwayCourseMutation,
  // Courses
  useGetCoursesQuery,
  useCreateCourseMutation,
  useUpdateCourseMutation,
  useGetCourseModulesQuery,
  useAttachCourseModuleMutation,
  useDetachCourseModuleMutation,
  // Modules
  useGetModulesQuery,
  useCreateModuleMutation,
  useUpdateModuleMutation,
  useGetModuleLessonsQuery,
  useAttachModuleLessonMutation,
  useDetachModuleLessonMutation,
  // Lessons
  useGetLessonsQuery,
  useCreateLessonMutation,
  useUpdateLessonMutation,
  // Enrollments
  useGetEnrollmentsQuery,
  useCreateEnrollmentMutation,
  useUpdateEnrollmentMutation,
  // Payments
  useGetPaymentsQuery,
} = adminApi;

export const store = configureStore({
  reducer: {
    auth: authReducer,
    settings: settingsSlice.reducer,
    [adminApi.reducerPath]: adminApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(adminApi.middleware),
});
