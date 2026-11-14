# Garage OS app: phase reports

One report per phase, in the `CLAUDE.md` §14 format. Phase 1's report was given in the chat.

**How every phase was checked.** `npx tsc --noEmit` for the app and for `scripts/`; the Android and iOS bundles built
through Metro (`expo start`, `/entry.bundle?platform=android|ios`); and each flow run against `npm run dev:memory`
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
