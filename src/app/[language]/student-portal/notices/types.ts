// ─────────────────────────────────────────────
// Notices Page Types
// ─────────────────────────────────────────────

export interface NoticeDetail {
  id: string;
  title: string;
  content: string;
  publishDate: string;
  expiresAt?: string;
  attachments: string[];
  isRead: boolean;
  targetRoles: string[];
  createdAt: string;
}

export type NoticeFilter = "all" | "unread";
