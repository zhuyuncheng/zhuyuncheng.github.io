# Design QA

## Evidence

- Source visual truth: `screenshots/qa/design-reference-option-2.png`
- Implementation screenshot: `screenshots/qa/implementation-home-desktop-viewport.jpg`
- Side-by-side comparison: `screenshots/qa/design-qa-comparison.jpg`
- Responsive evidence: `screenshots/qa/implementation-home-mobile-viewport.jpg`
- Viewport: desktop 1440 × 1024 CSS px; mobile 390 × 844 CSS px
- Source pixels: 1487 × 1058
- Implementation pixels: 1440 × 1024 at device scale factor 1
- Normalization: both desktop images were fitted proportionally into equal-width, top-aligned comparison frames; no crop or device frame was applied.
- State: homepage, default light state, top of page

## Full-view comparison evidence

The implementation preserves the selected direction's ink-blue, orange and green palette; map texture; two equal Build/Roam portals; featured travel story; thin editorial rules; restrained surface treatment; compact header; and article index. It intentionally uses a taller real page than the concept image so Chinese body copy remains readable rather than being compressed to mockup scale.

## Focused region comparison

A separate crop was not needed. The navigation, hero, channel portals and featured-story region are fully visible in the 1440 × 1024 side-by-side evidence, and both source and implementation were also inspected at original resolution. The lower article index was inspected in the full-page desktop capture.

## Findings

- No remaining P0, P1 or P2 issues.
- P3: the latest-articles index begins below the first desktop viewport, whereas the concept compresses the entire page into one frame. This is an accepted usability deviation: implementation text stays at a practical reading size and the primary channel and featured-story paths remain visible above the fold.
- P3: the generated concept includes denser decorative map detail. The implementation uses a quieter custom topographic texture to protect headline contrast.

## Required fidelity surfaces

- Fonts and typography: system Chinese sans-serif stack, bold display headline, readable 15–16px body copy, consistent metadata scale and no unexpected truncation in the primary paths.
- Spacing and layout rhythm: 1180px content shell, balanced two-column portals, thin separators and consistent section gaps. Mobile collapses to one column with no horizontal overflow.
- Colors and tokens: ink `#10233f`, technology orange `#dd5a2a`, travel green `#33704b`, warm paper and low-contrast borders match the selected direction.
- Image quality and asset fidelity: custom 1440 × 500 topographic background and 1200 × 520 Kyoto editorial photograph are sharp, correctly cropped and contain no placeholder, watermark or text artifacts.
- Copy and content: the user-selected theme “去读他的书，去做他的事” is the primary headline; technical and travel copy clearly explain their distinct purposes.

## Interaction and runtime checks

- Travel navigation opens `/travel/` and exposes the correct page heading.
- Search opens and closes successfully.
- Homepage primary links resolve to archive and about routes.
- Browser console checked: no warnings or errors.
- Mobile 390px viewport checked: document and content width both equal the viewport; no horizontal overflow.

## Comparison history

1. Initial P2: hero and featured regions were substantially taller than the visual target (`489.97px` hero, `331.29px` channel portals, `293.47px` feature; page height `1881px`).
2. Fix: reduced hero typography and vertical padding, tightened channel spacing, reduced feature height and condensed article rows.
3. Post-fix evidence: hero `371.20px`, channel portals `310.87px`, feature `257.23px`, page height `1638px`; selected hierarchy is retained while more of the travel feature enters the first viewport.

## Follow-up polish

- Replace the first travel-method article with a real destination guide when trip content is available.
- Add more travel covers as the section grows so the grid develops a stronger visual rhythm.

final result: passed
