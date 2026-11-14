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

---

## Phase 5: The work

1. **Built**
   - G35 Inspection, `/job/[id]/inspection`: one area per screen ("Brakes, 2 of 6") with big OK / Needs
     attention / Replace buttons; a note and photos for anything not OK; a summary; for the desk it goes straight
     on to the estimate. Technicians can inspect (`jobs:inspect`).
   - G36 Estimate, `/job/[id]/estimate`: starts with the booked package (locked at its fixed price), the pick-up
     fee and a line per flagged item; lines as cards (kind, description, part number, quantity stepper, price excl.
     GST on the keypad, GST rate); owners pick services from their price list and search SpareX parts (MRP excl.
     GST); live totals; Send to customer.
   - G37 Record customer's answer, `/job/[id]/answer`: Approve / Reject per line, Approve all / Reject all, how
     they answered; rejecting the whole first estimate asks to confirm that the job closes with no fee (pick-up
     fee only with pick-up).
   - G38 Extra work, `/job/[id]/extra-work`: the approved work, then new priced lines sent for approval (desk); a
     technician reports what they found with photos instead (the price comes from the desk).
   - G39 Quality check, `/job/[id]/quality-check`: the job's own work plus the standard checks; Pass needs every
     tick; Send back for rework needs a note.
   - G40 My jobs, `/my-jobs` tab: New for you, To inspect, Working on, Waiting; refreshed every 15 s.
   - G41 My job, `/my-job/[id]`: Accept job or Can't take it (reason sheet `/my-job/[id]/decline`); tasks and
     parts used to tick off; updates with photos; Found extra work; "Done, send to QC" stays off until every task
     is ticked.
   - Job card: "Add extra work" and "Reassign technician" while the job is being serviced.
2. **Differs from the plan**
   - Managers type services and parts on an estimate (BN-07, BN-08); owners pick them.
   - A technician's "Found extra work" is a flagged update for the desk: pricing extra work needs `jobs:manage` in
     the backend (as on the website).
3. **API gaps:** BN-07 (services for the desk), BN-08 (part search for the desk).
4. **New libraries:** none.
5. **Check:** `tsc` clean (app and scripts); fresh Android and iOS bundles (`expo export`). 25 flow checks passed
   against the backend as `ravi@` (manager), `venkatesh@` (technician), `mahesh@` (owner): inspection with photos,
   estimate with the booked package's fixed price kept, partial approval, extra work rejected, accept, ticks, notes,
   finish blocked until ticked, rework (tasks open again) then pass, desk extra work, hand back. No phones.
   Testing note: many owner sign-ins in an hour hit the backend's SMS limit for Mahesh's number (BN-03 would avoid it).
6. **Commit:** `feat(jobs): inspection, estimate, approval, extra work, QC and technician screens` (the commit with this report).
7. **Lead to look at**
   - As `venkatesh@`: My jobs → a job to inspect → the six areas, then a job "New for you" → Accept → tick tasks → Done.
   - As `ravi@`: an estimate from an inspection (lines pre-filled); then Record customer's answer, rejecting one line.
   - As `mahesh@`: on an estimate, add a Part and use "Find a SpareX part".

---

## Phase 6: Finish and trips

1. **Built**
   - G42 Bill, `/job/[id]/bill`: the approved lines in the garage's name, branch address and GSTIN; subtotal excl.
     GST, CGST and SGST (half each, as the website), total incl. GST; Create bill (billing) while the job is ready;
     then Collect payment; Share PDF (expo-print + share sheet).
   - G43 Collect payment, `/job/[id]/collect-payment` (form sheet): the amount due; online (reference), the
     garage's UPI at the counter (reference) or cash (the change to give back) → Paid.
   - G44 Handover, `/job/[id]/handover` (also the driver's "Delivered"): checklist, odometer out, photos, next
     service (date or km, 3 months / 3,000 km suggested); cash at the door when a delivered bill isn't paid →
     Completed. Kept as a draft until sent.
   - G45 Completion report, `/job/[id]/report`: work done, parts replaced, before and after photos, technician,
     QC, next service; Share PDF.
   - G46 Trips, `/trips` tab: the driver's pick-ups and drops now, with call, maps and Picked up / Delivered.
   - G47 Assign driver, `/job/[id]/assign-driver?trip=pickup|drop` (form sheet): branch staff with trips now.
   - The job card's next step now leads to every step; its bill section opens the bill and the report.
2. **Differs from the plan**
   - "Online: send link": the backend has no way to send a payment link yet (BN-09); online payments are recorded
     with their reference (a customer who pays in the SpareX app is marked paid by the backend).
3. **API gaps:** BN-09 (send a payment link).
4. **New libraries:** none (expo-print and expo-sharing were installed in Phase 1).
5. **Check:** `tsc` clean (app and scripts); fresh Android and iOS bundles (`expo export`). 16 flow checks passed:
   `shilpa@` bills, takes cash (short cash refused) and hands over at Whitefield; `mahesh@` takes a UPI payment;
   the pick-up & drop booking goes from pick-up by `venkatesh@` through the whole job to delivery with cash at the
   door (short cash refused). No phones.
6. **Commit:** `feat(jobs): bill, payment, handover, report and trips` (the commit with this report).
7. **Lead to look at**
   - As `shilpa@`: Today → a Ready job → Create bill → Collect payment (cash, see the change) → Hand over.
   - Share PDF on a bill and on a completion report (the share sheet should offer WhatsApp).
   - As `venkatesh@`: Trips → Picked up; later, after billing, Delivered with cash at the door.

---

## Phase 7: Buying

1. **Built**
   - G50 Shop, `/shop` tab: search, Order by part number, Request a quotation, the offers banner, categories,
     recent orders with Reorder; the cart with its count in the top bar.
   - G51 Products, `/products`: cards (name, part number, your price excl. GST, stock at the delivery branch);
     search; Filters sheet `/products-filters` (category, brand, vehicle fit type → make → model, in stock).
   - G52 Product, `/product/[id]`: photos, part number, HSN, your price excl. GST against the retail price and MRP,
     stock, what it fits, quantity stepper, Add to cart.
   - G53 Order by part number, `/quick-order`: rows of part number and quantity, "Paste a list" (one per line),
     each row OK / Not found / Out of stock / Limited stock; Add the OK rows to the cart.
   - G54 Cart, `/cart`: steppers, savings against retail, stock problems in red, subtotal excl. GST, delivery
     (the backend's B2B rule: ₹250, free from ₹5,000 excl. GST), GST, total.
   - G55 Checkout, `/checkout`: delivery branch (sheet), PO number, online (demo) / bank transfer (bank details +
     reference) / credit (only if enabled; off with the reason when short or overdue); totals before the button.
     `/checkout?quotation=…` orders a quotation at its quoted prices.
   - G56 Order placed, `/order-placed/[id]`: number, payment per method, what happens next; online orders pay here
     through the demo payment window (success, or a failure to try).
   - G57 Orders, `/orders` tab: chips, search by order or PO number, cards with payment state, Reorder.
   - G58 Order detail, `/order/[id]`: progress, parts, totals, payment, GST invoice (Share PDF), Cancel until
     shipped (`/order/[id]/cancel`: reason + confirm), Return items once delivered, Reorder.
   - G59 Returns: request `/order/[id]/return` (parts and quantities left to return, reason, photos, note), list
     `/returns`, detail `/return/[id]` with progress.
   - G60 Quotations, `/quotations`: chips, "5 days left". G61 Quotation, `/quotation/[id]`: lines and validity;
     Accept and order, Reject (confirm) or Ask for a revision (`/quotation/[id]/answer`). G62 New quotation,
     `/quotation/new`: part-number rows or "Find in the catalogue", a note.
   - Home for non-garage businesses, `/home` tab (G-Q07): needs you now (overdue credit, quotations to answer),
     quick links, recent orders with Reorder.
2. **Differs from the plan**
   - A line above the branch's stock blocks checkout (the backend refuses it); the website let it through.
   - The order view has no invoice (BN-11): owners get it from Documents; spares staff are told the owner can share it.
   - Bank details are the website's placeholders (BN-10).
   - Credit at checkout is checked against the summary only for those who may see credit (`credit:view`); others
     get the backend's answer if it's refused.
3. **API gaps:** BN-10 (bank details), BN-11 (invoice on the order).
4. **New libraries:** `expo-file-system`: saves a GST invoice PDF from its link before the share sheet (Expo Go has it).
5. **Check:** `tsc` clean (app and scripts); fresh Android and iOS bundles. 35 flow checks passed as `venkatesh@`
   (spares), `ganesh@` (dealer with credit), `ravi@` (manager: no shop), `mahesh@` (owner: documents) and Kannali's
   admin for the other side (quote, deliver): catalogue, filters, part-number check, stock limit, bank / online
   (success and failure) / credit orders, totals with delivery, cancel before and after shipping, invoice PDF,
   return with a photo, quotation request, revision, re-quote, accept at the quoted prices, reject rules. No phones.
6. **Commit:** `feat(buying): shop, cart, checkout, orders, returns and quotations` (the commit with this report).
7. **Lead to look at**
   - As `venkatesh@`: Order by part number → paste "AMA93795 2" lines → cart → checkout online → Pay (demo).
   - As `ganesh@` (non-garage): the Home tab, then checkout on credit.
   - A quotation "Waiting for you" → Accept and order: checkout shows the quoted prices.

## Phase 8: Money, company and garage setup

1. **Built**
   - G70 Credit, `/credit` (only when credit is on; More hides it otherwise): limit, used and available on a bar,
     overdue first, dues with Pay, statement for 30 / 90 / 365 days with Share PDF; invoice PDFs shared from their link.
   - G71 Pay dues (sheet), `/pay-dues`: pick invoices or "oldest first", total, bank transfer with a reference.
     Online is shown but off until Razorpay (BN-12).
   - G72 Payments, `/payments`: status chips, cards with date, method, reference, amount, what it paid.
     Receipt `/payment/[id]` with Share PDF.
   - G73 Documents, `/documents`: GST invoices and credit notes, type chips, date range, search by number, Share PDF.
   - G75 More, `/more` (and the non-garage Account tab): grouped Garage, Buying, Money, Company from `can()`, minus
     the user's tabs; My account and Sign out at the bottom.
   - G76 Business profile, `/business-profile`: name, type, GSTIN, PAN, registered address (read-only); email and
     phone (editable, field errors from the API); discount % and credit (read-only); photos and documents.
   - G77 Addresses, `/addresses`, `/address/new`, `/address/[id]`: list with Default, add / edit (PIN fills city and
     state), Make default, Remove (confirm; hidden on the default).
   - G78 Team, `/team`: people with role badges, branch and status (Invited, Active, Disabled); Add person.
   - G79 Add / edit person, `/person/new`, `/person/[id]`: name, email, phone, roles with what each does, one branch;
     Disable (confirm) / Enable; Resend invite while invited. The owner can't drop their own owner role.
   - G80 Branches, `/branches`: staff count, Taking bookings switch, add / edit address and contact.
   - G81 Garage profile, `/garage-profile`: photos (camera first, max 6), about, services with own prices excl. GST
     and minutes, vehicle types, opening hours per day (number keypad, "09:30"), daily booking limit, holidays
     (DD/MM/YYYY), pick-up and drop (on/off, fee excl. GST, radius). The draft is kept until saved.
   - `scripts/dev-data.ts`: a dealer order on credit, shipped, so Credit has a due after every start; a booking for a
     full or closed day moves to the next open day; the "Wait N seconds" retry regex fixed (`\d+`).
2. **Differs from the plan**
   - G80 "hours": opening hours belong to the whole garage in the backend, so they're set in G81; Branches says so.
   - Garage photos: the backend keeps 6 (the website said 8) and each is shrunk to 200 KB so the profile fits the
     2 MB request limit.
   - Credit payments waiting for Kannali don't list their invoices yet (BN-13): the payment says it is applied once
     confirmed.
3. **API gaps:** BN-12 (demo online payment for dues), BN-13 (pending payment shown on invoices and payments).
4. **New libraries:** none.
5. **Check:** `tsc` clean (app and scripts); fresh Android and iOS bundles. 41 flow checks passed as `ganesh@`
   (dealer, credit on), `lakshmi@` (retailer, no credit: hidden), `ravi@` (manager: no credit, team or profile),
   `mahesh@` (owner): credit summary, dues, statement, bank transfer with reference, payments and receipt, document
   filters and search, contact edit with a field error, address add / edit / default / remove rules, team add,
   duplicate email, no roles, edit, resend invite, disable / enable, branches pause / resume bookings, garage profile
   save with a new photo, service, holiday and pick-up fee, and a field error. No phones.
6. **Commit:** `feat(company): credit, payments, documents, more, team, branches and garage profile` (the commit
   with this report).
7. **Lead to look at**
   - As `ganesh@`: Account → Credit → Pay dues → bank transfer reference → Payments shows it waiting.
   - As `mahesh@`: More → Team → Add person → the invite link prints in the backend's terminal.
   - As `mahesh@`: More → Garage profile → take a photo, add a service and a holiday → Save.
