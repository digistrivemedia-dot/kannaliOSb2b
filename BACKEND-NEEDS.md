# Garage OS app: what the backend still needs

Everything the app needs from `spareXBackend` but doesn't get yet. **The app never waits for these.** Build the
screen with a fallback, log the need here, and keep going. The lead hands this whole list to the backend agent in
Phase 10.

**Agent:** add rows at the end with the next free id. Say exactly what is missing (route, field, seed data or
permission), which screen needs it, and what the app does meanwhile. Never edit the backend.

| ID | What the backend needs | Screen | What the app does meanwhile | Status |
|---|---|---|---|---|
| BN-01 | Regenerate `openapi/b2b.json` (`npm run openapi`). It lists only auth, company, registrations and catalog (G-Q09) | Reference only | Built from the backend's controllers and view files | Open |
| BN-02 | Seed service data for Sri Sai Two Wheeler Works: bookings (one with pick-up and drop), ~10 job cards over every status, a walk-in, a pick-up & drop job (G-Q10) | G20, G22, G30, G31 and every job flow | The app's own dev script creates test data through the API (`scripts/dev-data.ts`, see CLAUDE.md §13) | Open |
| BN-03 | Seed staff so each Sri Sai branch has every role: a **billing** person at HSR Layout and a **manager** at Whitefield. Today only the owner (Mahesh, 2-step on) can bill at HSR or run the desk at Whitefield. Or: return the 2-step `demoCode` on B2B sign-in in dev, as B2C and admin sign-in already do | G42–G44 at HSR; G32–G37 at Whitefield; `scripts/dev-data.ts` | The script reads Mahesh's code from the backend log (`--backend-log`) or asks for it; without it, billing steps and Whitefield jobs are skipped | Open |
| BN-04 | The seeded applications (`APP-2026-0009/10/11`) answer with no `photos` or `documents`, so "Correct and resubmit" can't be tested keeping the earlier photos | G05, G06 | The wizard asks for at least one shop photo again before it sends the corrections (the API accepts it) | Open |
| BN-05 | Job search (`GET /garage/jobs?q=`) should also match the **customer's name** (it matches job number, plate and vehicle only); `APP-SCREENS` G30 asks for "plate, job no., customer" | G30 | The search box says "Plate, job number or vehicle" | Open |
| BN-06 | A list of vehicle makes and models a garage desk can read (`jobs:manage`), e.g. `GET /garage/vehicle-models`. `/catalog/filters` has them but needs `catalog:view`, which managers don't have | G32 (make and model pickers) | Make and model are typed, as on the website | Open |
