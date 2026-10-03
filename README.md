# Reasonably Clever

The static website for Reasonably Clever's product strategy, design, and engineering services.
Built with Astro, TypeScript, and plain CSS. A small framework-free script powers the
theme toggle. The site uses self-hosted fonts and does not need an API, database, or server runtime.

Built and designed by Marcus & Tami McBride, 2026. Made in California.

## Local development

Use **Node.js 22.19.0 or newer** (a current Node 22 or 24 LTS release is recommended)
and npm. The Node minimum includes the requirements of Astro's transitive dependencies.

```sh
npm ci
npm run dev
```

Open the local URL printed by Astro, normally `http://localhost:4321`.

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the local development server |
| `npm run check` | Check Astro templates and TypeScript |
| `npm run build` | Generate the static website in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Build and run the homepage's static-output tests |

## Homepage

- `src/pages/index.astro`: homepage copy and the hero, services, principles, and contact sections.
- `src/components/`: reusable logo, contact link, service card, and principle card.
- `src/layouts/SiteLayout.astro`: shared document metadata, local font imports, and skip link.
- `src/styles/global.css`: design tokens, desktop layout, focus states, and responsive styles.
- `public/favicon.svg`: a matching vector brand mark.
- `tests/homepage.test.mjs`: checks content, heading structure, contact links, local fonts, and static output.

Both "Say hello!" links open `mailto:reasonablyclever@gmail.com`. Their destination is
shared in `src/components/ContactLink.astro`.

The desktop layout follows the supplied 1440px design: a 1200px content area, three
service columns, and two principle columns. At 800px and below, both card grids stack
into one column; smaller screens receive reduced gutters, spacing, and heading sizes.
Content determines section heights so text can wrap without being truncated.

The logo is recreated as SVG geometry and Work Sans lettering. An original vector
asset can replace it later if exact brand geometry is needed.

Three intentional accessibility adjustments differ from the design export: lighter
"How we work" text, light footer-button text, and lighter copyright text. These preserve
the palette while meeting a 4.5:1 contrast target for small text. Links also have visible
keyboard-focus and hover states.

### Dark mode

The small sun/moon control in the upper right switches between light and dark mode.
The site follows the device preference until the visitor chooses a theme, then saves
that choice in local storage under `reasonably-clever-theme` for future visits.
The choice overrides later device changes and synchronizes across open tabs.
Clearing that storage entry restores automatic device preference.

The script in `public/theme.js` applies the saved theme before the page renders to avoid
a flash of the wrong palette. If storage is blocked, the control still works for the
current visit and logs a warning. Without JavaScript the control is hidden and CSS
continues to follow the device preference.

Dark mode follows the supplied dark design layers: `#1B2723` hero and cards,
`#111A17` services background, `#FBF9F3` headings and brand marks, and `#9FB0AA`
body copy. The teal principles section and dark contact footer retain their backgrounds;
number badges change to teal. The dark-mode "Services" label uses the brighter teal
`#66BFB3` rather than `#117A70` to meet the small-text contrast target.
The logo, favicon, focus outlines, and browser theme color also respond to the preference.

## Hosting scope

The production output in `dist/` is suitable for Firebase Hosting. Firebase project
configuration, CLI deployment scripts, and Squarespace custom-domain DNS changes are
intentionally deferred. No Firebase project or deployment command is configured yet.

## Dependency advisory

The current dependency audit reports
[GHSA-ch52-4w7c-c8xp](https://github.com/advisories/GHSA-ch52-4w7c-c8xp) in Astro's
transitive `http-cache-semantics@4.2.0` dependency. No patched release is currently
published. npm lists both the affected package and Astro, its parent dependency.

This homepage generates static files and does not implement authenticated responses
or server-side response caching; the affected library is not shipped to visitors.
Recheck `npm audit` when updating tooling, especially before adding server-rendered
pages. Do not apply `npm audit fix --force`: its proposed downgrade is not a suitable
remediation for this project.