"use client";

import { authGoogleControllerLoginV1 } from "@/services/api/generated/auth/auth";
import useAuthActions from "@/services/auth/use-auth-actions";
import useAuthTokens from "@/services/auth/use-auth-tokens";
import { CredentialResponse, GoogleLogin } from "@react-oauth/google";
import { useState } from "react";
import { FullPageLoader } from "@/components/full-page-loader";
import useLanguage from "@/services/i18n/use-language";
import { User } from "@/services/api/types/user";

export default function GoogleAuth() {
  const { setUser } = useAuthActions();
  const { setTokensInfo } = useAuthTokens();
  const language = useLanguage();
  const [isLoading, setIsLoading] = useState(false);

  const onSuccess = async (tokenResponse: CredentialResponse) => {
    if (!tokenResponse.credential) return;

    setIsLoading(true);

    try {
      const { data } = await authGoogleControllerLoginV1({
        idToken: tokenResponse.credential,
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
      <GoogleLogin onSuccess={onSuccess} locale={language} />
      <FullPageLoader isLoading={isLoading} />
    </>
  );
}
