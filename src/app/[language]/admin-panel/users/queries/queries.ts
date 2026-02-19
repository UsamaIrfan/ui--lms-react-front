import {
  usersControllerFindAllV1,
  getUsersControllerFindAllV1InfiniteQueryKey,
} from "@/services/api/generated/users/users";
import type { UsersControllerFindAllV1Params } from "@/services/api/generated/model";
import { useInfiniteQuery } from "@tanstack/react-query";
import { UserFilterType, UserSortType } from "../user-filter-types";

function buildUsersParams(
  filter?: UserFilterType,
  sort?: UserSortType
): UsersControllerFindAllV1Params {
  return {
    page: 1,
    limit: 10,
    filters: filter ? JSON.stringify({ roles: filter.roles }) : undefined,
    sort: sort ? JSON.stringify([sort]) : undefined,
  };
}

export function getUsersListQueryKey(
  filter?: UserFilterType,
  sort?: UserSortType
) {
  return getUsersControllerFindAllV1InfiniteQueryKey(
    buildUsersParams(filter, sort)
  );
}

/** Broad query key prefix — matches ALL user list queries regardless of params */
export const usersListBaseQueryKey = [
  "infinite",
  getUsersControllerFindAllV1InfiniteQueryKey()[1],
];

export const useGetUsersQuery = ({
  sort,
  filter,
}: {
  filter?: UserFilterType | undefined;
  sort?: UserSortType | undefined;
} = {}) => {
  const params = buildUsersParams(filter, sort);

  const query = useInfiniteQuery({
    queryKey: getUsersControllerFindAllV1InfiniteQueryKey(params),
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) => {
      const { data } = await usersControllerFindAllV1(
        { ...params, page: pageParam },
        { signal }
      );

      return {
        data: data.data,
        nextPage: data.hasNextPage ? pageParam + 1 : undefined,
      };
    },
    getNextPageParam: (lastPage) => {
      return lastPage?.nextPage;
    },
    gcTime: 0,
  });

  return query;
};
