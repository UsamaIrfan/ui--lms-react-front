import { expect, request } from "@playwright/test";
import { API_URL, DEFAULT_TENANT_ID } from "./constants";
import { getAdminToken } from "./auth";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export async function apiCreateNewUser(
  email: string,
  password: string,
  firstName: string,
  lastName: string
) {
  const createRequestContext = await request.newContext();
  const response = await createRequestContext.post(
    apiUrl + "/v1/auth/email/register",
    {
      data: {
        firstName,
        lastName,
        email,
        password,
      },
    }
  );

  expect(response.status()).toBe(204);
}

// ─────────────────────────────────────────────
// API CRUD helpers (direct API calls for test setup/teardown)
// ─────────────────────────────────────────────

/**
 * Create an authenticated API context with admin token + tenant headers.
 * Wraps Playwright request methods to prepend API_URL to every path,
 * avoiding URL resolution issues with baseURL dropping the /api prefix.
 */
async function adminContext() {
  const token = await getAdminToken();
  const raw = await request.newContext({
    extraHTTPHeaders: {
      Authorization: `Bearer ${token}`,
      "X-Tenant-ID": DEFAULT_TENANT_ID,
    },
  });
  return {
    ctx: {
      post: (path: string, options?: Parameters<typeof raw.post>[1]) =>
        raw.post(`${API_URL}${path}`, options),
      delete: (path: string, options?: Parameters<typeof raw.delete>[1]) =>
        raw.delete(`${API_URL}${path}`, options),
      get: (path: string, options?: Parameters<typeof raw.get>[1]) =>
        raw.get(`${API_URL}${path}`, options),
    },
    token,
  };
}

// ── Institutions ──

export async function apiCreateInstitution(data: {
  name: string;
  code: string;
  email?: string;
  phone?: string;
  city?: string;
  address?: string;
}) {
  const { ctx } = await adminContext();
  const res = await ctx.post("/v1/lms/institutions", { data });
  expect(res.ok()).toBeTruthy();
  return await res.json();
}

export async function apiDeleteInstitution(id: number) {
  const { ctx } = await adminContext();
  await ctx.delete(`/v1/lms/institutions/${id}`);
}

// ── Departments ──

export async function apiCreateDepartment(data: {
  name: string;
  code: string;
  institutionId: number;
  description?: string;
}) {
  const { ctx } = await adminContext();
  const res = await ctx.post("/v1/lms/departments", { data });
  expect(res.ok()).toBeTruthy();
  return await res.json();
}

export async function apiDeleteDepartment(id: number) {
  const { ctx } = await adminContext();
  await ctx.delete(`/v1/lms/departments/${id}`);
}

// ── Grade Classes ──

export async function apiCreateGradeClass(data: {
  name: string;
  numericGrade: number;
  institutionId: number;
  description?: string;
}) {
  const { ctx } = await adminContext();
  const res = await ctx.post("/v1/lms/grade-classes", { data });
  expect(res.ok()).toBeTruthy();
  return await res.json();
}

export async function apiDeleteGradeClass(id: number) {
  const { ctx } = await adminContext();
  await ctx.delete(`/v1/lms/grade-classes/${id}`);
}

// ── Sections ──

export async function apiCreateSection(data: {
  name: string;
  capacity: number;
  gradeClassId: number;
}) {
  const { ctx } = await adminContext();
  const res = await ctx.post("/v1/lms/sections", { data });
  expect(res.ok()).toBeTruthy();
  return await res.json();
}

export async function apiDeleteSection(id: number) {
  const { ctx } = await adminContext();
  await ctx.delete(`/v1/lms/sections/${id}`);
}

// ── Subjects ──

export async function apiCreateSubject(data: {
  name: string;
  code: string;
  departmentId: number;
  creditHours?: number;
  description?: string;
}) {
  const { ctx } = await adminContext();
  const res = await ctx.post("/v1/lms/subjects", { data });
  expect(res.ok()).toBeTruthy();
  return await res.json();
}

export async function apiDeleteSubject(id: number) {
  const { ctx } = await adminContext();
  await ctx.delete(`/v1/lms/subjects/${id}`);
}

// ── Academic Years ──

export async function apiCreateAcademicYear(data: {
  name: string;
  startDate: string;
  endDate: string;
  institutionId: number;
  isCurrent?: boolean;
}) {
  const { ctx } = await adminContext();
  const res = await ctx.post("/v1/lms/academic-years", { data });
  expect(res.ok()).toBeTruthy();
  return await res.json();
}

export async function apiDeleteAcademicYear(id: number) {
  const { ctx } = await adminContext();
  await ctx.delete(`/v1/lms/academic-years/${id}`);
}

// ── Terms ──

export async function apiCreateTerm(data: {
  name: string;
  startDate: string;
  endDate: string;
  academicYearId: number;
}) {
  const { ctx } = await adminContext();
  const res = await ctx.post("/v1/lms/terms", { data });
  expect(res.ok()).toBeTruthy();
  return await res.json();
}

export async function apiDeleteTerm(id: number) {
  const { ctx } = await adminContext();
  await ctx.delete(`/v1/lms/terms/${id}`);
}

// ── Notices ──

export async function apiCreateNotice(data: {
  title: string;
  content: string;
  targetRoles?: string[];
  isPublished?: boolean;
  publishDate?: string;
  expiresAt?: string;
}) {
  const { ctx } = await adminContext();
  const res = await ctx.post("/v1/notices", { data });
  expect(res.ok()).toBeTruthy();
  return await res.json();
}

export async function apiDeleteNotice(id: string) {
  const { ctx } = await adminContext();
  await ctx.delete(`/v1/notices/${id}`);
}

// ── Income ──

export async function apiCreateIncome(data: {
  category: string;
  amount: number;
  date: string;
  receivedFrom?: string;
  description?: string;
  referenceNumber?: string;
}) {
  const { ctx } = await adminContext();
  const res = await ctx.post("/v1/income", { data });
  expect(res.ok()).toBeTruthy();
  return await res.json();
}

export async function apiDeleteIncome(id: number) {
  const { ctx } = await adminContext();
  await ctx.delete(`/v1/income/${id}`);
}

// ── Expenses ──

export async function apiCreateExpense(data: {
  category: string;
  amount: number;
  date: string;
  paidTo?: string;
  description?: string;
  referenceNumber?: string;
  status?: string;
}) {
  const { ctx } = await adminContext();
  const res = await ctx.post("/v1/expenses", { data });
  expect(res.ok()).toBeTruthy();
  return await res.json();
}

export async function apiDeleteExpense(id: number) {
  const { ctx } = await adminContext();
  await ctx.delete(`/v1/expenses/${id}`);
}

// ── Staff Management ──

export async function apiCreateStaff(data: Record<string, unknown>) {
  const { ctx } = await adminContext();
  const res = await ctx.post("/v1/staff-management", { data });
  if (!res.ok()) {
    const body = await res.text();
    throw new Error(
      `apiCreateStaff failed (${res.status()}): ${body.substring(0, 300)}`
    );
  }
  return await res.json();
}

export async function apiDeleteStaff(id: number) {
  const { ctx } = await adminContext();
  await ctx.delete(`/v1/staff-management/${id}`);
}

// ── Timetables ──

export async function apiCreateTimetable(data: {
  name: string;
  classId: number;
  sectionId?: number;
  academicYearId: number;
}) {
  const { ctx } = await adminContext();
  const res = await ctx.post("/v1/timetables", { data });
  if (!res.ok()) {
    const body = await res.text();
    throw new Error(`apiCreateTimetable failed (${res.status()}): ${body}`);
  }
  return await res.json();
}

export async function apiDeleteTimetable(id: number) {
  const { ctx } = await adminContext();
  await ctx.delete(`/v1/timetables/${id}`);
}

// ── Generic fetch helpers ──

export async function apiGet(path: string) {
  const { ctx } = await adminContext();
  const res = await ctx.get(path);
  expect(res.ok()).toBeTruthy();
  return await res.json();
}
