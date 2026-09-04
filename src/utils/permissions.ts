export interface PermissionDefinition {
  key: string;
  label: string;
  category: "Workspace" | "Admissions & CRM" | "Curriculum & Academic" | "Campus & Ops" | "Finance & Team";
  description: string;
}

export const ALL_PERMISSIONS: PermissionDefinition[] = [
  // Workspace & Tasks
  {
    key: "my_work:view",
    label: "My Assigned Work",
    category: "Workspace",
    description: "Access personal tasks, CRM callbacks, and submit daily EOD standup logs",
  },
  {
    key: "worksole:manage",
    label: "WorkSole Projects & Canvas",
    category: "Workspace",
    description: "Manage projects, milestones, sub-projects, and task boards",
  },
  {
    key: "tasks:manage",
    label: "Task Operations & Radar",
    category: "Workspace",
    description: "Create, assign, review deliverables, and view team task radar",
  },

  // Admissions & CRM
  {
    key: "leads:view",
    label: "View CRM Leads",
    category: "Admissions & CRM",
    description: "View lead database, filter pipelines, and view analytics",
  },
  {
    key: "leads:manage",
    label: "Manage & Call Leads",
    category: "Admissions & CRM",
    description: "Log phone calls, change lead status, assign leads, and import CSVs",
  },

  // Campus & Operations
  {
    key: "colleges:view",
    label: "View Colleges & Campuses",
    category: "Campus & Ops",
    description: "View affiliated colleges, campuses, and branch student directories",
  },
  {
    key: "colleges:manage",
    label: "Manage Colleges & Campuses",
    category: "Campus & Ops",
    description: "Create, edit, and configure colleges, branches, and point of contacts",
  },
  {
    key: "presentations:manage",
    label: "Roadshow Decks & Sessions",
    category: "Campus & Ops",
    description: "Build live presentations, run audience sessions, and view engagement metrics",
  },
  {
    key: "students:manage",
    label: "Learners & Enrollments",
    category: "Campus & Ops",
    description: "View registered students and manage course enrollments",
  },

  // Curriculum & Academic
  {
    key: "curriculum:view",
    label: "View Pathways & Curriculum",
    category: "Curriculum & Academic",
    description: "Browse pathways, course syllabi, modules, and lessons",
  },
  {
    key: "curriculum:manage",
    label: "Author & Edit Curriculum",
    category: "Curriculum & Academic",
    description: "Create/edit pathways, courses, interactive modules, and lesson content",
  },

  // Finance & Team Management
  {
    key: "team:view",
    label: "View Team Directory",
    category: "Finance & Team",
    description: "View company staff members, performance leaderboard, and standup logs",
  },
  {
    key: "team:manage",
    label: "Manage Team & Roles",
    category: "Finance & Team",
    description: "Create staff accounts, assign roles, edit permissions, and manage departments",
  },
  {
    key: "payments:view",
    label: "Finance Ledger & Billing",
    category: "Finance & Team",
    description: "Inspect student payments, transactions, and sensitive financial ledger",
  },
  {
    key: "analytics:view",
    label: "Executive Analytics & Dashboard",
    category: "Finance & Team",
    description: "View high-level revenue, student enrollment, and executive telemetry",
  },
];

export const DESIGNATION_PRESETS: Record<
  string,
  { label: string; role: "ADMIN" | "MEMBER"; permissions: string[] }
> = {
  SUPER_ADMIN: {
    label: "Super Administrator (All Powers)",
    role: "ADMIN",
    permissions: ALL_PERMISSIONS.map((p) => p.key),
  },
  COUNSELOR: {
    label: "Admissions Counselor / Telecaller",
    role: "MEMBER",
    permissions: [
      "my_work:view",
      "leads:view",
      "leads:manage",
      "colleges:view",
      "students:manage",
    ],
  },
  OPERATIONS: {
    label: "Campus Operations & Roadshow Lead",
    role: "MEMBER",
    permissions: [
      "my_work:view",
      "colleges:view",
      "colleges:manage",
      "presentations:manage",
      "tasks:manage",
      "worksole:manage",
    ],
  },
  CONTENT_LEAD: {
    label: "Academic / Content Lead",
    role: "MEMBER",
    permissions: [
      "my_work:view",
      "curriculum:view",
      "curriculum:manage",
      "tasks:manage",
      "worksole:manage",
    ],
  },
  OPERATIONAL_ADMIN: {
    label: "Operations General Admin",
    role: "ADMIN",
    permissions: [
      "my_work:view",
      "worksole:manage",
      "tasks:manage",
      "leads:view",
      "leads:manage",
      "colleges:view",
      "colleges:manage",
      "curriculum:view",
      "curriculum:manage",
      "presentations:manage",
      "students:manage",
      "team:view",
      "analytics:view",
    ],
  },
  GENERAL_MEMBER: {
    label: "Standard Team Member",
    role: "MEMBER",
    permissions: ["my_work:view", "worksole:manage"],
  },
};

/**
 * Determine default permissions for a user based on their role and designation
 */
export function getDefaultPermissionsForUser(user: any): string[] {
  if (!user) return [];
  if (user.role === "SUPER_ADMIN") {
    return ALL_PERMISSIONS.map((p) => p.key);
  }

  // Check if designation matches a preset
  const des = (user.designation || "").toUpperCase();
  if (des.includes("COUNSEL") || des.includes("ADMISSION") || des.includes("TELECALL")) {
    return DESIGNATION_PRESETS.COUNSELOR.permissions;
  }
  if (des.includes("OP") || des.includes("CAMPUS") || des.includes("EVENT")) {
    return DESIGNATION_PRESETS.OPERATIONS.permissions;
  }
  if (des.includes("CONTENT") || des.includes("CURRICULUM") || des.includes("ACADEMIC") || des.includes("FACULTY")) {
    return DESIGNATION_PRESETS.CONTENT_LEAD.permissions;
  }

  if (user.role === "ADMIN") {
    return DESIGNATION_PRESETS.OPERATIONAL_ADMIN.permissions;
  }

  return DESIGNATION_PRESETS.GENERAL_MEMBER.permissions;
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(user: any, permissionKey: string): boolean {
  if (!user) return false;

  // Super Admin has universal unrestricted access to all features
  if (user.role === "SUPER_ADMIN") return true;

  // Payments / Billing ledger is strictly restricted
  if (permissionKey === "payments:view") {
    if (user.role === "SUPER_ADMIN") return true;
    const explicitPerms = user.metadata?.permissions;
    if (Array.isArray(explicitPerms)) {
      return explicitPerms.includes("payments:view");
    }
    return false;
  }

  // Check user explicit metadata permissions first
  const userExplicitPerms = user.metadata?.permissions;
  if (Array.isArray(userExplicitPerms) && userExplicitPerms.length > 0) {
    return userExplicitPerms.includes(permissionKey) || userExplicitPerms.includes("*");
  }

  // If user is ADMIN, grant standard permissions except super_admin specific keys
  if (user.role === "ADMIN" && !permissionKey.startsWith("super_admin:")) {
    return true;
  }

  // Fallback to default preset based on designation
  const defaultPerms = getDefaultPermissionsForUser(user);
  return defaultPerms.includes(permissionKey);
}
