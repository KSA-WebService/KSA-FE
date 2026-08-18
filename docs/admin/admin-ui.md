# KSA Admin UI Specification

## 1. Admin Login

### Purpose

Provide a dedicated login page for KSA administrators.

There is no separate admin sign-up flow.

All accounts are initially created through the user-facing invitation and onboarding process. An existing user may later be assigned the `admin` role by an authorized administrator.

A successful Supabase login alone does not grant access to the admin interface. Administrator access must always be verified through the KSA backend.

### Route

- Login page: `/admin/login`
- After successful administrator verification: `/admin`

### Layout

The page contains:

- KSA Logo
- Email input
- Password input
- `Log In` button

The following features are not included in the current MVP:

- Sign Up
- Forgot Password
- Remember Me
- Social Login

### Form Fields

#### Email

- Label: `Email`
- Input type: `email`
- Required: Yes

If empty:

    이메일을 입력해주세요.

#### Password

- Label: `Password`
- Input type: `password`
- Required: Yes

If empty:

    비밀번호를 입력해주세요.

Password complexity rules do not need to be revalidated on the login page because this page authenticates an existing account rather than creating a new account.

### Primary Action

#### `Log In`

When the administrator submits the form:

1. Disable the button to prevent duplicate requests.
2. Authenticate with Supabase using email and password.
3. Obtain the authenticated Supabase session and access token.
4. Call `GET /api/v1/admin/me` with the access token.
5. If administrator verification succeeds:
   - Store or use the returned administrator profile.
   - Navigate to `/admin`.
6. If administrator verification fails because the account is not an administrator:
   - Sign out from Supabase.
   - Remain on `/admin/login`.
   - Display:

     관리자 권한이 없는 계정입니다.

The button may display `Logging in...` while the request is in progress.

### Authentication Flow

    Email + Password
            ↓
    Supabase signInWithPassword
            ↓
    Authentication failed
            └─ Display login error
            ↓
    Authentication succeeded
            ↓
    Supabase access token
            ↓
    GET /api/v1/admin/me
            ↓
    Admin verification succeeded
            └─ Navigate to /admin

    Admin verification failed
            └─ Supabase signOut
            └─ Remain on /admin/login

### Existing Session Behavior

When `/admin/login` is opened and a Supabase session already exists:

1. Retrieve the existing session.
2. Call `GET /api/v1/admin/me`.
3. If administrator verification succeeds:
   - Redirect directly to `/admin`.
4. If verification fails:
   - Sign out from Supabase.
   - Keep the user on `/admin/login`.

A Supabase session alone must never be treated as proof of administrator access.

### Administrator Profile

After `GET /api/v1/admin/me` succeeds, the following administrator information is available:

- `userId`
- `name`
- `email`
- `role`
- `status`

The returned `name` should be used by the shared admin layout for greetings such as:

    Hi, Sulynn Kim

Do not separately call `GET /api/v1/users/me` for the admin login flow.

### Error Handling

#### Invalid Credentials

Display:

    이메일 또는 비밀번호를 확인해주세요.

Do not display raw Supabase authentication error messages directly to the user.

#### Non-Admin Account

Display:

    관리자 권한이 없는 계정입니다.

The Supabase session must be signed out.

#### Backend or Network Failure

Display:

    서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.

#### Duplicate Submission

The `Log In` button must remain disabled while authentication or administrator verification is in progress.

### API Integration

#### Supabase Authentication

Use the Supabase frontend client:

    supabase.auth.signInWithPassword({
      email,
      password,
    })

The frontend must use only client-safe Supabase configuration.

Never expose backend-only credentials such as:

- `SUPABASE_SECRET_KEY`
- `DATABASE_URL`
- `DIRECT_URL`
- `RESEND_API_KEY`

#### Administrator Verification

- Endpoint: `GET /api/v1/admin/me`
- Purpose:
  - Verify that the authenticated Supabase account has administrator access.
  - Retrieve the current administrator profile.
  - Provide the administrator name for the shared admin layout.

See `api-contract.md` for the confirmed API contract.

### Implementation Rules

- Do not create or assume a KSA backend login endpoint.
- Authentication is performed through Supabase Auth.
- Administrator authorization is verified through `GET /api/v1/admin/me`.
- Do not use `GET /api/v1/users/me` to determine admin access.
- Do not allow a regular student account into the admin interface.
- Do not add an admin sign-up flow.
- Do not expose backend secrets to the frontend.
- Do not display raw Supabase provider errors to users.
- All authenticated KSA backend requests must use the Supabase access token as a Bearer token.
- Short UI labels, controls, table headers, and status labels should generally use English.
- User-facing guidance, explanations, confirmations, and error sentences should generally use Korean.

### Done Criteria

The page is complete when:

- An administrator can enter email and password and log in.
- Supabase authentication works correctly.
- Administrator access is verified using `GET /api/v1/admin/me`.
- A valid administrator is redirected to `/admin`.
- Incorrect credentials remain on the login page and show the correct error message.
- A non-admin account cannot enter the admin interface.
- A rejected non-admin session is signed out.
- An existing valid admin session bypasses the login page.
- Duplicate login submissions are prevented.
- Loading and error states are handled.
- No backend secrets are exposed to the browser.

## 2. Admin Dashboard

### Purpose

Provide the landing page for authenticated KSA administrators.

The dashboard gives a quick overview of the most important current counts and provides shortcuts to common creation flows.

No separate dashboard backend endpoint is required for the current MVP. The summary cards use the existing admin list APIs and read their `pagination.total` values.

### Route

`/admin`

### Shared Admin Layout

All authenticated admin pages should use the same shared layout.

#### Sidebar Navigation

| Label       | Route              |
| ----------- | ------------------ |
| `Dashboard` | `/admin`           |
| `Users`     | `/admin/users`     |
| `Posts`     | `/admin/posts`     |
| `Token`     | `/admin/token`     |
| `Whitelist` | `/admin/whitelist` |
| `Orders`    | `/admin/orders`    |
| `Products`  | `/admin/products`  |
| `Logs`      | `/admin/logs`      |

Use `Users` instead of `Students` because the admin user-management area contains both student and admin accounts.

Use `Posts` instead of `Event` because the content-management area handles multiple post categories, not only events.

#### Admin Greeting

Display:

    Hi, {admin.name}

Use the `name` returned by `GET /api/v1/admin/me`.

Example:

    Hi, Sulynn Kim

#### `Log Out`

When clicked:

1. Sign out from Supabase.
2. Clear frontend admin/session state.
3. Navigate to `/admin/login`.

### Page Header

Title:

`Dashboard`

### Summary Cards

Display three summary cards.

#### `New Orders`

Meaning:

Number of orders currently in the `ordered` state and waiting for administrator processing.

API:

`GET /api/v1/admin/orders?page=1&limit=1&orderStatus=ordered`

Display:

`success.pagination.total`

The returned `items` are not used on the dashboard.

Card click behavior:

Navigate to:

`/admin/orders?status=ordered`

#### `Total Posts`

Meaning:

Total number of current non-deleted admin-manageable posts.

API:

`GET /api/v1/admin/posts?page=1&limit=1`

Display:

`success.pagination.total`

The returned `items` are not used on the dashboard.

Card click behavior:

Navigate to:

`/admin/posts`

#### `Total Users`

Meaning:

Total number of current KSA users, including both `student` and `admin` roles.

API:

`GET /api/v1/admin/users?page=1&limit=1`

Display:

`success.pagination.total`

The returned `items` are not used on the dashboard.

Card click behavior:

Navigate to:

`/admin/users`

### Quick Actions

Display two quick-action buttons.

#### `New Post`

Navigate to:

`/admin/posts/new`

#### `New Product`

Navigate to:

`/admin/products/new`

Do not add additional quick actions in the current MVP unless they are confirmed later.

### Loading State

While dashboard summary data is loading:

- Keep the shared admin layout visible.
- Show loading placeholders or skeletons inside the three summary cards.
- Do not temporarily display `0` while the real value is still loading.

The three dashboard requests may be executed in parallel.

### Error Handling

If one summary request fails but the others succeed:

- Keep successful summary cards visible.
- Show an unavailable state only for the failed card.
- Do not fail the entire dashboard because one count could not be loaded.

Recommended unavailable text:

    데이터를 불러오지 못했습니다.

If administrator authentication is no longer valid, follow the shared admin authentication handling rather than treating it as a normal dashboard-data error.

### Empty State

A valid total count of zero should display:

`0`

Zero is not an error state.

### API Integration

The dashboard uses:

- `GET /api/v1/admin/me`
- `GET /api/v1/admin/orders?page=1&limit=1&orderStatus=ordered`
- `GET /api/v1/admin/posts?page=1&limit=1`
- `GET /api/v1/admin/users?page=1&limit=1`

All KSA backend requests require the current Supabase access token as a Bearer token.

See `api-contract.md` for the confirmed response structures.

### Implementation Rules

- Do not create or assume a dedicated dashboard or statistics backend endpoint for the current MVP.
- Read dashboard counts from `success.pagination.total`.
- Do not calculate totals from `items.length`.
- Do not fetch large page sizes solely to calculate dashboard counts.
- Use `Users`, not `Students`, in the admin navigation.
- Use `Posts`, not `Event`, in the admin navigation.
- Use `New Post`, not `New Event`.
- Keep the admin sidebar and greeting in a reusable shared admin layout.
- Reuse the authenticated admin profile instead of repeatedly calling `/admin/me` from every individual component when the profile is already available in shared state.
- Short labels and controls should use English.
- User-facing explanatory and error sentences should use Korean.

### Done Criteria

The page is complete when:

- An authenticated administrator can open `/admin`.
- The shared admin sidebar is displayed.
- The administrator greeting uses the name from `/api/v1/admin/me`.
- `Log Out` signs out and returns to `/admin/login`.
- `New Orders` displays the total number of `ordered` orders.
- `Total Posts` displays the total number of current posts.
- `Total Users` displays the total number of current users.
- The three counts are read from `pagination.total`.
- Summary cards navigate to their related admin pages.
- `New Post` navigates to `/admin/posts/new`.
- `New Product` navigates to `/admin/products/new`.
- Loading and partial-error states are handled.
- No new dashboard backend endpoint is assumed or required.

## 3. Users List

### Purpose

Provide administrators with a searchable and filterable list of current KSA user accounts.

This page includes both `student` and `admin` accounts.

It is a user-management page, not a registration page. New accounts are created through the invitation/onboarding flow, so this page does not provide an `Add User` action.

### Route

`/admin/users`

### Page Header

Title:

`Users`

### Search and Filters

#### Search

Show a search input above the table.

Placeholder:

`Search by name, email, or student ID`

Backend query parameter:

`keyword`

The keyword search matches:

- Name
- Email
- Student ID

Do not use a `search` query parameter.

Recommended behavior:

- Debounce text input briefly before requesting new results.
- Reset pagination to page 1 whenever the keyword changes.
- Trim unnecessary surrounding whitespace before using the search value.

#### Role Filter

Label:

`Role`

Options:

- `All Roles`
- `Student`
- `Admin`

Backend values:

- no query value for `All Roles`
- `student`
- `admin`

#### Status Filter

Label:

`Status`

Options:

- `All Statuses`
- `Active`
- `Blocked`

Backend values:

- no query value for `All Statuses`
- `active`
- `blocked`

Changing a filter resets pagination to page 1.

### Table Columns

Use the following columns in this order:

| UI Column       | API Field       | Notes                                               |
| --------------- | --------------- | --------------------------------------------------- |
| `Name`          | `name`          | User display name                                   |
| `Student ID`    | `studentNumber` | Use the user-facing term `Student ID`               |
| `Email`         | `email`         | HKUST Connect email                                 |
| `Role`          | `role`          | Display as a status-style badge                     |
| `Token Balance` | `tokenBalance`  | Current token balance                               |
| `Status`        | `status`        | Use `Status` instead of the longer `Account Status` |
| `Joined At`     | `createdAt`     | Represents when the KSA account was created         |
| `Actions`       | `userId`        | Use `Actions` instead of `Details`                  |

Do not add columns that are only available from the user-detail API, such as privacy agreement fields or `updatedAt`.

### Table Value Presentation

#### Role

Backend values:

- `student`
- `admin`

Display labels:

- `Student`
- `Admin`

#### Status

Backend values:

- `active`
- `blocked`

Display labels:

- `Active`
- `Blocked`

Role and status should be visually distinguishable, such as with compact badges.

#### Token Balance

Display the numeric token balance directly.

Example:

`5`

#### Joined At

Format the ISO timestamp into a readable date/time for the admin UI.

The exact shared date/time formatting convention should be defined globally in `product.md`.

### Sorting

The backend supports server-side sorting for all displayed data columns except `Actions`.

Sortable fields:

- `Name` → `name`
- `Student ID` → `student_number`
- `Email` → `email`
- `Role` → `role`
- `Token Balance` → `token_balance`
- `Status` → `status`
- `Joined At` → `created_at`

Sort order values:

- `asc`
- `desc`

Default backend sort:

- `sort=created_at`
- `order=desc`

Recommended UI behavior:

- Make sortable table headers clickable.
- Clicking a column applies ascending order first.
- Clicking the same column again toggles ascending/descending.
- Reset to page 1 when sorting changes.
- The active sort column and direction should be visually indicated.

### Row Action

#### `View`

Display a `View` button in the `Actions` column.

On click:

Navigate to:

`/admin/users/{userId}`

The list page itself does not edit role or status directly. User changes are handled on the user-detail page.

### Pagination

Use server-side pagination.

Default page size:

`20`

Backend response fields:

- `page`
- `limit`
- `total`
- `totalPages`

Recommended UI:

- Previous button
- Page numbers when practical
- Next button
- Optional compact total indicator such as `4 users`

Do not calculate the total from `items.length`.

Do not request all users at once.

### URL State

Keep useful list state in the frontend URL query when practical.

Example:

`/admin/users?page=2&keyword=Kim&role=student&status=active&sort=created_at&order=desc`

This allows the list state to survive refreshes and navigation back from a detail page.

Only include filters that currently have values.

### Loading State

While loading:

- Keep the page header, search, and filters visible.
- Show table skeleton rows or an equivalent loading state.
- Do not replace loading data with fake placeholder users.

### Empty States

If there are no users at all:

    등록된 사용자가 없습니다.

If filters or keyword search return no matches:

    조건에 맞는 사용자가 없습니다.

### Error Handling

If the user list cannot be loaded:

    사용자 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.

Provide a simple retry action when practical.

Authentication/authorization failures should follow the shared admin authentication handling instead of being shown as a normal list-data error.

### API Integration

Primary endpoint:

`GET /api/v1/admin/users`

Authentication:

Required administrator Bearer token.

Supported query parameters:

- `page`
- `limit`
- `keyword`
- `role`
- `status`
- `sort`
- `order`

See `api-contract.md` for the confirmed query and response contract.

### Implementation Rules

- Use `keyword`, not `search`, for text search.
- Search should cover name, email, and student ID through the backend API.
- Do not implement client-side filtering over the currently loaded page.
- Do not implement client-side sorting over the currently loaded page.
- Use backend pagination, filtering, and sorting.
- Do not add a user-creation button on this page.
- Use `Status` instead of `Account Status`.
- Use `Actions` instead of `Details`.
- Keep `Email` in the table because it is useful for distinguishing and administering accounts.
- Keep `Token Balance` because it is operationally useful to KSA administrators.
- Do not expose internal UUIDs as a visible table column.
- Use the `userId` only for navigation and API requests.
- Short labels and controls should use English.
- User-facing explanatory and error sentences should use Korean.

### Done Criteria

The page is complete when:

- `/admin/users` loads the admin user list from the backend.
- Both student and admin accounts can appear in the list.
- Keyword search works using `keyword`.
- Role filtering works.
- Status filtering works.
- Filters can be combined.
- Server-side sorting works for supported columns.
- Pagination uses backend pagination metadata.
- The table displays the confirmed user fields.
- Role and status values are presented clearly.
- Each row has a `View` action.
- `View` navigates to the correct user-detail route.
- Loading, empty, no-result, and error states are handled.

## 4. User Details

### Purpose

Allow administrators to review an individual KSA user account and update only the account-management fields that are intentionally editable.

This page is not used to edit identity information or token balances.

### Route

`/admin/users/{userId}`

### Page Header

Show:

- `← Back to Users`
- Page title: `User Details`
- User name prominently below or beside the title

The back action returns to `/admin/users` and should preserve the previous list query state when practical.

### Information Sections

#### Profile Information

Display as read-only:

| UI Label        | API Field       |
| --------------- | --------------- |
| `Name`          | `name`          |
| `Student ID`    | `studentNumber` |
| `Email`         | `email`         |
| `Token Balance` | `tokenBalance`  |

Do not allow editing of these fields on this page.

`Token Balance` must not be edited directly here. Token changes belong to the dedicated Token management flow.

#### Account Management

Only the following fields are editable:

##### `Role`

Use a select dropdown.

Options:

- `Student`
- `Admin`

Backend values:

- `student`
- `admin`

##### `Status`

Use a select dropdown.

Options:

- `Active`
- `Blocked`

Backend values:

- `active`
- `blocked`

Do not save immediately when a dropdown value changes.

#### Consent & Activity

Display as read-only:

| UI Label          | API Field       |
| ----------------- | --------------- |
| `Privacy Consent` | `agreedPrivacy` |
| `Agreed At`       | `agreedAt`      |
| `Joined At`       | `createdAt`     |
| `Updated At`      | `updatedAt`     |

`Privacy Consent` display:

- `true` → `Agreed`
- `false` → `Not Agreed`

If `agreedAt` is `null`, display:

`—`

Do not infer an agreement timestamp from `agreedPrivacy`.

### Save Behavior

Primary action:

`Save Changes`

The button should be disabled when:

- No editable field has changed.
- A save request is already in progress.

Send only fields whose values actually changed.

Examples:

Status-only update:

    {
      "status": "blocked"
    }

Role-only update:

    {
      "role": "admin"
    }

Role and status update:

    {
      "role": "admin",
      "status": "active"
    }

After a successful update:

1. Replace the displayed user state with the returned response.
2. Close the confirmation modal.
3. Disable `Save Changes` again because there are no unsaved changes.
4. Display:

   사용자 정보가 저장되었습니다.

A full page reload is not required.

### Confirmation Modal

Clicking `Save Changes` with actual changes opens a confirmation modal.

Modal title:

`Confirm Changes`

Body:

    다음 변경사항을 저장하시겠습니까?

List only fields that actually changed.

Example:

    Role: Student → Admin
    Status: Active → Blocked

Buttons:

- `Cancel`
- `Save Changes`

#### Role Change Guidance

When changing `Student` → `Admin`, display:

    이 사용자는 관리자 권한을 갖게 됩니다.

When changing `Admin` → `Student`, display:

    이 사용자의 관리자 권한이 제거됩니다.

#### Status Change Guidance

When changing `Active` → `Blocked`, display:

    차단된 사용자는 로그인 후 KSA의 인증이 필요한 기능을 사용할 수 없습니다.

When changing `Blocked` → `Active`, display:

    이 사용자의 계정 접근 권한이 다시 활성화됩니다.

### Current Administrator Protection

The frontend already knows the signed-in administrator's `userId` from `GET /api/v1/admin/me`.

When:

`detail.userId === currentAdmin.userId`

prevent the administrator from performing actions that the backend also forbids.

#### Own Role

If the current account is an admin:

- Disable the `Student` role option.

#### Own Status

- Disable the `Blocked` status option.

Display:

    현재 로그인한 관리자 계정의 권한을 낮추거나 차단할 수 없습니다.

This frontend restriction improves UX but must not replace backend authorization checks.

### Loading State

While loading the user:

- Keep the shared admin layout visible.
- Show a detail-page skeleton or loading placeholders.
- Do not render fake user values.

While saving:

- Disable editable controls when practical.
- Disable `Save Changes`.
- Prevent duplicate submissions.

### Error Handling

#### User Not Found

Backend error code:

`U404_USER_NOT_FOUND`

Display:

    사용자를 찾을 수 없습니다.

Provide a way to return to `Users`.

#### Self Role Change

Backend error code:

`U403_SELF_ROLE_CHANGE_NOT_ALLOWED`

Display:

    현재 로그인한 관리자 계정의 권한을 낮출 수 없습니다.

#### Self Block

Backend error code:

`U403_SELF_BLOCK_NOT_ALLOWED`

Display:

    현재 로그인한 관리자 계정은 차단할 수 없습니다.

#### Generic Save Failure

Display:

    변경사항을 저장하지 못했습니다. 잠시 후 다시 시도해주세요.

Frontend behavior should use stable KSA `errorCode` values rather than raw backend or provider messages.

### API Integration

Load user:

`GET /api/v1/admin/users/{userId}`

Update user:

`PATCH /api/v1/admin/users/{userId}`

Authentication:

Required administrator Bearer token.

Editable request fields:

- `role`
- `status`

See `api-contract.md` for confirmed response structures.

### Implementation Rules

- Use read-only display for name, student ID, email, and token balance.
- Do not provide direct token editing on this page.
- Use select dropdowns for role and status.
- Do not apply role/status changes immediately when a selection changes.
- Require `Confirm Changes` before saving.
- Send only changed editable fields.
- Disable self-demotion and self-blocking controls in the UI.
- Keep backend self-protection as the source of truth.
- Use `Privacy Consent`, not `Privacy Agreement`.
- Display nullable timestamps as `—`.
- Short labels and controls should use English.
- Confirmation, guidance, success, and error sentences should use Korean.

### Done Criteria

The page is complete when:

- `/admin/users/{userId}` loads the correct user.
- Profile information is displayed read-only.
- Role uses a select dropdown.
- Status uses a select dropdown.
- Consent and account timestamps are displayed.
- `agreedAt: null` is handled correctly.
- `Save Changes` is enabled only for actual changes.
- Save opens a confirmation modal.
- Only changed fields are submitted.
- Successful updates refresh the page state from the API response.
- The current administrator cannot demote or block their own account in the UI.
- Backend self-protection errors are handled.
- Loading, not-found, save-loading, success, and error states are handled.

## 5. Whitelist List

### Purpose

Provide administrators with a searchable and filterable list of students who are allowed to enter the KSA invitation and onboarding flow.

This page manages whitelist records and invitation state. It is separate from the `Users` page, which manages accounts that already exist in the KSA user table.

### Route

`/admin/whitelist`

### Page Header

Title:

`Whitelist`

Header actions:

- `Import Excel`
- `Add Student`

Recommended emphasis:

- `Add Student` is the primary action.
- `Import Excel` is a secondary action.

### Search and Filter

#### Search

Show a search input above the table.

Placeholder:

`Search by name, email, or student ID`

Backend query parameter:

`keyword`

Do not use `search`.

Recommended behavior:

- Debounce text input briefly before requesting new results.
- Trim surrounding whitespace.
- Reset pagination to page 1 when the keyword changes.

#### Invitation Status Filter

Label:

`Invitation Status`

Options:

- `All Statuses`
- `Pending`
- `Invited`
- `Accepted`
- `Expired`
- `Failed`

Backend values:

- no query value for `All Statuses`
- `pending`
- `invited`
- `accepted`
- `expired`
- `failed`

Changing the filter resets pagination to page 1.

### Table Columns

Use the following columns in this order:

| UI Column           | API Field          | Notes                                            |
| ------------------- | ------------------ | ------------------------------------------------ |
| `Name`              | `name`             | Student name                                     |
| `Student ID`        | `studentNumber`    | HKUST student ID                                 |
| `Email`             | `email`            | HKUST Connect email                              |
| `Invitation Status` | `invitationStatus` | Display as a status badge                        |
| `Invited At`        | `invitedAt`        | Display `—` when no invitation has been sent     |
| `Added At`          | `createdAt`        | More user-friendly than the generic `Created At` |
| `Actions`           | `whitelistUserId`  | Contains the row action                          |

Do not expose `whitelistUserId` as a visible table column.

### Invitation Status Presentation

Backend values map to UI labels as follows:

| Backend    | UI         |
| ---------- | ---------- |
| `pending`  | `Pending`  |
| `invited`  | `Invited`  |
| `accepted` | `Accepted` |
| `expired`  | `Expired`  |
| `failed`   | `Failed`   |

Use compact status badges so different invitation states can be scanned quickly.

Status meaning:

- `Pending`: added to the whitelist but invitation has not been successfully sent.
- `Invited`: an invitation has been sent and onboarding has not yet been completed.
- `Accepted`: onboarding/invitation flow has been accepted.
- `Expired`: the invitation expired before completion.
- `Failed`: invitation processing or delivery failed.

### Date Presentation

#### Invited At

If `invitedAt` is a timestamp, display it using the shared admin date/time format.

If `invitedAt` is `null`, display:

`—`

Do not infer an invitation time from another field.

#### Added At

Use `createdAt`.

Display it using the shared admin date/time format.

### Row Action

#### `View`

Display a `View` button in the `Actions` column.

On click, navigate to:

`/admin/whitelist/{whitelistUserId}`

Invitation sending, resending, deletion, and detailed state handling should occur on the whitelist-detail page rather than directly in the list table.

### Add Student Action

Clicking `Add Student` should open a modal rather than navigate to a separate page.

Reason:

A single whitelist entry requires only a small number of fields, so a modal keeps the administrator in context and avoids an unnecessary page transition.

Detailed form fields, validation, request contract, and success/error behavior are defined with the whitelist-create API specification.

### Import Excel Action

Clicking `Import Excel` should open a dedicated import modal or dialog rather than navigate to a separate full page.

The import flow may require file selection, duplicate-handling policy, validation feedback, and import results, so it should be visually separated from the simple `Add Student` modal.

The detailed import workflow is defined separately after the implemented import API contract is confirmed.

### Pagination

Use server-side pagination.

Default page size:

`20`

Use the backend pagination object:

- `page`
- `limit`
- `total`
- `totalPages`

Recommended controls:

- Previous
- Page numbers when practical
- Next
- Optional total indicator such as `17 whitelist entries`

Do not calculate the total from `items.length`.

### URL State

Keep useful list state in the URL query when practical.

Example:

`/admin/whitelist?page=2&keyword=Kim&invitationStatus=invited`

This helps preserve list state after refreshing or returning from a detail page.

### Loading State

While loading:

- Keep the page header, search, filter, and action buttons visible.
- Show table skeleton rows or an equivalent loading state.
- Do not display fake whitelist records.

### Empty States

If the whitelist contains no entries:

    화이트리스트에 등록된 학생이 없습니다.

If keyword/filter conditions return no results:

    조건에 맞는 화이트리스트 항목이 없습니다.

### Error Handling

If the list cannot be loaded:

    화이트리스트를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.

Provide a retry action when practical.

Authentication and authorization failures should follow shared admin authentication handling.

### API Integration

Primary endpoint:

`GET /api/v1/admin/auth/whitelist-users`

Authentication:

Required administrator Bearer token.

Confirmed query parameters used by this page:

- `page`
- `limit`
- `keyword`
- `invitationStatus`

See `api-contract.md` for the confirmed list response contract.

### Implementation Rules

- Use `keyword`, not `search`.
- Use server-side search, status filtering, and pagination.
- Do not implement client-side filtering over only the currently loaded page.
- Use `Added At` instead of `Created At` in the UI.
- Use `Actions` instead of `Details`.
- Display `invitedAt: null` as `—`.
- Do not expose whitelist UUIDs as visible table data.
- Keep invitation mutations out of inline table controls for the current MVP.
- `Add Student` should open a modal.
- `Import Excel` should open a separate import modal/dialog.
- Short labels and controls should use English.
- Explanatory and error sentences should use Korean.

### Done Criteria

The page is complete when:

- `/admin/whitelist` loads the whitelist list from the backend.
- Keyword search works using `keyword`.
- Invitation-status filtering works.
- Server-side pagination works.
- The table displays the confirmed whitelist fields.
- Null `invitedAt` values are handled correctly.
- Invitation statuses are clearly presented.
- Each row has a `View` action.
- `View` navigates to the correct whitelist-detail route.
- `Add Student` opens its modal.
- `Import Excel` opens its import modal/dialog.
- Loading, empty, no-result, and error states are handled.

## 5.1 Add Student Modal

### Purpose

Allow an administrator to add one student to the whitelist without leaving the whitelist list page.

Creating a whitelist entry does not send an invitation automatically. A newly created entry starts in the `Pending` invitation state, and invitation sending is handled separately from the whitelist-detail page.

### Entry Point

Open this modal from:

`/admin/whitelist`

Button:

`Add Student`

### Modal

Title:

`Add Student`

Fields:

| Label        | Input Type | Required | API Field       |
| ------------ | ---------- | -------- | --------------- |
| `Name`       | text       | Yes      | `name`          |
| `Student ID` | text       | Yes      | `studentNumber` |
| `Email`      | email      | Yes      | `email`         |

`Student ID` must be treated as text, not as a numeric-only input.

Buttons:

- `Cancel`
- `Add Student`

Do not add a second confirmation modal. Adding a whitelist entry is a low-risk, reversible administrative action and should remain a short flow.

### Validation

Before submitting:

- All three fields are required.
- Trim unnecessary surrounding whitespace.
- Validate the email as an email input.
- Do not convert `Student ID` to a number.

Recommended empty-field messages:

Name:

    이름을 입력해주세요.

Student ID:

    학번을 입력해주세요.

Email:

    이메일을 입력해주세요.

Invalid email format:

    올바른 이메일 형식을 입력해주세요.

Backend validation remains the source of truth for final acceptance.

### Submit Behavior

Submit:

`POST /api/v1/admin/auth/whitelist-users`

While submitting:

- Disable form inputs when practical.
- Disable `Add Student`.
- Prevent duplicate submissions.

### Success Behavior

A successful creation returns a whitelist detail object.

The newly created entry is expected to begin with:

- `invitationStatus: pending`
- `invitedAt: null`
- `acceptedAt: null`

After success:

1. Close the modal.
2. Refresh or invalidate the whitelist list.
3. Display:

   화이트리스트에 학생이 추가되었습니다.

Do not send an invitation automatically.

### Duplicate Error Handling

#### Duplicate Email

Backend error code:

`W409_EMAIL`

Display:

    이미 화이트리스트에 등록된 이메일입니다.

Keep the modal open and preserve the entered values so the administrator can correct them.

#### Duplicate Student ID

Backend error code:

`W409_STUDENT_NUMBER`

Display:

    이미 화이트리스트에 등록된 학번입니다.

Keep the modal open and preserve the entered values.

### Generic Error

Display:

    학생을 화이트리스트에 추가하지 못했습니다. 잠시 후 다시 시도해주세요.

Do not display raw backend `reason` text directly when a stable error code is available.

### Implementation Rules

- Use a modal, not a separate page.
- Do not send an invitation as part of student creation.
- Treat `studentNumber` as a string.
- Preserve form values after recoverable backend validation errors.
- Use stable backend `errorCode` values for known duplicate cases.
- Refresh the whitelist list after successful creation.

### Done Criteria

The modal is complete when:

- It opens from `Add Student`.
- Name, Student ID, and Email can be entered.
- Required-field validation works.
- Student ID is handled as text.
- Duplicate email and student ID errors show clear Korean messages.
- Duplicate submission is prevented.
- Successful creation closes the modal.
- The whitelist list refreshes after creation.
- The created entry appears as `Pending`.
- No invitation is sent automatically.

## 5.2 Import Students Dialog

### Purpose

Allow administrators to import multiple whitelist entries from an externally prepared Excel file.

The backend import endpoint accepts JSON rows rather than an Excel file. Therefore Excel parsing happens in the frontend before the backend request is sent.

### Entry Point

Open from:

`/admin/whitelist`

Button:

`Import Excel`

### High-Level Flow

    Select Excel file
          ↓
    Parse rows in the browser
          ↓
    Validate required columns
          ↓
    Review parsed students
          ↓
    Choose duplicate-handling policy
          ↓
    Convert rows to JSON
          ↓
    POST /api/v1/admin/auth/whitelist-users/import
          ↓
    Show import result summary
          ↓
    Refresh whitelist list

The Excel file itself is not uploaded to the KSA backend import endpoint.

### Step 1 — Upload File

Dialog title:

`Import Students`

Show a file selector.

For the MVP, support Excel workbooks readable by the selected frontend Excel parser.

Expected columns:

- `Name`
- `Student ID`
- `Email`

Recommended helper text:

    Excel 파일에는 Name, Student ID, Email 열이 필요합니다.

Buttons:

- `Cancel`
- `Continue`

`Continue` remains disabled until a file has been successfully parsed.

### Client-Side Parsing Rules

Convert each valid row to:

    {
      "name": "...",
      "studentNumber": "...",
      "email": "..."
    }

Rules:

- Ignore completely empty trailing rows.
- Treat Student ID as text.
- Trim surrounding whitespace.
- Do not send the request if the required columns are missing.
- Do not silently invent values for missing cells.

If required columns are missing:

    필요한 열을 찾을 수 없습니다. Name, Student ID, Email 열을 확인해주세요.

If the file cannot be parsed:

    Excel 파일을 읽을 수 없습니다. 파일 형식을 확인해주세요.

### Step 2 — Review Import

Show the parsed rows before submission.

Columns:

| Column       |
| ------------ |
| `Name`       |
| `Student ID` |
| `Email`      |

Show a summary such as:

`2 students ready to import`

#### Duplicate Handling

Label:

`Duplicate Handling`

Use a select dropdown.

Options:

- `Skip duplicates`
- `Fail duplicates`
- `Update duplicates`

Backend values:

- `skip`
- `fail`
- `update`

Recommended default:

`Skip duplicates`

`Skip duplicates` is the safest default because existing whitelist data is preserved and conflicting rows can be reviewed in the result.

Buttons:

- `Back`
- `Import Students`

### Submit Behavior

Submit:

`POST /api/v1/admin/auth/whitelist-users/import`

Request body contains:

- `onDuplicate`
- `users`

While importing:

- Disable navigation controls that could trigger a duplicate import.
- Disable `Import Students`.
- Show an in-progress state.

Do not upload the original Excel binary to this endpoint.

### Import Result Dialog

After a successful backend response, show:

Title:

`Import Complete`

Summary fields:

- `Total`
- `Created / Updated`
- `Skipped`
- `Failed`

The backend response uses:

- `totalCount`
- `successCount`
- `skippedCount`
- `failedCount`

Important:

`successCount` does not include skipped rows.

A confirmed import with one existing row and one new row returned:

- `totalCount: 2`
- `successCount: 1`
- `skippedCount: 1`
- `failedCount: 0`

### Row-Level Results

Show a result table when useful.

Recommended columns:

| UI Column    | API Field       |
| ------------ | --------------- |
| `Row`        | `rowIndex`      |
| `Email`      | `email`         |
| `Student ID` | `studentNumber` |
| `Result`     | `status`        |
| `Message`    | `errorMessage`  |

Confirmed result statuses include:

- `created`
- `skipped`

The UI should also display any additional valid result status returned by the implemented backend import contract.

Display status labels in title case.

Example:

- `created` → `Created`
- `skipped` → `Skipped`

A skipped row may contain an `errorMessage`. This is explanatory result information, not a failed HTTP request.

Example confirmed skipped message:

`Email or student number already exists in the whitelist`

For skipped rows, show a user-friendly Korean explanation when practical:

    이메일 또는 학번이 이미 화이트리스트에 등록되어 있습니다.

For failed rows, display the row-level reason in a readable form without exposing sensitive internal details.

### Closing the Result

Button:

`Done`

When clicked:

1. Close the import flow.
2. Refresh or invalidate the whitelist list.
3. Keep the administrator on `/admin/whitelist`.

### Error Handling

If the entire import request fails:

    학생 목록을 가져오지 못했습니다. 입력 데이터와 중복 처리 방식을 확인해주세요.

For unexpected server/network errors:

    학생 목록을 가져오지 못했습니다. 잠시 후 다시 시도해주세요.

Do not discard the parsed preview immediately after a recoverable request error. Allow the administrator to correct the duplicate policy or data and retry.

### Implementation Rules

- Parse Excel in the frontend.
- Send JSON rows to the backend.
- Do not create a new backend Excel-upload endpoint.
- Require a review step before import.
- Use a select dropdown for duplicate handling.
- Default duplicate handling to `Skip duplicates`.
- Treat Student ID as text.
- Distinguish row-level `skipped` results from failed requests.
- Use backend counts rather than recalculating summary totals from the currently rendered table.
- Refresh the whitelist list after the result dialog is closed.
- Keep visual styling details in the shared product design specification rather than defining page-specific colors or animation here.

### Done Criteria

The import flow is complete when:

- `Import Excel` opens the dialog.
- An Excel file can be selected and parsed client-side.
- Required columns are validated.
- Parsed students are shown before submission.
- Duplicate handling can be selected.
- JSON is sent to the implemented import endpoint.
- Importing is protected from duplicate submissions.
- Summary counts are displayed from the backend response.
- Created, skipped, and failed outcomes can be distinguished.
- Skipped rows are not counted as successes.
- Row-level result information can be reviewed.
- The whitelist list refreshes after completion.

## 6. Whitelist Details

### Purpose

Allow administrators to review one whitelist entry, understand its current invitation state, send or resend an invitation when appropriate, and remove the entry from the active whitelist.

This page is read-only except for invitation actions and deletion.

### Route

`/admin/whitelist/{whitelistUserId}`

### Page Header

Show:

- `← Back to Whitelist`
- Page title: `Whitelist Details`
- Student name prominently below or beside the title

The back action returns to `/admin/whitelist` and should preserve the previous list query state when practical.

### Student Information

Display as read-only:

| UI Label     | API Field       |
| ------------ | --------------- |
| `Name`       | `name`          |
| `Student ID` | `studentNumber` |
| `Email`      | `email`         |

Do not provide inline editing on this page.

### Invitation Information

Display:

| UI Label            | API Field                     | Presentation                                 |
| ------------------- | ----------------------------- | -------------------------------------------- |
| `Invitation Status` | `invitationStatus`            | Status badge                                 |
| `Invited By`        | `invitedBy.name`              | `—` when `invitedBy` is `null`               |
| `Invited At`        | `invitedAt`                   | `—` when `null`                              |
| `Link Status`       | `latestInvitation.linkStatus` | `Not Sent` when `latestInvitation` is `null` |
| `Expires At`        | `latestInvitation.expiresAt`  | `—` when unavailable                         |
| `Accepted At`       | `acceptedAt`                  | `—` when `null`                              |

Do not display internal identifiers such as:

- `whitelistUserId`
- `invitationId`
- `invitedBy.userId`

They are used only for routing and API requests.

### Record Information

Display:

| UI Label     | API Field   |
| ------------ | ----------- |
| `Added At`   | `createdAt` |
| `Updated At` | `updatedAt` |

Use the shared admin date/time presentation convention.

### Invitation Action Mapping

The primary invitation action must be derived from the current whitelist state.

| Condition                                        | UI Action            |
| ------------------------------------------------ | -------------------- |
| `invitationStatus = pending` and `userId = null` | `Send Invitation`    |
| `invitationStatus = invited` and `userId = null` | `Resend Invitation`  |
| `invitationStatus = expired` and `userId = null` | `Resend Invitation`  |
| `invitationStatus = failed` and `userId = null`  | `Resend Invitation`  |
| `invitationStatus = accepted`                    | No invitation action |
| `userId != null`                                 | No invitation action |

Do not use a generic `Send` button for all states.

Do not expose an invitation-expiry input in the frontend.

The frontend omits `expiresInHours` and uses the backend default invitation lifetime of 72 hours.

### Send Invitation

Visible only when the entry is eligible for first-time sending.

Button:

`Send Invitation`

Clicking the button opens a confirmation modal.

#### Send Confirmation Modal

Title:

`Send Invitation`

Body:

    {name}에게 초대 이메일을 보내시겠습니까?

Display the target email below the message.

Buttons:

- `Cancel`
- `Send Invitation`

While sending:

- Disable both modal actions when practical.
- Prevent duplicate submissions.
- Show an in-progress state.

On success:

1. Close the modal.
2. Refresh the whitelist detail.
3. Display:

   초대 이메일을 보냈습니다.

The refreshed detail should now show the latest invitation information and the primary action should change to `Resend Invitation`.

### Resend Invitation

Visible only for eligible previously-sent invitation states.

Button:

`Resend Invitation`

Clicking the button opens a confirmation modal.

#### Resend Confirmation Modal

Title:

`Resend Invitation`

Body:

    {name}에게 초대 이메일을 다시 보내시겠습니까?

Guidance:

    재발송이 완료되면 이전 초대 링크는 더 이상 사용할 수 없습니다.

Display the target email.

Buttons:

- `Cancel`
- `Resend Invitation`

While resending:

- Disable duplicate submission.
- Show an in-progress state.

On success:

1. Close the modal.
2. Refresh the whitelist detail.
3. Display:

   초대 이메일을 다시 보냈습니다.

The backend creates a new invitation and the refreshed `latestInvitation` becomes the newly issued active invitation.

### Latest Invitation Behavior

When `latestInvitation` is `null`:

- Display `Not Sent` for `Link Status`.
- Display `—` for invitation timestamps that do not exist.

When an invitation exists, use:

- `latestInvitation.linkStatus`
- `latestInvitation.expiresAt`

The top-level `invitedAt` is sufficient for the visible sent timestamp. Do not show `latestInvitation.sentAt` as a second duplicate sent-time field.

### Delete Action

Show a destructive secondary action:

`Delete`

The delete action should be visually separated from the primary invitation action.

Clicking `Delete` opens a confirmation modal.

#### Delete Confirmation Modal

Title:

`Delete Whitelist Entry`

Body:

    이 학생을 화이트리스트에서 삭제하시겠습니까?

Additional guidance:

    활성 초대 링크가 있다면 더 이상 사용할 수 없습니다.

Display the student's name and email so the administrator can verify the target.

Buttons:

- `Cancel`
- `Delete`

Do not require typing the student's name or email for confirmation in the current MVP.

While deleting:

- Disable duplicate submission.
- Show an in-progress state.

On success:

1. Navigate to `/admin/whitelist`.
2. Refresh or invalidate the whitelist list.
3. Display:

   화이트리스트에서 학생이 삭제되었습니다.

The frontend should navigate away after the confirmed delete response instead of attempting to keep rendering the deleted detail page.

### Accepted or Account-Linked Entries

When the invitation is accepted or `userId` is present:

- Do not show `Send Invitation`.
- Do not show `Resend Invitation`.

The detail remains available for reviewing invitation history and whitelist metadata while the entry is active.

### Loading State

While loading:

- Keep the shared admin layout visible.
- Show detail skeletons or equivalent placeholders.
- Do not render fake student or invitation values.

### Error Handling

If the whitelist detail cannot be loaded:

    화이트리스트 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.

If invitation sending fails:

    초대 이메일을 보내지 못했습니다. 잠시 후 다시 시도해주세요.

If invitation resending fails:

    초대 이메일을 다시 보내지 못했습니다. 잠시 후 다시 시도해주세요.

If deletion fails:

    화이트리스트 항목을 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.

Batch invitation APIs may return an overall successful HTTP response while an individual result reports `sendStatus: failed`. The frontend must inspect the requested entry's result, not only the top-level `resultType`.

Authentication and authorization failures follow the shared admin authentication handling.

### API Integration

Load detail:

`GET /api/v1/admin/auth/whitelist-users/{whitelistUserId}`

Send invitation:

`POST /api/v1/admin/auth/invitations/send`

Resend invitation:

`POST /api/v1/admin/auth/invitations/resend`

Delete whitelist entry:

`DELETE /api/v1/admin/auth/whitelist-users/{whitelistUserId}`

All requests require the administrator Bearer token.

The send/resend frontend request should omit `expiresInHours` so the backend default 72-hour lifetime is used.

See `api-contract.md` for confirmed request and response structures.

### Implementation Rules

- Keep the page read-only except for invitation actions and deletion.
- Choose `Send Invitation` or `Resend Invitation` from the confirmed state mapping.
- Never show an invitation action for `accepted` or account-linked entries.
- Do not expose invitation-expiry controls in the MVP.
- Do not expose UUIDs as visible administrative information.
- Use confirmation modals for send, resend, and delete.
- Refresh detail after send/resend success.
- Navigate back to the list after delete success.
- For batch send/resend responses, inspect the row result for the requested whitelist entry.
- Keep visual styling details such as colors, hover effects, and animations in the shared product design specification.

### Done Criteria

The page is complete when:

- The correct whitelist detail loads.
- Student information is displayed read-only.
- Invitation and record metadata are displayed clearly.
- Nullable invitation fields are handled.
- `pending` shows `Send Invitation`.
- `invited`, `expired`, and `failed` show `Resend Invitation`.
- `accepted` and account-linked entries show no invitation action.
- Send and resend use confirmation modals.
- The backend default 72-hour expiry is used without a frontend expiry field.
- Resend refreshes the latest invitation information.
- Delete uses a destructive confirmation modal.
- Successful deletion returns the administrator to the whitelist list.
- Batch item-level invitation failures are handled correctly.
- Loading and error states are handled.

## 7. Posts List

### Purpose

Provide administrators with a searchable and filterable list of KSA content posts.

The page manages all supported post categories, not only events.

### Route

`/admin/posts`

### Page Header

Title:

`Posts`

Primary action:

`New Post`

On click:

`/admin/posts/new`

### Search and Filters

#### Search

Show a search input above the table.

Placeholder:

`Search by title`

Backend query parameter:

`keyword`

Do not use `search`.

Recommended behavior:

- Debounce text input briefly before requesting new results.
- Trim surrounding whitespace.
- Reset pagination to page 1 when the keyword changes.

#### Category Filter

Label:

`Category`

Use a select dropdown.

The options should be derived from the supported post-category contract.

Confirmed examples from current data include:

- `Event`
- `Announcement`
- `Career`

Backend values use lowercase snake_case.

Omit the query parameter for the all-categories state.

#### Status Filter

Label:

`Status`

Options:

- `All Statuses`
- `Draft`
- `Published`
- `Hidden`

Backend values:

- no query value for `All Statuses`
- `draft`
- `published`
- `hidden`

Changing a filter resets pagination to page 1.

### Table Columns

Use the following columns in this order:

| UI Column    | API Field                      | Notes                                               |
| ------------ | ------------------------------ | --------------------------------------------------- |
| `Post`       | `representativeImage`, `title` | Small image preview when available, plus post title |
| `Categories` | `categories`                   | Display as compact category badges                  |
| `Access`     | `membersOnly`                  | Display `Public` or `Members Only`                  |
| `Status`     | `status`                       | Display as a status badge                           |
| `Author`     | `author.name`                  | Administrator who created the post                  |
| `Updated At` | `updatedAt`                    | Most useful date for ongoing content management     |
| `Actions`    | `postId`                       | Contains the row action                             |

Do not add separate `Created At` and `Published At` columns to the main list in the current MVP. They are available in the backend response but would make the table unnecessarily dense.

Detailed timestamps remain available on the post-detail page.

### Post Column

Display:

- Representative image thumbnail when `representativeImage` is present.
- Post title beside the thumbnail.

If `representativeImage` is `null`, the row must still render normally. Use a neutral no-image treatment rather than a broken image.

Do not display the raw `fileId` or `fileUrl` as text.

### Categories

The backend returns an array.

Example:

`["event", "career"]`

Display each category separately using title-cased labels:

- `event` → `Event`
- `career` → `Career`
- `announcement` → `Announcement`

Do not join multiple categories into a long unformatted string when badges/chips are available.

### Access

Map:

- `membersOnly: false` → `Public`
- `membersOnly: true` → `Members Only`

Use `Access` rather than a raw `Members Only` boolean column so administrators do not have to interpret `true` and `false`.

### Status

Map:

- `draft` → `Draft`
- `published` → `Published`
- `hidden` → `Hidden`

Display as a compact status badge.

### Author

Display:

`author.name`

Do not expose `author.userId` as table content.

### Updated At

Use:

`updatedAt`

Format using the shared admin date/time convention.

### Row Action

#### `View`

Display a `View` action in the `Actions` column.

Navigate to:

`/admin/posts/{postId}`

Editing and publication-state changes should occur on the post-detail/edit page rather than through inline list controls.

### Pagination

Use server-side pagination.

Default page size:

`20`

Use:

- `page`
- `limit`
- `total`
- `totalPages`

Recommended controls:

- Previous
- Page numbers when practical
- Next
- Optional total indicator such as `4 posts`

Do not calculate the total from `items.length`.

### URL State

Keep useful list state in the URL query when practical.

Example:

`/admin/posts?page=1&keyword=Orientation&category=event&status=published`

This helps preserve list state after returning from a post-detail page.

### Loading State

While loading:

- Keep the page header, filters, and `New Post` action visible.
- Show table skeleton rows or an equivalent loading state.
- Do not display fake post content.

### Empty States

If there are no posts:

    등록된 게시글이 없습니다.

If filters or search return no matches:

    조건에 맞는 게시글이 없습니다.

### Error Handling

If posts cannot be loaded:

    게시글 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.

Provide a retry action when practical.

Authentication and authorization failures follow the shared admin authentication handling.

### API Integration

Primary endpoint:

`GET /api/v1/admin/posts`

Authentication:

Required administrator Bearer token.

Confirmed query behavior for this page:

- Pagination
- `keyword`
- `category`
- `status`

See `api-contract.md` for the confirmed response contract.

### Implementation Rules

- Use `Posts`, not `Event`, as the page name.
- Use `Title` terminology for the post title rather than `Event Name`.
- Use `keyword`, not `search`.
- Use server-side search, filtering, and pagination.
- Do not implement client-side filtering over only the currently loaded page.
- Combine representative image and title into the `Post` column.
- Use `Access` with `Public` / `Members Only` labels.
- Do not expose post, file, or author UUIDs as visible table data.
- Keep editing and publication-state changes out of inline table controls.
- `New Post` navigates to the dedicated creation route.
- Keep page-specific visual styling details in the shared product design specification.

### Done Criteria

The page is complete when:

- `/admin/posts` loads the admin post list.
- Keyword search works.
- Category filtering works.
- Status filtering works.
- Server-side pagination works.
- Representative images render when available.
- Posts without images render safely.
- Multiple categories are displayed clearly.
- Access and status are human-readable.
- Each row has a `View` action.
- `View` opens the correct post-detail route.
- `New Post` opens `/admin/posts/new`.
- Loading, empty, no-result, and error states are handled.

## 8. Post Details and Edit

### Purpose

Allow administrators to review a post in a clean read-only detail view and switch into edit mode only when changes are needed.

### Route

`/admin/posts/{postId}`

### Page Header

Show:

- `← Back to Posts`
- Post title
- Current status badge
- Selected category badges
- Current access label
- `Edit Post`

The back action returns to `/admin/posts` and should preserve list query state when practical.

### View Mode Layout

Use this order:

#### 1. Images

Show images in ascending `sortOrder`.

The first image is treated as the representative image.

If no images exist, use a clean no-image state or omit the gallery.

Do not show internal IDs or raw file URLs.

#### 2. Content

Show the post body.

If `content` is `null` or empty, display:

    —

#### 3. Event Details

Show this section only when the `Event` category is selected.

Fields:

- `Event Start`
- `Event End`
- `Show on Calendar`

#### 4. Post Information

| UI Label       | API Field     |
| -------------- | ------------- |
| `Author`       | `author.name` |
| `Published At` | `publishedAt` |
| `Created At`   | `createdAt`   |
| `Updated At`   | `updatedAt`   |

Do not repeat title, categories, status, or access here because they are already shown near the header.

### Edit Mode

Clicking `Edit Post` switches the same page into edit mode.

Do not require a separate `/edit` route for the current MVP.

Use this form order:

1. Basic Information
2. Content
3. Event Settings
4. Images
5. Actions

### Basic Information

#### Title

Use a single-line text input.

Label:

`Title`

#### Categories

Use a multi-select dropdown with checkboxes.

Options:

- `Partnership`
- `Event`
- `Co-purchase`
- `Career`
- `Announcement`
- `Alumni`

Backend values:

- `partnership`
- `event`
- `co_purchase`
- `career`
- `announcement`
- `alumni`

Show selected categories as chips/tags.

#### Members Only

Use a switch.

Label:

`Members Only`

Mapping:

- OFF → Public
- ON → Members Only

Changing the switch updates local form state only.

### Content

Use a large multiline text area.

Label:

`Content`

Rich-text editing is outside the current MVP.

### Event Settings

Show this section only while `Event` is selected.

#### Event Start

Use a date-time picker with a calendar UI.

#### Event End

Use the same date-time picker behavior.

#### Show on Calendar

Use a switch.

Label:

`Show on Calendar`

Frontend validation:

Event End without Event Start:

    시작 시간을 먼저 선택해주세요.

Event End earlier than Event Start:

    종료 시간은 시작 시간 이후여야 합니다.

Calendar enabled without Event Start:

    캘린더에 표시하려면 시작 시간을 선택해주세요.

The frontend converts selected date/time values to API-compatible ISO timestamps.

### Event Category Removal

If an existing post has event data and the administrator removes `Event`, show:

    Event 카테고리를 제거하면 이벤트 일정과 캘린더 표시 설정도 초기화됩니다.

When saving, explicitly send:

    eventStartAt: null
    eventEndAt: null
    showOnCalendar: false

Do not leave stale event metadata on a non-event post.

### Images

Support up to four post images.

Display the current final image order as image cards.

Each card may show:

- image preview
- file name
- `Remove`

Provide:

`Add Image`

The final `imageFileIds` array order determines image `sortOrder`.

The first image is the representative image.

Drag-and-drop reordering is optional for the MVP. If it is not implemented, preserve existing order and append new images to the end.

### Image Upload Guidance

Display near `Add Image`:

    더 빠른 업로드를 위해 1MB 이하의 이미지를 권장합니다.

Supported backend formats:

- PNG
- JPEG
- WebP

Backend hard maximum:

5 MB per image.

Frontend behavior:

1. Read the selected image.
2. Compress it before upload when useful.
3. Prefer WebP conversion when it reduces size without unacceptable visible quality loss.
4. Aim for approximately 1 MB or less when practical.
5. Reject a processed image larger than 5 MB before requesting a signed upload URL.
6. Use the processed file's final filename, content type, and size in the presigned-url request.

If converted to WebP, the filename extension must also be `.webp`.

The 1 MB value is a recommendation, not a backend hard limit.

### Image Upload Flow

Each new image follows:

    Select image
          ↓
    Compress / optionally convert to WebP
          ↓
    POST /api/v1/admin/files/presigned-url
          ↓
    Receive fileId + temporary uploadUrl
          ↓
    PUT processed binary directly to Supabase Storage
          ↓
    POST /api/v1/admin/files/complete
          ↓
    Receive completed file
          ↓
    Add completed fileId to imageFileIds

The binary image does not pass through the KSA backend.

Do not attach the KSA backend Bearer token to the signed Storage upload URL.

### Upload UI State

Track each image independently:

- preparing
- uploading
- completing
- completed
- failed

Do not allow the final post save while an image is still uploading or completing.

If one image fails, allow retry or removal without discarding other completed uploads.

### Internal File Data

Do not display or log these in normal frontend UI:

- `storagePath`
- `uploadUrl`
- `uploadToken`
- internal file IDs

`storagePath` may remain in backend audit metadata but does not belong in the administrator UI.

### Removing Images

Removing an image from the form removes its `fileId` from the final `imageFileIds` array.

For an image already attached to the post:

1. Do not delete the file first.
2. PATCH the post with the final image array.
3. After PATCH succeeds, call `DELETE /api/v1/admin/files/{fileId}` as best-effort cleanup for removed images.

The backend rejects deletion while a file is still referenced by a content post.

For a newly uploaded image that is completed but removed before post save, cleanup deletion may occur immediately because it is not yet attached.

If cleanup deletion fails after a successful post update, do not report that the post save failed.

### Save Actions by Status

Do not use a generic publication-status dropdown as the main UX.

#### Draft

Actions:

- `Cancel`
- `Save Draft`
- `Publish`

#### Published

Actions:

- `Cancel`
- `Save Changes`

Show a separate secondary/destructive action:

`Hide Post`

`Hide Post` opens a confirmation modal.

Title:

`Hide Post`

Body:

    이 게시글을 숨기시겠습니까? 숨긴 게시글은 사용자에게 표시되지 않습니다.

Buttons:

- `Cancel`
- `Hide Post`

#### Hidden

Actions:

- `Cancel`
- `Save Changes`
- `Publish`

### Save Behavior

Send only changed fields, except Event removal must also send the explicit event cleanup fields.

When images change, send the complete final ordered `imageFileIds` array.

After successful PATCH:

1. Perform safe post-save file cleanup when applicable.
2. Call `GET /api/v1/admin/posts/{postId}` again.
3. Replace page state with the refreshed full detail.
4. Exit edit mode.
5. Display:

   게시글이 저장되었습니다.

The PATCH response is not a full post detail response.

### Publication Timestamp

When published for the first time, the backend sets `publishedAt`.

If a previously published post is hidden and then published again, the original `publishedAt` is preserved.

The frontend must display the backend timestamp and must not generate its own.

### Cancel Behavior

If there are no newly uploaded files:

- Exit edit mode and discard local form changes.

If completed files were uploaded during this edit session but never attached:

- Attempt cleanup with the file-delete API.
- Do not delete files that belonged to the original post.

### Error Handling

`C404_CONTENT_POST_NOT_FOUND`

    게시글을 찾을 수 없습니다.

`C400_INVALID_EVENT_PERIOD`

    종료 시간은 시작 시간 이후여야 합니다.

`C400_EVENT_START_REQUIRED`

    시작 시간을 먼저 선택해주세요.

`C400_CALENDAR_START_REQUIRED`

    캘린더에 표시하려면 시작 시간을 선택해주세요.

`F409_FILE_NOT_AVAILABLE`

    사용할 수 없는 이미지가 포함되어 있습니다. 이미지를 다시 확인해주세요.

`F409_FILE_PURPOSE_MISMATCH`

    게시글 이미지로 사용할 수 없는 파일입니다.

`C409_CONTENT_POST_CONCURRENT_UPDATE`

    다른 변경사항과 충돌했습니다. 최신 정보를 다시 불러온 후 다시 시도해주세요.

Generic save error:

    게시글을 저장하지 못했습니다. 잠시 후 다시 시도해주세요.

### Implementation Rules

- Use read-only View Mode first.
- Use same-page Edit Mode.
- Use calendar-based date-time pickers.
- Use multi-select categories.
- Use switches for Members Only and Show on Calendar.
- Hide Event Settings when Event is not selected.
- Clear event metadata when Event is removed.
- Use status-specific action buttons instead of a status dropdown.
- Keep destructive actions away from the primary save action.
- Put high-value visual/content information above administrative metadata.
- Compress/optimize images before upload when useful.
- Recommend 1 MB or less while enforcing the actual 5 MB backend maximum.
- Prefer WebP when appropriate.
- Use signed URL → direct Storage PUT → complete verification.
- Never show signed upload URLs, upload tokens, or storagePath.
- Save image order using the full `imageFileIds` array.
- Never delete an attached image before the post successfully detaches it.
- Refetch full detail after PATCH success.

### Done Criteria

The page is complete when:

- Post detail loads in View Mode.
- Edit Mode works on the same route.
- Categories use multi-select.
- Members Only and Show on Calendar use switches.
- Event date/time uses picker controls.
- Event validation matches backend rules.
- Event metadata clears when Event is removed.
- Up to four images can be managed.
- Selected images can be optimized before upload.
- Signed upload flow completes.
- Upload failures can be retried per image.
- Internal file metadata is not shown.
- Draft, Published, and Hidden expose the correct actions.
- PATCH success triggers a full detail refetch.
- Attached images are detached before file deletion.
- Loading, save, upload, error, and cleanup states are handled.

## 9. New Post

### Purpose

Allow administrators to create a new KSA post as either a draft or a published post.

The page reuses the same field structure and image-upload behavior as Post Edit, but its actions are optimized for first-time creation.

### Route

`/admin/posts/new`

### Page Header

Show:

- `← Back to Posts`
- Page title: `New Post`

Do not show a publication-status dropdown.

### Form Layout

Use this order:

1. Basic Information
2. Content
3. Event Settings
4. Images
5. Actions

This order follows the administrator's creation workflow rather than the order of backend fields.

### Basic Information

#### Title

Use a single-line text input.

Label:

`Title`

Required.

#### Categories

Use a multi-select dropdown with checkboxes.

At least one category is required.

Options:

- `Partnership`
- `Event`
- `Co-purchase`
- `Career`
- `Announcement`
- `Alumni`

Show selected categories as compact chips/tags.

#### Members Only

Use a switch.

Label:

`Members Only`

Mapping:

- OFF → public access
- ON → members-only access

Default:

OFF

### Content

Use a large multiline text area.

Label:

`Content`

Rich-text editing is outside the current MVP.

### Event Settings

Show only while the `Event` category is selected.

#### Event Start

Use a date-time picker with calendar and time controls.

#### Event End

Use the same date-time picker.

#### Show on Calendar

Use a switch.

Label:

`Show on Calendar`

Default:

OFF

Frontend validation:

Event End without Event Start:

    시작 시간을 먼저 선택해주세요.

Event End earlier than Event Start:

    종료 시간은 시작 시간 이후여야 합니다.

Show on Calendar without Event Start:

    캘린더에 표시하려면 시작 시간을 선택해주세요.

Administrators must not manually type ISO timestamps.

The UI should treat selected event times as Hong Kong time for KSA administration and convert them into timezone-aware API timestamps.

Example administrator selection:

    Sep 20, 2026 2:00 PM

API representation:

    2026-09-20T14:00:00+08:00

The backend may return the same instant normalized to UTC:

    2026-09-20T06:00:00.000Z

The frontend should convert backend timestamps back into the shared KSA/Hong Kong display timezone.

### Images

Support up to four images.

Use the same image-management behavior defined for Post Edit:

- preview selected images
- compress/optimize when useful
- prefer WebP when appropriate
- recommend approximately 1 MB or less
- enforce the backend 5 MB maximum
- use signed URL → direct Storage PUT → complete
- append only completed `fileId` values to the post request

The first image is the representative image.

Do not allow `Save Draft` or `Publish` while any selected image is still uploading or completing.

### Actions

Place actions at the bottom of the form.

Buttons:

- `Cancel`
- `Save Draft`
- `Publish`

`Publish` is the primary action.

Do not offer `Hidden` during post creation.

A post can be hidden later from the Post Details/Edit page.

### Save Draft

On click:

- Validate required form fields.
- Submit the post with `status: draft`.

Example status behavior:

    status: draft

On success:

1. Read `postId` from the create response.
2. Navigate to `/admin/posts/{postId}`.
3. Display:

   임시 저장되었습니다.

A draft has:

`publishedAt: null`

### Publish

On click:

- Validate required fields and event rules.
- Submit with `status: published`.

On success:

1. Read `postId`.
2. Navigate to `/admin/posts/{postId}`.
3. Display:

   게시글이 게시되었습니다.

The backend creates `publishedAt`.

### Request Construction

Send the current form state using the create-post contract.

For a normal non-event post:

- Omit `eventStartAt` and `eventEndAt` when unused.
- Use `showOnCalendar: false`.

For an event:

- Send timezone-aware `eventStartAt`.
- Send `eventEndAt` when provided.
- Send the current `showOnCalendar` value.

For images:

- Send the complete ordered `imageFileIds` array.
- Omit the field or send the backend-supported empty state when no images are selected.

### Cancel Behavior

If no completed files were created during the current form session:

- Navigate back to `/admin/posts`.

If completed files were uploaded but the post has not been created:

- Attempt best-effort cleanup using `DELETE /api/v1/admin/files/{fileId}` for those unattached files.
- Then navigate back.

Do not delete files that belong to another existing post.

### Loading and Submission State

While creating:

- Disable `Save Draft` and `Publish`.
- Prevent duplicate submissions.
- Keep the selected form values visible.
- Show a clear in-progress state.

### Error Handling

Missing categories:

Use frontend validation before request:

    카테고리를 하나 이상 선택해주세요.

Invalid event period:

    종료 시간은 시작 시간 이후여야 합니다.

Missing event start:

    시작 시간을 먼저 선택해주세요.

Calendar enabled without start:

    캘린더에 표시하려면 시작 시간을 선택해주세요.

Image upload or attachment errors should follow the shared Post image error handling defined in Page 8.

Generic create failure:

    게시글을 생성하지 못했습니다. 잠시 후 다시 시도해주세요.

Do not discard the administrator's form values after a recoverable create failure.

### API Integration

Create post:

`POST /api/v1/admin/posts`

Image flow when images are selected:

- `POST /api/v1/admin/files/presigned-url`
- `PUT <signed uploadUrl>`
- `POST /api/v1/admin/files/complete`

Unattached-file cleanup when needed:

`DELETE /api/v1/admin/files/{fileId}`

All KSA backend requests require the administrator Bearer token.

### Implementation Rules

- Reuse shared Post form components between New Post and Post Edit where practical.
- Do not duplicate independent category, date-picker, image-upload, or validation implementations.
- Use `Save Draft` and `Publish` rather than a status dropdown.
- Do not allow `hidden` at creation.
- Use Hong Kong time as the KSA administrative event-time context.
- Convert event timestamps to timezone-aware API values.
- Treat backend UTC timestamps as instants and format them back into the KSA display timezone.
- Do not submit until all selected images are fully completed.
- Navigate to the newly created Post Details page after success.
- Preserve entered form values after recoverable errors.
- Clean up completed but unattached files when creation is cancelled.

### Done Criteria

The page is complete when:

- `/admin/posts/new` opens the creation form.
- Title and at least one category can be entered.
- Categories use multi-select.
- Members Only uses a switch.
- Event Settings appear only for Event posts.
- Event dates use calendar/time pickers.
- Hong Kong event time is converted correctly for the API.
- Up to four completed images can be attached.
- `Save Draft` creates a draft with `publishedAt: null`.
- `Publish` creates a published post with `publishedAt`.
- Successful creation navigates to the new detail page.
- Cancel cleans up unattached completed uploads when necessary.
- Duplicate submissions and recoverable errors are handled.

## 10. Token Events List

### Purpose

Provide administrators with a searchable list of token-grant events and a clear entry point for creating a new token event or starting the global student-token reset flow.

A Token Event groups token grants under a named administrative event.

### Route

`/admin/token`

### Page Header

Title:

`Token Events`

Header actions should be arranged by risk and frequency.

Recommended order:

- Secondary/destructive area: `Reset Student Tokens`
- Primary action: `New Token Event`

`New Token Event` should be the visually primary action.

`Reset Student Tokens` affects many student balances and must not be styled with the same emphasis as routine event creation.

### Search

Show a search input above the table.

Placeholder:

`Search by event name`

Backend query parameter:

`keyword`

Keyword search has been confirmed to work.

Recommended behavior:

- Debounce briefly before requesting.
- Trim surrounding whitespace.
- Reset pagination to page 1 when the keyword changes.

### Table Columns

Use the following columns in this order:

| UI Column         | API Field            | Notes                                           |
| ----------------- | -------------------- | ----------------------------------------------- |
| `Event Name`      | `eventName`          | Primary identifier                              |
| `Granted Members` | `grantedMemberCount` | Shorter and clearer than `Granted Member Count` |
| `Last Grant At`   | `lastGrantUpdatedAt` | More concise than `Last Grant Updated At`       |
| `Created By`      | `createdBy.name`     | Administrator who created the event             |
| `Created At`      | `createdAt`          | Event creation time                             |
| `Actions`         | `tokenEventId`       | Contains `View`                                 |

Do not expose:

- `tokenEventId`
- `createdBy.userId`

as normal table columns.

### Granted Members

Display the numeric count directly.

Examples:

- `0`
- `1`
- `24`

Zero is a valid value and is not an empty/error state.

### Last Grant At

Display `lastGrantUpdatedAt` using the shared admin date/time format.

If the backend returns `null`, display:

    —

This represents an event with no recorded grant update yet.

### Created By

Display:

`createdBy.name`

Do not display the creator UUID.

### Row Action

#### `View`

Navigate to:

`/admin/token/{tokenEventId}`

Grant management, event rename, and event deletion belong on the detail page rather than inline in the list.

### Pagination

Use server-side pagination.

Recommended frontend page size:

`20`

Use backend pagination metadata:

- `page`
- `limit`
- `total`
- `totalPages`

Do not calculate total events from `items.length`.

### URL State

Keep useful list state in the URL query when practical.

Example:

`/admin/token?page=1&keyword=Orientation`

This helps preserve search state after returning from a detail page.

### Loading State

While loading:

- Keep the page header, search, and actions visible.
- Show table skeleton rows or equivalent loading placeholders.
- Do not render fake token-event data.

### Empty States

If there are no token events:

    등록된 토큰 이벤트가 없습니다.

If keyword search has no matches:

    조건에 맞는 토큰 이벤트가 없습니다.

### Error Handling

If the list cannot be loaded:

    토큰 이벤트 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.

Authentication and authorization failures follow the shared admin authentication handling.

### New Token Event Modal

Clicking `New Token Event` opens a small modal.

A separate page is unnecessary because only one field is required.

#### Modal Title

`New Token Event`

#### Field

Label:

`Event Name`

Input:

Single-line text input.

Required.

Empty-field message:

    이벤트 이름을 입력해주세요.

Trim surrounding whitespace before submission.

#### Actions

Buttons:

- `Cancel`
- `Create Event`

Do not add an extra confirmation step.

### Create Event Submit Behavior

Submit:

`POST /api/v1/admin/token-events`

Body:

    {
      "eventName": "..."
    }

While creating:

- Disable the input when practical.
- Disable `Create Event`.
- Prevent duplicate submissions.

### Create Event Success

The create response returns:

- `tokenEventId`
- `eventName`
- `createdBy`
- `createdAt`

After success:

1. Close the modal.
2. Navigate directly to `/admin/token/{tokenEventId}`.
3. Display:

   토큰 이벤트가 생성되었습니다.

Direct navigation is preferred over simply refreshing the list because the next common action is to add or manage grants for the newly created event.

### Create Event Error

Generic error:

    토큰 이벤트를 생성하지 못했습니다. 잠시 후 다시 시도해주세요.

Preserve the entered event name after a recoverable failure.

### Reset Student Tokens Entry Point

`Reset Student Tokens` begins the separate global reset workflow.

Do not perform the reset directly from the list page.

The reset flow must use:

- reset preview
- explicit target/count review
- strong confirmation
- the backend-required confirmation phrase

The detailed reset interaction is defined in the dedicated Token Reset section.

### API Integration

List:

`GET /api/v1/admin/token-events`

Create:

`POST /api/v1/admin/token-events`

All requests require the administrator Bearer token.

Confirmed list query used by this page:

- `page`
- `limit`
- `keyword`

### Implementation Rules

- Use `keyword`, not `search`.
- Use server-side search and pagination.
- Use `Granted Members`, not `Granted Member Count`.
- Use `Last Grant At`, not `Last Grant Updated At`.
- Use `Actions`, not `Details`.
- Keep `New Token Event` as the primary page action.
- Visually separate `Reset Student Tokens` from routine creation.
- Do not create token grants directly from the list table.
- Navigate to the new event detail after successful creation.
- Keep visual styling details in the shared product specification.

### Done Criteria

The page is complete when:

- `/admin/token` loads token events.
- Keyword search works.
- Pagination uses backend metadata.
- Event name, grant count, latest grant time, creator, and creation time are displayed.
- Null grant timestamps are handled.
- Each row has a `View` action.
- `View` navigates to the correct token-event detail route.
- `New Token Event` opens a modal.
- A new event can be created with an event name.
- Successful creation navigates to the newly created event detail.
- The reset action does not execute directly from this page.
- Loading, empty, no-result, and error states are handled.

## 11. Token Event Details and Grant Management

### Route

`/admin/token/{tokenEventId}`

### Purpose

Manage a token event, review student eligibility and balances, edit individual grants, apply the same grant to multiple students, rename the event, and delete the event.

### Header

Show:

- `← Back to Token Events`
- Event name
- `Granted Members`
- `Created By`
- `Created At`
- `Last Grant At`
- `Rename Event`
- `Delete Event`

`Rename Event` is preferred over `Edit Event` because only the event name is editable.

### Search and Filter

Search placeholder:

`Search by name, Student ID, or email`

Backend query:

`keyword`

Grant Status filter:

- `All` → omit `grantStatus`
- `Granted` → `grantStatus=granted`
- `Not Granted` → `grantStatus=not_granted`

Both filters are confirmed to work.

### Grant Table

Use this order:

| Column            | Behavior                            |
| ----------------- | ----------------------------------- |
| Selection         | checkbox                            |
| `Student`         | name, with email below              |
| `Student ID`      | student number                      |
| `Current Balance` | current total token balance         |
| `Grant Amount`    | final amount assigned by this event |
| `Reason`          | editable combobox                   |
| `Granted By`      | administrator name                  |
| `Granted At`      | original grant time                 |
| `Actions`         | row `Save`                          |

Do not add a separate Email column.

`Current Balance` and `Grant Amount` must be visually distinct.

Helper text for Grant Amount:

    이 이벤트에서 해당 학생이 받아야 하는 최종 토큰 수입니다.

Do not label it `Add Tokens`.

### Reason

Use an editable combobox.

Preset suggestions:

- `출석`
- `수요조사 참여`
- `기타`

Custom text must also be allowed.

For existing grants, prefill the saved reason.

### Grant Eligibility

Known values:

- `eligible`
- `adjustment_only`

For `eligible` rows:

- checkbox enabled
- normal grant create/update allowed

For `adjustment_only` rows:

- show `Adjustment Only` badge
- exclude from header bulk select
- preserve row-level adjustment UI
- let backend validation remain authoritative

### Individual Save

Each row has `Save`.

Send a one-item `grants` array.

Do not require a confirmation modal for a routine single-row save.

After success, refetch the current detail so balances, grant metadata, counts, and timestamps stay synchronized.

Success message:

    토큰 지급 정보가 저장되었습니다.

### Bulk Selection

Put a checkbox at the start of eligible rows and one checkbox in the header.

Header checkbox selects only eligible students on the current page.

It must not silently select students on other pages.

Show exact count:

    3 students selected

### Bulk Action Bar

When at least one student is selected, show:

- `Grant Amount`
- `Reason`
- `Save Grants`

Reason uses the same editable combobox presets:

- `출석`
- `수요조사 참여`
- `기타`

Custom input remains allowed.

### Bulk Confirmation

Bulk save requires confirmation.

Title:

`Confirm Token Grants`

Example body:

    선택한 8명의 Grant Amount를 각각 5 Tokens로 설정하시겠습니까?

    Reason: 출석
    Total Grant Amount: 40 Tokens

    Grant Amount는 이 이벤트에서 각 학생이 받아야 하는 최종 토큰 수입니다.

Buttons:

- `Cancel`
- `Save Grants`

`Total Grant Amount` is a review summary only. It is not necessarily the net balance delta when some students already have existing grants.

### Bulk Request Behavior

Send all selected students in one PATCH request.

Example:

    {
      "grants": [
        {
          "userId": "user-1",
          "grantedAmount": 5,
          "reason": "출석"
        },
        {
          "userId": "user-2",
          "grantedAmount": 5,
          "reason": "출석"
        }
      ]
    }

Do not issue one network request per student.

Confirmed bulk behavior:

- `processedCount` reflects submitted rows
- `savedCount` reflects changed rows
- response includes per-user `previousGrantedAmount`, `grantedAmount`, `deltaAmount`, `balanceBefore`, and `balanceAfter`

### Existing Grant Update

`Grant Amount` is the final event-level amount.

Confirmed example:

- previous grant: 1
- new grant: 2
- `deltaAmount`: 1
- balance: 6 → 7

Therefore changing 1 to 5 means the student's balance changes by +4, not +5.

### Rename Event

`Rename Event` opens a small modal.

Title:

`Rename Token Event`

Field:

`Event Name`

Prefill current value.

Buttons:

- `Cancel`
- `Save`

On success:

    토큰 이벤트 이름이 변경되었습니다.

### Delete Event

Keep `Delete Event` visually separated from normal grant actions.

Confirmation title:

`Delete Token Event`

Body:

    이 토큰 이벤트를 삭제하시겠습니까?

    이벤트를 삭제해도 이미 학생 잔액에 반영된 토큰은 회수되지 않습니다.

Buttons:

- `Cancel`
- `Delete Event`

The current API has confirmed that deleting an event does not reverse previously applied token balances.

Do not require all grants to be set to zero before deletion.

On success:

1. Navigate to `/admin/token`.
2. Refresh the list.
3. Show:

   토큰 이벤트가 삭제되었습니다.

### Pagination

Use backend pagination.

Recommended page size:

`20`

Header bulk-select applies only to the currently loaded page.

### Loading and Error States

Detail load failure:

    토큰 이벤트 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.

Grant save failure:

    토큰 지급 정보를 저장하지 못했습니다. 잠시 후 다시 시도해주세요.

Rename failure:

    토큰 이벤트 이름을 변경하지 못했습니다. 잠시 후 다시 시도해주세요.

Delete failure:

    토큰 이벤트를 삭제하지 못했습니다. 잠시 후 다시 시도해주세요.

No students:

    표시할 학생이 없습니다.

No search/filter results:

    조건에 맞는 학생이 없습니다.

### Implementation Rules

- Keep individual and bulk grant management on this page.
- Use one bulk API request for multiple selected students.
- Use Reason presets `출석`, `수요조사 참여`, `기타`.
- Always allow custom reason input.
- Treat Grant Amount as the final event-level value.
- Header select-all selects eligible rows on the current page only.
- Refetch detail after grant mutations.
- Use `Rename Event`, not `Edit Event`.
- Event deletion does not roll back student balances.
- Keep destructive actions away from primary grant actions.

### Done Criteria

- Event metadata loads.
- Student keyword search works.
- Granted / Not Granted filters work.
- Individual grant save works.
- Multiple eligible students can be selected.
- Bulk grant save uses one request.
- Reason supports three presets plus custom input.
- Current Balance and Grant Amount are clearly distinguished.
- Existing grants can be updated.
- Event rename works.
- Event deletion works.
- Delete warning states that already-applied balances remain.
- Pagination, loading, empty, filtered, and error states are handled.

## 12. Global Student Token Reset

### Purpose

Allow administrators to reset all affected student token balances to zero with a preview-first, strongly confirmed workflow.

This is a high-impact action and must never execute directly from the Token Events list.

### Entry Point

From:

`/admin/token`

Action:

`Reset Student Tokens`

Clicking the action opens the reset dialog and immediately loads the latest reset preview.

### Reset Dialog

Title:

`Reset Student Tokens`

Show a clear destructive-action warning:

    모든 대상 학생의 현재 Token Balance가 0으로 초기화됩니다.
    실행 후 자동으로 되돌릴 수 없습니다.

### Reset Preview

Load:

`GET /api/v1/admin/token-balances/reset-preview`

Display:

| UI Label            | API Field             |
| ------------------- | --------------------- |
| `Affected Students` | `affectedMemberCount` |
| `Tokens to Reset`   | `totalResetAmount`    |
| `Previewed At`      | `previewedAt`         |

Confirmed example:

- Affected Students: 2
- Tokens to Reset: 7

If:

- `affectedMemberCount = 0`
- `totalResetAmount = 0`

disable the destructive reset flow and show:

    초기화할 학생 토큰이 없습니다.

### Reason

Use a required text input or textarea.

Label:

`Reason`

Do not use presets.

This value should explain why the global reset is being performed and is important for audit history.

Example:

    Semester token reset

Validation:

    초기화 사유를 입력해주세요.

### Typed Confirmation

Require the administrator to type exactly:

`RESET_ALL_STUDENT_TOKEN_BALANCES`

Helper text:

    아래 문구를 정확히 입력해주세요.

Do not enable `Reset Tokens` until the typed value matches exactly.

### Buttons

- `Cancel`
- `Reset Tokens`

`Reset Tokens` is destructive and should be visually distinct from normal primary actions.

### Frontend Preview Recheck

When the administrator clicks `Reset Tokens`:

1. Validate Reason.
2. Validate the exact confirmation phrase.
3. Call `GET /api/v1/admin/token-balances/reset-preview` again.
4. Compare the new preview with the preview currently shown in the dialog.

Compare:

- `affectedMemberCount`
- `totalResetAmount`

### If Preview Is Unchanged

If both values match:

1. Keep the dialog open in pending state.
2. Call the Reset POST API.
3. Prevent duplicate submission.

### If Preview Has Changed

Do not call the Reset POST API.

Close the dialog automatically.

Show:

    토큰 잔액이 변경되어 Reset Preview가 만료되었습니다. 최신 내용을 다시 확인해주세요.

The administrator must reopen `Reset Student Tokens` to review the newest values from the beginning.

This extra check is a frontend safety improvement only.

No backend contract change is required.

### Reset Request

Call:

`POST /api/v1/admin/token-balances/reset`

Body:

    {
      "confirmation": "RESET_ALL_STUDENT_TOKEN_BALANCES",
      "reason": "..."
    }

### Confirmed Reset Success

The confirmed backend response includes:

- `affectedMemberCount`
- `totalResetAmount`
- `reason`
- `performedBy`
- `performedAt`

After success:

1. Close the dialog.
2. Refresh any token-related summary/list state shown on the current page.
3. Show:

   학생 토큰 잔액이 초기화되었습니다.

Optionally show a concise result summary:

    2명의 학생, 총 7 Tokens가 초기화되었습니다.

### Confirmed Reset Semantics

The reset sets affected student token balances to zero.

Confirmed test:

Before reset:

- Alynn Kim: 6
- Onboarding Edge Test: 1

Reset Preview:

- `affectedMemberCount: 2`
- `totalResetAmount: 7`

After reset:

- Alynn Kim: 0
- Onboarding Edge Test: 0

Post-reset Preview:

- `affectedMemberCount: 0`
- `totalResetAmount: 0`

### Admin Accounts

The tested administrator account was not included in the student reset operation.

The frontend should display backend preview/reset results rather than attempting to calculate affected users itself.

### Cancel Behavior

Cancel closes the dialog.

Do not call the Reset POST API.

Reason and confirmation input may be discarded.

The next time the dialog opens, fetch a completely new preview.

### Loading States

Initial preview loading:

- open dialog
- show preview skeleton/loading state
- disable reset controls until preview succeeds

Recheck loading:

- disable dialog actions
- prevent duplicate requests

Reset loading:

- disable close/submit actions when practical
- show destructive operation progress

### Error Handling

Preview load failure:

    Reset Preview를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.

Preview changed before reset:

    토큰 잔액이 변경되어 Reset Preview가 만료되었습니다. 최신 내용을 다시 확인해주세요.

Invalid confirmation:

    확인 문구를 정확히 입력해주세요.

Missing reason:

    초기화 사유를 입력해주세요.

Generic reset failure:

    학생 토큰 잔액을 초기화하지 못했습니다. 잠시 후 다시 시도해주세요.

For a recoverable reset failure after the POST request:

- keep the dialog open
- preserve Reason and confirmation input when safe
- allow retry after the administrator reviews the current preview

### Implementation Rules

- Use a dialog/modal, not a separate page.
- Always load Preview before allowing Reset.
- Do not calculate affected counts on the frontend.
- Require Reason.
- Require exact typed confirmation.
- Recheck Preview immediately before POST.
- If the new Preview differs, do not reset.
- On Preview mismatch, close the dialog automatically.
- Require the administrator to reopen the reset flow.
- Do not modify the backend reset contract for the frontend recheck.
- Refresh token-related UI after successful reset.
- Keep this destructive action visually separated from normal token-event creation.

### Done Criteria

The reset flow is complete when:

- `Reset Student Tokens` opens the dialog.
- The latest preview loads from the backend.
- Affected Students and Tokens to Reset are shown.
- Reset is disabled when there is nothing to reset.
- Reason is required.
- Exact typed confirmation is required.
- Preview is fetched again immediately before reset.
- A changed preview closes the dialog and prevents POST.
- An unchanged preview allows the reset POST.
- Reset success shows affected count and reset amount.
- Token-related UI refreshes after success.
- Post-reset preview can return zero affected students and zero tokens.
- Loading and error states are handled.

## 13. Products List

### Purpose

Provide administrators with a compact, operational view of products without overloading the table with fields that are mainly relevant during product creation or editing.

The administrator list should prioritize product identity, price, stock, current availability, publication state, and recent changes.

### Route

`/admin/products`

### Page Header

Show:

- Page title: `Products`
- Search
- Availability filter
- Publication filter
- Primary action: `New Product`

`New Product` navigates to:

`/admin/products/new`

### Product Type Policy

Supported product types are:

- `ticket`
- `merchandise`

Do not show `Product Type` as a normal Products List column.

Do not expose a Product Type filter in the current admin list UI.

Reason:

- Most products are expected to be tickets.
- Product Type is more useful when viewing, creating, or editing a specific product.
- Removing it keeps the admin list less dense.

Product Type must still be visible and editable where applicable in:

- Product Detail
- New Product
- Product Edit

The public/user-facing product category navigation is a separate concern and may use `ticket` / `merchandise` category tabs.

### Search

Placeholder:

`Search by product name`

Backend query parameter:

`keyword`

Keyword filtering has been confirmed.

Recommended behavior:

- trim surrounding whitespace
- debounce briefly
- reset pagination to page 1 when search changes

### Filters

#### Publication

UI options:

- `All`
- `Published`
- `Draft`

Backend query:

`publicationStatus`

Confirmed value:

- `draft`

Published filtering is expected from the same contract and should use the backend enum value.

#### Availability

UI options:

- `All`
- `Available`
- `Unavailable`

Backend query:

`availabilityStatus`

Confirmed value:

- `unavailable`

Use backend `availabilityStatus` as the source of truth for the operational Availability badge.

Do not treat it as a replacement for `publicationStatus`.

### Availability Semantics

In the current admin API, `availabilityStatus` is operational and separate from publication state.

Confirmed behavior:

- positive stock + `isOrderable = true` can return `available` even when the product is `draft` or `hidden`
- `isOrderable = false` returns `unavailable` even when stock remains
- `stockQuantity = 0` returns `unavailable`

Therefore the admin UI must show `Availability` and `Publication` as separate concepts.

Public visibility must also respect `publicationStatus`. Do not infer public visibility from `availabilityStatus` alone.

### Table Columns

Use this order:

| UI Column      | API Field                       | Notes                         |
| -------------- | ------------------------------- | ----------------------------- |
| `Product`      | `image.fileUrl` + `productName` | Thumbnail and name            |
| `Token Price`  | `tokenPrice`                    | Display with Token unit       |
| `Stock`        | `stockQuantity`                 | Numeric quantity              |
| `Availability` | `availabilityStatus`            | Available / Unavailable       |
| `Publication`  | `publicationStatus`             | Published / Draft             |
| `Updated At`   | `updatedAt`                     | Shared admin date/time format |
| `Actions`      | `productId`                     | `View`                        |

Do not add separate list columns for:

- Product Type
- `isOrderable`
- image file ID
- product UUID

### Product Cell

Combine thumbnail and product name.

Example:

    [thumbnail]  Lucky Draw Ticket

If no image exists, use a clean placeholder.

Do not show raw `fileId` or `fileUrl`.

### Token Price

Display:

    10 Tokens

or equivalent compact formatting.

Do not label the column simply `Price`; use `Token Price` because products are purchased with KSA tokens.

### Stock

Show the numeric quantity directly.

Examples:

- `61`
- `30`
- `0`

Do not infer availability from this value alone.

### Availability

Badge values:

- `Available`
- `Unavailable`

The backend value is authoritative.

Example confirmed behavior:

A product with:

- `stockQuantity: 0`
- `isOrderable: true`
- `publicationStatus: published`

returns:

`availabilityStatus: unavailable`

A product with stock may also be unavailable when `isOrderable: false`.

### Publication

Badge values:

- `Published`
- `Draft`

Publication and availability are separate concepts.

### Row Action

Use:

`View`

Navigate to:

`/admin/products/{productId}`

Do not add inline product editing to the list.

Do not add a product-delete action in the current MVP.

### Pagination

Use server-side pagination.

Recommended frontend page size:

`20`

Use backend metadata:

- `page`
- `limit`
- `total`
- `totalPages`

Do not calculate total products from `items.length`.

### URL State

Keep list state in the URL when practical.

Example:

`/admin/products?page=1&keyword=Lucky&publicationStatus=published`

This helps preserve filters when returning from product detail.

### Loading State

While loading:

- keep the page header and controls visible
- show table skeleton rows
- do not render fake product data

### Empty States

No products:

    등록된 상품이 없습니다.

No filter/search results:

    조건에 맞는 상품이 없습니다.

### Error Handling

Generic list error:

    상품 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.

Authentication and authorization failures follow the shared admin authentication handling.

### Confirmed Backend Queries

The following list queries have been tested successfully:

- `keyword`
- `publicationStatus`
- `availabilityStatus`
- `productType`

Although `productType` is supported by the backend, the current admin list intentionally does not expose it as a UI filter.

### Implementation Rules

- Keep the list compact.
- Do not show Product Type in the list table.
- Do not expose Product Type filtering in the current admin list UI.
- Show Product Type on detail/create/edit instead.
- Use backend `availabilityStatus` for the operational Availability badge.
- Treat Publication and Availability as separate admin statuses.
- Do not infer public visibility from Availability alone.
- Keep `New Product` as the primary page action.
- Use `Actions` with `View`.
- Do not add product deletion to the current MVP.
- Preserve useful list query state where practical.

### Done Criteria

- `/admin/products` loads products.
- Product search works.
- Publication filter works.
- Availability filter works.
- Thumbnail and product name share one cell.
- Token price, stock, availability, publication, and updated time are shown.
- Product Type is omitted from the list.
- Each row has `View`.
- `New Product` navigates to the creation page.
- Pagination uses backend metadata.
- Loading, empty, no-result, and error states are handled.

## 14. Product Details and Edit

### Purpose

Allow administrators to review a product in a clean read-only detail view and switch into edit mode only when changes are needed.

The page should clearly separate:

- product identity
- sale controls
- publication state
- effective availability
- immutable/locked fields

### Route

`/admin/products/{productId}`

### Page Header

Show:

- `← Back to Products`
- Product name
- Product Type badge
- Publication badge
- Availability badge
- `Edit Product`

Example:

    Lucky Draw Ticket
    Ticket · Published · Available

Do not display internal product/file UUIDs in the normal UI.

### View Mode Layout

Use this order:

1. Product Overview
2. Description
3. Record Information

#### Product Overview

Recommended layout:

- product image on the left
- key operational information on the right

Show:

| UI Label       | API Field       |
| -------------- | --------------- |
| `Token Price`  | `tokenPrice`    |
| `Stock`        | `stockQuantity` |
| `Ordering`     | `isOrderable`   |
| `Product Type` | `productType`   |

Display:

- `isOrderable = true` → `Enabled`
- `isOrderable = false` → `Disabled`

Availability is already visible in the header and does not need to be repeated.

#### Description

Show `description`.

If `description` is `null` or empty, display:

    —

#### Record Information

Show:

- `Published At`
- `Created At`
- `Updated At`

`publishedAt` represents the first publication timestamp.

It may remain populated even when the current `publicationStatus` later becomes `draft` or `hidden`.

The frontend must display the backend timestamp as-is after formatting and must not infer current publication state from `publishedAt`.

### Product Type

Supported values:

- `ticket`
- `merchandise`

Display mapping:

- `ticket` → `Ticket`
- `merchandise` → `Merchandise`

Product Type is immutable after creation.

In View Mode, show it as normal read-only product information.

In Edit Mode, do not render it as an editable control.

Show:

    Product Type
    Ticket

Helper:

    상품 유형은 생성 후 변경할 수 없습니다.

A backend PATCH containing `productType` is rejected.

### Edit Mode

Clicking `Edit Product` switches the same page into edit mode.

Do not require a separate `/edit` route for the current MVP.

Use this form order:

1. Basic Information
2. Description
3. Sales Settings
4. Product Image
5. Actions

### Basic Information

#### Product Name

Use a text input only when `coreFieldsLocked = false`.

When `coreFieldsLocked = true`, render as read-only.

#### Token Price

Use a non-negative integer input only when `coreFieldsLocked = false`.

Display unit context as Tokens.

When `coreFieldsLocked = true`, render as read-only.

#### Core Field Lock

`coreFieldsLocked` is an internal frontend control signal.

Do not display:

`coreFieldsLocked: true`

Instead, when locked, show:

    주문이 생성된 상품의 이름과 Token Price는 변경할 수 없습니다.

Confirmed backend behavior:

- `coreFieldsLocked = true` blocks Product Name changes
- `coreFieldsLocked = true` blocks Token Price changes
- backend error: `P409_PRODUCT_CORE_FIELDS_LOCKED`

Product Type is always immutable regardless of `coreFieldsLocked`.

### Description

Use a large multiline textarea.

Label:

`Description`

Allow `null`/empty according to the backend contract.

### Sales Settings

#### Stock Quantity

Use a non-negative integer input.

Label:

`Stock Quantity`

#### Ordering Enabled

Use a switch.

Label:

`Ordering Enabled`

Mapping:

- ON → `isOrderable: true`
- OFF → `isOrderable: false`

Helper:

    OFF로 설정하면 재고가 남아 있어도 사용자가 주문할 수 없습니다.

Changing the switch updates local edit state only until Save.

### Availability

Availability is read-only.

Do not provide an `Available / Unavailable` selector.

The current admin API exposes `availabilityStatus` separately from `publicationStatus`.

Confirmed behavior includes:

- positive stock + Ordering Enabled can return `available` for `draft`
- positive stock + Ordering Enabled can return `available` for `hidden`
- Ordering Disabled returns `unavailable`
- zero stock returns `unavailable`

Therefore:

- `Availability` is an operational stock/orderability status
- `Publication` controls publication state
- public visibility must not be inferred from Availability alone

The user-facing product experience should only expose products satisfying the publication requirement.

### Product Image

A product has one image.

Show:

- current image preview
- file name only if available in local/upload state
- `Replace Image`
- optional `Remove Image` if null images are supported by the current form/backend contract

Do not use a multi-image gallery.

#### Replace Image Flow

Reuse the shared file upload flow:

1. Select image.
2. Compress/optimize when useful.
3. Prefer WebP when appropriate.
4. Recommend approximately 1 MB or less.
5. Enforce the backend 5 MB hard maximum.
6. Request a signed URL with `purpose: product_image`.
7. Upload bytes directly to Storage.
8. Complete backend verification.
9. Put the completed `fileId` into `imageFileId`.
10. Save the Product PATCH.

The binary file does not pass through the KSA backend.

Do not expose:

- `storagePath`
- `uploadUrl`
- `uploadToken`
- raw file IDs

#### Confirmed Product Image Replacement

A completed `product_image` file was successfully attached through:

`imageFileId`

The PATCH response returned the new product image object.

This confirms that product image replacement can use the shared file-upload infrastructure plus the Product PATCH.

#### Image Cleanup

For an existing attached image:

1. Save the product with the replacement image first.
2. Only after successful replacement should unused old-file cleanup be attempted.
3. Do not delete a file that is still referenced by another product or entity.

If a newly uploaded image is completed but the edit is cancelled before save, best-effort cleanup may be attempted.

### Publication Actions

Do not use a publication-status dropdown as the primary UX.

Use status-specific actions.

#### Current Status: Draft

Actions:

- `Cancel`
- `Save Draft`
- `Publish`

`Save Draft` keeps `publicationStatus: draft`.

`Publish` sends `publicationStatus: published`.

#### Current Status: Published

Actions:

- `Cancel`
- `Save Changes`

Show a separate secondary/destructive-style action:

`Hide Product`

Confirmation title:

`Hide Product`

Body:

    이 상품을 숨기시겠습니까? 숨긴 상품은 사용자에게 표시되지 않습니다.

Buttons:

- `Cancel`
- `Hide Product`

`Hide Product` sends:

`publicationStatus: hidden`

#### Current Status: Hidden

Actions:

- `Cancel`
- `Save Changes`
- `Publish`

`Publish` sends:

`publicationStatus: published`

### Published At

`publishedAt` is the first publication timestamp.

When a product later becomes `draft` or `hidden`, keep displaying the backend value.

When republished, do not create a frontend timestamp.

### Save Behavior

Send only changed fields.

Editable PATCH fields used by the frontend:

- `productName`
- `tokenPrice`
- `stockQuantity`
- `isOrderable`
- `description`
- `imageFileId`
- `publicationStatus`

Do not send:

- `productType`
- `availabilityStatus`
- `coreFieldsLocked`
- `publishedAt`
- `createdAt`
- `updatedAt`

### PATCH Success

The Product PATCH returns the updated Product detail.

After success:

1. Replace/synchronize current page state using the response.
2. Refetch detail if needed after secondary file cleanup or when a canonical refresh is preferable.
3. Exit edit mode.
4. Show:

   상품이 저장되었습니다.

### Error Handling

Locked Product Name / Token Price:

`P409_PRODUCT_CORE_FIELDS_LOCKED`

Display:

    주문이 생성된 상품의 이름과 Token Price는 변경할 수 없습니다.

Unsupported immutable Product Type PATCH should never be sent by the frontend.

Generic save failure:

    상품을 저장하지 못했습니다. 잠시 후 다시 시도해주세요.

Generic detail failure:

    상품 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.

Image errors should reuse the shared file-upload error handling.

### Cancel Behavior

If no new completed image was created:

- discard local edits
- return to View Mode

If a new completed image was uploaded but never attached:

- attempt best-effort cleanup
- do not delete the original attached image

### Implementation Rules

- Use read-only View Mode first.
- Use same-page Edit Mode.
- Show Product Type on detail, but never allow editing after creation.
- Respect `coreFieldsLocked` for Product Name and Token Price.
- Keep Stock and Ordering Enabled editable.
- Use a switch for Ordering Enabled.
- Treat Availability as read-only operational status.
- Keep Publication and Availability separate.
- Use status-specific publication actions.
- Use one product image.
- Reuse shared signed-upload infrastructure with `product_image`.
- Do not add Product deletion in the current MVP.
- Keep destructive publication action separate from primary Save.

### Done Criteria

- Product detail loads.
- Product Type is visible and immutable.
- Product Name and Token Price respect `coreFieldsLocked`.
- Description can be edited.
- Stock can be edited.
- Ordering Enabled can be changed.
- Availability remains read-only.
- Image can be replaced.
- Draft / Published / Hidden expose the correct actions.
- First `publishedAt` is preserved/displayed.
- PATCH success updates the page.
- Loading, save, image, error, and cancel states are handled.

## 15. New Product

### Purpose

Allow administrators to create a new Product as either a Draft or a Published Product.

The creation form should reuse the same shared Product form structure as Product Edit, while exposing Product Type because Product Type can only be chosen during creation.

### Route

`/admin/products/new`

### Page Header

Show:

- `← Back to Products`
- Page title: `New Product`

Do not show a generic publication-status dropdown.

### Form Order

Use this order:

1. Basic Information
2. Description
3. Sales Settings
4. Product Image
5. Actions

### Basic Information

#### Product Name

Use a single-line text input.

Label:

`Product Name`

Required.

#### Product Type

Use a two-option segmented control.

Options:

- `Ticket`
- `Merchandise`

Backend values:

- `ticket`
- `merchandise`

Do not preselect a Product Type.

Reason:

Product Type is immutable after creation, so the administrator should make an explicit choice before creating the Product.

Validation:

    상품 유형을 선택해주세요.

#### Token Price

Use a non-negative integer input.

Label:

`Token Price`

Show Token unit context.

Example:

    25 Tokens

Required.

### Description

Use a multiline textarea.

Label:

`Description`

Optional according to the current Product contract.

### Sales Settings

#### Stock Quantity

Use a non-negative integer input.

Label:

`Stock Quantity`

Required.

#### Ordering Enabled

Use a switch.

Label:

`Ordering Enabled`

Mapping:

- ON → `isOrderable: true`
- OFF → `isOrderable: false`

Default:

ON

Helper:

    OFF로 설정하면 재고가 남아 있어도 사용자가 주문할 수 없습니다.

### Availability

Do not provide an Availability input.

Availability is backend-derived operational status.

The current admin API may return `availabilityStatus: available` for a Draft Product when:

- stock is positive
- Ordering Enabled is ON

This does not mean the Product is publicly visible.

Publication and Availability must remain separate concepts.

### Product Image

A Product may be created without an image.

Confirmed create behavior:

`image: null`

is valid.

Provide an optional image section with:

- image preview
- `Add Image`
- `Replace Image` after selection
- `Remove` before submission

Use the shared Product image upload flow:

1. select image
2. compress/optimize when useful
3. prefer WebP when appropriate
4. recommend approximately 1 MB or less
5. enforce backend 5 MB maximum
6. request signed URL with `purpose: product_image`
7. upload directly to Storage
8. call file complete
9. use completed `fileId` as `imageFileId`

Do not allow final Product submission while an image is still uploading or completing.

### Create Actions

Use:

- `Cancel`
- `Save Draft`
- `Publish`

`Publish` is the primary action.

Do not expose `Hidden` during creation.

A newly created Product can be hidden later from Product Detail/Edit.

### Save Draft

Submit with:

`publicationStatus: draft`

On success:

1. Read `productId`.
2. Navigate to `/admin/products/{productId}`.
3. Show:

   상품이 임시 저장되었습니다.

Confirmed Draft behavior:

- `publicationStatus: draft`
- `publishedAt: null`
- image may be `null`

### Publish

Submit with:

`publicationStatus: published`

Use the same form fields and validation.

On success:

1. Read `productId`.
2. Navigate to `/admin/products/{productId}`.
3. Show:

   상품이 게시되었습니다.

The backend remains the authority for `publishedAt`.

### Request Construction

Create request fields used by the frontend:

- `productName`
- `productType`
- `tokenPrice`
- `stockQuantity`
- `isOrderable`
- `publicationStatus`
- `description`
- `imageFileId` when an image is attached

Do not send:

- `availabilityStatus`
- `coreFieldsLocked`
- timestamps

### Confirmed Merchandise Draft Creation

A Product created with:

- `productType: merchandise`
- `publicationStatus: draft`
- positive stock
- Ordering Enabled
- no image

was created successfully.

The response returned:

- `productType: merchandise`
- `availabilityStatus: available`
- `publicationStatus: draft`
- `image: null`
- `publishedAt: null`

This confirms that Product Type selection is supported at creation time and that Availability is independent from Publication in the current admin API.

### Cancel Behavior

If no newly completed upload exists:

- navigate back to `/admin/products`

If a Product image was completed but the Product has not been created:

- attempt best-effort cleanup using the file-delete API
- then navigate back

### Loading and Error States

While creating:

- disable `Save Draft` and `Publish`
- prevent duplicate submission
- preserve entered form values

Missing Product Type:

    상품 유형을 선택해주세요.

Generic create failure:

    상품을 생성하지 못했습니다. 잠시 후 다시 시도해주세요.

Image errors reuse the shared admin file-upload handling.

### Implementation Rules

- Reuse shared Product form components between New Product and Product Edit.
- Product Type is editable only during creation.
- Require explicit Product Type selection.
- Do not preselect Ticket even if it is expected to be common.
- Do not expose Availability as an input.
- Keep Publication and Availability separate.
- Use `Save Draft` and `Publish`, not a status dropdown.
- Do not expose Hidden during creation.
- Product image is optional.
- Navigate to the newly created Product Detail page after success.
- Preserve entered values after recoverable errors.

### Done Criteria

- `/admin/products/new` opens the creation form.
- Product Name can be entered.
- Product Type requires Ticket or Merchandise selection.
- Token Price and Stock Quantity can be entered.
- Ordering Enabled uses a switch.
- Description can be entered.
- Product image is optional.
- Shared Product image upload flow can attach an image.
- Save Draft creates a Draft with `publishedAt: null`.
- Publish creates a Published Product.
- Successful creation navigates to Product Detail.
- Duplicate submissions, image state, cancel cleanup, and recoverable errors are handled.

## 16. Orders List and Status Management

### Purpose

Manage all orders from a single administrator page.

There is no separate Order Detail page in the current MVP.

The Orders page must support:

- search
- status filtering
- sorting
- compact order/customer summary
- expandable timeline/details
- inline status actions
- cancellation reason input

### Route

`/admin/orders`

### Page Header

Show:

- Page title: `Orders`
- Search
- Status tabs
- Sort control

No `New Order` action is needed on the admin page.

### Search

Placeholder:

`Search by order ID, product, customer, Student ID, or email`

Backend query:

`keyword`

Keyword search has been confirmed.

When search changes:

- trim whitespace
- debounce briefly
- reset pagination to page 1

### Status Tabs

Use:

- `All`
- `Ordered`
- `Accepted`
- `Delivered`
- `Canceled`

Backend query:

`orderStatus`

Confirmed filtering works.

Recommended mapping:

- All → omit `orderStatus`
- Ordered → `ordered`
- Accepted → `accepted`
- Delivered → `delivered`
- Canceled → `canceled`

### Sort

Use a compact sort control.

Options:

- `Newest`
- `Oldest`

Backend query:

`sort`

Confirmed:

- `sort=oldest`

returns oldest orders first.

Default:

`Newest`

### Table Columns

Use this compact structure:

| Column       | Content                              |
| ------------ | ------------------------------------ |
| Expand       | chevron                              |
| `Order`      | product name + shortened order ID    |
| `Customer`   | customer name + Student ID + email   |
| `Amount`     | total amount + quantity × unit price |
| `Status`     | status badge                         |
| `Ordered At` | order time                           |
| `Actions`    | state-specific actions               |

Do not create separate columns for:

- product ID
- customer user ID
- email
- quantity
- unit price
- total amount
- accepted time
- delivered time
- canceled time
- cancellation reason

Those details belong inside compact cells or the expandable row.

### Order Cell

Display:

    Lucky Draw Ticket
    #0b317578

The visible order ID may be shortened for readability.

Provide a copy affordance that copies the full `orderId`.

### Customer Cell

Display:

    Alynn Kim
    12345678 · test@connect.ust.hk

Do not create separate Email and Student ID columns.

### Amount Cell

Display:

    10 Tokens
    1 × 10

Where:

- first line = `totalAmount`
- second line = `quantity × unitPrice`

### Status

Badge values:

- `Ordered`
- `Accepted`
- `Delivered`
- `Canceled`

### Expandable Row

Each row can expand inline.

Do not navigate to a separate Order Detail page.

Expanded content should show:

#### Order Timeline

- `Ordered At`
- `Accepted At`
- `Delivered At`
- `Canceled At`

For missing timestamps, display:

    —

#### Cancellation

Show:

`Cancellation Reason`

If no cancellation reason exists:

    —

### State-Specific Actions

Do not use a generic status dropdown.

#### Ordered

Actions:

- `Accept`
- `Cancel`

#### Accepted

Actions:

- `Mark Delivered`
- `Cancel`

#### Delivered

No status-change action.

#### Canceled

No status-change action.

### Accept Order

`Accept` performs the status update directly without an extra confirmation modal.

After success:

- show:

  주문이 확인되었습니다.

- refetch the current list using the active search/filter/sort/page state

Refetch is important because an order may no longer belong in the active status tab.

### Mark Delivered

Use a confirmation modal because Delivered is a terminal workflow state.

Title:

`Mark Order as Delivered`

Body:

    상품 지급이 완료되었는지 확인해주세요. 완료 처리 후 상태를 되돌릴 수 없습니다.

Buttons:

- `Cancel`
- `Mark Delivered`

After success:

    주문이 전달 완료 처리되었습니다.

Then refetch the current list.

### Cancel Order

Cancellation requires a modal.

Title:

`Cancel Order`

Show a compact order summary:

- Product
- Customer
- Quantity
- Total Amount

Example:

    Lucky Draw Ticket
    Alynn Kim
    1 × 10 Tokens = 10 Tokens

#### Cancellation Reason

Use a textarea.

Label:

`Cancellation Reason`

Required.

Do not use presets.

Validation:

    주문 취소 사유를 입력해주세요.

Helper/warning:

    주문 취소 시 사용한 Tokens와 상품 재고가 복구됩니다.

This wording intentionally avoids backend implementation terminology while still explaining the user-visible effect.

Buttons:

- `Keep Order`
- `Cancel Order`

After success:

    주문이 취소되었습니다.

Then refetch the current list.

### Confirmed Status Transitions

Confirmed:

- `ordered` → `accepted`
- `accepted` → `delivered`
- `ordered` → `canceled`

The current backend data also includes an order that was accepted and later canceled, so Accepted → Canceled is supported in the current workflow.

### Confirmed Mutation Responses

Status PATCH responses return the updated full Order record, including:

- `orderId`
- `product`
- `customer`
- `quantity`
- `unitPrice`
- `totalAmount`
- `orderStatus`
- `orderedAt`
- `acceptedAt`
- `deliveredAt`
- `canceledAt`
- `cancellationReason`

The frontend may use the mutation response immediately, but should still refetch the current list to respect active filters.

### Per-Row Pending State

Do not disable the entire table for one order mutation.

While changing one order:

- disable only that row's action controls
- prevent duplicate submission
- keep other rows usable when practical

### Pagination

Use server-side pagination.

Recommended page size:

`20`

Use:

- `page`
- `limit`
- `total`
- `totalPages`

Do not derive totals from `items.length`.

### URL State

Preserve useful list state in the URL when practical.

Example:

`/admin/orders?page=1&orderStatus=ordered&sort=oldest&keyword=Lucky`

### Loading and Empty States

Initial loading:

- keep page controls visible
- show table skeleton rows

No orders:

    주문 내역이 없습니다.

No filtered results:

    조건에 맞는 주문이 없습니다.

### Error Handling

List load failure:

    주문 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.

Accept failure:

    주문을 확인 처리하지 못했습니다. 잠시 후 다시 시도해주세요.

Delivered failure:

    주문을 전달 완료 처리하지 못했습니다. 잠시 후 다시 시도해주세요.

Cancel failure:

    주문을 취소하지 못했습니다. 잠시 후 다시 시도해주세요.

Preserve cancellation reason after a recoverable cancellation failure.

### Implementation Rules

- Keep all order management on `/admin/orders`.
- Do not create an Order Detail route.
- Use expandable rows for timeline/details.
- Use compact multi-line cells to avoid an overly wide table.
- Use state-specific buttons instead of a status dropdown.
- Require confirmation for Delivered.
- Require a reason for Cancel.
- Show the cancellation message without backend implementation terminology.
- Refetch after status mutation so active tabs remain correct.
- Use row-level pending state.
- Preserve search/filter/sort state where practical.

### Done Criteria

- Orders load on `/admin/orders`.
- Keyword search works.
- Status tabs work.
- Newest/Oldest sorting works.
- Compact Order, Customer, and Amount cells render.
- Rows expand for timeline and cancellation details.
- Ordered orders can be accepted or canceled.
- Accepted orders can be delivered or canceled.
- Delivered and Canceled orders have no further status actions.
- Cancellation reason is required.
- Mutation success refetches the active list.
- Pagination, loading, empty, filtered, and error states are handled.

## 17. Admin Action Logs

### Purpose

Provide administrators with a read-only audit trail of administrative actions.

The Logs area consists of:

- a paginated Logs List
- a read-only Log Detail page

Logs must never be editable or deletable from the frontend.

---

## 17.1 Logs List

### Route

`/admin/logs`

### Page Header

Show:

- Page title: `Logs`
- `Type` filter

Do not show a keyword search input.

Do not show an Action filter.

The current backend does not support `keyword` or `action` query parameters.

### Type Filter

Use backend query:

`actionType`

`actionType` filtering has been confirmed to work.

UI options should be populated from the action types used by the application contract when practical.

Examples currently observed:

- `Order`
- `Product`

Other action types may appear as the application grows.

Display values in human-readable title case, but send the original backend value.

Example:

- UI: `Order`
- API: `order`

### Table Columns

Use this order:

| Column    | API Field                   | Display                       |
| --------- | --------------------------- | ----------------------------- |
| `Date`    | `createdAt`                 | Shared admin date/time format |
| `Admin`   | `admin.name`, `admin.email` | Name + email                  |
| `Type`    | `actionType`                | Badge                         |
| `Action`  | `action`                    | Human-readable label          |
| `Target`  | `targetId`                  | Shortened ID + copy           |
| `Actions` | `logId`                     | `View`                        |

Do not expose `admin.userId` as a normal column.

Do not add a separate `Log ID` column.

### Admin Cell

Display:

    Sulynn Kim
    user@connect.ust.hk

### Type

Display `actionType` as a badge.

Examples:

- `order` → `Order`
- `product` → `Product`

Do not change the API value.

### Action

Do not display raw snake_case as the primary label.

Humanize for display only.

Examples:

- `update_order_status` → `Update Order Status`
- `create_product` → `Create Product`
- `update_product` → `Update Product`

The raw action value remains unchanged in the API contract and should still be available on the Detail page.

### Target

Long UUID values should not expand the table width.

Display a shortened value, for example:

    19091bd5…

Provide a copy action that copies the complete `targetId`.

If `targetId` is null or unavailable for a log type, display:

    —

### Row Action

Use:

`View`

Navigate to:

`/admin/logs/{logId}`

### Unsupported Filters

Do not send these query parameters:

- `keyword`
- `action`

Confirmed backend responses reject them with HTTP 400 validation errors.

Do not implement client-side "search across current page" as a substitute because it would be misleading on a paginated audit log.

### Pagination

Use server-side pagination.

Recommended frontend page size:

`20`

Use backend pagination:

- `page`
- `limit`
- `total`
- `totalPages`

The confirmed log collection already contains more than 200 entries, so pagination is required.

### Loading and Empty States

Loading:

- keep page title and Type filter visible
- show table skeleton rows

No logs:

    관리자 작업 기록이 없습니다.

No results for selected Type:

    선택한 유형의 작업 기록이 없습니다.

### List Error

Generic error:

    작업 기록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.

---

## 17.2 Log Detail

### Route

`/admin/logs/{logId}`

### Purpose

Show the complete audit information for one administrative action.

The Detail page is read-only.

### Header

Show:

- `← Back to Logs`
- Page title: `Log Details`
- Type badge
- human-readable Action label

No edit or delete actions.

### Action Summary

Show:

| UI Label      | API Field     |
| ------------- | ------------- |
| `Date`        | `createdAt`   |
| `Admin`       | `admin.name`  |
| `Admin Email` | `admin.email` |
| `Type`        | `actionType`  |
| `Action`      | `action`      |
| `Target ID`   | `targetId`    |
| `Log ID`      | `logId`       |

On Detail, showing the full `targetId` and `logId` is appropriate.

Provide copy actions for IDs when useful.

### Raw Action Value

The Action heading may be humanized for readability, but the exact backend value should remain visible in the detail information.

Example:

Human-readable:

`Update Order Status`

Exact value:

`update_order_status`

This preserves audit precision.

### Details Section

`details` is action-specific metadata.

Do not design the frontend around one fixed Details schema.

Render the object generically as structured key/value rows.

For the confirmed Order Status log:

| UI Label              | Value                        |
| --------------------- | ---------------------------- |
| `Before Status`       | `ordered`                    |
| `After Status`        | `canceled`                   |
| `Cancellation Reason` | `Frontend cancellation test` |

Display labels may be humanized, but values must not be rewritten or normalized.

Examples:

- `beforeStatus` → label `Before Status`, value remains `ordered`
- `afterStatus` → label `After Status`, value remains `canceled`

### Nested or Unknown Detail Values

If future `details` contains nested objects or arrays:

- render them using a generic nested key/value or JSON viewer
- preserve the exact stored values
- do not silently transform historical audit metadata into a new schema

A collapsible `Raw Details` JSON view may be provided for audit/debugging clarity.

### Null Details

If `details` is null or empty, display:

    추가 상세 정보가 없습니다.

### Detail Loading and Errors

Loading:

- keep admin shell visible
- show summary/detail skeletons

Not found:

    작업 기록을 찾을 수 없습니다.

Generic error:

    작업 기록 상세 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.

### Back Navigation

Return to:

`/admin/logs`

Preserve the previous list page and Type filter when practical.

### Implementation Rules

- Logs are strictly read-only.
- Do not add edit/delete controls.
- Use only the confirmed `actionType` filter on the list.
- Do not send unsupported `keyword` or `action` query parameters.
- Do not fake client-side global search on one paginated page.
- Humanize action/type labels only for display.
- Preserve exact backend action values and detail values.
- Render `details` generically rather than hardcoding every action type.
- Keep raw audit metadata accessible on the Detail page.
- Preserve list pagination/filter state when returning from Detail.

### Done Criteria

- `/admin/logs` loads paginated audit logs.
- Type filtering works.
- Admin, Type, Action, Target, and Date are readable.
- Long Target IDs do not make the table excessively wide.
- `View` opens `/admin/logs/{logId}`.
- Detail displays complete audit summary.
- Action-specific `details` are rendered generically.
- Exact raw audit values remain accessible.
- Logs cannot be modified or deleted.
- Loading, empty, filtered, not-found, and error states are handled.
