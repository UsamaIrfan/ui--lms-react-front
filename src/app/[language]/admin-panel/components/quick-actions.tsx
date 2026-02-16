"use client";

import type { RemixiconComponentType } from "@remixicon/react";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "@/components/link";

// ─────────────────────────────────────────────
// QuickActions
// ─────────────────────────────────────────────

export interface QuickAction {
  icon: RemixiconComponentType;
  label: string;
  href: string;
}

interface QuickActionsProps {
  title: string;
  actions: QuickAction[];
}

export function QuickActions({ title, actions }: QuickActionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.label}
                variant="outline"
                size="sm"
                className="justify-start gap-2"
                asChild
              >
                <Link href={action.href}>
                  <Icon className="h-4 w-4 text-primary-base" />
                  {action.label}
                </Link>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function QuickActionsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-28" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
