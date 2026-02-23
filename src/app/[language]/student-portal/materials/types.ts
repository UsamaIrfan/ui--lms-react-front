// ─────────────────────────────────────────────
// Materials Page Types
// ─────────────────────────────────────────────

export type MaterialType =
  | "document"
  | "video"
  | "assignment"
  | "link"
  | "presentation";

export interface MaterialItem {
  id: number;
  title: string;
  description?: string;
  subject: string;
  subjectId: number;
  type: MaterialType;
  filePath?: string;
  externalUrl?: string;
  fileSize: number;
  version: number;
  downloadCount: number;
  isActive: boolean;
  uploadDate: string;
}

export interface MaterialFilters {
  type?: MaterialType;
  subjectId?: number;
  search?: string;
  page?: number;
}
