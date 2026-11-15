# Content Creator design research — 15 November 2026

User brief: redesign all seven Content Creator pages; prioritize logos, useful controls, minimal copy and smooth motion. Research each workflow independently. These are product-pattern references from official product/help pages, not copied layouts or claims that authenticated products were tested.

## Persona and Edit Persona

| Reference | Observed pattern | CABUILD adaptation |
| --- | --- | --- |
| [LinkedIn introduction card](https://www.linkedin.com/help/linkedin/answer/a563106/information-displayed-on-the-introduction-card-on-your-profile-overview?lang=en) | Identity and professional context introduce the profile; editing is explicit. | Logo/avatar, name, role and company form a profile sidebar beside saved sections. |
| [Slack profile editing](https://slack.com/help/articles/204092246-edit-your-profile) | Profile display and edit/save are separate interactions. | Saved profile stays the landing view; Edit persona opens a labeled editor with Save and Cancel. |
| [GitHub profile personalization](https://docs.github.com/en/account-and-profile/tutorials/personalize-your-profile) | Photo, name and short bio establish identity before detailed content. | A prominent saved brand mark replaces decorative illustration; the company one-liner remains actual profile data. |
| [Notion account settings](https://www.notion.com/en-gb/help/account-settings) | Identity settings are grouped into a focused settings area. | Section navigation makes a long profile form easier to scan without unmounting its inputs. |
| [Discord custom profiles](https://support.discord.com/hc/en-us/articles/4403147417623-Custom-Profiles) | Avatar, display name and profile customization have explicit apply/save steps. | Preview is saved data; autofill remains an editable draft until Save. No invented live preview or autosave. |

## Research

| Reference | Observed pattern | CABUILD adaptation |
| --- | --- | --- |
| [Google search refinements](https://support.google.com/websearch/answer/2466433?co=GENIE.PlatformDesktop&hl=en) | Query first, with result-type and time refinements nearby. | Search modes sit above a large query row; platform/type/date scope stays adjacent. |
| [DuckDuckGo search syntax](https://duckduckgo.com/duckduckgo-help-pages/results/syntax) | Users explicitly narrow a query and distinguish exact from related results. | Preserve the submitted query and scope in result headers; do not imply unsupported query operators. |
| [Kagi lenses](https://help.kagi.com/kagi/features/lenses.html) | Visible scope makes filtered discovery understandable. | Keep platform logos and the current supported scope visible, without introducing fake saved lenses. |
| [Pinterest search](https://help.pinterest.com/en/article/search-for-ideas-on-pinterest) | Visual discovery combines search, type filtering and content previews. | Thumbnails, platform marks and preview actions anchor result rows. |
| [Ahrefs Content Explorer](https://help.ahrefs.com/en/articles/1159204-how-to-use-search-operators-within-the-search-query-of-content-explorer) | Discovery is narrowed by source and content criteria. | Saved result metrics and local filters remain distinct from paid provider searches. Recent searches reopen saved results. |

## Create Content

| Reference | Observed pattern | CABUILD adaptation |
| --- | --- | --- |
| [YouTube Studio video details](https://support.google.com/youtube/answer/57407?hl=en) | Metadata, settings and visibility are grouped; drafts are retained. | Separate brief/content from output settings, keep explicit Generate, retain draft fields. No upload or automatic-publish metaphor. |
| [Buffer composer](https://support.buffer.com/en-us/articles/scheduling-posts-4Qdld7giAZ) | Channel selection, composing and destination context coexist. | Logo-led destination selection and an accurate recipe summary accompany the prompt. |
| [Runway Gen-4 creation](https://help.runwayml.com/hc/en-us/articles/37327109429011-Creating-with-Gen-4-Video) | Prompt/reference and model/duration settings support a single generation action. | Group the supported model, aspect ratio, duration and references together. |
| [Adobe Firefly generation](https://helpx.adobe.com/firefly/web/work-with-images/generate-images/generate-images-from-text-descriptions.html) | Model selection changes applicable generation controls. | Preserve existing model-dependent controls and explicit selected states. |
| [Canva AI image generator](https://www.canva.com/ai-image-generator/) | A prompt is paired with style/aspect choices before generating. | Give the actual prompt room to edit; show only settings supported by CABUILD. No fake generated preview. |

## My Contents

| Reference | Observed pattern | CABUILD adaptation |
| --- | --- | --- |
| [YouTube watch history](https://support.google.com/youtube/answer/95725?hl=en) | History can be searched and explored by date. | Chronological date sections with horizontal thumbnail rows, status and compact metadata. |
| [Vimeo library search](https://help.vimeo.com/hc/en-us/articles/19832457988625-How-to-search-your-Library) | Search, filtering and sorting operate within a media library. | Keep type/status/search/sort controls together; changing sort does not hide jobs. |
| [Google Drive views](https://support.google.com/drive/answer/12169158?hl=en-193) | Recent files and list/grid presentation help retrieve saved work. | Use a dense, readable list optimized for finding existing content. |
| [Dropbox file activity](https://help.dropbox.com/organize/file-activity) | Timestamped activity gives saved files context. | Display actual creation dates and retain information/source/download actions. |
| [Notion search](https://www.notion.com/help/search) | Recent items and created/edited sort options aid retrieval. | Date grouping applies only to chronological sorts; alphabetical sorting stays a flat ordered list. |

## Automation

| Reference | Observed pattern | CABUILD adaptation |
| --- | --- | --- |
| [Zapier scheduled triggers](https://help.zapier.com/hc/en-us/articles/8496288648461-Schedule-Zaps-to-run-at-specific-intervals) | Cadence, date, time and timezone define a trigger separately from its actions. | Expose schedule and approval as a compact trigger-to-output sequence. |
| [Make scenario scheduling](https://help.make.com/schedule-a-scenario) | Scheduling options and next run make recurrence inspectable. | Add a saved next-run overview; paused automations are excluded. |
| [Airtable scheduled-time trigger](https://support.airtable.com/articles/5624289784-airtable-automation-trigger-at-scheduled-time) | Date/time and recurrence are structured settings. | Retain the existing weekly/interval, multiple-time and timezone editor. |
| [n8n Schedule Trigger](https://docs.n8n.io/integrations/builtin/core-nodes/n8n-nodes-base.scheduletrigger/) | Scheduled execution depends on interval and workflow timezone. | Keep timezone explicit; no decorative calendar that implies exact execution guarantees. |
| [GitHub Actions run history](https://docs.github.com/en/actions/monitoring-and-troubleshooting-workflows/monitoring-workflows/viewing-workflow-run-history) | Workflow configuration is distinct from individual run status/history. | Library, details, output approvals and run history remain separate and navigable. |

## Social Audit

Purpose: compare saved public-post samples from connected accounts. Not complete live account analytics.

| Reference | Observed pattern | CABUILD adaptation |
| --- | --- | --- |
| [Buffer Insights](https://support.buffer.com/en-us/articles/using-insights-in-buffer-x4gLauQU5a) | Channel filters and top-post exploration connect totals to evidence. | Logo-led account selector and sortable post cards preserve the path from totals to samples. |
| [Hootsuite report types](https://help.hootsuite.com/s/article/types-of-analytics-reports) | Network overview and account comparisons support different scopes. | Make All accounts versus one account explicit. |
| [Sprout Profile Performance](https://support.sproutsocial.com/hc/en-us/articles/213223226-How-do-I-use-the-Profile-Performance-Report) | Aggregated profile metrics lead into individual profile data. | Put account identity and coverage next to the metrics; retain provenance notes. |
| [Metricool Analytics](https://help.metricool.com/how-to-use-and-explore-the-analytics-tab-lmd52) | Network and main-period controls govern the current report. | Account navigation and period filters remain local, instant and consistent. |
| [Social Blade](https://socialblade.com/) | Platform/profile identification precedes a creator's statistics. | Emphasize platform marks and handles; do not add follower estimates, grades or unsupported growth charts. |

## Analyze

Purpose: inspect Content Creator publishing records, creation activity and operational status. Not audience analytics.

| Reference | Observed pattern | CABUILD adaptation |
| --- | --- | --- |
| [Linear Insights](https://linear.app/docs/insights) | View filters define the issue dataset used by charts. | One period/platform filter scope across production metrics, pipeline and records. |
| [GitHub Projects Insights](https://docs.github.com/en/issues/planning-and-tracking-with-projects/viewing-insights-from-your-project/about-insights-for-projects) | Current-state charts are distinct from historical charts. | Clearly distinguish saved status from creation activity; no fabricated status transitions. |
| [Metabase dashboard filters](https://www.metabase.com/docs/latest/dashboards/filters) | Shared filters update relevant charts and support exploration. | Pipeline controls filter the record list and move focus to the evidence. |
| [Mixpanel Insights](https://docs.mixpanel.com/docs/reports/insights) | Trend and composition views answer different questions. | Give status/format composition and dated creation activity different visual treatments. |
| [Amplitude dashboard filters](https://www.amplitude.com/docs/analytics/dashboard-filter) | A dashboard-level period/property filter updates charts together. | Keep all summary counts bound to the same actual filtered records. |

## Design decisions and delivery constraints

35 reference entries across seven independently researched workflows. UI/UX Pro Max queries: `creator studio profile search library scheduling operational dashboard minimal green logo` and `SaaS dashboard productivity minimal`. The broad creative query suggested a dark storytelling/portfolio layout, which is inappropriate for this workspace. Adopt the focused query's flat surfaces, fast interactions, SVG icons, clear focus and restrained motion; preserve CABUILD's existing green Creator identity, neutral sidebar, typography and purple Drama identity.

Use 150–230ms transitions and the existing cancellable page entrance. Section jumps respect reduced motion and keep all form controls mounted. Keep long text wrapping, 44px controls and mobile single-column layouts. Use actual saved brand assets and local platform SVGs. No additional animation dependency, remote font, fake metric, provider call on navigation, autosave or backend schema change.

Validation covers built-app desktop/mobile, keyboard access, reduced motion, draft preservation, source handoff, filters, schedule payloads, API regressions, independent read-only UAT and deployed health/auth boundaries. Paid provider runs and production writes are outside no-spend UAT.
