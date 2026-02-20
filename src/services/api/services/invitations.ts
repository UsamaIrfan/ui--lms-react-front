import { customFetch } from "../generated/custom-fetch";

const API_BASE = "http://localhost:3000/api/v1/invitations";

// ─── Types ───────────────────────────────────────────────

export interface CreateInvitationDto {
  email: string;
  roleId: number;
  tenantId: string;
  branchId?: string;
}

export interface VerifyInvitationDto {
  hash: string;
}

export interface AcceptInvitationDto {
  hash: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface InvitationResponse {
  id: string;
  tenantId: string;
  branchId: string | null;
  email: string;
  roleId: number;
  status: "pending" | "accepted" | "expired" | "cancelled";
  invitedBy: number;
  tenantName?: string;
  branchName?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface VerifyInvitationResponse {
  email: string;
  tenantName: string;
  branchName?: string;
  roleName: string;
  roleId: number;
  existingUser: boolean;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  tokenExpires: number;
  user: Record<string, unknown>;
}

// ─── API Functions ───────────────────────────────────────

/** Send an invitation (admin, authenticated) */
export const sendInvitation = async (
  dto: CreateInvitationDto,
  options?: RequestInit
): Promise<{ data: InvitationResponse; status: number; headers: Headers }> => {
  return customFetch<{
    data: InvitationResponse;
    status: number;
    headers: Headers;
  }>(`${API_BASE}`, {
    ...options,
    method: "POST",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify(dto),
  });
};

/** Verify an invitation token (public, no auth) */
export const verifyInvitation = async (
  dto: VerifyInvitationDto,
  options?: RequestInit
): Promise<{
  data: VerifyInvitationResponse;
  status: number;
  headers: Headers;
}> => {
  return customFetch<{
    data: VerifyInvitationResponse;
    status: number;
    headers: Headers;
  }>(`${API_BASE}/verify`, {
    ...options,
    method: "POST",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify(dto),
  });
};

/** Accept an invitation (public, no auth) */
export const acceptInvitation = async (
  dto: AcceptInvitationDto,
  options?: RequestInit
): Promise<{ data: LoginResponse; status: number; headers: Headers }> => {
  return customFetch<{
    data: LoginResponse;
    status: number;
    headers: Headers;
  }>(`${API_BASE}/accept`, {
    ...options,
    method: "POST",
    headers: { "Content-Type": "application/json", ...options?.headers },
    body: JSON.stringify(dto),
  });
};

/** List all invitations for a tenant (admin, authenticated) */
export const listInvitations = async (
  tenantId: string,
  options?: RequestInit
): Promise<{
  data: InvitationResponse[];
  status: number;
  headers: Headers;
}> => {
  return customFetch<{
    data: InvitationResponse[];
    status: number;
    headers: Headers;
  }>(`${API_BASE}/tenant/${tenantId}`, {
    ...options,
    method: "GET",
    headers: { ...options?.headers },
  });
};

/** Cancel an invitation (admin, authenticated) */
export const cancelInvitation = async (
  id: string,
  options?: RequestInit
): Promise<{ data: undefined; status: number; headers: Headers }> => {
  return customFetch<{
    data: undefined;
    status: number;
    headers: Headers;
  }>(`${API_BASE}/${id}`, {
    ...options,
    method: "DELETE",
    headers: { ...options?.headers },
  });
};

/** Resend an invitation (admin, authenticated) */
export const resendInvitation = async (
  id: string,
  options?: RequestInit
): Promise<{ data: undefined; status: number; headers: Headers }> => {
  return customFetch<{
    data: undefined;
    status: number;
    headers: Headers;
  }>(`${API_BASE}/${id}/resend`, {
    ...options,
    method: "POST",
    headers: { ...options?.headers },
  });
};
