# BUGS.md — Color API Bug Tracker

**Scope:** Bugs specific to the Color API (`color.endpnt.dev`). Cross-cutting bugs live at `../BUGS.md`.

**ID prefix:** `CO-NNN` (sequential, do not reuse).

**Last updated:** 2026-04-24 (created by first biweekly code health audit).

---

## Open bugs

### CO-001 — CLAUDE.md documents wrong library stack

- **Severity:** High (documentation — misleads every future CC session)
- **File:** `CLAUDE.md`
- **Discovered:** 2026-04-24 (biweekly code health audit)
- **Symptom:** `CLAUDE.md` documents the following libraries as in use: `culori`, `node-vibrant` (v4), `sharp`, `apca-w3`, `color-name-list`. None of these appear in `package.json` and none have any import in the codebase. The actual library stack is `colord` + `@bjornlu/colorblind`.

  Additionally, the CLAUDE.md's "Native Module Handling" section documents a `serverComponentsExternalPackages` config listing `sharp` and `node-vibrant`. The actual config externalizes `colord` and `@bjornlu/colorblind`.

- **Root cause:** CLAUDE.md was written during the planning/design phase describing the intended library stack. The actual implementation chose different libraries, but CLAUDE.md was never updated to reflect the change.
- **Impact:** Every future CC session working in the color repo will read CLAUDE.md, believe `node-vibrant` and `culori` are the implementation, and either (a) look for imports that don't exist, (b) attempt to write code using the documented APIs for the wrong libraries, or (c) try to install the documented libraries thinking they were accidentally removed. This is guaranteed to cause wasted time and potential incorrect changes.
- **Fix approach:**
  1. Update the `CLAUDE.md` library table to document `colord` and `@bjornlu/colorblind` with their actual purposes and gotchas.
  2. Remove the node-vibrant v4 breaking-changes section (not relevant since node-vibrant is not installed).
  3. Update the "Native Module Handling" section to reflect the actual config entries (`colord`, `@bjornlu/colorblind`).
  4. Verify by reading `lib/color/*.ts` files to confirm all actual library usage and document accurately.
- **Status:** Open. Fix on next CC session in color repo.

---

## Resolved bugs

*(None resolved yet — file created 2026-04-24.)*

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
