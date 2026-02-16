"use client";
import useAuth from "@/services/auth/use-auth";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "@/components/link";
import { useTranslation } from "@/services/i18n/client";

function Profile() {
  const { user } = useAuth();
  const { t } = useTranslation("profile");
  return (
    <div className="mx-auto max-w-xl px-4">
      <div className="flex gap-6 pt-6">
        <div className="shrink-0">
          <Avatar className="h-40 w-40" data-testid="user-icon">
            <AvatarImage
              src={user?.photo?.path}
              alt={(user?.firstName ?? "") + " " + (user?.lastName ?? "")}
            />
            <AvatarFallback>
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex-1">
          <h3
            className="mb-2 text-3xl font-bold tracking-tight"
            data-testid="user-name"
          >
            {user?.firstName} {user?.lastName}
          </h3>
          <h5
            className="mb-4 text-xl text-text-sub-600"
            data-testid="user-email"
          >
            {user?.email}
          </h5>
          <div>
            <Button asChild data-testid="edit-profile">
              <Link href="/profile/edit">{t("profile:actions.edit")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withPageRequiredAuth(Profile);
