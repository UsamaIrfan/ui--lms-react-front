"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import { RoleEnum } from "@/services/api/types/role";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  RiShieldKeyholeLine,
  RiSearchLine,
  RiAddLine,
  RiDeleteBinLine,
  RiCheckLine,
} from "@remixicon/react";
import {
  fetchAllPermissions,
  fetchRolePermissions,
  createRolePermission,
  deleteRolePermission,
  PermissionScopeEnum,
} from "@/services/api/services/authorization";
import type {
  Permission,
  RolePermission,
} from "@/services/api/services/authorization";
import { useSnackbar } from "@/hooks/use-snackbar";

const ALL_ROLES = [
  { id: RoleEnum.ADMIN, key: "1" },
  { id: RoleEnum.USER, key: "2" },
  { id: RoleEnum.STUDENT, key: "3" },
  { id: RoleEnum.TEACHER, key: "4" },
  { id: RoleEnum.STAFF, key: "5" },
  { id: RoleEnum.ACCOUNTANT, key: "6" },
  { id: RoleEnum.PARENT, key: "7" },
];

function RolePermissionsPage() {
  const { t } = useTranslation("admin-panel-authorization");
  const { enqueueSnackbar } = useSnackbar();

  const [selectedRoleId, setSelectedRoleId] = useState<string>(
    String(RoleEnum.ADMIN)
  );
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [addingPermId, setAddingPermId] = useState<number | null>(null);
  const [removingPermId, setRemovingPermId] = useState<number | null>(null);
  const [selectedScope, setSelectedScope] = useState<PermissionScopeEnum>(
    PermissionScopeEnum.TENANT
  );
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadPermissions = useCallback(async () => {
    try {
      const res = await fetchAllPermissions();
      setPermissions(res.data ?? []);
    } catch (err) {
      console.error("[RolePermissions] Failed to load permissions:", err);
      enqueueSnackbar(
        t("admin-panel-authorization:rolePermissions.error"),
        { variant: "error" }
      );
    }
  }, [enqueueSnackbar, t]);

  const loadRolePermissions = useCallback(
    async (roleId: number) => {
      setLoading(true);
      setLoadError(null);
      try {
        const res = await fetchRolePermissions(roleId);
        setRolePermissions(res.data ?? []);
      } catch (err) {
        console.error(
          "[RolePermissions] Failed to load role permissions:",
          err
        );
        setRolePermissions([]);
        setLoadError(
          t("admin-panel-authorization:rolePermissions.loadError")
        );
        enqueueSnackbar(
          t("admin-panel-authorization:rolePermissions.error"),
          { variant: "error" }
        );
      } finally {
        setLoading(false);
      }
    },
    [enqueueSnackbar, t]
  );

  useEffect(() => {
    loadPermissions();
  }, [loadPermissions]);

  useEffect(() => {
    loadRolePermissions(Number(selectedRoleId));
  }, [selectedRoleId, loadRolePermissions]);

  const assignedPermissionIds = useMemo(
    () => new Set(rolePermissions.map((rp) => rp.permissionId)),
    [rolePermissions]
  );

  const domains = useMemo(() => {
    const domainSet = new Set(permissions.map((p) => p.domain));
    return Array.from(domainSet).sort();
  }, [permissions]);

  const filteredPermissions = useMemo(() => {
    if (!searchQuery.trim()) return permissions;
    const q = searchQuery.toLowerCase();
    return permissions.filter(
      (p) =>
        p.code.toLowerCase().includes(q) ||
        p.domain.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q)
    );
  }, [permissions, searchQuery]);

  // Group by domain
  const groupedPermissions = useMemo(() => {
    const groups: Record<string, Permission[]> = {};
    for (const perm of filteredPermissions) {
      if (!groups[perm.domain]) groups[perm.domain] = [];
      groups[perm.domain].push(perm);
    }
    return groups;
  }, [filteredPermissions]);

  const handleAddPermission = async (permissionId: number) => {
    setAddingPermId(permissionId);
    try {
      await createRolePermission({
        roleId: Number(selectedRoleId),
        permissionId,
        scope: selectedScope,
      });
      enqueueSnackbar(
        t("admin-panel-authorization:rolePermissions.permissionAdded"),
        { variant: "success" }
      );
      await loadRolePermissions(Number(selectedRoleId));
    } catch {
      enqueueSnackbar(
        t("admin-panel-authorization:rolePermissions.error"),
        { variant: "error" }
      );
    } finally {
      setAddingPermId(null);
    }
  };

  const handleRemovePermission = async (permissionId: number) => {
    setRemovingPermId(permissionId);
    try {
      await deleteRolePermission(Number(selectedRoleId), permissionId);
      enqueueSnackbar(
        t("admin-panel-authorization:rolePermissions.permissionRemoved"),
        { variant: "success" }
      );
      await loadRolePermissions(Number(selectedRoleId));
    } catch {
      enqueueSnackbar(
        t("admin-panel-authorization:rolePermissions.error"),
        { variant: "error" }
      );
    } finally {
      setRemovingPermId(null);
    }
  };

  const getRolePermissionScope = (permissionId: number) => {
    const rp = rolePermissions.find((r) => r.permissionId === permissionId);
    return rp?.scope;
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-8">
      <div className="grid gap-6 pt-6">
        {/* ── Page header ─────────────────────────── */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-base/10">
              <RiShieldKeyholeLine className="h-5 w-5 text-primary-base" />
            </div>
            <div>
              <h3 className="text-title-h5 font-bold text-text-strong-950">
                {t("admin-panel-authorization:rolePermissions.title")}
              </h3>
              <p className="text-paragraph-sm text-text-sub-600">
                {t("admin-panel-authorization:rolePermissions.description")}
              </p>
            </div>
          </div>
        </div>

        {/* ── Role selector + scope + search ──────── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:gap-4">
          <div className="w-48">
            <label className="mb-1 block text-label-xs text-text-sub-600">
              {t("admin-panel-authorization:rolePermissions.role")}
            </label>
            <Select
              value={selectedRoleId}
              onValueChange={setSelectedRoleId}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ALL_ROLES.map((role) => (
                  <SelectItem key={role.id} value={String(role.id)}>
                    {t(
                      `admin-panel-authorization:rolePermissions.roleOptions.${role.key}`
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-40">
            <label className="mb-1 block text-label-xs text-text-sub-600">
              {t("admin-panel-authorization:rolePermissions.selectScope")}
            </label>
            <Select
              value={selectedScope}
              onValueChange={(v) =>
                setSelectedScope(v as PermissionScopeEnum)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(PermissionScopeEnum).map((scope) => (
                  <SelectItem key={scope} value={scope}>
                    {t(
                      `admin-panel-authorization:rolePermissions.scopeOptions.${scope}`
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="relative flex-1">
            <RiSearchLine className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-soft-400" />
            <Input
              placeholder={t(
                "admin-panel-authorization:rolePermissions.search"
              )}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mt-5 pl-9"
            />
          </div>
          <span className="text-paragraph-sm text-text-sub-600">
            {t("admin-panel-authorization:rolePermissions.total", {
              count: rolePermissions.length,
            })}
          </span>
        </div>

        {/* ── Permissions by domain ───────────────── */}
        {loadError && (
          <div className="rounded-lg border border-error-base/30 bg-error-base/5 px-4 py-3 text-paragraph-sm text-error-base">
            {loadError}
          </div>
        )}
        {loading ? (
          <div className="flex h-60 items-center justify-center">
            <Spinner size="md" />
          </div>
        ) : (
          <div className="grid gap-4">
            {domains.map((domain) => {
              const domainPerms = groupedPermissions[domain];
              if (!domainPerms || domainPerms.length === 0) return null;

              return (
                <Card key={domain}>
                  <CardContent className="pt-4">
                    <h6 className="mb-3 text-label-sm font-semibold uppercase tracking-wider text-text-sub-600">
                      {t(
                        `admin-panel-authorization:rolePermissions.domains.${domain}`,
                        { defaultValue: domain }
                      )}
                    </h6>

                    <div className="rounded-lg border border-stroke-soft-200">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-62.5">
                              {t(
                                "admin-panel-authorization:rolePermissions.code"
                              )}
                            </TableHead>
                            <TableHead>
                              {t(
                                "admin-panel-authorization:rolePermissions.permission"
                              )}
                            </TableHead>
                            <TableHead className="w-25">
                              {t(
                                "admin-panel-authorization:rolePermissions.scope"
                              )}
                            </TableHead>
                            <TableHead className="w-25">
                              {t(
                                "admin-panel-authorization:rolePermissions.actions"
                              )}
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {domainPerms.map((perm) => {
                            const isAssigned = assignedPermissionIds.has(
                              perm.id
                            );
                            const scope = getRolePermissionScope(perm.id);

                            return (
                              <TableRow key={perm.id}>
                                <TableCell className="font-mono text-paragraph-xs">
                                  {perm.code}
                                </TableCell>
                                <TableCell className="text-paragraph-sm text-text-sub-600">
                                  {perm.description ?? "—"}
                                </TableCell>
                                <TableCell>
                                  {isAssigned && scope ? (
                                    <Badge variant="secondary">{scope}</Badge>
                                  ) : (
                                    <span className="text-text-soft-400">
                                      —
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell>
                                  {isAssigned ? (
                                    <div className="flex items-center gap-1">
                                      <Badge variant="success">
                                        <RiCheckLine className="mr-1 h-3 w-3" />
                                        {t(
                                          "admin-panel-authorization:rolePermissions.assigned"
                                        )}
                                      </Badge>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 text-error-base hover:text-error-base"
                                        onClick={() =>
                                          handleRemovePermission(perm.id)
                                        }
                                        disabled={removingPermId === perm.id}
                                      >
                                        {removingPermId === perm.id ? (
                                          <Spinner size="sm" />
                                        ) : (
                                          <RiDeleteBinLine className="h-3.5 w-3.5" />
                                        )}
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="h-7"
                                      onClick={() =>
                                        handleAddPermission(perm.id)
                                      }
                                      disabled={addingPermId === perm.id}
                                    >
                                      {addingPermId === perm.id ? (
                                        <Spinner size="sm" className="mr-1" />
                                      ) : (
                                        <RiAddLine className="mr-1 h-3.5 w-3.5" />
                                      )}
                                      {t(
                                        "admin-panel-authorization:rolePermissions.assign"
                                      )}
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {filteredPermissions.length === 0 && (
              <div className="flex h-40 flex-col items-center justify-center gap-2 text-center">
                <RiShieldKeyholeLine className="h-10 w-10 text-text-soft-400" />
                <p className="text-paragraph-sm text-text-soft-400">
                  {t(
                    "admin-panel-authorization:rolePermissions.noPermissions"
                  )}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default withPageRequiredAuth(RolePermissionsPage, {
  roles: [RoleEnum.ADMIN],
});
