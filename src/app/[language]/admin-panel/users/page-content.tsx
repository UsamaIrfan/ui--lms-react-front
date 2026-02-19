"use client";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import { PropsWithChildren, useCallback, useMemo, useState } from "react";
import {
  useGetUsersQuery,
  getUsersListQueryKey,
  usersListBaseQueryKey,
} from "./queries/queries";
import { TableVirtuoso } from "react-virtuoso";
import { TableCell, TableRow, TableHead } from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import VirtuosoTableComponents from "@/components/table/table-components";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  RiArrowDownSLine,
  RiArrowUpSLine,
  RiArrowUpDownLine,
  RiAddLine,
  RiMoreLine,
  RiEditLine,
  RiDeleteBinLine,
  RiSearchLine,
  RiGroupLine,
} from "@remixicon/react";
import { User } from "@/services/api/types/user";
import Link from "@/components/link";
import useAuth from "@/services/auth/use-auth";
import useConfirmDialog from "@/components/confirm-dialog/use-confirm-dialog";
import { useSnackbar } from "@/hooks/use-snackbar";
import { usersControllerRemoveV1 } from "@/services/api/generated/users/users";
import removeDuplicatesFromArrayObjects from "@/services/helpers/remove-duplicates-from-array-of-objects";
import { InfiniteData, useQueryClient } from "@tanstack/react-query";
import UserFilter from "./user-filter";
import { useRouter, useSearchParams } from "next/navigation";
import { UserFilterType, UserSortType } from "./user-filter-types";
import { SortEnum } from "@/services/api/types/sort-type";

type UsersKeys = keyof User;

function getRoleBadgeVariant(
  roleId?: number
): "default" | "secondary" | "warning" | "success" | "outline" {
  switch (roleId) {
    case RoleEnum.ADMIN:
      return "default";
    case RoleEnum.USER:
      return "secondary";
    default:
      return "outline";
  }
}

function TableSortCellWrapper(
  props: PropsWithChildren<{
    width?: number;
    orderBy: UsersKeys;
    order: SortEnum;
    column: UsersKeys;
    handleRequestSort: (
      event: React.MouseEvent<unknown>,
      property: UsersKeys
    ) => void;
  }>
) {
  return (
    <TableHead style={{ width: props.width }}>
      <button
        className="inline-flex items-center gap-1 font-medium hover:text-text-strong-950"
        onClick={(event) => props.handleRequestSort(event, props.column)}
      >
        {props.children}
        {props.orderBy === props.column ? (
          props.order === SortEnum.ASC ? (
            <RiArrowUpSLine className="h-4 w-4" />
          ) : (
            <RiArrowDownSLine className="h-4 w-4" />
          )
        ) : (
          <RiArrowUpDownLine className="h-4 w-4 opacity-50" />
        )}
      </button>
    </TableHead>
  );
}

function Actions({ user }: { user: User }) {
  const { user: authUser } = useAuth();
  const { confirmDialog } = useConfirmDialog();
  const { enqueueSnackbar } = useSnackbar();
  const queryClient = useQueryClient();
  const canDelete = user.id !== authUser?.id;
  const { t: tUsers } = useTranslation("admin-panel-users");

  const handleDelete = async () => {
    const isConfirmed = await confirmDialog({
      title: tUsers("admin-panel-users:confirm.delete.title"),
      message: tUsers("admin-panel-users:confirm.delete.message"),
    });

    if (isConfirmed) {
      const searchParams = new URLSearchParams(window.location.search);
      const searchParamsFilter = searchParams.get("filter");
      const searchParamsSort = searchParams.get("sort");

      let filter: UserFilterType | undefined = undefined;
      let sort: UserSortType | undefined = {
        order: SortEnum.DESC,
        orderBy: "id",
      };

      if (searchParamsFilter) {
        filter = JSON.parse(searchParamsFilter);
      }

      if (searchParamsSort) {
        sort = JSON.parse(searchParamsSort);
      }

      const queryKey = getUsersListQueryKey(filter, sort);
      const previousData =
        queryClient.getQueryData<
          InfiniteData<{ nextPage: number; data: User[] }>
        >(queryKey);

      await queryClient.cancelQueries({ queryKey: usersListBaseQueryKey });

      const newData = {
        ...previousData,
        pages: previousData?.pages.map((page) => ({
          ...page,
          data: page?.data.filter((item) => item.id !== user.id),
        })),
      };

      queryClient.setQueryData(queryKey, newData);

      try {
        await usersControllerRemoveV1(String(user.id));
        enqueueSnackbar(tUsers("admin-panel-users:notifications.deleted"), {
          variant: "success",
        });
      } catch {
        queryClient.setQueryData(queryKey, previousData);
        enqueueSnackbar(tUsers("admin-panel-users:notifications.error"), {
          variant: "error",
        });
      }
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="outline" className="h-8 w-8 p-0">
          <RiMoreLine className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href={`/admin-panel/users/edit/${user.id}`}>
            <RiEditLine className="mr-2 h-4 w-4" />
            {tUsers("admin-panel-users:actions.edit")}
          </Link>
        </DropdownMenuItem>
        {canDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-error-base focus:text-error-base cursor-pointer"
              onClick={handleDelete}
            >
              <RiDeleteBinLine className="mr-2 h-4 w-4" />
              {tUsers("admin-panel-users:actions.delete")}
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function Users() {
  const { t: tUsers } = useTranslation("admin-panel-users");
  const { t: tRoles } = useTranslation("admin-panel-roles");
  const searchParams = useSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [{ order, orderBy }, setSort] = useState<{
    order: SortEnum;
    orderBy: UsersKeys;
  }>(() => {
    const searchParamsSort = searchParams.get("sort");
    if (searchParamsSort) {
      return JSON.parse(searchParamsSort);
    }
    return { order: SortEnum.DESC, orderBy: "id" };
  });

  const handleRequestSort = (
    event: React.MouseEvent<unknown>,
    property: UsersKeys
  ) => {
    const isAsc = orderBy === property && order === SortEnum.ASC;
    const searchParams = new URLSearchParams(window.location.search);
    const newOrder = isAsc ? SortEnum.DESC : SortEnum.ASC;
    const newOrderBy = property;
    searchParams.set(
      "sort",
      JSON.stringify({ order: newOrder, orderBy: newOrderBy })
    );
    setSort({
      order: newOrder,
      orderBy: newOrderBy,
    });
    router.push(window.location.pathname + "?" + searchParams.toString());
  };

  const filter = useMemo(() => {
    const searchParamsFilter = searchParams.get("filter");
    if (searchParamsFilter) {
      return JSON.parse(searchParamsFilter) as UserFilterType;
    }

    return undefined;
  }, [searchParams]);

  const { data, hasNextPage, isFetchingNextPage, fetchNextPage, isLoading } =
    useGetUsersQuery({ filter, sort: { order, orderBy } });

  const handleScroll = useCallback(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const result = useMemo(() => {
    const result =
      (data?.pages.flatMap((page) => page?.data) as unknown as User[]) ??
      ([] as User[]);

    return removeDuplicatesFromArrayObjects(result, "id");
  }, [data]);

  const filteredResult = useMemo(() => {
    if (!searchQuery.trim()) return result;
    const q = searchQuery.toLowerCase();
    return result.filter(
      (user) =>
        user?.firstName?.toLowerCase().includes(q) ||
        user?.lastName?.toLowerCase().includes(q) ||
        user?.email?.toLowerCase().includes(q) ||
        String(user?.id).includes(q)
    );
  }, [result, searchQuery]);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-8">
      <div className="grid gap-6 pt-6">
        {/* ── Page header ─────────────────────────── */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-base/10">
              <RiGroupLine className="h-5 w-5 text-primary-base" />
            </div>
            <div>
              <h3 className="text-title-h5 font-bold text-text-strong-950">
                {tUsers("admin-panel-users:title")}
              </h3>
              <p className="text-paragraph-sm text-text-sub-600">
                {tUsers("admin-panel-users:description")}
              </p>
            </div>
          </div>
          <Button asChild>
            <Link href="/admin-panel/users/create">
              <RiAddLine className="mr-1 h-4 w-4" />
              {tUsers("admin-panel-users:actions.create")}
            </Link>
          </Button>
        </div>

        {/* ── Search & filter bar ─────────────────── */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full max-w-sm">
            <RiSearchLine className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-soft-400" />
            <Input
              placeholder={tUsers("admin-panel-users:search.placeholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <UserFilter />
            {result.length > 0 && (
              <span className="text-paragraph-sm text-text-sub-600">
                {tUsers("admin-panel-users:table.total", {
                  count: filteredResult.length,
                })}
              </span>
            )}
          </div>
        </div>

        {/* ── Users table ─────────────────────────── */}
        <div className="rounded-lg border border-stroke-soft-200">
          {isLoading ? (
            <div className="flex h-60 items-center justify-center">
              <Spinner size="md" />
            </div>
          ) : filteredResult.length === 0 ? (
            <div className="flex h-60 flex-col items-center justify-center gap-2 text-center">
              <RiGroupLine className="h-10 w-10 text-text-soft-400" />
              <p className="text-paragraph-sm text-text-soft-400">
                {searchQuery
                  ? tUsers("admin-panel-users:table.noResults")
                  : tUsers("admin-panel-users:table.empty")}
              </p>
            </div>
          ) : (
            <TableVirtuoso
              style={{ height: 540 }}
              data={filteredResult}
              components={VirtuosoTableComponents}
              endReached={handleScroll}
              overscan={20}
              useWindowScroll
              increaseViewportBy={400}
              fixedHeaderContent={() => (
                <>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableSortCellWrapper
                      width={80}
                      orderBy={orderBy}
                      order={order}
                      column="id"
                      handleRequestSort={handleRequestSort}
                    >
                      {tUsers("admin-panel-users:table.id")}
                    </TableSortCellWrapper>
                    <TableHead className="min-w-[180px]">
                      {tUsers("admin-panel-users:table.name")}
                    </TableHead>
                    <TableSortCellWrapper
                      orderBy={orderBy}
                      order={order}
                      column="email"
                      handleRequestSort={handleRequestSort}
                    >
                      {tUsers("admin-panel-users:table.email")}
                    </TableSortCellWrapper>
                    <TableHead className="w-[100px]">
                      {tUsers("admin-panel-users:table.role")}
                    </TableHead>
                    <TableHead className="w-[60px]">
                      {tUsers("admin-panel-users:table.actions")}
                    </TableHead>
                  </TableRow>
                  {isFetchingNextPage && (
                    <TableRow>
                      <TableCell colSpan={6} className="p-0">
                        <div className="flex justify-center py-2">
                          <Spinner size="sm" />
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              )}
              itemContent={(_index, user) => (
                <>
                  <TableCell className="w-[50px]">
                    <Avatar>
                      <AvatarImage
                        alt={user?.firstName + " " + user?.lastName}
                        src={user?.photo?.path}
                      />
                      <AvatarFallback>
                        {user?.firstName?.[0]}
                        {user?.lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="w-[80px] text-paragraph-sm text-text-sub-600">
                    #{user?.id}
                  </TableCell>
                  <TableCell className="min-w-[180px]">
                    <div className="flex flex-col">
                      <span className="text-paragraph-sm font-medium text-text-strong-950">
                        {user?.firstName} {user?.lastName}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-paragraph-sm text-text-sub-600">
                    {user?.email}
                  </TableCell>
                  <TableCell className="w-[100px]">
                    <Badge
                      variant={getRoleBadgeVariant(Number(user?.role?.id))}
                    >
                      {tRoles(`role.${user?.role?.id}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="w-[60px]">
                    {!!user && <Actions user={user} />}
                  </TableCell>
                </>
              )}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default withPageRequiredAuth(Users, { roles: [RoleEnum.ADMIN] });
