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
    const token = (getState() as any)?.auth?.token;
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
    "Branches",
    "Categories",
    "Pathways",
    "Courses",
    "Modules",
    "Lessons",
    "Enrollments",
    "Payments",
    "Presentations",
    "Sessions",
    "Leads",
    "Tasks",
    "TeamMembers",
    "Departments",
    "Templates",
    "DailyLogs",
    "LeaderRadar",
  ],
  endpoints: (build) => ({
    // Students
    getStudents: build.query({
      query: (baseUrl) => ({ url: `${baseUrl}/api/admin/students` }),
      providesTags: ["Students"],
    }),
    createStudent: build.mutation({
      query: ({ baseUrl, body }) => ({
        url: `${baseUrl}/api/admin/students`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Students"],
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
    deleteCollege: build.mutation({
      query: ({ baseUrl, id }) => ({
        url: `${baseUrl}/api/admin/colleges/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Colleges", "Branches", "Presentations", "Sessions", "Leads"],
    }),
    getCollegeAnalytics: build.query({
      query: ({ baseUrl, id }) => ({ url: `${baseUrl}/api/admin/colleges/${id}/analytics` }),
      providesTags: (_res, _err, { id }) => [{ type: "Colleges", id }, "Branches", "Presentations", "Sessions", "Leads"],
    }),
    getLeadDiversification: build.query({
      query: (baseUrl) => ({ url: `${baseUrl}/api/admin/colleges/lead-diversification` }),
      providesTags: ["Colleges", "Sessions", "Leads", "Branches"],
    }),

    // Branches
    getBranches: build.query({
      query: (arg) => {
        const baseUrl = typeof arg === "string" ? arg : arg.baseUrl;
        const collegeId = typeof arg === "object" ? arg.collegeId : undefined;
        return {
          url: `${baseUrl}/api/admin/branches${collegeId ? `?collegeId=${collegeId}` : ""}`,
        };
      },
      providesTags: ["Branches"],
    }),
    createBranch: build.mutation({
      query: ({ baseUrl, body }) => ({
        url: `${baseUrl}/api/admin/branches`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Branches"],
    }),
    updateBranch: build.mutation({
      query: ({ baseUrl, id, body }) => ({
        url: `${baseUrl}/api/admin/branches/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Branches"],
    }),
    deleteBranch: build.mutation({
      query: ({ baseUrl, id }) => ({
        url: `${baseUrl}/api/admin/branches/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Branches"],
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

    // Presentations & Roadshows
    getPresentations: build.query({
      query: (arg) => {
        const baseUrl = typeof arg === "string" ? arg : arg.baseUrl;
        const collegeId = typeof arg === "object" ? arg.collegeId : undefined;
        return {
          url: `${baseUrl}/api/admin/presentations${
            collegeId ? `?collegeId=${collegeId}` : ""
          }`,
        };
      },
      providesTags: ["Presentations"],
    }),
    getPresentation: build.query({
      query: ({ baseUrl, id }) => ({
        url: `${baseUrl}/api/admin/presentations/${id}`,
      }),
      providesTags: ["Presentations"],
    }),
    createPresentation: build.mutation({
      query: ({ baseUrl, body }) => ({
        url: `${baseUrl}/api/admin/presentations`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Presentations"],
    }),
    updatePresentation: build.mutation({
      query: ({ baseUrl, id, body }) => ({
        url: `${baseUrl}/api/admin/presentations/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: ["Presentations"],
    }),
    deletePresentation: build.mutation({
      query: ({ baseUrl, id }) => ({
        url: `${baseUrl}/api/admin/presentations/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Presentations"],
    }),

    // Live Sessions
    getSessions: build.query({
      query: ({ baseUrl, presentationId }) => ({
        url: `${baseUrl}/api/admin/presentations/sessions/all${
          presentationId ? `?presentationId=${presentationId}` : ""
        }`,
      }),
      providesTags: ["Sessions"],
    }),
    getSession: build.query({
      query: ({ baseUrl, id }) => ({
        url: `${baseUrl}/api/admin/presentations/sessions/${id}`,
      }),
      providesTags: ["Sessions"],
    }),
    launchSession: build.mutation({
      query: ({ baseUrl, presentationId, body }) => ({
        url: `${baseUrl}/api/admin/presentations/${presentationId}/launch`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Sessions"],
    }),
    updateSessionStatus: build.mutation({
      query: ({ baseUrl, id, body }) => ({
        url: `${baseUrl}/api/admin/presentations/sessions/${id}/status`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Sessions"],
    }),
    getSessionLeads: build.query({
      query: ({ baseUrl, sessionId }) => ({
        url: `${baseUrl}/api/admin/presentations/sessions/${sessionId}/leads`,
      }),
      providesTags: ["Leads"],
    }),
    // ==================== TEAM & TASK MANAGEMENT ====================
    getTasks: build.query({
      query: ({ baseUrl, params }) => ({
        url: `${baseUrl}/api/admin/tasks`,
        params,
      }),
      providesTags: ["Tasks"],
    }),
    getTaskById: build.query({
      query: ({ baseUrl, id }) => ({
        url: `${baseUrl}/api/admin/tasks/${id}`,
      }),
      providesTags: ["Tasks"],
    }),
    createTask: build.mutation({
      query: ({ baseUrl, body }) => ({
        url: `${baseUrl}/api/admin/tasks`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Tasks", "LeaderRadar", "TeamMembers"],
    }),
    updateTask: build.mutation({
      query: ({ baseUrl, id, body }) => ({
        url: `${baseUrl}/api/admin/tasks/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Tasks", "LeaderRadar", "TeamMembers"],
    }),
    deleteTask: build.mutation({
      query: ({ baseUrl, id }) => ({
        url: `${baseUrl}/api/admin/tasks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tasks", "LeaderRadar", "TeamMembers"],
    }),
    toggleSubtask: build.mutation({
      query: ({ baseUrl, taskId, subtaskId, isCompleted }) => ({
        url: `${baseUrl}/api/admin/tasks/${taskId}/subtasks/${subtaskId}`,
        method: "PATCH",
        body: { isCompleted },
      }),
      invalidatesTags: ["Tasks"],
    }),
    addSubtask: build.mutation({
      query: ({ baseUrl, taskId, title }) => ({
        url: `${baseUrl}/api/admin/tasks/${taskId}/subtasks`,
        method: "POST",
        body: { title },
      }),
      invalidatesTags: ["Tasks"],
    }),
    deleteSubtask: build.mutation({
      query: ({ baseUrl, taskId, subtaskId }) => ({
        url: `${baseUrl}/api/admin/tasks/${taskId}/subtasks/${subtaskId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Tasks"],
    }),
    submitTaskProof: build.mutation({
      query: ({ baseUrl, taskId, body }) => ({
        url: `${baseUrl}/api/admin/tasks/${taskId}/submit`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Tasks", "LeaderRadar", "TeamMembers"],
    }),
    flagTaskBlocked: build.mutation({
      query: ({ baseUrl, taskId, body }) => ({
        url: `${baseUrl}/api/admin/tasks/${taskId}/block`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Tasks", "LeaderRadar", "TeamMembers"],
    }),
    reviewTask: build.mutation({
      query: ({ baseUrl, taskId, body }) => ({
        url: `${baseUrl}/api/admin/tasks/${taskId}/review`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Tasks", "LeaderRadar", "TeamMembers"],
    }),
    addTaskComment: build.mutation({
      query: ({ baseUrl, taskId, body }) => ({
        url: `${baseUrl}/api/admin/tasks/${taskId}/comments`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Tasks"],
    }),
    getLeaderRadar: build.query({
      query: (baseUrl) => ({
        url: `${baseUrl}/api/admin/tasks/radar`,
      }),
      providesTags: ["LeaderRadar"],
    }),
    getTeamMembers: build.query({
      query: ({ baseUrl, search }) => ({
        url: `${baseUrl}/api/admin/team/members`,
        params: search ? { search } : undefined,
      }),
      providesTags: ["TeamMembers"],
    }),
    createTeamMember: build.mutation({
      query: ({ baseUrl, body }) => ({
        url: `${baseUrl}/api/admin/team/members`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["TeamMembers", "LeaderRadar", "Departments"],
    }),
    updateTeamMember: build.mutation({
      query: ({ baseUrl, id, body }) => ({
        url: `${baseUrl}/api/admin/team/members/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["TeamMembers", "LeaderRadar", "Departments"],
    }),
    deleteTeamMember: build.mutation({
      query: ({ baseUrl, id }) => ({
        url: `${baseUrl}/api/admin/team/members/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["TeamMembers", "LeaderRadar", "Departments"],
    }),
    getDepartments: build.query({
      query: (baseUrl) => ({
        url: `${baseUrl}/api/admin/team/departments`,
      }),
      providesTags: ["Departments"],
    }),
    createDepartment: build.mutation({
      query: ({ baseUrl, body }) => ({
        url: `${baseUrl}/api/admin/team/departments`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Departments"],
    }),
    updateDepartment: build.mutation({
      query: ({ baseUrl, id, body }) => ({
        url: `${baseUrl}/api/admin/team/departments/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Departments", "TeamMembers"],
    }),
    deleteDepartment: build.mutation({
      query: ({ baseUrl, id }) => ({
        url: `${baseUrl}/api/admin/team/departments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Departments", "TeamMembers"],
    }),
    getTemplates: build.query({
      query: ({ baseUrl, departmentId }) => ({
        url: `${baseUrl}/api/admin/templates`,
        params: departmentId ? { departmentId } : undefined,
      }),
      providesTags: ["Templates"],
    }),
    createTemplate: build.mutation({
      query: ({ baseUrl, body }) => ({
        url: `${baseUrl}/api/admin/templates`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Templates"],
    }),
    updateTemplate: build.mutation({
      query: ({ baseUrl, id, body }) => ({
        url: `${baseUrl}/api/admin/templates/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Templates"],
    }),
    deleteTemplate: build.mutation({
      query: ({ baseUrl, id }) => ({
        url: `${baseUrl}/api/admin/templates/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Templates"],
    }),
    getDailyLogs: build.query({
      query: ({ baseUrl, date, userId }) => ({
        url: `${baseUrl}/api/admin/daily-logs`,
        params: { date, userId },
      }),
      providesTags: ["DailyLogs"],
    }),
    submitDailyLog: build.mutation({
      query: ({ baseUrl, body }) => ({
        url: `${baseUrl}/api/admin/daily-logs`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["DailyLogs"],
    }),
    getCompanyProgress: build.query({
      query: (baseUrl) => ({
        url: `${baseUrl}/api/admin/team/company-progress`,
      }),
      providesTags: ["TeamMembers", "Tasks", "DailyLogs", "LeaderRadar"],
    }),
    getMemberPerformance: build.query({
      query: ({ baseUrl, id }) => ({
        url: `${baseUrl}/api/admin/team/members/${id}/performance`,
      }),
      providesTags: (_res, _err, { id }) => [{ type: "TeamMembers", id }, "Tasks", "DailyLogs"],
    }),
    getTeamLeaderboard: build.query({
      query: (baseUrl) => ({
        url: `${baseUrl}/api/admin/team/leaderboard`,
      }),
      providesTags: ["TeamMembers", "Tasks", "DailyLogs"],
    }),
    getStandupSummary: build.query({
      query: ({ baseUrl, date }) => ({
        url: `${baseUrl}/api/admin/team/standup-summary`,
        params: date ? { date } : undefined,
      }),
      providesTags: ["DailyLogs", "TeamMembers"],
    }),
    nudgeTeamMember: build.mutation({
      query: ({ baseUrl, id, body }) => ({
        url: `${baseUrl}/api/admin/team/members/${id}/nudge`,
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  // Students
  useGetStudentsQuery,
  useCreateStudentMutation,
  useUpdateStudentMutation,
  useDeactivateStudentMutation,
  // Colleges
  useGetCollegesQuery,
  useGetCollegeAnalyticsQuery,
  useCreateCollegeMutation,
  useUpdateCollegeMutation,
  useDeleteCollegeMutation,
  // Branches
  useGetBranchesQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation,
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
  // Presentations & Sessions
  useGetPresentationsQuery,
  useGetPresentationQuery,
  useCreatePresentationMutation,
  useUpdatePresentationMutation,
  useDeletePresentationMutation,
  useGetSessionsQuery,
  useGetSessionQuery,
  useLaunchSessionMutation,
  useUpdateSessionStatusMutation,
  useGetSessionLeadsQuery,
  useGetLeadDiversificationQuery,
  // Team & Tasks
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useToggleSubtaskMutation,
  useAddSubtaskMutation,
  useDeleteSubtaskMutation,
  useSubmitTaskProofMutation,
  useFlagTaskBlockedMutation,
  useReviewTaskMutation,
  useAddTaskCommentMutation,
  useGetLeaderRadarQuery,
  useGetTeamMembersQuery,
  useCreateTeamMemberMutation,
  useUpdateTeamMemberMutation,
  useDeleteTeamMemberMutation,
  useGetDepartmentsQuery,
  useCreateDepartmentMutation,
  useUpdateDepartmentMutation,
  useDeleteDepartmentMutation,
  useGetTemplatesQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation,
  useGetDailyLogsQuery,
  useSubmitDailyLogMutation,
  // Super Admin Executive Analytics
  useGetCompanyProgressQuery,
  useGetMemberPerformanceQuery,
  useGetTeamLeaderboardQuery,
  useGetStandupSummaryQuery,
  useNudgeTeamMemberMutation,
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

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;



