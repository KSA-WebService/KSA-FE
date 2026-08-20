# Page 1 — Home

Home does not use a dedicated `/home` endpoint in the MVP.

Load public News and Store preview data independently.

Authentication is not required for either request.

## News Preview

### Request

`GET /api/v1/posts`

Recommended Home query:

- `page=1`
- `limit=3`

Example:

`GET /api/v1/posts?page=1&limit=3`

### Response

```json
{
  "resultType": "success",
  "error": null,
  "success": {
    "items": [
      {
        "postId": "string",
        "title": "string",
        "categories": ["event"],
        "membersOnly": false,
        "eventStartAt": "ISO-8601 | null",
        "eventEndAt": "ISO-8601 | null",
        "representativeImage": {
          "fileId": "string",
          "fileUrl": "string"
        },
        "publishedAt": "ISO-8601"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 3,
      "total": 0,
      "totalPages": 0
    }
  }
}
```

`representativeImage` may be `null`.

Supported category values:

- `partnership`
- `event`
- `co_purchase`
- `career`
- `announcement`
- `alumni`

`membersOnly = true` does not prevent public list or detail access.

It is a display/business-eligibility indicator.

## News Detail Visibility

### Request

`GET /api/v1/posts/{postId}`

Authentication is not required.

A post with `membersOnly = true` remains publicly readable.

The response may include:

- `postId`
- `title`
- `content`
- `categories`
- `membersOnly`
- `eventStartAt`
- `eventEndAt`
- `images`
- `publishedAt`
- `updatedAt`

## Store Preview

### Request

`GET /api/v1/products`

Recommended Home query:

- `page=1`
- `limit=3`

Example:

`GET /api/v1/products?page=1&limit=3`

### Response

```json
{
  "resultType": "success",
  "error": null,
  "success": {
    "items": [
      {
        "productId": "string",
        "productName": "string",
        "productType": "ticket",
        "description": "string",
        "tokenPrice": 10,
        "image": {
          "fileId": "string",
          "fileUrl": "string"
        },
        "availabilityStatus": "available",
        "publishedAt": "ISO-8601"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 3,
      "total": 0,
      "totalPages": 0
    }
  }
}
```

`image` may be `null`.

Supported `productType` values:

- `ticket`
- `merchandise`

Supported `availabilityStatus` values:

- `available`
- `unavailable`

Unavailable products remain publicly visible.

Authentication is required only when the user attempts to create an order.

# Page 2 — Login

## Authentication Provider

Login is handled by Supabase Auth from the frontend.

Do not create or call a KSA backend Login endpoint.

Use Supabase email/password authentication.

Conceptual flow:

1. User submits email and password.
2. Frontend calls Supabase `signInWithPassword`.
3. Supabase returns/establishes the authenticated session.
4. Frontend navigates to Home (`/`).
5. Authenticated KSA endpoints may use the resulting access token when required.

## Application Data Boundary

Supabase is used for authentication only.

Do not use:

- `supabase.from(...)`
- Supabase Data API for KSA application data
- manually persisted auth tokens outside the supported Supabase session flow

All KSA application data continues to use the NestJS backend APIs.

## Invalid Credentials

Map provider authentication failures to a user-friendly Korean message.

Recommended display:

`이메일 또는 비밀번호를 확인해주세요.`

Do not expose raw provider errors when they are not useful to the user.

## Existing Session

If the user already has a valid authenticated session when accessing `/login`, redirect to `/`.

# Page 3 — Account Activation

Account activation uses two public KSA backend endpoints followed by Supabase authentication.

No Authorization header is required for the two backend onboarding requests.

## 1. Verify Invitation

### Method

`POST`

### Endpoint

`/api/v1/auth/invitations/verify`

### Headers

`Content-Type: application/json`

### Authorization

Not required.

### Request Body

```json
{
  "token": "raw invitation token from the invitation URL"
}
```

The token is the raw value from:

`/signup/invitation?token=...`

Do not use an invitation ID or token hash.

### Success Response

```json
{
  "resultType": "success",
  "error": null,
  "success": {
    "name": "Sunday",
    "email": "sun@connect.ust.hk",
    "studentNumber": "45876214",
    "expiresAt": "2026-08-22T23:36:36.567Z"
  }
}
```

Use:

- `name`
- `email`
- `studentNumber`

as read-only onboarding fields.

`expiresAt` is available to the frontend but does not need to be prominently displayed in the default form.

## 2. Complete Onboarding

### Method

`POST`

### Endpoint

`/api/v1/auth/onboarding/complete`

### Headers

`Content-Type: application/json`

### Authorization

Not required.

### Request Body

```json
{
  "token": "same raw invitation token",
  "password": "user-selected password",
  "agreedPrivacy": true
}
```

Do not send the password-confirmation field.

Privacy consent must be `true`.

### Password Contract

Backend password rules:

- minimum 8 characters
- maximum 72 characters
- at least one uppercase letter
- at least one lowercase letter
- at least one number
- at least one special character
- no whitespace

The compact UI helper text intentionally displays:

`8자 이상 · 영문 대/소문자, 숫자, 특수문자 각 1개 이상 · 공백 불가`

The backend remains authoritative for the maximum-length rule.

### Success Response

```json
{
  "resultType": "success",
  "error": null,
  "success": {
    "userId": "99ae2be5-d975-471b-bf92-4b1270c42e98",
    "name": "Sunday",
    "email": "sun@connect.ust.hk",
    "studentNumber": "45876214",
    "role": "student",
    "status": "active",
    "tokenBalance": 0,
    "createdAt": "2026-08-19T23:40:57.318Z"
  }
}
```

External enum-like values remain lowercase at the API boundary.

## 3. Automatic Sign-In

After onboarding completion succeeds, authenticate with Supabase Auth using:

- email: the verified invitation email
- password: the password the user just submitted

Use Supabase `signInWithPassword`.

Do not use a KSA backend Login endpoint.

After the Supabase session is established, navigate to:

`/`

## Application Data Boundary

Supabase is used for authentication only.

Do not use:

- `supabase.from(...)`
- Supabase Data API for KSA application data
- manual access-token persistence outside the supported Supabase session flow

All KSA application data continues through the NestJS backend.

## Error Handling

Invitation verification and onboarding failure responses should be mapped using confirmed backend `error` payloads.

Do not invent error codes.

Until failure responses are explicitly documented, keep the frontend error mapper extensible and provide a safe generic Korean fallback.

# Page 4 — My Page

All My Page APIs require an authenticated student session.

Use the Supabase access token as a Bearer token for KSA backend requests.

## Authentication Header

`Authorization: Bearer <STUDENT_ACCESS_TOKEN>`

Do not manually persist the token outside the supported Supabase session flow.

---

## 1. Get Current User

### Method

`GET`

### Endpoint

`/api/v1/users/me`

### Authorization

Required.

### Headers

`Authorization: Bearer <STUDENT_ACCESS_TOKEN>`

### Body

None.

### Query Parameters

None.

### Success Response

```json
{
  "resultType": "success",
  "error": null,
  "success": {
    "userId": "8761555f-9ced-4781-84b0-a10cdf8cc3f7",
    "name": "Alynn Kim",
    "studentNumber": "12345678",
    "email": "test@connect.ust.hk",
    "role": "student",
    "tokenBalance": 100,
    "status": "active",
    "agreedPrivacy": true,
    "agreedAt": null
  }
}
```

My Page uses:

- `name`
- `studentNumber`
- `email`
- `tokenBalance`

Do not display internal fields solely because they are present in the response.

---

## 2. Get My Orders

### Method

`GET`

### Endpoint

`/api/v1/users/me/orders`

### Authorization

Required.

### Headers

`Authorization: Bearer <STUDENT_ACCESS_TOKEN>`

### Body

None.

### Query Parameters

Supported:

- `page`
- `limit`

Confirmed pagination example:

`GET /api/v1/users/me/orders?page=2&limit=5`

Confirmed response metadata:

```json
{
  "page": 2,
  "limit": 5,
  "total": 10,
  "totalPages": 2
}
```

### Order Item Shape

```json
{
  "orderId": "91f7ec90-301e-4af0-aaf3-8a1fccefa0c1",
  "product": {
    "productId": "89a9bf59-1ade-471f-90d6-6596f5d80d55",
    "productName": "Lucky Draw Ticket"
  },
  "quantity": 1,
  "unitPrice": 10,
  "totalAmount": 10,
  "orderStatus": "canceled",
  "orderedAt": "2026-08-10T19:17:20.185Z",
  "acceptedAt": "2026-08-11T15:30:11.724Z",
  "deliveredAt": null,
  "canceledAt": "2026-08-11T15:34:20.387Z",
  "cancellationReason": "Customer requested cancellation"
}
```

Confirmed `orderStatus` values used by the user frontend:

- `ordered`
- `accepted`
- `delivered`
- `canceled`

The frontend is read-only for these records.

---

## 3. Get My Token Logs

### Method

`GET`

### Endpoint

`/api/v1/users/me/token-logs`

### Authorization

Required.

### Headers

`Authorization: Bearer <STUDENT_ACCESS_TOKEN>`

### Body

None.

### Query Parameters

Supported:

- `page`
- `limit`

Confirmed pagination example:

`GET /api/v1/users/me/token-logs?page=2&limit=5`

Confirmed response metadata:

```json
{
  "page": 2,
  "limit": 5,
  "total": 42,
  "totalPages": 9
}
```

### Response Shape

```json
{
  "resultType": "success",
  "error": null,
  "success": {
    "currentTokenBalance": 100,
    "items": [
      {
        "tokenLogId": "86a95b3d-e14c-4b3e-b386-732a859eb7d1",
        "transactionType": "event_adjustment",
        "delta": -1,
        "reason": "출석",
        "balanceBefore": 7,
        "balanceAfter": 6,
        "createdAt": "2026-08-18T16:26:08.654Z",
        "tokenEvent": {
          "tokenEventId": "f0c67cf8-ff8b-4e3c-ac21-86c321e6469d",
          "eventName": "Frontend Token Event Test"
        },
        "order": null
      }
    ],
    "pagination": {
      "page": 2,
      "limit": 5,
      "total": 42,
      "totalPages": 9
    }
  }
}
```

Confirmed `transactionType` values observed in the current API:

- `event_grant`
- `event_adjustment`
- `order_payment`
- `order_refund`
- `reset`

### Conditional Related Data

For event-related transactions:

- `tokenEvent` may contain:
  - `tokenEventId`
  - `eventName`
- `order` is null

For order-related transactions:

- `order` may contain:
  - `orderId`
  - `productId`
  - `productName`
  - `quantity`
  - `unitPrice`
  - `totalAmount`
- `tokenEvent` is null

For reset transactions:

- both `tokenEvent` and `order` may be null

The frontend must handle all three shapes safely.

### Current Balance

The response includes `currentTokenBalance`.

For the My Page summary, use `/api/v1/users/me` → `tokenBalance` as the canonical displayed balance.

### Display Derivation

For the user-facing `내역` column:

1. If `tokenEvent` exists, use `tokenEvent.eventName`.
2. Else if `order` exists, use `order.productName`.
3. Else use `—`.

For the user-facing `변동` column:

- positive `delta` values must include `+`
- negative values retain `-`
- zero displays as `0`

For the user-facing `잔액` column:

- use `balanceAfter`

---

## Error Handling

Authenticated API failures should follow the shared user-auth policy.

If the session is no longer valid:

- clear/refresh authentication through the supported Supabase flow as appropriate
- redirect to `/login` when the user is no longer authenticated

For non-auth failures:

- preserve the surrounding My Page UI when possible
- show a section-local retry state for Orders or Token History failures

# Page 5 — News List

The News list is publicly accessible.

Authentication is not required.

## Endpoint

### Method

`GET`

### Endpoint

`/api/v1/posts`

### Authorization

Not required.

### Headers

No Authorization header is required.

No request body is used.

## Query Parameters

Confirmed supported query parameters:

- `keyword`
- `category`
- `page`
- `limit`

These parameters may be combined.

## Keyword Search

Example:

`GET /api/v1/posts?keyword=Orientation&page=1&limit=5`

Confirmed behavior:

- returns matching published posts
- pagination metadata reflects the filtered result set

Example confirmed metadata:

```json
{
  "page": 1,
  "limit": 5,
  "total": 3,
  "totalPages": 1
}
```

## Category Filter

Example:

`GET /api/v1/posts?category=event&page=1&limit=5`

Confirmed category values used by the frontend:

- `event`
- `announcement`
- `career`
- `partnership`
- `co_purchase`
- `alumni`

For the `전체` UI option, omit the `category` parameter.

## Combined Keyword + Category

Example:

`GET /api/v1/posts?keyword=Orientation&category=event&page=1&limit=5`

Confirmed behavior:

- keyword and category filters are applied together
- pagination metadata reflects the combined filtered result set

## Success Response Shape

```json
{
  "resultType": "success",
  "error": null,
  "success": {
    "items": [
      {
        "postId": "480957b3-3dd1-4b7e-99ed-dc13d42119df",
        "title": "Orientation Day2",
        "categories": ["event", "announcement"],
        "membersOnly": false,
        "eventStartAt": null,
        "eventEndAt": null,
        "representativeImage": null,
        "publishedAt": "2026-08-19T16:44:10.513Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

`representativeImage` may be:

```json
{
  "fileId": "string",
  "fileUrl": "string"
}
```

or `null`.

## Members Only

`membersOnly = true` does not require authentication for the list or detail APIs.

Frontend display label:

`Members Only`

Do not block navigation to the detail page.

## Frontend Query State

Recommended URL state:

- `keyword`
- `category`
- `page`

The frontend may choose its display page size through `limit`.

When keyword or category changes:

- set page back to 1

Do not invent unsupported sort parameters.

## Date Handling

All API timestamps are ISO-8601 values.

Display them in `Asia/Hong_Kong`.

For card date display:

1. prefer `eventStartAt` when present
2. use `eventEndAt` to form a range when useful
3. otherwise use `publishedAt`

## Error Handling

For public list failures:

- keep the shared Header/Footer available where possible
- show a News-section retry state
- do not redirect to Login because this endpoint is public

# Page 6 — News Detail

The News Detail API is public.

Authentication is not required.

## Get News Detail

### Method

`GET`

### Endpoint

`/api/v1/posts/{postId}`

### Authorization

Not required.

### Headers

No Authorization header is required.

### Body

None.

### Query Parameters

None.

### Example Request

`GET /api/v1/posts/a8b9fa1f-fdb9-4a9a-bbcf-863c6f281ec0`

## Success Response

```json
{
  "resultType": "success",
  "error": null,
  "success": {
    "postId": "a8b9fa1f-fdb9-4a9a-bbcf-863c6f281ec0",
    "title": "[HKUSTSU KSA 산들 2026-27 신입생 환영회 안내 📢]",
    "content": "plain-text post content",
    "categories": ["event"],
    "membersOnly": false,
    "eventStartAt": "2026-08-14T11:10:00.000Z",
    "eventEndAt": "2026-08-14T14:30:00.000Z",
    "images": [
      {
        "fileId": "2c091de9-ca48-4fa5-9cc3-97ea0e429494",
        "fileUrl": "https://example.supabase.co/storage/v1/object/public/.../image-1.webp",
        "sortOrder": 1
      },
      {
        "fileId": "dbbec78a-26e4-4ec7-b222-5127821e647f1",
        "fileUrl": "https://example.supabase.co/storage/v1/object/public/.../image-2.webp",
        "sortOrder": 2
      }
    ],
    "publishedAt": "2026-08-19T16:41:28.354Z",
    "updatedAt": "2026-08-19T16:41:28.523Z"
  }
}
```

## Response Fields

### Core

- `postId`
- `title`
- `content`
- `categories`
- `membersOnly`

### Event

- `eventStartAt`
- `eventEndAt`

Both may be `null` for non-event posts.

### Images

`images` is an array.

Each item contains:

- `fileId`
- `fileUrl`
- `sortOrder`

The frontend must sort by `sortOrder` ascending before rendering.

`images` may be empty.

### Timestamps

- `publishedAt`
- `updatedAt`

Display user-facing timestamps in `Asia/Hong_Kong`.

## Supported Categories

- `partnership`
- `event`
- `co_purchase`
- `career`
- `announcement`
- `alumni`

Frontend labels:

- `partnership` → 제휴
- `event` → 행사
- `co_purchase` → 공동구매
- `career` → 커리어
- `announcement` → 공지
- `alumni` → Alumni

## Members Only

`membersOnly = true` does not require authentication.

The frontend should display:

`Members Only`

but must not block the detail response or navigation.

## Content Rendering Contract

`content` is plain text.

The frontend should:

- preserve line breaks
- preserve paragraph spacing
- preserve emoji/Unicode
- safely detect explicit `http://` and `https://` URLs
- render detected URLs as external links

Do not interpret arbitrary HTML from `content`.

## Structured Event Time vs. Body Text

Use `eventStartAt` / `eventEndAt` for the structured event-information UI.

Do not parse or overwrite dates/times contained in `content`.

If structured metadata and authored body text differ, preserve both as returned rather than silently reconciling them in the frontend.

## Error Handling

Do not redirect to Login for failures from this public endpoint.

Map confirmed backend not-found errors to a user-friendly News not-found state when available.

Use a safe generic retry state for unexpected failures.

# Page 7 — Store List

The Store list API is public.

Authentication is not required.

## Get Products

### Method

`GET`

### Endpoint

`/api/v1/products`

### Authorization

Not required.

### Headers

No Authorization header is required.

### Body

None.

## Query Parameters

Confirmed supported query parameters used by the frontend:

- `productType`
- `page`
- `limit`

Do not send a `keyword` parameter.

The backend currently rejects `keyword`.

Confirmed failure example:

```json
{
  "resultType": "fail",
  "error": {
    "errorCode": "HTTP_400",
    "reason": "property keyword should not exist",
    "data": null
  },
  "success": null
}
```

Therefore, the MVP Store UI must not expose product keyword search.

## Product Type Filter

Supported values:

- `ticket`
- `merchandise`

Examples:

`GET /api/v1/products?productType=ticket&page=1&limit=5`

`GET /api/v1/products?productType=merchandise&page=1&limit=5`

For the `전체` UI option, omit `productType`.

Confirmed behavior:

- `ticket` returns matching products
- `merchandise` may validly return an empty `items` array
- pagination metadata reflects the filtered result set

## Success Response Shape

```json
{
  "resultType": "success",
  "error": null,
  "success": {
    "items": [
      {
        "productId": "2ecca6da-ac52-40d4-aebb-f2838d8ed291",
        "productName": "무료 안주 쿠폰",
        "productType": "ticket",
        "description": "포장마차 이벤트에서 사용가능한 무료 안주 쿠폰입니다.",
        "tokenPrice": 10,
        "image": {
          "fileId": "030932e1-a9b3-4ce7-b222-5127821e7218",
          "fileUrl": "https://example.supabase.co/storage/v1/object/public/.../product.webp"
        },
        "availabilityStatus": "available",
        "publishedAt": "2026-08-19T19:38:00.083Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 5,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

`image` may be null.

## Product Type Labels

Frontend mapping:

- `ticket` → 이용권
- `merchandise` → 상품

Do not infer product type from `productName` or `description`.

Use the API value as the source of truth.

## Availability

Supported values:

- `available`
- `unavailable`

Frontend behavior:

### `available`

- product remains visible
- authenticated user may proceed to Order Confirmation
- logged-out user must authenticate before ordering

### `unavailable`

- product remains visible
- show `현재 주문 불가`
- do not allow order creation

## Description

`description` is plain text.

The frontend may visually clamp it in the Store card.

When expanded:

- preserve line breaks
- render as plain text
- do not interpret arbitrary HTML

## Pagination

Use:

- `page`
- `limit`

as backend-controlled pagination parameters.

Use returned:

- `page`
- `limit`
- `total`
- `totalPages`

as the source of truth.

Do not show pagination controls when only one page exists unless required for layout consistency.

## Error Handling

Do not redirect to Login for Store list failures because browsing is public.

Show a Store-section retry state for unexpected failures.

Do not send unsupported query parameters.

# Page 8 — Order Confirmation

Order creation requires an authenticated student session.

## Create Order

### Method

`POST`

### Endpoint

`/api/v1/orders`

### Authorization

Required.

### Headers

```text
Authorization: Bearer <STUDENT_ACCESS_TOKEN>
Content-Type: application/json
Idempotency-Key: <UUID_V4>
```

`Idempotency-Key` is required for an order attempt.

The frontend generates it with:

```ts
crypto.randomUUID();
```

Generate it once when the user confirms one purchase intent.

Reuse the same key only when retrying that exact same request.

Do not generate a new key for every network retry.

### Query Parameters

None.

### Request Body

```json
{
  "productId": "650c73c9-9406-4b5d-ad01-beec139e0478",
  "quantity": 3
}
```

Fields:

- `productId`: selected Store product ID
- `quantity`: positive integer quantity

Do not send frontend-calculated price or total.

The backend determines the authoritative order price.

## Confirmed Success Response

```json
{
  "resultType": "success",
  "error": null,
  "success": {
    "orderId": "8e6469e5-cd83-494a-9aa5-5fc0e2ad64cb",
    "product": {
      "productId": "650c73c9-9406-4b5d-ad01-beec139e0478",
      "productName": "Paused Priority Ticket"
    },
    "quantity": 3,
    "unitPrice": 30,
    "totalAmount": 90,
    "orderStatus": "ordered",
    "remainingTokenBalance": 10,
    "orderedAt": "2026-08-20T06:08:26.880Z"
  }
}
```

Use the response as the source of truth for:

- final quantity
- unit price
- total amount
- order status
- remaining Token balance
- order timestamp

## Confirmed Idempotent Retry

A second request was sent with the same:

- `Idempotency-Key`
- `productId`
- `quantity`

The backend returned the identical successful order result, including the same:

- `orderId`
- `remainingTokenBalance`
- `orderedAt`

Confirmed retry response:

```json
{
  "resultType": "success",
  "error": null,
  "success": {
    "orderId": "8e6469e5-cd83-494a-9aa5-5fc0e2ad64cb",
    "product": {
      "productId": "650c73c9-9406-4b5d-ad01-beec139e0478",
      "productName": "Paused Priority Ticket"
    },
    "quantity": 3,
    "unitPrice": 30,
    "totalAmount": 90,
    "orderStatus": "ordered",
    "remainingTokenBalance": 10,
    "orderedAt": "2026-08-20T06:08:26.880Z"
  }
}
```

The frontend must rely on this idempotency contract for safe retry behavior.

## Purchase Intent Lifecycle

Recommended frontend lifecycle:

1. User opens Order Confirmation.
2. User selects quantity.
3. User presses final `구매하기`.
4. Generate one UUID v4.
5. Freeze the request payload:
   - `productId`
   - `quantity`
6. Send the request using that idempotency key.
7. If the response is uncertain because of a network failure, retry the frozen payload with the same key.
8. When success/failure becomes conclusive, finish that purchase intent.
9. A later distinct purchase generates a new key.

If the user changes quantity before submitting, no key needs to exist yet.

## Price Preview

The Store list provides `tokenPrice`.

The frontend may calculate a preview:

`tokenPrice × quantity`

This is presentation only.

Do not send `unitPrice` or `totalAmount` from the frontend.

Use the backend success response for the final charged amount.

## Balance

Before confirmation, the frontend may display the current balance from:

`GET /api/v1/users/me`

After success, use:

`remainingTokenBalance`

from the order response immediately.

Then invalidate/refetch the current-user balance and related history caches.

## Cache/Data Refresh After Success

Refresh/invalidate:

- `/api/v1/users/me`
- `/api/v1/users/me/orders`
- `/api/v1/users/me/token-logs`
- `/api/v1/products` when appropriate

This keeps the Store, Header/My Page balance, order history, and Token history consistent.

## Error Handling

Exact order failure mappings should follow confirmed backend error payloads.

Do not invent unsupported error codes.

For authentication failure:

- restore/refresh the Supabase session when supported
- redirect to `/login` if the user is no longer authenticated

For a network error where server-side completion is uncertain:

- do not create a new purchase intent automatically
- retry the same frozen payload with the same `Idempotency-Key`

For a conclusive failure followed by a user-modified request:

- create a new purchase intent
- generate a new UUID v4

# Global API Rules

## API Base URL

Use:

`NEXT_PUBLIC_API_BASE_URL`

Local development:

`http://localhost:4000/api/v1`

Build endpoint paths relative to this configured base URL.

Do not hardcode environment-specific backend origins in feature components.

## Response Envelope

All KSA backend responses use:

### Success

```json
{
  "resultType": "success",
  "error": null,
  "success": {}
}
```

### Failure

```json
{
  "resultType": "fail",
  "error": {
    "errorCode": "string",
    "reason": "string",
    "data": null
  },
  "success": null
}
```

Do not expect uppercase `SUCCESS` / `FAIL`.

## API Naming

API JSON uses camelCase.

Externally exposed enum-like values use lowercase snake_case.

Examples:

- `event_grant`
- `order_payment`
- `co_purchase`

Do not expose backend/Prisma enum casing directly in UI logic.

## Authentication

Public endpoints do not receive an Authorization header unless a page-specific contract requires otherwise.

Authenticated KSA requests use:

```text
Authorization: Bearer <SUPABASE_ACCESS_TOKEN>
```

Use the Supabase session as the source of the access token.

Do not manually persist bearer tokens outside the supported Supabase session flow.

## Supabase Boundary

Supabase is used for authentication only.

Do not call:

- `supabase.from(...)`
- Supabase Data API for KSA application data

All application data requests go through the NestJS API.

## Content Type

For JSON request bodies, send:

```text
Content-Type: application/json
```

GET requests without a body do not require `Content-Type`.

## Query Parameters

Only send parameters explicitly supported by the endpoint contract.

Do not invent frontend-only backend parameters.

Confirmed examples:

### News

Supported:

- `keyword`
- `category`
- `page`
- `limit`

### Store

Supported:

- `productType`
- `page`
- `limit`

Not supported:

- `keyword`

Unsupported query parameters may return HTTP 400 validation failures.

## Pagination

When an endpoint returns:

```json
{
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 42,
    "totalPages": 3
  }
}
```

use the returned values as the source of truth.

For filter/search changes:

- reset page to 1

Preserve relevant active filter/query state while navigating between pages.

## Timezone

API timestamps are ISO-8601 strings.

Convert user-facing date/time display to:

`Asia/Hong_Kong`

Do not mutate the raw API value before transport/caching.

## Plain-Text Content

News `content` and Store `description` are treated as plain text.

Do not render arbitrary HTML.

Preserve:

- line breaks
- Unicode
- emoji

For News content only, explicit `http://` and `https://` URLs may be safely linkified.

## Cache Invalidation

After successful order creation, refresh/invalidate relevant user data:

- current user
- My Orders
- My Token Logs
- Products when appropriate

This keeps:

- Token balance
- Order History
- Token History
- Store availability

consistent with backend state.

## Order Idempotency

Order creation requires:

```text
Idempotency-Key: <UUID_V4>
```

Generate with:

```ts
crypto.randomUUID();
```

Rules:

1. One purchase intent gets one key.
2. Retry of the exact same request reuses that key.
3. Do not generate a new key for an uncertain network retry.
4. A distinct later purchase gets a new key.

Do not send frontend-calculated price fields in the order body.

The backend is authoritative for:

- `unitPrice`
- `totalAmount`
- `remainingTokenBalance`

## Error Handling

Use confirmed backend `errorCode` values when implementing exact UI mappings.

Do not invent error codes.

Provide a safe generic Korean fallback for unexpected failures.

For authenticated endpoints:

- attempt supported session refresh behavior when applicable
- redirect to `/login` when the user is no longer authenticated

For public endpoints:

- do not redirect to Login simply because the data request failed

## Security

Do not expose:

- service-role secrets
- backend-only credentials
- private environment variables
- database credentials

Only browser-safe `NEXT_PUBLIC_*` values may be exposed to client code.

Do not log:

- passwords
- invitation raw tokens
- access tokens
- sensitive authentication payloads
