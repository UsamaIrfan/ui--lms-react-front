"use client";

import { User } from "@/services/api/types/user";
import {
  PropsWithChildren,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AuthActionsContext,
  AuthContext,
  AuthTokensContext,
  TokensInfo,
} from "./auth-context";
import {
  authControllerLogoutV1,
  authControllerMeV1,
} from "@/services/api/generated/endpoints/auth/auth";
import {
  getTokensInfo,
  setTokensInfo as setTokensInfoToStorage,
} from "./auth-tokens-info";

function AuthProvider(props: PropsWithChildren) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const setTokensInfo = useCallback((tokensInfo: TokensInfo) => {
    setTokensInfoToStorage(tokensInfo);

    if (!tokensInfo) {
      setUser(null);
    }
  }, []);

  const logOut = useCallback(async () => {
    const tokens = getTokensInfo();

    if (tokens?.token) {
      await authControllerLogoutV1();
    }
    setTokensInfo(null);
  }, [setTokensInfo]);

  const loadData = useCallback(async () => {
    const tokens = getTokensInfo();

    try {
      if (tokens?.token) {
        const { data } = await authControllerMeV1();
        setUser(data as unknown as User);
      }
    } catch {
      logOut();
    } finally {
      setIsLoaded(true);
    }
  }, [logOut]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const contextValue = useMemo(
    () => ({
      isLoaded,
      user,
    }),
    [isLoaded, user]
  );

  const contextActionsValue = useMemo(
    () => ({
      setUser,
      logOut,
    }),
    [logOut]
  );

  const contextTokensValue = useMemo(
    () => ({
      setTokensInfo,
    }),
    [setTokensInfo]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      <AuthActionsContext.Provider value={contextActionsValue}>
        <AuthTokensContext.Provider value={contextTokensValue}>
          {props.children}
        </AuthTokensContext.Provider>
      </AuthActionsContext.Provider>
    </AuthContext.Provider>
  );
}

export default AuthProvider;
