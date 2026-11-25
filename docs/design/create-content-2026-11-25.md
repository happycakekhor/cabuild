# Create Content redesign — 25 November 2026

## Intent and acceptance

Create Content is a dedicated page in the existing browser tab, entered from My Contents or an exact Research result. It does not add sidebar navigation. The default Video/Image/Text journey is select type, enter a prompt, Generate. The normal desktop controls and primary action should fit a laptop viewport; mobile and expanded optional tools may scroll instead of shrinking controls or clipping content. Existing brand, shared page titles, model mapping, references, asynchronous generation, failure recovery, library filters, and saved data remain.

## Ten website references

Reviewed official public product pages and the linked workflow descriptions on 25 November 2026. Screenshots are actual public pages, not authenticated editor sessions. Capture gallery: `C:/Codex/MarkdownFiles/CA/create-content-research-2026-11-25/index.html`; full-size PNGs and `reference-board.png` are alongside it. Adobe was also read, but screenshot access was denied; it is not counted among these ten captures.

| Website and source | Observed pattern | Application to CABUILD | Screenshot |
| --- | --- | --- | --- |
| [Runway](https://runway.com/product) and [official generation guide](https://help.runwayml.com/hc/en-us/articles/37327109429011-Creating-with-Gen-4-Video) | Dedicated creation tools; prompt/reference inputs with a model selector. Guide describes an older model, used only as layout evidence. | One creation workspace; compact model selection. | runway.png |
| [Canva](https://www.canva.com/features/ai-video-generator/) | Prompt-led creation with generated video presented separately from editing capabilities. | Start with an idea, keep output review in My Contents. | canva.png |
| [VEED](https://www.veed.io/tools/ai-video) | Prominent prompt box and Generate action; upload/refinement options nearby. | Main prompt gets most space; references stay one click away. | veed.png |
| [invideo](https://invideo.io/make/ai-video-generator/) | Idea first; length and platform provide direction. | Useful defaults with platform and duration visible. | invideo.png |
| [Descript](https://www.descript.com/ai/generate-video) | Prompt or inspiration input; model choice supports the creative task. | Optional reference input, without a separate mandatory setup step. | descript.png |
| [HeyGen](https://www.heygen.com/tool/ai-video-generator) | Public prompt composer places image attachment, model, ratios, and Generate together. | Compact settings beside the prompt, one main Generate action. | heygen.png |
| [Synthesia](https://www.synthesia.io/features/ai-video-generator) | Short description, optional uploaded context, orientation, and one creation action. | Keep attachments optional and the main action visible. | synthesia.png |
| [Kapwing](https://www.kapwing.com/ai-video-generator) | Prompt, optional references, model/aspect selection, then refinement. | Simple first pass, with additional controls available when needed. | kapwing.png |
| [Buffer](https://buffer.com/ai-assistant) | Platform-aware post writing with optional refinement/rewriting. | Platform visible; AI brief assistance and publishing copy expandable. | buffer.png |
| [Luma](https://lumalabs.ai/app) | Dedicated creative workspace carrying context across multiple formats and revisions. | Keep source context and in-session drafts through back navigation. | luma.png |

## Synthesis and design decisions

The recurring patterns are prompt-led entry, a small set of format controls, optional references, and one obvious creation action. This is a design inference from public product demonstrations and documented workflows, not an assertion that every signed-in editor has an identical layout. CABUILD uses its existing green/neutral styling instead of copying another product's identity.

- Two main panels: a large prompt and optional writing tools on the left; compact type, platform, model, format and Persona on the right.
- AI brief assistance and caption/hashtags are collapsed by default. They keep their values in the same form. Reference assets use the existing accessible dialog/picker flow, with a selected count on the prompt toolbar.
- An action bar in normal document flow summarizes the intended output; it never overlays expanded fields during keyboard navigation. Native validation requires a real prompt; direct creation starts blank instead of submitting generic sample copy.
- Canonical URL is `/?view=create`, with optional exact source ID. Legacy `/?view=publish&compose=1` resolves to the new route. My Contents remains the active sidebar section; the breadcrumb and shared header identify Create Content.
- The library and draft stay mounted during in-session switching so history filters, form values, uploaded files, and background polling survive. Success clears the completed draft and library filters; queue failures leave the draft editable. Research video refinement still requires explicit final review before generation.
- Existing provider settings, model estimate labels, reference exclusions for image/text, and generation request mapping are preserved. Billing behavior is outside this UI change. No paid provider calls are used in testing.

## UI/UX skill and validation

Applied CABUILD delivery/project and UI UX Pro Max. The broad design-system suggestion returned useful minimalism guidance but unrelated color/font and funnel recommendations; those are not applied. Its narrower progressive-disclosure query did not produce a verified matching disclosure rule, so the disclosure choice is grounded in the references and the user's minimal-screen requirement. Existing labeled controls, visible focus, mobile readable sizing, and reduced-motion handling are retained.

Focused UAT covers default laptop screen fit, mobile overflow, keyboard/focus, type-specific options, Persona/reference selection and uploads, AI brief failure/recovery, queue failure/success, draft/filter/polling continuity, research source/review, missing-source state, and legacy/direct browser history. Independent UAT and deployment evidence are recorded in the persistent project log.