---
title: "SOTA: Hugo Static Site Generator - 2026 State & Upgrade Guide"
author: "Your Name"
date: 2026-07-28T12:00:00-05:00
lastmod: 2026-07-28T12:00:00-05:00
draft: false
description: "State-of-the-art survey of Hugo as of July 2026 (latest: v0.164.0), with every finding sourced and an upgrade plan grounded against the PKB-theme repository."
comments: false
series: []
tags: ["Hugo", "SOTA", "static site generator", "upgrades", "theme development", "render hooks"]
categories: ["development"]
slug: "sota-hugo"
toc: true
sidenotes: true
---

# SOTA: Hugo Static Site Generator

> As of **2026-07-28**. Mode: **survey** (repo-grounded against PKB-theme). Freshness: findings older than 12 months are flagged [STALE]. Every numbered claim ends with its source and access date; anything unverifiable is marked [UNVERIFIED].

## TL;DR

- The latest Hugo release is **v0.164.0** (2026-07-06). Roughly 25 minor releases shipped in the last 19 months; the project is very actively maintained, still centered on Bjørn Erik Pedersen.
- The big theme-author events of the period: the **v0.146 template-system rewrite** (new `layouts/` structure), **v0.148 render-hook `useEmbedded` enums** (replacing `enableDefault`), the **v0.156 mass removal** of long-deprecated APIs, **v0.158 `languageCode` → `locale`**, **v0.163 per-format imaging config**, and **v0.164 `resources.PostProcess` → `templates.Defer`**.
- PKB-theme's in-progress migration to `useEmbedded = 'fallback'` is **correct** (minimum version v0.148.0, verified). But its CI pins Hugo **0.123.7 / 0.128.0** - below the theme's own `min_version = "0.136.0"` and far below the README's new "v0.148+" claim. Aligning versions is the top action.
- Concrete code updates for this repo: replace `.Page.Scratch` (deprecated v0.138.0) in the `cite`/`sidenote` shortcodes, move the global `imaging.quality` into per-format blocks, rename `languageCode` → `locale`, and audit two non-standard render hooks (`render-inline.html`, `render-paragraph.html`) that are not part of Hugo's documented hook set.

## Landscape

### Release train & maintenance

Hugo ships a minor release roughly every 3–5 weeks with patch releases in between. From v0.140.0 (2024-12-17) to v0.164.0 (2026-07-06) there were 25 minor lines, the majority of which introduced at least one deprecation or small breaking change - Hugo deprecates aggressively and removes on a ~6–18 month horizon. Maintenance is healthy but concentrated: `bep` accounts for ~60–68% of commits; `jmooring` is the most visible secondary maintainer; ~210 open issues with closure rate exceeding creation rate over the last year. License: Apache-2.0. No formal public roadmap - direction is visible via GitHub milestones (v0.165.0 is the current one). ([releases](https://github.com/gohugoio/hugo/releases), [contributors](https://api.github.com/repos/gohugoio/hugo/contributors), [milestone 370](https://github.com/gohugoio/hugo/milestone/370), accessed 2026-07-28)

### Template system (the v0.146 era)

The headline architectural change of the period is the **fully refreshed template system** in v0.146.0 (2025-04-10): one unified lookup path for layouts, base templates, shortcodes, and render hooks that walks the template tree matching kind, layout, type, output format, media type, language, and variants against the full page path. The modern structure drops `layouts/_default/` (standard templates live directly under `layouts/`), renames special directories to `_partials/`, `_shortcodes/`, `_markup/` (placeable at any level), requires `home.html` instead of `index.html`, uses `baseof.list.html`-style base names, and adds an `all.html` catch-all. Backward compatibility for the old structure is **best-effort, not guaranteed** - the release notes explicitly say to test before going live, and v0.146 warns about and skips non-hook templates placed under `_markup`. ([v0.146.0](https://github.com/gohugoio/hugo/releases/tag/v0.146.0), [new template system overview](https://gohugo.io/templates/new-templatesystem-overview/), accessed 2026-07-28)

On top of that: `try` error handling (v0.141.0), partial decorators with the `inner` keyword plus `reflect.IsPage/IsSite/IsResource/IsImageResource` (v0.154.0), and `templates.Defer` replacing `resources.PostProcess` (deprecated v0.164.0).

### Markdown & render hooks

The documented render-hook set as of v0.164.0 is: `render-link`, `render-image`, `render-heading`, `render-passthrough`, `render-codeblock`, `render-blockquote`, and `render-table`, recommended at `layouts/_markup/` (legacy `layouts/_default/_markup/` still works). The passthrough hook (v0.132.0) with its `-block`/`-inline` variants is the documented pipeline for server-side mathematics together with the Goldmark passthrough extension. In v0.148.0 the boolean `enableDefault` config for link/image hooks was deprecated in favor of the `useEmbedded` enum (`auto`/`never`/`always`/`fallback`). v0.160.0 added `.Position`/`.Ordinal` to all hooks. ([render hooks introduction](https://gohugo.io/render-hooks/introduction/), [passthrough](https://gohugo.io/render-hooks/passthrough/), [markup config](https://gohugo.io/configuration/markup/), accessed 2026-07-28)

### Config & content model

Hugo's config surface churned significantly: a new YAML parser (v0.152.0 - unquoted `yes/no/on/off` are now **strings**, anchors/aliases supported), the **multidimensional content model** via `sites.matrix` (v0.153.0 - languages × versions × roles, deprecating `lang` on mounts/segments and `includeFiles`/`excludeFiles`), language key renames (`languageCode`→`locale`, `languageName`→`label`, `languageDirection`→`direction`, v0.158.0), removal of `paginate`/`paginatePath` (v0.156.0, use `pagination.pagerSize`), and module `version` queries on imports (v0.150.0, ranges v0.155.0).

### Asset pipelines

JavaScript: `js.Batch` (v0.140.0, grouped bundles with global code splitting), `js.Build` `drop` option (v0.144.0), es2024 target. CSS: native `css.Build` (v0.158.0) with `hugo:vars` custom-property injection (v0.160.0, nested in v0.161.0). Sass: **libsass deprecated in favor of dartsass** (v0.153.0) - extended builds still ship libsass; dartsass must be installed separately. Node tooling: since v0.161.0, PostCSS/Babel/TailwindCSS run with Node's `--permission` flag, **Node ≥ 22 is required, and the standalone Tailwind executable is no longer supported** (must be a Node package).

### Imaging

`images.QR` and `images.Mask` (v0.141.0), WASM-based WebP with animation support (v0.153.0), AVIF encode/decode (v0.162.0), and per-format quality config with a content-aware `hint` option (v0.163.0, deprecating global `imaging.quality`/`imaging.compression`).

### Security hardening

v0.161.0 tightened default `security.http.urls`; v0.162.0 **denies `text/html` content files by default** (new `security.allowContent` policy), rejects symlinked `resources.Get` entries, and re-checks URL allowlists on redirect hops.

## Findings

1. **Latest release: Hugo v0.164.0, published 2026-07-06.** Adds Chroma dark/light style pairs, `encoding.HexEncode`/`HexDecode`, `crypto.Hash`, Pandoc citation support, sub-paths in layouts passed to `.Render`, and fixes a performance regression from v0.128.0. Deprecates `resources.PostProcess` in favor of `templates.Defer`. No newer release exists as of today (verified against the releases page). ([v0.164.0](https://github.com/gohugoio/hugo/releases/tag/v0.164.0), accessed 2026-07-28)

2. **v0.146.0 (2025-04-10) [STALE] rewrote the template system.** Unified lookup over the full page path; modern structure: no `_default/`, `_partials/`/`_shortcodes/`/`_markup/` at any level, `home.html`, `all.html` catch-all, `baseof.list.html`; new `templates.Current` and `time.In`. Back-compat is best-effort - "make sure you test your site before going live"; some real-world breakages reported; non-hook templates under `_markup` are warned about and skipped. ([v0.146.0](https://github.com/gohugoio/hugo/releases/tag/v0.146.0), [overview](https://gohugo.io/templates/new-templatesystem-overview/), accessed 2026-07-28)

3. **`_internal` templates: doc-removed, not runtime-removed.** v0.146 removed the *concept* from documentation (use `{{ partial "opengraph.html" . }}` etc.), but old `{{ template "_internal/..." }}` calls still execute; formal deprecation of the construct is an open v0.165.0 milestone item (#13553). *Corrected in verification - the fan-out's "removed in v0.146" claim was overstated.* ([overview](https://gohugo.io/templates/new-templatesystem-overview/), [issue #13553](https://github.com/gohugoio/hugo/issues/13553), accessed 2026-07-28)

4. **Current render-hook set:** `render-link`, `render-image`, `render-heading`, `render-passthrough`, `render-codeblock`, `render-blockquote`, `render-table`. Recommended location `layouts/_markup/`; `layouts/_default/_markup/` still works via back-compat. ([render hooks](https://gohugo.io/render-hooks/introduction/), accessed 2026-07-28)

5. **`render-passthrough` arrived in v0.132.0 (2024-08-12)** with `render-passthrough-block.html` / `render-passthrough-inline.html` variants; paired with the Goldmark passthrough extension configured under `markup.goldmark.extensions.passthrough` (block delimiters e.g. `\[...\]`, `$$...$$`; inline `\(...\)`). ([v0.132.0](https://github.com/gohugoio/hugo/releases/tag/v0.132.0), [passthrough](https://gohugo.io/render-hooks/passthrough/), [mathematics](https://gohugo.io/content-management/mathematics/), accessed 2026-07-28)

6. **`enableDefault` → `useEmbedded` (v0.148.0).** Link/image embedded render hooks are now controlled by an enum: `auto` (default), `never`, `always`, `fallback`. `enableDefault` is deprecated. ([markup config](https://gohugo.io/configuration/markup/), [v0.148.0](https://github.com/gohugoio/hugo/releases/tag/v0.148.0), accessed 2026-07-28)

7. **`.Page.Store` replaced `.Page.Scratch` in v0.138.0** - Scratch was aliased to Store and is **formally deprecated** ("Deprecated in v0.138.0. Use the Page.Store method instead."). `site.Store`, `hugo.Store`, and `Shortcode.Store` followed in v0.139.0 (2024-11-18). *Corrected in verification - earlier drafts attributed page.Store to v0.139.0/v0.146.0.* ([page.Scratch](https://gohugo.io/methods/page/scratch/), [site.Store](https://gohugo.io/methods/site/store/), [v0.138.0](https://github.com/gohugoio/hugo/releases/tag/v0.138.0), [v0.139.0](https://github.com/gohugoio/hugo/releases/tag/v0.139.0), accessed 2026-07-28)

8. **`try` template error handling: v0.141.0** (2025-01-16); `resources.GetRemote` now uses it internally. Same release: `images.Mask`, `images.QR`, `alignx` for `images.Text`; Twitter shortcode deprecated in favor of X. ([v0.141.0](https://github.com/gohugoio/hugo/releases/tag/v0.141.0), accessed 2026-07-28)

9. **Partial decorators and type reflection: v0.154.0** (2025-12-31) - the `inner` keyword lets partials reverse caller/callee roles; `reflect.IsPage`, `reflect.IsSite`, `reflect.IsResource`, `reflect.IsImageResource` added. ([v0.154.0](https://github.com/gohugoio/hugo/releases/tag/v0.154.0), accessed 2026-07-28)

10. **v0.156.0 (2026-02-18) removed the long-deprecated API surface** (verified against release notes): `data.GetCSV`/`GetJSON`, `crypto.FNV32a`, `resources.Babel`/`PostCSS`/`ToCSS`, `.Paginator.PageSize`, config keys `paginate`/`paginatePath`, `.Site.Author`/`.Site.Authors`/`.Site.Social`, `.Site.LastChange`, `.Site.IsMultiLingual`, `.Sites.First`, and the `getjson`/`getcsv` file caches. Newly deprecated: `.Site.AllPages`, `.Site.BuildDrafts`, `.Site.Languages`, `.Site.Data`, `.Page.Sites`, `.Site.Sites`. ([v0.156.0](https://github.com/gohugoio/hugo/releases/tag/v0.156.0), accessed 2026-07-28)

11. **`paginate` config key: deprecated v0.128.0, removed v0.156.0** - use `[pagination] pagerSize`. ([v0.156.0](https://github.com/gohugoio/hugo/releases/tag/v0.156.0), accessed 2026-07-28)

12. **Language config keys deprecated in v0.158.0** (2026-03-16): `languageCode`→`locale`, `languageName`→`label`, `languageDirection`→`direction`, with matching `.Site`/`.Language` method deprecations. Same release added native `css.Build` and `strings.ReplacePairs`. ([v0.158.0](https://github.com/gohugoio/hugo/releases/tag/v0.158.0), accessed 2026-07-28)

13. **Front matter deprecations:** `_build` → `build` (v0.145.0); `kind`, `lang`, `path` deprecated (v0.144.0). Permalink tokens `:filename`/`:slugorfilename` deprecated in favor of `:contentbasename`/`:slugorcontentbasename` (v0.144.0); `:sectionslug`/`:sectionslugs` added (v0.149.0). ([v0.145.0](https://github.com/gohugoio/hugo/releases/tag/v0.145.0), [v0.144.0](https://github.com/gohugoio/hugo/releases/tag/v0.144.0), [v0.149.0](https://github.com/gohugoio/hugo/releases/tag/v0.149.0), accessed 2026-07-28)

14. **Top-level `googleAnalytics` key / `.Site.GoogleAnalytics`:** deprecated v0.120.0, announced for removal ~v0.134.0; current docs only document `services.googleAnalytics.id` accessed as `.Site.Config.Services.GoogleAnalytics.ID` - the old key is gone in v0.164. [UNVERIFIED: the exact removal release; v0.134–0.136 notes don't call it out, but the current-state docs are unambiguous.] ([services config](https://gohugo.io/configuration/services/), [discourse](https://discourse.gohugo.io/t/site-googleanalytics-was-deprecated-in-hugo-v0-120-0-and-will-be-removed-in-hugo-0-134-0/51395), accessed 2026-07-28)

15. **Top-level `[author]` config deprecated v0.120.0 [STALE]** - use `params.author.name` / `params.author.email`. ([v0.120.0](https://github.com/gohugoio/hugo/releases/tag/v0.120.0), accessed 2026-07-28)

16. **YAML parser switch in v0.152.0 (2025-10-21) is a quiet breaking change:** unquoted `yes`/`no`/`on`/`off` now parse as strings, not booleans; YAML anchors/aliases now supported. ([v0.152.0](https://github.com/gohugoio/hugo/releases/tag/v0.152.0), accessed 2026-07-28)

17. **Multidimensional content model: v0.153.0** (2025-12-19) - `sites.matrix` for languages × versions × roles; deprecates `lang` on mounts/segments and mount `includeFiles`/`excludeFiles` (new `files` filter); deprecates libsass in favor of dartsass; WASM WebP encode/decode with animation. ([v0.153.0](https://github.com/gohugoio/hugo/releases/tag/v0.153.0), accessed 2026-07-28)

18. **Aliases beginning with `/` are site-relative since v0.155.0** (2026-01-28), not server-relative - breaking for multidimensional sites. Same release: version-range queries, XMP/IPTC metadata. ([v0.155.0](https://github.com/gohugoio/hugo/releases/tag/v0.155.0), accessed 2026-07-28)

19. **Modules matured:** `version` query option on imports (v0.150.0), version ranges (v0.155.0), and `Page.GitInfo` works for module-mounted content (v0.157.0). Meanwhile the official Quick Start **still teaches git submodules** for themes - submodules remain the documented beginner path; Modules are the component-based advanced path. ([v0.150.0](https://github.com/gohugoio/hugo/releases/tag/v0.150.0), [v0.157.0](https://github.com/gohugoio/hugo/releases/tag/v0.157.0), [quick start](https://gohugo.io/getting-started/quick-start/), accessed 2026-07-28)

20. **JS pipeline:** `js.Batch` with global code splitting (v0.140.0 [STALE]), esbuild `platform` option and es2024 target, `drop` option for `js.Build` (v0.144.0 [STALE]). ([v0.140.0](https://github.com/gohugoio/hugo/releases/tag/v0.140.0), [v0.144.0](https://github.com/gohugoio/hugo/releases/tag/v0.144.0), accessed 2026-07-28)

21. **CSS pipeline:** native `css.Build` (v0.158.0), `hugo:vars` custom-property injection via `@import "hugo:vars"` (v0.160.0), nested vars in `css.Build`/`css.Sass` (v0.161.0). ([v0.158.0](https://github.com/gohugoio/hugo/releases/tag/v0.158.0), [v0.160.0](https://github.com/gohugoio/hugo/releases/tag/v0.160.0), [v0.161.0](https://github.com/gohugoio/hugo/releases/tag/v0.161.0), accessed 2026-07-28)

22. **Node tooling constraints since v0.161.0 (2026-04-28):** PostCSS/Babel/TailwindCSS run under Node's `--permission` flag; Node ≥ 22 required; the standalone Tailwind CSS executable is no longer supported - Tailwind must be installed as a Node package. ([v0.161.0](https://github.com/gohugoio/hugo/releases/tag/v0.161.0), accessed 2026-07-28)

23. **Imaging:** WASM WebP + animated WebP (v0.153.0), partial AVIF/HEIF/HEIC metadata (v0.157.0), full AVIF encode/decode (v0.162.0, 2026-05-26), per-format quality + content-aware `hint` (v0.163.0, 2026-06-08) with global `imaging.quality`/`imaging.compression` **deprecated**; `resources/jsconfig` `baseUrl` support removed (v0.163.0). ([v0.162.0](https://github.com/gohugoio/hugo/releases/tag/v0.162.0), [v0.163.0](https://github.com/gohugoio/hugo/releases/tag/v0.163.0), accessed 2026-07-28)

24. **Security defaults tightened:** v0.161.0 restricted default `security.http.urls`; v0.162.0 denies `text/html` content files unless allowed via `security.allowContent`, rejects symlinked `resources.Get` entries, and re-validates URL allowlists across redirects. ([v0.161.0](https://github.com/gohugoio/hugo/releases/tag/v0.161.0), [v0.162.0](https://github.com/gohugoio/hugo/releases/tag/v0.162.0), accessed 2026-07-28)

25. **Server-side math is a first-class pipeline:** Goldmark passthrough extension + `render-passthrough` hook + `transform.ToMath` (KaTeX; `mhchem` extension since v0.144.0). ([mathematics](https://gohugo.io/content-management/mathematics/), [v0.144.0](https://github.com/gohugoio/hugo/releases/tag/v0.144.0), accessed 2026-07-28)

26. **Chroma dark/light style pairs (v0.164.0)** - syntax highlighting can now ship paired light/dark themes, directly relevant to sites with a dark-mode toggle. ([v0.164.0](https://github.com/gohugoio/hugo/releases/tag/v0.164.0), accessed 2026-07-28)

27. **Distribution notes:** `hugo deploy` only ships in `withdeploy` archives (or `-tags withdeploy`) since v0.137.0 [STALE]; extended builds ship libsass (deprecated), so dartsass must be installed separately and selected with `transpiler = 'dartsass'`. ([hugo deploy](https://gohugo.io/hosting-and-deployment/hugo-deploy/), [css.Sass](https://gohugo.io/functions/css/sass/), accessed 2026-07-28)

28. **v0.165.0 horizon (open milestone):** Goldmark v2 beta upgrade, `css.ChromaStyles`, `.Render` taking additional data, formal `_internal` deprecation, embedded render-hook error handling, Goldmark CJK extension, slug support for sections/taxonomies, and a possible change to the default `baseUrl`. ([milestone 370](https://github.com/gohugoio/hugo/milestone/370), accessed 2026-07-28)

29. **Content adapters** (`_content.gotmpl`, v0.126.0 [STALE]) generate pages from local/remote data and can now create home pages (v0.148.0) - the current best practice for data-driven sections, replacing external pre-build scripts. ([v0.126.0](https://github.com/gohugoio/hugo/releases/tag/v0.126.0), [v0.148.0](https://github.com/gohugoio/hugo/releases/tag/v0.148.0), accessed 2026-07-28)

30. **Archetypes current behavior:** `hugo new content` with `--kind`; lookup order project → theme → module; leaf-bundle archetypes require at least one file per subdirectory. ([archetypes](https://gohugo.io/content-management/archetypes/), accessed 2026-07-28)

## Comparison vs. current repo (PKB-theme)

Grounding: PKB-theme is itself a Hugo theme (`theme.toml` `min_version = "0.136.0"`). The working tree is mid-migration to v0.148+ patterns. Status of each area against the findings above:

| Area | Repo state (file) | Latest Hugo | Gap / action |
|---|---|---|---|
| Version floor | `theme.toml` min 0.136.0; README (working tree) claims "v0.148+"; CI pins 0.123.7 ([test.yml](https://github.com/stradichenko/PKB-theme/blob/main/.github/workflows/test.yml)) and 0.128.0 ([hugo.yml](https://github.com/stradichenko/PKB-theme/blob/main/.github/workflows/hugo.yml)) | v0.164.0; `useEmbedded` needs ≥0.148.0 (F6) | **CI pins are below the theme's own min_version** - bump CI to ≥0.148.0 (or latest); align `theme.toml` min_version with the README's 0.148+ claim |
| CI health | [test.yml](https://github.com/stradichenko/PKB-theme/blob/main/.github/workflows/test.yml) contains an **unresolved git merge conflict** (`<<<<<<< HEAD` / `>>>>>>> gh-pages`) | - | Resolve before any CI run is meaningful |
| Render-hook config | Working tree: `useEmbedded = 'fallback'` in [hugo.toml](https://github.com/stradichenko/PKB-theme/blob/main/config/_default/hugo.toml) + new [markup.toml](https://github.com/stradichenko/PKB-theme/blob/main/config/_default/markup.toml) with footnote/passthrough | Exactly the v0.148.0 enum form (F6); passthrough config matches docs (F5) | Correct - complete and commit the migration |
| Render hooks | Has `render-link`, `render-passthrough`, `render-codeblock-mermaid`, `render-codeblock-goat` - plus non-standard `render-inline.html` and `render-paragraph.html` | Documented set: link/image/heading/passthrough/codeblock/blockquote/table (F4); v0.146+ warns/skips unknown templates under `_markup` (F2) | Audit `render-inline`/`render-paragraph` - almost certainly dead code now that the passthrough hook handles math; remove or rename |
| Scratch | `.Page.Scratch.Get/Set` in [cite.html](https://github.com/stradichenko/PKB-theme/blob/main/layouts/_shortcodes/cite.html) (4 calls) and [sidenote.html](https://github.com/stradichenko/PKB-theme/blob/main/layouts/_shortcodes/sidenote.html) (2 calls) | `.Page.Store`; Scratch **deprecated v0.138.0** (F7) | Mechanical rename to `.Page.Store` |
| Imaging config | Global `quality = 85` under `[imaging]` ([hugo.toml:73](https://github.com/stradichenko/PKB-theme/blob/main/config/_default/hugo.toml)) | Global `imaging.quality` deprecated v0.163.0 (F23) | Move to `[imaging.webp]` / `[imaging.avif]` per-format blocks |
| Language config | `languageCode = 'en-us'` ([hugo.toml:2](https://github.com/stradichenko/PKB-theme/blob/main/config/_default/hugo.toml)) | `languageCode` → `locale` deprecated v0.158.0 (F12) | Rename key |
| Layout structure | Legacy: `layouts/_default/`, `layouts/partials/`, `layouts/shortcodes/`, `layouts/_default/_markup/` | Modern v0.146 structure (F2) | Works today via best-effort back-compat; migrate deliberately with testing - the legacy structure is frozen, not evolving |
| `_internal` templates | Not used ✓ | Construct slated for formal deprecation v0.165 (F3) | Nothing to do - keep using partials |
| Analytics config | `[services.googleAnalytics]` present; no `.Site.GoogleAnalytics` usage ✓ | Old key removed (F14) | Already modern |
| QR codes | [qr.html](https://github.com/stradichenko/PKB-theme/blob/main/layouts/_shortcodes/qr.html) calls external `api.qrserver.com`; [page-qr.html](https://github.com/stradichenko/PKB-theme/blob/main/layouts/_shortcodes/page-qr.html) uses native `images.QR` | `images.QR` native since v0.141.0 (F8) | Migrate `qr.html` to `images.QR`; drop the external dependency |
| Math rendering | KaTeX loaded client-side ([head.html](https://github.com/stradichenko/PKB-theme/blob/main/layouts/_partials/head.html)) **and** MathJax via `math.html` (deleted) - two renderers referenced | Server-side pipeline: passthrough + `transform.ToMath` (F25) | Pick one renderer; consider server-side KaTeX to match the new passthrough hook |
| RSS link | Hard-coded `{{ .Site.BaseURL }}index.xml` in [footer.html](https://github.com/stradichenko/PKB-theme/blob/main/layouts/_partials/footer.html) | `.OutputFormats.Get "RSS"` | Minor robustness fix |
| SEO meta | Hand-rolled Open Graph/Twitter Cards/JSON-LD partials | Hugo's embedded `opengraph.html`/`twitter_cards.html`/`schema.html` now usable as plain partials (F3) | Optional simplification - current hand-rolled versions are more complete; no urgency |
| Sitemap | `scripts/generate-sitemap.js` overwrites `public/sitemap.xml` post-build | Native `[sitemap]` output (already configured) | Evaluate whether the Node script is still needed |
| Menu entries | `.URL` on menu entries in [menu.html:23](https://github.com/stradichenko/PKB-theme/blob/main/layouts/_partials/menu.html) | `.PageRef` is the documented modern accessor | [UNVERIFIED: formal deprecation status] - low-priority cleanup |
| Content security | All content is Markdown | `text/html` content denied by default since v0.162.0 (F24) | No action; note for users who add `.html` content |
| Syntax highlighting | Theme has a dark-mode toggle | Chroma dark/light style pairs (F26) | Opportunity: paired Chroma styles per color scheme |

## Recommendations

Prioritized; finding references in parentheses.

**P0 - build health & correctness**

1. **Align the version floor everywhere (F6, F12).** Bump CI to a single recent Hugo (≥0.148.0, ideally 0.164.x), set `theme.toml` `min_version = "0.148.0"` to match the README's claim, and resolve the merge conflict in `.github/workflows/test.yml`. CI currently tests a version the theme forbids.
2. **Complete the in-progress `useEmbedded = 'fallback'` migration and commit it** (F6) - verified correct; the split into `config/_default/markup.toml` for footnote/passthrough matches how Hugo merges theme vs. site markup config.
3. **Replace `.Page.Scratch` with `.Page.Store`** in `cite.html` and `sidenote.html` (F7). Scratch has been formally deprecated since v0.138.0; the rename is mechanical and behavior-preserving.
4. **Migrate `imaging.quality = 85` to per-format blocks** (F23) before requiring ≥0.163.0: `[imaging.webp] quality = 85`, `[imaging.avif] quality = 85`.
5. **Rename `languageCode` → `locale`** (F12) in root and exampleSite configs.

**P1 - modernization**

6. **Remove or rename the non-standard render hooks** `render-inline.html` and `render-paragraph.html` (F2, F4) - they are not in Hugo's documented hook set; v0.146+ warns about and skips unknown templates under `_markup`. The passthrough hook now covers their math use case.
7. **Migrate the QR shortcode to native `images.QR`** (F8) and drop the external `api.qrserver.com` dependency.
8. **Resolve the KaTeX-vs-MathJax duplication** (F25): keep one client-side renderer, or move to server-side `transform.ToMath` (KaTeX + `mhchem`) fed by the passthrough hook the theme just added.
9. **Plan a deliberate migration to the v0.146 layout structure** (F2): `layouts/_markup/`, `_partials/`, `_shortcodes/`, `home.html`. Not urgent (back-compat holds), but do it as one tested changeset rather than drifting.
10. **Replace the hard-coded footer RSS URL** with `.OutputFormats.Get "RSS"`.

**P2 - watch items**

11. **Do not adopt `{{ template "_internal/..." }}`** anywhere - formal deprecation lands in v0.165 (F3).
12. **Test against Goldmark v2 when v0.165 ships** (F28) - the Markdown parser upgrade is the next likely breaking event for render hooks.
13. **If Tailwind/PostCSS is ever added:** Node ≥ 22 and package-installed CLI are mandatory since v0.161.0 (F22).
14. **Consider Chroma dark/light style pairs** (F26) for code blocks to match the theme's color-scheme toggle.

## Coverage disclosure

- **Searched:** GitHub release notes v0.120.0–v0.164.0 (primary), v0.165.0 milestone #370, gohugo.io docs (new template system overview, markup configuration, render hooks introduction/passthrough, mathematics, services, outputs/output-formats, quick start, archetypes, `page.Scratch`/`site.Store` method pages, hugo deploy, css.Sass), Hugo Discourse (GoogleAnalytics deprecation, content adapters), GitHub API (contributors/issues/commits for health signals), and a full local inventory of the PKB-theme repo (layouts, configs, CI, working-tree diff).
- **Not covered:** arXiv (skipped deliberately - a static site generator has no academic-literature angle; no relevant papers exist to survey). Community theme-ecosystem comparisons (Docsy/Blowfish/etc. were not benchmarked). Build-performance benchmarks. Non-English sources. Hugo's own documentation site internals beyond the pages listed.
- **Dropped in verification:** "fragments" as a standalone new feature - unverifiable beyond the existing `Page.Fragments` ToC method; no claim made. The fan-out's "`_internal` removed in v0.146" and "`page.Store` in v0.139.0/v0.146.0" claims were **corrected** (see F3, F7).
- **Limitations:** exact `googleAnalytics` removal release unverifiable from release notes (current-state docs confirm removal - F14). The v0.139.0 date (2024-11-18) was pinned contextually against neighboring releases. Web research was compiled partly from agent transcripts after an early termination; all load-bearing claims it produced were re-verified in the adversarial pass. This report is a snapshot of a fast-moving project - re-run in `track` mode in ~3 months.

## Source list

- https://github.com/gohugoio/hugo/releases (v0.120.0 – v0.164.0 tag pages) - accessed 2026-07-28
- https://github.com/gohugoio/hugo/milestone/370 - accessed 2026-07-28
- https://github.com/gohugoio/hugo/issues/13553 - accessed 2026-07-28
- https://gohugo.io/templates/new-templatesystem-overview/ - accessed 2026-07-28
- https://gohugo.io/render-hooks/introduction/ - accessed 2026-07-28
- https://gohugo.io/render-hooks/passthrough/ - accessed 2026-07-28
- https://gohugo.io/configuration/markup/ - accessed 2026-07-28
- https://gohugo.io/configuration/services/ - accessed 2026-07-28
- https://gohugo.io/configuration/output-formats/ - accessed 2026-07-28
- https://gohugo.io/configuration/outputs/ - accessed 2026-07-28
- https://gohugo.io/configuration/security/ - accessed 2026-07-28
- https://gohugo.io/content-management/mathematics/ - accessed 2026-07-28
- https://gohugo.io/content-management/archetypes/ - accessed 2026-07-28
- https://gohugo.io/methods/page/scratch/ - accessed 2026-07-28
- https://gohugo.io/methods/site/store/ - accessed 2026-07-28
- https://gohugo.io/getting-started/quick-start/ - accessed 2026-07-28
- https://gohugo.io/hosting-and-deployment/hugo-deploy/ - accessed 2026-07-28
- https://gohugo.io/functions/css/sass/ - accessed 2026-07-28
- https://discourse.gohugo.io/t/site-googleanalytics-was-deprecated-in-hugo-v0-120-0-and-will-be-removed-in-hugo-0-134-0/51395 - accessed 2026-07-28
- https://discourse.gohugo.io/t/content-adapters-examples-and-performance/49830 - accessed 2026-07-28
- https://api.github.com/repos/gohugoio/hugo/contributors - accessed 2026-07-28

**Related notes:** [Creating Posts with Hugo](creating-posts.md), [Development Tips](development-tips.md), [Hugo SEO Implementation Guide](hugo-seo.md). See also the [glossary](glossary.md) for shared terminology.
