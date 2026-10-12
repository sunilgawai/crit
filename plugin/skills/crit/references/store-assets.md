# Store assets

Read this in Phase 8. Store assets are the first thing anyone sees of the app. They are product design, not an export step.

## Required outputs (what `store.mjs` produces)

| Asset | Size | Notes |
|---|---|---|
| App Store screenshots | 1320 × 2868 (6.9") | Portrait, up to 10. The first three carry the pitch. |
| App Store icon | 1024 × 1024 | PNG, **opaque, no alpha, square corners** (iOS applies the mask). `store.mjs` strips alpha. |
| Google Play screenshots | 1080 × 1920 | 2–8 per device type. Sides 320–3840px, long side ≤ 2× short side. |
| Google Play icon | 512 × 512 | 32-bit PNG with alpha. Google applies the mask. |
| Adaptive icon layers | 432 × 432 each | Foreground (transparent) + background. Keep the subject inside the centre **66dp circle of the 108dp canvas** (≈ 264px of 432); the rest may be cropped. |
| Feature graphic | 1024 × 500 | JPEG or 24-bit PNG, no alpha. |

## `design/store/store.json`

```json
{
  "background": "#F3EEE4",
  "ink": "#1C1A17",
  "headlineFont": "'Fraunces Variable', serif",
  "headlineWeight": 400,
  "ios":     [{ "image": "renders/screens/ios/01-home.png",     "headline": "Every plant, watered on time." }],
  "android": [{ "image": "renders/screens/android/01-home.png", "headline": "Every plant, watered on time." }],
  "icon": "store/icon.svg",
  "iconForeground": "store/icon-foreground.svg",
  "iconBackground": "store/icon-background.svg",
  "featureGraphic": "store/feature-graphic.html"
}
```

- Paths are relative to `design/`.
- `headlineWeight` defaults to 400 and is never synthesised: use a weight the font actually has (Instrument Serif and DM Serif Display only have 400).
- Render the screens first (`render.mjs`).
- `background` can differ per platform only by running `store.mjs` twice with edited configs; usually one world colour is right for both stores.
- If the screenshots' own grounds match `background`, the device edge disappears. Pick a store background one step deeper or lighter than the app's world (e.g. `--world-2`), or the signal colour if the headline ink still passes contrast.

## Screenshots that sell

1. **The first screenshot is the whole pitch.** It shows the hero screen and a 3–6 word benefit headline. Many people never swipe.
2. **One message per screenshot**, in order of what a stranger needs: what it does → the best moment → how it fits their life → the trust or price story.
3. **Headlines in the app's voice** (see `copy.md`), ≤ 6 words, sentence case, in the display or serif font.
4. **Real UI with real data.** No mockups inside mockups, no "lorem", no feature bullet lists.
5. **Vary the screens.** If two shots look the same at thumbnail size, cut one.
6. Optional: one screenshot that is pure brand (the mascot or the world illustration full-bleed, plus the headline). It works as the third or last shot.

## The icon

- One silhouette, readable at 60px and at 29px. Render the 1024 PNG, scale it down and check.
- It comes from the concept: the mascot's face, the world's object, the hero shape. Not a letter in a gradient square, and no text.
- Use at most 2–3 colours, from the world palette and the signal colour.
- iOS: draw on a full square; don't round the corners yourself. Android adaptive icon: put the subject in the foreground layer within the safe circle and the colour field in the background layer.
- Draw it as a **standalone** SVG with `viewBox="0 0 1024 1024"` (adaptive layers: `0 0 108 108`): paste the shapes in rather than `<use>`-ing them from `illustrations.svg`. Icons are rendered as images, which can't reach other files (`store.mjs` refuses them).
- Check it small: `sips -Z 60 design/store/out/ios/icon-1024.png --out /tmp/icon-60.png`, then Read it.

## The feature graphic (Play)

`design/store/feature-graphic.html` is a page you design at 1024 × 500:
- the wordmark,
- one product moment (the hero illustration, or a single cropped device),
- the world colour.

It's often shown with a play button overlaid in the centre, so keep the centre calm. No device clutter, no feature lists, no small text.

## Check before calling it done

- [ ] `store.mjs` exited 0 and listed every file.
- [ ] Open the first iOS and first Play screenshot at 25% size: is the headline readable and is the hero obvious?
- [ ] Open the icon at 60px: does it read?
- [ ] Every screenshot's screen passed `scan.mjs`.
