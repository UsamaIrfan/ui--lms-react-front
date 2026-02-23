"use client";

import {
  RiFileTextLine,
  RiVideoLine,
  RiLinkM,
  RiPresentationLine,
  RiDownloadLine,
  RiExternalLinkLine,
  RiBookOpenLine,
} from "@remixicon/react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import type { MaterialItem, MaterialType } from "../types";
import { trackDownload } from "../queries/queries";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getFileIcon(type: MaterialType) {
  switch (type) {
    case "video":
      return RiVideoLine;
    case "link":
      return RiLinkM;
    case "presentation":
      return RiPresentationLine;
    default:
      return RiFileTextLine;
  }
}

function getTypeColor(type: MaterialType): string {
  switch (type) {
    case "video":
      return "bg-error-alpha-10 text-error-base";
    case "link":
      return "bg-primary-alpha-10 text-primary-base";
    case "presentation":
      return "bg-warning-alpha-10 text-warning-base";
    default:
      return "bg-success-alpha-10 text-success-base";
  }
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-PK", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

// ─────────────────────────────────────────────
// Material List
// ─────────────────────────────────────────────

interface MaterialListProps {
  materials: MaterialItem[];
  labels: {
    noMaterials: string;
    download: string;
    viewLink: string;
    uploadedOn: string;
    downloads: string;
    version: string;
    size: string;
  };
  typeLabels: Record<MaterialType, string>;
}

export function MaterialList({
  materials,
  labels,
  typeLabels,
}: MaterialListProps) {
  if (materials.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16">
        <RiBookOpenLine className="size-12 text-text-soft-400" />
        <p className="text-paragraph-sm text-text-soft-400">
          {labels.noMaterials}
        </p>
      </div>
    );
  }

  const handleDownload = (material: MaterialItem) => {
    trackDownload(material.id);
    if (material.filePath) {
      window.open(material.filePath, "_blank");
    }
  };

  const handleOpenLink = (material: MaterialItem) => {
    if (material.externalUrl) {
      window.open(material.externalUrl, "_blank");
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {materials.map((material) => {
        const FileIcon = getFileIcon(material.type);

        return (
          <div
            key={material.id}
            className="flex items-center justify-between gap-4 rounded-16 border border-stroke-soft-200 p-4 transition-colors hover:bg-bg-weak-50"
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-10",
                  getTypeColor(material.type)
                )}
              >
                <FileIcon className="size-5" />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-label-sm text-text-strong-950">
                  {material.title}
                </span>
                {material.description && (
                  <p className="line-clamp-1 text-paragraph-xs text-text-soft-400">
                    {material.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary" className="text-[10px]">
                    {material.subject}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    {typeLabels[material.type]}
                  </Badge>
                  <span className="text-paragraph-xs text-text-soft-400">
                    {labels.uploadedOn} {formatDate(material.uploadDate)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-paragraph-xs text-text-soft-400">
                  {material.fileSize > 0 && (
                    <span>
                      {labels.size}: {formatFileSize(material.fileSize)}
                    </span>
                  )}
                  <span>
                    {labels.version}
                    {material.version}
                  </span>
                  <span>
                    {material.downloadCount} {labels.downloads}
                  </span>
                </div>
              </div>
            </div>
            <div className="shrink-0">
              {material.type === "link" ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenLink(material)}
                  disabled={!material.externalUrl}
                >
                  <RiExternalLinkLine className="mr-1.5 size-3.5" />
                  {labels.viewLink}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(material)}
                  disabled={!material.filePath}
                >
                  <RiDownloadLine className="mr-1.5 size-3.5" />
                  {labels.download}
                </Button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
