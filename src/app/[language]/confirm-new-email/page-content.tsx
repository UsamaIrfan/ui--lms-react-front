"use client";

import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";
import {
  authControllerConfirmNewEmailV1,
  authControllerMeV1,
} from "@/services/api/generated/endpoints/auth/auth";
import { useRouter } from "next/navigation";
import { useSnackbar } from "@/hooks/use-snackbar";
import { useTranslation } from "@/services/i18n/client";
import useAuthActions from "@/services/auth/use-auth-actions";
import useAuth from "@/services/auth/use-auth";
import { User } from "@/services/api/types/user";

export default function ConfirmNewEmail() {
  const { enqueueSnackbar } = useSnackbar();
  const router = useRouter();
  const { t } = useTranslation("confirm-new-email");
  const { setUser } = useAuthActions();
  const { user, isLoaded } = useAuth();

  useEffect(() => {
    const confirm = async () => {
      if (!isLoaded) return;

      const params = new URLSearchParams(window.location.search);
      const hash = params.get("hash");

      if (!hash) return;

      try {
        await authControllerConfirmNewEmailV1({ hash });

        enqueueSnackbar(t("confirm-new-email:emailConfirmed"), {
          variant: "success",
        });

        if (user) {
          try {
            const { data } = await authControllerMeV1();
            setUser(data as unknown as User);
          } catch {
            // Failed to refresh user, continue anyway
          }

          router.replace("/profile");
        } else {
          router.replace("/");
        }
      } catch {
        enqueueSnackbar(t("confirm-new-email:emailConfirmFailed"), {
          variant: "error",
        });
        router.replace("/");
      }
    };

    confirm();

    // Do not add user to the dependencies
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, enqueueSnackbar, t, isLoaded, setUser]);

  return (
    <div className="mx-auto max-w-xl px-4">
      <div className="flex items-center justify-center p-8">
        <Spinner size="lg" />
      </div>
    </div>
  );
}
