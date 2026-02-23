import { useQuery } from "@tanstack/react-query";
import { createQueryKeys } from "@/services/react-query/query-key-factory";
import { noticesControllerGetMyNoticesV1 } from "@/services/api/generated/notices/notices";
import type { NoticeDetail } from "../types";

// ─────────────────────────────────────────────
// Query Keys
// ─────────────────────────────────────────────

export const noticesPageQueryKeys = createQueryKeys(
  ["student-portal-notices"],
  {
    list: () => ({ key: [] }),
  }
);

// ─────────────────────────────────────────────
// Raw response shape (type-safe bridge for Orval
// void-typed responses)
// ─────────────────────────────────────────────

interface RawNotice {
  id?: string;
  title?: string;
  content?: string;
  attachments?: string[];
  isPublished?: boolean;
  publishDate?: string | null;
  expiresAt?: string | null;
  targetRoles?: string[];
  isRead?: boolean;
  createdAt?: string;
}

interface RawNoticesResponse {
  data?: RawNotice[];
}

// ─────────────────────────────────────────────
// Data fetcher
// ─────────────────────────────────────────────

async function fetchNotices(signal?: AbortSignal): Promise<NoticeDetail[]> {
  const res = (await noticesControllerGetMyNoticesV1(undefined, {
    signal,
  })) as unknown as RawNoticesResponse;

  const notices = res?.data ?? [];
  if (!Array.isArray(notices)) return [];

  return notices.map(
    (n): NoticeDetail => ({
      id: String(n.id ?? ""),
      title: n.title ?? "",
      content: n.content ?? "",
      publishDate: n.publishDate ?? n.createdAt ?? "",
      expiresAt: n.expiresAt ?? undefined,
      attachments: Array.isArray(n.attachments) ? n.attachments : [],
      isRead: n.isRead ?? false,
      targetRoles: Array.isArray(n.targetRoles) ? n.targetRoles : [],
      createdAt: n.createdAt ?? "",
    })
  );
}

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

export function useNotices() {
  return useQuery({
    queryKey: noticesPageQueryKeys.list().key,
    queryFn: ({ signal }) => fetchNotices(signal),
    staleTime: 2 * 60 * 1000,
  });
}
