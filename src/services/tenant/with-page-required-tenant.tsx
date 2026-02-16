"use client";

import { useRouter } from "next/navigation";
import useAuth from "@/services/auth/use-auth";
import useTenant from "@/services/tenant/use-tenant";
import React, { FunctionComponent, useEffect } from "react";
import useLanguage from "@/services/i18n/use-language";

type PropsType = {
  params?: { [key: string]: string | string[] | undefined };
  searchParams?: { [key: string]: string | string[] | undefined };
};

/**
 * HOC that ensures a tenant is selected before rendering the wrapped component.
 * If no tenant is selected, redirects to the tenant selection page.
 *
 * Use this on pages that require tenant context (e.g. admin panel, LMS pages).
 *
 * @example
 * export default withPageRequiredTenant(MyPageContent);
 */
function withPageRequiredTenant(Component: FunctionComponent<PropsType>) {
  return function WithPageRequiredTenant(props: PropsType) {
    const { user, isLoaded: isAuthLoaded } = useAuth();
    const { tenantId, isLoaded: isTenantLoaded } = useTenant();
    const router = useRouter();
    const language = useLanguage();

    useEffect(() => {
      if (!isAuthLoaded || !isTenantLoaded) return;

      // If not authenticated, the auth guard will handle redirect
      if (!user) return;

      // If no tenant is selected, redirect to tenant selection
      if (!tenantId) {
        const currentLocation = window.location.toString();
        const returnToPath =
          currentLocation.replace(new URL(currentLocation).origin, "") ||
          `/${language}`;
        const params = new URLSearchParams({
          returnTo: returnToPath,
        });
        router.replace(`/${language}/select-tenant?${params.toString()}`);
      }
    }, [user, tenantId, isAuthLoaded, isTenantLoaded, router, language]);

    // Show nothing until both auth and tenant are loaded and tenant is selected
    if (!isAuthLoaded || !isTenantLoaded || !tenantId) {
      return null;
    }

    return <Component {...props} />;
  };
}

export default withPageRequiredTenant;
