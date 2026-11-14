# Garage OS app: phase reports

One report per phase, in the `CLAUDE.md` §14 format. Phase 1's report was given in the chat.

**How every phase was checked.** `npx tsc --noEmit` for the app and for `scripts/`; fresh Android and iOS bundles
with `npx expo export --platform android --platform ios --clear` (from Phase 4; see the Phase 3 note); and each flow run against `npm run dev:memory`
with the logins named, calling the same endpoints with the same bodies the screens send. **No phone was available**
to the agent: every phase still needs the lead's walk-through in Expo Go on Android and iPhone (§12).

**Test data:** after starting the backend, run `npm run dev-data -- --backend-log <file the backend logs to>` (or
plain `npm run dev-data` in a terminal, which asks for Mahesh's 2-step code). `npm run dev-booking` sends one new
booking to HSR Layout for the new-booking alert.

---

## Phase 2: Access

1. **Built**
   - G01 Splash: the native splash is plain navy; the wordmark shows while the session loads (root layout).
   - G02 Sign in, `/sign-in`: email, password (show/hide), 2-step code with "Send a new code", Forgot password,
     invite/reset link, Apply, Check your application.
   - G03 Forgot password, `/forgot-password`.
   - G04 Set password, `/set-password?token=…` (or paste the link), with the rules ticking as you type.
   - G05 Register, `/register`: 4 steps with "Step 2 of 4"; GSTIN fills PAN and shows the state; PIN fills city
     and state; licence photos and 1–6 shop photos, camera first; review with Edit per part; draft kept on the phone.
   - G06 Application status, `/application`: under review (reference, what happens next), sent back (Kannali's
     notes, Correct and resubmit), rejected (reason, Apply again pre-filled), approved.
   - G07 Branch switcher, `/branch-switcher` (form sheet from the top bar, owners only).
2. **Differs from the plan**
   - Applicants can't sign in (the backend has logins only for approved businesses, `FRONTEND-CHANGES` F-24), so
     G02 doesn't route them to G06. G06 opens from "Check your application" with the reference and access key
     (F-23); a phone that applied keeps both in secure storage and opens straight to the status.
   - "First sign-in → G04": the first password is set from the invite link (F-24); G02 says so if the backend ever
     asks for it.
   - "Apply again" fills in everything except photos: a new application must send new photos.
   - The native splash shows only the brand colour until the logo arrives (Phase 10).
3. **API gaps:** BN-04 (seeded applications have no photos).
4. **New libraries:** none.
5. **Check:** `tsc` clean (app and scripts); Android and iOS bundles build. 30 flow checks passed against the
   backend: `ravi@` (manager), `mahesh@` (owner, 2-step code), `venkatesh@` (reset link), `deepa@` (invited, can't
   sign in yet), applications `APP-2026-0009/10/11` with key `demo-application-key`, and a new application.
   No phones (see above).
6. **Commit:** `4528e01 feat(auth): sign in, passwords, apply and application status`.
7. **Lead to look at**
   - Sign in as `mahesh@`: the 2-step step, then tap the branch name on Today to switch branch.
   - Apply from the sign-in screen, close the app on step 3, reopen: the draft is still there.
   - Check application `APP-2026-0010` / `demo-application-key`: the sent-back notes and Correct and resubmit.

---

## Phase 3: Today and bookings

1. **Built**
   - G20 Today, `/today` (from Phase 1): needs-you-now and the count tiles now open the real booking screens.
   - G21 New booking alert, `/booking-alert/[id]` (full screen): opened by a watcher in the tabs that shares
     Today's 15-second poll, once per booking, with a strong vibration; plate, vehicle, customer's first name,
     package, slot, pick-up and drop with its fee, the countdown ring; Accept (opens the job card) or Decline;
     "This booking went to another garage" when time runs out.
   - G22 Bookings, `/bookings` tab: search, New / Accepted / Declined / Missed chips with counts, cards with slot,
     plate, vehicle, package, pick-up badge and a ring while new; paged as it scrolls; pull to refresh; 15 s refresh.
   - G23 Booking detail, `/booking/[id]`: customer (call), vehicle history link, services at their prices (excl. GST),
     the customer's note, slot, pick-up and drop addresses (maps) and fee; Accept / Decline while new; after
     accepting, Open job card.
   - Decline reason, `/booking/[id]/decline` (form sheet): the website's one-tap reasons or one typed in, then a
     confirm (declining can't be undone).
2. **Differs from the plan**
   - The Accepted tab shows bookings still to come (slot today or later), soonest first; earlier ones are job cards.
   - The alert has no sound of its own until push notifications (Phase 10, G-Q05); it vibrates instead.
3. **API gaps:** none.
4. **New libraries:** `prettier` (dev only): one format for every file, as the website repo.
5. **Check:** `tsc` clean (app and scripts). Bundles: the Metro server used for this check had stopped seeing file
   changes, so its bundles were stale; Phase 4's fresh `expo export` build includes and compiles Phase 3's code. 17 flow checks passed against the
   backend as `ravi@` (manager) and `shilpa@` (billing: no bookings), with bookings sent by `npm run dev-booking`.
   No phones.
6. **Commit:** `feat(bookings): new booking alert, bookings list and booking detail` (the commit with this report).
7. **Lead to look at**
   - Signed in as `ravi@` on Today, run `npm run dev-booking`: within 15 s the alert opens and the phone buzzes.
   - Let a booking run out on the alert: it turns into "This booking went to another garage".
   - Decline a booking: pick "Other", type a reason, confirm; it moves to the Declined tab.

---

## Phase 4: Jobs

1. **Built**
   - G30 Jobs, `/jobs` tab: search (plate, job number, vehicle), status chips with counts (All open, Arriving, On
     the road, Received, Waiting for customer, In progress, Ready, Payment pending, To hand over, Completed,
     Closed), a Filters sheet `/jobs-filters` (technician, opened when; kept for next time), job rows with the next
     step this user takes; open work most urgent first, finished newest first; paged; pull to refresh. Today's
     tiles open their chip.
   - G31 Job card, `/job/[id]`: the next step now opens check-in and assign technician; "Reassign technician"
     while a technician has the job; a closed job says "Closed" with its reason.
   - G32 New walk-in, `/walk-in`: plate (formats as typed) → on file: vehicle and owner to confirm; new: type,
     make, model, customer name and mobile; complaints → job at "Vehicle received" → check-in.
   - G33 Check-in, `/job/[id]/check-in` (also "Record pick-up"): odometer on the number keypad, fuel in five big
     steps, 1–6 vehicle photos (camera first, shrunk under the 300 KB limit), damage notes with photos,
     complaints → "Job card created".
   - G34 Assign technician, `/job/[id]/assign-technician` (form sheet): technicians with open job counts, fewest
     first; assign or reassign.
   - Forms keep their draft on the phone until sent (walk-in, check-in); a save that couldn't reach the server is
     sent again on its own.
2. **Differs from the plan**
   - Search can't find a customer by name yet (BN-05); the box says what it does search.
   - Make and model are typed, not picked (BN-06), as on the website.
   - The technician filter is for those who assign technicians (`jobs:manage`); billing filters by date only.
3. **API gaps:** BN-05 (search by customer), BN-06 (makes and models for the desk).
4. **New libraries:** none.
5. **Check:** `tsc` clean (app and scripts); fresh Android and iOS bundles (`expo export`) contain the new screens.
   27 flow checks passed against the backend as `ravi@` (manager), `shilpa@` (billing), `imran@` (technician:
   only his jobs) and `venkatesh@`. No phones.
6. **Commit:** `feat(jobs): job list, walk-in, check-in and assign technician` (the commit with this report).
7. **Lead to look at**
   - New walk-in with a plate typed in lower case: it formats; then check-in with the camera, and close the app
     half way: the form is still filled in when you come back.
   - Today → "In progress" tile opens Jobs on that chip; Filters → a technician; the count chips follow.
   - On a job assigned to Venkatesh, "Reassign technician" from the job card.
