"use client";

import useAuth from "@/services/auth/use-auth";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Link from "@/components/link";
import { useTranslation } from "@/services/i18n/client";

function Profile() {
  const { user } = useAuth();
  const { t } = useTranslation("profile");

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-start justify-center px-4 py-8">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
            <div className="shrink-0">
              <Avatar className="h-28 w-28" data-testid="user-icon">
                <AvatarImage
                  src={user?.photo?.path}
                  alt={(user?.firstName ?? "") + " " + (user?.lastName ?? "")}
                />
                <AvatarFallback className="text-title-h4">
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="flex-1 text-center sm:text-left">
              <h1
                className="text-title-h4 text-text-strong-950"
                data-testid="user-name"
              >
                {user?.firstName} {user?.lastName}
              </h1>
              <p
                className="mt-1 text-paragraph-sm text-text-sub-600"
                data-testid="user-email"
              >
                {user?.email}
              </p>

              <div className="mt-4">
                <Button asChild data-testid="edit-profile">
                  <Link href="/profile/edit">{t("profile:actions.edit")}</Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default withPageRequiredAuth(Profile);
