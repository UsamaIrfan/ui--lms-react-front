"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import useLanguage from "@/services/i18n/use-language";
import { AppShell } from "./app-shell";

/**
 * Routes that render WITHOUT the AppShell (auth, public, landing pages).
 * All other routes get wrapped in the full sidebar + header layout.
 */
const PLAIN_ROUTES = [
  "/sign-in",
  "/sign-up",
  "/forgot-password",
  "/password-change",
  "/confirm-email",
  "/confirm-new-email",
  "/select-tenant",
  "/privacy-policy",
  "/showcase",
];

function isPlainRoute(pathname: string, language: string): boolean {
  const cleanPath = pathname.replace(`/${language}`, "");
  // Root/home page is also plain
  if (cleanPath === "" || cleanPath === "/") return true;
  return PLAIN_ROUTES.some((route) => cleanPath.startsWith(route));
}

export function LayoutSelector({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const language = useLanguage();

  if (isPlainRoute(pathname, language)) {
    return <>{children}</>;
  }

  return <AppShell>{children}</AppShell>;
}
