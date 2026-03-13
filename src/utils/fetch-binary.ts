import { getTokensInfo } from "@/services/auth/auth-tokens-info";
import { getTenantInfo } from "@/services/tenant/tenant-storage";

/**
 * Fetches a binary resource (e.g. PDF) from the API with auth & tenant headers.
 * Unlike `customFetch`, this returns a raw `Blob` instead of parsing JSON.
 */
export async function fetchBinary(url: string): Promise<Blob> {
  const requestHeaders: Record<string, string> = {};

  // Language header
  const language =
    typeof document !== "undefined"
      ? document.documentElement.lang || "en"
      : "en";
  requestHeaders["x-custom-lang"] = language;

  // Tenant/branch headers
  const tenantInfo = getTenantInfo();
  if (tenantInfo?.tenantId) {
    requestHeaders["X-Tenant-ID"] = tenantInfo.tenantId;
  }
  if (tenantInfo?.branchId) {
    requestHeaders["X-Branch-ID"] = tenantInfo.branchId;
  }

  // Auth token
  const tokens = getTokensInfo();
  if (tokens?.token) {
    requestHeaders["Authorization"] = `Bearer ${tokens.token}`;
  }

  const response = await fetch(url, { headers: requestHeaders });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: Failed to fetch binary`);
  }

  return response.blob();
}
