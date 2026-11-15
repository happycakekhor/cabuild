# Unified content workspace research — 15 November 2026

User request: create inside My Contents; align Persona like a profile without the empty column beneath its picture; put Research recents on the right, keep View all, remove the separate history button, and add very quick row entrances.

## References researched before implementation

| Product / primary reference | Pattern | CABUILD decision |
| --- | --- | --- |
| [Figma file creation](https://help.figma.com/hc/en-us/articles/360038511153-Create-a-new-file) | Create is available from the file browser's current drafts/project context. | My Contents is the single navigation destination; Create Content is an action within it. |
| [Runway navigation](https://help.runwayml.com/hc/en-us/articles/24298206897043-Navigating-Runway) | Generative sessions keep inputs and chronological outputs in a shared workspace. | Keep the history mounted and visible below the inline editor; polling continues while composing. |
| [Vimeo video creation](https://help.vimeo.com/hc/en-us/articles/12426490688913-How-to-create-a-video-on-Vimeo-with-the-video-editor) | Creation starts from Home; saved projects return to Library. | Explicit generation returns attention to My Contents. Do not introduce upload or automatic publishing. |
| [Buffer AI Assistant](https://support.buffer.com/en-us/articles/using-buffers-ai-assistant-qbBulfw9sn) | Assistance is available within publishing/composing and ideas contexts. | Retain the existing optional brief assistant inside the shared editor. No AI call on opening it. |
| [Adobe Express projects](https://helpx.adobe.com/express/web/brands-libraries-projects/create-projects-libraries/projects-create-files-brands.html) | A project contains existing files and a Create action. | Creation is scoped to the existing content workspace, with one sidebar item and predictable Back/Forward. |

These are interaction patterns researched from public official documentation, not claims of testing authenticated third-party products. Existing profile and search references are documented in content-creator-research-2026-11-15.md.

## Implementation criteria

- One My Contents heading and sidebar destination. Create opens an inline editor on that page; collapsing retains the same draft DOM. History/search/filter state remains mounted. Successful generation closes/resets the submitted editor and retains the queued output. Old `?view=create&source=...` links resolve to the integrated workspace; new links use `?view=publish&compose=1` with the exact source preserved.
- A full-width Persona identity header followed by aligned detail cards, without a permanently empty left rail. Use saved logo/avatar assets and preserve all profile fields and editing behavior.
- Research uses a main search surface plus a consistent right-hand Recent searches panel on wide screens. View all opens full saved history. Small screens stack the panel below the form. Recents open saved results without paid searches.
- UI/UX Pro Max targeted query: `stagger entrance reduced motion --domain ux`. Apply reduced-motion and motion-sensitivity guidance. Honor the user's explicit row-animation request with small transform/opacity entrances lasting160ms, stagger18ms capped at90ms, no remounts, cancellation on preference changes/navigation, no replay on typing or polling, and no animation dependency.
- Verify desktop/mobile, keyboard visibility, source handoff, canonical/legacy links, Back/Forward, collapse/reopen draft retention, async outputs, all history access and reduced motion. Independent UAT and deployed checks remain required; all paid provider writes are mocked.
