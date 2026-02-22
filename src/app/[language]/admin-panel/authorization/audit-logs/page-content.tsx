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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  RiHistoryLine,
  RiSearchLine,
  RiFilterLine,
  RiCloseLine,
  RiRefreshLine,
} from "@remixicon/react";
import { fetchAuditLogs } from "@/services/api/services/authorization";
import type { AuditLog } from "@/services/api/services/authorization";

const PAGE_SIZE = 50;

function AuditLogsPage() {
  const { t } = useTranslation("admin-panel-authorization");

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Filters
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterUserId, setFilterUserId] = useState("");
  const [filterAction, setFilterAction] = useState("");
  const [filterResource, setFilterResource] = useState("");
  const [activeFilters, setActiveFilters] = useState<{
    userId?: number;
    action?: string;
    resourceType?: string;
  }>({});

  const loadLogs = useCallback(
    async (reset = false) => {
      const currentOffset = reset ? 0 : offset;
      if (reset) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      try {
        const res = await fetchAuditLogs({
          ...activeFilters,
          limit: PAGE_SIZE,
          offset: currentOffset,
        });
        const newLogs = res.data ?? [];

        if (reset) {
          setLogs(newLogs);
          setOffset(PAGE_SIZE);
        } else {
          setLogs((prev) => [...prev, ...newLogs]);
          setOffset((prev) => prev + PAGE_SIZE);
        }
        setHasMore(newLogs.length >= PAGE_SIZE);
      } catch {
        if (reset) setLogs([]);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [offset, activeFilters]
  );

  useEffect(() => {
    loadLogs(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeFilters]);

  const handleApplyFilters = () => {
    const filters: typeof activeFilters = {};
    if (filterUserId.trim()) filters.userId = Number(filterUserId);
    if (filterAction.trim()) filters.action = filterAction.trim();
    if (filterResource.trim()) filters.resourceType = filterResource.trim();
    setActiveFilters(filters);
    setFilterOpen(false);
  };

  const handleClearFilters = () => {
    setFilterUserId("");
    setFilterAction("");
    setFilterResource("");
    setActiveFilters({});
    setFilterOpen(false);
  };

  const hasActiveFilter = Object.keys(activeFilters).length > 0;

  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return logs;
    const q = searchQuery.toLowerCase();
    return logs.filter(
      (log) =>
        log.action.toLowerCase().includes(q) ||
        (log.resourceType ?? "").toLowerCase().includes(q) ||
        (log.resourceId ?? "").toLowerCase().includes(q) ||
        String(log.userId).includes(q)
    );
  }, [logs, searchQuery]);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pb-8">
      <div className="grid gap-6 pt-6">
        {/* ── Page header ─────────────────────────── */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-base/10">
              <RiHistoryLine className="h-5 w-5 text-primary-base" />
            </div>
            <div>
              <h3 className="text-title-h5 font-bold text-text-strong-950">
                {t("admin-panel-authorization:auditLogs.title")}
              </h3>
              <p className="text-paragraph-sm text-text-sub-600">
                {t("admin-panel-authorization:auditLogs.description")}
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadLogs(true)}
            disabled={loading}
          >
            <RiRefreshLine className="mr-1 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* ── Search & filter bar ─────────────────── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <RiSearchLine className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-soft-400" />
            <Input
              placeholder={t("admin-panel-authorization:auditLogs.search")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Popover open={filterOpen} onOpenChange={setFilterOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant={hasActiveFilter ? "default" : "outline"}
                  size="sm"
                >
                  <RiFilterLine className="mr-1 h-4 w-4" />
                  {t("admin-panel-authorization:auditLogs.filters.title")}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72">
                <div className="grid gap-3">
                  <div>
                    <label className="mb-1 block text-label-xs text-text-sub-600">
                      {t("admin-panel-authorization:auditLogs.filterByUser")}
                    </label>
                    <Input
                      type="number"
                      value={filterUserId}
                      onChange={(e) => setFilterUserId(e.target.value)}
                      placeholder="User ID"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-label-xs text-text-sub-600">
                      {t(
                        "admin-panel-authorization:auditLogs.filterByAction"
                      )}
                    </label>
                    <Input
                      value={filterAction}
                      onChange={(e) => setFilterAction(e.target.value)}
                      placeholder="e.g. academic.student.read"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-label-xs text-text-sub-600">
                      {t(
                        "admin-panel-authorization:auditLogs.filterByResource"
                      )}
                    </label>
                    <Input
                      value={filterResource}
                      onChange={(e) => setFilterResource(e.target.value)}
                      placeholder="e.g. student_attendance"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={handleApplyFilters}
                    >
                      {t("admin-panel-authorization:auditLogs.filters.apply")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearFilters}
                    >
                      {t("admin-panel-authorization:auditLogs.filters.clear")}
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            {hasActiveFilter && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-text-sub-600 hover:text-error-base"
                onClick={handleClearFilters}
              >
                <RiCloseLine className="h-4 w-4" />
              </Button>
            )}
            <span className="text-paragraph-sm text-text-sub-600">
              {t("admin-panel-authorization:auditLogs.total", {
                count: filteredLogs.length,
              })}
            </span>
          </div>
        </div>

        {/* ── Audit Logs Table ────────────────────── */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex h-60 items-center justify-center">
                <Spinner size="md" />
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="flex h-60 flex-col items-center justify-center gap-2 text-center">
                <RiHistoryLine className="h-10 w-10 text-text-soft-400" />
                <p className="text-paragraph-sm text-text-soft-400">
                  {searchQuery || hasActiveFilter
                    ? t("admin-panel-authorization:auditLogs.noResults")
                    : t("admin-panel-authorization:auditLogs.empty")}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">
                        {t("admin-panel-authorization:auditLogs.userId")}
                      </TableHead>
                      <TableHead className="min-w-50">
                        {t("admin-panel-authorization:auditLogs.action")}
                      </TableHead>
                      <TableHead>
                        {t("admin-panel-authorization:auditLogs.resourceType")}
                      </TableHead>
                      <TableHead className="w-20">
                        {t("admin-panel-authorization:auditLogs.resourceId")}
                      </TableHead>
                      <TableHead>
                        {t("admin-panel-authorization:auditLogs.ipAddress")}
                      </TableHead>
                      <TableHead className="min-w-40">
                        {t("admin-panel-authorization:auditLogs.timestamp")}
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-paragraph-sm text-text-sub-600">
                          #{log.userId}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="font-mono">
                            {log.action}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-paragraph-sm text-text-sub-600">
                          {log.resourceType ?? "—"}
                        </TableCell>
                        <TableCell className="text-paragraph-sm text-text-sub-600">
                          {log.resourceId ?? "—"}
                        </TableCell>
                        <TableCell className="text-paragraph-sm text-text-sub-600">
                          {log.ipAddress ?? "—"}
                        </TableCell>
                        <TableCell className="text-paragraph-sm text-text-sub-600">
                          {formatDate(log.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Load more ───────────────────────────── */}
        {hasMore && !loading && filteredLogs.length > 0 && (
          <div className="flex justify-center">
            <Button
              variant="outline"
              onClick={() => loadLogs(false)}
              disabled={loadingMore}
            >
              {loadingMore && <Spinner size="sm" className="mr-2" />}
              {t("admin-panel-authorization:auditLogs.loadMore")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export default withPageRequiredAuth(AuditLogsPage, {
  roles: [RoleEnum.ADMIN],
});
