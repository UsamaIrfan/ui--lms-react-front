import {
  usersControllerFindAllV1,
  getUsersControllerFindAllV1QueryKey,
} from "@/services/api/generated/users/users";
import type { UsersControllerFindAllV1Params } from "@/services/api/generated/model";
import { useQuery } from "@tanstack/react-query";
import { UserFilterType, UserSortType } from "../user-filter-types";
import { User } from "@/services/api/types/user";

function buildUsersParams(
  filter?: UserFilterType,
  sort?: UserSortType,
  page?: number,
  limit?: number
): UsersControllerFindAllV1Params {
  return {
    page: page ?? 1,
    limit: limit ?? 10,
    filters: filter ? JSON.stringify({ roles: filter.roles }) : undefined,
    sort: sort ? JSON.stringify([sort]) : undefined,
  };
}

export function getUsersListQueryKey(
  filter?: UserFilterType,
  sort?: UserSortType,
  page?: number,
  limit?: number
) {
  return getUsersControllerFindAllV1QueryKey(
    buildUsersParams(filter, sort, page, limit)
  );
}

/** Broad query key prefix — matches ALL user list queries regardless of params */
export const usersListBaseQueryKey = getUsersControllerFindAllV1QueryKey();

export const useGetUsersQuery = ({
  sort,
  filter,
  page = 1,
  limit = 10,
}: {
  filter?: UserFilterType | undefined;
  sort?: UserSortType | undefined;
  page?: number;
  limit?: number;
} = {}) => {
  const params = buildUsersParams(filter, sort, page, limit);

  const query = useQuery({
    queryKey: getUsersControllerFindAllV1QueryKey(params),
    queryFn: async ({ signal }) => {
      const { data } = await usersControllerFindAllV1(params, { signal });

      return {
        data: (data.data ?? []) as unknown as User[],
        hasNextPage: data.hasNextPage ?? false,
      };
    },
  });

  return query;
};
