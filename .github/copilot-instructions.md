# Copilot Instructions — Client (Next.js Frontend)

## Stack

Next.js 15 (App Router, Turbopack), React 19, MUI 7, React Hook Form + Yup, TanStack React Query 5, i18next, Playwright for E2E.

## Project Structure

```
src/
├── app/[language]/          # Pages — file-based routing with i18n segment
│   ├── admin-panel/         # Protected admin CRUD pages
│   ├── sign-in/             # Auth pages
│   └── ...
├── components/              # Shared UI (form/, table/, confirm-dialog/, theme/)
├── hooks/                   # App-level hooks (use-snackbar.ts)
└── services/
    ├── api/                 # Fetch wrappers, service hooks, types
    │   ├── generated/       # Orval-generated hooks + custom-fetch.ts mutator
    │   ├── services/        # Hand-written service hooks (legacy)
    │   └── types/           # Request/response types, HTTP codes, role enum
    ├── auth/                # AuthProvider, tokens, guards (HOCs)
    ├── i18n/                # i18next config, locales, server/client translation
    ├── react-query/         # QueryClient, key factory
    ├── tenant/              # TenantProvider, cookie storage, useTenant hook
    ├── leave-page/          # Unsaved changes prompt
    ├── social-auth/         # Google/Facebook OAuth providers
    └── helpers/             # Utility functions
```

## Page Pattern

Every route has **two files** — never put interactive logic in the server component:

- `page.tsx` — Server component. Only does `generateMetadata()` using `getServerTranslation()`, renders `<PageContent />`.
- `page-content.tsx` — `"use client"`. All hooks, state, data fetching, forms go here.

Protected pages wrap the default export: `export default withPageRequiredAuth(PageContent, { roles: [RoleEnum.Admin] })`.
Guest-only pages (sign-in, sign-up): `export default withPageRequiredGuest(PageContent)`.

## API Services

Located in `src/services/api/services/`. Each service is a **hook returning a callback**:

```typescript
export function useGetUsersService() {
  const fetch = useFetch();
  return useCallback(
    (data: UsersRequest, requestConfig?: RequestConfigType) => {
      return fetch(`${API_URL}/v1/users`, {
        method: "GET",
        ...requestConfig,
      }).then(wrapperFetchJsonResponse<UsersResponse>);
    },
    [fetch]
  );
}
```

- `useFetch()` auto-attaches Bearer token, `x-custom-lang` header, and handles token refresh
- Response is always `{ status: HTTP_CODES_ENUM, data: T }`
- Types live in `src/services/api/types/` — define separate `Request`/`Response` types per operation

## React Query

- Define query keys using `createQueryKeys()` from `src/services/react-query/query-key-factory.ts`
- Put queries in a co-located `queries/queries.ts` file next to the page that uses them
- Lists use `useInfiniteQuery` with manual `getNextPageParam`

```typescript
export const usersQueryKeys = createQueryKeys(["users"], {
  list: () => ({
    key: [],
    sub: { by: ({ sort, filter }) => ({ key: [sort, filter] }) },
  }),
});
```

## Forms

Pattern: React Hook Form + Yup + MUI form components:

1. Define `type FormData` for the form shape
2. Create `useValidationSchema()` hook — uses `useTranslation()` for localized error messages
3. Initialize with `useForm<FormData>({ resolver: yupResolver(schema) })`
4. Use `FormProvider` + custom components from `src/components/form/`:
   - `FormTextInput`, `FormSelect`, `FormSelectExtended`, `FormAutocomplete`
   - `FormCheckbox`, `FormCheckboxBoolean`, `FormSwitch`, `FormRadioGroup`
   - `FormDatePicker`, `FormImagePicker`, `FormMultipleImagePicker`, `FormAvatarInput`
5. Handle server validation errors: check `status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY`, then `setError()` per field

## ESLint Rules (MUST follow)

These are **enforced** — code will fail lint if violated:

- **No barrel MUI imports**: Use `import Button from '@mui/material/Button'`, NOT `import { Button } from '@mui/material'`
- **No `next/link`**: Use `import Link from '@/components/link'` (handles i18n prefix + leave-page logic)
- **No `watch()` from React Hook Form**: Use `useWatch()` hook instead (avoids full form re-render)
- **No `formState` destructuring**: Use `useFormState()` hook instead
- **No `React.useEffect`**: Import hooks directly: `import { useEffect } from 'react'`
- **No `condition ? true : false`**: Simplify to just `condition`
- **Yup `.nullable()` after `.required()`**: `.required().nullable()` not `.nullable().required()`

## i18n

- Translations: `src/services/i18n/locales/en/<namespace>.json`
- Each page has its own namespace (e.g., `admin-panel-users.json`, `sign-in.json`)
- Server components: `const { t } = await getServerTranslation(language, "namespace")`
- Client components: `const { t } = useTranslation("namespace")`
- All user-facing strings must be translated — never hardcode English text

## Links & Navigation

Always use `import Link from '@/components/link'` — it:

1. Auto-prepends the current language prefix (`/en/path`)
2. Integrates with the leave-page (unsaved changes) system
3. ESLint blocks direct `next/link` imports

## Lists & Tables

Use `react-virtuoso` (`TableVirtuoso`) with `TableComponents` from `src/components/table/table-components.tsx` for virtualized tables. Combine with infinite query pagination.

## Code Generation

```bash
npm run generate:resource   # Scaffold full CRUD resource (page, API service, queries, admin panel)
npm run generate:field      # Add a field to an existing resource
npm run api:generate        # Generate React Query hooks from backend OpenAPI (requires running server)
npm run api:generate:file   # Generate from local openapi.json file
npm run api:generate:watch  # Watch mode during development
```

Templates in `.hygen/generate/resource/` and `.hygen/generate/field/`.
Orval config in `orval.config.ts`. Generated output in `src/services/api/generated/`.

## Commands

```bash
cp example.env.local .env.local   # First-time setup
npm run dev                       # Dev server (Turbopack)
npm run build                     # Production build
npm run lint:fix                  # ESLint auto-fix
npm run api:generate              # Generate API hooks from backend OpenAPI spec
npx playwright test               # E2E tests (needs running dev server)
npm run sb                        # Storybook dev server
```

## Environment Variables

All client-exposed env vars use `NEXT_PUBLIC_` prefix. Key vars (see `example.env.local`):

- `NEXT_PUBLIC_API_URL` — Backend API base URL
- `NEXT_PUBLIC_IS_SIGN_UP_ENABLED` — Feature flag for sign-up
- `NEXT_PUBLIC_IS_GOOGLE_AUTH_ENABLED` / `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `NEXT_PUBLIC_IS_FACEBOOK_AUTH_ENABLED` / `NEXT_PUBLIC_FACEBOOK_APP_ID`
- `NEXT_PUBLIC_FILE_DRIVER` — `"local"`, `"s3"`, or `"s3-presigned"`

## Key Conventions

- **File naming**: `kebab-case` (e.g., `with-page-required-auth.tsx`, `form-text-input.tsx`)
- **Imports**: Use `@/` alias (maps to `src/`)
- **Commit messages**: Conventional Commits (enforced by `commitlint`)
- **No default exports for services/hooks** — only pages and components use default exports
- **`data-testid` attributes**: Add to interactive elements for Playwright selectors (e.g., `data-testid="sign-in-submit"`)
