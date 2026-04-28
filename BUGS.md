# BUGS.md — Color API Bug Tracker

**Scope:** Bugs specific to the Color API (`color.endpnt.dev`). Cross-cutting bugs live at `../BUGS.md`.

**ID prefix:** `CO-NNN` (sequential, do not reuse).

**Last updated:** 2026-04-28.

---

## Open bugs

### CO-002 — `app/docs/page.tsx` contrast section claims APCA support that doesn't exist

- **Severity:** Medium (misleads users — APCA option is non-functional)
- **File:** `color/app/docs/page.tsx` (~lines 73-134)
- **Discovered:** 2026-04-28 (surfaced during P-007 audit)
- **Symptom:** The interactive contrast endpoint in the docs UI shows `algorithm` options `wcag`, `apca`, `both` and the description says "WCAG 2.1 and APCA algorithms." The API only supports WCAG. Selecting `apca` or `both` would either silently return only WCAG data or error.
- **Root cause:** Docs page was authored before implementation finalized on WCAG-only contrast. The `apca-w3` library was never installed.
- **Impact:** Users who select APCA or Both in the interactive tester get wrong behavior. False marketing claim.
- **Fix approach:** Change description to WCAG-only. Remove `algorithm` from `defaultParams` and `paramConfig`. Update all three code examples to remove `algorithm` field.
- **Status:** Open. Fix before public launch.

### CO-003 — `app/docs/page.tsx` rate limit numbers are wrong

- **Severity:** Low (docs show inflated limits: Starter=10K/mo, Pro=100K/mo; actual: Starter=5K/mo, Pro=25K/mo)
- **File:** `color/app/docs/page.tsx` (~lines 434-445)
- **Discovered:** 2026-04-28 (surfaced during P-007 audit)
- **Symptom:** The rate limit table in the docs page shows Starter at 10,000/month and Pro at 100,000/month. `docs/API-CATALOG.md` and `lib/config.ts` say Starter=5,000/month and Pro=25,000/month.
- **Root cause:** Docs page values were never reconciled with the enforced limits in `lib/config.ts`.
- **Fix approach:** Update the displayed limits to match `lib/config.ts` enforced values. Cross-reference `web/lib/pricing.ts` as the marketing source of truth.
- **Status:** Open. Fix before public launch.

---

## Resolved bugs

### CO-001 — CLAUDE.md documents wrong library stack

- **Originally:** High (documentation — misleads every future CC session), discovered 2026-04-24 (biweekly code health audit)
- **Resolved:** 2026-04-27
- **Resolution commit:** TBD (this commit, when pushed in the color repo)
- **What changed:** Rewrote `color/CLAUDE.md` to document the actual library stack:
  - `colord` (^2.9.3) is the core library, with 8 plugins extended at module init: `cmyk`, `lab`, `lch`, `hwb`, `harmonies`, `a11y`, `mix`, `names`. All consuming code imports `colord` from `lib/color/colord-setup.ts`, never directly.
  - `@bjornlu/colorblind` (^1.0.3) is used in `lib/color/blindness.ts` for color-blindness simulation. Single `simulate()` function, takes plain RGB object.
  - `lib/color-data/named-colors.json` is the data source for `/api/v1/name` — NOT a library.
  - Removed all references to `culori`, `node-vibrant` v4, `sharp`, `apca-w3`, `color-name-list` (none installed, none in code).
  - Updated Native Module Handling section to reflect actual `next.config.js` (externalizes `colord` and `@bjornlu/colorblind`).
  - Documented that `/api/v1/palette` is algorithmic (single color in, algorithmic palette out) NOT image-based, and flagged that `docs/API-CATALOG.md` and `web/lib/apis.ts` still incorrectly describe it as image-based (separate followup needed).
  - Documented that `/api/v1/contrast` uses WCAG only via colord's a11y plugin — no APCA.
  - Removed obsolete error codes (`FILE_TOO_LARGE`, `INVALID_IMAGE`, `IMAGE_FETCH_FAILED`, `PALETTE_EXTRACTION_FAILED`) that referenced image processing that doesn't exist.
- **Verification:** Read `package.json` (deps confirmed: only `colord` + `@bjornlu/colorblind` for color work), read `next.config.js` (externalization matches), read `lib/color/colord-setup.ts`, `lib/color/blindness.ts`, `lib/color/name.ts`, `lib/color/contrast.ts`, `lib/color/palette.ts` to ground every documented claim. Documented file paths exist; documented methods are real.
- **Followup discovered:** `docs/API-CATALOG.md` Color section description "Extract dominant colors from an image" is wrong (palette endpoint is algorithmic). `web/lib/apis.ts` likely has the same error in marketing copy. Not in scope for CO-001 — separate bug entry recommended at the platform level.
- **Lesson:** Per platform CLAUDE.md skill verification rules, CLAUDE.md must be updated whenever the underlying code structure changes. CO-001 was a library swap (planning-stage stack → implementation stack) where the doc never followed. Future audit cadence should include a quick `grep` of CLAUDE.md library mentions vs `package.json` deps to catch this class of drift early.

---

## Bug entry template

```markdown
### CO-XXX — [Short descriptive title]

- **Severity:** Critical | High | Medium | Low
- **File:** [path]
- **Discovered:** [YYYY-MM-DD, context]
- **Symptom:** [observable behavior]
- **Root cause:** [best-known explanation]
- **Impact:** [customer/security risk]
- **Fix approach:** [high-level plan]
- **Cross-reference:** [related bugs if any]
- **Status:** Open | In progress | Awaiting deployment
```
