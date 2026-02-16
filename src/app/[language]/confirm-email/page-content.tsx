"use client";

import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import { authControllerConfirmEmailV1 } from "@/services/api/generated/endpoints/auth/auth";
import { useRouter } from "next/navigation";
import { useSnackbar } from "@/hooks/use-snackbar";
import { useTranslation } from "@/services/i18n/client";

export default function ConfirmEmail() {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const { t } = useTranslation("confirm-email");

  useEffect(() => {
    const confirm = async () => {
      const params = new URLSearchParams(window.location.search);
      const hash = params.get("hash");

      if (hash) {
        try {
          await authControllerConfirmEmailV1({ hash });

          enqueueSnackbar(t("confirm-email:emailConfirmed"), {
            variant: "success",
          });
          router.replace("/profile");
        } catch {
          enqueueSnackbar(t("confirm-email:emailConfirmFailed"), {
            variant: "error",
          });
          router.replace("/");
        }
      }
    };

    confirm();
  }, [router, enqueueSnackbar, t]);

  return (
    <div className="mx-auto max-w-xl px-4">
      <div className="flex items-center justify-center p-8">
        <Spinner size="lg" />
      </div>
    </div>
  );
}
