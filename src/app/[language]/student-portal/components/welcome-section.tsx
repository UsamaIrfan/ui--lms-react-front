"use client";

import { RiUserLine } from "@remixicon/react";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import type { StudentProfile } from "../types";

// ─────────────────────────────────────────────
// Welcome Section
// ─────────────────────────────────────────────

interface WelcomeSectionProps {
  profile: StudentProfile;
  greeting: string;
  labels: {
    studentId: string;
    class: string;
    section: string;
    academicYear: string;
  };
}

export function WelcomeSection({
  profile,
  greeting,
  labels,
}: WelcomeSectionProps) {
  const initials = profile.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6">
      <Avatar className="h-16 w-16 shrink-0">
        {profile.photo ? (
          <AvatarImage src={profile.photo} alt={profile.name} />
        ) : null}
        <AvatarFallback className="bg-primary-alpha-10 text-title-h5 text-primary-base">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-1 flex-col gap-2">
        <div>
          <h1 className="text-title-h4 text-text-strong-950">
            {greeting}, {profile.name} 👋
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="gap-1.5">
            <RiUserLine className="h-3 w-3" />
            {labels.studentId}: {profile.studentId}
          </Badge>
          <Badge variant="secondary" className="gap-1.5">
            {labels.class}: {profile.className}
          </Badge>
          <Badge variant="secondary" className="gap-1.5">
            {labels.section}: {profile.section}
          </Badge>
          <Badge variant="outline" className="gap-1.5">
            {labels.academicYear}: {profile.academicYear}
          </Badge>
        </div>
      </div>
    </Card>
  );
}

// ─────────────────────────────────────────────
// Welcome Section Skeleton
// ─────────────────────────────────────────────

export function WelcomeSectionSkeleton() {
  return (
    <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:gap-6">
      <Skeleton className="h-16 w-16 shrink-0 rounded-full" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-7 w-64" />
        <div className="flex flex-wrap gap-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-28" />
        </div>
      </div>
    </Card>
  );
}
