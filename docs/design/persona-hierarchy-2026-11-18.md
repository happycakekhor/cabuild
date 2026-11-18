# Persona overview hierarchy

The goal is to recognize the active persona quickly, with each identity field and public destination presented once. Retain the approved narrower image column and wider information column on desktop, followed by full-width sections. Preserve saved data, editing, autofill, source URLs, reference assets and the green/purple palette.

| Category | Importance and treatment | Research pattern |
| --- | --- | --- |
| Image and name | Highest recognition priority: 184px image on desktop, 144px on mobile; name 26–34px, bold. | [Slack profiles](https://slack.com/help/articles/204092246-edit-your-profile) use photos for recognition; [LinkedIn](https://www.linkedin.com/help/linkedin/answer/a554351/create-a-good-linkedin-profile?lang=en) places identity and a clear headline at the start. |
| Company, role and one-liner | Company 22px, role 16px, description 15px. Each appears once beside the image. | LinkedIn introduction patterns distinguish identity and professional context. |
| Audience and voice | Visible in the top information card; audience and voice values 16px, supporting insight/language 14px. | [Mailchimp voice and tone](https://styleguide.mailchimp.com/voice-and-tone/) connects voice with the audience and situation. These are key generation inputs in CABUILD's PRD. |
| Public profiles | One labeled logo link per distinct destination beneath the image; remove the repeated lower URL panel. Blank platforms do not consume a row. | [YouTube channel profiles](https://support.google.com/youtubecreatorstudio/answer/2657964?co=GENIE.Platform%3DDesktop&hl=en) group identity, description and links. |
| Prompt guardrails | Full-width compact section; approved and off-limits topics emphasized, remaining constraints clearly labeled. No saved constraint is omitted. | PRD prompt enrichment; [NN/g scanning research](https://www.nngroup.com/articles/how-people-read-online/) supports front-loaded information and clear labeled chunks. |
| Writing samples and media | Separate expandable sections, with counts. Full text, images, downloads and audio controls remain available. | Progressive disclosure keeps reference material from competing with identity; this is a CABUILD-specific design inference, not a copied screen. |
| Completion and edit | Completion meter beside the single Edit persona action; last-updated time remains quiet metadata. | Keep status beside the action that improves it. |

Typography follows [Atlassian's hierarchy guidance](https://atlassian.design/foundations/typography/applying-typography/). UI/UX Pro Max's installed UX dataset was queried directly for heading clarity, hierarchy and contrast because Python launchers are unavailable: use a clear size/weight difference, sequential headings and at least 4.5:1 normal-text contrast. Existing Next.js14/React18 and native details controls suffice; no new dependencies.

Validation covers unique destinations/identity text, useful content near the top, larger images with fallback, responsive alignment, keyboard disclosure, complete saved values, editing/save/autofill recovery, reduced motion and adjacent current model-selector behavior. Provider actions use fixtures.
