# Android screens

Read this before Phase 5. The goal: an Android version an Android user would believe was designed for them, carrying the same world as the iOS version. **Redesign, don't copy.** An iOS screen with a different status bar is the failure his v1 had and v2 fixed.

## The frame

- Canvas: **412 × 915 CSS px** (dp, Pixel class), rendered at 2.625×.
- Files go in `design/screens/android/` with `<body data-platform="android">`. The path decides the viewport, and the scanner fails a mismatch.
- `device.js` draws the status bar (time left, icons right) and the gesture handle. `var(--safe-top)` = 36px, `var(--safe-bottom)` = 24px.
- Edge-to-edge is the norm: grounds and illustrations run behind the status and gesture areas, and text and controls stay inside them.

## Type

- Text: **Roboto Flex** (`node fonts.mjs roboto-flex` → `'Roboto Flex Variable'`). `tokens.css` switches `--font-text` for Android automatically.
- The display and serif voices stay exactly as on iOS. They are the brand.
- Material 3 type scale (size / line height):

| Role | Size |
|---|---|
| Display L / M / S | 57/64 · 45/52 · 36/44 |
| Headline L / M / S | 32/40 · 28/36 · 24/32 |
| Title L / M / S | 22/28 · 16/24 (500) · 14/20 (500) |
| Body L / M / S | 16/24 · 14/20 · 12/16 |
| Label L / M / S | 14/20 · 12/16 · 11/16 (500) |

Body is 16px (Body L) for reading and 14px for dense UI.

## Shared CSS and specificity

Platform overrides in shared CSS (`body[data-platform="android"] .card`) outrank a screen's own `.card` rule and silently win. Put platform differences in the screen file, or write the screen rule with the same specificity. After any shared-CSS change, re-render **both** platforms and check that nothing slid under the top app bar.

## Components (Material 3, Expressive era)

- **Navigation bar** (replaces the tab bar; mark it up as `<nav>` so the scanner treats it as a bar): 80dp tall plus `--safe-bottom`, 3–5 destinations, icon 24dp over a 12px label. The active item sits in a **pill indicator 64×32dp** filled with a tint of the signal colour (signal at ~20% on the world ground) and has a filled icon. The flexible, shorter 64dp bar is fine for 3 items.
- **Top app bar:** small (64dp, title 22px left-aligned beside the nav icon), medium (112dp) or large (152dp, title at Headline/Display size, bottom-left). The large bar is where the hero headline lives on Android.
- **FAB:** 56dp with 16dp corners (or 96dp large for a single dominant action), bottom-right, 16dp from the edges, above the navigation bar. Extended FAB: 56dp tall with icon and label. Use it when the screen has one obvious "make a new thing" action. iOS puts that action in the content or nav bar; Android puts it in the FAB.
- **Cards:** elevated (tonal surface + small shadow), filled (world-2) or outlined (1dp rule). Corners 12–28dp. Expressive M3 encourages *varied* shapes, so one hero card can be more rounded or cut than the rest.
- **Lists:** 56/72/88dp rows, 16dp insets, leading icon or avatar 40dp, **no chevrons**.
- **Chips:** 32dp tall, 8dp corners, for filters and suggestions.
- **Bottom sheets:** 28dp top corners, 32×4dp drag handle.
- **Switches:** 52×32 track, thumb grows when on.
- **Segmented buttons:** outlined, 40dp, checkmark on the selected segment. Mark up as `role="tablist"` with `role="tab"` segments.
- **Snackbar** for confirmations, instead of iOS-style toasts.

Touch targets are at least **48×48dp** (the scanner fails smaller).

## Translating a screen: iOS → Android

| iOS | Android |
|---|---|
| Tab bar | Navigation bar with pill indicator |
| Large title under the nav bar | Large / medium top app bar |
| `‹ Back` text button | ← arrow icon button (24dp in a 48dp target), top-left |
| Chevron rows | Plain rows; the whole row is the target |
| "+" in the nav bar, or an inline button | FAB / extended FAB |
| Action sheet | Bottom sheet with list items |
| Segmented control | Segmented buttons or tabs (primary tabs under the top app bar) |
| Alert | Dialog (28dp corners, actions as text buttons bottom-right) |
| Swipe actions | Same, or long-press → contextual top bar |
| SF-style 1.75px icons | Material Symbols style: 24dp, 2px strokes, slightly squarer terminals; filled for active |
| Switch green | Switch in the signal colour |

## What must NOT change

The concept and its world colour; the signal colour and where it's used; the hero element on each screen (same content, re-laid for M3); the illustration kit and mascot; the display and serif fonts; every word of copy (except platform terms: "Settings" not "Preferences", "Google Play" not "App Store").

## Review questions for the critic (Android batch)

1. Would an Android user spot a ported iOS screen? (Chevrons, a `‹ Back` text button, an iOS tab bar and centred titles are giveaways.)
2. Is there a FAB where there should be one, and none where there shouldn't?
3. Does the screen still belong to the same world as its iOS twin, side by side?
