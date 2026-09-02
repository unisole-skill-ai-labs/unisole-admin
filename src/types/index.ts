export type Role = "SUPER_ADMIN" | "ADMIN" | "MEMBER" | "STUDENT" | "INSTRUCTOR";

export interface User {
  id: string;
  phone?: string;
  email?: string;
  name?: string;
  role: Role;
  designation?: string;
  departmentId?: string;
  activeTasksCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Student {
  id: string;
  name?: string;
  phone?: string;
  email?: string;
  status?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface College {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  createdAt?: string;
}

export interface Pathway {
  id: string;
  title: string;
  slug?: string;
  description?: string;
  shortDescription?: string;
  pricePaise?: number;
  isPublished?: boolean;
  categories?: Category[];
  colleges?: College[];
  courses?: Course[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Course {
  id: string;
  title: string;
  slug?: string;
  description?: string;
  modules?: Module[];
  createdAt?: string;
}

export interface Module {
  id: string;
  title: string;
  courseId?: string;
  position?: number;
  lessons?: Lesson[];
  createdAt?: string;
}

export interface Lesson {
  id: string;
  title: string;
  moduleId?: string;
  videoUrl?: string;
  durationSeconds?: number;
  position?: number;
  isFreePreview?: boolean;
  createdAt?: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  pathwayId: string;
  student?: Student;
  pathway?: Pathway;
  status: string;
  enrolledAt?: string;
}

export interface Payment {
  id: string;
  studentId?: string;
  student?: Student;
  pathwayId?: string;
  pathway?: Pathway;
  orderId?: string;
  paymentId?: string;
  amountPaise: number;
  status: string;
  createdAt?: string;
}

// ============================================================
// WORKSOLE 4-TIER HIERARCHY TYPES
// ============================================================

export type ProjectStatus = "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "ARCHIVED";
export type SubProjectStatus = "TODO" | "IN_PROGRESS" | "BLOCKED" | "COMPLETED";
export type TaskStatus =
  | "TODO"
  | "IN_PROGRESS"
  | "BLOCKED"
  | "SUBMITTED_FOR_REVIEW"
  | "CHANGES_REQUESTED"
  | "COMPLETED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface Department {
  id: string;
  name: string;
  code: string;
  color?: string;
  description?: string;
  leadId?: string;
  lead?: {
    id: string;
    name?: string;
    phone?: string;
    role?: string;
  };
}

export interface TaskSubtask {
  id: string;
  taskId: string;
  title: string;
  isCompleted: boolean;
  orderIndex: number;
  createdAt?: string;
}

export interface TaskComment {
  id: string;
  taskId: string;
  userId: string;
  userName?: string;
  userPhone?: string;
  userRole?: string;
  content: string;
  activityType: string;
  createdAt: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId?: string;
  projectName?: string;
  projectCode?: string;
  subProjectId?: string;
  subProjectName?: string;
  assigneeId?: string;
  assigneeName?: string;
  assigneePhone?: string;
  assigneeRole?: string;
  assignee?: {
    id: string;
    name?: string;
    phone?: string;
    role?: string;
  };
  reporterId?: string;
  departmentId?: string;
  departmentName?: string;
  departmentCode?: string;
  departmentColor?: string;
  templateId?: string;
  dueDate?: string;
  estimatedHours?: number;
  submissionProofUrl?: string;
  submissionNotes?: string;
  blockedReason?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  relatedEntityName?: string;
  completedAt?: string;
  subtasksCount?: number;
  subtasksCompleted?: number;
  subtasks?: TaskSubtask[];
  comments?: TaskComment[];
  createdAt: string;
  updatedAt: string;
}

export interface SubProject {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  leadId?: string;
  lead?: {
    id: string;
    name?: string;
    phone?: string;
    role?: string;
  };
  status: SubProjectStatus;
  orderIndex: number;
  startDate?: string;
  targetEndDate?: string;
  completedAt?: string;
  totalTasks?: number;
  completedTasks?: number;
  progressPercentage?: number;
  tasks?: TaskItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  description?: string;
  departmentId?: string;
  department?: Department;
  leadId?: string;
  lead?: {
    id: string;
    name?: string;
    phone?: string;
    role?: string;
    designation?: string;
  };
  createdById?: string;
  createdBy?: {
    id: string;
    name?: string;
    phone?: string;
  };
  status: ProjectStatus;
  priority: TaskPriority;
  startDate?: string;
  targetEndDate?: string;
  completedAt?: string;
  color: string;
  icon: string;
  subProjectsCount?: number;
  totalTasks?: number;
  completedTasks?: number;
  activeTasks?: number;
  blockedTasks?: number;
  progressPercentage?: number;
  subProjects?: SubProject[];
  unassignedTasks?: TaskItem[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectHierarchy {
  project: Project;
  subProjects: SubProject[];
  unassignedTasks: TaskItem[];
}
