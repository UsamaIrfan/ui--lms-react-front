# Integration Patterns

> Patterns extracted from the existing codebase showing how API endpoints are integrated.

---

## 1. Query File Organization

Queries are **co-located** with the page that uses them:

```
src/app/[language]/admin-panel/
  ├── staff/
  │   ├── queries/queries.ts        ← staff CRUD hooks
  │   ├── attendance/
  │   │   └── queries/queries.ts    ← staff attendance hooks
  │   ├── leaves/
  │   │   └── queries/queries.ts    ← staff leave hooks
  │   ├── timetable/
  │   │   └── queries/queries.ts    ← timetable hooks
  │   └── payroll/
  │       └── queries/queries.ts    ← payroll hooks
  ├── students/
  │   ├── attendance/
  │   │   └── queries/queries.ts    ← student attendance hooks
  │   ├── fees/
  │   │   └── queries/queries.ts    ← fee management hooks
  │   ├── exams/
  │   │   └── queries/queries.ts    ← exam management hooks (largest: 440 lines)
  │   └── materials/
  │       └── queries/queries.ts    ← materials + assignments hooks
  ├── academics/
  │   ├── courses/
  │   │   └── queries/queries.ts    ← institutions + departments
  │   ├── classes/
  │   │   └── queries/queries.ts    ← grade classes + sections
  │   ├── subjects/
  │   │   └── queries/queries.ts    ← subjects
  │   └── year/
  │       └── queries/queries.ts    ← academic years
  ├── accounts/
  │   ├── income/
  │   │   └── queries/queries.ts    ← income CRUD
  │   ├── expenses/
  │   │   └── queries/queries.ts    ← expenses CRUD
  │   └── reports/
  │       └── queries/queries.ts    ← income + expense reports
  ├── notices/
  │   └── queries/queries.ts        ← notices CRUD
  └── queries/queries.ts            ← admin dashboard aggregation
```

---

## 2. Query Key Patterns

### Pattern A: Simple Array Keys (most common)

Used for CRUD modules with simple caching needs:

```typescript
const STAFF_KEY = ["staff-management"];
const STRUCTURES_KEY = [...FEES_KEY, "structures"];
const CHALLANS_KEY = [...FEES_KEY, "challans"];
```

### Pattern B: Query Key Factory (dashboard)

Used for dashboards with branch-specific caching:

```typescript
import { createQueryKeys } from "@/services/react-query/query-key-factory";

export const adminDashboardQueryKeys = createQueryKeys(["admin-dashboard"], {
  dashboard: () => ({
    key: [],
    sub: {
      byBranch: (branchId?: string) => ({
        key: [branchId],
      }),
    },
  }),
});

// Usage:
queryKey: adminDashboardQueryKeys.dashboard().sub.byBranch(branchId).key;
```

### Pattern C: Orval-Generated Infinite Query Keys (paginated lists)

Used for paginated lists like users:

```typescript
import { getUsersControllerFindAllV1InfiniteQueryKey } from "@/services/api/generated/endpoints/users/users";

queryKey: getUsersControllerFindAllV1InfiniteQueryKey(params);
```

---

## 3. Data Fetching Patterns

### Pattern A: Simple List Query

```typescript
export function useStaffListQuery(branchId?: string) {
  return useQuery<StaffItem[]>({
    queryKey: [...STAFF_KEY, branchId],
    queryFn: async ({ signal }) => {
      const params = branchId ? { branchId } : undefined;
      const res = await staffManagementControllerFindAllV1(params, { signal });
      const items = (res as unknown as { data: StaffItem[] })?.data;
      return Array.isArray(items) ? items : [];
    },
  });
}
```

**Key characteristics:**

- Local `StaffItem` type (because Orval types may be `void`)
- Cast with `as unknown as { data: T }`
- Defensive `Array.isArray()` check
- Pass `{ signal }` for abort controller

### Pattern B: Paginated Infinite Query

```typescript
export const useGetUsersQuery = ({ sort, filter }) => {
  const params = buildUsersParams(filter, sort);

  return useInfiniteQuery({
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
    getNextPageParam: (lastPage) => lastPage?.nextPage,
    gcTime: 0,
  });
};
```

**Key characteristics:**

- Uses Orval's generated infinite query key
- `pageParam` override in each call
- `gcTime: 0` to prevent stale page caching
- Returns `nextPage` for automatic pagination

### Pattern C: Dashboard Aggregation (safeFetch + Promise.all)

```typescript
async function safeFetch<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

async function fetchDashboard(branchId?: string): Promise<DashboardData> {
  const [studentsRes, staffRes, alertsRes] = await Promise.all([
    safeFetch(() =>
      studentRegistrationControllerFindAllV1({ limit: 1, page: 1 })
    ),
    safeFetch(() => staffManagementControllerFindAllV1(branchParams)),
    safeFetch(() => attendanceControllerAlertsV1({ threshold: 75 })),
  ]);

  const totalStudents =
    (studentsRes?.data as any)?.total ??
    demoDashboardData.metrics.totalStudents;
  // ... transform and return
}

export function useAdminDashboard(branchId?: string) {
  return useQuery({
    queryKey: adminDashboardQueryKeys.dashboard().sub.byBranch(branchId).key,
    queryFn: () => fetchDashboard(branchId),
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });
}
```

**Key characteristics:**

- `safeFetch` wraps each call — one failure doesn't crash the dashboard
- Falls back to `demoDashboardData` per section
- Auto-refreshes every 5 minutes
- Uses `(res?.data as any)` because Orval types are often `void`

---

## 4. Mutation Patterns

### Pattern A: Simple CRUD Mutation

```typescript
export function useCreateStaffMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateStaffMgmtDto) =>
      staffManagementControllerCreateV1(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: STAFF_KEY });
    },
  });
}
```

### Pattern B: Update with ID

```typescript
export function useUpdateStaffMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<UpdateStaffMgmtDto>;
    }) => staffManagementControllerUpdateV1(id, data as UpdateStaffMgmtDto),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: STAFF_KEY });
    },
  });
}
```

### Pattern C: Multi-Key Invalidation

When a mutation affects multiple query caches:

```typescript
export function useRecordPaymentMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: RecordPaymentDto) => feesControllerRecordPaymentV1(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: PAYMENTS_KEY });
      void qc.invalidateQueries({ queryKey: CHALLANS_KEY });
    },
  });
}
```

### Pattern D: Direct Usage in Component (auth flows)

Auth endpoints skip the query file and are called directly:

```typescript
// sign-in/page-content.tsx
import { authControllerLoginV1 } from "@/services/api/generated/endpoints/auth/auth";
import { isValidationError } from "@/services/api/generated/custom-fetch";

const handleSubmit = async (data: FormData) => {
  try {
    const result = await authControllerLoginV1({
      email: data.email,
      password: data.password,
    });
    setTokensInfo({
      token: result.data.token,
      refreshToken: result.data.refreshToken,
      tokenExpires: result.data.tokenExpires,
    });
  } catch (error) {
    if (isValidationError(error)) {
      Object.entries(error.body.errors).forEach(([field, message]) => {
        setError(field as keyof FormData, { message });
      });
    }
  }
};
```

---

## 5. Error Handling Pattern

### Server Validation Errors (422)

```typescript
import { isValidationError } from "@/services/api/generated/custom-fetch";

try {
  await mutation.mutateAsync(formData);
} catch (error) {
  if (isValidationError(error)) {
    // error.body = { status: 422, errors: { fieldName: "message" } }
    Object.entries(error.body.errors).forEach(([field, message]) => {
      setError(field as keyof FormData, { message });
    });
  } else {
    snackbar.error(t("common.error"));
  }
}
```

### HTTP Error (generic)

```typescript
import { HttpError } from "@/services/api/generated/custom-fetch";

catch (error) {
  if (error instanceof HttpError) {
    if (error.status === 409) {
      // Conflict
    } else if (error.status === 404) {
      // Not found
    }
  }
}
```

### 401 Handling (automatic)

Handled automatically by `customFetch` — redirects to sign-in page with `returnTo` param.

---

## 6. Loading States Pattern

### Skeleton Loading (for pages)

```typescript
if (isLoading) {
  return (
    <div className="space-y-4 p-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-lg" />
      ))}
    </div>
  );
}
```

### Button Loading (for mutations)

```typescript
<Button disabled={mutation.isPending}>
  {mutation.isPending && <Spinner size="sm" />}
  {t("common.save")}
</Button>
```

---

## 7. Filter / Sort Passing Pattern

```typescript
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
```

Filters and sorts are JSON-stringified into query params. The backend parses them.

---

## 8. React Query Configuration

From `src/services/react-query/`:

- Default `staleTime`: 0 (data is always considered stale)
- Dashboards: `staleTime: 2 min`, `refetchInterval: 5 min`
- Paginated lists: `gcTime: 0` (don't cache old pages)
- All queries pass `{ signal }` for automatic cancellation

---

## 9. Custom Fetch Features (built into customFetch)

| Feature                   | Implementation                                                    |
| ------------------------- | ----------------------------------------------------------------- |
| **Token injection**       | Reads from `getTokensInfo()`, adds `Authorization: Bearer` header |
| **Auto-refresh**          | If token expires within 60s, refreshes before request             |
| **Tenant/Branch headers** | Reads from cookies, adds `X-Tenant-ID` and `X-Branch-ID`          |
| **Language header**       | Reads `<html lang="">`, adds `x-custom-lang`                      |
| **401 redirect**          | Clears tokens, redirects to `/${lang}/sign-in?returnTo=`          |
| **422 errors**            | Throws `HttpError` with parsed body — use `isValidationError()`   |
| **204 No Content**        | Returns `{ data: undefined, status: 204, headers }`               |

---

## 10. File Upload Pattern

```typescript
import { uploadFile } from "@/services/api/upload-file";

const handleUpload = async (file: File) => {
  const result = await uploadFile(file);
  // result contains uploaded file info (URL, id, etc.)
};
```

The `upload-file.ts` service handles both direct upload and S3 presigned URL flows based on `NEXT_PUBLIC_FILE_DRIVER`.
