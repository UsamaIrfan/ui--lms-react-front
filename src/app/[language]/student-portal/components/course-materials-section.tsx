"use client";

import {
  RiBookOpenLine,
  RiFileTextLine,
  RiVideoLine,
  RiLinkM,
  RiPresentationLine,
  RiDownloadLine,
  RiArrowRightSLine,
} from "@remixicon/react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "@/components/link";
import type { CourseMaterialItem } from "../types";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getFileIcon(type: string) {
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

function getFileTypeColor(type: string): string {
  switch (type) {
    case "video":
      return "bg-error-alpha-10 text-error-base";
    case "link":
      return "bg-information-alpha-10 text-information-base";
    case "presentation":
      return "bg-warning-alpha-10 text-warning-base";
    default:
      return "bg-primary-alpha-10 text-primary-base";
  }
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-PK", { day: "numeric", month: "short" });
  } catch {
    return dateStr;
  }
}

// ─────────────────────────────────────────────
// Course Materials Section
// ─────────────────────────────────────────────

interface CourseMaterialsSectionProps {
  materials: CourseMaterialItem[];
  title: string;
  labels: {
    noMaterials: string;
    viewAll: string;
    download: string;
  };
}

export function CourseMaterialsSection({
  materials,
  title,
  labels,
}: CourseMaterialsSectionProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-10 bg-primary-alpha-10">
              <RiBookOpenLine className="h-4 w-4 text-primary-base" />
            </div>
            <CardTitle>{title}</CardTitle>
          </div>
          <Link href="/student-portal/materials">
            <Button variant="ghost" size="sm" className="gap-1">
              {labels.viewAll}
              <RiArrowRightSLine className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {materials.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6">
            <RiBookOpenLine className="h-8 w-8 text-text-soft-400" />
            <p className="text-paragraph-sm text-text-soft-400">
              {labels.noMaterials}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {materials.map((material) => {
              const FileIcon = getFileIcon(material.fileType);

              return (
                <div
                  key={material.id}
                  className="flex items-center justify-between gap-3 rounded-10 border border-stroke-soft-200 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-10 ${getFileTypeColor(material.fileType)}`}
                    >
                      <FileIcon className="h-4 w-4" />
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-label-sm text-text-strong-950">
                        {material.title}
                      </span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-[10px]">
                          {material.subject}
                        </Badge>
                        <span className="text-paragraph-xs text-text-soft-400">
                          {formatDate(material.uploadDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                  {material.downloadUrl && (
                    <Button variant="ghost" size="icon" className="shrink-0">
                      <RiDownloadLine className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Skeleton
// ─────────────────────────────────────────────

export function CourseMaterialsSkeleton() {
  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-10" />
          <Skeleton className="h-5 w-32" />
        </div>
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="flex flex-col gap-3">
        <Skeleton className="h-16 w-full rounded-10" />
        <Skeleton className="h-16 w-full rounded-10" />
        <Skeleton className="h-16 w-full rounded-10" />
      </div>
    </Card>
  );
}
