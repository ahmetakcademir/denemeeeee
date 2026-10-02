# NARD — scent and texture

## Locked sources

- User-selected Dala / Refero style: https://styles.refero.design/style/e5f5f8cf-e68d-4ed1-bbf5-6b67569af648. Prior observed extraction in the sibling AKCA repository `docs/reference-constellation.md`: black continuity, asymmetric two columns, lightweight large neutral sans, generous spacing, a clear primary action, imagery occupying a full composition column.
- User-supplied tactile/neumorphic controls: raised button rim, directional soft shadow, inset progress track and explicit pressed state. Borrowed only for controls and the interactive guide.
- Existing NARD product assets: 1024px perfume, polo and Sovereign photos determine the brass, sage, stone and glass materials. Products/specifications remain the existing catalog.
- Refero craft references: image dimensions, visible focus, 44px touch targets, reduced motion and scroll-based continuity. Refero MCP subscription is unavailable; no paid access was attempted.

## Decisions

| Decision | Source and role | Application |
| --- | --- | --- |
| Obsidian canvas, large 400-weight sans | Dala composition | Hero and open product stories |
| Champagne/brass | Existing fragrance photo | Primary CTA and fragrance labels |
| Botanical green | Existing polo / box photo | Textile CTA and guide surface |
| Tactile raised controls | User's visual references | Buttons, language selector, guide answers |
| Source photography, 1024px WebP | Existing NARD assets | Native detail retained, smaller transfer; originals preserved |
| Three collection anchors | User goal: better UX | Direct access to fragrance, polo and set |
| Product-specific enquiry | Existing static catalog scope | Clearly worded mailto links, no checkout or stock claims |
| Small on-page guide | Existing three-question matching | Three steps, back/restart, focus continuity, local-only choices |
| Native scroll-linked photo depth | User motion request | No scroll interception; static fallback; reduced-motion disables |

## Responsive and performance boundaries

- 1320px maximum content width. At 760px and below, photos stack with copy and the main links remain visible.
- Four locale pages are statically generated. No database, API or production Node process.
- Image-led composition uses known product imagery, never fabricated illustration or enlarged thumbnails. Source image dimensions are 1024 × 1024; do not describe them as higher resolution.
- No imported WebGL/fluid simulation, audio widget, Framer Motion or modal drawer in the active page. Existing legacy components remain in source history/worktree for recoverability but are not bundled by imports.
- New media transitions require native `animation-timeline: view()` support. Other browsers retain complete still compositions. User scrolling controls motion; there is no visible pause widget.

## Acceptance

Run TypeScript, ESLint and a production static export. Root agent performs desktop/mobile browser inspection, language changes, guide back/reset/result, anchor navigation and final live screenshots before publishing completion.
