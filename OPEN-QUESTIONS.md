# Garage OS app: open questions

Everything here is **built with the default shown**, so nothing waits. The lead fills in **Answer**. Business
questions shared with the website are in `spareXB2B/CLAUDE.md` §10 ("Waiting on client answers"); don't repeat them.

**Agent:** add rows at the end with the next free id. Never delete rows. API gaps go here too: say what the screen
needs from `/v1/b2b` and what you built meanwhile. When an answer arrives, fill in **Answer** and set **Status** to
`Answered`.

| ID | Question | Affects | Default built | Answer | Status |
|---|---|---|---|---|---|
| G-Q01 | Final app name and bundle id (can't change after publishing) | Store, Phase 10 | "Kannali Garage OS", `in.kannaligarage.os` | | Open |
| G-Q02 | Final permissions per garage role | Tabs, More, every action | The website's `can()` table (`spareXB2B/src/features/auth/permissions.ts`) | | Open |
| G-Q03 | Who does the quality check: service advisor or billing/QA? | G39 | Owner, manager and billing can | | Open |
| G-Q04 | Can a business apply from the app, or only on the website? | G05, G06 | In the app (many garage owners only use a phone) | | Open |
| G-Q05 | Sound for the new-booking alert | G21, Phase 10 | The phone's default notification sound | | Open |
| G-Q06 | Offline use on the workshop floor | All | Not at launch: offline banner, retries, drafts kept | | Open |
| G-Q07 | What is on the **Home** tab for businesses that aren't garages? `APP-SCREENS.md` lists the tab but no screen for it | Non-garage tabs, Phase 7 | The website's buying dashboard (B07) on a phone: needs you now (quotations awaiting your answer, overdue credit), recent orders with Reorder, quick links to order by part number and request a quotation. Built with Shop in Phase 7; a placeholder until then | | Open |
| G-Q08 | `CLAUDE.md` §3 gives managers a **Shop** tab, but the manager role has no `catalog:view` permission (website and backend), so the shop would refuse them | Manager tabs | Tabs follow the role table **and** `can()`: a manager gets Today · Jobs · Bookings · More. If managers should buy parts, add the buying permissions to `manager` in `permissions.ts` (and the backend) and the tab appears by itself | | Open |
| G-Q09 | `spareXBackend/openapi/b2b.json` is out of date: it lists only auth, company, registrations and catalog, none of the garage, orders, credit or notification routes that the backend serves | Every phase (reference) | The app is built from the backend's controllers and view files, which are complete. Ask the backend team to regenerate it (`npm run openapi`) | | Open |
| G-Q10 | The demo garage with logins (Sri Sai Works) has **no bookings or jobs** in the seed; the seeded jobs belong to "Kannali Workshops", which has no app login | Phone testing of Today, job card, Phases 3–6 | Test by creating walk-ins through the API (or the website) as `ravi@`; the app shows real empty states until then. Ask the backend team for seeded bookings and jobs at Sri Sai Works | | Open |
