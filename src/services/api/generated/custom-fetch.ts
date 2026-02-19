import { getTokensInfo, setTokensInfo } from "../../auth/auth-tokens-info";
import { getTenantInfo } from "../../tenant/tenant-storage";
import { getAuthControllerRefreshV1Url } from "./auth/auth";

/**
 * Custom error class for HTTP errors (4xx/5xx).
 * Thrown by customFetch when the response status is not 2xx.
 * Carries the HTTP status code and parsed response body.
 */
export class HttpError extends Error {
  status: number;
  body: unknown;

  constructor(status: number, body: unknown) {
    super(`HTTP Error ${status}`);
    this.name = "HttpError";
    this.status = status;
    this.body = body;
  }
}

/**
 * Type guard to check if an error is a 422 validation error
 * with the NestJS error format `{ errors: Record<string, string> }`.
 */
export function isValidationError(error: unknown): error is HttpError & {
  body: { status: number; errors: Record<string, string> };
} {
  return (
    error instanceof HttpError &&
    error.status === 422 &&
    typeof error.body === "object" &&
    error.body !== null &&
    "errors" in error.body
  );
}

/**
 * Custom fetch mutator for Orval-generated hooks.
 *
 * Matches the Orval mutator contract for `httpClient: 'fetch'`:
 *   (input: string | Request | URL, init?: RequestInit) => Promise<T>
 *
 * Provides: token injection, auto-refresh (60s window), language header,
 * tenant/branch headers from cookies, 401 redirect, and HTTP error throwing.
 */
export const customFetch = async <T>(
  input: string | Request | URL,
  init?: RequestInit
): Promise<T> => {
  const url = typeof input === "string" ? input : input.toString();

  // Read language from <html lang="">
  const language =
    typeof document !== "undefined"
      ? document.documentElement.lang || "en"
      : "en";

  // Build request headers — start with language, then merge caller headers
  const requestHeaders: Record<string, string> = {
    "x-custom-lang": language,
  };

  // Merge incoming headers
  const incomingHeaders = init?.headers;
  if (incomingHeaders) {
    if (incomingHeaders instanceof Headers) {
      incomingHeaders.forEach((value, key) => {
        requestHeaders[key] = value;
      });
    } else if (Array.isArray(incomingHeaders)) {
      incomingHeaders.forEach(([key, value]) => {
        requestHeaders[key] = value;
      });
    } else {
      Object.assign(requestHeaders, incomingHeaders);
    }
  }

  // Tenant/branch header injection (reads from cookie)
  const tenantInfo = getTenantInfo();
  if (tenantInfo?.tenantId) {
    requestHeaders["X-Tenant-ID"] = tenantInfo.tenantId;
  }
  if (tenantInfo?.branchId) {
    requestHeaders["X-Branch-ID"] = tenantInfo.branchId;
  }

  // Token injection
  const tokens = getTokensInfo();
  let activeToken = tokens?.token;

  if (activeToken) {
    // Auto-refresh if token expires within 60s
    if (tokens?.tokenExpires && tokens.tokenExpires - 60000 <= Date.now()) {
      try {
        const newTokens = await fetch(getAuthControllerRefreshV1Url(), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokens.refreshToken}`,
          },
        }).then((res) => res.json());

        if (newTokens.token) {
          setTokensInfo({
            token: newTokens.token,
            refreshToken: newTokens.refreshToken,
            tokenExpires: newTokens.tokenExpires,
          });
          activeToken = newTokens.token;
        }
      } catch {
        // If refresh fails, proceed with existing token
      }
    }

    requestHeaders["Authorization"] = `Bearer ${activeToken}`;
  }

  const response = await fetch(url, {
    ...init,
    headers: requestHeaders,
  });

  // Handle 401 — redirect to sign-in
  if (response.status === 401) {
    setTokensInfo(null);

    if (typeof window !== "undefined") {
      const lang = document.documentElement.lang || "en";
      const returnTo = window.location.pathname + window.location.search;
      const params = new URLSearchParams({ returnTo });
      window.location.href = `/${lang}/sign-in?${params.toString()}`;
    }

    throw new HttpError(401, { message: "Unauthorized" });
  }

  // For 204 No Content
  if (response.status === 204) {
    return { data: undefined, status: 204, headers: response.headers } as T;
  }

  // Parse response body
  const responseData = await response.json().catch(() => ({}));

  // Throw on non-2xx responses (e.g. 422 validation, 400 bad request, 500 server error)
  if (!response.ok) {
    throw new HttpError(response.status, responseData);
  }

  // Success — wrap in { data, status, headers } to match Orval response types
  return {
    data: responseData,
    status: response.status,
    headers: response.headers,
  } as T;
};

export default customFetch;
