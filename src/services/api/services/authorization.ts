/**
 * Hand-written authorization API service hooks.
 * These wrap the authorization endpoints that are not yet Orval-generated.
 */
import { customFetch } from "../generated/custom-fetch";

const API_BASE = "http://localhost:3000/api/v1/authorization";

// ─── Types ───────────────────────────────────────────────

export type Permission = {
  id: number;
  code: string;
  domain: string;
  description: string | null;
  createdAt: string;
};

export type RolePermission = {
  id: number;
  roleId: number;
  permissionId: number;
  scope: PermissionScopeEnum;
};

export type UserPermissionOverride = {
  id: number;
  userId: number;
  tenantId: string;
  permissionId: number;
  action: PermissionOverrideActionEnum;
  scope: PermissionScopeEnum | null;
  grantedBy: number | null;
  createdAt: string;
};

export type AuditLog = {
  id: string;
  tenantId: string;
  userId: number;
  action: string;
  resourceType: string | null;
  resourceId: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
};

export enum PermissionScopeEnum {
  PLATFORM = "platform",
  TENANT = "tenant",
  BRANCH = "branch",
  SECTION = "section",
  SELF = "self",
  PARENT = "parent",
}

export enum PermissionOverrideActionEnum {
  GRANT = "grant",
  REVOKE = "revoke",
}

export type MyPermissionsResponse = {
  permissions: Array<{
    code: string;
    scope: PermissionScopeEnum;
    source: string;
  }>;
};

// ─── Permissions API ─────────────────────────────────────

type WrappedResponse<T> = {
  data: T;
  status: number;
  headers: Headers;
};

export async function fetchAllPermissions(): Promise<
  WrappedResponse<Permission[]>
> {
  return customFetch<WrappedResponse<Permission[]>>(
    `${API_BASE}/permissions`,
    { method: "GET" }
  );
}

export async function fetchPermissionsByDomain(
  domain: string
): Promise<WrappedResponse<Permission[]>> {
  return customFetch<WrappedResponse<Permission[]>>(
    `${API_BASE}/permissions/domain/${encodeURIComponent(domain)}`,
    { method: "GET" }
  );
}

// ─── Role-Permission Mappings API ────────────────────────

export async function fetchRolePermissions(
  roleId: number
): Promise<WrappedResponse<RolePermission[]>> {
  return customFetch<WrappedResponse<RolePermission[]>>(
    `${API_BASE}/role-permissions/role/${roleId}`,
    { method: "GET" }
  );
}

export async function createRolePermission(data: {
  roleId: number;
  permissionId: number;
  scope: PermissionScopeEnum;
}): Promise<WrappedResponse<RolePermission>> {
  return customFetch<WrappedResponse<RolePermission>>(
    `${API_BASE}/role-permissions`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
}

export async function deleteRolePermission(
  roleId: number,
  permissionId: number
): Promise<WrappedResponse<undefined>> {
  return customFetch<WrappedResponse<undefined>>(
    `${API_BASE}/role-permissions/role/${roleId}/permission/${permissionId}`,
    { method: "DELETE" }
  );
}

// ─── User Permission Overrides API ──────────────────────

export async function fetchUserOverrides(
  userId: number
): Promise<WrappedResponse<UserPermissionOverride[]>> {
  return customFetch<WrappedResponse<UserPermissionOverride[]>>(
    `${API_BASE}/user-overrides/user/${userId}`,
    { method: "GET" }
  );
}

export async function createUserOverride(data: {
  userId: number;
  tenantId: string;
  permissionId: number;
  action: PermissionOverrideActionEnum;
  scope?: PermissionScopeEnum;
}): Promise<WrappedResponse<UserPermissionOverride>> {
  return customFetch<WrappedResponse<UserPermissionOverride>>(
    `${API_BASE}/user-overrides`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
}

export async function deleteUserOverride(
  id: number
): Promise<WrappedResponse<undefined>> {
  return customFetch<WrappedResponse<undefined>>(
    `${API_BASE}/user-overrides/${id}`,
    { method: "DELETE" }
  );
}

// ─── Audit Logs API ─────────────────────────────────────

export async function fetchAuditLogs(params?: {
  userId?: number;
  action?: string;
  resourceType?: string;
  limit?: number;
  offset?: number;
}): Promise<WrappedResponse<AuditLog[]>> {
  const searchParams = new URLSearchParams();
  if (params?.userId) searchParams.set("userId", String(params.userId));
  if (params?.action) searchParams.set("action", params.action);
  if (params?.resourceType)
    searchParams.set("resourceType", params.resourceType);
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.offset) searchParams.set("offset", String(params.offset));

  const query = searchParams.toString();
  return customFetch<WrappedResponse<AuditLog[]>>(
    `${API_BASE}/audit-logs${query ? `?${query}` : ""}`,
    { method: "GET" }
  );
}

// ─── My Permissions API ─────────────────────────────────

export async function fetchMyPermissions(): Promise<
  WrappedResponse<MyPermissionsResponse>
> {
  return customFetch<WrappedResponse<MyPermissionsResponse>>(
    `${API_BASE}/me/permissions`,
    { method: "GET" }
  );
}
