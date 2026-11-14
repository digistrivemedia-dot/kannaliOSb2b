# Kannali Garage OS app: rules for the building agent

Read this file fully before any work, and again at the start of every phase. **What** to build, screen by screen and
phase by phase, is in `APP-SCREENS.md`. Questions you can't answer go in `OPEN-QUESTIONS.md`.

## 1. The project

The client is **KANNALI GARAGE / Kannali Automotive**. The platform:

| Part | Who uses it | Where it is |
|---|---|---|
| Customer website + customer app | Vehicle owners | `spareXB2C`, `spareXB2CApp` (**don't touch, don't copy screens from**) |
| **Garage OS website** | Garages, dealers, fleets, retailers and garage staff | `C:\Users\muska\Downloads\spareXB2B` (52 screens, done) |
| **This app**: Kannali Garage OS (Android + iOS) | The same businesses and staff | this folder |
| Admin panel | Kannali staff | `spareXAdmin` |
| Backend API | All of the above | `C:\Users\muska\Downloads\spareXBackend` (NestJS + MongoDB, done) |

The app does **everything the Garage OS website does**, with the same business rules and flows, **designed for a
phone**. It has two jobs:

1. **Buying (every approved business):** buy parts from SpareX at business prices: catalogue, order by part number,
   cart, checkout, quotations, orders, returns, credit, payments, documents.
2. **Running the garage (garage businesses only):** bookings, walk-ins, check-in, job cards, inspection, estimates,
   technicians, quality check, billing, payment, handover, pick-up and drop trips, customers, reviews, reports.

**The website is the reference for behaviour, not for layout.** Every screen in `APP-SCREENS.md` names the website
screen it comes from (`B01`…`B52`, listed in `spareXB2B/CLAUDE.md` §10). Open that screen's code to see its rules,
fields and edge cases. Copy **types** and **business logic** you need into this repo. **Never import from another
repo, and never create shared packages.** The **layout is redesigned for a phone** (§6). A website table is never
squeezed onto a phone.

## 2. What matters most, in order

1. **Easy for busy people.** Garage staff use this with greasy hands, standing, in a hurry. Every screen has one
   job, and **nobody ever wonders what to tap next**.
2. **Flows that work.** Every status move, permission and amount matches the website and the backend exactly.
3. **A polished, confident look** (§5): a professional tool the garage is proud to use.
4. **Clean code that's easy to change.** Client revisions will come. Small files, plain names, each in the feature
   that owns it.

## 3. Users and roles

- Sign-in: business **email + password** (plus a 2-step code when the backend asks for it). First sign-in sets a
  password from the invite link. Staff sign in the same way.
- Only **approved** businesses get in. Others see their application status (`G06`).
- **Garage roles** (fixed, several per person, one branch each). Labels and descriptions come from
  `spareXB2B/src/features/auth/roles.ts`:

| Role | Works on |
|---|---|
| `owner` | Everything, plus team, branches, buying and payments. Switches branch |
| `manager` | Bookings, walk-ins, check-in, job cards, estimates, technicians, QC, delivery, trips |
| `technician` | Their own jobs and their own trips |
| `spares` | Parts and ordering from SpareX |
| `billing` | Quality check, billing, collecting payment, handover |

- **Non-garage businesses** (dealer, fleet, retailer, corporate) have one login and only the buying side.
- **Permissions are checked in one place**: `can(roles, permission)` in `src/features/auth/permissions.ts`, copied
  from the website's. The backend checks them again. The app only hides what a user can't use.

### Tabs depend on who signs in

One function, `tabsFor(roles, businessType)` in `src/features/auth/tabs.ts`, decides the bottom tabs. Someone with
several roles gets the combined tabs in this fixed order: Today, Jobs (or My jobs), Bookings, Shop, Orders, Trips.
At most **4 tabs + More**; the rest go into More.

| Who | Tabs |
|---|---|
| Owner, manager | Today · Jobs · Bookings · Shop · More |
| Technician | My jobs · Trips · More |
| Billing, QA and delivery | Today · Jobs · More |
| Spares | Shop · Orders · More |
| Non-garage business | Home · Shop · Orders · Account |

## 4. Stack

Create the project with `npx create-expo-app@latest` (TypeScript template, latest stable Expo SDK). **Add every
library with `npx expo install <name>`.** Don't pin versions by hand.

| Need | Use |
|---|---|
| App | Expo, **Expo Router**, TypeScript `strict` |
| Styling | **NativeWind**; tokens in `tailwind.config` (§5) |
| Server data | **TanStack Query** (loading, errors, caching, pull to refresh, polling) |
| Small app state | **Zustand** with AsyncStorage: cart, selected branch, last-used filters |
| Forms | react-hook-form + zod |
| Long lists | `@shopify/flash-list` |
| Motion, gestures | react-native-reanimated, react-native-gesture-handler |
| Sheets | Expo Router **form sheets** (`presentation: "formSheet"`). No sheet library |
| Images, camera | expo-image, expo-image-picker (camera first), expo-image-manipulator (shrink before upload) |
| PDFs | expo-print + expo-sharing (Share PDF) |
| Phone | expo-haptics, expo-linking (call, maps, WhatsApp), expo-network (offline banner) |
| Session token | **expo-secure-store only** |
| Icons, font | `lucide-react-native` + react-native-svg; Inter (`@expo-google-fonts/inter`) |

**Phases 1–9 must run in Expo Go.** Push notifications, Razorpay native checkout and links that open the app need a
development build, so they wait for Phase 10. Any other library needs a reason in the phase report.

## 5. Design direction: a work tool, not a shop

The brand is Kannali's (same colours as the websites), but **this app must not look like the customer app**. The
customer app is calm and premium. This app is **confident, high contrast and fast**, like a good field-service tool.

**Tokens** (copy the values from `spareXB2B/src/app/globals.css`; brand colours are placeholders until the client's
brand guide arrives, so change them only in the theme file):
- Structure: **navy-900** top bar on the main tabs, navy-800/700 for selected states and secondary buttons.
- Action: **orange-700** with white text, **only for the one main action** on a screen.
- Page `gray-50`, cards white with a `gray-200` hairline. Text `gray-900`; secondary `gray-600` (not lighter: it's
  read in workshops).
- Status: success, warning, danger, info, each with its `-50` tint. One `statusTone(status)` maps every job, booking,
  order, quotation and payment status to a tone and **a word**. Colour is never the only signal.
- No other colours, no gradients, no emoji, no charts at launch. Light mode only.

**Type** (Inter; one step larger than the customer app; follows the phone's font-size setting):

| Style | Size / line | Weight |
|---|---|---|
| figure (Today counts, amounts due) | 32/38 | semibold, tabular |
| title | 22/28 | semibold |
| heading | 18/24 | semibold |
| body | 16/24 | regular |
| small | 14/20 | regular |
| label | 13/18 | medium, uppercase tracking only for section labels |

**Size and shape:**
- **Tap targets at least 48.** Main buttons 56 tall, full width, in a bottom bar above the keyboard and home indicator.
- Spacing in steps of 4; screen padding 16; cards 16; sections 24.
- Corners: inputs 10, buttons 12, cards 14, sheets 20.

**Signature pieces** (build them once in the kit; they make the app recognisable):
- **Plate chip**: the number plate in a plate-style chip (white, dark border, bold mono-style digits,
  `KA 01 AB 1234`). It is the hero of every job, booking and trip.
- **Job row**: a status colour edge on the left, plate chip, vehicle, customer, status in words, age ("2 h ago"),
  technician avatar.
- **Next step bar**: on every job card, one big button for the next step, from `nextAction(job, roles)` in
  `src/features/jobs/next-action.ts` (§6).
- **Count tiles** on Today: big figures that open the filtered list.
- **Countdown ring** for a new booking's answer deadline.

## 6. UX rules for every screen

- **One main action per screen**, in the bottom bar. Secondary actions are outline buttons or in a "⋯" menu.
- **Next step, always.** A job card's bottom bar shows the one next step for this user (examples: "Start check-in",
  "Start inspection", "Send estimate", "Record customer's answer", "Assign technician", "Start QC", "Create bill",
  "Collect payment", "Hand over"). If this user can't do the next step, the bar says who does
  ("Waiting for the customer's approval", "With billing").
- **Needs you now comes first**: new bookings, estimates answered, vehicles ready for QC, bills unpaid, quotations
  awaiting your answer, overdue credit.
- **Small choices open as form sheets**: branch switcher, filters, decline reason, assign technician or driver,
  collect payment, pay dues, quantity.
- **Tables become cards.** Filters are chips at the top plus a Filters sheet. Search is always at the top of a list.
- **Workshop floor:**
  - camera first for photos (gallery second), shrunk before upload, uploads retry on their own;
  - one area per screen in inspection, with big **OK / Needs attention / Replace** buttons;
  - number keypad for odometer, quantities and amounts;
  - plates format as typed.
- **Phone native:** call buttons open the dialler; addresses open maps by link; "Share PDF" replaces downloads; the
  back gesture always works.
- **Four states for every data area:** skeleton (the shape of the content), empty (what to do next, with a button),
  error (plain words + Try again), content. Pull to refresh on every list and on Today.
- **Offline:** a slim "No connection, retrying" banner. Never lose a filled form: keep its draft until it's sent.
- **Confirm only what can't be undone** (decline a booking, cancel an order, reject a quotation, remove a user).
  Everything else happens at once, with a toast and a light haptic.
- **Money:** buying prices are **excluding GST**, with GST on its own line (website rule). Bills to vehicle owners
  show GST split (CGST/SGST). Always label "excl. GST" or "incl. GST".
- **Words:** plain, short, sentence case. Never show raw codes (`awaiting_approval` → "Waiting for customer").
  Error messages say what happened and what to do.
- **Accessibility from day one:** every icon button has `accessibilityLabel`; controls have `accessibilityRole`.

## 7. Data: the real backend from the start

There is **no demo data in this app**. The backend's `/v1/b2b` API is complete and tested.

- **API reference:** `spareXBackend/openapi/b2b.json` (and Swagger at `http://localhost:4000/docs/b2b` while the
  backend runs). Types: copy from `spareXB2B/src/features/<x>/types.ts`; the API returns exactly these shapes.
- **Run the backend:** in `spareXBackend`, `npm run dev:memory` (a seeded in-memory database on port 4000). Don't
  edit anything in that repo.
- **Phone → backend:** set `EXPO_PUBLIC_API_BASE_URL=http://<this PC's network IP>:4000` in `.env` (the phone and PC
  on the same Wi-Fi). After the AWS deployment it becomes the deployed address.
- **Demo logins** (password `Demo@1234`; all at `@srisaiworks.example.com`): `mahesh` (owner), `ravi`, `deepa`,
  `imran`, `shilpa`, `venkatesh`. Check each one's roles in `spareXBackend/seed/data/businesses.ts`. Application
  states: `review@`, `sentback@`, `rejected@sparex.example.com`. The 2-step code, invite and reset links print in the
  backend's terminal.
- **Pattern:** each feature has `api.ts` (calls through `src/lib/api-client.ts`) and `queries.ts` (TanStack Query
  hooks that screens use). **Screens never call `fetch`.**
- **api-client.ts:**
  - calls go to `EXPO_PUBLIC_API_BASE_URL + /v1/b2b`;
  - the token from secure storage goes as `Authorization: Bearer`;
  - errors are `{ message, code, fieldErrors? }`, mapped onto form fields;
  - lists are `{ items, page, pageSize, total }`;
  - a **401 signs the user out**.
- **Money** is integer paise everywhere, formatted only on screen. Dates are ISO strings shown in India time.
- **New bookings:** while the app is open, Today and Bookings refetch every **15 s**. A new booking opens the alert
  (`G21`). Push notifications replace this in Phase 10.
- **Missing in the API?** Build everything else, add a `G-Q` row in `OPEN-QUESTIONS.md` saying exactly what the
  screen needs, and keep going. **Never edit the backend.**

## 8. Decisions already made

| Topic | Decision |
|---|---|
| Business price | B2C price minus the business's discount %, **excl. GST**. No minimum quantity, no tiers |
| Payment for buying | Online (demo payment until Razorpay, Phase 10), bank transfer (admin confirms), **credit only if enabled** for the business |
| Cancel an order | Until it's shipped |
| Quotations | Valid 7 days; accept, reject, or ask for a revision |
| Bookings | Accept or decline only, no reschedule. **2 minutes to answer** (deadline from the booking), then it goes to another garage |
| Prices on jobs | Booked package at the admin price; walk-ins and extra work at the garage's own prices |
| Estimate | The customer approves **line by line** (in their app, or the garage records it after a call). All rejected → job closes with no fee (with pick-up: only the pick-up fee is billed) |
| QC failed | Back to "In progress" |
| Service bill | In the **garage's** name and GSTIN, its own number series. Paid online or at the counter (cash or the garage's UPI) |
| Pick-up and drop | Paid: the garage's fee + GST, fixed once accepted. Any staff member can be the driver. Cash at the door allowed |
| Other garages' history | Visible on a vehicle **without prices** |
| Not built | Garage stock, suppliers, warranty, Fleet, "Parts for this job" (waits for the client) |
| Language | English only |

## 9. Folders

```
app/                      Expo Router routes only: thin files that render a feature's screen
  (auth)/                 sign in, forgot, set password, register, application status
  (tabs)/                 today, jobs, my-jobs, bookings, shop, orders, trips, more / account
  ...                     detail screens and form sheets
src/
  components/ui/          the kit (§5, §6)
  components/layout/      Screen, TopBar, BottomBar, Section, OfflineBanner
  features/<feature>/     types.ts, api.ts, queries.ts, utils.ts, components/, screens/
  lib/                    config.ts, api-client.ts, format.ts (₹, dates, plates), constants.ts
```

Features follow the website's: `auth, dashboard, bookings, jobs, customers, reviews, reports, trips, catalog, cart,
checkout, quick-order, orders, returns, quotations, credit, payments, documents, company, garage, notifications`.

## 10. Security baseline

- The token lives **only** in expo-secure-store, never in AsyncStorage, Zustand or logs.
- **No secrets in the app.** Every `EXPO_PUBLIC_*` value is public.
- HTTPS everywhere outside development.
- Validate every form with zod, and every route parameter before using it.
- Don't log personal data (names, phones, addresses, tokens). No `console.log` in finished code.
- Signing out calls the backend's sign-out, then clears the token, the query cache and everything stored on the phone.

## 11. Code

- Function components, named exports, one component per file, named for what it is (`JobRow`, `PlateChip`).
- TypeScript `strict`, no `any`, no `@ts-ignore`.
- Screen files stay small: hooks at the top, layout below, pieces in the feature's `components/`.
- Reuse the kit. A new pattern goes into `components/ui` once.
- A short comment only where the *why* isn't obvious. No commented-out code, no dead files.
- You may copy **non-visual** helpers from `spareXB2CApp` (`format.ts`, the api-client pattern). Never its screens,
  kit or styling.

## 12. Checks

- **Phases 1–8:** only `npx tsc --noEmit` (it must pass), then walk every flow of the phase in **Expo Go on a real
  Android phone and an iPhone**, against the running backend, with the right role's login. Include the empty and
  error states (stop the backend once to see the error and offline states).
- **Phase 9 runs every check** (listed in `APP-SCREENS.md`). Phase 10 repeats them before release.

## 13. Working rules

- **One phase at a time**, in order. Build only what `APP-SCREENS.md` lists. Nothing invented, nothing skipped.
- Never stop to wait for an answer: use the default in `OPEN-QUESTIONS.md` (add a row if needed) and keep going.
- **Never stop to wait for the backend either.** If a screen needs a route, field, permission or seed data the
  backend doesn't have, build the screen with a sensible fallback, add a row to `BACKEND-NEEDS.md`, and keep going.
  The whole list is handled in Phase 10.
- **Test data:** keep `scripts/dev-data.ts`, a small script that signs in as the demo logins and creates realistic
  data through the API (walk-ins and jobs in every status, bookings via the customer API, orders, quotations). Run
  it after each `dev:memory` start. It only calls the API and never touches the backend's code.
- **Git:** `git init` in Phase 1. Before the first commit, show `git config user.name` and `user.email` in the
  report: they must be the team's own, not another company's. Commit **locally** at the end of each phase
  (`feat(jobs): job card and next step`). **Never push.**
- Don't edit any other repo.

## 14. Phase report

At the end of each phase, reply with:

1. **Built:** each screen id and name, with its route.
2. **Differs from the plan:** what and why.
3. **API gaps:** `G-Q` ids added for anything the backend doesn't have.
4. **New libraries:** name and reason (or "none").
5. **Check:** the `tsc` result, the phones tested, the logins used.
6. **Commit:** hash and message.
7. **Lead to look at:** up to three things to check on the phone.
