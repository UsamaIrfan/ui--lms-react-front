"use client";

import {
  RiMenuLine,
  RiSearchLine,
  RiNotification3Line,
  RiLogoutBoxRLine,
  RiUserLine,
  RiSettings4Line,
  RiBuilding2Line,
} from "@remixicon/react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import Link from "@/components/link";
import BranchSelector from "@/components/tenant/branch-selector";

import useAuth from "@/services/auth/use-auth";
import useAuthActions from "@/services/auth/use-auth-actions";
import useTenant from "@/services/tenant/use-tenant";
import { useTranslation } from "@/services/i18n/client";
import { RoleEnum } from "@/services/api/types/role";

import { useSidebar } from "./sidebar-context";

// ─────────────────────────────────────────────
// Role Labels
// ─────────────────────────────────────────────

function getRoleName(roleId: number | string | undefined): string {
  const id = Number(roleId);
  switch (id) {
    case RoleEnum.ADMIN:
      return "Admin";
    case RoleEnum.USER:
      return "User";
    case RoleEnum.STUDENT:
      return "Student";
    case RoleEnum.TEACHER:
      return "Teacher";
    case RoleEnum.STAFF:
      return "Staff";
    case RoleEnum.ACCOUNTANT:
      return "Accountant";
    case RoleEnum.PARENT:
      return "Parent";
    default:
      return "User";
  }
}

// ─────────────────────────────────────────────
// Search Bar
// ─────────────────────────────────────────────

function GlobalSearch() {
  const { t } = useTranslation("common");

  return (
    <div className="relative hidden md:block">
      <RiSearchLine className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-soft-400" />
      <Input
        type="search"
        placeholder={t("common:navigation.search")}
        className="h-9 w-64 pl-9 text-paragraph-sm"
      />
    </div>
  );
}

// ─────────────────────────────────────────────
// User Profile Menu
// ─────────────────────────────────────────────

function UserMenu() {
  const { user } = useAuth();
  const { logOut } = useAuthActions();
  const { tenants, clearTenant } = useTenant();
  const { t } = useTranslation("common");

  if (!user) return null;

  const userInitials = (user.firstName?.[0] ?? "") + (user.lastName?.[0] ?? "");
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");
  const roleName = getRoleName(user.role?.id);
  const hasTenants = tenants.length > 1;

  const handleLogOut = async () => {
    clearTenant();
    await logOut();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 outline-none transition-colors hover:bg-bg-weak-50 focus-visible:ring-2 focus-visible:ring-primary-base"
          data-testid="user-menu"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.photo?.path} alt={fullName} />
            <AvatarFallback className="text-label-xs">
              {userInitials || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left lg:block">
            <p className="truncate text-label-sm text-text-strong-950">
              {fullName || user.email}
            </p>
            <p className="text-paragraph-xs text-text-sub-600">{roleName}</p>
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {/* User info header */}
        <div className="px-3 py-2">
          <p className="truncate text-label-sm text-text-strong-950">
            {fullName || user.email}
          </p>
          <p className="truncate text-paragraph-xs text-text-sub-600">
            {user.email}
          </p>
        </div>
        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/profile" className="no-underline">
              <RiUserLine className="h-4 w-4" />
              {t("common:navigation.profile")}
            </Link>
          </DropdownMenuItem>

          {hasTenants && (
            <DropdownMenuItem asChild>
              <Link href="/select-tenant" className="no-underline">
                <RiBuilding2Line className="h-4 w-4" />
                {t("common:tenant.switchTenant")}
              </Link>
            </DropdownMenuItem>
          )}

          <DropdownMenuItem asChild>
            <Link href="/admin-panel/settings" className="no-underline">
              <RiSettings4Line className="h-4 w-4" />
              {t("common:navigation.settings")}
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={handleLogOut}
          className="text-error-base focus:text-error-base"
          data-testid="logout-menu-item"
        >
          <RiLogoutBoxRLine className="h-4 w-4" />
          {t("common:navigation.logout")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─────────────────────────────────────────────
// Notification Bell
// ─────────────────────────────────────────────

function NotificationBell() {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative text-text-sub-600 hover:text-text-strong-950"
      aria-label="Notifications"
    >
      <RiNotification3Line className="h-5 w-5" />
      {/* Badge dot for unread notifications */}
      <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-error-base" />
    </Button>
  );
}

// ─────────────────────────────────────────────
// Header Component
// ─────────────────────────────────────────────

export function Header() {
  const { user, isLoaded } = useAuth();
  const { tenants, currentTenant } = useTenant();
  const { toggle } = useSidebar();
  const { t } = useTranslation("common");

  const hasTenants = tenants.length > 0;

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center border-b border-stroke-soft-200 bg-bg-white-0 px-4 lg:px-6">
      {/* Left: mobile menu toggle */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={toggle}
          aria-label={t("common:navigation.openSidebar")}
        >
          <RiMenuLine className="h-5 w-5" />
        </Button>

        {/* Tenant name display (desktop) */}
        {currentTenant && (
          <div className="hidden items-center gap-2 md:flex">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary-base text-label-xs text-static-white">
              {currentTenant.name[0]?.toUpperCase()}
            </div>
            <span className="text-label-sm text-text-strong-950">
              {currentTenant.name}
            </span>
          </div>
        )}

        {/* Branch selector (desktop) */}
        {user && hasTenants && (
          <div className="hidden items-center md:flex">
            <Separator orientation="vertical" className="mx-2 h-6" />
            <BranchSelector
              compact
              className="text-text-sub-600 hover:bg-bg-weak-50 hover:text-text-strong-950"
            />
          </div>
        )}
      </div>

      {/* Center: search */}
      <div className="flex flex-1 justify-center px-4">
        <GlobalSearch />
      </div>

      {/* Right: notifications + user */}
      <div className="flex items-center gap-1">
        {!isLoaded ? (
          <Spinner size="sm" />
        ) : user ? (
          <>
            <NotificationBell />
            <Separator orientation="vertical" className="mx-1 h-6" />
            <UserMenu />
          </>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/sign-in">{t("common:navigation.signIn")}</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
