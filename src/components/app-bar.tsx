"use client";
import { useState } from "react";
import { RiMenuLine, RiCloseLine } from "@remixicon/react";
import useAuth from "@/services/auth/use-auth";
import useAuthActions from "@/services/auth/use-auth-actions";
import useTenant from "@/services/tenant/use-tenant";
import { useTranslation } from "@/services/i18n/client";
import Link from "@/components/link";
import { RoleEnum } from "@/services/api/types/role";
import { IS_SIGN_UP_ENABLED } from "@/services/auth/config";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import TenantSelector from "@/components/tenant/tenant-selector";
import BranchSelector from "@/components/tenant/branch-selector";

function ResponsiveAppBar() {
  const { t } = useTranslation("common");
  const { user, isLoaded } = useAuth();
  const { logOut } = useAuthActions();
  const { tenants, clearTenant } = useTenant();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin =
    !!user?.role && [RoleEnum.ADMIN].includes(Number(user?.role?.id));

  const hasTenants = tenants.length > 0;

  const handleLogOut = async () => {
    clearTenant();
    await logOut();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stroke-soft-200 bg-primary-base text-static-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="hidden font-mono text-lg font-bold tracking-widest text-inherit no-underline md:flex"
        >
          {t("common:app-name")}
        </Link>

        {/* Mobile hamburger */}
        <div className="flex md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation"
            className="text-static-white hover:bg-primary-dark"
          >
            {mobileMenuOpen ? (
              <RiCloseLine className="h-6 w-6" />
            ) : (
              <RiMenuLine className="h-6 w-6" />
            )}
          </Button>
        </div>

        {/* Mobile logo (centered) */}
        <Link
          href="/"
          className="flex flex-1 font-mono text-lg font-bold tracking-widest text-inherit no-underline md:hidden"
        >
          {t("common:app-name")}
        </Link>

        {/* Desktop nav links */}
        <nav className="hidden flex-1 items-center gap-1 md:flex">
          <Button
            variant="ghost"
            asChild
            className="text-static-white hover:bg-primary-dark"
          >
            <Link href="/">{t("common:navigation.home")}</Link>
          </Button>

          {isAdmin && (
            <Button
              variant="ghost"
              asChild
              className="text-static-white hover:bg-primary-dark"
            >
              <Link href="/admin-panel/users">
                {t("common:navigation.users")}
              </Link>
            </Button>
          )}
          {/* desktop-menu-items */}
        </nav>

        {/* Tenant/Branch selectors (desktop) */}
        {user && hasTenants && (
          <div className="hidden items-center gap-1 md:flex">
            <Separator
              orientation="vertical"
              className="mx-2 h-6 bg-static-white/30"
            />
            <TenantSelector compact />
            <BranchSelector compact />
          </div>
        )}

        {/* Right side: auth */}
        <div className="flex items-center gap-2">
          {!isLoaded ? (
            <Spinner size="sm" className="text-static-white" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="rounded-full outline-none ring-primary-base focus-visible:ring-2"
                  data-testid="profile-menu-item"
                >
                  <Avatar className="h-9 w-9">
                    <AvatarImage
                      src={user.photo?.path}
                      alt={user?.firstName + " " + user?.lastName}
                    />
                    <AvatarFallback>
                      {(user?.firstName?.[0] ?? "") +
                        (user?.lastName?.[0] ?? "")}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild data-testid="user-profile">
                  <Link href="/profile">{t("common:navigation.profile")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogOut}
                  data-testid="logout-menu-item"
                >
                  {t("common:navigation.logout")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden items-center gap-1 md:flex">
              <Button
                variant="ghost"
                asChild
                className="text-static-white hover:bg-primary-dark"
              >
                <Link href="/sign-in">{t("common:navigation.signIn")}</Link>
              </Button>
              {IS_SIGN_UP_ENABLED && (
                <Button
                  variant="ghost"
                  asChild
                  className="text-static-white hover:bg-primary-dark"
                >
                  <Link href="/sign-up">{t("common:navigation.signUp")}</Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <nav className="border-t border-static-white/20 md:hidden">
          <div className="space-y-1 px-4 py-3">
            <Link
              href="/"
              className="block rounded-md px-3 py-2 text-sm font-medium text-static-white hover:bg-primary-dark"
              onClick={() => setMobileMenuOpen(false)}
            >
              {t("common:navigation.home")}
            </Link>

            {isAdmin && (
              <Link
                href="/admin-panel/users"
                className="block rounded-md px-3 py-2 text-sm font-medium text-static-white hover:bg-primary-dark"
                onClick={() => setMobileMenuOpen(false)}
              >
                {t("common:navigation.users")}
              </Link>
            )}
            {/* mobile-menu-items */}

            {/* Tenant/Branch selectors (mobile) */}
            {user && hasTenants && (
              <>
                <Separator className="my-2 bg-static-white/20" />
                <div className="space-y-1">
                  <TenantSelector />
                  <BranchSelector />
                </div>
              </>
            )}

            {isLoaded && !user && (
              <>
                <Separator className="my-2 bg-static-white/20" />
                <Link
                  href="/sign-in"
                  className="block rounded-md px-3 py-2 text-sm font-medium text-static-white hover:bg-primary-dark"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {t("common:navigation.signIn")}
                </Link>
                {IS_SIGN_UP_ENABLED && (
                  <Link
                    href="/sign-up"
                    className="block rounded-md px-3 py-2 text-sm font-medium text-static-white hover:bg-primary-dark"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {t("common:navigation.signUp")}
                  </Link>
                )}
              </>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
export default ResponsiveAppBar;
