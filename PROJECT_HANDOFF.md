# PROJECT_HANDOFF

Single source of truth for switching between AI assistants (ChatGPT / Claude).
Read this first. Always fetch the latest GitHub state before working; do not rely on an earlier chat's memory of the code.
After any significant change, update **Section 4, 5 and 6** only.
Technical detail lives in README.md, CONTEXT.md, I4I-ISOLATION.md and docs/TEAM_HANDOFF.md — do not duplicate it here.

## 1. Product and goal

- This repo is the **i4i competition version** of **Campus Common** (the owner explicitly requested the same English brand in every language on 2026-11-10; retain the existing logo).
- Positioning: AI Campus Assistant + Academic Hub + Non-Academic Hub. Email AI is the first real MVP module, not the whole product.
- Event: Innovate4Impact, Lingnan University, Final Pitch **2026-11-23** (poster: 17:30–20:00, LYH31920; speaking time per organizer notice, design for 7 min, compressible to 5).
- Pitch strategy: big vision and plan first, then the real MVP demo. Primary SDG 3 (SDG 4 secondary, not formally declared).
- Near-term goals: (1) stable i4i site, (2) working email-to-task flow, (3) 8-slide deck, (4) 60–75 s real screen-recording demo.

## 2. Hard rules

1. Default target is **this repo only**. The CDS course original (repo `campus-companion`, worker `campus-companion`, its D1 database and URL) must not be modified, deployed to, or connected to, unless the owner explicitly says so.
2. Never point the i4i D1 binding at the CDS database. Config file: `wrangler.i4i.jsonc`.
3. No secrets, database dumps or real student data in the repo or in demo screenshots.
4. Do not delete the Worker or D1 database, and do not touch account-level workers.dev settings, without confirmation.
5. Never describe a future concept as a working feature. Never invent tests, users, metrics or school authorization. Report only tests that were actually run.
6. Keep existing Tasks / Mail / Digest / Groups functionality when restructuring the UI. No large UI overhaul without a request. Keep copy short; avoid slogans; keep "Coming Soon" labels.
7. Do not start extra development until the owner names the next task.

## 3. Environment

| Item | Value |
| --- | --- |
| Site | https://campus-common.campus-companion.workers.dev/ |
| Repo | github.com/yikamai0916-sys/campus-companion-i4i (private), branch `main` |
| Worker / D1 | `campus-common` / `campus-companion-i4i` (same isolated D1, no migration) |
| Legacy URL | `campus-companion-i4i.campus-companion.workers.dev` redirects to the current site |
| Based on | CDS commit 73cd9f2d97a347ee2f9aa2780ddd13f6dd824773 |
| Other site | `campus-common-preview.pages.dev`: possibly related early prototype (second-hand / forum). Do not merge, modify or delete it before the pitch. |

## 4. Feature status (update after each change)

Legend: **Code** = present in repo; **Live** = verified working on the deployed site.

| Feature | Code | Live | Notes |
| --- | --- | --- | --- |
| Register / login / data isolation | Yes | Verified 2026-11-10 via production API | Two temporary release accounts; cross-account task edit denied; accounts and sessions cleaned up |
| Tasks, reminders UI | Yes | Task CRUD verified via production API; editor verified in local Safari | Actual push delivery remains unverified |
| Groups (tasks, availability, meeting vote) | Yes | Reported earlier, not re-verified | |
| Mail summary, rule-based fallback | Yes | Not verified | Used when AI is off |
| Mail AI summary / extraction | Yes | **Off** | Needs `ENABLE_AI` = "true" **and** an `ai` binding; the binding is not in `wrangler.i4i.jsonc` |
| Outlook OAuth | Yes | Not configured | Needs Microsoft app, `MS_CLIENT_ID`, `MS_CLIENT_SECRET` |
| iPhone Shortcut ingestion | Yes | Not configured | Needs `SHORTCUT_INGEST_KEY` |
| Web Push | Yes | Unverified | Needs VAPID secrets |
| Cron (reminders, digests) | `scheduled()` exists | **Off** | No cron trigger in `wrangler.i4i.jsonc` |
| Daily Digest | Yes | Depends on cron | |
| Public home, Academic hub, Campus Life hub | Yes, merged to main | Live 2026-11-10 | Production Safari public pages checked; 4 changed assets matched local source byte-for-byte. Coming Soon tiles have no backend |
| Academic Planner, reviews, notes, Non-Academic Hub features | No | No | Future concept only; shown as Coming Soon tiles |

## 5. Latest change log (newest first)

Use this format: Completed changes / Files modified / Commit SHA and branch / Deployed? (worker, URL) / Verification run vs not run / Known issues / Next steps.

- **2026-11-10 — Codex, Campus Common naming and unified homepage (owner requested).**
  - Every visible brand, login/sidebar title, PWA name and notification title now uses Campus Common in EN / 简 / 繁. Retained logo and existing internal account/database identifiers.
  - Combined Mail / Tasks / Groups / Daily Digest into one Study Workspace entry, restoring the last visited workspace view. Removed the duplicate Email Assistant CTA and intermediary Academic/Campus Life menu screens; legacy section hashes scroll to the grouped homepage.
  - Wider responsive two-column homepage, compact brand header, mint active workspace and compact future modules. Homepage/GetHomepage GitHub and official layout documentation informed grouped columns; no external code or dependencies added.
  - Target Worker `campus-common`, same isolated i4i D1 and runtime bindings. Old competition Worker becomes a 307 no-store redirect preserving path/query/method; original CDS Worker and account-level workers.dev suffix are excluded. New hostname requires signing in again; existing accounts/data remain in the same D1.
  - Verification so far: 972 translation/brand assertions; one workspace entry and no obsolete intermediary markup; all three backend file diffs are exact brand substitutions. Local Safari EN/简/繁 brand, dark toggle and signed-out workspace/login target verified. Full test/CLI startup stalled on this host; the earlier 102-test result is historical, not a new run. The production-tested bundle is reused with only corresponding exact brand literal substitutions.
  - Deployment and production verification: pending final release checks. No physical iPhone/PWA test claimed.

- **2026-11-10 — Codex, deployed and verified the i4i homepage.**
  - Source: PR #1 merged as `c86846843edea335bfe1c6550f23a565dfeb422b`; follow-up visibility fix `151125150de16d0aa4faefe80c6b6ac67c08cd5f` removes only the public-screen opacity entrance animation. Safari had rendered public content transparent with that animation; the fixed Academic screen and homepage layout were visually verified. Logo CSS/SMIL animations are unchanged; the final checkmark was visually verified on the local real Worker.
  - Live: **https://campus-companion-i4i.campus-companion.workers.dev/**. Active Worker version **`7eded898-073d-4145-95d2-f67749983ead`**, 100% traffic; deployment `95ec7277-3a2b-47f7-a81d-cb06969e6354`, verified 2026-11-10 23:36 HKT. Worker/D1 remain `campus-companion-i4i`; D1 ID `2ef415cd-56b9-4f37-9f75-b7f19cbdd968`.
  - Publication: first deployment used locked Wrangler 4.136.0. Subsequent CLI startup attempts stalled, so the final CSS release used Cloudflare's documented direct-upload API with the already validated Worker bundle. All 35 public assets were attached, the same D1/ASSETS/APP_ORIGIN/ENABLE_AI bindings and runtime settings were retained, and `run_worker_first: true` was preserved. No system-wide Cloudflare MCP/Skills installation succeeded: the host denied writes to Codex configuration/skills, and the authenticated skills fallback was unavailable. Existing Wrangler OAuth and Cloudflare API access work.
  - Production verification: **14/14** public/deep-link/API access checks; all private unauthenticated API responses remained 401 with `no-store`. **15/15** test-account checks covered registration, login, own-task read/create/complete/delete, denied cross-account edits, mail/groups/digests reads, missing-message denial, logout and invalidated session. Both new test accounts and all their sessions were removed after testing; the test task was removed. No original student records were used.
  - Source verification: deployed `index.html`, `app.js`, `home.css`, and `workspace-route.js` matched local source byte-for-byte. CDS-original `main` remained `c0a99c8e876182a9305d7991e8a4f3c84dfad5f7` and its live `app.js` SHA-256 was unchanged across the release.
  - Remaining limits: no physical iPhone/PWA/push-delivery verification; no configured live Outlook/shortcut ingestion, AI summary extraction or cron/digest delivery test. These are separate follow-up tasks, not completed homepage features.

- **2026-11-10 — Codex, homepage finalisation (see Git history for source commit).**
  - Completed: retained Campus Companion branding; preserved signed-out view/message/task destinations in the URL across login and reload; removed the Worker redirect that discarded `?view=`; task notifications open only tasks returned by the signed-in account; centralised browser history handling and reader cleanup.
  - Files: `public/app.js`, `public/index.html`, new `public/workspace-route.js`, `src/worker.js` (public-shell routing only), `scripts/check-public-access.mjs`, `test/integration.test.js`, new `test/workspace-route.test.js`, this handoff. No config, database migration, or CDS-original changes.
  - Validation: Node v22.23.4; pnpm 10.32.1 with frozen lockfile (web-push 3.6.7, Wrangler 4.136.0). All 102 tests passed before locked install; all 102 also passed by running each test file directly under the locked dependencies. The subprocess-based `node --test` runner stalled on the locked install in this host, so file-by-file harness execution was used; no tests were skipped. Wrangler i4i dry-run passed, including the D1 binding name and 35 public assets. Local real Worker + SQLite migrations + dedicated Safari test account: signed-out mail link -> login -> Mail; task notification -> correct task editor; public home; logo checkmark visible after animation.
  - Existing test correction: disabled AI already returns a labelled extractive fallback. Updated the obsolete error-only assertion to require an account-scoped source excerpt, `fallback: true`, and no invented actions; no summary-generation implementation changed.
  - Deployment: pending merge and i4i-only deploy. Production checks and physical iPhone verification are not yet recorded.
  - Known limits: AI, mail integration, cron, and push configuration remain as documented above; these have not been enabled by the homepage work.

- **2026-11-10 — Claude, public homepage (branch `feature/i4i-homepage`, not merged, not deployed; see `git log` for the SHA).**
  - Completed: public home at `/` with the existing logo centred, "Campus Common" shown once, Academic and Campus Life cards, Email Assistant entry, slim top bar (EN / 简 / 繁, theme toggle, Sign In or avatar menu). Hub pages at `/#academic` and `/#life`. Sign-in is a separate screen with a Home link; tapping a workspace link while signed out goes to sign-in, then to that page. Sign-out returns to the public home. A Home button was added to the workspace header and the sidebar brand. Default language is now English when nothing is saved. Legacy `?view=` links unchanged.
  - Files: `public/index.html`, `public/app.js`, new `public/home.css`, `PROJECT_HANDOFF.md`. No change to `src/`, migrations, wrangler config, or the CDS repo.
  - Verified (local mock server with fake data, headless Chrome): 36 of 36 scripted checks passed — public home without login, centred logo, sign-in gating and return-to-target, sign-out, language switch, legacy `?view=` links with and without a session, no horizontal overflow from 320 to 1440 px. Screenshots taken in light, dark, desktop and mobile.
  - Not verified: the real Worker and real API (the Worker was not run), real login with a real account, iOS Safari / PWA behaviour, the 4 `web-push` tests (still blocked in the sandbox; 45 of 49 pass).
  - Known: login screen, workspace and PWA manifest still say Campus Companion / 校园清单; the Campus Life purple is a new colour token (`--life`) limited to the public pages.
- **2026-11-10 — Claude, added this file.** Only `PROJECT_HANDOFF.md` added; no code or config changed, nothing deployed (see `git log` for the SHA).
- **2026-11-10 — Claude, read-only review.** Repo at `98db4f8` (single commit, `main`). Test run in a sandbox without network: 45 of 49 pass, 4 fail only because `web-push` could not be installed (`ERR_MODULE_NOT_FOUND`), so the full suite has not been run. Live site not reachable from that sandbox, so deployment status is unverified.

## 6. Next tasks (in this order)

- [x] Merge the validated homepage + fixes into `main`, then deploy to the i4i Worker only.
- [x] Install frozen dependencies and run all tests; exact versions and host runner limitation recorded in Section 5.
- [x] Verify deployed frontend bytes and all 14 checks from `scripts/check-public-access.mjs` against production; run the equivalent HTTP checks directly (14/14).
- [ ] Decide one stable mail path for the demo (forwarding, Outlook OAuth, or iPhone Shortcut); configure only that one.
- [ ] Add the `ai` binding, set `ENABLE_AI`, and verify summary and deadline extraction on sample mail.
- [ ] Add a cron trigger if reminders and the digest are in the demo; verify.
- [x] Confirm the CDS original is unaffected (repository head and live frontend hash unchanged).
- [x] Public homepage and Academic / Campus Life entry points implemented; existing workspace retained.
- [ ] Verify the final release on a physical iPhone (Safari, PWA, responsive layout, push if configured).
- [ ] Record the demo video from the real site with test data only.
