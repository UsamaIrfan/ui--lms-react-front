# Copilot Instructions — Client (Next.js Frontend)

## Stack

Next.js 15 (App Router, Turbopack), React 19, AlignUI + Radix UI + Tailwind CSS v4, React Hook Form + Yup, TanStack React Query 5, Recharts, i18next, Playwright for E2E.

**UI library migration**: MUI has been fully removed. The UI layer is now:

| Layer         | Library                                                               | Purpose                                                                      |
| ------------- | --------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Design system | **AlignUI** (custom tokens in `globals.css`)                          | ~795 lines of CSS custom properties for typography, colors, spacing, shadows |
| Primitives    | **Radix UI** (`@radix-ui/react-*`)                                    | Headless accessible components (dialog, select, dropdown, checkbox, etc.)    |
| Styling       | **Tailwind CSS v4** + `tailwind-variants` + `tailwind-merge` + `clsx` | Utility-first CSS                                                            |
| Icons         | **Remix Icon** (`@remixicon/react`)                                   | Icon library                                                                 |
| Charts        | **Recharts**                                                          | Dashboard charts (area, pie, bar)                                            |
| Animations    | `tw-animate-css`                                                      | Tailwind animation utilities                                                 |
| Theme         | `next-themes`                                                         | Theme provider (light mode only currently)                                   |

## Project Structure

```
src/
├── app/
│   ├── globals.css              # AlignUI design tokens + Tailwind v4 @theme config
│   └── [language]/              # Pages — file-based routing with i18n segment
│       ├── admin-panel/         # Protected admin pages (dashboard, users CRUD)
│       │   ├── dashboard/       # Admin dashboard with charts + metrics
│       │   │   ├── components/  # metric-card, charts, quick-actions, etc.
│       │   │   └── queries/     # useAdminDashboard hook + demo-data fallback
│       │   └── users/           # User management CRUD
│       ├── sign-in/             # Auth pages
│       ├── sign-up/
│       ├── forgot-password/
│       ├── confirm-email/
│       ├── select-tenant/       # Multi-tenant selection
│       ├── profile/
│       ├── showcase/            # Component demo page
│       └── ...
├── components/
│   ├── ui/                      # AlignUI + Radix primitives (button, input, dialog, select, etc.)
│   ├── form/                    # Form field wrappers (text-input, select, checkbox, etc.)
│   ├── layout/                  # App shell, sidebar, header, breadcrumbs, navigation
│   ├── table/                   # Virtualized table components
│   ├── confirm-dialog/          # Confirmation dialog
│   ├── tenant/                  # Tenant selection UI
│   └── theme/                   # Theme provider (TooltipProvider wrapper)
├── hooks/                       # App-level hooks (use-snackbar.ts)
├── utils/
│   ├── cn.ts                    # AlignUI class merger (clsx + tailwind-merge)
│   └── tv.ts                    # AlignUI variant helper (tailwind-variants wrapper)
├── lib/
│   └── utils.ts                 # Re-exports cn() for backward compat
└── services/
    ├── api/                     # Fetch wrappers, service hooks, types
    │   ├── generated/           # Orval-generated hooks + custom-fetch.ts mutator
    │   ├── services/            # Hand-written service hooks (legacy)
    │   └── types/               # Request/response types, HTTP codes, role enum
    ├── auth/                    # AuthProvider, tokens, guards (HOCs)
    ├── i18n/                    # i18next config, locales, server/client translation
    ├── react-query/             # QueryClient, key factory
    ├── tenant/                  # TenantProvider, cookie storage, useTenant hook
    ├── leave-page/              # Unsaved changes prompt
    ├── social-auth/             # Google/Facebook OAuth providers
    └── helpers/                 # Utility functions
```

## Page Pattern

Every route has **two files** — never put interactive logic in the server component:

- `page.tsx` — Server component. Only does `generateMetadata()` using `getServerTranslation()`, renders `<PageContent />`.
- `page-content.tsx` — `"use client"`. All hooks, state, data fetching, forms go here.

Protected pages wrap the default export: `export default withPageRequiredAuth(PageContent, { roles: [RoleEnum.Admin] })`.
Guest-only pages (sign-in, sign-up): `export default withPageRequiredGuest(PageContent)`.

## API Services

### Orval-Generated Hooks (preferred)

Located in `src/services/api/generated/`. Auto-generated from backend OpenAPI spec via `npm run api:generate`. Use these for all new code.

### Hand-Written Service Hooks (legacy)

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
- Dashboard-style aggregation: use `useQuery` with `Promise.all` + `safeFetch()` wrapper that falls back to demo data per-section on failure

```typescript
export const usersQueryKeys = createQueryKeys(["users"], {
  list: () => ({
    key: [],
    sub: { by: ({ sort, filter }) => ({ key: [sort, filter] }) },
  }),
});
```

## Forms

Pattern: React Hook Form + Yup + AlignUI form components:

1. Define `type FormData` for the form shape
2. Create `useValidationSchema()` hook — uses `useTranslation()` for localized error messages
3. Initialize with `useForm<FormData>({ resolver: yupResolver(schema) })`
4. Use `FormProvider` + custom components from `src/components/form/`:
   - `FormTextInput`, `FormSelect`, `FormSelectExtended`, `FormAutocomplete`
   - `FormCheckbox`, `FormCheckboxBoolean`, `FormSwitch`, `FormRadioGroup`
   - `FormDatePicker`, `FormImagePicker`, `FormMultipleImagePicker`, `FormAvatarInput`
   - `FormMultipleSelect`, `FormMultipleSelectExtended`
5. Handle server validation errors: check `status === HTTP_CODES_ENUM.UNPROCESSABLE_ENTITY`, then `setError()` per field

Form components use `@/components/ui/*` primitives (Input, Label, Select, etc.) internally — **no MUI imports**.

## ESLint Rules (MUST follow)

These are **enforced** — code will fail lint if violated:

- **No MUI imports at all**: `@mui/*` is completely banned — use `@/components/ui/*` instead
- **No Emotion imports**: `@emotion/*` is banned — use Tailwind CSS for styling
- **No `next/link`**: Use `import Link from '@/components/link'` (handles i18n prefix + leave-page logic)
- **No `watch()` from React Hook Form**: Use `useWatch()` hook instead (avoids full form re-render)
- **No `formState` destructuring**: Use `useFormState()` hook instead
- **No `React.useEffect`**: Import hooks directly: `import { useEffect } from 'react'`
- **No `condition ? true : false`**: Simplify to just `condition`
- **Yup `.nullable()` after `.required()`**: `.required().nullable()` not `.nullable().required()`

## UI Styling Patterns

### Class Utilities

- **`cn(...classes)`** from `@/utils/cn` — merges Tailwind classes via `clsx` + extended `tailwind-merge` (handles AlignUI typography classes like `text-label-sm`, `text-paragraph-md`)
- **`tv(variants)`** from `@/utils/tv` — component variants via `tailwind-variants` with custom twMerge config
- **`@/lib/utils`** re-exports `cn()` for backward compatibility

### AlignUI Design Tokens

Defined as CSS custom properties in `globals.css` inside `@theme { }` (Tailwind v4 syntax). Tokens include:

- **Typography**: `--text-label-*`, `--text-paragraph-*`, `--text-title-*`, etc.
- **Colors**: `--color-primary-*`, `--color-gray-*`, `--color-error-*`, `--color-warning-*`, `--color-success-*`
- **Semantic aliases**: `--color-bg-*`, `--color-text-*`, `--color-stroke-*`
- **Shadows**: `--shadow-regular-*`, `--shadow-fancy-buttons-*`

Use these tokens via Tailwind classes: `bg-primary-base`, `text-static-white`, `shadow-fancy-buttons-primary`, etc.

### Component Primitives

UI components in `src/components/ui/` wrap Radix UI + AlignUI tokens:

- `button.tsx`, `input.tsx`, `dialog.tsx`, `select.tsx`, `checkbox.tsx`, `switch.tsx`, `badge.tsx`, `card.tsx`, `skeleton.tsx`, `spinner.tsx`, `table.tsx`, `textarea.tsx`, `tooltip.tsx`, `avatar.tsx`, `popover.tsx`, `dropdown-menu.tsx`, `separator.tsx`, `radio-group.tsx`, `label.tsx`, `form-field-wrapper.tsx`

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
