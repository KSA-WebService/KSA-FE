# Page 1 — Home

## Purpose

Home is the default entry page for all visitors, regardless of authentication state.

Unauthenticated users must not be redirected to the Login page automatically.

Route:

`/`

The Home page should:

- provide a strong KSA brand experience
- surface the latest News
- surface Store content
- provide clear navigation to News, Store, Login, or My Page

## Page Structure

1. Header
2. Video Hero
3. News Preview
4. Store Preview
5. Footer

The following sections may be added in a later release, but are out of scope for the MVP:

- Calendar
- Saved Posts / Favorites

## Video Hero

Use the supplied HKUST drone campus video as the Hero.

Playback behavior:

- autoplay
- muted
- `playsInline`
- no loop
- play once
- remain on the final frame after playback ends

Do not re-edit the source video only to remove the encoded top/bottom black letterbox.

For the desktop MVP, crop the encoded letterbox through the frontend layout using a wide Hero container, `object-fit: cover`, and `overflow: hidden`.

Do not use scroll-driven video playback or parallax video control in the MVP.

For `prefers-reduced-motion`, a poster/final-frame fallback may be shown instead of autoplaying the video.

## Home Header

While the Header overlaps the Hero, use a transparent style.

Logged out:

- KSA logo
- News
- Store
- 로그인

Logged in:

- KSA logo
- News
- Store
- user icon + display name

The user control opens a dropdown containing:

- 마이페이지
- 로그아웃

After the user scrolls beyond the Hero, transition the Header to a light background with dark text.

## News Preview

Show the latest 3 published News posts.

Each card may use:

- Representative Image
- Category
- Title
- Event Date or Published Date
- Members Only badge

Date priority:

1. If `eventStartAt` exists, display the event date.
2. Otherwise display `publishedAt`.

Display all dates/times in `Asia/Hong_Kong`.

When a post has multiple categories, show at most two category badges in the Home preview.

Category UI labels:

- `event` → 행사
- `announcement` → 공지
- `career` → 커리어
- `partnership` → 제휴
- `co_purchase` → 공동구매
- `alumni` → Alumni

If `representativeImage` is null, do not require another uploaded asset.

Render a quiet frontend-generated branded placeholder that matches the KSA visual language.

Provide a `View all` action that opens `/news`.

## Store Preview

Show the latest 3 published products.

Each card may use:

- Product Image
- Product Name
- Token Price
- Availability

Do not show the full product description on Home.

Token price example:

`🪙 10 Tokens`

Products with `availabilityStatus = unavailable` remain visible.

Show a clear unavailable state such as:

`현재 주문 불가`

Home product cards do not open a separate Product Detail page in the MVP.

Provide a `View all` action that opens `/store`.

## Footer

Display the following:

- HKUST Korean Students Association
- Instagram · @hkustsu_ksa
- Clear Water Bay, Kowloon, Hong Kong
- © 2026 HKUST Korean Students Association

The Instagram handle should link to the KSA Instagram profile and open in a new tab.

# Page 2 — Login

## Purpose

The Login page allows an existing KSA member to authenticate with their email and password.

There is no public registration flow.

Route:

`/login`

## Authentication Rules

Login uses Supabase email/password authentication.

The Login page must not provide:

- public Sign Up
- Forgot Password
- Remember Me

Password reset is intentionally out of scope for the MVP.

After successful authentication:

1. create the Supabase session
2. return the user to Home (`/`)
3. allow the shared Header to reflect the authenticated state

If an already-authenticated user opens `/login`, redirect them to `/`.

## Design Direction

Use the supplied original HKUST campus photograph as a full-page background asset.

Do not permanently edit the source image.

Apply visual treatment through CSS so the image can be tuned without modifying the original asset.

Recommended treatment:

- slightly reduced brightness
- slightly reduced saturation
- subtle cool tone
- soft dark/neutral gradient near the Login card
- preserve the red campus sculpture as the main visual focal point

For the first implementation, place the Login card on the right side of the desktop layout so the central sculpture remains visible.

The position should remain easy to adjust after visual QA.

## Login Card

Use a warm white / ivory surface with high readability.

Avoid excessive glassmorphism.

Content:

- title: `로그인`
- supporting text: `KSA 회원 계정으로 로그인해주세요.`
- email field
- password field
- password show/hide control
- primary action: `로그인`

Do not show a Sign Up action.

## Error and Loading Behavior

For invalid credentials, show a user-friendly Korean message such as:

`이메일 또는 비밀번호를 확인해주세요.`

Do not expose raw Supabase error strings when a clearer user-facing message is appropriate.

While submitting:

- disable the Login button
- prevent duplicate submission
- show an appropriate loading label such as `로그인 중...`

Pressing Enter should submit the form.

# Page 3 — Account Activation

## Purpose

This page completes invitation-based account activation for a whitelisted KSA member.

There is no public sign-up flow.

The user reaches this page through the invitation link sent by KSA administration.

Recommended route:

`/signup/invitation?token={invitationToken}`

The page title shown to the user should be:

`계정 활성화`

The primary completion action should be:

`가입 완료하기`

## Activation Flow

1. Read the invitation token from the URL query string.
2. Verify the invitation through the backend.
3. Show the verified member information as read-only fields.
4. Let the user set and confirm a password.
5. Require privacy consent.
6. Submit onboarding completion.
7. Sign the user in with Supabase email/password authentication.
8. Navigate to Home (`/`).

Do not send the user to the Login page after successful activation unless automatic sign-in fails.

## Verified Member Information

Display the following verified values as read-only:

- 이름
- 이메일
- 학번

The user must not edit these values during onboarding.

The values come from the invitation verification response.

## Password

Inputs:

- 새 비밀번호
- 새 비밀번호 확인

The confirmation field is frontend-only and is not sent to the backend.

Show/hide controls should be available for both password fields.

Show the following concise password guidance:

`8자 이상 · 영문 대/소문자, 숫자, 특수문자 각 1개 이상 · 공백 불가`

The backend remains the final source of truth for password validation, including its maximum-length constraint.

If the password confirmation does not match, show:

`비밀번호가 일치하지 않습니다.`

## Password Reset Notice

The MVP does not provide password reset.

Show the following informational notice near the password fields:

`현재 비밀번호 재설정 기능은 제공되지 않습니다. 설정한 비밀번호를 꼭 기억해주세요.`

This notice should use a calm information/warning treatment, not an error-red treatment.

## Privacy Consent

Privacy consent is required before activation can be completed.

Checkbox label:

`개인정보 수집 및 이용에 동의합니다.`

The completion button must remain disabled until the checkbox is checked.

The frontend sends:

`agreedPrivacy: true`

Do not submit `false`.

If a separate approved privacy notice or policy page is added later, the checkbox label may link to it without changing the onboarding API contract.

## Invitation States

Only a valid invitation should display the activation form.

While verification is in progress, show:

`초대 정보를 확인하고 있습니다...`

If verification fails, do not display an editable activation form.

Use user-friendly Korean error states based on the backend error returned by the invitation verification endpoint.

Do not invent backend error codes in the frontend.

Typical presentation may include:

- invalid invitation
- expired invitation
- already-used invitation

Exact message mapping should follow confirmed backend error responses.

## Design Direction

Use the same authentication visual family as the Login page:

- supplied original HKUST campus photograph
- colorful KSA logo
- right-side desktop card
- warm white / ivory card surface
- subtle CSS image treatment
- preserve the central red sculpture where possible

The activation card may be slightly wider/taller than the Login card because it contains verified profile information, two password fields, privacy consent, and an informational notice.

# Page 4 — My Page

## Purpose

My Page is the authenticated member's personal account area.

It is read-only in the MVP.

Users can:

- view their profile information
- view their current Token balance
- review their order history
- review their Token transaction history

Users cannot:

- edit profile fields
- change order status
- edit Token history
- manually modify Token balance

Route:

`/mypage`

Authentication is required.

## Page Structure

1. Shared authenticated Header
2. My Page heading
3. Member Summary
4. History Tabs
   - 주문 내역
   - 토큰 내역

Use tabs instead of stacking both full history tables vertically.

This keeps the page compact and scales better as history grows.

## Member Summary

Use `GET /api/v1/users/me`.

Display:

- 이름
- 이메일
- 학번
- 보유 토큰

Do not display internal/account-policy fields that do not help the member, including:

- `userId`
- `role`
- `status`
- `agreedPrivacy`
- `agreedAt`

Token balance should be visually emphasized.

Example:

`100 Tokens`

The summary is read-only.

## Order History

Use `GET /api/v1/users/me/orders`.

Recommended primary columns:

- 주문번호
- 상품
- 수량
- 결제 토큰
- 주문일
- 상태

Field mapping:

- 주문번호 → `orderId`
- 상품 → `product.productName`
- 수량 → `quantity`
- 결제 토큰 → `totalAmount`
- 주문일 → `orderedAt`
- 상태 → `orderStatus`

Recommended status labels:

- `ordered` → 주문 접수
- `accepted` → 주문 확인
- `delivered` → 전달 완료
- `canceled` → 취소

Do not expose order-management actions.

### Order Row Details

Allow a row to expand for additional read-only information when available:

- 단가 → `unitPrice`
- 주문 확인 일시 → `acceptedAt`
- 전달 완료 일시 → `deliveredAt`
- 취소 일시 → `canceledAt`
- 취소 사유 → `cancellationReason`

Cancellation reason is important member-facing information and should remain visible for canceled orders.

Display the order ID compactly in the main table and provide a copy action for the full ID.

## Token History

Use `GET /api/v1/users/me/token-logs`.

Recommended columns:

- 일시
- 구분
- 내역
- 변동
- 사유
- 잔액

Field mapping:

- 일시 → `createdAt`
- 구분 → `transactionType`
- 내역 → derived display value
- 변동 → `delta`
- 사유 → `reason`
- 잔액 → `balanceAfter`

### Transaction Type Labels

Confirmed values:

- `event_grant` → 이벤트 지급
- `event_adjustment` → 이벤트 조정
- `order_payment` → 주문 결제
- `order_refund` → 주문 환불
- `reset` → 잔액 초기화

Keep the renderer extensible for future transaction types.

### Transaction Description

For the `내역` column:

1. If `tokenEvent` exists, show `tokenEvent.eventName`.
2. Else if `order` exists, show `order.productName`.
3. Otherwise show `—`.

### Token Delta

Always make the direction explicit:

- positive values include `+`
- negative values keep `-`
- zero remains `0`

Examples:

- `+3`
- `-10`
- `0`

Use restrained visual emphasis for positive/negative changes.

Do not rely on color alone to communicate direction.

### Current Balance Source

Use `/api/v1/users/me` → `tokenBalance` for the Member Summary.

The Token Logs response also includes `currentTokenBalance`, but the My Page summary should use one canonical source rather than switching between endpoints.

## Pagination

Both Order History and Token History support server-side pagination.

Preserve separate page state for each tab.

Changing pagination in one history tab should not unnecessarily reset or mutate the other tab's data.

Use backend pagination metadata as the source of truth.

## Date and Time

Display user-facing dates/times in `Asia/Hong_Kong`.

Use a concise, readable format consistent across the user frontend.

## Empty States

Order History:

`아직 주문 내역이 없습니다.`

Token History:

`아직 토큰 내역이 없습니다.`

Do not treat an empty history as an error.

# Page 5 — News List

## Purpose

The News page is the public browsing page for all published KSA posts.

Authentication is not required.

Route:

`/news`

The page should help users quickly browse and discover KSA content through:

- keyword search
- category filtering
- card-based content browsing
- pagination

`membersOnly = true` does not restrict public reading.

Use the badge label:

`Members Only`

Do not use `회원 전용`.

## Page Structure

1. Shared public/auth-aware Header
2. News page heading
3. Search and category controls
4. News card grid
5. Pagination
6. Shared Footer

## Search

Use the backend `keyword` query parameter.

Search should:

- update after a short debounce
- preserve input focus while results refresh
- reset pagination to page 1 when the keyword changes
- be combinable with the category filter

Do not add a sort control unless a backend contract is added later.

Use the backend's default result ordering.

## Category Filter

Use a single active category filter.

Recommended UI labels:

- 전체
- 행사
- 공지
- 커리어
- 제휴
- 공동구매
- Alumni

API values:

- 전체 → no `category` query parameter
- 행사 → `event`
- 공지 → `announcement`
- 커리어 → `career`
- 제휴 → `partnership`
- 공동구매 → `co_purchase`
- Alumni → `alumni`

Use a horizontal chip/tab treatment rather than a permanent left sidebar for the desktop MVP.

Changing category should reset pagination to page 1.

Keyword and category filters may be applied together.

## News Cards

Use a visually engaging editorial card grid rather than a table.

Each card may display:

- representative image or branded placeholder
- up to two category badges
- `Members Only` badge when `membersOnly = true`
- title
- event date/time when available
- otherwise published date

Clicking a card opens:

`/news/{postId}`

All cards remain clickable regardless of authentication state.

## Date Display

Date priority:

1. If `eventStartAt` exists, display event timing.
2. If `eventStartAt` and `eventEndAt` both exist, a concise range may be displayed.
3. Otherwise display `publishedAt`.

Display all dates/times in `Asia/Hong_Kong`.

The card should make it visually clear whether the shown date is an event date or publication date when ambiguity would otherwise occur.

## Image Behavior

If `representativeImage` exists:

- use the provided `fileUrl`
- use a consistent card image area
- `object-cover` is acceptable for list thumbnails

If `representativeImage` is null:

- render the shared quiet branded placeholder
- do not require a separate uploaded fallback image

## Members Only Policy

`Members Only` is informational.

It communicates that the activity, benefit, application, or eligibility may be limited to KSA members.

It does not block:

- list visibility
- detail visibility
- reading the post content

Do not redirect logged-out users when they open a Members Only post.

## Pagination

Use backend pagination metadata.

Preserve active keyword and category state while changing pages.

When keyword or category changes:

- reset to page 1

Keep page heading, search, and category controls mounted while results refetch.

Only the card-result area should show loading/fetching feedback.

## Empty State

When no News matches the active search/filter:

`조건에 맞는 소식이 없습니다.`

If there are no published posts at all:

`아직 등록된 소식이 없습니다.`

## Future Scope

The following are not part of this MVP:

- favorites/saved posts
- calendar integration on the News page
- sort controls
- member-only content blocking

# Page 6 — News Detail

## Purpose

The News Detail page presents the full content of a published KSA post.

Authentication is not required.

Route:

`/news/{postId}`

Posts with `membersOnly = true` remain publicly readable.

Use the badge label:

`Members Only`

The badge is informational only and must not block access to the page.

## Page Structure

1. Shared public/auth-aware Header
2. Back to News navigation
3. Post metadata
4. Title
5. Event information when applicable
6. Image gallery
7. Post content
8. Shared Footer

## Post Metadata

Display:

- category badges
- optional `Members Only` badge
- publication date

Use the same category labels as the News List:

- `event` → 행사
- `announcement` → 공지
- `career` → 커리어
- `partnership` → 제휴
- `co_purchase` → 공동구매
- `alumni` → Alumni

Unlike list cards, the detail page may show all categories because space is not constrained.

## Title

Display the complete post title prominently.

Do not truncate the title on the detail page.

## Event Information

If `eventStartAt` exists, show a dedicated event-information block.

Display:

- event start
- event end when available

Use the structured API timestamps as the source of truth for the event-information UI.

Do not parse event dates from the free-text `content`.

Display structured timestamps in `Asia/Hong_Kong`.

If the free-text post body contains a different date/time, preserve the body exactly as authored rather than silently rewriting it.

## Images

Use the `images` array returned by the detail API.

Sort images by `sortOrder` ascending before rendering.

Example:

- `sortOrder: 1`
- `sortOrder: 2`
- `sortOrder: 3`

The News Detail page is a content-reading and verification surface.

Images must:

- preserve their full visible content
- preserve intrinsic aspect ratio
- not be cropped
- not be stretched
- remain sharp enough for poster text and QR codes to be readable

Do not use list-thumbnail `object-cover` behavior on the detail page.

For multiple images, use a clean gallery that preserves the supplied order.

The gallery may use a stacked or compact multi-image layout, but the user must be able to see each full image.

## Post Content

Render `content` as readable plain text while preserving:

- line breaks
- paragraph spacing
- Unicode characters
- emoji
- bullet-like text written by the author

Do not render user-authored HTML directly.

### External Links

Automatically detect `http://` and `https://` URLs in the plain-text content.

Render detected URLs as clickable links.

External links:

- open in a new tab
- use `target="_blank"`
- use `rel="noopener noreferrer"`

Do not convert arbitrary non-URL text into links.

## Members Only Policy

When `membersOnly = true`:

- show the `Members Only` badge
- allow logged-out visitors to read the title
- allow logged-out visitors to read the full content
- allow logged-out visitors to view all images
- do not redirect to Login

The badge indicates that participation, application, benefits, or eligibility may be limited to members.

## Back Navigation

Provide a visible:

`Back to News`

action that explicitly navigates to:

`/news`

Do not depend only on browser history.

## Date and Time

Display API timestamps in `Asia/Hong_Kong`.

Use a concise user-facing format consistent with the rest of the user frontend.

## Error State

If the post cannot be loaded:

- keep the shared Header/Footer where possible
- show a clear News-specific error state
- provide a retry action when appropriate

For a confirmed not-found response, provide a user-friendly not-found state and a route back to `/news`.

Do not redirect to Login for a public post-load failure.

# Page 7 — Store List

## Purpose

The Store page is the public browsing page for KSA Token Shop products.

Authentication is not required to browse products.

Route:

`/store`

The MVP intentionally does not provide product keyword search.

The expected product volume is small, and the backend does not support a `keyword` query parameter.

Users browse products through:

- product type filtering
- card-based product browsing
- pagination when needed

## Page Structure

1. Shared public/auth-aware Header
2. Store page heading
3. Product type filter
4. Product card grid
5. Pagination when needed
6. Shared Footer

## Product Type Filter

Use a single active filter.

UI labels:

- 전체
- 이용권
- 상품

API mapping:

- 전체 → omit `productType`
- 이용권 → `ticket`
- 상품 → `merchandise`

Use horizontal chips/tabs, consistent with the News page.

Changing the active type resets pagination to page 1.

Do not add a frontend keyword search box in the MVP.

## Product Cards

Each card should display:

- product image or shared branded placeholder
- product type label
- product name
- Token price
- product description
- availability state
- order action when available

Product type labels:

- `ticket` → 이용권
- `merchandise` → 상품

Token price example:

`10 Tokens`

A Token icon may be shown alongside the value if it fits the final visual language.

## Product Description

Descriptions may be longer than a typical card body.

Show a compact preview by default, approximately 2–3 lines.

If the description exceeds the preview:

- show `더보기`
- expand the description inside the same card
- allow the user to collapse it again with `접기`

Do not create a separate Product Detail route for the MVP.

Preserve authored line breaks when the description is expanded.

Do not render arbitrary HTML from the description.

## Availability

Supported values:

- `available`
- `unavailable`

For `available`:

- show the normal order action

Primary action:

`주문하기`

For `unavailable`:

- keep the product visible
- clearly show `현재 주문 불가`
- disable or omit the active order action

Do not hide unavailable products from the Store.

## Authentication and Ordering

Browsing is public.

If a logged-out user clicks `주문하기`:

- do not create an order
- direct the user to Login
- preserve a simple path back to the Store where practical

If an authenticated user clicks `주문하기`:

- open the Order Confirmation flow
- do not place the order immediately from the product card

The confirmation/order submission flow is defined separately in Page 8.

## Images

If `image` exists:

- use `image.fileUrl`
- use a consistent product-card image area
- avoid distortion

If `image` is null:

- use the shared frontend-generated branded placeholder
- do not require a separate fallback image asset

Card thumbnails may use controlled cropping when needed for a consistent grid, provided the product remains visually understandable.

## Pagination

The public Products API supports pagination.

Use backend pagination metadata as the source of truth.

The expected Store volume is small, so pagination controls should remain visually lightweight.

Do not render unnecessary pagination controls when there is only one page.

## Empty States

For a filtered product type with no results:

`해당 유형의 상품이 없습니다.`

If there are no published products at all:

`현재 등록된 상품이 없습니다.`

Do not treat an empty result as an error.

## Data Quality

The frontend must trust the API `productType` value for filtering and labels.

If an Admin-created product has a name that appears inconsistent with its `productType`, do not infer or silently correct the type from the product name or description.

Such inconsistencies should be corrected in Admin data rather than in frontend display logic.

# Page 8 — Order Confirmation

## Purpose

Order Confirmation is the authenticated purchase flow for a Store product.

It is implemented as a modal opened from `/store`, not as a separate Product Detail page.

The modal allows the user to:

- review the selected product
- choose quantity
- review the Token cost
- confirm the purchase
- see the completed order result

Authentication is required to create an order.

## Entry Behavior

From the Store:

### Logged-out user

If the user clicks `주문하기`:

- do not open an actionable purchase flow
- direct the user to `/login`
- return to Store after login where practical

### Logged-in user

If the user clicks `주문하기` on an available product:

- open the Order Confirmation modal
- do not create the order until the final confirmation button is pressed

Unavailable products must not open an active purchase flow.

## Confirmation Content

Show:

- product image
- product name
- product type
- unit Token price
- quantity selector
- total Token cost
- current Token balance
- estimated remaining balance

Recommended labels:

- 상품
- 가격
- 수량
- 보유 토큰
- 결제 토큰
- 예상 잔액

The frontend may calculate the preview total as:

`tokenPrice × quantity`

The backend response remains authoritative for the final:

- `unitPrice`
- `totalAmount`
- `remainingTokenBalance`

## Quantity

Quantity must be a positive integer.

Minimum:

`1`

Recommended UI:

- minus button
- numeric quantity value/input
- plus button

Do not allow:

- zero
- negative values
- decimals
- non-numeric input

Do not invent a frontend maximum quantity if the API does not expose one.

The backend remains authoritative for inventory/order constraints.

## Balance Preview

Use the authenticated user's current balance from:

`GET /api/v1/users/me`

Display:

- current balance
- total expected cost
- estimated remaining balance

If the frontend-calculated expected total already exceeds the current balance:

- disable the final purchase action
- show a clear insufficient-balance message

The backend must still validate the balance again during order creation.

## Final Confirmation

Primary action:

`구매하기`

Secondary action:

`취소`

The final `구매하기` action creates one purchase intent.

At that moment:

1. Generate one UUID v4 with `crypto.randomUUID()`.
2. Store it for that purchase attempt.
3. Send it as `Idempotency-Key`.
4. If the same request must be retried because the response is uncertain, reuse the same key.
5. Do not generate a new key for a retry of the same purchase intent.
6. Discard the key after the purchase attempt is conclusively completed or abandoned.

One purchase intent must correspond to one idempotency key.

## Idempotency

Confirmed behavior:

The same:

- `Idempotency-Key`
- `productId`
- `quantity`

sent again returns the same successful order result.

The confirmed retry returned:

- the same `orderId`
- the same order values
- the same `remainingTokenBalance`
- the same `orderedAt`

This prevents duplicate purchase processing when a client retries the same request.

## Submission State

While the purchase request is pending:

- disable quantity changes
- disable modal close if closing could make the request state unclear
- disable repeated purchase clicks
- show `구매 처리 중...`

Do not create another idempotency key during the same pending attempt.

## Success State

After a successful order, switch the modal to a success state.

Recommended title:

`주문이 완료되었습니다.`

Show:

- product name
- quantity
- total Token amount
- remaining Token balance
- shortened order ID with copy action

Primary follow-up:

`확인`

Optional secondary navigation:

`주문 내역 보기`

which opens `/mypage` with the Order History tab selected when practical.

Do not require a separate dedicated Order Detail page.

## Post-Success Refresh

After successful order creation, refresh or invalidate relevant frontend data:

- current user Token balance
- My Page order history
- My Page Token history
- Store products when useful

Use the server response `remainingTokenBalance` immediately in the success UI.

## Failure Behavior

Keep the modal open when retry is meaningful.

Possible failures include:

- insufficient Token balance
- product unavailable
- invalid quantity
- inventory/order conflict
- authentication/session failure
- idempotency validation failure
- unexpected network/server failure

Map exact messages from confirmed backend error codes.

Do not invent backend error codes in UI logic.

For an uncertain network failure after submission, a retry of the same purchase intent must reuse the original `Idempotency-Key`.

# Global Implementation Rules

## Scope

These rules apply across all user-facing frontend pages unless a page-specific specification explicitly overrides them.

The user-facing MVP includes:

1. Home
2. Login
3. Account Activation
4. My Page
5. News List
6. News Detail
7. Store List
8. Order Confirmation

## Route and Access Rules

Public routes:

- `/`
- `/login`
- `/signup/invitation`
- `/news`
- `/news/{postId}`
- `/store`

Authenticated route:

- `/mypage`

Order creation is authenticated even though Store browsing is public.

If an unauthenticated user attempts an authenticated action:

- do not execute the action
- direct the user to `/login`
- preserve a practical return path when useful

If an authenticated user opens `/login`, redirect to `/`.

## Authentication Boundary

Supabase is used for authentication only.

Use Supabase Auth for:

- email/password login
- authenticated session handling
- automatic sign-in after Account Activation
- access-token retrieval for authenticated backend requests

Do not use Supabase Data API for KSA application data.

Do not use:

- `supabase.from(...)`
- direct database reads/writes from the frontend
- manual application-data access through Supabase tables

All KSA application data must go through the NestJS backend API.

## API Boundary

Frontend API base URL is configured through:

`NEXT_PUBLIC_API_BASE_URL`

Local development example:

`http://localhost:4000/api/v1`

Do not hardcode the production backend origin inside page components.

All KSA backend responses use the shared envelope:

```json
{
  "resultType": "success",
  "error": null,
  "success": {}
}
```

or:

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

Externally exposed enum-like API values use lowercase snake_case.

## Language

Default user-facing language is Korean.

English may be used when it is intentionally part of the product language or more visually natural.

Confirmed English UI labels include:

- News
- Store
- My Page
- Members Only
- Alumni

Do not automatically translate API content written by administrators.

## Members Only Policy

`membersOnly = true` is informational.

It does not restrict public access to News list or News detail.

Logged-out users may:

- see Members Only posts
- open Members Only posts
- read their full content
- view their images

Use the display label:

`Members Only`

Do not use `회원 전용`.

## Timezone

Display application timestamps in:

`Asia/Hong_Kong`

Convert ISO-8601 API timestamps for user-facing display.

Do not assume the browser's local timezone is Hong Kong.

For News event metadata, structured API fields are authoritative:

- `eventStartAt`
- `eventEndAt`

Do not infer structured event times from free-text content.

## MVP Scope

The MVP is desktop-first.

Build graceful responsive behavior where practical, but do not introduce a separate mobile redesign unless required later.

Out of scope for the initial user frontend:

- public Sign Up
- password reset
- Product Detail page
- Order Detail page
- Saved/Favorite posts
- Calendar section
- Store keyword search
- direct user profile editing

## Safety and Data Integrity

Frontend calculations are previews only when the backend owns the authoritative value.

Examples:

- Store total Token cost
- expected remaining Token balance

The backend response remains authoritative after submission.

Do not infer or silently repair inconsistent backend data from names or descriptions.

Data-quality corrections belong in Admin/backend data management.
