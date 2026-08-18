# KSA Frontend API Contract

## Common Authentication Rules

The KSA backend does not provide an email/password login endpoint.

Frontend authentication is performed directly through Supabase Auth.

For email/password login:

    supabase.auth.signInWithPassword({
      email,
      password,
    })

After successful authentication, retrieve the Supabase access token.

Authenticated KSA backend requests must include:

    Authorization: Bearer <SUPABASE_ACCESS_TOKEN>

Frontend code may use client-safe Supabase configuration.

Backend-only secrets must never be exposed to the frontend, including:

- `SUPABASE_SECRET_KEY`
- `DATABASE_URL`
- `DIRECT_URL`
- `RESEND_API_KEY`

## Admin Authentication

### GET `/api/v1/admin/me`

Returns the currently authenticated administrator and verifies administrator access.

### Authentication

Required.

    Authorization: Bearer <SUPABASE_ACCESS_TOKEN>

### Request Body

None.

### Success Response

    {
      "resultType": "success",
      "error": null,
      "success": {
        "userId": "b5b922c5-9ca5-4c29-81e6-8faec8fbda53",
        "name": "Sulynn Kim",
        "email": "user@connect.ust.hk",
        "role": "admin",
        "status": "active"
      }
    }

### Success Fields

| Field    | Type   | Description                |
| -------- | ------ | -------------------------- |
| `userId` | string | KSA user UUID              |
| `name`   | string | Administrator display name |
| `email`  | string | Administrator email        |
| `role`   | string | `admin`                    |
| `status` | string | Current account status     |

### Frontend Usage

Use this endpoint to:

- Verify administrator access after Supabase login.
- Verify an existing Supabase session before allowing access to admin pages.
- Retrieve the administrator name for the shared admin layout.
- Reject authenticated users who do not have administrator access.

Do not use `GET /api/v1/users/me` as the administrator authorization check.

### Known Authorization Failure

A valid Supabase-authenticated account without administrator access must not be allowed into the admin interface.

The backend identifies this case using:

    A403_ADMIN_ACCESS_REQUIRED

Frontend behavior:

1.  Sign out of Supabase.
2.  Return to or remain on `/admin/login`.
3.  Display:

        관리자 권한이 없는 계정입니다.

The frontend should make behavior decisions based on the stable KSA `errorCode`, not raw provider error messages.

## User Profile Reference

### GET `/api/v1/users/me`

This endpoint returns the profile of an authenticated KSA user regardless of whether the account role is `student` or `admin`.

It is intended for the user-facing application and is not used to verify administrator access.

### Authentication

Required.

    Authorization: Bearer <SUPABASE_ACCESS_TOKEN>

### Request Body

None.

### Example Success Response

    {
      "resultType": "success",
      "error": null,
      "success": {
        "userId": "8761555f-9ced-4781-84b0-a10cdf8cc3f7",
        "name": "Alynn Kim",
        "studentNumber": "12345678",
        "email": "test@connect.ust.hk",
        "role": "student",
        "tokenBalance": 5,
        "status": "active",
        "agreedPrivacy": true,
        "agreedAt": null
      }
    }

### Frontend Usage

Use this endpoint for the authenticated user-facing application when the current user's general profile is required.

Do not call this endpoint as part of the admin login authorization flow.

## Admin Dashboard Data

The current MVP does not use a dedicated dashboard API.

Dashboard summary cards reuse existing admin list endpoints and read `success.pagination.total`.

All endpoints below require:

    Authorization: Bearer <SUPABASE_ACCESS_TOKEN>

### GET `/api/v1/admin/orders?page=1&limit=1&orderStatus=ordered`

Purpose:

Return the count of orders currently waiting in the `ordered` state.

Dashboard usage:

`New Orders = success.pagination.total`

Confirmed success response:

    {
      "resultType": "success",
      "error": null,
      "success": {
        "items": [
          {
            "orderId": "0b317578-ac92-4002-a98f-7270ef676491",
            "product": {
              "productId": "89a9bf59-1ade-471f-90d6-6596f5d80d55",
              "productName": "Lucky Draw Ticket"
            },
            "customer": {
              "userId": "8761555f-9ced-4781-84b0-a10cdf8cc3f7",
              "customerName": "Alynn Kim",
              "studentNumber": "12345678",
              "email": "test@connect.ust.hk"
            },
            "quantity": 1,
            "unitPrice": 10,
            "totalAmount": 10,
            "orderStatus": "ordered",
            "orderedAt": "2026-08-15T17:34:26.475Z",
            "acceptedAt": null,
            "deliveredAt": null,
            "canceledAt": null,
            "cancellationReason": null
          }
        ],
        "pagination": {
          "page": 1,
          "limit": 1,
          "total": 4,
          "totalPages": 4
        }
      }
    }

Frontend notes:

- Use `pagination.total` for the dashboard count.
- Do not use `items.length` as the total.
- `items` are not displayed on the dashboard.
- The `orderStatus=ordered` filter is required for the `New Orders` card.

### GET `/api/v1/admin/posts?page=1&limit=1`

Purpose:

Return the total number of current admin-manageable posts.

Dashboard usage:

`Total Posts = success.pagination.total`

Confirmed success response:

    {
      "resultType": "success",
      "error": null,
      "success": {
        "items": [
          {
            "postId": "0f867aa6-e73c-41e9-b493-83c2f85ac1a8",
            "title": "File Deletion Race Test",
            "categories": [
              "announcement"
            ],
            "membersOnly": false,
            "status": "published",
            "eventStartAt": null,
            "eventEndAt": null,
            "showOnCalendar": false,
            "representativeImage": null,
            "author": {
              "userId": "b5b922c5-9ca5-4c29-81e6-8faec8fbda53",
              "name": "Sulynn Kim"
            },
            "publishedAt": "2026-08-13T21:21:27.517Z",
            "createdAt": "2026-08-13T21:09:18.801Z",
            "updatedAt": "2026-08-13T21:21:27.519Z"
          }
        ],
        "pagination": {
          "page": 1,
          "limit": 1,
          "total": 4,
          "totalPages": 4
        }
      }
    }

Frontend notes:

- Use `pagination.total` for the dashboard count.
- Do not use `items.length` as the total.
- `items` are not displayed on the dashboard.

### GET `/api/v1/admin/users?page=1&limit=1`

Purpose:

Return the total number of current KSA users.

The count includes both `student` and `admin` roles when no role filter is supplied.

Dashboard usage:

`Total Users = success.pagination.total`

Confirmed success response:

    {
      "resultType": "success",
      "error": null,
      "success": {
        "items": [
          {
            "userId": "f540676b-b89e-4991-8f77-60a99181a99d",
            "name": "Onboarding Edge Test",
            "studentNumber": "29990101",
            "email": "onboarding.edge.001@connect.ust.hk",
            "role": "student",
            "tokenBalance": 0,
            "status": "active",
            "createdAt": "2026-07-29T17:08:18.097Z"
          }
        ],
        "pagination": {
          "page": 1,
          "limit": 1,
          "total": 4,
          "totalPages": 4
        }
      }
    }

Frontend notes:

- Use `pagination.total` for the dashboard count.
- Do not use `items.length` as the total.
- `items` are not displayed on the dashboard.

## Admin Users List

### GET `/api/v1/admin/users`

Returns the paginated list of current non-deleted KSA users available to administrators.

The list may include both `student` and `admin` accounts.

### Authentication

Administrator authentication required.

    Authorization: Bearer <SUPABASE_ACCESS_TOKEN>

### Request Body

None.

### Query Parameters

| Parameter | Type    | Required | Default      | Description                               |
| --------- | ------- | -------- | ------------ | ----------------------------------------- |
| `page`    | integer | No       | `1`          | Page number, minimum 1                    |
| `limit`   | integer | No       | `20`         | Items per page, minimum 1 and maximum 100 |
| `keyword` | string  | No       | -            | Search keyword, maximum 255 characters    |
| `role`    | string  | No       | -            | User-role filter                          |
| `status`  | string  | No       | -            | User-status filter                        |
| `sort`    | string  | No       | `created_at` | Sort field                                |
| `order`   | string  | No       | `desc`       | Sort direction                            |

### Keyword Search

Use:

`keyword`

Do not use:

`search`

The backend matches `keyword` against:

- `name`
- `email`
- `studentNumber`

Name and email matching are case-insensitive.

### Role Filter Values

- `student`
- `admin`

Omit `role` to return all roles.

### Status Filter Values

- `active`
- `blocked`

Omit `status` to return all statuses.

### Sort Values

Supported `sort` values:

- `name`
- `student_number`
- `email`
- `role`
- `token_balance`
- `status`
- `created_at`

Supported `order` values:

- `asc`
- `desc`

Default:

- `sort=created_at`
- `order=desc`

### Confirmed Success Response

    {
      "resultType": "success",
      "error": null,
      "success": {
        "items": [
          {
            "userId": "f540676b-b89e-4991-8f77-60a99181a99d",
            "name": "Onboarding Edge Test",
            "studentNumber": "29990101",
            "email": "onboarding.edge.001@connect.ust.hk",
            "role": "student",
            "tokenBalance": 0,
            "status": "active",
            "createdAt": "2026-07-29T17:08:18.097Z"
          },
          {
            "userId": "65d1eb2f-2995-43e8-b41d-ac8cc1b4bdfd",
            "name": "Onboarding Test",
            "studentNumber": "29990001",
            "email": "onboarding.test.001@connect.ust.hk",
            "role": "student",
            "tokenBalance": 0,
            "status": "active",
            "createdAt": "2026-07-29T15:59:11.719Z"
          },
          {
            "userId": "8761555f-9ced-4781-84b0-a10cdf8cc3f7",
            "name": "Alynn Kim",
            "studentNumber": "12345678",
            "email": "test@connect.ust.hk",
            "role": "student",
            "tokenBalance": 5,
            "status": "active",
            "createdAt": "2026-07-26T15:55:30.306Z"
          },
          {
            "userId": "b5b922c5-9ca5-4c29-81e6-8faec8fbda53",
            "name": "Sulynn Kim",
            "studentNumber": "20912345",
            "email": "user@connect.ust.hk",
            "role": "admin",
            "tokenBalance": 0,
            "status": "active",
            "createdAt": "2026-07-06T18:48:59.834Z"
          }
        ],
        "pagination": {
          "page": 1,
          "limit": 10,
          "total": 4,
          "totalPages": 1
        }
      }
    }

### Item Fields

| Field           | Type   | Description                                       |
| --------------- | ------ | ------------------------------------------------- |
| `userId`        | string | User UUID used for navigation and detail requests |
| `name`          | string | User name                                         |
| `studentNumber` | string | HKUST student ID                                  |
| `email`         | string | User email                                        |
| `role`          | string | `student` or `admin`                              |
| `tokenBalance`  | number | Current token balance                             |
| `status`        | string | `active` or `blocked`                             |
| `createdAt`     | string | ISO timestamp for account creation                |

### Pagination Fields

| Field        | Type   | Description                            |
| ------------ | ------ | -------------------------------------- |
| `page`       | number | Current page                           |
| `limit`      | number | Requested page size                    |
| `total`      | number | Total users matching the current query |
| `totalPages` | number | Total number of pages                  |

### Confirmed Filter Behavior

The following query types have been confirmed to return successful results:

- keyword search using `keyword`
- role filtering
- status filtering

Filters may be combined because they are applied together by the backend.

### Frontend Usage

Use this endpoint for the `/admin/users` table.

Recommended mapping:

- `name` → `Name`
- `studentNumber` → `Student ID`
- `email` → `Email`
- `role` → `Role`
- `tokenBalance` → `Token Balance`
- `status` → `Status`
- `createdAt` → `Joined At`
- `userId` → `View` navigation target

Do not display `userId` as a normal table column.

## Admin User Details

### GET `/api/v1/admin/users/{userId}`

Returns an individual current non-deleted KSA user.

### Authentication

Administrator authentication required.

    Authorization: Bearer <SUPABASE_ACCESS_TOKEN>

### Request Body

None.

### Confirmed Success Response

    {
      "resultType": "success",
      "error": null,
      "success": {
        "userId": "8761555f-9ced-4781-84b0-a10cdf8cc3f7",
        "name": "Alynn Kim",
        "studentNumber": "12345678",
        "email": "test@connect.ust.hk",
        "role": "student",
        "tokenBalance": 5,
        "status": "active",
        "agreedPrivacy": true,
        "agreedAt": null,
        "createdAt": "2026-07-26T15:55:30.306Z",
        "updatedAt": "2026-08-15T17:34:26.289Z"
      }
    }

### Response Fields

| Field           | Type    | Nullable | Description                       |
| --------------- | ------- | -------- | --------------------------------- |
| `userId`        | string  | No       | User UUID                         |
| `name`          | string  | No       | User name                         |
| `studentNumber` | string  | No       | HKUST student ID                  |
| `email`         | string  | No       | User email                        |
| `role`          | string  | No       | `student` or `admin`              |
| `tokenBalance`  | number  | No       | Current token balance             |
| `status`        | string  | No       | `active` or `blocked`             |
| `agreedPrivacy` | boolean | No       | Privacy-consent state             |
| `agreedAt`      | string  | Yes      | ISO agreement timestamp or `null` |
| `createdAt`     | string  | No       | ISO account-creation timestamp    |
| `updatedAt`     | string  | No       | ISO last-update timestamp         |

### Known Error

`U404_USER_NOT_FOUND`

Frontend display:

    사용자를 찾을 수 없습니다.

## Admin User Update

### PATCH `/api/v1/admin/users/{userId}`

Updates the administrator-editable properties of an existing KSA user.

### Authentication

Administrator authentication required.

    Authorization: Bearer <SUPABASE_ACCESS_TOKEN>
    Content-Type: application/json

### Editable Fields

- `role`
- `status`

At least one of these fields must be provided.

### Role Values

- `student`
- `admin`

### Status Values

- `active`
- `blocked`

### Request Examples

Status-only:

    {
      "status": "blocked"
    }

Role-only:

    {
      "role": "admin"
    }

Role and status:

    {
      "role": "admin",
      "status": "active"
    }

### Confirmed Status-Update Success Response

Request:

    {
      "status": "blocked"
    }

Confirmed response:

    {
      "resultType": "success",
      "error": null,
      "success": {
        "userId": "65d1eb2f-2995-43e8-b41d-ac8cc1b4bdfd",
        "name": "Onboarding Test",
        "studentNumber": "29990001",
        "email": "onboarding.test.001@connect.ust.hk",
        "role": "student",
        "tokenBalance": 0,
        "status": "blocked",
        "agreedPrivacy": true,
        "agreedAt": "2026-07-29T15:59:11.674Z",
        "createdAt": "2026-07-29T15:59:11.719Z",
        "updatedAt": "2026-08-18T08:15:36.937Z"
      }
    }

### Update Behavior

- The response returns the complete updated user detail object.
- The frontend should replace its local user-detail state with `success`.
- If requested values are identical to the existing values, the backend returns the current user without creating an unnecessary update/audit action.
- The frontend should still avoid sending a request when nothing changed.

### Known Errors

#### `U400_USER_UPDATE_REQUIRED`

Cause:

Neither `role` nor `status` was provided.

Frontend should normally prevent this request.

#### `U404_USER_NOT_FOUND`

Frontend display:

    사용자를 찾을 수 없습니다.

#### `U403_SELF_ROLE_CHANGE_NOT_ALLOWED`

Cause:

An administrator attempted to demote their own account.

Frontend display:

    현재 로그인한 관리자 계정의 권한을 낮출 수 없습니다.

#### `U403_SELF_BLOCK_NOT_ALLOWED`

Cause:

An administrator attempted to block their own account.

Frontend display:

    현재 로그인한 관리자 계정은 차단할 수 없습니다.

### Frontend Usage

Use `GET /api/v1/admin/me` to compare the current administrator `userId` with the detail-page `userId`.

When they match:

- Do not allow the current administrator to select `Student` for their own role.
- Do not allow the current administrator to select `Blocked` for their own status.

The backend remains the final authority even when the frontend disables these controls.

## Admin Whitelist List

### GET `/api/v1/admin/auth/whitelist-users`

Returns the paginated list of current whitelist entries available to administrators.

### Authentication

Administrator authentication required.

    Authorization: Bearer <SUPABASE_ACCESS_TOKEN>

### Request Body

None.

### Confirmed Query Parameters

| Parameter          | Type    | Required | Description              |
| ------------------ | ------- | -------- | ------------------------ |
| `page`             | integer | No       | Page number              |
| `limit`            | integer | No       | Items per page           |
| `keyword`          | string  | No       | Search keyword           |
| `invitationStatus` | string  | No       | Invitation-status filter |

### Keyword Search

Use:

`keyword`

Do not use:

`search`

Keyword filtering has been confirmed to work successfully.

### Invitation Status Filter Values

- `pending`
- `invited`
- `accepted`
- `expired`
- `failed`

Omit `invitationStatus` to return all invitation states.

Invitation-status filtering has been confirmed to work successfully.

### Confirmed Success Response

    {
      "resultType": "success",
      "error": null,
      "success": {
        "items": [
          {
            "whitelistUserId": "2f7b97d2-9409-4c2c-8a17-6357ee7a7e21",
            "name": "Amily Kim",
            "studentNumber": "22334455",
            "email": "amily@connect.ust.hk",
            "invitationStatus": "invited",
            "invitedAt": "2026-07-28T19:01:34.291Z",
            "createdAt": "2026-07-26T20:23:56.066Z"
          },
          {
            "whitelistUserId": "c262cefd-8e49-4360-9faa-888b0c083e94",
            "name": "Bella Chan",
            "studentNumber": "22334458",
            "email": "bella.chan@connect.ust.hk",
            "invitationStatus": "invited",
            "invitedAt": "2026-07-29T16:34:12.474Z",
            "createdAt": "2026-07-27T14:18:49.929Z"
          },
          {
            "whitelistUserId": "6de874ed-620b-41dc-8d9e-5f09119c9df0",
            "name": "Bulk Test One Updated",
            "studentNumber": "BULK-101-UPDATED",
            "email": "bulk.test.101@connect.ust.hk",
            "invitationStatus": "pending",
            "invitedAt": null,
            "createdAt": "2026-07-27T20:21:42.001Z"
          },
          {
            "whitelistUserId": "4d820463-639f-4095-b46b-4e495501a5f1",
            "name": "Bulk Test Two",
            "studentNumber": "BULK-102",
            "email": "bulk.test.102@connect.ust.hk",
            "invitationStatus": "failed",
            "invitedAt": null,
            "createdAt": "2026-07-27T20:21:42.090Z"
          },
          {
            "whitelistUserId": "48fe9062-84e2-4015-9d1e-65336d57ceef",
            "name": "Chris Lee",
            "studentNumber": "22334456",
            "email": "chris.lee@connect.ust.hk",
            "invitationStatus": "invited",
            "invitedAt": "2026-07-28T18:41:36.650Z",
            "createdAt": "2026-07-27T14:17:06.911Z"
          },
          {
            "whitelistUserId": "266e3f48-d91d-4026-ab4b-fcf8f7b04af5",
            "name": "Daniel Wong",
            "studentNumber": "22334457",
            "email": "daniel.wong@connect.ust.hk",
            "invitationStatus": "pending",
            "invitedAt": null,
            "createdAt": "2026-07-27T14:18:24.237Z"
          },
          {
            "whitelistUserId": "90d6ea61-cdbc-46ae-b693-cc050c96d9bd",
            "name": "Emily Lau",
            "studentNumber": "22334459",
            "email": "emily.lau@connect.ust.hk",
            "invitationStatus": "pending",
            "invitedAt": null,
            "createdAt": "2026-07-27T14:18:54.900Z"
          },
          {
            "whitelistUserId": "e82ced5d-26bd-4c01-ab7b-8b0d07911035",
            "name": "Han Kim",
            "studentNumber": "98765432",
            "email": "skimbz@connect.ust.hk",
            "invitationStatus": "invited",
            "invitedAt": "2026-08-11T20:58:59.824Z",
            "createdAt": "2026-08-11T20:52:46.424Z"
          },
          {
            "whitelistUserId": "e3f56581-9f6a-46d2-b7f6-eb584a4eb3ea",
            "name": "Internal Duplicate One",
            "studentNumber": "BULK-108",
            "email": "bulk.test.108@connect.ust.hk",
            "invitationStatus": "pending",
            "invitedAt": null,
            "createdAt": "2026-07-27T20:34:52.792Z"
          },
          {
            "whitelistUserId": "6d056a5a-42e5-4ae3-91ac-3f90e751b927",
            "name": "New Bulk User",
            "studentNumber": "BULK-104",
            "email": "bulk.test.104@connect.ust.hk",
            "invitationStatus": "invited",
            "invitedAt": "2026-07-29T11:36:18.246Z",
            "createdAt": "2026-07-27T20:27:11.217Z"
          }
        ],
        "pagination": {
          "page": 1,
          "limit": 10,
          "total": 17,
          "totalPages": 2
        }
      }
    }

### Item Fields

| Field              | Type   | Nullable | Description                        |
| ------------------ | ------ | -------- | ---------------------------------- |
| `whitelistUserId`  | string | No       | Whitelist-entry UUID               |
| `name`             | string | No       | Student name                       |
| `studentNumber`    | string | No       | Student ID                         |
| `email`            | string | No       | Student email                      |
| `invitationStatus` | string | No       | Current invitation state           |
| `invitedAt`        | string | Yes      | Invitation timestamp or `null`     |
| `createdAt`        | string | No       | Whitelist-entry creation timestamp |

### Pagination Fields

| Field        | Type   | Description                              |
| ------------ | ------ | ---------------------------------------- |
| `page`       | number | Current page                             |
| `limit`      | number | Requested page size                      |
| `total`      | number | Total entries matching the current query |
| `totalPages` | number | Total number of pages                    |

### Frontend Usage

Use this endpoint for the `/admin/whitelist` table.

Recommended mapping:

- `name` → `Name`
- `studentNumber` → `Student ID`
- `email` → `Email`
- `invitationStatus` → `Invitation Status`
- `invitedAt` → `Invited At`
- `createdAt` → `Added At`
- `whitelistUserId` → `View` navigation target

Do not display `whitelistUserId` as a normal table column.

Do not calculate the total from `items.length`; use `pagination.total`.

## Admin Whitelist Create

### POST `/api/v1/admin/auth/whitelist-users`

Creates one whitelist entry.

Creating a whitelist entry does not send an invitation automatically.

### Authentication

Administrator authentication required.

    Authorization: Bearer <SUPABASE_ACCESS_TOKEN>
    Content-Type: application/json

### Request Body

    {
      "name": "Frontend Test User",
      "studentNumber": "FE-TEST-001",
      "email": "frontend.test.001@connect.ust.hk"
    }

### Request Fields

| Field           | Type   | Required | Description               |
| --------------- | ------ | -------- | ------------------------- |
| `name`          | string | Yes      | Student name              |
| `studentNumber` | string | Yes      | Student ID; treat as text |
| `email`         | string | Yes      | Student email             |

### Confirmed Success Response

    {
      "resultType": "success",
      "error": null,
      "success": {
        "whitelistUserId": "867e8c7e-a994-42ea-93d0-8a7894c08be6",
        "name": "Frontend Test User",
        "studentNumber": "FE-TEST-001",
        "email": "frontend.test.001@connect.ust.hk",
        "invitationStatus": "pending",
        "invitedAt": null,
        "acceptedAt": null,
        "createdAt": "2026-08-18T08:40:33.803Z",
        "updatedAt": "2026-08-18T08:40:33.803Z"
      }
    }

### Creation Behavior

A newly created whitelist entry begins with:

- `invitationStatus: pending`
- `invitedAt: null`
- `acceptedAt: null`

Invitation sending is a separate backend operation.

### Confirmed Duplicate Email Error

    {
      "resultType": "fail",
      "error": {
        "errorCode": "W409_EMAIL",
        "reason": "The email is already registered in the whitelist",
        "data": {
          "email": "frontend.test.001@connect.ust.hk"
        }
      },
      "success": null
    }

Frontend mapping:

`W409_EMAIL`

→

    이미 화이트리스트에 등록된 이메일입니다.

### Confirmed Duplicate Student Number Error

    {
      "resultType": "fail",
      "error": {
        "errorCode": "W409_STUDENT_NUMBER",
        "reason": "The student number is already registered in the whitelist",
        "data": {
          "studentNumber": "FE-TEST-001"
        }
      },
      "success": null
    }

Frontend mapping:

`W409_STUDENT_NUMBER`

→

    이미 화이트리스트에 등록된 학번입니다.

## Admin Whitelist Bulk Import

### POST `/api/v1/admin/auth/whitelist-users/import`

Creates or processes multiple whitelist entries from JSON rows.

The endpoint does not accept an Excel binary file.

The frontend is responsible for parsing the administrator-selected Excel file and converting it to the required JSON request body.

### Authentication

Administrator authentication required.

    Authorization: Bearer <SUPABASE_ACCESS_TOKEN>
    Content-Type: application/json

### Request Body

    {
      "onDuplicate": "skip",
      "users": [
        {
          "name": "Frontend Import One",
          "studentNumber": "FE-IMPORT-001",
          "email": "frontend.import.001@connect.ust.hk"
        },
        {
          "name": "Frontend Import Two",
          "studentNumber": "FE-IMPORT-002",
          "email": "frontend.import.002@connect.ust.hk"
        }
      ]
    }

### Request Fields

| Field                   | Type   | Required | Description               |
| ----------------------- | ------ | -------- | ------------------------- |
| `onDuplicate`           | string | Yes      | Duplicate-handling policy |
| `users`                 | array  | Yes      | Parsed whitelist rows     |
| `users[].name`          | string | Yes      | Student name              |
| `users[].studentNumber` | string | Yes      | Student ID                |
| `users[].email`         | string | Yes      | Student email             |

### Duplicate Policy Values

- `skip`
- `fail`
- `update`

### Confirmed All-Created Response

    {
      "resultType": "success",
      "error": null,
      "success": {
        "totalCount": 2,
        "successCount": 2,
        "skippedCount": 0,
        "failedCount": 0,
        "results": [
          {
            "rowIndex": 1,
            "email": "frontend.import.001@connect.ust.hk",
            "studentNumber": "FE-IMPORT-001",
            "status": "created",
            "whitelistUserId": "623491e9-7458-4b1b-b5a6-361ce1b6f714",
            "errorMessage": null
          },
          {
            "rowIndex": 2,
            "email": "frontend.import.002@connect.ust.hk",
            "studentNumber": "FE-IMPORT-002",
            "status": "created",
            "whitelistUserId": "5e3d1a33-82b5-48cb-bfc0-3576f40fd337",
            "errorMessage": null
          }
        ]
      }
    }

### Confirmed Skip-Duplicate Response

Request included one existing entry and one new entry using:

`onDuplicate: skip`

Confirmed response:

    {
      "resultType": "success",
      "error": null,
      "success": {
        "totalCount": 2,
        "successCount": 1,
        "skippedCount": 1,
        "failedCount": 0,
        "results": [
          {
            "rowIndex": 1,
            "email": "frontend.import.001@connect.ust.hk",
            "studentNumber": "FE-IMPORT-001",
            "status": "skipped",
            "whitelistUserId": "623491e9-7458-4b1b-b5a6-361ce1b6f714",
            "errorMessage": "Email or student number already exists in the whitelist"
          },
          {
            "rowIndex": 2,
            "email": "frontend.import.003@connect.ust.hk",
            "studentNumber": "FE-IMPORT-003",
            "status": "created",
            "whitelistUserId": "46b624ca-db35-4d23-a644-23427caabb0f",
            "errorMessage": null
          }
        ]
      }
    }

### Response Summary Fields

| Field          | Type   | Description                                                               |
| -------------- | ------ | ------------------------------------------------------------------------- |
| `totalCount`   | number | Total submitted rows represented in the result                            |
| `successCount` | number | Successfully created or otherwise successfully processed non-skipped rows |
| `skippedCount` | number | Rows skipped by duplicate policy                                          |
| `failedCount`  | number | Rows that failed                                                          |

Confirmed behavior:

`successCount` does not include skipped rows.

### Row Result Fields

| Field             | Type   | Nullable | Description                               |
| ----------------- | ------ | -------- | ----------------------------------------- |
| `rowIndex`        | number | No       | Row position in the submitted import data |
| `email`           | string | No       | Submitted email                           |
| `studentNumber`   | string | No       | Submitted Student ID                      |
| `status`          | string | No       | Row outcome                               |
| `whitelistUserId` | string | Yes      | Related whitelist UUID when returned      |
| `errorMessage`    | string | Yes      | Row-level explanation or `null`           |

Confirmed row statuses:

- `created`
- `skipped`

The frontend should safely display other valid row statuses returned by the implemented backend contract instead of assuming that only these two values can ever occur.

### Frontend File Handling

The Excel file is processed only on the frontend for this flow.

Expected transformation:

    Excel row:
    Name | Student ID | Email

    becomes:

    {
      "name": "...",
      "studentNumber": "...",
      "email": "..."
    }

Then the parsed array is sent through the JSON import request.

Do not send the Excel binary to this endpoint.

## Admin Whitelist Detail

### GET `/api/v1/admin/auth/whitelist-users/{whitelistUserId}`

Returns the current whitelist detail including invitation metadata.

### Authentication

Administrator authentication required.

    Authorization: Bearer <SUPABASE_ACCESS_TOKEN>

### Request Body

None.

### Confirmed Pending Response

    {
      "resultType": "success",
      "error": null,
      "success": {
        "whitelistUserId": "867e8c7e-a994-42ea-93d0-8a7894c08be6",
        "name": "Frontend Test User",
        "studentNumber": "FE-TEST-001",
        "email": "frontend.test.001@connect.ust.hk",
        "invitationStatus": "pending",
        "userId": null,
        "invitedBy": null,
        "invitedAt": null,
        "acceptedAt": null,
        "createdAt": "2026-08-18T08:40:33.803Z",
        "updatedAt": "2026-08-18T08:40:33.803Z",
        "latestInvitation": null
      }
    }

### Confirmed Invited Response After Resend

    {
      "resultType": "success",
      "error": null,
      "success": {
        "whitelistUserId": "867e8c7e-a994-42ea-93d0-8a7894c08be6",
        "name": "Frontend Test User",
        "studentNumber": "FE-TEST-001",
        "email": "frontend.test.001@connect.ust.hk",
        "invitationStatus": "invited",
        "userId": null,
        "invitedBy": {
          "userId": "b5b922c5-9ca5-4c29-81e6-8faec8fbda53",
          "name": "Sulynn Kim"
        },
        "invitedAt": "2026-08-18T10:15:23.476Z",
        "acceptedAt": null,
        "createdAt": "2026-08-18T08:40:33.803Z",
        "updatedAt": "2026-08-18T10:15:23.607Z",
        "latestInvitation": {
          "invitationId": "9c16c4e5-e99f-43a1-8273-31a58d0d0adf",
          "linkStatus": "active",
          "sentAt": "2026-08-18T10:15:23.476Z",
          "expiresAt": "2026-08-21T10:15:23.476Z",
          "acceptedAt": null
        }
      }
    }

### Detail Fields

| Field              | Type   | Nullable | Description                                     |
| ------------------ | ------ | -------- | ----------------------------------------------- |
| `whitelistUserId`  | string | No       | Whitelist UUID                                  |
| `name`             | string | No       | Student name                                    |
| `studentNumber`    | string | No       | Student ID                                      |
| `email`            | string | No       | Student email                                   |
| `invitationStatus` | string | No       | Current whitelist invitation state              |
| `userId`           | string | Yes      | Linked KSA user UUID or `null`                  |
| `invitedBy`        | object | Yes      | Latest inviting administrator summary or `null` |
| `invitedAt`        | string | Yes      | Latest invitation timestamp or `null`           |
| `acceptedAt`       | string | Yes      | Accepted timestamp or `null`                    |
| `createdAt`        | string | No       | Whitelist creation timestamp                    |
| `updatedAt`        | string | No       | Whitelist update timestamp                      |
| `latestInvitation` | object | Yes      | Latest invitation link summary or `null`        |

### `invitedBy`

When present:

| Field    | Type   |
| -------- | ------ |
| `userId` | string |
| `name`   | string |

### `latestInvitation`

When present:

| Field          | Type   | Nullable |
| -------------- | ------ | -------- |
| `invitationId` | string | No       |
| `linkStatus`   | string | No       |
| `sentAt`       | string | No       |
| `expiresAt`    | string | No       |
| `acceptedAt`   | string | Yes      |

## Admin Invitation Send

### POST `/api/v1/admin/auth/invitations/send`

Sends a first invitation for eligible pending whitelist entries.

### Authentication

Administrator authentication required.

    Authorization: Bearer <SUPABASE_ACCESS_TOKEN>
    Content-Type: application/json

### Frontend Request

    {
      "whitelistUserIds": [
        "867e8c7e-a994-42ea-93d0-8a7894c08be6"
      ]
    }

The frontend intentionally omits `expiresInHours`.

The backend default invitation lifetime is 72 hours.

### Confirmed Success Response

    {
      "resultType": "success",
      "error": null,
      "success": {
        "requestedCount": 1,
        "sentCount": 1,
        "skippedCount": 0,
        "failedCount": 0,
        "results": [
          {
            "whitelistUserId": "867e8c7e-a994-42ea-93d0-8a7894c08be6",
            "email": "frontend.test.001@connect.ust.hk",
            "invitationId": "112e8864-c9d8-49fa-87c2-752e666e5c8f",
            "sendStatus": "sent",
            "invitationStatus": "invited",
            "linkStatus": "active",
            "sentAt": "2026-08-18T09:23:30.244Z",
            "expiresAt": "2026-08-21T09:23:30.244Z",
            "errorCode": null,
            "errorMessage": null
          }
        ]
      }
    }

### Frontend Success Rule

For a single-entry detail action, do not treat top-level `resultType: success` alone as proof that email sending succeeded.

Inspect the matching item in `success.results`.

Successful first send:

`sendStatus = sent`

If the item reports a failed send state, show the appropriate sending error even when the top-level batch wrapper is successful.

## Admin Invitation Resend

### POST `/api/v1/admin/auth/invitations/resend`

Issues a new invitation for an eligible previously-sent whitelist entry.

### Authentication

Administrator authentication required.

    Authorization: Bearer <SUPABASE_ACCESS_TOKEN>
    Content-Type: application/json

### Frontend Request

    {
      "whitelistUserIds": [
        "867e8c7e-a994-42ea-93d0-8a7894c08be6"
      ]
    }

The frontend omits `expiresInHours` and uses the backend default 72-hour lifetime.

### Confirmed Success Response

    {
      "resultType": "success",
      "error": null,
      "success": {
        "requestedCount": 1,
        "resentCount": 1,
        "skippedCount": 0,
        "failedCount": 0,
        "results": [
          {
            "whitelistUserId": "867e8c7e-a994-42ea-93d0-8a7894c08be6",
            "email": "frontend.test.001@connect.ust.hk",
            "invitationId": "9c16c4e5-e99f-43a1-8273-31a58d0d0adf",
            "sendStatus": "resent",
            "invitationStatus": "invited",
            "linkStatus": "active",
            "sentAt": "2026-08-18T10:15:23.476Z",
            "expiresAt": "2026-08-21T10:15:23.476Z",
            "errorCode": null,
            "errorMessage": null
          }
        ]
      }
    }

### Confirmed Resend Behavior

A successful resend:

- returns a new `invitationId`
- returns a new `sentAt`
- returns a new `expiresAt`
- returns `linkStatus: active`
- returns `sendStatus: resent`
- causes the detail response `latestInvitation` to become the newly issued invitation

The previous active invitation is no longer the current usable invitation after successful resend.

### Frontend Success Rule

Inspect the matching item in `success.results`.

Successful resend:

`sendStatus = resent`

Do not rely only on top-level `resultType`.

## Invitation Action Mapping

Frontend action selection:

| Whitelist State              | Action                     |
| ---------------------------- | -------------------------- |
| `pending` and no linked user | `POST /invitations/send`   |
| `invited` and no linked user | `POST /invitations/resend` |
| `expired` and no linked user | `POST /invitations/resend` |
| `failed` and no linked user  | `POST /invitations/resend` |
| `accepted`                   | No invitation mutation     |
| linked `userId` present      | No invitation mutation     |

## Admin Whitelist Delete

### DELETE `/api/v1/admin/auth/whitelist-users/{whitelistUserId}`

Removes the whitelist entry from the active whitelist.

### Authentication

Administrator authentication required.

    Authorization: Bearer <SUPABASE_ACCESS_TOKEN>

### Request Body

None.

### Confirmed Success Response

    {
      "resultType": "success",
      "error": null,
      "success": {
        "deletedWhitelistUserId": "867e8c7e-a994-42ea-93d0-8a7894c08be6"
      }
    }

### Frontend Success Behavior

After receiving the confirmed delete success response:

1. Navigate to `/admin/whitelist`.
2. Refresh or invalidate the whitelist list.
3. Do not continue rendering the deleted detail view.

The frontend does not need to perform a separate invitation revoke request as part of this delete action.

## Admin Posts List

### GET `/api/v1/admin/posts`

Returns the paginated list of posts available to administrators.

The admin list includes posts across publication states, including drafts.

### Authentication

Administrator authentication required.

    Authorization: Bearer <SUPABASE_ACCESS_TOKEN>

### Request Body

None.

### Confirmed Query Behavior

The following have been confirmed to work successfully:

- Pagination with `page` and `limit`
- Keyword filtering with `keyword`
- Category filtering with `category`
- Status filtering with `status`

Do not use `search` for the frontend search field.

### Confirmed Example Queries

Title keyword:

`GET /api/v1/admin/posts?page=1&limit=10&keyword=File`

Category:

`GET /api/v1/admin/posts?page=1&limit=10&category=announcement`

Status:

`GET /api/v1/admin/posts?page=1&limit=10&status=published`

### Confirmed Success Response

    {
      "resultType": "success",
      "error": null,
      "success": {
        "items": [
          {
            "postId": "0f867aa6-e73c-41e9-b493-83c2f85ac1a8",
            "title": "File Deletion Race Test",
            "categories": [
              "announcement"
            ],
            "membersOnly": false,
            "status": "published",
            "eventStartAt": null,
            "eventEndAt": null,
            "showOnCalendar": false,
            "representativeImage": null,
            "author": {
              "userId": "b5b922c5-9ca5-4c29-81e6-8faec8fbda53",
              "name": "Sulynn Kim"
            },
            "publishedAt": "2026-08-13T21:21:27.517Z",
            "createdAt": "2026-08-13T21:09:18.801Z",
            "updatedAt": "2026-08-13T21:21:27.519Z"
          },
          {
            "postId": "b9da1a8e-2649-4762-989f-8b068711409a",
            "title": "Updated Orientation Day",
            "categories": [
              "event",
              "career"
            ],
            "membersOnly": true,
            "status": "published",
            "eventStartAt": "2026-09-10T10:30:00.000Z",
            "eventEndAt": "2026-09-10T12:00:00.000Z",
            "showOnCalendar": true,
            "representativeImage": {
              "fileId": "8202b159-a4db-408a-a639-1dd65ddf6f8b",
              "originalName": "배경화면4.jpg",
              "fileUrl": "https://mdgzhwwnxtzlwqqsuapc.supabase.co/storage/v1/object/public/public-images/post-images/2026/08/8202b159-a4db-408a-a639-1dd65ddf6f8b.jpg"
            },
            "author": {
              "userId": "b5b922c5-9ca5-4c29-81e6-8faec8fbda53",
              "name": "Sulynn Kim"
            },
            "publishedAt": "2026-08-06T16:22:37.613Z",
            "createdAt": "2026-08-05T19:10:10.993Z",
            "updatedAt": "2026-08-06T18:46:32.269Z"
          },
          {
            "postId": "cebf1260-b810-4625-890a-f73b3e20f300",
            "title": "Orientation Day",
            "categories": [
              "event",
              "announcement"
            ],
            "membersOnly": false,
            "status": "published",
            "eventStartAt": null,
            "eventEndAt": null,
            "showOnCalendar": false,
            "representativeImage": {
              "fileId": "d9537730-31fd-4907-9d1a-8f68405da984",
              "originalName": "배경화면3.jpg",
              "fileUrl": "https://mdgzhwwnxtzlwqqsuapc.supabase.co/storage/v1/object/public/public-images/post-images/2026/08/d9537730-31fd-4907-9d1a-8f68405da984.jpg"
            },
            "author": {
              "userId": "b5b922c5-9ca5-4c29-81e6-8faec8fbda53",
              "name": "Sulynn Kim"
            },
            "publishedAt": "2026-08-06T18:38:35.007Z",
            "createdAt": "2026-08-05T19:07:49.535Z",
            "updatedAt": "2026-08-06T18:38:35.010Z"
          },
          {
            "postId": "480957b3-3dd1-4b7e-99ed-dc13d42119df",
            "title": "Orientation Day",
            "categories": [
              "event",
              "announcement"
            ],
            "membersOnly": false,
            "status": "draft",
            "eventStartAt": null,
            "eventEndAt": null,
            "showOnCalendar": false,
            "representativeImage": null,
            "author": {
              "userId": "b5b922c5-9ca5-4c29-81e6-8faec8fbda53",
              "name": "Sulynn Kim"
            },
            "publishedAt": null,
            "createdAt": "2026-08-05T17:46:55.871Z",
            "updatedAt": "2026-08-05T17:46:55.871Z"
          }
        ],
        "pagination": {
          "page": 1,
          "limit": 10,
          "total": 4,
          "totalPages": 1
        }
      }
    }

### Post List Item Fields

| Field                 | Type    | Nullable | Description                                         |
| --------------------- | ------- | -------- | --------------------------------------------------- |
| `postId`              | string  | No       | Post UUID                                           |
| `title`               | string  | No       | Post title                                          |
| `categories`          | array   | No       | Post categories                                     |
| `membersOnly`         | boolean | No       | Member-access restriction                           |
| `status`              | string  | No       | Publication state                                   |
| `eventStartAt`        | string  | Yes      | Event start timestamp or `null`                     |
| `eventEndAt`          | string  | Yes      | Event end timestamp or `null`                       |
| `showOnCalendar`      | boolean | No       | Whether the post is configured for calendar display |
| `representativeImage` | object  | Yes      | Representative image metadata or `null`             |
| `author`              | object  | No       | Post author summary                                 |
| `publishedAt`         | string  | Yes      | Publication timestamp or `null`                     |
| `createdAt`           | string  | No       | Creation timestamp                                  |
| `updatedAt`           | string  | No       | Last update timestamp                               |

### `representativeImage`

When present:

| Field          | Type   |
| -------------- | ------ |
| `fileId`       | string |
| `originalName` | string |
| `fileUrl`      | string |

Use `fileUrl` for the thumbnail.

Do not display `fileId` or the raw URL as text.

### `author`

| Field    | Type   |
| -------- | ------ |
| `userId` | string |
| `name`   | string |

Display `author.name`.

Do not expose `author.userId` as normal table content.

### Pagination Fields

| Field        | Type   | Description                            |
| ------------ | ------ | -------------------------------------- |
| `page`       | number | Current page                           |
| `limit`      | number | Requested page size                    |
| `total`      | number | Total posts matching the current query |
| `totalPages` | number | Total number of pages                  |

### Frontend List Mapping

Recommended mapping:

- `representativeImage.fileUrl` + `title` → `Post`
- `categories` → `Categories`
- `membersOnly` → `Access`
- `status` → `Status`
- `author.name` → `Author`
- `updatedAt` → `Updated At`
- `postId` → `View` navigation target

Access labels:

- `membersOnly: false` → `Public`
- `membersOnly: true` → `Members Only`

Do not calculate total posts from `items.length`; use `pagination.total`.

## Admin Post Detail

### GET `/api/v1/admin/posts/{postId}`

Returns the full administrator-facing post detail.

### Authentication

Administrator authentication required.

    Authorization: Bearer <SUPABASE_ACCESS_TOKEN>

### Confirmed Success Response

    {
      "resultType": "success",
      "error": null,
      "success": {
        "postId": "b9da1a8e-2649-4762-989f-8b068711409a",
        "title": "Updated Orientation Day",
        "content": null,
        "categories": [
          "event",
          "career"
        ],
        "membersOnly": true,
        "status": "published",
        "eventStartAt": "2026-09-10T10:30:00.000Z",
        "eventEndAt": "2026-09-10T12:00:00.000Z",
        "showOnCalendar": true,
        "images": [
          {
            "contentImageId": "6668cb75-dc39-41b0-857c-0bc831a44977",
            "fileId": "8202b159-a4db-408a-a639-1dd65ddf6f8b",
            "originalName": "배경화면4.jpg",
            "fileUrl": "<PUBLIC_IMAGE_URL>",
            "contentType": "image/jpeg",
            "fileSize": 1465307,
            "sortOrder": 1
          },
          {
            "contentImageId": "3d8f85ba-ba45-4a8b-90be-9ee3a1927c53",
            "fileId": "d9537730-31fd-4907-9d1a-8f68405da984",
            "originalName": "배경화면3.jpg",
            "fileUrl": "<PUBLIC_IMAGE_URL>",
            "contentType": "image/jpeg",
            "fileSize": 1443648,
            "sortOrder": 2
          }
        ],
        "author": {
          "userId": "b5b922c5-9ca5-4c29-81e6-8faec8fbda53",
          "name": "Sulynn Kim"
        },
        "publishedAt": "2026-08-06T16:22:37.613Z",
        "createdAt": "2026-08-05T19:10:10.993Z",
        "updatedAt": "2026-08-06T18:46:32.269Z"
      }
    }

### Supported Category Values

- `event`
- `career`
- `partnership`
- `co_purchase`
- `announcement`
- `alumni`

### Post Status Values

- `draft`
- `published`
- `hidden`

### Image Ordering

Images are returned in ascending `sortOrder`.

The first image is used as the representative image in the list response.

## Admin Post Update

### PATCH `/api/v1/admin/posts/{postId}`

Updates only provided fields.

### Authentication

Administrator authentication required.

    Authorization: Bearer <SUPABASE_ACCESS_TOKEN>
    Content-Type: application/json

### Editable Fields Used by Frontend

- `title`
- `content`
- `categories`
- `membersOnly`
- `status`
- `eventStartAt`
- `eventEndAt`
- `showOnCalendar`
- `imageFileIds`

Nullable event values may be explicitly set to `null`.

### Image File IDs

When `imageFileIds` is provided, it is the complete final ordered image list.

Example:

    {
      "imageFileIds": [
        "first-file-id",
        "second-file-id"
      ]
    }

The backend replaces current image relations and derives `sortOrder` from array order.

Only completed, non-deleted files with purpose `post_image` may be attached.

### Confirmed Title Update Request

    {
      "title": "Updated Orientation Day - FE Test"
    }

### Confirmed Update Success Response

    {
      "resultType": "success",
      "error": null,
      "success": {
        "postId": "b9da1a8e-2649-4762-989f-8b068711409a",
        "status": "published",
        "publishedAt": "2026-08-06T16:22:37.613Z",
        "updatedAt": "2026-08-18T11:26:22.373Z"
      }
    }

### Important Frontend Rule

PATCH does not return the full updated post.

After PATCH succeeds, call:

`GET /api/v1/admin/posts/{postId}`

and refresh the detail state from that response.

### Publication Timestamp Behavior

If a post is published for the first time, the backend creates `publishedAt`.

If an already-published post is hidden and later published again, the original `publishedAt` is preserved.

### Event Validation Errors

`C400_EVENT_START_REQUIRED`

`eventEndAt` was provided without `eventStartAt`.

`C400_INVALID_EVENT_PERIOD`

`eventEndAt` is earlier than `eventStartAt`.

`C400_CALENDAR_START_REQUIRED`

`showOnCalendar` is true without `eventStartAt`.

### Image Validation Errors

`F404_FILE_NOT_FOUND`

Image file does not exist.

`F409_FILE_NOT_AVAILABLE`

Image is incomplete or deleted.

`F409_FILE_PURPOSE_MISMATCH`

File purpose is not `post_image`.

`C409_CONTENT_POST_CONCURRENT_UPDATE`

A concurrent update conflict occurred.

## Post Image Upload

Post images use three stages.

### Stage 1 — POST `/api/v1/admin/files/presigned-url`

Creates a pending file record and returns a temporary signed Storage upload URL.

### Authentication

Administrator authentication required.

    Authorization: Bearer <SUPABASE_ACCESS_TOKEN>
    Content-Type: application/json

### Request

Use metadata from the final processed image after compression or conversion.

Example:

    {
      "originalName": "orientation.webp",
      "contentType": "image/webp",
      "fileSize": 700301,
      "purpose": "post_image"
    }

### Supported Image Types

- `image/png` with `.png`
- `image/jpeg` with `.jpg` or `.jpeg`
- `image/webp` with `.webp`

Filename extension must match `contentType`.

### File Size

Backend hard maximum:

5 MB per image.

Frontend recommendation:

Aim for approximately 1 MB or less for faster upload when practical.

The 1 MB value is not the backend hard limit.

### Confirmed Presigned Response Shape

    {
      "resultType": "success",
      "error": null,
      "success": {
        "fileId": "e379718a-f212-43e9-a0d2-0dff0c430fe4",
        "originalName": "배경화면9.jpg",
        "storagePath": "post-images/2026/08/e379718a-f212-43e9-a0d2-0dff0c430fe4.jpg",
        "uploadUrl": "<TEMPORARY_SIGNED_UPLOAD_URL>",
        "uploadToken": "<TEMPORARY_UPLOAD_TOKEN>",
        "contentType": "image/jpeg",
        "fileSize": 700301,
        "purpose": "post_image",
        "status": "pending",
        "expiresAt": "2026-08-18T13:44:31.443Z",
        "createdAt": "2026-08-18T11:44:31.443Z"
      }
    }

### Frontend Handling

Use:

- `fileId`
- `uploadUrl`
- `contentType`

Do not display or persist in normal UI:

- `storagePath`
- `uploadToken`
- raw `uploadUrl`

Do not log temporary signed upload credentials.

### Presigned URL Errors

`F400_UNSUPPORTED_IMAGE_TYPE`

`F400_INVALID_FILE_SIZE`

`F400_FILE_TOO_LARGE`

`F400_INVALID_FILE_NAME`

`F500_UPLOAD_URL_CREATION_FAILED`

## Stage 2 — PUT `<uploadUrl>`

Upload the processed image binary directly to the signed Supabase Storage URL.

The KSA backend does not carry the binary image payload.

A Storage response may contain:

    {
      "Key": "public-images/post-images/2026/08/example.jpg"
    }

The signed URL authorizes this operation.

Do not attach the KSA backend Bearer token to the Storage upload request.

The actual uploaded bytes must match the content type and size registered in Stage 1.

## Stage 3 — POST `/api/v1/admin/files/complete`

Verifies the uploaded Storage object and marks the file completed.

### Authentication

Administrator authentication required.

    Authorization: Bearer <SUPABASE_ACCESS_TOKEN>
    Content-Type: application/json

### Request

    {
      "fileId": "e379718a-f212-43e9-a0d2-0dff0c430fe4"
    }

### Confirmed Success Response

    {
      "resultType": "success",
      "error": null,
      "success": {
        "fileId": "e379718a-f212-43e9-a0d2-0dff0c430fe4",
        "originalName": "배경화면9.jpg",
        "storagePath": "post-images/2026/08/e379718a-f212-43e9-a0d2-0dff0c430fe4.jpg",
        "fileUrl": "<PUBLIC_IMAGE_URL>",
        "contentType": "image/jpeg",
        "fileSize": 700301,
        "purpose": "post_image",
        "status": "completed",
        "createdAt": "2026-08-18T11:44:31.443Z",
        "completedAt": "2026-08-18T11:47:44.798Z"
      }
    }

### Completion Verification

The backend verifies that Storage metadata matches the pending file record:

- size
- content type

Relevant errors:

`F404_FILE_NOT_FOUND`

`F409_FILE_NOT_UPLOADED`

`F409_FILE_METADATA_MISMATCH`

`F500_FILE_VERIFICATION_FAILED`

Only successfully completed files may be inserted into `imageFileIds`.

## File Delete for Image Cleanup

### DELETE `/api/v1/admin/files/{fileId}`

Deletes an unused image file.

### Authentication

Administrator authentication required.

    Authorization: Bearer <SUPABASE_ACCESS_TOKEN>

### Reference Rule

The backend rejects deletion while a file is still referenced by a post or another supported entity.

Relevant error:

`F409_FILE_IN_USE`

For an existing post image, frontend order must be:

    PATCH post without removed fileId
          ↓
    PATCH succeeds
          ↓
    DELETE removed file

Do not reverse this order.

A newly uploaded completed file that has not yet been attached to a post may be deleted immediately during form cleanup.

### Cleanup Failure

A cleanup failure after a successful post update must not cause the frontend to report that the post save failed.

Treat cleanup as a secondary operation and allow retry when practical.

## Admin Post Create

### POST `/api/v1/admin/posts`

Creates a new administrator-managed post.

### Authentication

Administrator authentication required.

    Authorization: Bearer <SUPABASE_ACCESS_TOKEN>
    Content-Type: application/json

### Creation Status Values Used by Frontend

Use:

- `draft`
- `published`

Do not create a new post directly as `hidden`.

### Draft Request — Confirmed

    {
      "title": "Frontend New Post Draft Test",
      "content": "Frontend에서 게시글 작성 기능을 확인하기 위한 draft 테스트입니다.",
      "categories": [
        "announcement"
      ],
      "membersOnly": false,
      "status": "draft",
      "showOnCalendar": false,
      "imageFileIds": [
        "e379718a-f212-43e9-a0d2-0dff0c430fe4"
      ]
    }

### Confirmed Draft Success Response

    {
      "resultType": "success",
      "error": null,
      "success": {
        "postId": "55e57deb-564d-4c0f-a3b0-858ca28ee4fd",
        "title": "Frontend New Post Draft Test",
        "categories": [
          "announcement"
        ],
        "membersOnly": false,
        "status": "draft",
        "eventStartAt": null,
        "eventEndAt": null,
        "showOnCalendar": false,
        "images": [
          {
            "fileId": "e379718a-f212-43e9-a0d2-0dff0c430fe4",
            "fileUrl": "<PUBLIC_IMAGE_URL>",
            "sortOrder": 1
          }
        ],
        "publishedAt": null,
        "createdAt": "2026-08-18T12:05:33.125Z"
      }
    }

### Confirmed Draft Behavior

- Draft creation succeeds with `publishedAt: null`.
- A completed `post_image` file can be attached through `imageFileIds`.
- The first attached image is returned with `sortOrder: 1`.

### Published Event Request — Confirmed

    {
      "title": "Frontend Published Event Test",
      "content": "Frontend의 이벤트 게시글 생성과 캘린더 설정을 확인하기 위한 테스트입니다.",
      "categories": [
        "event",
        "career"
      ],
      "membersOnly": true,
      "status": "published",
      "eventStartAt": "2026-09-20T14:00:00+08:00",
      "eventEndAt": "2026-09-20T16:00:00+08:00",
      "showOnCalendar": true
    }

### Confirmed Published Event Success Response

    {
      "resultType": "success",
      "error": null,
      "success": {
        "postId": "7ad155b2-9bd0-47f0-9e6a-757544fc0c96",
        "title": "Frontend Published Event Test",
        "categories": [
          "event",
          "career"
        ],
        "membersOnly": true,
        "status": "published",
        "eventStartAt": "2026-09-20T06:00:00.000Z",
        "eventEndAt": "2026-09-20T08:00:00.000Z",
        "showOnCalendar": true,
        "images": [],
        "publishedAt": "2026-08-18T12:06:28.725Z",
        "createdAt": "2026-08-18T12:06:28.807Z"
      }
    }

### Confirmed Timezone Behavior

A request containing:

    2026-09-20T14:00:00+08:00

was returned as:

    2026-09-20T06:00:00.000Z

These values represent the same instant.

Frontend rules:

- Build timezone-aware event timestamps.
- Treat KSA event entry/display as Hong Kong time.
- Do not assume returned timestamps preserve the original offset.
- Format returned UTC instants back into the KSA display timezone.

### Create Response Fields

The confirmed create response includes:

- `postId`
- `title`
- `categories`
- `membersOnly`
- `status`
- `eventStartAt`
- `eventEndAt`
- `showOnCalendar`
- `images`
- `publishedAt`
- `createdAt`

The create response is sufficient to obtain the new `postId`, but the frontend should navigate to the Post Details page for the canonical full-detail view.

### Image Results

Created post images contain:

| Field       | Type   |
| ----------- | ------ |
| `fileId`    | string |
| `fileUrl`   | string |
| `sortOrder` | number |

Image order follows the submitted `imageFileIds` order.

### Frontend Success Navigation

After draft creation:

`/admin/posts/{postId}`

Success message:

    임시 저장되었습니다.

After published creation:

`/admin/posts/{postId}`

Success message:

    게시글이 게시되었습니다.

### Related File APIs

When creating a post with new images, follow the existing file contract:

1. `POST /api/v1/admin/files/presigned-url`
2. `PUT <uploadUrl>` directly to Storage
3. `POST /api/v1/admin/files/complete`
4. Include completed file IDs in `imageFileIds`
5. `POST /api/v1/admin/posts`

If the form is cancelled after files were completed but before post creation, those unattached files may be cleaned up with:

`DELETE /api/v1/admin/files/{fileId}`

### Frontend Validation Expectations

Require at least one category before submitting.

For event fields, use the same validation rules as Post Edit:

- event end requires event start
- event end cannot be earlier than event start
- calendar display requires event start

The backend remains the final validation authority.

## Admin Token Events List

### GET `/api/v1/admin/token-events`

Returns the paginated administrator-facing token-event list.

### Authentication

Administrator authentication required.

    Authorization: Bearer <SUPABASE_ACCESS_TOKEN>

### Request Body

None.

### Confirmed Query Behavior

The following have been confirmed:

- `page`
- `limit`
- `keyword`

Keyword search filters token events by event name.

### Confirmed Success Response

    {
      "resultType": "success",
      "error": null,
      "success": {
        "items": [
          {
            "tokenEventId": "397ecbbd-ebd9-4eca-82ab-f7771008aa10",
            "eventName": "Unauthorized Student Test",
            "createdBy": {
              "userId": "b5b922c5-9ca5-4c29-81e6-8faec8fbda53",
              "name": "Sulynn Kim"
            },
            "createdAt": "2026-08-01T20:26:35.992Z",
            "lastGrantUpdatedAt": "2026-08-03T08:27:27.695Z",
            "grantedMemberCount": 1
          },
          {
            "tokenEventId": "5ce5e07a-5795-4c4a-9636-956b27c7836a",
            "eventName": "Orientation Attendance",
            "createdBy": {
              "userId": "b5b922c5-9ca5-4c29-81e6-8faec8fbda53",
              "name": "Sulynn Kim"
            },
            "createdAt": "2026-08-01T20:22:01.532Z",
            "lastGrantUpdatedAt": "2026-08-10T19:37:02.965Z",
            "grantedMemberCount": 1
          },
          {
            "tokenEventId": "b0c18f9e-c4b9-4790-b9a3-55840b5279b5",
            "eventName": "ksa and cuhk colab band competition",
            "createdBy": {
              "userId": "b5b922c5-9ca5-4c29-81e6-8faec8fbda53",
              "name": "Sulynn Kim"
            },
            "createdAt": "2026-08-01T20:18:13.985Z",
            "lastGrantUpdatedAt": "2026-08-10T18:15:31.866Z",
            "grantedMemberCount": 1
          }
        ],
        "pagination": {
          "page": 1,
          "limit": 10,
          "total": 3,
          "totalPages": 1
        }
      }
    }

### List Item Fields

| Field                | Type   | Nullable    | Description                                |
| -------------------- | ------ | ----------- | ------------------------------------------ |
| `tokenEventId`       | string | No          | Token-event UUID                           |
| `eventName`          | string | No          | Event name                                 |
| `createdBy`          | object | No          | Creator summary                            |
| `createdAt`          | string | No          | Creation timestamp                         |
| `lastGrantUpdatedAt` | string | Potentially | Most recent grant update timestamp         |
| `grantedMemberCount` | number | No          | Number of members with grants in the event |

### `createdBy`

| Field    | Type   |
| -------- | ------ |
| `userId` | string |
| `name`   | string |

Frontend displays `createdBy.name`.

### Frontend List Mapping

- `eventName` → `Event Name`
- `grantedMemberCount` → `Granted Members`
- `lastGrantUpdatedAt` → `Last Grant At`
- `createdBy.name` → `Created By`
- `createdAt` → `Created At`
- `tokenEventId` → `View` navigation target

Do not display UUIDs as normal table content.

## Admin Token Event Create

### POST `/api/v1/admin/token-events`

Creates a new token event.

### Authentication

Administrator authentication required.

    Authorization: Bearer <SUPABASE_ACCESS_TOKEN>
    Content-Type: application/json

### Request

    {
      "eventName": "Frontend Token Event Test"
    }

### Request Fields

| Field       | Type   | Required |
| ----------- | ------ | -------- |
| `eventName` | string | Yes      |

### Confirmed Success Response

    {
      "resultType": "success",
      "error": null,
      "success": {
        "tokenEventId": "f0c67cf8-ff8b-4e3c-ac21-86c321e6469d",
        "eventName": "Frontend Token Event Test",
        "createdBy": {
          "userId": "b5b922c5-9ca5-4c29-81e6-8faec8fbda53",
          "name": "Sulynn Kim"
        },
        "createdAt": "2026-08-18T12:30:03.223Z"
      }
    }

### Frontend Success Behavior

After creation:

1. Read `tokenEventId`.
2. Navigate to `/admin/token/{tokenEventId}`.
3. Load the canonical token-event detail.
4. Show:

   토큰 이벤트가 생성되었습니다.

## Admin Token Event Detail

### GET `/api/v1/admin/token-events/{tokenEventId}`

Returns token-event metadata and a paginated student grant-management list.

### Authentication

Administrator authentication required.

    Authorization: Bearer <SUPABASE_ACCESS_TOKEN>

### Confirmed Query Parameters

- `page`
- `limit`
- `keyword`
- `grantStatus`

Confirmed `grantStatus` values:

- `granted`
- `not_granted`

Omit `grantStatus` for All.

### Confirmed Detail Behavior

The detail response contains:

- event metadata
- `grantedMemberCount`
- student rows
- pagination

Each student row may contain:

- `userId`
- `name`
- `studentNumber`
- `email`
- `grantEligibility`
- `currentTokenBalance`
- `tokenGrantId`
- `grantedAmount`
- `reason`
- `grantedBy`
- `grantedAt`
- `grantUpdatedAt`

`tokenGrantId: null` means no grant exists for that user in this event.

`currentTokenBalance` is the user's current total balance.

`grantedAmount` is the final amount assigned by this event.

Known grant eligibility values include:

- `eligible`
- `adjustment_only`

## Token Event Grant Save

### PATCH `/api/v1/admin/token-events/{tokenEventId}/grants`

Creates or updates one or more grants in one request.

### Authentication

Administrator authentication required.

    Authorization: Bearer <SUPABASE_ACCESS_TOKEN>
    Content-Type: application/json

### Confirmed Bulk Request

    {
      "grants": [
        {
          "userId": "8761555f-9ced-4781-84b0-a10cdf8cc3f7",
          "grantedAmount": 1,
          "reason": "출석"
        },
        {
          "userId": "f540676b-b89e-4991-8f77-60a99181a99d",
          "grantedAmount": 1,
          "reason": "출석"
        }
      ]
    }

### Confirmed Bulk Success Response

    {
      "resultType": "success",
      "error": null,
      "success": {
        "tokenEventId": "f0c67cf8-ff8b-4e3c-ac21-86c321e6469d",
        "processedCount": 2,
        "savedCount": 2,
        "unchangedCount": 0,
        "items": [
          {
            "status": "created",
            "tokenGrantId": "7aea789e-b923-4d4f-a3ea-45a94f6628cc",
            "tokenLogId": "6d5861e8-6e51-4904-a0ab-cad472ebd225",
            "userId": "8761555f-9ced-4781-84b0-a10cdf8cc3f7",
            "name": "Alynn Kim",
            "studentNumber": "12345678",
            "previousGrantedAmount": 0,
            "grantedAmount": 1,
            "deltaAmount": 1,
            "reason": "출석",
            "balanceBefore": 5,
            "balanceAfter": 6
          },
          {
            "status": "created",
            "tokenGrantId": "418b7dc8-f25f-4d45-9697-e4d199f5dcf4",
            "tokenLogId": "abd5ea50-4b81-40eb-827c-0a604845391e",
            "userId": "f540676b-b89e-4991-8f77-60a99181a99d",
            "name": "Onboarding Edge Test",
            "studentNumber": "29990101",
            "previousGrantedAmount": 0,
            "grantedAmount": 1,
            "deltaAmount": 1,
            "reason": "출석",
            "balanceBefore": 0,
            "balanceAfter": 1
          }
        ]
      }
    }

### Confirmed Existing Grant Update

A request changing a grant from 1 to 2 returned:

- `status: updated`
- `previousGrantedAmount: 1`
- `grantedAmount: 2`
- `deltaAmount: 1`
- `balanceBefore: 6`
- `balanceAfter: 7`

Therefore `grantedAmount` is the final event-level grant amount, not an additive delta.

### Reason

`reason` is a string.

Frontend preset suggestions are:

- `출석`
- `수요조사 참여`
- `기타`

These are frontend convenience values only.

The frontend may also send custom reason strings.

## Token Event Rename

### PATCH `/api/v1/admin/token-events/{tokenEventId}`

Renames the event.

### Confirmed Request

    {
      "eventName": "Frontend Token Event Test Updated"
    }

### Confirmed Success Response

    {
      "resultType": "success",
      "error": null,
      "success": {
        "tokenEventId": "f0c67cf8-ff8b-4e3c-ac21-86c321e6469d",
        "eventName": "Frontend Token Event Test Updated",
        "updatedAt": "2026-08-18T16:30:37.797Z"
      }
    }

## Token Event Delete

### DELETE `/api/v1/admin/token-events/{tokenEventId}`

Deletes the Token Event according to current backend behavior.

### Authentication

Administrator authentication required.

    Authorization: Bearer <SUPABASE_ACCESS_TOKEN>

### Request Body

None.

### Confirmed Success Response

    {
      "resultType": "success",
      "error": null,
      "success": {
        "deletedTokenEventId": "f0c67cf8-ff8b-4e3c-ac21-86c321e6469d",
        "deletedAt": "2026-08-18T16:32:10.940Z"
      }
    }

### Confirmed Balance Behavior

Deleting the event does not reverse token balances already applied by its grants.

Confirmed after deletion:

- Onboarding Edge Test remained at `1`
- Alynn Kim remained at `6`

Frontend rules:

- do not require grants to be zero before event deletion
- do not promise automatic token recovery
- warn that already-applied balances remain

Frontend warning:

    이벤트를 삭제해도 이미 학생 잔액에 반영된 토큰은 회수되지 않습니다.

### Post-Mutation Refresh

After grant save:

`GET /api/v1/admin/token-events/{tokenEventId}`

After rename:

refetch or synchronize the detail.

After delete:

navigate to `/admin/token` and refresh the list.

## Admin Token Balance Reset Preview

### GET `/api/v1/admin/token-balances/reset-preview`

Returns the current global student-token reset preview.

### Authentication

Administrator authentication required.

    Authorization: Bearer <SUPABASE_ACCESS_TOKEN>

### Request Body

None.

### Confirmed Success Response

    {
      "resultType": "success",
      "error": null,
      "success": {
        "affectedMemberCount": 2,
        "totalResetAmount": 7,
        "previewedAt": "2026-08-18T16:44:50.321Z"
      }
    }

### Fields

| Field                 | Meaning                                                    |
| --------------------- | ---------------------------------------------------------- |
| `affectedMemberCount` | Number of student accounts currently affected by the reset |
| `totalResetAmount`    | Total token amount that would be removed                   |
| `previewedAt`         | Time the preview was calculated                            |

### Frontend Use

Use the backend preview values directly.

Do not derive them from the Users list.

The frontend calls this endpoint:

1. when the reset dialog opens
2. again immediately before submitting the reset

The second call is a frontend-only stale-preview check.

### Frontend Preview Comparison

Compare:

- `affectedMemberCount`
- `totalResetAmount`

If either changed from the preview currently shown:

- do not call the reset POST
- close the dialog
- require the administrator to reopen the reset flow

No backend request-contract change is required for this behavior.

## Admin Token Balance Reset

### POST `/api/v1/admin/token-balances/reset`

Resets the affected student token balances according to the current backend policy.

### Authentication

Administrator authentication required.

    Authorization: Bearer <SUPABASE_ACCESS_TOKEN>
    Content-Type: application/json

### Confirmed Request

    {
      "confirmation": "RESET_ALL_STUDENT_TOKEN_BALANCES",
      "reason": "Frontend global token reset test"
    }

### Confirmation Phrase

The frontend must send exactly:

`RESET_ALL_STUDENT_TOKEN_BALANCES`

Do not alter case, spacing, or characters.

### Confirmed Success Response

    {
      "resultType": "success",
      "error": null,
      "success": {
        "affectedMemberCount": 2,
        "totalResetAmount": 7,
        "reason": "Frontend global token reset test",
        "performedBy": {
          "userId": "b5b922c5-9ca5-4c29-81e6-8faec8fbda53",
          "name": "Sulynn Kim"
        },
        "performedAt": "2026-08-18T16:49:19.781Z"
      }
    }

### Confirmed Reset Effect

Before reset:

- Alynn Kim: `tokenBalance = 6`
- Onboarding Edge Test: `tokenBalance = 1`

After reset:

- Alynn Kim: `tokenBalance = 0`
- Onboarding Edge Test: `tokenBalance = 0`

### Confirmed Post-Reset Preview

    {
      "resultType": "success",
      "error": null,
      "success": {
        "affectedMemberCount": 0,
        "totalResetAmount": 0,
        "previewedAt": "2026-08-18T16:49:41.553Z"
      }
    }

### Frontend Success Behavior

After success:

1. Close reset dialog.
2. Refresh token-related state.
3. Show a success message.

Recommended message:

    학생 토큰 잔액이 초기화되었습니다.

Optional summary:

    {affectedMemberCount}명의 학생, 총 {totalResetAmount} Tokens가 초기화되었습니다.

### Important Frontend Rule

The frontend stale-preview recheck does not guarantee transactional locking between Preview and Reset.

For the current operational model, this is accepted.

Do not add extra expected-preview fields to the POST request.

Do not change the backend API contract for this frontend safety check.

## Admin Products List

### GET `/api/v1/admin/products`

Returns a paginated administrator-facing product list.

### Authentication

Administrator authentication required.

    Authorization: Bearer <SUPABASE_ACCESS_TOKEN>

### Request Body

None.

### Confirmed Query Parameters

The following have been tested successfully:

- `page`
- `limit`
- `keyword`
- `publicationStatus`
- `availabilityStatus`
- `productType`

### Confirmed Product Type Values

- `ticket`
- `merchandise`

The current admin list UI does not expose Product Type as a visible filter even though the backend supports it.

### Confirmed Success Response

    {
      "resultType": "success",
      "error": null,
      "success": {
        "items": [
          {
            "productId": "89a9bf59-1ade-471f-90d6-6596f5d80d55",
            "productName": "Lucky Draw Ticket",
            "productType": "ticket",
            "tokenPrice": 10,
            "stockQuantity": 61,
            "isOrderable": true,
            "availabilityStatus": "available",
            "publicationStatus": "published",
            "image": {
              "fileId": "6001f116-df4b-4087-84b8-d5ef67db5860",
              "fileUrl": "<PUBLIC_PRODUCT_IMAGE_URL>"
            },
            "updatedAt": "2026-08-15T17:34:26.183Z"
          },
          {
            "productId": "d6e41ec7-0fe3-4f10-b21c-b42b7582e06d",
            "productName": "Sold Out Lucky Draw Ticket",
            "productType": "ticket",
            "tokenPrice": 10,
            "stockQuantity": 0,
            "isOrderable": true,
            "availabilityStatus": "unavailable",
            "publicationStatus": "published",
            "image": {
              "fileId": "6001f116-df4b-4087-84b8-d5ef67db5860",
              "fileUrl": "<PUBLIC_PRODUCT_IMAGE_URL>"
            },
            "updatedAt": "2026-08-08T17:12:49.237Z"
          }
        ],
        "pagination": {
          "page": 1,
          "limit": 10,
          "total": 4,
          "totalPages": 1
        }
      }
    }

### List Item Fields

| Field                | Meaning                         |
| -------------------- | ------------------------------- |
| `productId`          | Product UUID                    |
| `productName`        | Product display name            |
| `productType`        | `ticket` or `merchandise`       |
| `tokenPrice`         | Token cost                      |
| `stockQuantity`      | Remaining stock                 |
| `isOrderable`        | Administrator ordering toggle   |
| `availabilityStatus` | Effective ordering availability |
| `publicationStatus`  | Publication state               |
| `image`              | Representative product image    |
| `updatedAt`          | Latest update timestamp         |

### Availability Contract

The current admin API exposes `availabilityStatus` separately from `publicationStatus`.

Confirmed behavior:

- a `draft` product with positive stock and `isOrderable = true` can return `available`
- a `hidden` product with positive stock and `isOrderable = true` can return `available`
- `isOrderable = false` returns `unavailable`
- zero stock returns `unavailable`

Therefore `availabilityStatus` is an operational stock/orderability status, not proof that the product is publicly visible.

Public visibility must also respect `publicationStatus`.

Known values:

- `available`
- `unavailable`

### Publication Status

Known values used by the current product list include:

- `published`
- `draft`

### Frontend List Mapping

- `image.fileUrl` + `productName` → `Product`
- `tokenPrice` → `Token Price`
- `stockQuantity` → `Stock`
- `availabilityStatus` → `Availability`
- `publicationStatus` → `Publication`
- `updatedAt` → `Updated At`
- `productId` → `View` route

### Product Type UI Policy

Product Type is intentionally hidden from the current admin list.

It remains part of the API contract and must be used on:

- Product Detail
- Product Create
- Product Edit

The public/user-facing product category tabs may separately use the same `ticket` / `merchandise` values.

## Admin Product Detail

### GET `/api/v1/admin/products/{productId}`

Returns the administrator-facing Product detail.

### Authentication

Administrator authentication required.

    Authorization: Bearer <SUPABASE_ACCESS_TOKEN>

### Confirmed Success Response

    {
      "resultType": "success",
      "error": null,
      "success": {
        "productId": "89a9bf59-1ade-471f-90d6-6596f5d80d55",
        "productName": "Lucky Draw Ticket",
        "productType": "ticket",
        "tokenPrice": 10,
        "stockQuantity": 61,
        "isOrderable": true,
        "availabilityStatus": "available",
        "publicationStatus": "published",
        "description": "KSA event participation ticket 설명입니다👍.",
        "image": {
          "fileId": "6001f116-df4b-4087-84b8-d5ef67db5860",
          "fileUrl": "<PUBLIC_PRODUCT_IMAGE_URL>"
        },
        "coreFieldsLocked": true,
        "publishedAt": "2026-08-10T08:28:46.986Z",
        "createdAt": "2026-08-08T16:57:35.881Z",
        "updatedAt": "2026-08-15T17:34:26.183Z"
      }
    }

### Product Type

Known values:

- `ticket`
- `merchandise`

Product Type is immutable after creation.

A confirmed PATCH attempt containing:

    {
      "productType": "merchandise"
    }

failed with:

    {
      "resultType": "fail",
      "error": {
        "errorCode": "HTTP_400",
        "reason": "property productType should not exist",
        "data": null
      },
      "success": null
    }

Frontend must not include `productType` in update requests.

### Core Fields Lock

`coreFieldsLocked` controls whether Product Name and Token Price may be changed.

Confirmed locked update error:

`P409_PRODUCT_CORE_FIELDS_LOCKED`

Reason:

`Product name and token price cannot be changed after an order exists`

Frontend behavior:

- `coreFieldsLocked = true` → Product Name and Token Price read-only
- `coreFieldsLocked = false` → Product Name and Token Price editable

### Published At

`publishedAt` is the first publication timestamp.

A Product may currently be `draft` or `hidden` while still retaining a non-null `publishedAt`.

Frontend must not infer current publication state from this timestamp.

## Admin Product Update

### PATCH `/api/v1/admin/products/{productId}`

Updates supported Product fields.

### Authentication

Administrator authentication required.

    Authorization: Bearer <SUPABASE_ACCESS_TOKEN>
    Content-Type: application/json

### Confirmed Editable Fields

- `productName`
- `tokenPrice`
- `stockQuantity`
- `isOrderable`
- `description`
- `imageFileId`
- `publicationStatus`

Supported publication status values from the existing contract:

- `draft`
- `published`
- `hidden`

### Do Not Send

- `productType`
- `availabilityStatus`
- `coreFieldsLocked`
- timestamps

### Confirmed Unlocked Token Price Update

A Product with `coreFieldsLocked: false` accepted a Token Price update.

Confirmed response included:

- updated `tokenPrice`
- full Product detail
- unchanged `productType`
- `coreFieldsLocked: false`

### Confirmed Ordering Availability Behavior

Setting:

    {
      "isOrderable": false
    }

on a published product with remaining stock resulted in:

`availabilityStatus: unavailable`

After restoring `isOrderable: true`, availability returned to its prior operational state.

### Confirmed Hidden Update

Request:

    {
      "publicationStatus": "hidden"
    }

succeeded.

The update response returned:

- `publicationStatus: hidden`
- `availabilityStatus: available`

for a product with positive stock and `isOrderable: true`.

Therefore current admin API semantics are:

- Publication and Availability are separate
- `availabilityStatus` is not proof of public visibility

Frontend must use publication state separately when determining user-facing visibility.

### Confirmed Product Image Replacement

Request field:

`imageFileId`

A completed Product image file was successfully attached to a Product.

Confirmed replacement response returned:

    {
      "image": {
        "fileId": "a7bd0a05-3ed3-4f8b-9e15-53a4951b82f3",
        "fileUrl": "<PUBLIC_PRODUCT_IMAGE_URL>"
      }
    }

Product image purpose:

`product_image`

### Product Image Upload Flow

Reuse the shared admin file APIs:

1. `POST /api/v1/admin/files/presigned-url`
2. direct `PUT <uploadUrl>` to Storage
3. `POST /api/v1/admin/files/complete`
4. use completed `fileId` as Product `imageFileId`
5. `PATCH /api/v1/admin/products/{productId}`

For Product images, request the signed URL with:

`purpose: product_image`

The same shared image guidance applies:

- PNG / JPEG / WebP
- recommend approximately 1 MB or less
- enforce backend 5 MB maximum
- optionally compress/convert before requesting signed URL
- final filename extension must match final content type

### PATCH Response

Confirmed Product PATCH responses return the updated Product detail rather than only a mutation summary.

Frontend may update current detail state directly from the response, with refetch when needed for canonical synchronization.

## Admin Product Create

### POST `/api/v1/admin/products`

Creates a new Product.

### Authentication

Administrator authentication required.

    Authorization: Bearer <SUPABASE_ACCESS_TOKEN>
    Content-Type: application/json

### Frontend Create Fields

- `productName`
- `productType`
- `tokenPrice`
- `stockQuantity`
- `isOrderable`
- `publicationStatus`
- `description`
- `imageFileId` when an image is attached

### Product Type Values

- `ticket`
- `merchandise`

Product Type is selected during creation and is immutable afterward.

### Frontend Publication Actions

The current frontend creation UI uses:

- `draft`
- `published`

The frontend does not expose `hidden` as a creation action.

### Confirmed Draft Request

    {
      "productName": "Frontend Merchandise Test",
      "productType": "merchandise",
      "tokenPrice": 25,
      "stockQuantity": 10,
      "isOrderable": true,
      "publicationStatus": "draft",
      "description": "Frontend product creation test."
    }

### Confirmed Draft Success Response

    {
      "resultType": "success",
      "error": null,
      "success": {
        "productId": "67e2c2ed-cb29-490e-a174-021f68f6daf3",
        "productName": "Frontend Merchandise Test",
        "productType": "merchandise",
        "tokenPrice": 25,
        "stockQuantity": 10,
        "isOrderable": true,
        "availabilityStatus": "available",
        "publicationStatus": "draft",
        "description": "Frontend product creation test.",
        "image": null,
        "publishedAt": null,
        "createdAt": "2026-08-18T18:44:46.993Z",
        "updatedAt": "2026-08-18T18:44:46.993Z"
      }
    }

### Confirmed Create Semantics

The confirmed create response shows that:

- `merchandise` is accepted as Product Type
- Draft creation is supported
- image is optional
- Draft may return `availabilityStatus: available`
- Draft has `publishedAt: null`

Therefore:

- Availability is not equivalent to public visibility
- Publication state must be handled separately
- frontend should not derive public visibility from Availability alone

### Image

When no Product image is attached:

`image: null`

When using an image:

1. upload with the shared file flow
2. use `purpose: product_image`
3. complete upload
4. send the completed file ID as `imageFileId`

### Product Image Upload APIs

- `POST /api/v1/admin/files/presigned-url`
- direct `PUT <uploadUrl>` to Storage
- `POST /api/v1/admin/files/complete`

### Frontend Success Navigation

After Draft creation:

`/admin/products/{productId}`

Message:

    상품이 임시 저장되었습니다.

After Published creation:

`/admin/products/{productId}`

Message:

    상품이 게시되었습니다.

### Do Not Send

Frontend create requests must not send backend-derived fields such as:

- `availabilityStatus`
- `coreFieldsLocked`
- timestamps

## Admin Orders List

### GET `/api/v1/admin/orders`

Returns the paginated administrator-facing order list.

### Authentication

Administrator authentication required.

    Authorization: Bearer <SUPABASE_ACCESS_TOKEN>

### Confirmed Query Parameters

- `page`
- `limit`
- `keyword`
- `orderStatus`
- `sort`

Confirmed:

- keyword search works
- order-status filtering works
- `sort=oldest` works

### Order Status Values

Confirmed values:

- `ordered`
- `accepted`
- `delivered`
- `canceled`

### List Item Shape

Each item contains:

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

### Product Summary

Fields:

- `productId`
- `productName`

### Customer Summary

Fields:

- `userId`
- `customerName`
- `studentNumber`
- `email`

### Confirmed Pagination Shape

    {
      "page": 1,
      "limit": 10,
      "total": 10,
      "totalPages": 1
    }

## Admin Order Status Update

### PATCH `/api/v1/admin/orders/{orderId}/status`

Updates Order status.

### Authentication

Administrator authentication required.

    Authorization: Bearer <SUPABASE_ACCESS_TOKEN>
    Content-Type: application/json

## Ordered to Accepted

### Confirmed Request

    {
      "orderStatus": "accepted"
    }

### Confirmed Success Response

    {
      "resultType": "success",
      "error": null,
      "success": {
        "orderId": "0b317578-ac92-4002-a98f-7270ef676491",
        "product": {
          "productId": "89a9bf59-1ade-471f-90d6-6596f5d80d55",
          "productName": "Lucky Draw Ticket"
        },
        "customer": {
          "userId": "8761555f-9ced-4781-84b0-a10cdf8cc3f7",
          "customerName": "Alynn Kim",
          "studentNumber": "12345678",
          "email": "test@connect.ust.hk"
        },
        "quantity": 1,
        "unitPrice": 10,
        "totalAmount": 10,
        "orderStatus": "accepted",
        "orderedAt": "2026-08-15T17:34:26.475Z",
        "acceptedAt": "2026-08-18T18:59:17.353Z",
        "deliveredAt": null,
        "canceledAt": null,
        "cancellationReason": null
      }
    }

## Accepted to Delivered

### Confirmed Request

    {
      "orderStatus": "delivered"
    }

### Confirmed Behavior

The response returns:

- `orderStatus: delivered`
- populated `acceptedAt`
- populated `deliveredAt`
- `canceledAt: null`
- `cancellationReason: null`

## Order Cancellation

### Confirmed Request

    {
      "orderStatus": "canceled",
      "cancellationReason": "Frontend cancellation test"
    }

### Confirmed Success Response

    {
      "resultType": "success",
      "error": null,
      "success": {
        "orderId": "19091bd5-ec48-499a-8a93-5ba10464473f",
        "product": {
          "productId": "89a9bf59-1ade-471f-90d6-6596f5d80d55",
          "productName": "Lucky Draw Ticket"
        },
        "customer": {
          "userId": "8761555f-9ced-4781-84b0-a10cdf8cc3f7",
          "customerName": "Alynn Kim",
          "studentNumber": "12345678",
          "email": "test@connect.ust.hk"
        },
        "quantity": 1,
        "unitPrice": 10,
        "totalAmount": 10,
        "orderStatus": "canceled",
        "orderedAt": "2026-08-10T19:08:26.863Z",
        "acceptedAt": null,
        "deliveredAt": null,
        "canceledAt": "2026-08-18T19:00:18.008Z",
        "cancellationReason": "Frontend cancellation test"
      }
    }

### Cancellation Frontend Contract

When `orderStatus` is `canceled`:

- require `cancellationReason`
- show a cancellation confirmation modal
- explain the visible effect as:

  주문 취소 시 사용한 Tokens와 상품 재고가 복구됩니다.

Do not mention backend implementation details in the UI.

### Frontend Mutation Rule

PATCH responses return the updated full Order.

After a successful mutation, refetch the Orders list using the current:

- page
- keyword
- orderStatus
- sort

This ensures an order is removed from a status-filtered tab when its status changes.

## Admin Action Logs List

### GET `/api/v1/admin/action-logs`

Returns paginated administrator action logs.

### Authentication

Administrator authentication required.

    Authorization: Bearer <SUPABASE_ACCESS_TOKEN>

### Confirmed Query Parameters

- `page`
- `limit`
- `actionType`

`actionType` filtering has been confirmed.

### Unsupported Query Parameters

The current backend rejects:

- `action`
- `keyword`

Do not send these from the frontend.

Confirmed `action` rejection:

    {
      "resultType": "fail",
      "error": {
        "errorCode": "HTTP_400",
        "reason": "property action should not exist",
        "data": null
      },
      "success": null
    }

Confirmed `keyword` rejection:

    {
      "resultType": "fail",
      "error": {
        "errorCode": "HTTP_400",
        "reason": "property keyword should not exist",
        "data": null
      },
      "success": null
    }

### Confirmed Success Response Shape

    {
      "resultType": "success",
      "error": null,
      "success": {
        "items": [
          {
            "logId": 215,
            "admin": {
              "userId": "b5b922c5-9ca5-4c29-81e6-8faec8fbda53",
              "name": "Sulynn Kim",
              "email": "user@connect.ust.hk"
            },
            "actionType": "order",
            "action": "update_order_status",
            "targetId": "19091bd5-ec48-499a-8a93-5ba10464473f",
            "createdAt": "2026-08-18T19:00:18.499Z"
          },
          {
            "logId": 212,
            "admin": {
              "userId": "b5b922c5-9ca5-4c29-81e6-8faec8fbda53",
              "name": "Sulynn Kim",
              "email": "user@connect.ust.hk"
            },
            "actionType": "product",
            "action": "create_product",
            "targetId": "67e2c2ed-cb29-490e-a174-021f68f6daf3",
            "createdAt": "2026-08-18T18:44:47.122Z"
          }
        ],
        "pagination": {
          "page": 1,
          "limit": 10,
          "total": 215,
          "totalPages": 22
        }
      }
    }

### List Item Fields

- `logId`
- `admin`
- `actionType`
- `action`
- `targetId`
- `createdAt`

### Frontend Display Mapping

- `createdAt` → `Date`
- `admin.name` + `admin.email` → `Admin`
- `actionType` → `Type`
- `action` → human-readable `Action`
- `targetId` → shortened `Target` + full-value copy
- `logId` → Detail route

Humanization is presentation-only.

The API values must remain unchanged.

## Admin Action Log Detail

### GET `/api/v1/admin/action-logs/{logId}`

Returns the complete audit log, including action-specific `details`.

### Authentication

Administrator authentication required.

    Authorization: Bearer <SUPABASE_ACCESS_TOKEN>

### Confirmed Success Response

    {
      "resultType": "success",
      "error": null,
      "success": {
        "logId": 215,
        "admin": {
          "userId": "b5b922c5-9ca5-4c29-81e6-8faec8fbda53",
          "name": "Sulynn Kim",
          "email": "user@connect.ust.hk"
        },
        "actionType": "order",
        "action": "update_order_status",
        "targetId": "19091bd5-ec48-499a-8a93-5ba10464473f",
        "createdAt": "2026-08-18T19:00:18.499Z",
        "details": {
          "afterStatus": "canceled",
          "beforeStatus": "ordered",
          "cancellationReason": "Frontend cancellation test"
        }
      }
    }

### Detail Fields

The Detail response includes all list fields plus:

`details`

### Details Contract

`details` is action-specific audit metadata.

The frontend must not assume one universal fixed schema.

For display:

- humanize object keys when useful
- preserve exact values
- support nested data generically
- do not rewrite historical audit metadata

Confirmed example mappings:

- `beforeStatus` → label `Before Status`, exact value `ordered`
- `afterStatus` → label `After Status`, exact value `canceled`
- `cancellationReason` → label `Cancellation Reason`, exact value `Frontend cancellation test`

### Read-Only Contract

Admin Action Logs are read-only in the frontend.

No frontend mutation endpoint is used for Action Logs.
