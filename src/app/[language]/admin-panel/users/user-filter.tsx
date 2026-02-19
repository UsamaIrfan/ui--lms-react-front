"use client";

import FormMultipleSelectInput from "@/components/form/multiple-select/form-multiple-select";
import { Role, RoleEnum } from "@/services/api/types/role";
import { useTranslation } from "@/services/i18n/client";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { RiFilterLine, RiCloseLine } from "@remixicon/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { UserFilterType } from "./user-filter-types";

type UserFilterFormData = UserFilterType;

function UserFilter() {
  const { t } = useTranslation("admin-panel-users");
  const router = useRouter();
  const searchParams = useSearchParams();

  const methods = useForm<UserFilterFormData>({
    defaultValues: {
      roles: [],
    },
  });

  const { handleSubmit, reset } = methods;

  const [open, setOpen] = useState(false);

  const hasActiveFilter = !!searchParams.get("filter");

  const handleClearFilter = () => {
    reset({ roles: [] });
    const params = new URLSearchParams(window.location.search);
    params.delete("filter");
    const newUrl = params.toString()
      ? window.location.pathname + "?" + params.toString()
      : window.location.pathname;
    router.push(newUrl);
  };

  useEffect(() => {
    const filter = searchParams.get("filter");
    if (filter) {
      setOpen(false);
      const filterParsed = JSON.parse(filter);
      reset(filterParsed);
    }
  }, [searchParams, reset]);

  return (
    <FormProvider {...methods}>
      <div className="flex items-center gap-1">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button variant={hasActiveFilter ? "default" : "outline"} size="sm">
              <RiFilterLine className="mr-1 h-4 w-4" />
              {t("admin-panel-users:filter.actions.filter")}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-75">
            <form
              onSubmit={handleSubmit((data) => {
                const searchParams = new URLSearchParams(
                  window.location.search
                );
                searchParams.set("filter", JSON.stringify(data));
                router.push(
                  window.location.pathname + "?" + searchParams.toString()
                );
              })}
            >
              <div className="grid gap-4">
                <div>
                  <FormMultipleSelectInput<UserFilterFormData, Pick<Role, "id">>
                    name="roles"
                    testId="roles"
                    label={t("admin-panel-users:filter.inputs.role.label")}
                    options={[
                      {
                        id: RoleEnum.ADMIN,
                      },
                      {
                        id: RoleEnum.USER,
                      },
                    ]}
                    keyValue="id"
                    renderOption={(option) =>
                      t(
                        `admin-panel-users:filter.inputs.role.options.${option.id}`
                      )
                    }
                    renderValue={(values) =>
                      values
                        .map((value) =>
                          t(
                            `admin-panel-users:filter.inputs.role.options.${value.id}`
                          )
                        )
                        .join(", ")
                    }
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button type="submit" size="sm" className="flex-1">
                    {t("admin-panel-users:filter.actions.apply")}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleClearFilter}
                  >
                    {t("admin-panel-users:filter.actions.clear")}
                  </Button>
                </div>
              </div>
            </form>
          </PopoverContent>
        </Popover>
        {hasActiveFilter && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-text-sub-600 hover:text-error-base"
            onClick={handleClearFilter}
          >
            <RiCloseLine className="h-4 w-4" />
          </Button>
        )}
      </div>
    </FormProvider>
  );
}

export default UserFilter;
