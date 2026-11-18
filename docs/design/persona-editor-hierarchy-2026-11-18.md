# Edit Persona hierarchy

Apply the approved Persona overview principles to editing, retaining one active owner-scoped profile, existing save/autofill contracts, source URLs and reusable media. The six category references and hierarchy rationale in [Persona overview research](persona-hierarchy-2026-11-18.md) remain applicable.

- **Image and core profile:** larger saved logo/avatar (184px desktop, 144px tablet/phone) on the left; wider core profile on the right. Name uses 26px, company 22px, other input values 15px. Mobile stacks the cards without duplicating identity in a sidebar.
- **Audience and voice:** full-width section immediately after identity. Related fields share a two-column desktop grid and a single-column phone flow. Values stay editable in their one canonical control.
- **Supporting material:** native disclosures for writing samples, media and guardrails reduce initial form length. Approved/off-limits topics lead the guardrail section. Remove chips that merely repeat the saved version of an editable value. Closing a disclosure does not unmount or disable its inputs.
- **Actions and status:** one Save/Cancel group near live draft completion. Sticky actions stay available on taller viewports; short landscape viewports use normal flow to leave room for fields. Dialog controls remain separate from the main form.

Additional primary design references consulted for this editor:

1. [GOV.UK question pages](https://design-system.service.gov.uk/patterns/question-pages/): related questions can share a page and use a clear section heading. Apply grouping here, without turning an existing profile editor into a wizard.
2. [UK Parliament form design](https://designsystem.parliament.uk/how-tos/designing-forms/): frequent editing benefits from fewer transitions; progressive disclosure can keep a longer form manageable.
3. [Scottish Government form guidance](https://designsystem.gov.scot/guidance/forms/form-design): group related questions and order them by their task context.

UI/UX Pro Max's installed UX dataset was queried directly for input labels and progressive disclosure because the available Python launchers are inaccessible. Its visible-label guidance is applied to every field, including media labels, with keyboard-accessible file inputs and visible focus. The established green palette, Next.js14/React18 stack and reduced-motion behavior remain; no new dependencies.

Acceptance: readable identity hierarchy; one control per field/action; desktop alignment and no horizontal overflow down to320px; keyboard disclosures/upload controls; completion responds to edits; closed sections preserve payloads; failed saves/autofill retain drafts; cancel restores saved values; successful mocked saves survive reload; no paid provider calls or real production mutations during UAT.
