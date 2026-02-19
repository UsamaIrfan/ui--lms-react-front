# API Integration Workflow

> Step-by-step process for integrating a new backend endpoint into the Next.js frontend.

---

## Pre-Requisites

- Backend server running at `http://localhost:3000`
- Orval generated and up to date (`pnpm run api:generate`)
- Familiarize yourself with the endpoint via Swagger (`/docs`) or Scalar (`/reference`)

---

## Step-by-Step Workflow

### Step 1: Verify Orval Generated the Hook

Check that the function/hook exists in `src/services/api/generated/endpoints/<tag>/`.

```bash
# Search for a specific endpoint function
Get-ChildItem -Recurse src/services/api/generated/endpoints -Filter "*.ts" |
  Select-String "controllerName" | Select-Object -First 5
```

If not found, re-run generation:

```bash
pnpm run api:generate
```

If still missing, the backend endpoint may not have Swagger decorators (`@ApiTags`, `@ApiOperation`, etc.).

---

### Step 2: Create Query File (if new feature area)

Create a `queries/queries.ts` file co-located with the page that uses the data.

**Location pattern:**

```
src/app/[language]/admin-panel/<feature>/queries/queries.ts
```

**Template for a CRUD module:**

```typescript
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  entityControllerFindAllV1,
  entityControllerCreateV1,
  entityControllerUpdateV1,
  entityControllerRemoveV1,
} from "@/services/api/generated/endpoints/<tag>/<tag>";
import type {
  CreateEntityDto,
  UpdateEntityDto,
} from "@/services/api/generated/models";

// Define a local type for the entity shape (Orval types may be void)
export type EntityItem = {
  id: number;
  name: string;
  // ... fields matching backend response
  createdAt: string;
  updatedAt: string;
};

const ENTITY_KEY = ["entity-name"];

// ── List Query ──
export function useEntityListQuery(params?: { branchId?: string }) {
  return useQuery<EntityItem[]>({
    queryKey: [...ENTITY_KEY, params],
    queryFn: async ({ signal }) => {
      const res = await entityControllerFindAllV1(params, { signal });
      const items = (res as unknown as { data: EntityItem[] })?.data;
      return Array.isArray(items) ? items : [];
    },
  });
}

// ── Create Mutation ──
export function useCreateEntityMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateEntityDto) => entityControllerCreateV1(data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ENTITY_KEY });
    },
  });
}

// ── Update Mutation ──
export function useUpdateEntityMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEntityDto }) =>
      entityControllerUpdateV1(id, data),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ENTITY_KEY });
    },
  });
}

// ── Delete Mutation ──
export function useDeleteEntityMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => entityControllerRemoveV1(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ENTITY_KEY });
    },
  });
}
```

---

### Step 3: Integrate in Component

Use the hooks in a `page-content.tsx` file (never in `page.tsx` — that's server component only).

**For lists:**

```typescript
const { data, isLoading, error } = useEntityListQuery();
```

**For mutations (create/update/delete):**

```typescript
const createMutation = useCreateEntityMutation();

const handleSubmit = async (data: FormData) => {
  try {
    await createMutation.mutateAsync(data);
    snackbar.success(t("entity.created"));
    router.push(`/${language}/admin-panel/entity`);
  } catch (error) {
    if (isValidationError(error)) {
      const errors = error.body.errors;
      Object.entries(errors).forEach(([field, message]) => {
        setError(field as keyof FormData, { message });
      });
    } else {
      snackbar.error(t("common.error"));
    }
  }
};
```

---

### Step 4: Add Loading State Handling

Use AlignUI `Skeleton` component for loading states:

```typescript
if (isLoading) {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}
```

For mutations, disable submit button and show spinner:

```typescript
<Button
  type="submit"
  disabled={createMutation.isPending}
>
  {createMutation.isPending ? <Spinner /> : null}
  {t("common.save")}
</Button>
```

---

### Step 5: Add Error State Handling

**For query errors:**

```typescript
if (error) {
  return (
    <div className="text-center py-10">
      <p className="text-text-sub-600">{t("common.loadError")}</p>
      <Button variant="neutral" onClick={() => refetch()}>
        {t("common.retry")}
      </Button>
    </div>
  );
}
```

**For mutation 422 validation errors:**

```typescript
import { isValidationError } from "@/services/api/generated/custom-fetch";

catch (error) {
  if (isValidationError(error)) {
    const errors = error.body.errors;
    Object.entries(errors).forEach(([field, message]) => {
      setError(field as keyof FormData, { message });
    });
  }
}
```

---

### Step 6: Add Success Feedback

Use the snackbar hook:

```typescript
import useSnackbar from "@/hooks/use-snackbar";

const snackbar = useSnackbar();

// In mutation onSuccess or after mutateAsync
snackbar.success(t("entity.createSuccess"));
snackbar.error(t("entity.createError"));
```

---

### Step 7: Test Manually in Browser

1. Open the relevant page
2. Verify data loads (check Network tab for correct API call)
3. Test create/update/delete flows
4. Verify loading states appear
5. Verify error states work (try with backend stopped)
6. Verify cache invalidation (data refreshes after mutation)

---

### Step 8: Write Integration Test (optional)

For critical flows, add a Playwright E2E test:

```typescript
// playwright-tests/<feature>/<feature>.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Entity Management", () => {
  test("should create a new entity", async ({ page }) => {
    await page.goto("/en/admin-panel/entity/create");
    await page.fill('[data-testid="entity-name"]', "Test Entity");
    await page.click('[data-testid="submit-button"]');
    await expect(page.locator('[data-testid="success-toast"]')).toBeVisible();
  });
});
```

---

### Step 9: Update Checklist

Mark the endpoint as integrated in `docs/api-integration-status.md`:

- Change `🔲` to `✅`
- Add the component path

---

### Step 10: Code Review and Merge

- Run `pnpm run lint:fix` to fix any lint issues
- Verify no TypeScript errors: `npx tsc --noEmit`
- Submit PR with:
  - Query file changes
  - Component integration
  - Updated checklist
  - Any new i18n keys added to locale files

---

## Patterns by Endpoint Type

### List Endpoints (paginated)

Use `useInfiniteQuery` with Orval's generated infinite query key:

```typescript
import {
  entityControllerFindAllV1,
  getEntityControllerFindAllV1InfiniteQueryKey,
} from "@/services/api/generated/endpoints/<tag>/<tag>";

export const useEntityListQuery = (params) => {
  return useInfiniteQuery({
    queryKey: getEntityControllerFindAllV1InfiniteQueryKey(params),
    initialPageParam: 1,
    queryFn: async ({ pageParam, signal }) => {
      const { data } = await entityControllerFindAllV1(
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

### List Endpoints (simple, no pagination)

Use `useQuery` with a simple key:

```typescript
export function useEntityListQuery() {
  return useQuery<EntityItem[]>({
    queryKey: ["entity-name"],
    queryFn: async ({ signal }) => {
      const res = await entityControllerFindAllV1({ signal });
      const items = (res as unknown as { data: EntityItem[] })?.data;
      return Array.isArray(items) ? items : [];
    },
  });
}
```

### Dashboard Aggregation

Use `safeFetch` + `Promise.all` pattern:

```typescript
async function safeFetch<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn();
  } catch {
    return null;
  }
}

async function fetchDashboard(): Promise<DashboardData> {
  const [a, b, c] = await Promise.all([
    safeFetch(() => endpointA()),
    safeFetch(() => endpointB()),
    safeFetch(() => endpointC()),
  ]);

  return {
    metricA: (a?.data as any) ?? fallbackA,
    metricB: (b?.data as any) ?? fallbackB,
  };
}

export function useDashboard() {
  return useQuery({
    queryKey: dashboardQueryKeys.dashboard().key,
    queryFn: fetchDashboard,
    refetchInterval: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });
}
```

### PDF/File Downloads

For endpoints that return files (report cards, receipts, payslips):

```typescript
export function useDownloadPdf(id: number) {
  return useQuery({
    queryKey: ["entity-pdf", id],
    queryFn: async () => {
      const res = await entityControllerGetPdfV1(id);
      return res;
    },
    enabled: !!id,
  });
}
```

---

## Search Commands to Find Existing Integrations

```powershell
# Find all imports from generated endpoints
Select-String -Path "src\**\*.ts","src\**\*.tsx" -Pattern "from.*generated/endpoints" -Recurse

# Find all query files
Get-ChildItem -Recurse -Filter "queries.ts" -Path "src/app"

# Find all useMutation usage
Select-String -Path "src\**\*.ts","src\**\*.tsx" -Pattern "useMutation" -Recurse

# Find all useQuery usage
Select-String -Path "src\**\*.ts","src\**\*.tsx" -Pattern "useQuery" -Recurse

# Find endpoints NOT imported anywhere (candidates for integration)
# Compare generated exports vs imports
Select-String -Path "src\services\api\generated\endpoints\**\*.ts" -Pattern "export (const|function|class)" -Recurse |
  ForEach-Object { if ($_.Line -match "export (?:const|function) (\w+)") { $matches[1] } } |
  Sort-Object | Get-Unique
```

---

## Common Pitfalls

1. **Orval types may be `void`** — Backend may not have response type decorators. Cast with `(res as unknown as { data: T })?.data`.

2. **Always pass `{ signal }` to queries** — React Query's abort controller needs this for automatic cancellation.

3. **Don't forget cache invalidation** — Every mutation's `onSuccess` should invalidate the related query key(s).

4. **Use `void` for fire-and-forget invalidation** — `void qc.invalidateQueries(...)` avoids ESLint's no-floating-promises rule.

5. **String IDs vs Number IDs** — Some entities use UUID (string), others use auto-increment (number). Check the backend entity.

6. **Tenant/branch headers** — `customFetch` handles these automatically from cookies. No manual header injection needed.

7. **422 validation errors** — Always handle with `isValidationError()` and `setError()` for form submissions.
