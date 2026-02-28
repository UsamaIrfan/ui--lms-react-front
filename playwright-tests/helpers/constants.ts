/**
 * E2E Test Constants — credentials, IDs, routes, and role mappings
 */

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";
export const ORVAL_API_URL =
  process.env.NEXT_PUBLIC_ORVAL_API_URL ?? "http://localhost:3000";
export const BASE_URL = "http://localhost:3001";

// ─────────────────────────────────────────────
// Default Tenant & Branch (from seed data)
// ─────────────────────────────────────────────
export const DEFAULT_TENANT_ID = "00000000-0000-0000-0000-000000000001";
export const DEFAULT_BRANCH_ID = "00000000-0000-0000-0000-000000000001";

// ─────────────────────────────────────────────
// Role IDs
// ─────────────────────────────────────────────
export enum RoleId {
  ADMIN = 1,
  USER = 2,
  STUDENT = 3,
  TEACHER = 4,
  STAFF = 5,
  ACCOUNTANT = 6,
  PARENT = 7,
}

// ─────────────────────────────────────────────
// Test Users (from fake-data seed)
// ─────────────────────────────────────────────
export interface TestUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleId: RoleId;
  roleName: string;
  defaultRoute: string;
}

export const TEST_USERS: Record<string, TestUser> = {
  admin: {
    email: "admin@example.com",
    password: "secret",
    firstName: "Admin",
    lastName: "User",
    roleId: RoleId.ADMIN,
    roleName: "ADMIN",
    defaultRoute: "/en/admin-panel",
  },
  student: {
    email: "fake-student-1@example.com",
    password: "secret",
    firstName: "Student",
    lastName: "One",
    roleId: RoleId.STUDENT,
    roleName: "STUDENT",
    defaultRoute: "/en/student-portal",
  },
  teacher: {
    email: "fake-teacher-1@example.com",
    password: "secret",
    firstName: "Teacher",
    lastName: "One",
    roleId: RoleId.TEACHER,
    roleName: "TEACHER",
    defaultRoute: "/en/admin-panel",
  },
  staff: {
    email: "fake-staff-1@example.com",
    password: "secret",
    firstName: "Staff",
    lastName: "One",
    roleId: RoleId.STAFF,
    roleName: "STAFF",
    defaultRoute: "/en/admin-panel",
  },
  accountant: {
    email: "fake-accountant-1@example.com",
    password: "secret",
    firstName: "Accountant",
    lastName: "One",
    roleId: RoleId.ACCOUNTANT,
    roleName: "ACCOUNTANT",
    defaultRoute: "/en/admin-panel",
  },
  parent: {
    email: "fake-parent-1@example.com",
    password: "secret",
    firstName: "Parent",
    lastName: "One",
    roleId: RoleId.PARENT,
    roleName: "PARENT",
    defaultRoute: "/en/student-portal",
  },
  user: {
    email: "john.doe@example.com",
    password: "secret",
    firstName: "John",
    lastName: "Doe",
    roleId: RoleId.USER,
    roleName: "USER",
    defaultRoute: "/en/profile",
  },
};

// ─────────────────────────────────────────────
// Role → Accessible Routes mapping
// ─────────────────────────────────────────────
export const ROLE_ACCESSIBLE_ROUTES: Record<string, string[]> = {
  admin: [
    "/en/admin-panel",
    "/en/admin-panel/users",
    "/en/admin-panel/students/registrations",
    "/en/admin-panel/students/enquiries",
    "/en/admin-panel/students/attendance",
    "/en/admin-panel/students/fees",
    "/en/admin-panel/students/exams",
    "/en/admin-panel/students/materials",
    "/en/admin-panel/staff",
    "/en/admin-panel/staff/attendance",
    "/en/admin-panel/staff/leaves",
    "/en/admin-panel/staff/payroll",
    "/en/admin-panel/staff/timetable",
    "/en/admin-panel/academics/courses",
    "/en/admin-panel/academics/classes",
    "/en/admin-panel/academics/subjects",
    "/en/admin-panel/academics/year",
    "/en/admin-panel/accounts/income",
    "/en/admin-panel/accounts/expenses",
    "/en/admin-panel/accounts/reports",
    "/en/admin-panel/reports",
    "/en/admin-panel/notices",
    "/en/admin-panel/authorization/role-permissions",
    "/en/admin-panel/authorization/audit-logs",
    "/en/admin-panel/settings",
  ],
  student: [
    "/en/student-portal",
    "/en/student-portal/attendance",
    "/en/student-portal/fees",
    "/en/student-portal/exams",
    "/en/student-portal/materials",
    "/en/student-portal/assignments",
    "/en/student-portal/timetable",
    "/en/student-portal/notices",
  ],
  teacher: [
    "/en/admin-panel",
    "/en/staff-portal",
    "/en/admin-panel/students/attendance",
    "/en/admin-panel/students/exams",
    "/en/admin-panel/students/materials",
    "/en/admin-panel/academics/classes",
    "/en/admin-panel/academics/subjects",
    "/en/admin-panel/staff/timetable",
    "/en/admin-panel/notices",
  ],
  staff: [
    "/en/admin-panel",
    "/en/staff-portal",
    "/en/admin-panel/students/enquiries",
    "/en/admin-panel/students/registrations",
    "/en/admin-panel/students/attendance",
    "/en/admin-panel/students/materials",
    "/en/admin-panel/staff",
    "/en/admin-panel/staff/attendance",
    "/en/admin-panel/staff/leaves",
    "/en/admin-panel/staff/timetable",
    "/en/admin-panel/academics/classes",
    "/en/admin-panel/reports",
    "/en/admin-panel/notices",
  ],
  accountant: [
    "/en/admin-panel",
    "/en/admin-panel/students/fees",
    "/en/admin-panel/staff/payroll",
    "/en/admin-panel/accounts/income",
    "/en/admin-panel/accounts/expenses",
    "/en/admin-panel/accounts/reports",
    "/en/admin-panel/reports",
  ],
  parent: [
    "/en/student-portal",
    "/en/student-portal/attendance",
    "/en/student-portal/fees",
    "/en/student-portal/exams",
    "/en/student-portal/materials",
    "/en/student-portal/assignments",
    "/en/student-portal/timetable",
    "/en/student-portal/notices",
  ],
  user: ["/en/profile"],
};

// ─────────────────────────────────────────────
// Routes that each role should NOT be able to access
// ─────────────────────────────────────────────
export const ROLE_FORBIDDEN_ROUTES: Record<string, string[]> = {
  admin: ["/en/student-portal", "/en/staff-portal"],
  student: ["/en/admin-panel", "/en/staff-portal"],
  teacher: ["/en/student-portal"],
  staff: ["/en/student-portal"],
  accountant: ["/en/student-portal", "/en/staff-portal"],
  parent: ["/en/admin-panel", "/en/staff-portal"],
  user: ["/en/admin-panel", "/en/student-portal", "/en/staff-portal"],
};

// ─────────────────────────────────────────────
// Nav items each role should see (by IDs from navigation-config.ts)
// ─────────────────────────────────────────────
export const ROLE_NAV_ITEMS: Record<string, string[]> = {
  admin: [
    "admin-dashboard",
    "students",
    "staff",
    "academics",
    "accounts",
    "reports",
    "user-management",
    "authorization",
    "admin-notices",
    "settings",
  ],
  student: ["student-portal"],
  teacher: [
    "admin-dashboard",
    "staff-dashboard",
    "students",
    "academics",
    "admin-notices",
  ],
  staff: [
    "admin-dashboard",
    "staff-dashboard",
    "students",
    "staff",
    "academics",
    "reports",
    "admin-notices",
  ],
  accountant: ["admin-dashboard", "students", "accounts", "reports"],
  parent: ["student-portal"],
};
