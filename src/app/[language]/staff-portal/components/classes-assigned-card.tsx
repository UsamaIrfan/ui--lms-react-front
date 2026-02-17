"use client";

import { RiGroupLine, RiBookOpenLine } from "@remixicon/react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { AssignedClass } from "../types";

// ─────────────────────────────────────────────
// Classes Assigned Card
// ─────────────────────────────────────────────

interface ClassesAssignedCardProps {
  classes: AssignedClass[];
  title: string;
  labels: {
    noClasses: string;
    students: string;
  };
}

export function ClassesAssignedCard({
  classes,
  title,
  labels,
}: ClassesAssignedCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-label-md">
          <RiBookOpenLine className="h-4 w-4 text-primary-base" />
          {title}
          <Badge variant="secondary" className="ml-auto text-label-xs">
            {classes.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {classes.length === 0 ? (
          <p className="py-6 text-center text-paragraph-sm text-text-sub-600">
            {labels.noClasses}
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            {classes.map((cls) => (
              <div
                key={cls.id}
                className="flex items-center justify-between rounded-lg bg-bg-weak-50 px-3 py-2.5"
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-label-sm text-text-strong-950">
                    {cls.className} - {cls.section}
                  </span>
                  <span className="text-paragraph-xs text-text-sub-600">
                    {cls.subject}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-paragraph-xs text-text-sub-600">
                  <RiGroupLine className="h-3.5 w-3.5" />
                  <span>
                    {cls.studentCount} {labels.students}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Classes Assigned Card Skeleton
// ─────────────────────────────────────────────

export function ClassesAssignedCardSkeleton() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <Skeleton className="h-5 w-36" />
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="flex flex-col gap-1.5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between rounded-lg bg-bg-weak-50 px-3 py-2.5"
            >
              <div className="flex flex-col gap-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
