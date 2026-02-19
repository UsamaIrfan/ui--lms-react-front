"use client";
import { useRouter } from "next/navigation";
import useAuth from "./use-auth";
import React, { FunctionComponent, useEffect } from "react";
import useLanguage from "../i18n/use-language";
import { RoleEnum } from "../api/types/role";
import { getDefaultRouteForRole } from "./role-routes";

type PropsType = {
  params?: { [key: string]: string | string[] | undefined };
  searchParams?: { [key: string]: string | string[] | undefined };
};

type OptionsType = {
  roles: RoleEnum[];
};

const roles = Object.values(RoleEnum).filter(
  (value) => !Number.isNaN(Number(value))
) as RoleEnum[];

function withPageRequiredAuth(
  Component: FunctionComponent<PropsType>,
  options?: OptionsType
) {
  const optionRoles = options?.roles || roles;

  return function WithPageRequiredAuth(props: PropsType) {
    const { user, isLoaded } = useAuth();
    const router = useRouter();
    const language = useLanguage();

    useEffect(() => {
      const check = () => {
        if (
          (user &&
            user?.role?.id &&
            optionRoles.includes(Number(user?.role.id))) ||
          !isLoaded
        )
          return;

        const currentLocation = window.location.toString();
        const returnToPath =
          currentLocation.replace(new URL(currentLocation).origin, "") ||
          `/${language}`;
        const params = new URLSearchParams({
          returnTo: returnToPath,
        });

        let redirectTo = `/${language}/sign-in?${params.toString()}`;

        if (user) {
          // User is authenticated but doesn't have the right role for this page.
          // Redirect to their role-appropriate default route.
          redirectTo = getDefaultRouteForRole(user.role?.id, language);
        }

        router.replace(redirectTo);
      };

      check();
    }, [user, isLoaded, router, language]);

    return user &&
      user?.role?.id &&
      optionRoles.includes(Number(user?.role.id)) ? (
      <Component {...props} />
    ) : null;
  };
}

export default withPageRequiredAuth;
