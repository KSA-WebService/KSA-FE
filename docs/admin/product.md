# Admin Product & Design Specification

## 1. Scope

This document defines the shared product, visual, interaction, and implementation principles for the KSA administrator frontend.

Page-specific behavior lives in:

- `admin-ui.md`
- `api-contract.md`

This file should not duplicate detailed API payloads. It defines the global rules that all admin pages should follow.

Recommended documentation structure:

    docs/
    ├─ admin/
    │  ├─ product.md
    │  ├─ admin-ui.md
    │  └─ api-contract.md
    └─ user/
       ├─ product.md
       ├─ user-ui.md
       └─ api-contract.md

The admin and user experiences should share the same KSA brand language, but their UX priorities are different:

- Admin: operational clarity, information density, safe mutations, fast repetitive work
- User: content discovery, brand expression, mobile-first browsing, simple interaction

Do not merge admin and user page specifications into one file set.

---

## 2. Overall Design Direction

Use a modern SaaS-admin structure with restrained KSA branding.

Target feeling:

- clean
- calm
- modern
- professional
- intentionally designed
- not visually noisy
- not overly corporate
- clearly connected to KSA

The UI should feel contemporary through spacing, typography, motion, and interaction rather than through heavy decoration.

Avoid:

- thick black borders
- every section being boxed
- strong shadows everywhere
- large saturated green backgrounds
- excessive gradients
- large animation on ordinary buttons
- old-style table grids with borders around every cell
- decorative elements that reduce readability

---

## 3. KSA Brand Palette

Primary KSA palette:

| Token       | Hex       | Suggested Use                                                 |
| ----------- | --------- | ------------------------------------------------------------- |
| `brand-100` | `#c2f4e7` | soft tint, selected background, subtle highlight              |
| `brand-300` | `#5ecfb7` | secondary accent, charts, decorative detail                   |
| `brand-500` | `#1ea185` | active accent, icon emphasis, links                           |
| `brand-800` | `#0f715b` | primary button, strong active text, accessible brand emphasis |

Recommended supporting neutrals:

| Token            | Suggested Value | Use                                  |
| ---------------- | --------------- | ------------------------------------ |
| `page-bg`        | `#F8F6F1`       | main admin page background           |
| `surface`        | `#FFFFFF`       | cards, tables, dialogs, inputs       |
| `surface-muted`  | `#F7FAF9`       | subtle secondary surfaces            |
| `border`         | `#E4E9E6`       | light dividers and component borders |
| `text-primary`   | `#17211E`       | primary text                         |
| `text-secondary` | `#68736F`       | secondary text                       |
| `text-muted`     | `#8B9490`       | metadata and placeholders            |

Use semantic colors separately for:

- success
- warning
- destructive/error
- information

Do not force every status into the KSA green palette.

### Color Usage Principle

Do not use the four KSA greens as full-page background colors.

Use brand colors selectively for:

- primary buttons
- active navigation
- links
- focused inputs
- selected states
- status accents where semantically appropriate
- small decorative surfaces

This keeps the interface branded without becoming visually saturated.

---

## 4. Background Strategy

### Standard Admin Pages

Use a very light warm ivory/off-white base:

`#F8F6F1`

Recommended structure:

- page background: warm ivory
- sidebar: white or near-white
- content cards/tables: white
- brand green used only for emphasis

This is preferred over applying the mint gradient image at 50% opacity behind every page.

Reason:

- tables remain easier to read
- form fields remain clear
- status colors remain distinguishable
- the interface feels more modern and less washed-out
- warm ivory complements the KSA greens without competing with them

### Mint Gradient Artwork

The supplied mint gradient can still be used as a decorative brand asset, but not as the constant background behind dense admin tables.

Preferred uses:

- admin login
- dashboard hero/header region
- empty states
- subtle decorative corner treatment
- large low-information sections

When possible, reproduce the visual feeling with lightweight CSS radial gradients instead of a large raster background.

Keep the effect very subtle.

### Campus Image / Motion Background

The HKUST campus image may be used for the first-entry experience, especially:

- Admin Login background
- Dashboard hero area

Do not keep a photographic/video background behind operational tables such as Users, Orders, Token Grants, Products, or Logs.

#### Optional 2–4 Second Motion Intro

A short motion version of the campus image is supported.

Preferred behavior:

- play once when the entry page mounts
- muted
- inline playback
- no controls
- no continuous loop unless the final footage loops naturally
- freeze into the final frame/poster after playback
- use `object-fit: cover`
- include a still poster fallback

The motion should feel like a subtle lateral/perspective camera move rather than a dramatic transition.

A 2-second clip is possible. A 3–4 second clip is preferred if the 2-second movement feels abrupt.

Respect `prefers-reduced-motion`:

- do not autoplay motion for users who request reduced motion
- show the static poster instead

Keep video size small enough that the login/landing page still loads quickly.

---

## 5. Logo

Use the supplied KSA logo in the upper-left of the admin shell.

Guidelines:

- preserve transparent background
- do not distort aspect ratio
- leave sufficient breathing room
- do not place it inside a heavy bordered box
- use the logo as the main brand anchor instead of decorating every component with green

Desktop sidebar logo area should remain visually simple.

---

## 6. Typography

Primary recommendation:

`Pretendard`

Fallback stack:

    Pretendard, Inter, "Noto Sans KR", system-ui, sans-serif

Use one consistent UI family rather than mixing decorative fonts inside the admin application.

Recommended hierarchy:

- Page title: 28–32px, 700
- Section heading: 18–20px, 600–700
- Table/body: 14–15px, 400–500
- Button: 14px, 600
- Metadata/helper: 12–13px, 400–500

Use weight and spacing for hierarchy before increasing font size.

Avoid excessive bold text.

---

## 7. Admin Shell

### Desktop Layout

Use:

- fixed/sticky left sidebar
- flexible main content region
- full-width content for table-heavy pages

Recommended desktop sidebar width:

220–240px

Main content should use the available screen width rather than a narrow centered container.

Use reasonable page padding, approximately:

24–32px

Narrow screens/forms may use their own max-width.

### Sidebar Structure

Keep sidebar navigation minimal.

Do not make every navigation item look like a bordered button.

Preferred appearance:

- logo at top
- navigation groups separated only when useful
- thin divider lines between major sections if needed
- small outline icon + text
- no heavy rectangular boxes
- generous vertical rhythm

Recommended icons:

- Dashboard → Home
- Users → Users
- Posts → FileText / Newspaper
- Token → Coins
- Whitelist → UserCheck
- Orders → ShoppingBag
- Products → Package
- Logs → History / ScrollText

Use one consistent outline icon family, preferably Lucide.

### Sidebar Active State

Avoid a large solid active button.

Use:

- `brand-800` text
- `brand-500` icon
- slightly stronger font weight
- optional slim 2–3px left active indicator
- optional extremely light brand tint

The label itself remains the primary visual element.

### Sidebar Hover Motion

Sidebar navigation should have a subtle floating response.

Recommended hover:

- translate horizontally by approximately 3–4px
- optional upward movement of at most 1px
- color transition toward brand green
- optional very soft background tint

Timing:

120–180ms

Use smooth easing.

Do not create layout shift.

The animation should feel responsive, not playful.

---

## 8. Header and Account Controls

Shared admin header may contain:

- page title / context
- `Hi, {adminName}` where appropriate
- Log Out
- page-specific primary actions

Avoid green pill-shaped greeting boxes unless they serve a functional purpose.

Use greeting as simple text or lightweight account control.

Log Out should remain visually secondary.

---

## 9. Spacing and Density

Use Comfortable density.

The UI should fit substantial information on one screen while remaining easy to scan.

Tables may contain:

- name + email on two lines
- primary value + secondary metadata
- compact status badges

Avoid both extremes:

- overly compressed enterprise-table density
- oversized consumer-app spacing

---

## 10. Border Radius

Use radius only where it improves usability or grouping.

Recommended:

- buttons: 8px
- inputs/selects: 8px
- cards/dialogs: 10–12px
- status badges: pill
- image thumbnails: 8–10px

Sidebar navigation does not need a visible rounded box around every item.

Category/filter controls may use compact rounded controls where selection needs to be obvious.

Avoid making the entire admin interface pill-shaped.

---

## 11. Borders and Shadows

Prefer:

- subtle 1px borders
- very light shadows only when elevation is useful

Recommended component style:

- cards: light border + almost imperceptible shadow
- tables: surface with subtle outer border
- dialogs: slightly stronger shadow than cards
- inputs: border-based

Do not use heavy drop shadows.

Static cards should not all look like floating tiles.

---

## 12. Buttons

### Primary

Use `brand-800` with white text.

Examples:

- Save
- Publish
- Create
- Add Student
- New Product
- New Post

Primary buttons may use standard rounded corners.

### Secondary

Use neutral surface with subtle border.

Examples:

- Cancel
- Import Excel
- Rename
- Back-related controls when represented as buttons

### Destructive

Use a semantic red treatment, not KSA green.

Examples:

- Delete
- Hide
- Cancel Order
- Reset Tokens

Keep destructive actions visually separated from the normal primary action whenever possible.

### Button Motion

Keep motion subtle:

- small shade change
- at most `translateY(-1px)`
- soft shadow increase when appropriate

Avoid bounce, scale-heavy, or large slide animations.

---

## 13. Tables

### Base Style

Use horizontal row dividers rather than boxed grid cells.

Do not use zebra striping by default.

Table header:

- slightly muted background
- medium-weight labels
- sticky for long tables

Rows:

- comfortable height
- subtle divider
- no thick vertical borders

### Row Hover

Use a very light neutral/brand-tinted background.

Do not dramatically change row height, border, or scale.

### Sticky Header

Use sticky table headers on scroll for data-heavy pages such as:

- Users
- Whitelist
- Token Event Detail
- Products
- Orders
- Logs

### Multi-Line Cells

Prefer compact semantic grouping over excessive columns.

Examples:

- Name + email
- Product + short ID
- Total + quantity × unit price

### IDs

Do not show full UUIDs in list tables unless operationally necessary.

Use shortened ID + copy control.

Full ID may be shown in Detail views.

---

## 14. Forms

Use clear vertical grouping.

Recommended structure:

- section title
- concise helper text only when needed
- label
- input
- inline validation

Do not rely on placeholder text as the only label.

Use shared component behavior for:

- text inputs
- textarea
- select
- multi-select
- editable combobox
- switch
- date-time picker
- file upload

### Date-Time Picker

Do not require manual ISO timestamp entry.

Use:

- calendar picker
- time selector
- Hong Kong timezone context

---

## 15. Dates and Time

Admin display timezone:

`Asia/Hong_Kong`

Display format:

`18 Aug 2026, 19:00`

Use 24-hour time.

API timestamps remain ISO strings.

Always treat backend timestamps as instants and format them into Hong Kong time for display.

---

## 16. Status Badges

Use compact pill badges.

Status labels should be human-readable.

Examples:

- Active
- Blocked
- Pending
- Invited
- Accepted
- Draft
- Published
- Hidden
- Available
- Unavailable
- Ordered
- Delivered
- Canceled

Do not rely on color alone.

Badge text must remain readable.

---

## 17. Filters and Search

Keep list controls aligned and compact.

Typical order:

- Search
- primary filter(s)
- sort
- page-specific actions on the right

Do not expose unsupported filters.

If the backend does not support a global search/filter, do not fake it by searching only the currently loaded page.

Preserve useful list query state in the URL when practical.

---

## 18. Modals and Dialogs

Use dialogs for:

- small create flows
- confirmations
- destructive actions
- short rename/edit operations

Do not create a separate page for a one-field action.

Recommended dialog width:

- small: 400–480px
- medium: 520–640px
- large operational dialog: up to approximately 760px

Dangerous flows should clearly show:

- what will change
- affected target/count when relevant
- irreversible consequences
- exact confirmation input when required

---

## 19. Toasts

Position:

top-right

Use for:

- save success
- create success
- delete/hide success
- recoverable request errors
- background cleanup warning

Keep messages concise.

Do not duplicate the same message simultaneously as both toast and large inline banner unless needed.

---

## 20. Loading States

Prefer skeletons for:

- tables
- detail pages
- dashboard cards

Use button-level pending state for mutations.

Do not block the whole page when only one row is being updated.

Examples:

- Order status mutation → disable only that row
- Token row save → disable affected row
- Bulk Token save → disable selected bulk controls

Prevent duplicate submission.

---

## 21. Empty and Error States

Empty states should be calm and useful.

Use Korean explanatory text for empty/error states according to the established copy policy.

Do not show raw backend error text to administrators unless the page specifically needs technical audit data.

Keep primary UI labels/buttons/table headers in English.

Use Korean for:

- instructions
- warnings
- confirmations
- validation
- explanatory errors

---

## 22. Motion System

Use motion to create polish, not distraction.

### Recommended Motion

Sidebar item hover:

- horizontal lift 3–4px
- 120–180ms

Clickable cards:

- subtle upward lift 1–2px
- very soft shadow increase

Buttons:

- color/shadow transition
- optional 1px upward movement

Dropdown/dialog:

- short fade + slight vertical movement

Toast:

- short slide/fade from top-right

### Avoid

- bouncing
- rotating controls
- exaggerated scale
- long page transitions
- animations on every static card
- layout-moving hover effects

Recommended general duration:

150–220ms

Respect `prefers-reduced-motion`.

---

## 23. Dashboard

Dashboard may use more brand expression than operational list pages.

Acceptable:

- subtle KSA gradient header
- campus image or motion hero region
- summary cards
- branded quick-action area

Still keep the actual data cards readable and neutral.

Do not place text directly over a busy image without a contrast overlay.

---

## 24. Admin Login

Admin Login is the best place for stronger visual branding.

Recommended:

- campus photograph or short motion clip as full-screen/large background
- dark/light overlay depending on image contrast
- clean login card with constrained width
- KSA logo clearly visible

If using motion:

- autoplay muted
- plays inline
- preferably play once
- static poster fallback
- reduced-motion fallback

The login form must remain readable regardless of media state.

---

## 25. Responsive Strategy

Use Desktop-first design with graceful Tablet support.

Tablet support is recommended because it can be achieved mostly through responsive layout rules rather than building a separate interface.

### Desktop

- full sidebar
- wide tables
- full action labels

### Tablet

At approximately 768–1024px:

- sidebar may collapse into a narrow icon rail or drawer
- show tooltips for icon-only navigation
- preserve main content hierarchy
- allow horizontal table scrolling when necessary
- do not redesign all tables into cards
- dialogs use available width safely

### Mobile

Mobile is not a primary admin target.

Requirements:

- pages must not break
- critical actions should remain reachable
- horizontal overflow should be controlled

Do not spend current MVP effort fully optimizing complex admin workflows such as Bulk Token Grant for small phones.

---

## 26. Content Width

Table-heavy pages should use almost the full available content width.

Do not wrap the entire admin application in a narrow max-width container.

Use max-width selectively for:

- Login form
- small forms
- dialogs
- narrow detail text blocks

---

## 27. Accessibility

Minimum expectations:

- keyboard-reachable controls
- visible focus states
- semantic labels
- sufficient text/background contrast
- status meaning not conveyed by color alone
- proper button elements for actions
- proper form labels
- reduced-motion support
- alt text for meaningful images

Primary dark green should be preferred for white-text buttons because it provides stronger contrast than the lighter brand greens.

---

## 28. Image Upload UX

For Post and Product images:

- recommend images around 1 MB or less for faster upload
- backend hard maximum remains 5 MB
- support PNG / JPEG / WebP according to API contract
- compress/optimize when useful
- prefer WebP when appropriate
- never expose signed upload URLs, upload tokens, or storage paths in normal UI

Upload states:

- preparing
- uploading
- completing
- completed
- failed

Allow per-image retry where applicable.

---

## 29. Shared Component Strategy

Prefer reusable components rather than page-specific copies.

Recommended shared components:

- `AdminShell`
- `Sidebar`
- `PageHeader`
- `DataTable`
- `Pagination`
- `SearchInput`
- `FilterSelect`
- `StatusBadge`
- `ConfirmDialog`
- `Toast`
- `DateTimeDisplay`
- `DateTimePicker`
- `ImageUploader`
- `EditableCombobox`
- `EmptyState`
- `ErrorState`

Domain-specific reusable components:

- `PostForm`
- `ProductForm`
- `TokenReasonCombobox`
- `OrderStatusActions`

Avoid premature component abstraction for one-off UI.

---

## 30. Page-Level Action Hierarchy

Each page should have one obvious primary action.

Examples:

- Whitelist → Add Student
- Posts → New Post
- Token Events → New Token Event
- Products → New Product

High-impact actions such as:

- Reset Student Tokens
- Delete
- Hide
- Cancel Order

must not compete visually with the primary routine action.

---

## 31. Final Design Principle

The KSA admin should not look like a spreadsheet placed on top of a green background.

It should feel like a modern administrative product that happens to carry the KSA identity.

Use:

- neutral surfaces
- strong information hierarchy
- KSA green as controlled emphasis
- subtle motion
- readable tables
- consistent forms
- clear dangerous-action boundaries

Brand expression should be strongest on Login and Dashboard, and quieter on operational pages.
