import { useQuery } from "@tanstack/react-query";
import { createQueryKeys } from "@/services/react-query/query-key-factory";
import { materialsControllerFindAllV1 } from "@/services/api/generated/materials-course-materials/materials-course-materials";
import { materialsControllerDownloadV1 } from "@/services/api/generated/materials-course-materials/materials-course-materials";
import type { MaterialItem, MaterialFilters } from "../types";

// ─────────────────────────────────────────────
// Query Keys
// ─────────────────────────────────────────────

export const materialsPageQueryKeys = createQueryKeys(
  ["student-portal-materials"],
  {
    list: () => ({
      key: [],
      sub: {
        by: (filters: MaterialFilters) => ({
          key: [filters],
        }),
      },
    }),
  }
);

// ─────────────────────────────────────────────
// Raw response bridge
// ─────────────────────────────────────────────

interface RawMaterial {
  id?: number;
  title?: string;
  description?: string;
  subjectId?: number;
  subject?: { id?: number; name?: string };
  subjectName?: string;
  type?: string;
  filePath?: string;
  externalUrl?: string;
  fileSize?: number;
  version?: number;
  downloadCount?: number;
  isActive?: boolean;
  createdAt?: string;
  uploadDate?: string;
}

interface RawMaterialsResponse {
  data?: RawMaterial[];
}

// ─────────────────────────────────────────────
// Data fetcher
// ─────────────────────────────────────────────

async function fetchMaterials(
  filters: MaterialFilters,
  signal?: AbortSignal
): Promise<MaterialItem[]> {
  try {
    const params: Record<string, unknown> = {};
    if (filters.type) params.type = filters.type;
    if (filters.subjectId) params.subjectId = filters.subjectId;
    if (filters.search) params.search = filters.search;
    if (filters.page) params.page = filters.page;

    const res = (await materialsControllerFindAllV1(
      params as Parameters<typeof materialsControllerFindAllV1>[0],
      { signal }
    )) as unknown as RawMaterialsResponse;

    const materials = res?.data ?? [];
    if (!Array.isArray(materials)) return [];

    return materials
      .filter((m) => m.isActive !== false)
      .map(
        (m): MaterialItem => ({
          id: m.id ?? 0,
          title: m.title ?? "",
          description: m.description ?? undefined,
          subject: m.subject?.name ?? m.subjectName ?? "",
          subjectId: m.subject?.id ?? m.subjectId ?? 0,
          type: (m.type as MaterialItem["type"]) ?? "document",
          filePath: m.filePath ?? undefined,
          externalUrl: m.externalUrl ?? undefined,
          fileSize: m.fileSize ?? 0,
          version: m.version ?? 1,
          downloadCount: m.downloadCount ?? 0,
          isActive: m.isActive ?? true,
          uploadDate: m.createdAt ?? m.uploadDate ?? "",
        })
      );
  } catch {
    return [];
  }
}

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

export function useMaterials(filters: MaterialFilters, enabled = true) {
  return useQuery({
    queryKey: materialsPageQueryKeys.list().sub.by(filters).key,
    queryFn: ({ signal }) => fetchMaterials(filters, signal),
    staleTime: 2 * 60 * 1000,
    enabled,
  });
}

// ─────────────────────────────────────────────
// Track download — fire-and-forget
// ─────────────────────────────────────────────

export async function trackDownload(id: number): Promise<void> {
  try {
    await materialsControllerDownloadV1(id);
  } catch {
    // silently ignore tracking errors
  }
}
