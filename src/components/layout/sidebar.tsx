"use client";

import { useState, useCallback, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiArrowDownSLine,
  RiCloseLine,
} from "@remixicon/react";

import Link from "@/components/link";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/utils/cn";

import useAuth from "@/services/auth/use-auth";
import useTenant from "@/services/tenant/use-tenant";
import useLanguage from "@/services/i18n/use-language";
import { useTranslation } from "@/services/i18n/client";
import { RoleEnum } from "@/services/api/types/role";

import { navigationItems, type NavItem } from "./navigation-config";
import { useSidebar } from "./sidebar-context";

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function filterByRole(
  items: NavItem[],
  userRole: number | undefined
): NavItem[] {
  return items
    .filter((item) => {
      if (!item.roles) return true;
      if (!userRole) return false;
      return item.roles.includes(userRole as RoleEnum);
    })
    .map((item) => ({
      ...item,
      children: item.children
        ? filterByRole(item.children, userRole)
        : undefined,
    }))
    .filter((item) => !item.children || item.children.length > 0);
}

function isActiveRoute(
  pathname: string,
  href: string,
  language: string
): boolean {
  const normalizedPathname = pathname.replace(`/${language}`, "");
  if (href === "/admin-panel") {
    return normalizedPathname === "/admin-panel";
  }
  return normalizedPathname.startsWith(href);
}

function isParentActive(
  pathname: string,
  item: NavItem,
  language: string
): boolean {
  if (item.children) {
    return item.children.some(
      (child) => child.href && isActiveRoute(pathname, child.href, language)
    );
  }
  return false;
}

// ─────────────────────────────────────────────
// Logo
// ─────────────────────────────────────────────

function SidebarLogo({ collapsed }: { collapsed: boolean }) {
  const { currentTenant } = useTenant();
  const { t } = useTranslation("common");

  return (
    <div className="flex h-16 shrink-0 items-center border-b border-stroke-soft-200 px-4">
      <Link
        href="/admin-panel"
        className="flex items-center gap-3 no-underline"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-base text-label-sm text-static-white">
          {(
            currentTenant?.name?.[0] ??
            t("common:app-name")[0] ??
            "L"
          ).toUpperCase()}
        </div>
        {!collapsed && (
          <span className="truncate text-label-md text-text-strong-950">
            {currentTenant?.name ?? t("common:app-name")}
          </span>
        )}
      </Link>
    </div>
  );
}

// ─────────────────────────────────────────────
// Nav Item (leaf)
// ─────────────────────────────────────────────

function SidebarNavItem({
  item,
  collapsed,
  depth = 0,
}: {
  item: NavItem;
  collapsed: boolean;
  depth?: number;
}) {
  const pathname = usePathname();
  const language = useLanguage();
  const { close } = useSidebar();
  const { t } = useTranslation("common");

  if (!item.href) return null;

  const active = isActiveRoute(pathname, item.href, language);
  const Icon = item.icon;

  const linkContent = (
    <Link
      href={item.href}
      onClick={close}
      data-testid={`nav-${item.id}`}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2 text-paragraph-sm no-underline transition-colors duration-150",
        depth > 0 && "ml-4 pl-5",
        active
          ? "bg-primary-base/10 text-primary-base font-medium"
          : "text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950"
      )}
    >
      {depth === 0 && (
        <Icon
          className={cn(
            "h-5 w-5 shrink-0 transition-colors",
            active
              ? "text-primary-base"
              : "text-text-soft-400 group-hover:text-text-sub-600"
          )}
        />
      )}
      {depth > 0 && (
        <span
          className={cn(
            "mr-1 h-1.5 w-1.5 shrink-0 rounded-full",
            active ? "bg-primary-base" : "bg-text-soft-400"
          )}
        />
      )}
      {!collapsed && <span className="truncate">{t(item.labelKey)}</span>}
    </Link>
  );

  if (collapsed && depth === 0) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          {t(item.labelKey)}
        </TooltipContent>
      </Tooltip>
    );
  }

  return linkContent;
}

// ─────────────────────────────────────────────
// Nav Group (expandable parent)
// ─────────────────────────────────────────────

function SidebarNavGroup({
  item,
  collapsed,
}: {
  item: NavItem;
  collapsed: boolean;
}) {
  const pathname = usePathname();
  const language = useLanguage();
  const { t } = useTranslation("common");
  const parentActive = isParentActive(pathname, item, language);
  const [expanded, setExpanded] = useState(parentActive);

  // Auto-expand when a child route becomes active
  useEffect(() => {
    if (parentActive && !expanded) {
      setExpanded(true);
    }
  }, [parentActive]); // eslint-disable-line react-hooks/exhaustive-deps

  const Icon = item.icon;

  const handleToggle = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  if (collapsed) {
    // In collapsed mode, show icon-only with tooltip
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={handleToggle}
            data-testid={`nav-group-${item.id}`}
            className={cn(
              "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-paragraph-sm transition-colors duration-150",
              parentActive
                ? "bg-primary-base/10 text-primary-base"
                : "text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950"
            )}
          >
            <Icon
              className={cn(
                "h-5 w-5 shrink-0",
                parentActive
                  ? "text-primary-base"
                  : "text-text-soft-400 group-hover:text-text-sub-600"
              )}
            />
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8} className="space-y-1 p-0">
          <div className="px-3 py-2 text-label-xs text-static-white">
            {t(item.labelKey)}
          </div>
          {item.children?.map((child) => (
            <Link
              key={child.id}
              href={child.href ?? "#"}
              className="block px-3 py-1.5 text-paragraph-xs text-static-white/80 no-underline hover:text-static-white"
            >
              {t(child.labelKey)}
            </Link>
          ))}
        </TooltipContent>
      </Tooltip>
    );
  }

  return (
    <div>
      <button
        onClick={handleToggle}
        data-testid={`nav-group-${item.id}`}
        className={cn(
          "group flex w-full items-center gap-3 rounded-lg px-3 py-2 text-paragraph-sm transition-colors duration-150",
          parentActive
            ? "text-primary-base font-medium"
            : "text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950"
        )}
      >
        <Icon
          className={cn(
            "h-5 w-5 shrink-0 transition-colors",
            parentActive
              ? "text-primary-base"
              : "text-text-soft-400 group-hover:text-text-sub-600"
          )}
        />
        <span className="flex-1 truncate text-left">{t(item.labelKey)}</span>
        <RiArrowDownSLine
          className={cn(
            "h-4 w-4 shrink-0 text-text-soft-400 transition-transform duration-200",
            expanded && "rotate-180"
          )}
        />
      </button>

      {/* Children */}
      <div
        className={cn(
          "overflow-hidden transition-all duration-200",
          expanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="mt-1 space-y-0.5 border-l border-stroke-soft-200 ml-6">
          {item.children?.map((child) => (
            <SidebarNavItem
              key={child.id}
              item={child}
              collapsed={false}
              depth={1}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Sidebar Component
// ─────────────────────────────────────────────

export function Sidebar() {
  const { user } = useAuth();
  const { isOpen, isCollapsed, close, setCollapsed } = useSidebar();
  const { t } = useTranslation("common");

  const userRole = user?.role ? Number(user.role.id) : undefined;
  const visibleItems = filterByRole(navigationItems, userRole);

  return (
    <TooltipProvider delayDuration={0}>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-overlay lg:hidden"
          onClick={close}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 flex h-full flex-col border-r border-stroke-soft-200 bg-bg-white-0 transition-all duration-300",
          // Desktop
          "lg:relative lg:translate-x-0",
          isCollapsed ? "lg:w-[68px]" : "lg:w-[260px]",
          // Mobile
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
          "w-[280px] lg:w-auto"
        )}
      >
        {/* Logo + mobile close */}
        <div className="flex items-center justify-between">
          <SidebarLogo collapsed={isCollapsed} />
          <Button
            variant="ghost"
            size="icon"
            className="mr-2 lg:hidden"
            onClick={close}
            aria-label={t("common:navigation.closeSidebar")}
          >
            <RiCloseLine className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <div className="space-y-1">
            {visibleItems.map((item) =>
              item.children && item.children.length > 0 ? (
                <SidebarNavGroup
                  key={item.id}
                  item={item}
                  collapsed={isCollapsed}
                />
              ) : (
                <SidebarNavItem
                  key={item.id}
                  item={item}
                  collapsed={isCollapsed}
                />
              )
            )}
          </div>
        </nav>

        {/* Collapse toggle (desktop only) */}
        <div className="hidden shrink-0 border-t border-stroke-soft-200 p-3 lg:block">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!isCollapsed)}
            className="w-full justify-center text-text-sub-600 hover:text-text-strong-950"
            aria-label={
              isCollapsed
                ? t("common:navigation.expandSidebar")
                : t("common:navigation.collapseSidebar")
            }
          >
            {isCollapsed ? (
              <RiArrowRightSLine className="h-5 w-5" />
            ) : (
              <>
                <RiArrowLeftSLine className="h-5 w-5" />
                <span className="text-paragraph-xs">
                  {t("common:navigation.collapseSidebar")}
                </span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
