# Design System & Visual Spec

> This doc did not exist in the original spec set (`01`–`05`) — those docs
> define screens, fields, states, and business logic in prose only, with no
> visual/UI direction. This file was written by reverse-engineering the
> mobile mockups provided (Learner + Guard app screens) and is now the
> **source of truth for anything visual**: layout, navigation, color,
> typography, spacing, and component style. `01`–`05` remain the source of
> truth for data, fields, states, and business rules. If the two ever
> conflict, see "Known Conflicts With Other Docs" at the bottom — logic
> always wins over a mockup's visual detail.

This is a **mobile-first** product. Design and build for a single-column
phone viewport first; anything wider is a stretch goal, not the target.

---

## 1. Brand

- **Institution:** Rishihood University. Shield-crest logo + wordmark
  ("rishihood university", lowercase, serif-adjacent) centered in the header
  on every screen.
- **Primary accent color:** Warm orange-red, approx `#E4572E` / `#D9531E`
  range — used for primary buttons, active nav states, active tab
  underlines/pills, links, and icon strokes.
- **Background:** Warm off-white, approx `#FBF6F1` / `#FAF5EF` — not pure
  white. Cards sit on this in pure white (`#FFFFFF`) with soft shadows.
- **Status colors:**
  - Green (`#2E7D4F`-ish) + light green pill background — "Can be stored",
    "Collected", success states, checkmarks.
  - Red/pink (`#C0392B`-ish text on light pink pill) — "Immediate
    Collection" badge, "Overdue" text, error/lockout states.
  - Neutral orange/tan pill — "Pending" status badge.
  - Blue — used sparingly for informational tiles (e.g. "Ready for Pickup"
    stat icon).
- **Illustration style:** Soft, semi-flat illustrated icons (open cardboard
  box, sealed box with checkmark, shield) used as full-color accents on
  hero/header sections of a screen (e.g. Pre-Register, Confirmation,
  Collect). Not photographic, not line-art — small flat illustrations with
  a light shadow/leaf accent.

## 2. Layout Primitives

- **Header (persistent, every screen):** hamburger menu icon (left) —
  centered logo/wordmark — notification bell (right) with a red circular
  unread-count badge. Height ~64–72px, sits on the background color, thin
  bottom border separating it from content.
- **Page title block:** Large bold title + one-line gray subtitle directly
  below the header, left-aligned, generous top padding. Some screens add a
  small illustration to the right of this block (Pre-Register, Confirmation,
  Ready-for-Pickup / OTP screen).
- **Cards:** White background, ~16px corner radius, soft drop shadow, ~16–20px
  internal padding, consistent ~16px gap between stacked cards. Content
  within a card is organized into label/value pairs, often in a 3-column row
  for compact detail groups (icon + label above, value below).
- **Bottom tab bar (persistent, every screen, both apps):** 5 icons + labels,
  fixed to viewport bottom, active tab in the primary accent color (icon +
  label + sometimes a filled circle behind the icon for the app's core
  action tab — see Guard "Scan / Assign").
- **Buttons:**
  - Primary: full-width, filled accent-orange, white bold text, ~14px
    corner radius, ~52–56px tall.
  - Secondary/outline: same shape, white/transparent fill, accent-orange
    border and text (e.g. "View My Requests", "Change Location").
- **Status badges/pills:** small rounded-full pill, colored background +
  matching darker text, no border. Used inline next to titles or in list
  rows (e.g. "Can be stored", "Immediate Collection", "PENDING",
  "Collected").
- **List rows (search results, history lists):** platform logo (small
  rounded-square icon, brand-colored) + name/title + 1–2 lines of metadata,
  with a status pill and/or action button right-aligned.

## 3. Navigation Structure

Not specified anywhere in `04-features-and-user-flows.md` — the routes were
defined but not how a user moves between them. Mockups make this explicit:

### Learner App — bottom tab bar
| Tab | Icon | Maps to |
|---|---|---|
| Home | house | Learner home/dashboard (not detailed in `04` — build as a simple landing screen linking into the flows below; not a numbered screen in the spec, treat as new) |
| Gate Pass | door/exit arrow | Not specified in `04` at all. Likely a QR/ID-style entry pass for the gate unrelated to parcels — **flag to product owner before building; out of documented scope.** Stub the route, do not invent business logic for it. |
| Parcels | parcel icon | A3 "My Parcel Requests" — and its children A2, A4, A5 |
| Notifications | bell | A6 notification list (currently only described as push payloads in `04`, not a full in-app screen — build a simple list view backed by the same events) |
| Profile | person | Not specified in `04`. Stub only — student name/email/hostel room, read-only, no edit flow implied by any doc. |

### Guard App — bottom tab bar
| Tab | Icon | Maps to |
|---|---|---|
| Dashboard | grid | B1 Dashboard |
| Arrivals | truck | Pending Arrivals list (subset of B1, or its own filtered view — mockup shows this as a distinct tab, not just a B1 filter tap) |
| Scan / Assign | scanner icon, rendered as the accent-filled center "hero" tab button | **Not literal camera/barcode scanning** — `01-problem-and-solution.md` and `05-business-rules-and-edge-cases.md` both explicitly rule out QR/barcode scanning for v1 as unreliable. Wire this tab to the manual match + B2 "Mark Parcel Arrived" flow (and B3 Quick Add for unregistered parcels). Do not build a camera/scan feature. |
| Parcels | box icon | All parcels list — stored, ready, overdue, collected, in one filterable view (not a distinct numbered screen in `04`; closest existing screens are B1's sub-lists) |
| More | ellipsis | Overflow menu — route to B5 Overdue, B3 Quick Add if not already reachable from Scan/Assign, and any admin-adjacent links a guard account can see |

No Admin nav is shown in the mockups (Admin dashboard C1–C3 wasn't
screenshotted) — build C1–C3 per `04-features-and-user-flows.md` using the
same visual language (cards, accent color, KPI tiles) once we get there;
nav structure for Admin is undetermined and should be confirmed before
building it.

## 4. Screen-by-Screen Notes (from the 6 provided mockups)

### Guard — B1 Dashboard
- Greeting header ("Welcome, Gate No. 2") + live Store Room Capacity card
  (value + thin progress bar) top-right of the title block.
- Four stat tiles in a row (Pending Arrivals / Stored / Ready for Pickup /
  Overdue), each tappable to filter the list below — matches `04`'s spec
  exactly. Active/selected tile gets a light accent-tinted background and
  border (see "Pending Arrivals" selected state in the mockup).
- Search bar + filter icon button above the Pending Arrivals list, per `04`.
- Each Pending Arrivals row: platform icon, learner name, order ID last 4 +
  expected date, collection-type pill, "Mark Arrived" button (full accent
  fill) — matches `04`'s B1 spec.
- "Parcels Ready for Pickup" and "Overdue Parcels" condensed summary
  sections below the fold, each row showing the assigned parcel number as a
  large numeral badge on the left. "View All" link per section.

### Guard — B2 Mark Parcel Arrived
- Confirms matched learner details read-only in a card (name, order ID
  last 4, expected date, collection-type pill) — matches `04` step 2 exactly.
- "Parcel Details" card: Arrived On / Platform / Last 4 Digits, 3-column
  layout.
- "Assign Parcel Number" — horizontal scrollable picker of next available
  integers, selected number highlighted in solid accent fill — matches `04`
  step 3 exactly (confirms this is a picker of literal next-available
  integers, not a text input).
- Selected-number confirmation strip (green-tinted) with a small illustrated
  parcel graphic showing the number written on the box — reinforces "write
  this number on the physical box" instruction from `04`.
- Storage Location row with "Change Location" outline button — matches `04`
  step 4.
- Notes field with a visible character counter ("0/100") — confirms the "capped
  length" note in `04` step 5 is exactly 100 characters. **Update
  `04-features-and-user-flows.md` B2 step 5 to state the 100-char cap
  explicitly** (currently just says "capped length").
- Primary "Confirm & Store Parcel" button.
- "Store Room Almost Full" banner (only shown near capacity) pinned below
  the primary action, with a "View Old Parcels" button — matches `04` step 7,
  confirms the link target is the old/overdue parcels list (B5).

### Learner — A5 Ready for Pickup / OTP screen
- Green success banner ("Your parcel is ready!") with illustration at the
  top.
- Parcel summary card: platform, order ID last 4, collection-type pill,
  assigned parcel number (large, accent-colored).
- Second detail card: Arrived On / Stored At / "You can collect Anytime" —
  3-column, matches `04`'s A5 spec ("parcel summary" bullet).
- OTP card: 6 individual large boxed digits, centered, plus **a countdown
  ("OTP will refresh in 00:58") with a progress bar underneath.**
  **This directly conflicts with `05-business-rules-and-edge-cases.md`
  §4.2**, which states the code is static until used or regenerated and
  explicitly calls out that an earlier mockup draft showed a countdown in
  error. **Resolution: build the OTP as static, per `05`. Do not implement
  a refresh timer or countdown UI.** Repurpose that vertical space for the
  "Regenerate Code" button described in `04` A5 (not present in this
  mockup at all — it must still be built, just doesn't appear in this
  particular screenshot).
- "Security first" callout box: "Only share this OTP with the guard at Gate
  No. 2. Rishihood will never ask for your OTP." — matches `04`'s persistent
  reminder line.
- "How to collect your parcel?" 3-step horizontal explainer with connecting
  dashed line — matches `04`'s 3-step explainer.
- Outline button "View My Parcel Requests" → A3.

### Learner — A3 My Parcel Requests
- Title block with illustration, then 3 tabs (Active / Collected /
  Cancelled) with counts in the label, active tab shown as a filled
  accent-tinted pill — matches `04` exactly.
- Active request card: "PENDING" pill top-left, "Requested on {date}"
  top-right, platform + order ID, an "Expected {date}" tag, then a 3-column
  detail row (Expected Date / Collection Type / Parcel Number —
  "Not assigned yet" placeholder pre-arrival), an info callout ("Waiting for
  parcel to arrive"), and a "View Details" outline button → A4.
- "Collected History" section below as a flat list (icon, platform, order
  ID last 4, date, green "Collected" pill, chevron) — this is effectively
  the Collected tab's content surfaced inline too; confirm with product
  whether Collected tab and this section are meant to be the same data
  (likely yes — this may just be showing "Active" tab selected with a
  collected-history preview beneath, not a separate section per tab).
- "Need help? Help Centre" card at the bottom — **not mentioned anywhere in
  `04`**. New addition: build as a simple mailto/support-link action, no
  new backend logic implied.

### Learner — A2 Confirmation
- Green success banner + illustration, matches `04` A2 exactly.
- "Your Parcel Details" card: plain label/value rows (not a 3-column grid
  here, unlike other screens) for Expected Date, Platform, Order ID last 4,
  Collection Type (pill, right-aligned).
- Store Room Capacity callout, same style as A1's — matches `04`'s
  requirement to show current capacity again.
- "What happens next?" 3-step vertical explainer with connecting dashed
  line and colored icon circles — matches `04`'s 3-step explainer, confirms
  vertical (not horizontal) layout for this one, unlike A5's horizontal
  version.
- Outline button "View My Requests" → A3.

### Learner — A1 Pre-Register a Parcel
- Title block with illustration, matches `04` exactly.
- Form fields top-to-bottom: Expected Delivery Date (date picker input),
  Platform (dropdown/select), Last 4 Digits of Order ID (text input with
  helper text "Only last 4 digits (e.g. 4821)"), Collection Type (two large
  tappable option cards side-by-side, selected state = accent border +
  filled radio + tinted background).
- Store Room Capacity info callout directly above the submit button — same
  component as used on A2, reused consistently.
- Primary "Submit Parcel Request" button, full width.

## 5. Component Inventory (reusable, name for implementation)

Build these once in `/components` and reuse across all screens per the
Repository/Service architecture in `02-tech-stack.md` — components stay
presentation-only, no data fetching inside them:

- `AppHeader` — logo, hamburger, notification bell w/ badge count.
- `PageIntro` — title + subtitle + optional right-side illustration.
- `StatusPill` — variant prop (`pending` | `can_be_stored` | `immediate` |
  `collected` | `overdue` | `cancelled`), maps to the enum values in
  `03-database-schema.md` so this is the single place status → color is
  defined.
- `DetailCard` — generic white card wrapper.
- `DetailGrid` — 3-column icon/label/value row, used on B1, B2, A2, A3, A5.
- `CapacityCallout` — the tinted "Store Room Capacity X/Y" box, reused on
  A1, A2, A5(-ish)/A3.
- `StepExplainer` — supports both `horizontal` and `vertical` orientation
  (seen used both ways across A2 and A5).
- `NumberPicker` — horizontal scrollable number selector for B2's Assign
  Parcel Number.
- `OtpDigitDisplay` — static 6-box digit display, **no timer/progress bar**
  per the conflict resolution above.
- `BottomTabBar` — takes an `app` prop (`learner` | `guard`) and renders the
  correct tab set from §3 above.
- `PrimaryButton` / `OutlineButton`.

## 6. Known Conflicts With Other Docs

| # | Mockup shows | Doc says | Resolution |
|---|---|---|---|
| 1 | A5 OTP screen has a live countdown + refresh timer | `05-business-rules-and-edge-cases.md` §4.2: code is static, does not rotate on a timer, and calls out that a countdown in an earlier mockup was a draft artifact | **Build static, no timer** — the business-rules doc already anticipated and overrode this exact mockup. |
| 2 | Guard nav has a "Scan / Assign" tab, rendered as a scanner icon | `01` and `05` explicitly rule out QR/barcode scanning for v1 | **Not a scanner** — wire to manual match/assign (B2/B3) flows only. |
| 3 | Learner nav includes "Gate Pass" and "Profile" tabs | Not mentioned anywhere in `04-features-and-user-flows.md` | **Undocumented scope** — stub routes only, no business logic invented; confirm requirements before building out. |
| 4 | A3 has a "Need help? Help Centre" card | Not mentioned in `04` | Minor addition, low risk — build as a static support link. |
| 5 | B2 Notes field shows a "0/100" counter | `04` B2 step 5 just says "capped length" without a number | **Doc should be updated** — see action item below. |

### Action item
`04-features-and-user-flows.md` B2 step 5 should be edited to say "Optional
**Notes** field (free text, max 100 characters)" instead of the vague
"capped length," now that the mockup confirms the exact limit. Flagging
here rather than silently editing that file — confirm and I'll make the
change.
