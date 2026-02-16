import AuthProvider from "@/services/auth/auth-provider";
import { LayoutSelector } from "@/components/layout";
import "../globals.css";
import { dir } from "i18next";
import "@/services/i18n/config";
import { languages } from "@/services/i18n/config";
import type { Metadata } from "next";
import ToastContainer from "@/components/snackbar-provider";
import { getServerTranslation } from "@/services/i18n";
import StoreLanguageProvider from "@/services/i18n/store-language-provider";
import ThemeProvider from "@/components/theme/theme-provider";
import LeavePageProvider from "@/services/leave-page/leave-page-provider";
import QueryClientProvider from "@/services/react-query/query-client-provider";
import queryClient from "@/services/react-query/query-client";
import ReactQueryDevtools from "@/services/react-query/react-query-devtools";
import GoogleAuthProvider from "@/services/social-auth/google/google-auth-provider";
import FacebookAuthProvider from "@/services/social-auth/facebook/facebook-auth-provider";
import ConfirmDialogProvider from "@/components/confirm-dialog/confirm-dialog-provider";
import TenantProvider from "@/services/tenant/tenant-provider";

type Props = {
  params: Promise<{ language: string }>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const { t } = await getServerTranslation(params.language, "common");

  return {
    title: t("title"),
  };
}

export function generateStaticParams() {
  return languages.map((language) => ({ language }));
}

export default async function RootLayout(props: {
  children: React.ReactNode;
  params: Promise<{ language: string }>;
}) {
  const params = await props.params;

  const { language } = params;

  const { children } = props;

  return (
    <html lang={language} dir={dir(language)}>
      <body className="min-h-screen bg-bg-white-0 text-text-strong-950 antialiased">
        <QueryClientProvider client={queryClient}>
          <ReactQueryDevtools initialIsOpen={false} />
          <ThemeProvider>
            <StoreLanguageProvider>
              <ConfirmDialogProvider>
                <AuthProvider>
                  <TenantProvider>
                    <GoogleAuthProvider>
                      <FacebookAuthProvider>
                        <LeavePageProvider>
                          <LayoutSelector>{children}</LayoutSelector>
                          <ToastContainer
                            position="bottom-left"
                            hideProgressBar
                          />
                        </LeavePageProvider>
                      </FacebookAuthProvider>
                    </GoogleAuthProvider>
                  </TenantProvider>
                </AuthProvider>
              </ConfirmDialogProvider>
            </StoreLanguageProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </body>
    </html>
  );
}
