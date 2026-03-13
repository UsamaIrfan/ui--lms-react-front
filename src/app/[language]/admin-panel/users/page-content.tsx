"use client";

import { RoleEnum } from "@/services/api/types/role";
import withPageRequiredAuth from "@/services/auth/with-page-required-auth";
import { useTranslation } from "@/services/i18n/client";
import { PropsWithChildren, useCallback, useMemo, useState } from "react";
import { useGetUsersQuery, usersListBaseQueryKey } from "./queries/queries";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiSkipBackLine,
} from "@remixicon/react";
import { User } from "@/services/api/types/user";
import Link from "@/components/link";
import useAuth from "@/services/auth/use-auth";
import useConfirmDialog from "@/components/confirm-dialog/use-confirm-dialog";
import { useSnackbar } from "@/hooks/use-snackbar";
import { getHttpErrorMessage } from "@/services/api/generated/custom-fetch";
import { usersControllerRemoveV1 } from "@/services/api/generated/users/users";
import { useQueryClient } from "@tanstack/react-query";
import UserFilter from "./user-filter";
import { useSearchParams } from "next/navigation";
import { UserFilterType, UserSortType } from "./user-filter-types";
import { SortEnum } from "@/services/api/types/sort-type";

type UsersKeys = keyof User;

function getRoleBadgeVariant(
  roleId?: number
): "default" | "secondary" | "warning" | "success" | "destructive" | "outline" {
  switch (roleId) {
    case RoleEnum.ADMIN:
      return "default";
    case RoleEnum.USER:
      return "secondary";
    case RoleEnum.STUDENT:
      return "success";
    case RoleEnum.TEACHER:
      return "warning";
    case RoleEnum.STAFF:
      return "outline";
    case RoleEnum.ACCOUNTANT:
      return "destructive";
    case RoleEnum.PARENT:
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
      try {
        await usersControllerRemoveV1(String(user.id));
        await queryClient.invalidateQueries({
          queryKey: usersListBaseQueryKey,
        });
        enqueueSnackbar(tUsers("admin-panel-users:notifications.deleted"), {
          variant: "success",
        });
      } catch (error) {
        enqueueSnackbar(
          getHttpErrorMessage(error) ??
            tUsers("admin-panel-users:notifications.error"),
          {
            variant: "error",
          }
        );
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
  const [searchQuery, setSearchQuery] = useState("");

  // Sort state
  const [sort, setSort] = useState<UserSortType>(() => {
    const searchParamsSort = searchParams.get("sort");
    if (searchParamsSort) {
      return JSON.parse(searchParamsSort);
    }
    return { order: SortEnum.DESC, orderBy: "id" };
  });

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const filter = useMemo(() => {
    const searchParamsFilter = searchParams.get("filter");
    if (searchParamsFilter) {
      return JSON.parse(searchParamsFilter) as UserFilterType;
    }
    return undefined;
  }, [searchParams]);

  const handleRequestSort = useCallback(
    (_event: React.MouseEvent<unknown>, property: UsersKeys) => {
      const isAsc = sort.orderBy === property && sort.order === SortEnum.ASC;
      setSort({
        order: isAsc ? SortEnum.DESC : SortEnum.ASC,
        orderBy: property,
      });
      setPage(0);
    },
    [sort]
  );

  const { data: queryResult, isLoading } = useGetUsersQuery({
    filter,
    sort,
    page: page + 1,
    limit: rowsPerPage,
  });

  const paginatedData = useMemo(
    () => queryResult?.data ?? [],
    [queryResult?.data]
  );
  const hasNextPage = queryResult?.hasNextPage ?? false;

  const filteredResult = useMemo(() => {
    if (!searchQuery.trim()) return paginatedData;
    const q = searchQuery.toLowerCase();
    return paginatedData.filter(
      (user) =>
        user?.firstName?.toLowerCase().includes(q) ||
        user?.lastName?.toLowerCase().includes(q) ||
        user?.email?.toLowerCase().includes(q) ||
        String(user?.id).includes(q)
    );
  }, [paginatedData, searchQuery]);

  return (
    <div data-testid="admin-users-page" className="mx-auto max-w-7xl px-4 pb-8">
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
          </div>
        </div>

        {/* ── Users table ─────────────────────────── */}
        <div className="rounded-lg border border-stroke-soft-200">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead style={{ width: 50 }} />
                <TableSortCellWrapper
                  width={80}
                  orderBy={sort.orderBy}
                  order={sort.order}
                  column="id"
                  handleRequestSort={handleRequestSort}
                >
                  {tUsers("admin-panel-users:table.id")}
                </TableSortCellWrapper>
                <TableHead className="min-w-45">
                  {tUsers("admin-panel-users:table.name")}
                </TableHead>
                <TableSortCellWrapper
                  orderBy={sort.orderBy}
                  order={sort.order}
                  column="email"
                  handleRequestSort={handleRequestSort}
                >
                  {tUsers("admin-panel-users:table.email")}
                </TableSortCellWrapper>
                <TableHead style={{ width: 100 }}>
                  {tUsers("admin-panel-users:table.role")}
                </TableHead>
                <TableHead style={{ width: 60 }}>
                  {tUsers("admin-panel-users:table.actions")}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-40 text-center">
                    <Spinner size="md" />
                  </TableCell>
                </TableRow>
              ) : filteredResult.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-40 text-center text-paragraph-sm text-text-soft-400"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <RiGroupLine className="h-10 w-10 text-text-soft-400" />
                      <p>
                        {searchQuery
                          ? tUsers("admin-panel-users:table.noResults")
                          : tUsers("admin-panel-users:table.empty")}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredResult.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell style={{ width: 50 }}>
                      <Avatar className="size-8">
                        <AvatarImage
                          alt={user?.firstName + " " + user?.lastName}
                          src={user?.photo?.path}
                        />
                        <AvatarFallback className="text-xs">
                          {user?.firstName?.[0]}
                          {user?.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="text-paragraph-sm text-text-sub-600">
                      #{user?.id}
                    </TableCell>
                    <TableCell>
                      <span className="text-paragraph-sm font-medium text-text-strong-950">
                        {user?.firstName} {user?.lastName}
                      </span>
                    </TableCell>
                    <TableCell className="text-paragraph-sm text-text-sub-600">
                      {user?.email}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={getRoleBadgeVariant(Number(user?.role?.id))}
                      >
                        {tRoles(`role.${user?.role?.id}`)}
                      </Badge>
                    </TableCell>
                    <TableCell>{!!user && <Actions user={user} />}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* ── Pagination ─────────────────────────── */}
        {paginatedData.length > 0 && (
          <div className="flex items-center justify-between gap-4 pb-4">
            <div className="flex items-center gap-2 text-paragraph-sm text-text-soft-400">
              <span>{tUsers("admin-panel-users:pagination.rowsPerPage")}</span>
              <Select
                value={String(rowsPerPage)}
                onValueChange={(val) => {
                  setRowsPerPage(Number(val));
                  setPage(0);
                }}
              >
                <SelectTrigger className="h-8 w-17.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 25, 50].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 text-paragraph-sm text-text-soft-400">
              <span>
                {tUsers("admin-panel-users:pagination.pageLabel", {
                  current: page + 1,
                })}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  disabled={page === 0}
                  onClick={() => setPage(0)}
                >
                  <RiSkipBackLine className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  disabled={page === 0}
                  onClick={() => setPage((prev) => Math.max(0, prev - 1))}
                >
                  <RiArrowLeftSLine className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 w-8 p-0"
                  disabled={!hasNextPage}
                  onClick={() => setPage((prev) => prev + 1)}
                >
                  <RiArrowRightSLine className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default withPageRequiredAuth(Users, { roles: [RoleEnum.ADMIN] });
