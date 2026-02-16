"use client";

import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

import { SidebarProvider } from "./sidebar-context";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { Breadcrumbs } from "./breadcrumbs";
import { ErrorBoundary } from "./error-boundary";

// ─────────────────────────────────────────────
// Page Header (title + actions)
// ─────────────────────────────────────────────

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-title-h5 text-text-strong-950">{title}</h1>
        {description && (
          <p className="mt-1 text-paragraph-sm text-text-sub-600">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}

// ─────────────────────────────────────────────
// Content Area
// ─────────────────────────────────────────────

function ContentArea({ children }: { children: ReactNode }) {
  return (
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto max-w-7xl px-4 py-6 lg:px-6">
        <Breadcrumbs />
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>
    </main>
  );
}

// ─────────────────────────────────────────────
// App Shell Inner (reads sidebar context)
// ─────────────────────────────────────────────

function AppShellInner({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-bg-white-0">
      <Sidebar />
      <div
        className={cn(
          "flex flex-1 flex-col overflow-hidden transition-all duration-300"
        )}
      >
        <Header />
        <ContentArea>{children}</ContentArea>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// App Shell (with provider)
// ─────────────────────────────────────────────

interface AppShellProps {
  children: ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <SidebarProvider>
      <AppShellInner>{children}</AppShellInner>
    </SidebarProvider>
  );
}

// ─────────────────────────────────────────────
// Plain Layout (no sidebar — for auth, landing)
// ─────────────────────────────────────────────

interface PlainLayoutProps {
  children: ReactNode;
}

export function PlainLayout({ children }: PlainLayoutProps) {
  return (
    <div className="min-h-screen bg-bg-white-0">
      <ErrorBoundary>{children}</ErrorBoundary>
    </div>
  );
}
