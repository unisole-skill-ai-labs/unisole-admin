export type Role = "ADMIN" | "STUDENT" | "INSTRUCTOR";

export interface User {
  id: string;
  phone?: string;
  email?: string;
  name?: string;
  role: Role;
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
