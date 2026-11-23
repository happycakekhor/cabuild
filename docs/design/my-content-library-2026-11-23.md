# My Content: library and detail viewer

## Research before design

Reviewed primary product documentation on 2026-11-23. These are pattern references, not a request to copy another product's branding or add its features.

| Source | Observation | CABUILD decision |
| --- | --- | --- |
| [Vimeo library](https://help.vimeo.com/hc/en-us/articles/12426274382609-Vimeo-library-overview) | Thumbnail selection opens an asset; download is a separate action. | One whole-card opener with a separately reachable download link. |
| [Vimeo video page](https://help.vimeo.com/hc/en-us/articles/23079730858513-About-the-Vimeo-video-page) | Prominent media with title and description alongside. | Large contained video/image preview next to saved publishing copy on desktop; stack on phones. |
| [Vimeo settings](https://help.vimeo.com/hc/en-us/articles/12426156259473-Video-settings-page-overview) | Video metadata and publishing copy belong with the selected video. | Move dates and generation settings into the detail viewer; remove external date headings. |
| [Frame.io panels](https://help.frame.io/en/articles/9101032-panel-overview) | Viewer and asset details offer different levels of information without repeated navigation. | Keep media and information in one popup; preserve list/filter/scroll context beneath it. |
| [Wistia embeds](https://support.wistia.com/en/articles/8233354-embed-your-media) | Popover playback opens above the page; responsive inline players support readable layouts. | User-triggered inline playback in the popup, no autoplay or separate Preview button. |
| [Carbon modal guidelines](https://www.carbondesignsystem.com/building-blocks/core/components/modal/guidelines) | Long dialog bodies scroll while the header remains visible; avoid horizontal overflow. | Fixed close/header, scrollable dialog body and bounded long-text sections. |
| [W3C HTML dialog](https://www.w3.org/WAI/WCAG22/Techniques/html/H102) | Native modal dialogs provide background inertness, focus containment and Escape behavior. | Retain the native ContentDialog; stop nested cancel events from closing the parent. |
| [W3C nested dialog example](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/dialog/) | Nested readers restore focus to their invoking control. | Expand opens a second readable full-text dialog; closing it returns to Expand, closing details returns to the card. |

UI UX Pro Max query `keyboard focus modal --domain ux` returned visible focus and focus-not-obscured guidance. Applied to card activation, independent download targets, scroll regions and nested dialogs. Keep existing CABUILD typography, green palette and 44px actions; no new dependency or animation library.

## Design and data decisions

- Replace date-grouped horizontal rows with a responsive thumbnail card grid. Caption is the visible heading and saved brief description supplies the secondary copy. Each card contains platform, media type, status and Download. No Preview or Info button; no date outside details.
- Direct-generation internal titles are derived from the submitted prompt. Do not use them as library titles. Saved caption/description take precedence; missing copy uses an explicit untitled/missing state. Full original title and both submitted/provider prompts remain in creation history.
- Read the description from the related saved brief, or recorded generation settings when available. No inferred/AI-generated descriptions, destructive migration or provider requests. Multi-line caption continuation can supply the library excerpt if a separate description is absent.
- The viewer contains actual media, caption, description, hashtags, dates, model, persona/settings, errors, references and research source. Long text has bounded keyboard-scrollable areas and Expand only on actual overflow. Full text stays untruncated in the reader.
- Store the selected publishing ID, deriving current data on each refresh so an open generating item updates when it completes.
- Keep existing asynchronous generation, filtering, content ownership, Drama isolation and authenticated download routes. Sorting by title follows visible publishing copy.

## Acceptance / UAT

Verify grid at 1440/1101/768/390/320 and short landscape; no overflow or clipped controls. Click thumbnail, copy and blank card areas; Enter/Space open the same popup. Download never opens it. Dates only appear inside details. Confirm caption/description never fall back to prompt text. Check image/video/text, missing/broken media, queued/failed/ready data, long Unicode strings, source/references, nested Escape/backdrop/focus restoration and page position. Poll completion must update the open popup without resetting playback on unrelated refresh. Search, all sort options, filters/reset, empty states, Create editor, history and owner-scoped download denial retain existing behavior. Fixture all writes and paid providers for local/production tests.
