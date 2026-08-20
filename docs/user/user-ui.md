# Page 1 — Home

## Route

`/`

Authentication is not required.

## Header

### Logged Out

Left:

- Color KSA logo

Right:

- News
- Store
- 로그인

### Logged In

Left:

- Color KSA logo

Right:

- News
- Store
- User icon
- User display name

The user control opens a dropdown:

- 마이페이지
- 로그아웃

Do not show a public Sign Up button.

### Hero Header Style

While overlapping the Hero:

- transparent background
- white navigation text
- subtle readability treatment if required by the current video frame

After leaving the Hero:

- light background
- dark text
- subtle bottom border or shadow
- smooth transition

## Hero

Use the supplied HKUST campus video.

Desktop-first behavior:

- Fill the usable browser width.
- Crop the encoded black letterbox through the container/layout.
- Do not distort the video.
- Do not show black bars inside the visible Hero.
- Do not loop.

Playback:

1. Page loads.
2. Video autoplays muted.
3. Video plays once.
4. Video remains on its final frame.

Do not add another large headline over the existing `WELCOME TO HKUST` animation.

## News Section

Section heading:

`News`

Show up to 3 cards.

Card content:

1. Representative image or placeholder
2. Category badges
3. Title
4. Date
5. Optional `회원 전용` badge

Use a clean editorial card layout rather than an admin-style table/card layout.

Image behavior:

- Prefer a 4:5 presentation where appropriate.
- `object-cover` may be used for Home preview thumbnails.
- Keep the card layout visually consistent.

Hover:

- subtle elevation
- optional small image-scale or border transition
- no strong glow effect

Clicking a News card opens:

`/news/{postId}`

Members-only cards remain clickable for logged-out users.

Section action:

`View all →`

opens:

`/news`

## Store Section

Section heading:

`Store`

Show up to 3 products.

Card content:

- image
- product name
- token price
- availability

Do not show the full description on Home.

Unavailable products remain visible with a muted unavailable state.

Example:

`현재 주문 불가`

Product cards do not navigate to a separate Product Detail page in the MVP.

Section action:

`View all →`

opens:

`/store`

## Branded Placeholder

If a News representative image or Product image is missing, generate the placeholder in the frontend.

The placeholder should:

- use a neutral KSA-compatible background
- remain visually quiet
- not look like an error state
- avoid a large colorful logo that competes with real content
- require no separate uploaded image asset

## Motion

Allowed:

- smooth Header background transition
- subtle section fade-up
- subtle stagger for News/Store cards
- small hover elevation

Avoid:

- scroll-jacking
- scroll-controlled video playback
- strong parallax
- repeated neon glow
- excessive animation

## Footer

Display:

- HKUST Korean Students Association
- Instagram · @hkustsu_ksa
- Clear Water Bay, Kowloon, Hong Kong
- © 2026 HKUST Korean Students Association

Instagram opens in a new tab.

# Page 2 — Login

## Route

`/login`

## Layout

Desktop-first full-screen composition.

Background:

- supplied original HKUST campus image
- fill the viewport
- use CSS positioning/cropping rather than permanently editing the image
- preserve the central red sculpture where possible

Place the Login card on the right side for the first implementation.

The card should not cover the main sculpture.

## Brand Element

Show the colorful KSA logo in the upper-left area.

The logo acts as a Home link to `/`.

Do not add a redundant Back button unless visual QA shows that one is necessary.

## Login Card Content

Title:

`로그인`

Supporting text:

`KSA 회원 계정으로 로그인해주세요.`

Fields:

- `이메일`
- `비밀번호`

Password field:

- provide a show/hide icon control

Primary button:

`로그인`

Do not show:

- 회원가입
- 비밀번호 찾기
- Remember Me

## Interaction

Submit via:

- Login button
- Enter key

During submission:

- disable inputs/actions as appropriate
- prevent duplicate requests
- show `로그인 중...`

Invalid credentials:

`이메일 또는 비밀번호를 확인해주세요.`

Unexpected service/network errors should use a general Korean service-error message rather than raw provider text.

## Authenticated Access

If a valid authenticated session already exists and the user opens `/login`, redirect to `/`.

## Success

After successful login:

- establish the Supabase session
- navigate to `/`
- authenticated Home Header should show the user menu instead of `로그인`

# Page 3 — Account Activation

## Route

`/signup/invitation?token={invitationToken}`

Authentication is not required to open the page.

## Initial State

When the page loads:

1. Read `token` from the URL.
2. Call the invitation verification API.
3. Keep the form hidden until verification succeeds.

Loading text:

`초대 정보를 확인하고 있습니다...`

If the URL does not contain a token, show an invalid-invitation state rather than an empty form.

## Layout

Use the same full-screen HKUST background style as Page 2 — Login.

For the first desktop implementation:

- keep the colorful KSA logo in the upper-left
- use the logo as a Home link
- place the activation card on the right
- avoid covering the central red sculpture
- use CSS-based image toning rather than editing the original image asset

## Card Header

Title:

`계정 활성화`

Supporting text:

`초대받은 정보를 확인하고 비밀번호를 설정해주세요.`

## Verified Information

Show these as clearly read-only fields:

- 이름
- 이메일
- 학번

The values must come from the verified invitation response.

Do not allow editing.

Use a visual treatment that clearly distinguishes these fields from editable password inputs.

## Password Inputs

Fields:

- `새 비밀번호`
- `새 비밀번호 확인`

Both fields should support show/hide password controls.

Helper text:

`8자 이상 · 영문 대/소문자, 숫자, 특수문자 각 1개 이상 · 공백 불가`

If the values do not match:

`비밀번호가 일치하지 않습니다.`

Do not submit until the frontend confirmation check passes.

## Password Reset Notice

Display a compact informational notice:

`현재 비밀번호 재설정 기능은 제공되지 않습니다. 설정한 비밀번호를 꼭 기억해주세요.`

Use a muted amber/information treatment.

Do not style this as a form validation error.

## Privacy Consent

Required checkbox:

`개인정보 수집 및 이용에 동의합니다.`

The primary action remains disabled until privacy consent is checked.

## Primary Action

Button label:

`가입 완료하기`

Disable the button when:

- invitation verification has not succeeded
- password is invalid
- password confirmation does not match
- privacy consent is not checked
- submission is already in progress

During submission:

`가입 처리 중...`

Prevent duplicate submission.

## Success Behavior

After onboarding succeeds:

1. use the verified email and submitted password to sign in with Supabase
2. establish the authenticated session
3. navigate to `/`

Do not require the user to enter the password again on the Login page.

## Failure Behavior

If onboarding fails:

- keep the user on the activation page when retry is meaningful
- preserve safe form state where appropriate
- show a clear Korean error message
- do not expose raw backend/provider error text when a clearer user-facing message exists

If the invitation can no longer be used, replace the form with an invitation-state message.

Exact backend error-code mapping should be added only after the relevant failure responses have been confirmed.

## Home Link

The KSA logo links to `/`.

Do not add a public Sign Up link.

# Page 4 — My Page

## Route

`/mypage`

Authentication is required.

If no valid authenticated session exists, redirect to `/login`.

## Header

Use the shared authenticated user Header.

The user-menu dropdown should include:

- 마이페이지
- 로그아웃

The current My Page location may be indicated subtly.

## Page Layout

Use a centered desktop content container on the bright editorial user-page background.

Recommended structure:

1. `My Page` heading
2. Member Summary card
3. History tab control
4. Active history table/card
5. Pagination

Do not use the dense Admin page layout.

## Member Summary

Show a clean read-only summary.

Fields:

- 이름
- 이메일
- 학번
- 보유 토큰

Token balance should receive the strongest visual emphasis in the summary.

Example:

`100 Tokens`

Do not show edit controls.

## History Tabs

Tabs:

- `주문 내역`
- `토큰 내역`

Use either an underline tab or a restrained pill-tab style that fits the final user design.

Switching tabs should not navigate to a separate page.

## Order History Table

Columns:

- 주문번호
- 상품
- 수량
- 결제 토큰
- 주문일
- 상태

### Order ID

Display a shortened value in the table.

Example:

`0b317578…`

Provide a small copy action for the full ID.

### Order Status Badges

Display:

- `ordered` → 주문 접수
- `accepted` → 주문 확인
- `delivered` → 전달 완료
- `canceled` → 취소

Use subtle status styling.

### Expandable Details

Each order row may expand inline.

Show only available values:

- 단가
- 주문 확인 일시
- 전달 완료 일시
- 취소 일시
- 취소 사유

Use `—` for unavailable timestamps when a fixed layout requires a value.

Canceled orders must clearly show the cancellation reason.

There are no user-side status buttons.

## Token History Table

Columns:

- 일시
- 구분
- 내역
- 변동
- 사유
- 잔액

### Transaction Type

Display Korean labels:

- 이벤트 지급
- 이벤트 조정
- 주문 결제
- 주문 환불
- 잔액 초기화

### Transaction Description

Show:

- Token Event name when `tokenEvent` exists
- Product name when `order` exists
- `—` otherwise

### Delta

Examples:

- `+100`
- `+3`
- `-10`

Positive and negative values may use different restrained accent colors, but the `+` / `-` sign must always remain visible.

### Balance

Display `balanceAfter`.

## Loading Behavior

Keep the My Page heading, summary, and tab controls mounted while history queries refetch.

Only the active history content area should show loading/fetching feedback.

Avoid full-page unmount/remount behavior during pagination.

## Pagination

Use server-side pagination for both history tabs.

Pagination controls should be simple and consistent with the user-facing design.

When changing pages:

- keep the tab selected
- keep surrounding controls mounted
- scroll only if needed for usability

## Empty States

Order History:

`아직 주문 내역이 없습니다.`

Token History:

`아직 토큰 내역이 없습니다.`

Use calm empty-state styling.

## Error States

If profile loading fails, show a page-level retry state because the summary is core to My Page.

If only one history request fails, keep the rest of My Page visible and show a retry state only inside that history section.

Do not expose raw backend errors when a clearer Korean message can be shown.

# Page 5 — News List

## Route

`/news`

Authentication is not required.

## Shared Header

Use the shared user-facing Header.

Navigation:

- News
- Store
- Login or authenticated user menu

Indicate News as the active navigation item.

## Page Header

Title:

`News`

Use a clean editorial page heading with generous spacing.

Do not use the dense Admin page-header style.

## Search

Recommended placeholder:

`소식 검색`

Use a debounced search input.

Requirements:

- do not lose focus after the debounce/query update
- do not remount the whole page during search
- reset page to 1 when keyword changes
- reflect useful list state in URL search parameters

## Category Navigation

Display horizontal category chips/tabs:

- 전체
- 행사
- 공지
- 커리어
- 제휴
- 공동구매
- Alumni

Only one category is active at a time.

The selected category should be visually clear without heavy boxed styling.

Do not use a permanent left sidebar in the initial MVP.

## Result Layout

Use a responsive desktop-first card grid.

Recommended desktop behavior:

- 3 cards per row where space allows
- comfortable spacing
- consistent card proportions
- no admin-style table borders

Cards should feel editorial and content-focused.

## Card Content

Recommended order:

1. Representative image / placeholder
2. Category badges
3. Optional `Members Only` badge
4. Title
5. Event date/time or publication date

Show at most two category badges on the card.

Use these labels:

- 행사
- 공지
- 커리어
- 제휴
- 공동구매
- Alumni

`Members Only` should remain in English.

## Card Interaction

The entire card should be clickable.

Destination:

`/news/{postId}`

Hover may use:

- subtle elevation
- slight image scale
- subtle border/surface transition

Avoid:

- neon glow
- large motion
- distracting hover animation

## Loading Behavior

Initial load may show card skeletons.

During search, category change, or pagination:

- keep Header, title, search input, and category controls mounted
- preserve search focus
- keep previous result layout where appropriate
- show subtle result-area fetching feedback

Do not replace the full News page with a loading screen after every query change.

## Pagination

Use simple user-facing pagination.

Preserve:

- keyword
- category

while changing pages.

Changing keyword or category resets the page to 1.

## Empty States

Filtered/search empty state:

`조건에 맞는 소식이 없습니다.`

Global empty state:

`아직 등록된 소식이 없습니다.`

## Footer

Use the shared user Footer defined for Home.

# Page 6 — News Detail

## Route

`/news/{postId}`

Authentication is not required.

## Shared Header

Use the shared user-facing Header.

Keep `News` visually active.

## Main Content Width

Use a centered editorial reading container.

The layout should feel more like a publication/article page than an Admin detail page.

Recommended hierarchy:

1. Back to News
2. Category / Members Only metadata
3. Title
4. Event details
5. Images
6. Body content

## Back Navigation

Label:

`Back to News`

Destination:

`/news`

Use an explicit route rather than `router.back()` so behavior remains predictable when the page is opened directly.

## Metadata

Display category badges above or near the title.

If `membersOnly = true`, show:

`Members Only`

Keep the badge visually distinct but not alarming.

Also show the publication date in a restrained secondary style.

## Title

Display the full title.

Use strong typography and generous spacing.

Do not truncate.

## Event Information

When `eventStartAt` exists, show a compact event-information block.

Possible labels:

- 행사 시작
- 행사 종료

If `eventEndAt` is null, show only the start.

Use Hong Kong local time for structured event metadata.

The free-text body must remain unchanged even if it contains separately authored time information.

## Image Gallery

### Single Image

Show the full image at a comfortable reading width.

Do not crop.

### Multiple Images

Render in `sortOrder` order.

Use a clean gallery such as:

- a vertical stack, or
- a compact grid where each full image remains visible

Do not force all images into square crops.

Requirements:

- `object-contain` or equivalent full-image behavior
- preserve aspect ratio
- no stretching
- no misleading crop
- support readable poster text / QR codes

If image optimization is used, ensure the selected responsive size is large enough for text-heavy posters.

## Body Content

Render plain text with preserved line breaks and paragraph spacing.

Recommended CSS behavior:

- `white-space: pre-wrap` or an equivalent safe text rendering approach

Do not use `dangerouslySetInnerHTML` for post content.

### URL Linkification

Detect explicit:

- `http://...`
- `https://...`

Render them as clickable external links.

Use:

- `target="_blank"`
- `rel="noopener noreferrer"`

Style links clearly enough to be discoverable without overpowering the body text.

## Members Only

A Members Only post remains fully readable for logged-out users.

Do not show a Login wall.

Do not disable the page.

The badge is sufficient to communicate the post's member-related eligibility.

## Loading Behavior

Initial load may show a detail skeleton.

Keep the shared Header visible.

Do not flash Login UI for a public News request.

## Empty Image State

If `images` is empty:

- omit the gallery entirely
- do not show a broken-image placeholder inside the detail article

## Footer

Use the shared user Footer.

# Page 7 — Store List

## Route

`/store`

Authentication is not required.

## Shared Header

Use the shared user-facing Header.

Navigation:

- News
- Store
- Login or authenticated user menu

Indicate Store as the active navigation item.

## Page Header

Title:

`Store`

Use the same bright editorial design family as News, while allowing the product cards to feel slightly more commerce-oriented.

## Product Type Navigation

Display horizontal chips/tabs:

- 전체
- 이용권
- 상품

Only one type is active at a time.

Do not show a keyword search field in the MVP.

The Store is expected to contain a small number of products, and the backend does not support product keyword search.

## Product Grid

Use a desktop-first responsive card grid.

Recommended desktop behavior:

- 3 cards per row where space allows
- consistent image proportions
- comfortable spacing
- clean product-focused hierarchy

Avoid dense Admin-style cards.

## Product Card Content

Recommended order:

1. Product image / placeholder
2. Product type
3. Product name
4. Token price
5. Description preview
6. Availability / order action

### Product Type

Display:

- `ticket` → 이용권
- `merchandise` → 상품

### Token Price

Display prominently.

Example:

`10 Tokens`

Do not present Tokens as currency.

## Description

Default:

- clamp to approximately 2–3 lines

If truncated, show:

`더보기`

Expanded state:

- show the full plain-text description
- preserve line breaks
- show `접기`

Expansion happens inside the card.

Do not navigate to a Product Detail page.

## Available Product

Show:

`주문하기`

The action should be visually clear but should not immediately submit an order.

Authenticated user:

- opens Page 8 Order Confirmation flow

Logged-out user:

- is directed to Login before ordering

## Unavailable Product

Keep the card fully visible.

Show:

`현재 주문 불가`

The order button should be disabled or replaced with a non-interactive unavailable state.

Do not reduce opacity so much that the product becomes unreadable.

## Images

Use the API product image when available.

If no image exists, use the shared quiet branded placeholder.

For Store grid cards:

- controlled `object-cover` is acceptable
- preserve visual consistency
- avoid obvious distortion

## Loading Behavior

Initial load may use product-card skeletons.

During type-filter or pagination changes:

- keep Header, page title, and filter controls mounted
- keep previous layout stable where appropriate
- show loading only in the product-results area

## Pagination

Use simple pagination controls only when `totalPages > 1`.

Changing type resets to page 1.

Preserve the active product type while changing pages.

## Empty States

Filtered empty state:

`해당 유형의 상품이 없습니다.`

Global empty state:

`현재 등록된 상품이 없습니다.`

Use a calm empty-state presentation.

## Footer

Use the shared user Footer.

# Page 8 — Order Confirmation

## Surface

Order Confirmation is a modal opened from `/store`.

Do not navigate to a separate product-detail route.

## Modal Layout

Use a focused, compact purchase modal.

Recommended structure:

1. Product summary
2. Quantity selector
3. Token calculation summary
4. Final action row

Keep the visual language consistent with the public Store rather than the Admin interface.

## Product Summary

Show:

- product image
- product name
- type label
- unit price

Type labels:

- `ticket` → 이용권
- `merchandise` → 상품

Token price example:

`30 Tokens`

## Quantity Selector

Use:

`[-]  3  [+]`

Requirements:

- minimum 1
- integer only
- minus disabled at 1
- prevent invalid manual entry if an input is used

Do not expose a made-up maximum.

## Token Summary

Recommended rows:

- 보유 토큰
- 결제 토큰
- 예상 잔액

Example:

- 보유 토큰: `100`
- 결제 토큰: `90`
- 예상 잔액: `10`

Make the final cost visually clear.

If expected balance would be negative:

- show a clear insufficient-balance state
- disable `구매하기`

## Actions

Secondary:

`취소`

Primary:

`구매하기`

The primary action is the only action that creates the order.

Pressing it should immediately disable duplicate submission.

## Pending State

During the request:

- label: `구매 처리 중...`
- disable both quantity changes and duplicate purchase submission
- keep the modal state stable

Do not regenerate the idempotency key during a retry of the same purchase attempt.

## Success State

Replace the confirmation content with a compact success state.

Title:

`주문이 완료되었습니다.`

Show:

- product name
- quantity
- total Token amount
- remaining Token balance
- shortened order ID

Provide a copy icon/button for the full order ID.

Actions:

- `확인`
- optional `주문 내역 보기`

`주문 내역 보기` should navigate to `/mypage` and select Order History when practical.

## Error State

Show the error inside the modal.

Do not close the modal automatically on an order failure.

If retry is safe and the purchase intent is unchanged:

- keep the same quantity
- keep the same idempotency key
- allow retry

If the user intentionally changes the quantity after a conclusive failed/abandoned attempt:

- treat the next submission as a new purchase intent
- generate a new idempotency key

## Accessibility

The modal should:

- trap focus while open
- return focus to the triggering Store action on close
- support keyboard dismissal when no request is in an uncertain pending state
- provide accessible labels for plus/minus and copy actions

# Global UI Rules

## Visual Direction

Use a user-facing design language distinct from the Admin interface.

Primary direction:

`Cinematic Campus + Clean Editorial`

The user frontend should feel:

- polished
- calm
- contemporary
- content-focused
- recognizably KSA

Avoid:

- Admin-style dense tables outside history pages
- neon/gaming aesthetics
- excessive gradients
- heavy glassmorphism
- excessive animation
- scroll-jacking

## Color and Brand

Use the colorful KSA circular logo as the primary user-facing logo.

Use controlled neutrals and KSA brand accents around it.

Recommended visual balance:

- bright ivory/off-white page backgrounds
- white content surfaces
- restrained KSA green accents
- occasional deep blue/pink/cyan accents where appropriate

Do not make every interface element multicolored simply because the logo is colorful.

## Shared Header

The shared Header appears on Home, News, Store, My Page, and News Detail.

Primary navigation:

- News
- Store

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

Authenticated user dropdown:

- 마이페이지
- 로그아웃

The KSA logo links to `/`.

### Home Hero State

While overlapping the Home Hero:

- transparent background
- white navigation text

After scrolling beyond the Hero:

- light background
- dark text
- subtle transition

Other pages may use the light Header directly.

## Shared Footer

Display:

- HKUST Korean Students Association
- Instagram · @hkustsu_ksa
- Clear Water Bay, Kowloon, Hong Kong
- © 2026 HKUST Korean Students Association

Instagram opens in a new tab.

## Typography and Spacing

Prefer generous editorial spacing.

Use clear hierarchy:

- page heading
- section heading
- primary content
- metadata
- secondary information

Do not reproduce the dense Admin information hierarchy.

## Cards

News cards should feel editorial.

Store cards should feel product-focused.

Use:

- consistent image areas
- restrained hover elevation
- subtle borders/surfaces
- clear hierarchy

Avoid:

- strong glow
- large hover movement
- unnecessary card chrome

## Image Rules

### News List / Store List

Controlled thumbnail cropping is acceptable where needed for consistent card grids.

### News Detail

Do not crop post images.

Preserve:

- full visible image content
- aspect ratio
- readable poster text
- QR codes

Use `object-contain` or equivalent full-image behavior.

### Missing Images

Use a quiet frontend-generated branded placeholder.

Do not require a separate uploaded fallback image.

## Motion

Allowed:

- subtle fade-up
- light stagger
- Header transition
- small hover elevation
- minor image-scale transition

Avoid:

- scroll-controlled video
- large parallax
- looping Hero video
- repeated attention-grabbing animation

## Loading Behavior

Keep stable page structure mounted during refetches where practical.

Prefer section-local loading over full-page replacement.

Examples:

- keep search/filter controls mounted while News refetches
- keep My Page tabs mounted while history pages change
- keep Store filters mounted while products refetch

Use skeletons for initial content loading when helpful.

## Empty States

Empty results are not errors.

Use calm, page-specific empty states.

Examples:

- `조건에 맞는 소식이 없습니다.`
- `해당 유형의 상품이 없습니다.`
- `아직 주문 내역이 없습니다.`
- `아직 토큰 내역이 없습니다.`

## Error States

Do not show raw backend/provider errors when a clearer Korean message is available.

Keep unaffected parts of the page visible when only one section fails.

Provide retry actions where retry is meaningful.

## External Links

Explicit `http://` and `https://` URLs in plain-text News content may be linkified safely.

External links must:

- open in a new tab
- use `target="_blank"`
- use `rel="noopener noreferrer"`

Do not render arbitrary user-authored HTML.

## Accessibility

Interactive controls should:

- have accessible labels
- support keyboard interaction
- preserve focus where possible
- avoid relying on color alone for meaning

Dialogs/modals should:

- trap focus
- restore focus on close
- prevent duplicate destructive/submission actions while pending

## Date and Number Display

Display user-facing dates/times in Hong Kong time.

Use consistent formatting across pages.

For Token changes:

- positive values include `+`
- negative values retain `-`

Do not rely on color alone to show positive/negative direction.
