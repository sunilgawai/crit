# iOS screens

Read this before building or reviewing any iPhone screen. It covers what makes a screen read as *native iOS* rather than a web page in a phone-shaped box. Taste lives in `taste.md`; this file is about platform correctness.

## The frame

- Canvas: **402 × 874 CSS px** (iPhone 16 Pro, in points), rendered at 3×.
- `device.js` draws the status bar (9:41, signal, wifi, battery) and the home indicator. Don't draw your own.
- Safe areas from `device.css`: `var(--safe-top)` = 54px, `var(--safe-bottom)` = 34px. Content may run *under* the status bar (full-bleed colour or illustration is good), but text and controls start below `--safe-top`.
- Status-bar ink: `<body data-status="dark">` (black glyphs, for light grounds) or `"light"` (white, for dark or saturated grounds). Check it against the top 54px of your screen.
- Real screenshots don't show the Dynamic Island; `sheet.mjs` draws it in the frame. Never paint it into a screen.

## Type (SF Pro via `system-ui`)

Text uses `font-family: system-ui, BlinkMacSystemFont, sans-serif`, never `-apple-system` first: Chromium ignores it and falls back to Times. SF Pro switches between its Text and Display optical sizes automatically.

| Style | Size / leading | Weight |
|---|---|---|
| Large Title | 34 / 41 | 700 |
| Title 1 | 28 / 34 | 700 |
| Title 2 | 22 / 28 | 700 |
| Title 3 | 20 / 25 | 600 |
| Headline | 17 / 22 | 600 |
| Body | 17 / 22 | 400 |
| Callout | 16 / 21 | 400 |
| Subhead | 15 / 20 | 400 |
| Footnote | 13 / 18 | 400 |
| Caption | 12 / 16 | 400 |

Body text is 17px, never smaller than 15px for anything a person must read. Tracking: SF is pre-spaced, so leave `letter-spacing` alone below 20px. Use −0.01 to −0.03em above 28px.

The display voice (wordmarks, hero numerals, editorial sentences) comes from the direction's display or serif font (see `taste.md`). SF Pro is the *text* voice. Don't set a 64px hero in SF and call it designed.

## Structure

- **Navigation bar:** 44pt tall. Large-title screens put a 34px bold title on its own 52pt row under it, left-aligned with the content margin. Back is a chevron plus the previous title (or just the chevron).
- **Margins:** 16 or 20px side margins, consistent per app. Cards inset by the same margin.
- **Tab bar:** mark it up as `<nav>` (the scanner then doesn't treat its items as identical cards). 4–5 items. Either the classic bar (49pt plus `--safe-bottom`, hairline top border, translucent world colour) or the current floating style (iOS 26 "Liquid Glass": a rounded capsule inset ~16px from the sides and bottom, translucent with a backdrop blur, the active item filled). Icon 24–28px above a 10–11px label. The active item uses the **signal** colour or a filled icon. Inactive items are ink-3.
- **Lists:** grouped or plain. Rows 44–60pt, 16px insets, separators inset to the text start, chevron (`›` drawn as a 7×12 SVG stroke, ink-3) only when the row navigates.
- **Sheets:** rounded top corners (≥ 28px), a 36×5 grabber 6px from the top, content below.
- **Buttons:** primary is a filled capsule or a 14–16px radius rect at 50–56px tall, full width or hugging its label. Secondary is tinted or plain text. One primary per screen.
- **Segmented control:** for 2–4 peer views of one thing. Rounded track, sliding selected pill, 32pt tall. Mark it up as `role="tablist"` with `role="tab"` segments; the scanner then accepts segments ≥ 28pt tall.
- **Switches:** 51×31, on-state in the signal colour (or green if the signal colour would be confusing).

## Icons

Draw SF-Symbol-like icons in SVG: a 24px grid, 1.75–2px strokes, round caps and joins, optically centred. Use one stroke weight across the app. Fill only the active tab icon. No emoji, ever (the scanner fails it). For icons with personality (category glyphs, empty states), switch to the direction's illustration style instead of making the icons louder.

## Touch targets

Anything tappable is at least **44×44**, even if it looks smaller (pad it). The scanner fails anything below.

## Things that betray a web page

- Hover states, cursor styles, underlined links in body text.
- Hamburger menus (use a tab bar or a navigation stack).
- Tiny text links as primary navigation.
- Centred page titles with a logo beside them, like a website header.
- Footers.
- Content that ignores the status bar (text under 9:41).
- Modal dialogs for things that should be sheets.
- Using `100vh` sections, "hero sections" and "feature grids". A phone screen is not a landing page.
