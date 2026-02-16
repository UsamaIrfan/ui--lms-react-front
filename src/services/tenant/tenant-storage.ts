import Cookies from "js-cookie";

const TENANT_STORAGE_KEY = "tenant-context-data";

export interface TenantInfo {
  tenantId: string | null;
  branchId: string | null;
}

export function getTenantInfo(): TenantInfo | null {
  return JSON.parse(Cookies.get(TENANT_STORAGE_KEY) ?? "null") as TenantInfo;
}

export function setTenantInfo(info: TenantInfo | null): void {
  if (info && info.tenantId) {
    Cookies.set(TENANT_STORAGE_KEY, JSON.stringify(info));
  } else {
    Cookies.remove(TENANT_STORAGE_KEY);
  }
}
