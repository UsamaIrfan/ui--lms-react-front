"use client";

import { authFacebookControllerLoginV1 } from "@/services/api/generated/auth/auth";
import useAuthActions from "@/services/auth/use-auth-actions";
import useAuthTokens from "@/services/auth/use-auth-tokens";
import { useState } from "react";
import { FullPageLoader } from "@/components/full-page-loader";
import { Button } from "@/components/ui/button";
import useFacebookAuth from "./use-facebook-auth";
import { useTranslation } from "@/services/i18n/client";
import { User } from "@/services/api/types/user";

export default function FacebookAuth() {
  const { setUser } = useAuthActions();
  const { setTokensInfo } = useAuthTokens();
  const facebook = useFacebookAuth();
  const { t } = useTranslation("common");
  const [isLoading, setIsLoading] = useState(false);

  const onLogin = async () => {
    try {
      const loginResponse = await facebook.login();
      if (!loginResponse.authResponse) return;

      setIsLoading(true);

      const { data } = await authFacebookControllerLoginV1({
        accessToken: loginResponse.authResponse.accessToken,
      });

      setTokensInfo({
        token: data.token,
        refreshToken: data.refreshToken,
        tokenExpires: data.tokenExpires,
      });
      setUser(data.user as unknown as User);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={onLogin}>{t("common:auth.facebook.action")}</Button>
      <FullPageLoader isLoading={isLoading} />
    </>
  );
}
