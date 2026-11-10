# PROJECT_HANDOFF

Single source of truth for switching between AI assistants (ChatGPT / Claude).
Read this first. Always fetch the latest GitHub state before working; do not rely on an earlier chat's memory of the code.
After any significant change, update **Section 4, 5 and 6** only.
Technical detail lives in README.md, CONTEXT.md, I4I-ISOLATION.md and docs/TEAM_HANDOFF.md — do not duplicate it here.

## 1. Product and goal

- This repo is the **i4i competition version** of Campus Companion (UI still shows Campus Companion / 校园清单; do not rename or change logo/UI without an explicit request).
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
| Site | https://campus-companion-i4i.campus-companion.workers.dev/ |
| Repo | github.com/yikamai0916-sys/campus-companion-i4i (private), branch `main` |
| Worker / D1 | `campus-companion-i4i` / `campus-companion-i4i` |
| Based on | CDS commit 73cd9f2d97a347ee2f9aa2780ddd13f6dd824773 |
| Other site | `campus-common-preview.pages.dev`: possibly related early prototype (second-hand / forum). Do not merge, modify or delete it before the pitch. |

## 4. Feature status (update after each change)

Legend: **Code** = present in repo; **Live** = verified working on the deployed site.

| Feature | Code | Live | Notes |
| --- | --- | --- | --- |
| Register / login / data isolation | Yes | Reported earlier, not re-verified | Earlier AI tested with temp accounts |
| Tasks, reminders UI | Yes | Not verified | |
| Groups (tasks, availability, meeting vote) | Yes | Reported earlier, not re-verified | |
| Mail summary, rule-based fallback | Yes | Not verified | Used when AI is off |
| Mail AI summary / extraction | Yes | **Off** | Needs `ENABLE_AI` = "true" **and** an `ai` binding; the binding is not in `wrangler.i4i.jsonc` |
| Outlook OAuth | Yes | Not configured | Needs Microsoft app, `MS_CLIENT_ID`, `MS_CLIENT_SECRET` |
| iPhone Shortcut ingestion | Yes | Not configured | Needs `SHORTCUT_INGEST_KEY` |
| Web Push | Yes | Unverified | Needs VAPID secrets |
| Cron (reminders, digests) | `scheduled()` exists | **Off** | No cron trigger in `wrangler.i4i.jsonc` |
| Daily Digest | Yes | Depends on cron | |
| Academic Planner, reviews, notes, Non-Academic Hub | No | No | Future concept only |

## 5. Latest change log (newest first)

Use this format: Completed changes / Files modified / Commit SHA and branch / Deployed? (worker, URL) / Verification run vs not run / Known issues / Next steps.

- **2026-11-10 — Claude, added this file.** Only `PROJECT_HANDOFF.md` added; no code or config changed, nothing deployed (see `git log` for the SHA).
- **2026-11-10 — Claude, read-only review.** Repo at `98db4f8` (single commit, `main`). Test run in a sandbox without network: 45 of 49 pass, 4 fail only because `web-push` could not be installed (`ERR_MODULE_NOT_FOUND`), so the full suite has not been run. Live site not reachable from that sandbox, so deployment status is unverified.

## 6. Next tasks (in this order)

- [ ] Run `pnpm install` and `pnpm test` locally; record the real result with Node and pnpm versions.
- [ ] Check that the production deployment matches GitHub; run `node scripts/check-public-access.mjs` against the live site and record the result.
- [ ] Decide one stable mail path for the demo (forwarding, Outlook OAuth, or iPhone Shortcut); configure only that one.
- [ ] Add the `ai` binding, set `ENABLE_AI`, and verify summary and deadline extraction on sample mail.
- [ ] Add a cron trigger if reminders and the digest are in the demo; verify.
- [ ] Confirm the CDS original is unaffected.
- [ ] Later: Public Homepage with Academic / Non-Academic Hub entry points, leaving the workspace features in place.
- [ ] Record the demo video from the real site with test data only.
