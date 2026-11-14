# Kannali Garage OS app: screens and phases

Everything the app has, in 10 phases. The rules for building are in `CLAUDE.md`.
- **Phases 1–8:** screens, connected to the real backend (`/v1/b2b`).
- **Phase 9:** the remaining screens, plus every check.
- **Phase 10:** real accounts, push notifications and release.

The **Web** column names the Garage OS website screen to take the behaviour from (`spareXB2B/CLAUDE.md` §10).
`—` means the screen is new for the app. **Who** is the roles that see it (`own` owner, `man` manager, `tech`
technician, `spa` spares, `bil` billing, `biz` non-garage business).

## App structure

Tabs come from `tabsFor(roles, businessType)` (`CLAUDE.md` §3). The main tabs have a **navy top bar** with:
- the branch name (owners tap it to switch branch, G07);
- the notifications bell (G86);
- on Shop, the cart with its item count.

More (G75) lists everything else this user may open.

## Phase 1: Foundation and the look (approved here)

| Work | Detail |
|---|---|
| Project | Expo + Expo Router + TypeScript strict + NativeWind, folders (`CLAUDE.md` §9), Inter, app name "Kannali Garage OS", bundle id `in.kannaligarage.os`. `git init` |
| Tokens | Colours, type, spacing, corners (`CLAUDE.md` §5) in one theme file |
| Kit | Text (the six styles) · Button (primary, secondary, outline, ghost, destructive; loading, disabled) · IconButton · Input, number input, password input, plate input (formats as typed) · Select field (opens a sheet) · Checkbox, Radio, Switch · Chip and filter chips · Card · ListRow · StatusBadge (tone + word) · **PlateChip** · **JobRow** · **CountTile** · **CountdownRing** · **NextStepBar** · Price (excl./incl. GST label) · Quantity stepper · Skeleton · EmptyState · ErrorState · Toast · Avatar · Timeline · PhotoCapture (camera first) and photo viewer · OfflineBanner |
| Layout | Screen (safe areas, pull to refresh), TopBar (navy, branch, bell), Header (back, title, actions), BottomBar, Section |
| Navigation | Tabs by role, stacks, form-sheet routes, sign-in guard |
| Data | `config.ts`, `api-client.ts` (`CLAUDE.md` §7), Query provider, `format.ts` (₹ from paise, India dates, plates, "2 h ago"), `statusTone()` |
| Auth core | `can()`, `tabsFor()`, a minimal sign-in so the two screens below run on the real API (finished in Phase 2) |
| Kit screen | Developer-only `/dev/kit` showing every component in every state. Not reachable in release builds |
| **G20 Today** | Built in full (see Phase 3) |
| **G31 Job card** | Built in full (see Phase 4), with the timeline and the next step bar (`nextAction`), opened from Today |

**Stop here** for the lead to approve the look on a phone before Phase 2.

## Phase 2: Access

| # | Screen | Web | Who | What it has |
|---|---|---|---|---|
| G01 | Splash | — | all | Wordmark (text until the logo arrives). Opens the user's first tab if signed in, else G02 |
| G02 | Sign in | B01 | all | Email, password (show/hide), Sign in. 2-step code step when the backend asks. "Forgot password". "New business? Apply". Not approved → G06. First sign-in → G04 |
| G03 | Forgot password | B02 | all | Email → "Check your email" |
| G04 | Set password | B06, B02 | all | From an invite or reset link: new password + confirm, rules shown as ticks. In Expo Go the link is opened from the terminal log (real app links come in Phase 10) |
| G05 | Register (apply) | B03 | new | 4 steps with "Step 2 of 4":<br>1. Business: name, type, optional GSTIN (fills PAN and state), PAN, licence with photo<br>2. Contact and location: optional contact person, email, phone, address, PIN → city and state<br>3. Photos: 1–6, camera first<br>4. Review + terms → submitted<br>Draft kept if the app closes |
| G06 | Application status | B04, B05 | new | Under review (reference, date, what happens next) · Sent back (Kannali's notes → edit G05 and resubmit) · Rejected (reason → apply again, pre-filled) |
| G07 | Branch switcher (sheet) | — | own | Branches with a tick on the current one. Everything follows the selected branch |

## Phase 3: Today and bookings

| # | Screen | Web | Who | What it has |
|---|---|---|---|---|
| G20 | Today | B27 | own, man, bil | In this order:<br>• Greeting + branch + date<br>• **Needs you now**: new bookings (with countdown), estimates answered, ready for QC, bills unpaid<br>• **Count tiles**: new bookings, received, waiting for customer, in progress, ready, payment pending (each opens G30 filtered)<br>• Today's bookings by slot<br>• "New walk-in" (G32) as the main action<br>Pull to refresh; refetch every 15 s |
| G21 | New booking alert | B31 | own, man | Full screen when a new booking arrives: plate chip, vehicle, customer first name, package, slot, pick-up and drop with its fee, **countdown ring** to `expiresAt`, vibration. **Accept** (orange) / Decline (reason sheet). Expired → "This booking went to another garage" |
| G22 | Bookings | B30 | own, man | Tabs: New, Accepted, Declined, Missed. Booking cards: slot, plate, vehicle, package, pick-up badge |
| G23 | Booking detail | B31 | own, man | Customer (call), vehicle (→ history G83), services at their prices, slot, notes, pick-up address and fee. Accept / Decline while new; after accepting → its job card |

## Phase 4: Jobs

| # | Screen | Web | Who | What it has |
|---|---|---|---|---|
| G30 | Jobs | B34 | own, man, bil | Search (plate, job no., customer) · status chips with counts · Filters sheet (technician, date) · JobRow list |
| G31 | Job card | B35 | own, man, bil, tech* | Header: plate chip, vehicle, customer (call), status in words, job no.<br>Sections: timeline, check-in, inspection, estimate (approved / waiting / rejected per line), technician, trips, QC, bill<br>**Next step bar** from `nextAction()`<br>(*a technician sees only their own jobs through G41) |
| G32 | New walk-in | B32 | own, man | Plate input → found: vehicle + customer, confirm · not found: customer name and phone, vehicle make and model (pickers) · complaints → job at "Vehicle received" → G33 |
| G33 | Check-in | B33 | own, man | Odometer (number keypad), fuel level (5 big steps), vehicle photos (camera, at least 1), damage notes with photos, complaints → "Job card created" |
| G34 | Assign technician (sheet) | B39 | own, man | Branch technicians with their open job count; assign or reassign |

## Phase 5: The work

| # | Screen | Web | Who | What it has |
|---|---|---|---|---|
| G35 | Inspection | B36 | own, man, tech | One area per screen ("Brakes, 3 of 8"): each item **OK / Needs attention / Replace**, note and photo. Summary → build the estimate |
| G36 | Estimate | B37 | own, man | Booked work (package, fixed) + extra lines: services (garage prices), SpareX parts (search), labour, consumables. Qty, price, GST, total. **Send to customer** |
| G37 | Record customer's answer | B37 | own, man | For a customer who answers by phone: approve or reject each line, "Approve all". All rejected → job closes with no fee (pick-up fee only, if pick-up) after a confirm |
| G38 | Extra work | B38 | own, man, tech | Approved work shown, add lines → back to "Waiting for customer" |
| G40 | My jobs | B40 | tech | Today's assigned jobs: JobRow + the step they're at. Accept or reject an assignment (reason) |
| G41 | My job | B40 | tech | Approved tasks to tick off, progress notes and photos, "Found extra work" (→ G38), parts used. "Done, send to QC" as the main action |
| G39 | Quality check | B42 | own, man, bil | Checklist from the job's tasks. **Pass** → Ready, or **Rework** with a note → back to the technician |

## Phase 6: Finish and trips

| # | Screen | Web | Who | What it has |
|---|---|---|---|---|
| G42 | Bill | B44 | own, man, bil | Built from approved lines, in the garage's name and GSTIN, CGST/SGST, bill number. **Share PDF**. Main action: Collect payment |
| G43 | Collect payment (sheet) | B45 | own, man, bil | Amount due. Online (send link / UPI) or at the counter (cash or the garage's UPI, amount received) → Paid |
| G44 | Handover | B46 | own, man, bil | Handover checklist, odometer out → Completed |
| G45 | Completion report | B43 | own, man, bil | Work done, parts replaced, before and after photos, technician, QC, next service due. Share PDF |
| G46 | Trips | my-trips | any assigned | The driver's pick-ups and drops for today: plate, customer (call), address (open in maps), slot. "Picked up" / "Delivered"; at a drop with an unpaid bill, record **cash at the door** |
| G47 | Assign driver (sheet) | B35 | own, man | Staff of the branch → out for pick-up or out for delivery |

## Phase 7: Buying

| # | Screen | Web | Who | What it has |
|---|---|---|---|---|
| G50 | Shop | B08, B07 | own, spa, biz | Search by name or part number at the top · categories · **Recent orders with Reorder** · offers banner |
| G51 | Products | B08 | own, spa, biz | Card list: name, part no., your price excl. GST, stock. Filters sheet: category, brand, vehicle fit (type → brand → model), in stock |
| G52 | Product | B08 | own, spa, biz | Photos, part no., HSN, **your price excl. GST** + B2C price and MRP, stock, fits, quantity stepper. Add to cart |
| G53 | Order by part number | B09 | own, spa, biz | Type or paste part numbers, one row each with quantity; each row shows OK / not found / out of stock / only N left; add all OK rows to the cart |
| G54 | Cart | B10 | own, spa, biz | Lines with steppers, savings vs B2C price, stock warnings, subtotal excl. GST, GST, delivery (₹250, free from ₹5,000 excl. GST) |
| G55 | Checkout | B11 | own, spa, biz | Address (sheet), PO number, payment: online (demo), bank transfer (bank details + reference), credit (only if enabled; disabled with the reason when over the limit). Totals before the button |
| G56 | Order placed | B12 | own, spa, biz | Number, payment status per method, what happens next |
| G57 | Orders | B13 | own, spa, biz | Status chips, cards (number, date, amount, payment state), Reorder |
| G58 | Order detail | B14 | own, spa, biz | Timeline, lines, payment, invoice (Share PDF), **Cancel until shipped** (reason + confirm), Return items when delivered, Reorder |
| G59 | Returns | B15 | own, spa, biz | Request (items and quantities, reason, photos, notes) · list · detail with timeline |
| G60 | Quotations | B16 | own, spa, biz | Status chips; validity "5 days left" |
| G61 | Quotation | B18 | own, spa, biz | Quoted lines, countdown to expiry. **Accept** → checkout at the quoted prices · Reject (reason) · Ask for revision (comment) |
| G62 | New quotation | B17 | own, spa, biz | Rows by part number or from the catalogue, quantities, note → Request |

## Phase 8: Money and company

| # | Screen | Web | Who | What it has |
|---|---|---|---|---|
| G70 | Credit | B19 | own, biz | Only when credit is enabled (else hidden). Limit, used, available (bar), overdue first, dues (Pay), statement by date with Share PDF |
| G71 | Pay dues (sheet) | B20 | own, biz | Pick invoices (or oldest first), total, online or bank transfer (reference) |
| G72 | Payments | B21 | own, biz | Date, reference, method, amount, applied to, status. Receipt: Share PDF |
| G73 | Documents | B22 | own, biz | GST invoices and credit notes; filter by type and date; search by number; Share PDF |
| G75 | More | — | all | Everything else this user may open, grouped (Garage, Buying, Money, Company), plus My account and Sign out |
| G76 | Business profile | B23 | own, biz | Name, type, GSTIN, PAN (read-only); contact and phone (editable); documents and photos; discount % and credit status (read-only) |
| G77 | Addresses | B24 | own, biz | List, add, edit, remove, default |
| G78 | Team | B25 | own | Garages only. People with role badges, branch, status (Invited, Active, Disabled). Add person |
| G79 | Add / edit person | B26 | own | Name, email, phone, roles (each with what it can do), one branch. Disable / enable, resend invite |
| G80 | Branches | B29 | own | List and add / edit (address, contact, hours, taking bookings) |
| G81 | Garage profile | B28 | own | Photos, about, services with own prices, vehicle types, opening hours, daily booking limit, holidays, pick-up and drop (on/off, fee, radius) |

## Phase 9: The rest, and every check

| # | Screen | Web | Who | What it has |
|---|---|---|---|---|
| G82 | Customers | B47 | own, man | Search, cards (name, phone, vehicles, last visit, jobs), Add customer |
| G83 | Customer and vehicle history | B48 | own, man | Details (call), vehicles, history per vehicle; other garages' work **without prices**; walk-in history linked by plate |
| G84 | Reviews | B49 | own, man | Average, breakdown by stars, list; filter by rating and branch |
| G85 | Reports | B50 | own | Branch + date range sheet → key numbers as count tiles: jobs completed, revenue, average job value, jobs by status, technician workload, top services. No wide tables |
| G86 | Notifications | — | all | The user's list from the API, newest first, unread dot, tap opens the right screen, "Mark all read" |
| G87 | My account | — | all | Name, email, roles, branch; change password; sign out |

**Every check, run once here:**

| Check | Detail |
|---|---|
| Types | `npx tsc --noEmit` clean |
| Lint | ESLint (Expo config) clean |
| Tests | Jest (`jest-expo`) + React Native Testing Library. **Unit:** `nextAction`, `tabsFor`, `can`, money and GST totals, estimate approval sums, credit availability, plate formatting. **Flow:** sign in → Today; accept a booking; walk-in → check-in → estimate → record approval → QC pass → bill → payment → handover; order by part number → checkout on credit |
| Accessibility | TalkBack and VoiceOver on the main flows; largest font size holds; contrast 4.5:1; targets ≥ 48 |
| Performance | Long lists smooth on a mid-range Android; images sized and cached; cold start under 3 s in a release build |
| States | Every data area checked in loading, empty, error, offline and content |
| Security | `CLAUDE.md` §10 line by line; `npm audit` with no high or critical issues |
| Roles | Sign in as each demo login and confirm the tabs, More menu and actions match §3 |
| Clean-up | No `console.log`, unused files, exports or libraries; no TODO without a G-Q id |

## Phase 10: Real accounts and release

**First:** the lead gives `BACKEND-NEEDS.md` to the backend agent. Once those are done, remove each screen's
fallback, switch to the real route or field, retest, and mark the row Done.

| Work | Needs |
|---|---|
| Development build (EAS) | The team's Expo account |
| **Push notifications**: new booking (with sound, even when the app is closed, opens G21), estimate answered, bill paid, trip assigned. Register the device token with the backend | Firebase project, Apple push key |
| Razorpay native checkout for orders and dues | Razorpay keys (on the backend) |
| Invite and reset links open the app | The domain |
| Brand: logo, icon, splash, colours | Client's brand guide |
| Crash reporting (Sentry) | — |
| App name and bundle id confirmed (G-Q01) | Client |
| Store builds, listings, screenshots, privacy and data-safety forms | Apple Developer and Google Play accounts in the client's name |
| Every Phase 9 check again, and a full test on real phones | — |

## Not in the app (the same as the website)

Garage stock, suppliers, procurement, warranty claims, Fleet (B51), and "Parts for this job" (B41, waits for the
client's inventory answer).

## Website screens → app

| Web | App | Web | App | Web | App |
|---|---|---|---|---|---|
| B01 | G02 | B19 | G70 | B37 | G36, G37 |
| B02 | G03, G04 | B20 | G71 | B38 | G38 |
| B03 | G05 | B21 | G72 | B39 | G34 |
| B04, B05 | G06 | B22 | G73 | B40 | G40, G41 |
| B06 | G04 | B23 | G76 | B41 | not in app |
| B07 | G50 | B24 | G77 | B42 | G39 |
| B08 | G50–G52 | B25 | G78 | B43 | G45 |
| B09 | G53 | B26 | G79 | B44 | G42 |
| B10 | G54 | B27 | G20 | B45 | G43 |
| B11 | G55 | B28 | G81 | B46 | G44 |
| B12 | G56 | B29 | G80 | B47 | G82 |
| B13 | G57 | B30 | G22 | B48 | G83 |
| B14 | G58 | B31 | G21, G23 | B49 | G84 |
| B15 | G59 | B32 | G32 | B50 | G85 |
| B16 | G60 | B33 | G33 | B51 | not in app |
| B17 | G62 | B34 | G30 | B52 | error screens (kit) |
| B18 | G61 | B35 | G31, G47 | my-trips | G46 |

## Count

| Phase | Screens |
|---|---|
| 1 | Foundation + G20, G31 |
| 2 | G01–G07 (7) |
| 3 | G20–G23 (4) |
| 4 | G30–G34 (5) |
| 5 | G35–G41 (7) |
| 6 | G42–G47 (6) |
| 7 | G50–G62 (13) |
| 8 | G70–G73, G75–G81 (11) |
| 9 | G82–G87 (6) + checks |
| 10 | Release |
| **Total** | **59 screens** |
