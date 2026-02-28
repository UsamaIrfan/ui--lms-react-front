# E2E Test Summary — Playwright Tests

## Overview

**139 tests** across **19 spec files**, covering authentication, tenant selection, role-based access control, navigation visibility, admin panel pages, student portal, staff portal, and parent access.

- **Framework**: Playwright 1.55.0
- **Browser**: Chromium
- **Retries**: 1 (local), 2 (CI)
- **Base URL**: `http://localhost:3001`
- **API URL**: `http://localhost:3000/api`

---

## Test User Credentials

| Role       | Email                           | Password | RoleEnum |
| ---------- | ------------------------------- | -------- | -------- |
| Admin      | `admin@example.com`             | `secret` | 1        |
| Student    | `fake-student-1@example.com`    | `secret` | 3        |
| Teacher    | `fake-teacher-1@example.com`    | `secret` | 4        |
| Staff      | `fake-staff-1@example.com`      | `secret` | 5        |
| Accountant | `fake-accountant-1@example.com` | `secret` | 6        |
| Parent     | `fake-parent-1@example.com`     | `secret` | 7        |
| User       | `john.doe@example.com`          | `secret` | 2        |

All test users are seeded via auth-setup (`playwright-tests/auth-setup.ts`) which creates users if they don't exist, then generates authenticated storage state files in `playwright-tests/.auth/`.

---

## Running Tests

```bash
# Prerequisites: NestJS server running on port 3000
# Next.js dev server starts automatically via webServer config

# Run all E2E tests
npx playwright test

# Run specific project
npx playwright test --project admin
npx playwright test --project student
npx playwright test --project staff
npx playwright test --project role-access

# Run a specific test file
npx playwright test --project admin --grep "Dashboard"

# View HTML report
npx playwright show-report
```

---

## Project Structure

```
playwright-tests/
├── auth-setup.ts                          # Auth setup (6 storage states)
├── .auth/                                 # Generated auth state files
│   ├── admin.json
│   ├── student.json
│   ├── teacher.json
│   ├── staff.json
│   ├── accountant.json
│   └── parent.json
├── helpers/
│   ├── constants.ts                       # URLs, credentials, role configs
│   ├── auth.ts                            # Login/logout helpers
│   ├── navigation.ts                      # Navigation helpers
│   ├── api-requests.ts                    # API helper functions
│   ├── login.ts                           # Login utilities
│   └── email.ts                           # Email utilities
├── 1-auth/                                # Authentication tests (23 tests)
│   ├── sign-in.spec.ts
│   ├── sign-up.spec.ts
│   ├── forgot-password.spec.ts
│   └── user-profile.spec.ts
├── 2-tenant-selection/                    # Tenant/branch selection (3 tests)
│   └── tenant-selection.spec.ts
├── 3-role-access/                         # RBAC & navigation (37 tests)
│   ├── role-access.spec.ts
│   └── navigation.spec.ts
├── 4-admin/                               # Admin panel pages (48 tests)
│   ├── dashboard.spec.ts
│   ├── users.spec.ts
│   ├── academics.spec.ts
│   ├── students.spec.ts
│   ├── staff.spec.ts
│   ├── accounts.spec.ts
│   ├── reports-notices.spec.ts
│   ├── authorization.spec.ts
│   └── settings.spec.ts
├── 5-student/                             # Student portal (22 tests)
│   ├── student-portal.spec.ts
│   └── parent-access.spec.ts
└── 6-staff/                               # Staff portal (24 tests)
    └── staff-portal.spec.ts
```

---

## Test Breakdown by File

### 1. Authentication (23 tests)

#### `sign-in.spec.ts` — 7 tests

| Test                                                       | Description                          |
| ---------------------------------------------------------- | ------------------------------------ |
| should be successful                                       | Login with valid admin credentials   |
| should be successful with redirect                         | Login redirects to correct dashboard |
| should fail if password is incorrect                       | Shows error on wrong password        |
| should display error messages if required fields are empty | Validates empty form                 |
| should display error message if email isn't registered     | Shows error for unknown email        |
| should redirect from sign in to sign up page               | Link navigation works                |
| should navigate to Forgot Password page                    | Link navigation works                |

#### `sign-up.spec.ts` — 4 tests

| Test                                              | Description                     |
| ------------------------------------------------- | ------------------------------- |
| should be successful                              | Create a new user account       |
| should fail with existing email                   | Shows error for duplicate email |
| should show validation errors for required fields | Validates empty form submission |
| should show validation errors for password field  | Validates password requirements |

#### `forgot-password.spec.ts` — 6 tests

| Test                                               | Description                     |
| -------------------------------------------------- | ------------------------------- |
| should display forgot password link                | Navigate to reset password page |
| should show validation messages for invalid inputs | Form validation                 |
| should handle errors for an invalid email          | Error handling                  |
| should send a password reset email                 | Email sent successfully         |
| should handle errors for invalid password          | Password validation             |
| should reset password successfully                 | Complete reset flow             |

#### `user-profile.spec.ts` — 6 tests

| Test                                            | Description                       |
| ----------------------------------------------- | --------------------------------- |
| should open page and check data is displayed    | Profile page loads with user data |
| should update user data                         | Edit and save profile             |
| should upload avatar                            | Avatar upload works               |
| should show leave page modal on unsaved changes | Unsaved changes prompt            |
| should change user password                     | Password change flow              |
| should validate password requirements           | Password form validation          |

### 2. Tenant Selection (3 tests)

#### `tenant-selection.spec.ts` — 3 tests

| Test                                             | Description                            |
| ------------------------------------------------ | -------------------------------------- |
| should display tenant selection after login      | Tenant picker shows after login        |
| should allow selecting a tenant and branch       | Full flow: tenant → branch → dashboard |
| should show back button on branch selection step | Branch step has back navigation        |

### 3. Role-Based Access Control (37 tests)

#### `role-access.spec.ts` — 29 tests

**Admin role (5 tests)**
| Test | Description |
|------|-------------|
| should access admin dashboard | Admin sees admin panel |
| should NOT access student portal | Redirected away from student portal |
| should access user management | User management page loads |
| should access settings pages | Settings page loads |
| should access all admin sub-pages | Loops all admin routes (courses, classes, subjects, years, students, enquiries, attendance, fees, exams, materials, users) |

**Student role (6 tests)**
| Test | Description |
|------|-------------|
| should access student portal | Student sees student dashboard |
| should NOT access admin panel | Redirected to student portal |
| should access student attendance | Attendance page loads |
| should access student fees | Fees page loads |
| should access student exams | Exams page loads |
| should access all student sub-pages | Loops all student routes (attendance, fees, exams, materials, assignments, timetable, notices) |

**Teacher role (5 tests)**
| Test | Description |
|------|-------------|
| should access admin dashboard | Teacher sees admin panel |
| should access staff portal | Staff portal loads |
| should NOT access student portal | Redirected away |
| should access student attendance admin page | Admin attendance page loads |
| should access student exams admin page | Admin exams page loads |

**Staff role (4 tests)**
| Test | Description |
|------|-------------|
| should access admin dashboard | Staff sees admin panel |
| should access staff portal | Staff portal loads |
| should NOT access student portal | Redirected away |
| should not render admin-only staff management content | Admin-only pages restricted |

**Accountant role (5 tests)**
| Test | Description |
|------|-------------|
| should access admin dashboard | Accountant sees admin panel |
| should access student fees page | Fee management loads |
| should access payroll page | Payroll page loads |
| should access accounts pages | Accounts section loads |
| should NOT access student portal | Redirected away |

**Parent role (4 tests)**
| Test | Description |
|------|-------------|
| should access student portal | Parent sees student dashboard |
| should NOT access admin panel | Redirected to student portal |
| should access student fees as parent | Fee viewing works |
| should access all student portal sub-pages | Loops all student routes |

#### `navigation.spec.ts` — 8 tests

| Test                                                  | Description                                                                               |
| ----------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Admin — should show all admin nav items               | Dashboard, students, staff, academics, accounts, reports, settings, authorization visible |
| Admin — should NOT show student-portal nav item       | Student nav hidden                                                                        |
| Student — should show student portal nav items        | Dashboard, attendance, fees, exams, materials, assignments, timetable, notices            |
| Student — should NOT show admin nav items             | Admin nav hidden                                                                          |
| Teacher — should show teacher-visible nav items       | Admin dashboard + staff portal nav                                                        |
| Staff — should show staff-visible nav items           | Staff nav items                                                                           |
| Accountant — should show accountant-visible nav items | Dashboard, students, accounts, reports                                                    |
| Parent — should show parent-visible nav items         | Same as student portal                                                                    |

### 4. Admin Panel (48 tests)

#### `dashboard.spec.ts` — 5 tests

| Test                                      | Description                |
| ----------------------------------------- | -------------------------- |
| should render admin dashboard page        | Page loads with testid     |
| should display dashboard title or heading | Title visible              |
| should show metric cards on dashboard     | Metric cards rendered      |
| should show charts section                | Charts rendered            |
| should have sidebar visible               | Sidebar navigation present |

#### `users.spec.ts` — 4 tests

| Test                                   | Description                |
| -------------------------------------- | -------------------------- |
| should render users list page          | Users page loads           |
| should display users table or list     | Table/list content visible |
| should navigate to create user page    | Create button works        |
| should display create user form fields | Form fields rendered       |

#### `academics.spec.ts` — 5 tests

| Test                             | Description                     |
| -------------------------------- | ------------------------------- |
| should render courses page       | Institutions/courses page loads |
| should display courses content   | Courses content visible         |
| should render classes page       | Classes page loads              |
| should render subjects page      | Subjects page loads             |
| should render academic year page | Academic year page loads        |

#### `students.spec.ts` — 7 tests

| Test                                          | Description                         |
| --------------------------------------------- | ----------------------------------- |
| should render registrations page              | Student registrations page loads    |
| should display registrations table or content | Table/content visible               |
| should render enquiries page                  | Admission enquiries page loads      |
| should render attendance page                 | Student attendance admin page loads |
| should render fees page                       | Student fees admin page loads       |
| should render exams page                      | Student exams admin page loads      |
| should render materials page                  | Course materials admin page loads   |

#### `staff.spec.ts` — 6 tests

| Test                                  | Description                 |
| ------------------------------------- | --------------------------- |
| should render staff list page         | Staff management page loads |
| should display staff table or content | Staff table visible         |
| should render staff attendance page   | Staff attendance page loads |
| should render staff leaves page       | Leave management page loads |
| should render payroll page            | Payroll page loads          |
| should render timetable page          | Timetable page loads        |

#### `accounts.spec.ts` — 4 tests

| Test                                | Description                  |
| ----------------------------------- | ---------------------------- |
| should render income page           | Income tracking page loads   |
| should display income content       | Income data visible          |
| should render expenses page         | Expenses page loads          |
| should render accounts reports page | Financial reports page loads |

#### `reports-notices.spec.ts` — 4 tests

| Test                                       | Description                   |
| ------------------------------------------ | ----------------------------- |
| should render reports page                 | Reports page loads            |
| should display report content or filters   | Report content visible        |
| should render notices page                 | Notices management page loads |
| should display notices list or empty state | Notices content visible       |

#### `authorization.spec.ts` — 3 tests

| Test                                | Description            |
| ----------------------------------- | ---------------------- |
| should render role permissions page | Permissions page loads |
| should display permissions content  | Permissions UI visible |
| should render audit logs page       | Audit logs page loads  |

#### `settings.spec.ts` — 9 tests

| Test                                      | Description                 |
| ----------------------------------------- | --------------------------- |
| should render settings page               | Settings overview loads     |
| should render general settings page       | General settings loads      |
| should display settings form              | Form fields visible         |
| should render tenants settings page       | Tenant config loads         |
| should render branches settings page      | Branch config loads         |
| should render fees settings page          | Fee settings loads          |
| should render attendance settings page    | Attendance settings loads   |
| should render notifications settings page | Notification settings loads |
| should render invitations settings page   | Invitation settings loads   |

### 5. Student Portal (22 tests)

#### `student-portal.spec.ts` — 13 tests

| Test                                                                 | Description             |
| -------------------------------------------------------------------- | ----------------------- |
| Dashboard — should render student dashboard                          | Dashboard loads         |
| Dashboard — should display dashboard heading                         | Heading visible         |
| Dashboard — should show dashboard cards or sections                  | Cards rendered          |
| Attendance — should render attendance page                           | Attendance page loads   |
| Attendance — should display attendance content                       | Attendance data visible |
| Fees — should render fees page                                       | Fees page loads         |
| Fees — should display fee challans or payment info                   | Fee data visible        |
| Exams — should render exams page                                     | Exams page loads        |
| Materials — should render materials page                             | Materials page loads    |
| Assignments — should render assignments page                         | Assignments page loads  |
| Timetable — should render timetable page                             | Timetable loads         |
| Timetable — should display timetable content or not-enrolled message | Content visible         |
| Notices — should render notices page                                 | Notices page loads      |

#### `parent-access.spec.ts` — 9 tests

| Test                                             | Description                   |
| ------------------------------------------------ | ----------------------------- |
| should access student portal dashboard as parent | Parent sees student dashboard |
| should access student attendance as parent       | Attendance page loads         |
| should access student fees as parent             | Fees page loads               |
| should access student exams as parent            | Exams page loads              |
| should access student materials as parent        | Materials page loads          |
| should access student assignments as parent      | Assignments page loads        |
| should access student timetable as parent        | Timetable page loads          |
| should access student notices as parent          | Notices page loads            |
| should NOT access admin panel as parent          | Redirected to student portal  |

### 6. Staff Portal (24 tests)

#### `staff-portal.spec.ts` — 24 tests

**Dashboard (3 tests)**
| Test | Description |
|------|-------------|
| should render staff dashboard | Dashboard loads for staff role |
| should display dashboard heading | Heading visible |
| should show dashboard cards or sections | Cards rendered |

**Teacher Access (7 tests)**
| Test | Description |
|------|-------------|
| should render staff dashboard for teacher | Teacher sees staff dashboard |
| should access admin panel as teacher | Admin panel loads |
| should access student attendance as teacher | Attendance admin page loads |
| should access student exams as teacher | Exams admin page loads |
| should access student materials as teacher | Materials admin page loads |
| should access timetable as teacher | Timetable page loads |
| should access notices as teacher | Notices page loads |

**Staff Role Admin Access (6 tests)**
| Test | Description |
|------|-------------|
| should not render admin-only staff management content | Admin-only restricted |
| should access staff attendance admin page | Staff attendance loads |
| should access staff leaves admin page | Leave management loads |
| should access student enquiries as staff | Enquiries page loads |
| should access student registrations as staff | Registrations page loads |
| should access reports as staff | Reports page loads |

**Accountant Access (8 tests)**
| Test | Description |
|------|-------------|
| should access admin dashboard as accountant | Dashboard loads |
| should access student fees as accountant | Fee management loads |
| should access payroll as accountant | Payroll page loads |
| should access income as accountant | Income page loads |
| should access expenses as accountant | Expenses page loads |
| should access financial reports as accountant | Financial reports loads |
| should access reports as accountant | Reports page loads |
| should NOT access staff portal as accountant | Redirected away |

---

## Role Coverage Matrix

| Page/Feature                 | Admin | Student | Teacher | Staff | Accountant | Parent |
| ---------------------------- | :---: | :-----: | :-----: | :---: | :--------: | :----: |
| Admin Dashboard              |  ✅   |   ❌    |   ✅    |  ✅   |     ✅     |   ❌   |
| Student Portal               |  ❌   |   ✅    |   ❌    |  ❌   |     ❌     |   ✅   |
| Staff Portal                 |   —   |    —    |   ✅    |  ✅   |     ❌     |   —    |
| User Management              |  ✅   |    —    |    —    |   —   |     —      |   —    |
| Student Registrations        |  ✅   |    —    |    —    |  ✅   |     —      |   —    |
| Admission Enquiries          |  ✅   |    —    |    —    |  ✅   |     —      |   —    |
| Student Attendance (admin)   |  ✅   |    —    |   ✅    |   —   |     —      |   —    |
| Student Fees (admin)         |  ✅   |    —    |    —    |   —   |     ✅     |   —    |
| Student Exams (admin)        |  ✅   |    —    |   ✅    |   —   |     —      |   —    |
| Student Materials (admin)    |  ✅   |    —    |   ✅    |   —   |     —      |   —    |
| Courses / Classes / Subjects |  ✅   |    —    |    —    |   —   |     —      |   —    |
| Academic Year                |  ✅   |    —    |    —    |   —   |     —      |   —    |
| Staff Management             |  ✅   |    —    |    —    |   —   |     —      |   —    |
| Staff Attendance (admin)     |  ✅   |    —    |    —    |  ✅   |     —      |   —    |
| Staff Leaves                 |  ✅   |    —    |    —    |  ✅   |     —      |   —    |
| Payroll                      |  ✅   |    —    |    —    |   —   |     ✅     |   —    |
| Timetable (admin)            |  ✅   |    —    |   ✅    |   —   |     —      |   —    |
| Income                       |  ✅   |    —    |    —    |   —   |     ✅     |   —    |
| Expenses                     |  ✅   |    —    |    —    |   —   |     ✅     |   —    |
| Financial Reports            |  ✅   |    —    |    —    |   —   |     ✅     |   —    |
| Reports                      |  ✅   |    —    |    —    |  ✅   |     ✅     |   —    |
| Notices (admin)              |  ✅   |    —    |   ✅    |   —   |     —      |   —    |
| Settings                     |  ✅   |    —    |    —    |   —   |     —      |   —    |
| Authorization                |  ✅   |    —    |    —    |   —   |     —      |   —    |
| Student Attendance (portal)  |   —   |   ✅    |    —    |   —   |     —      |   ✅   |
| Student Fees (portal)        |   —   |   ✅    |    —    |   —   |     —      |   ✅   |
| Student Exams (portal)       |   —   |   ✅    |    —    |   —   |     —      |   ✅   |
| Student Materials (portal)   |   —   |   ✅    |    —    |   —   |     —      |   ✅   |
| Student Assignments (portal) |   —   |   ✅    |    —    |   —   |     —      |   ✅   |
| Student Timetable (portal)   |   —   |   ✅    |    —    |   —   |     —      |   ✅   |
| Student Notices (portal)     |   —   |   ✅    |    —    |   —   |     —      |   ✅   |

✅ = tested for access, ❌ = tested for denial, — = not applicable

---

## Playwright Config (`playwright.config.ts`)

| Setting           | Value                        |
| ----------------- | ---------------------------- |
| testDir           | `./playwright-tests`         |
| timeout           | 120,000ms (2 min)            |
| expect.timeout    | 20,000ms                     |
| retries           | 1 (local), 2 (CI)            |
| workers           | 50% of CPUs                  |
| fullyParallel     | true                         |
| reporter          | html                         |
| webServer.command | `npm run dev -- --port 3001` |
| webServer.port    | 3001                         |

### Projects

| Project       | Dependencies | Storage State | Purpose                          |
| ------------- | ------------ | ------------- | -------------------------------- |
| `auth-setup`  | none         | —             | Creates auth state for all roles |
| `chromium`    | auth-setup   | —             | Base browser project             |
| `admin`       | auth-setup   | admin.json    | Admin panel tests                |
| `student`     | auth-setup   | student.json  | Student portal tests             |
| `staff`       | auth-setup   | staff.json    | Staff portal tests               |
| `role-access` | auth-setup   | —             | RBAC, navigation, tenant tests   |
