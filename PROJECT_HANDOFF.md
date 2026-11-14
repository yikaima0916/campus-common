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
| Mail summary, rule-based fallback | Yes | Verified on candidate | Missing originals produce a labelled extract and no full translation. |
| Mail AI summary and full zh-CN / zh-TW translation | Yes, repair branch | Live on campus-common | Real-model Traditional Chinese summary and translation verified with a synthetic ILP email. Fresh Simplified Chinese model output remains unverified. |
| Outlook OAuth | Yes | Authorisation start verified | Production secrets configured. A signed-in test account reached Microsoft sign-in with the new app and correct Web callback. User consent, token exchange, and mail sync remain to be verified. |
| iPhone Shortcut ingestion | Yes | Not configured | Needs `SHORTCUT_INGEST_KEY` |
| Web Push | Yes | Unverified | Needs VAPID secrets |
| Cron (reminders, digests) | `scheduled()` exists | **Off** | No cron trigger in `wrangler.i4i.jsonc` |
| Daily Digest | Yes | Current-day digest verified in production | Scheduled delivery depends on cron. |
| Campus Common public home / unified Study Workspace | Yes, main | Live 2026-11-10 | One workspace entry; grouped Academic / Campus Life sections on the homepage. All 35 static assets match the final release; future tiles remain Coming Soon |
| Academic Planner, reviews, notes, Non-Academic Hub features | No | No | Future concept only; shown as Coming Soon tiles |

## 5. Latest change log (newest first)

Use this format: Completed changes / Files modified / Commit SHA and branch / Deployed? (worker, URL) / Verification run vs not run / Known issues / Next steps.

- **2026-11-14 — Mail AI repair deployed and verified.**
  - Code commit `2b083d3c4eb4c86b31a0275799073575bcebeb4a` on `fix/i4i-mail-ai`. Deployed Worker `campus-common` version `f2cd6d3b-a582-4ade-a7f7-fa64fecc658b` at 100% under deployment `3a47fa12-70e0-4cdb-bfc0-557984cc073f`. Prior version `11dffc5a-3b71-4238-9e12-a31e4e9c7d7a` is retained at 0% for rollback. Version bindings preserve isolated D1 `2ef415cd-56b9-4f37-9f75-b7f19cbdd968`, Outlook secrets, and Worker-first asset routing. CDS main remained `c0a99c8e876182a9305d7991e8a4f3c84dfad5f7` and its served app.js matched the pre-repair hash.
  - All 105 local tests passed against the release source. All 35 static assets matched the candidate, with index.html served at /. Candidate ran a new real-model Traditional Chinese assignment brief in 10.36 seconds, with source evidence for 24 November 2026 at 11:59 PM HKT. Checked missing-original fallback, receipt exclusion, task and group reads, today's digest and cross-account 404. The earlier candidate produced and cached three translated chunks for the 3,034-character synthetic ILP message. The final candidate read the complete translation and exact original in 2.57 seconds, confirmed the linked deadline, venue, final paragraph and account name, and reused the cache.
  - Production API checks passed for deployment, homepage, matching reader asset, signed-out 401 with no-store, cross-account 404, mail list and details, receipt exclusion, tasks, groups, digests and Outlook configuration. Production Chrome verified the Traditional Chinese AI summary and full translation, linked registration URL, English-original tab, refresh/cache persistence, and the 390 px layout without overflow. Captured the rollback-version and current-version views of the same synthetic email. API checks verified all three locale settings and persistence through logout/login. Three disposable accounts, eight synthetic messages and their scoped cache/session data were cleaned up.
  - Remaining: uncached long-translation latency on the final version, fresh Simplified Chinese model output, physical iPhone/PWA behaviour, and OAuth/Graph retrieval against an authorised mailbox were not verified in this rollout. Candidate verification shared the 3,000 estimated-neuron daily app budget with earlier tests, leaving 197 estimated neurons, so further model runs were deferred. Account billing/usage could not be read. Existing Workers AI model only; no new service or plan. Scheduled digest delivery remains pending because cron is off.

- **2026-11-14 — Restore i4i mail AI and Hong Kong Traditional Chinese.**
  - Production version `11dffc5a-3b71-4238-9e12-a31e4e9c7d7a` was observed with `ENABLE_AI=false` and no AI binding. All 49 i4i message rows counted at diagnosis were marked as rule extracts. Read-only comparison confirmed that the CDS Worker had Workers AI enabled and an AI binding. The i4i D1 ID is `2ef415cd-56b9-4f37-9f75-b7f19cbdd968`; no CDS mailbox records or bindings were transferred.
  - Repair source `2b083d3c4eb4c86b31a0275799073575bcebeb4a` on `fix/i4i-mail-ai`. Existing Workers AI model only. Email summary is generated from the original and checked against verbatim evidence. Full text and account/locale-scoped translation caches are separate. Translation validates links, numbers, addresses and line structure before showing any complete result. Both incoming and existing mail can be reviewed without a blanket backfill. Completion receipts cannot create new pending suggestions. The user's review step still applies.
  - Local suite: **105/105**. Cloudflare candidate `8fae33f3-4510-4f74-9505-ac85b1f3d9d7` at 0%: true model generated an ILP summary and a three-part Traditional Chinese translation of a 3,034-character synthetic email. Verified the 22 November 17:00 HKT deadline, 25 November activity, room 308, link, final line, preferred name, cached re-open, and original text equality. The first uncached detail request did not yield usable JSON, although all three translation chunks were stored; the final source processes up to three chunks concurrently. The older candidate's initial refusal and unsupported institution reference led to tighter checks.
  - Candidate checks: Mail detail and brief endpoint, missing-original fallback, receipt excluded from pending suggestions, read-only Tasks/Groups, today's digest, limited reprocess and cross-account 404. No paid plan or new service was enabled. App budget reserves at most 3,000 estimated neurons per UTC day. Detailed account billing/usage was inaccessible to the deployment credential.
  - Remaining: verify final version upload and production traffic, uncached response timing, browser screenshots, locale switch and session persistence, physical phone layout, and OAuth/Graph retrieval against an authorised synthetic mailbox. Pre-change production rollback: `11dffc5a-3b71-4238-9e12-a31e4e9c7d7a`.

- **2026-11-11 — Outlook configuration diagnosis.**
  - Verified the pre-rename and current i4i deployments both lacked the Microsoft credentials and encryption key. Confirmed the i4i D1 had zero Outlook connections and added a new production `TOKEN_KEY` to `campus-common` only.
  - Cloudflare deployed version `eddc1b3e-49b1-4f81-8943-8dcbd043e8cd` at 100%. Homepage and settings entry returned HTTP 200. Signed-out status and OAuth start returned HTTP 401.
  - The owner registered the new Campus Common app and deployed its client secret. All three secret bindings are active in production version `11dffc5a-3b71-4238-9e12-a31e4e9c7d7a`. A temporary account saw `outlookConfigured: true` and the expected Microsoft authorisation redirect with the new callback and `Mail.Read`. Microsoft redirected to sign-in. The temporary account and its OAuth state were removed. User consent, token exchange and mail sync remain to be verified.

- **2026-11-10 — Codex, Campus Common naming and unified homepage (owner requested).**
  - Every visible brand, login/sidebar title, PWA name and notification title now uses Campus Common in EN / 简 / 繁. Retained logo and existing internal account/database identifiers.
  - Combined Mail / Tasks / Groups / Daily Digest into one Study Workspace entry, restoring the last visited workspace view. Removed the duplicate Email Assistant CTA and intermediary Academic/Campus Life menu screens; legacy section hashes scroll to the grouped homepage.
  - Wider responsive two-column homepage, compact brand header, mint active workspace and compact future modules. Homepage/GetHomepage GitHub and official layout documentation informed grouped columns; no external code or dependencies added.
  - Target Worker `campus-common`, same isolated i4i D1 and runtime bindings. Old competition Worker becomes a 307 no-store redirect preserving path/query/method; original CDS Worker and account-level workers.dev suffix are excluded. New hostname requires signing in again; existing accounts/data remain in the same D1.
  - Verification so far: 972 translation/brand assertions; one workspace entry and no obsolete intermediary markup; all three backend file diffs are exact brand substitutions. Local Safari EN/简/繁 brand, dark toggle and signed-out workspace/login target verified. Full test/CLI startup stalled on this host; the earlier 102-test result is historical, not a new run. A fresh esbuild bundle was generated from the current source; external Node builtin require calls were converted to static node: imports for the nodejs_compat runtime. The new bundle passed production registration/login and task checks.
  - Live: **https://campus-common.campus-companion.workers.dev/**. Active version **`e92befca-1884-4b06-a12f-41ea31e39961`**, 100% traffic, verified 2026-11-11 00:20 HKT. Legacy redirect version `f45f7260-7519-408e-9260-e34899d9a870` on `campus-companion-i4i`. Main implementation commit `5aee52274d1727e56cc505de3b651169feb6404a`; the following source commit contains the final public button color-transition fix and this verification record.
  - Production: 10 public/deep-link/auth access checks; registration + login + task create/read/complete/delete + mail/groups/digests reads + logout/session invalidation passed. A first PATCH without a version correctly returned 409; the versioned update passed. One new disposable QA account/task was created and removed; D1 confirmed zero remaining accounts for that exact QA email. All 35 deployed static assets matched the release package; all 6 old-URL redirect checks passed, preserving paths/queries and using no-store.
  - Safari production: logo checkmark visible on the initial light homepage; Chinese brand remains Campus Common; light/dark layouts, locale selection and Coming Soon feedback checked. Removed public button color transitions after they caused mismatched backgrounds/text during Safari theme changes; existing logo animation retained. No physical iPhone/PWA test claimed.
  - Isolation: CDS original main remains `c0a99c8e876182a9305d7991e8a4f3c84dfad5f7`; live app.js SHA-256 matches its pre-release hash. Account workers.dev suffix is unchanged.

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
- [x] Add the `ai` binding and enable AI on the repair branch. Verify the real model, Traditional summary, full translation, and deadline on a 0%-traffic candidate.\n- [ ] Verify the final release in production and deliver browser comparison screenshots.
- [ ] Add a cron trigger if reminders and the digest are in the demo; verify.
- [x] Confirm the CDS original is unaffected (repository head and live frontend hash unchanged).
- [x] Campus Common branding, unified workspace entry, denser grouped homepage and new Worker hostname; old i4i links redirect; original workspace functionality retained.
- [ ] Verify the final release on a physical iPhone (Safari, PWA, responsive layout, push if configured).
- [ ] Record the demo video from the real site with test data only.
