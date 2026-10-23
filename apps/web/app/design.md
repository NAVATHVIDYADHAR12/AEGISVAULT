# Aegis-inspired Design System

This document describes the visual language used by Aegis Vault and provides a reusable prompt for bringing the same kind of premium, calm, security-focused feel to another product. Treat the colors below as the current reference palette; adapt their semantic roles when a different brand needs a different accent.

## 1. Design direction

**Design language:** luxury enterprise SaaS × cybersecurity, expressed with restrained dark surfaces, botanical green, soft cyan, and muted brass.

The experience should feel secure, thoughtful, and human. It should look polished enough for an enterprise product without feeling like a bank portal or a wall of security jargon. Use clear hierarchy, purposeful empty space, and a few carefully chosen moments of motion. The interface should explain what it does before asking people to make decisions.

### Principles

- **Quiet confidence:** dark, low-noise foundations and strong readable type. Reserve bright color for meaningful states and actions.
- **Clarity before decoration:** every visual element should help someone understand status, content, or the next step.
- **Layered depth:** distinguish the page, panels, cards, and overlays with subtle changes in tone, fine borders, and restrained blur.
- **Security with warmth:** forest green suggests health and trust; brass adds a premium highlight; cyan marks active controls and interactive focus.
- **Motion with purpose:** motion confirms a state change, guides attention, or reveals a story. It should never make routine work feel slower.
- **Consistent across marketing and product:** the landing page and workspace share typography, surfaces, borders, and motion. Public-facing pages may use more storytelling; the product UI stays more compact and task-focused.

## 2. Color palette

These values are a practical starting point drawn from the Aegis visual system. Keep contrast and semantic consistency when adapting them.

| Token / role | Reference color | Use |
| --- | --- | --- |
| `canvas` | `#050608` | Deep page background and large negative-space areas |
| `surface-1` | `#090E0B` | Main workspace and green-black page surfaces |
| `surface-2` | `#0A0D11` | Raised panels, navigation, cards, and dialogs |
| `surface-3` | `#111812` | Nested sections, input surfaces, and hover states |
| `text-primary` | `#F5F7FA` | Main headings and high-priority content |
| `text-secondary` | `#A3ADA6` | Body text, descriptions, and secondary labels |
| `text-muted` | `#78837C` | Metadata and quiet supporting details; do not use for essential text |
| `border-subtle` | `rgba(145, 180, 153, 0.16)` | Card edges and dividers |
| `green` | `#55D6A0` | Healthy state, completion, and positive status |
| `green-deep` | `#284B39` | Forest-green surfaces and restrained brand emphasis |
| `cyan` | `#55D6DF` | Primary workspace actions, selected states, and focus cues |
| `sky` | `#69CCE9` | Secondary stop in the cyan action gradient |
| `mint` | `#9ADBD0` | Soft highlight at the end of selected gradients |
| `gold` | `#F4C66A` | Premium detail, important metrics, and warm emphasis |
| `brass` | `#77602D` | Muted gold/green landing-page gradient stop |
| `danger` | `#F09A91` | Error text and destructive warnings; pair with a dark red-brown surface |

### Color usage rules

1. Use near-black and green-black for most of the canvas. Separate surfaces by small tonal steps, not by making every card a different color.
2. Keep the primary text close to white. Use muted gray-green for body text and metadata, while maintaining readable contrast.
3. Use **cyan-to-sky-to-mint** for high-value workspace actions and focusable active controls:

   ```css
   linear-gradient(112deg, #55D6DF 0%, #69CCE9 52%, #9ADBD0 100%)
   ```

4. Use **forest green-to-muted brass** sparingly for brand or landing-page emphasis:

   ```css
   linear-gradient(110deg, #284B39 0%, #77602D 100%)
   ```

5. Green means healthy or complete; gold means premium or noteworthy; cyan means actionable or selected. Do not use color alone to communicate a status—include a label or icon.
6. Avoid broad, saturated electric-blue areas, rainbow gradients, and glowing borders on every component. Glow is an accent, not a default surface treatment.

### Starter CSS tokens

```css
:root {
  color-scheme: dark;
  --color-canvas: #050608;
  --color-surface-1: #090e0b;
  --color-surface-2: #0a0d11;
  --color-surface-3: #111812;
  --color-text: #f5f7fa;
  --color-text-secondary: #a3ada6;
  --color-text-muted: #78837c;
  --color-border: rgb(145 180 153 / 16%);
  --color-green: #55d6a0;
  --color-green-deep: #284b39;
  --color-cyan: #55d6df;
  --color-sky: #69cce9;
  --color-mint: #9adbd0;
  --color-gold: #f4c66a;
  --color-brass: #77602d;
  --color-danger: #f09a91;
  --gradient-action: linear-gradient(112deg, #55d6df 0%, #69cce9 52%, #9adbd0 100%);
  --gradient-brand: linear-gradient(110deg, #284b39 0%, #77602d 100%);
  --shadow-panel: 0 24px 80px rgb(0 0 0 / 32%);
}
```

## 3. Typography

### Typeface roles

- **UI and body:** Inter, with system sans-serif fallbacks. Use it for paragraphs, labels, controls, navigation, tables, and dense product information.
- **Display and large headings:** Space Grotesk, with Inter and system sans-serif fallbacks. Use it for hero titles, page titles, and a small number of prominent metrics.

```css
--font-ui: Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
--font-display: "Space Grotesk", Inter, ui-sans-serif, system-ui, sans-serif;
```

Use a compact type scale with clear contrast between display, section, card, and body text. Prefer sentence case and short labels. Large headings can be tight and confident; body copy should remain comfortable to read, with generous line-height. Use uppercase sparingly for tiny eyebrow labels, with increased letter spacing. Avoid all-caps paragraphs, overly thin weights on dark backgrounds, and mixing decorative typefaces.

## 4. Layout and composition

- Use a centered content container with a practical maximum width around **1,260 px** on desktop. Let the layout breathe on wide screens and use consistent side padding on smaller screens.
- Build sections from a clear grid: hero, product preview, value proposition, capabilities, trust/security, workflow or use cases, closing action, and footer.
- Give the hero an editorial structure: concise eyebrow, memorable headline, short explanation, one clear primary action, a quieter secondary action, and a product visual that supports the promise.
- Use generous vertical rhythm between marketing sections. Product pages can be denser, but preserve clear grouping and scan paths.
- Keep dashboard navigation, page title, and primary action visually distinct. A workspace can use a sidebar and a compact top bar; keep duplicate brand marks out of the same visual header area.
- Use cards to group related content, not to wrap every individual line. Prefer aligned edges, consistent radii, and deliberate asymmetry only in storytelling sections.
- Design mobile layouts intentionally: stack columns, preserve the most important action, collapse secondary navigation, and keep dialogs usable within the viewport.

## 5. Surfaces and component styling

### Panels and cards

Use deep green-black surfaces with a fine, low-contrast border. Create depth with subtle radial tint, a soft shadow, and a small brightness change on hover. Avoid heavy outlines and excessive translucency behind ordinary content.

### Glass and blur

Reserve glassmorphism for floating navigation, assistant/chat panels, and modal backdrops. Use a dark translucent fill and modest `backdrop-filter: blur(...)`; keep content behind it subdued enough for text to remain legible. Use a visible border and shadow so the panel retains a clear edge. Never use blur as the only way to distinguish a modal from its page.

### Buttons and controls

- Primary actions use a cyan/sky/mint gradient in the workspace, with dark high-contrast text where legible.
- Landing-page brand actions may use the forest-green/brass gradient. Do not apply both gradients randomly within one flow.
- Secondary actions use a quiet surface or text treatment with a clear hover and focus state.
- Buttons have consistent height, radius, padding, and icon alignment. Keep labels specific: “Create vault”, “Invite teammate”, or “Save changes” rather than generic “Continue” where context can be stated.
- Inputs use dark surfaces, clear labels, visible focus rings, helpful validation, and errors adjacent to the field.
- Status chips combine a small icon or dot with a readable word. Use green/cyan/gold meaningfully, not decoratively.

### Visualizations

Charts should use a restrained set of green, cyan, and muted gold series over a dark surface. Draw axes and grid lines softly. Animate the plotted path from its origin and reveal supporting values in sequence. Preserve labels and values when animation is disabled.

## 6. Motion and interaction

Motion should be refined and quick. A useful default is **180–320 ms** for control transitions and **450–800 ms** for section or product-story reveals. Use smooth ease-out for entrances and gentle ease-in-out for ambient motion. Keep loops slow and subtle; most animations should run once when content enters view.

| Motion pattern | Behavior | Good use |
| --- | --- | --- |
| Page entrance | Fade in with a slight upward settle; stagger related elements by roughly 50–100 ms | Initial page content |
| Scroll reveal | Reveal a heading, image, or card group as it enters the viewport; use a short blur-to-sharp or masked text reveal | Major content sections |
| Counter | Count from zero to the real value once when visible; respect reduced motion and expose the final value to assistive technology | Trust metrics and dashboard totals |
| Chart draw | Animate a line/path from its origin and bring bars or area fills in with a short stagger | Analytics and security activity |
| Card edge travel | Move a soft, narrow highlight along part of a border on hover | Featured product visuals |
| Hover response | Slight lift, subtle border brightening, and a restrained cyan or green glow | Interactive cards and product previews |
| Floating navigation | Hide while scrolling down and reappear while scrolling up, with a compact slide/fade transition | Public landing page |
| Story scene | Use a small number of layered visuals with controlled depth as the page scrolls | Product explanation or workflow story |
| Treadmill/marquee | Continuous horizontal movement with a pause-on-hover option and a static/reduced-motion fallback | A short pre-footer proof or capability strip |
| Assistant reveal | Open a glass panel with a short fade/scale settle; keep chat controls immediately usable | In-product help |

### Motion rules

- Trigger viewport animations with an intersection observer or equivalent and avoid repeatedly restarting them on tiny scroll movements.
- Prefer **word/phrase-level** reveals over individual-letter animation for long content. Letter-by-letter effects can reduce readability and feel slow; reserve them for a very short hero phrase.
- Never delay access to essential text, navigation, forms, or controls until an animation completes.
- Use `transform` and `opacity` for most motion to keep it smooth. Avoid large parallax movement that makes content hard to follow.
- Support `prefers-reduced-motion: reduce`: remove continuous movement, disable parallax and letter-by-letter effects, shorten transitions, and show all content immediately.
- Make hover effects available through visible keyboard focus and active states as well.

## 7. Imagery and visual storytelling

Use product UI, diagrams, and abstract security imagery that supports the product story. Images may sit behind a dark green tint or a soft radial glow, but keep text and controls crisp. A landing page can reveal a few layered, softly blurred visuals as the visitor scrolls; keep the imagery calm and consistent with the product rather than using generic stock cyber imagery. Ensure decorative images have empty alternative text and meaningful images have concise descriptive alt text.

## 8. Voice and content

Write in direct, calm language. Explain what a feature does, who benefits, and what happens next. Keep security statements precise and supportable; avoid claims such as “unhackable” or absolute guarantees. Prefer practical explanations and short paragraphs to buzzwords. Onboarding should guide people through one useful next step at a time.

## 9. Accessibility and responsive quality

- Meet WCAG AA contrast for normal text and controls; do not rely on muted text for important instructions.
- Provide visible keyboard focus, semantic headings, labelled form fields, descriptive button names, and sensible tab order.
- Make dialogs keyboard accessible: trap focus while open, close with Escape when appropriate, restore focus to the opener, and label the dialog.
- Preserve chart meaning with text summaries or accessible data tables.
- Keep touch targets comfortably sized and controls usable at narrow widths and browser zoom.
- Honor reduced-motion preferences and ensure the design remains understandable without animation, hover, or color perception.
- Test the actual interface at desktop, tablet, and mobile widths rather than only shrinking the desktop layout.

## 10. Copy-ready design prompt

Replace the bracketed details and give this prompt to a design or coding assistant:

> Design and build **[PROJECT NAME]**, a **[WHAT IT DOES]** product for **[AUDIENCE]**, using **[STACK]**. Give it a premium, calm, trustworthy enterprise SaaS feel with a restrained cybersecurity aesthetic. Use a near-black and green-black foundation (`#050608`, `#090E0B`, `#0A0D11`), high-contrast soft-white text (`#F5F7FA`), readable muted gray-green supporting text (`#A3ADA6`), fine botanical-green borders, and restrained green, cyan, and muted-gold accents. Use Inter for interface/body text and Space Grotesk for display headings, with sensible system fallbacks. Use cyan-to-sky-to-mint gradients for primary product actions and forest-green-to-muted-brass only for selected brand moments. Keep the layout editorial, spacious, responsive, and easy to scan; use a centered content width near 1,260 px on wide screens. Build layered dark cards with subtle borders and soft shadows; reserve glass blur for floating navigation, assistant panels, and modal backdrops. Use purposeful motion: short staggered entrances, scroll-triggered section reveals, once-only count-up metrics, chart paths that draw from their origin, restrained hover lift/glow, and only a few controlled scroll-story effects. Keep animations fast, readable, and secondary to the task; honor `prefers-reduced-motion`. Make every screen keyboard accessible, mobile usable, high contrast, and clear without animation. Use specific plain-language copy and make security claims only when the implementation supports them. Adapt the product content and semantic colors to this project while preserving the same restrained, premium visual character. Avoid bright-blue-heavy screens, excessive neon/glow, decorative clutter, generic stock cyber imagery, and motion that delays or hides essential content. First establish reusable design tokens and shared components, then apply them consistently to the landing page and the working product UI.

## 11. Project-specific adaptation checklist

- [ ] Replace the product name, audience, and feature story while preserving the visual principles.
- [ ] Map the palette to the product’s real status meanings; keep contrast and avoid color-only communication.
- [ ] Define shared typography, spacing, radii, borders, shadows, and motion tokens before styling individual screens.
- [ ] Use the same component language across marketing, authentication, and the signed-in product.
- [ ] Keep primary actions obvious and make forms and navigation functional.
- [ ] Add motion only where it clarifies hierarchy, state, or product behavior.
- [ ] Check reduced motion, keyboard flow, contrast, and responsive layouts.
- [ ] Verify the final result with real content and interaction states, including loading, empty, success, and error states.
