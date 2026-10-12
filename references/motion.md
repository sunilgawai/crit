# Motion

Read this in Phase 7, or whenever a screen needs to move. Motion is how the concept comes alive. The garden sways, the number counts up, the parcel travels. It is also launch material: the MP4s are for the App Store preview, social posts and the landing page.

## Tokens (in `tokens.css`)

```css
--ease-out: cubic-bezier(.2, .8, .2, 1);     /* things arriving */
--ease-in-out: cubic-bezier(.65, 0, .35, 1); /* things moving between places */
--t-fast: 120ms;  /* presses, toggles */
--t-base: 240ms;  /* small elements entering */
--t-slow: 400ms;  /* cards, sheets */
--t-scene: 700ms; /* hero moments */
```

For a spring feel, use `linear()` easing, e.g. a soft overshoot:
`linear(0, .25 9%, .65 20%, 1.03 38%, 1.06 45%, 1.02 60%, 1 100%)`.

## What to animate

- **Hero numerals count up** (`€0` → `€49` over ~700ms, ease-out). Implement as stacked digits or a CSS `@property --n` integer counter. No JS timers.
- **Progress fills** (rings, bars, the single highlighted chart bar) grow from 0 with `--t-scene`.
- **Illustration idle loops:** small and slow. ≤ 2px of translation or ≤ 3° of rotation, 2–4s periods, `alternate`, staggered between parts (the sunflower sways, the cloud drifts, the mascot blinks every ~3s).
- **List items stagger in:** 40ms apart, 8–12px rise, opacity 0→1, `--t-base`.
- **Screen push:** the new screen slides 100% → 0 with `--ease-out` over 350ms while the old one shifts −30% and dims slightly. Sheets rise from the bottom over 400ms.
- **Taps:** scale .97 for `--t-fast`. A tap is shown in videos as a soft 44px circle that fades in and out.

Don't animate:
- everything at once,
- with bounces longer than 500ms,
- with parallax gimmicks,
- with text that types itself out (an AI tell),
- with confetti, unless the concept is literally a party.

## Scene contract (for `capture.mjs`)

A scene is an HTML page in `design/motion/` that:

1. Defines `window.SCENE = { duration, fps, width, height, scale }` in an inline script.
   - `width` and `height` are output pixels and must be even.
   - The page is laid out at `width/scale × height/scale` CSS px.
2. Animates **only** with CSS animations or Web Animations API animations that exist at load (use `animation-delay` to sequence; `infinite` is fine). `capture.mjs` pauses every animation in every frame (including iframes) and seeks it to each frame's time. JS timers, `requestAnimationFrame` loops and CSS transitions triggered later **will not be captured**.
3. Embeds screens with `<iframe src="../screens/ios/01-home.html">` inside a device frame. Animations inside the screen files play too, with time starting at load. To hold a screen's animation until a moment, give it a delay.

Sizes:
- **1080 × 1920**: Reels, TikTok, Stories, App Store preview-style (scale 2 → a 540 × 960 canvas).
- **1080 × 1350**: feed posts (scale 2 → 540 × 675).

Render: `node "$SKILL/scripts/capture.mjs" design/motion/<scene>.html` → `design/motion/out/<scene>.mp4`.

## Example scene: home → detail with a counting hero

```html
<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="../fonts/fonts.css"><link rel="stylesheet" href="../tokens.css">
<style>
  html,body{margin:0;width:100%;height:100%;overflow:hidden;background:var(--world-2)}
  .device{position:absolute;left:50%;top:50%;width:402px;height:874px;border-radius:56px;overflow:hidden;
    transform:translate(-50%,-50%) scale(.92);box-shadow:0 0 0 9px #111,0 40px 80px rgba(0,0,0,.25)}
  iframe{position:absolute;inset:0;width:100%;height:100%;border:0}
  #home{animation:back 350ms var(--ease-out) 2200ms both}
  #detail{animation:push 350ms var(--ease-out) 2200ms both}
  @keyframes push{from{transform:translateX(100%)}to{transform:none}}
  @keyframes back{to{transform:translateX(-30%);filter:brightness(.9)}}
  .tap{position:absolute;left:180px;top:420px;width:44px;height:44px;border-radius:50%;background:rgba(0,0,0,.18);
    opacity:0;animation:tap 400ms ease-out 1900ms both}
  @keyframes tap{40%{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(1.4)}}
</style></head><body>
<div class="device">
  <iframe id="home" src="../screens/ios/01-home.html"></iframe>
  <iframe id="detail" src="../screens/ios/02-goal.html"></iframe>
  <i class="tap"></i>
</div>
<script>window.SCENE = { duration: 4500, fps: 30, width: 1080, height: 1920, scale: 2 };</script>
</body></html>
```

## The three standard scenes

1. **`hero.html`**: the main screen's hero moment. The number counts, the illustration settles into its idle loop, then one tap on the primary action. 4–6s, 1080 × 1920.
2. **`flow.html`**: onboarding → (personalisation) → home → paywall, as pushes with taps. 8–12s, 1080 × 1920.
3. **`delight.html`**: the single most charming moment (the mascot reacting, a goal completing), cropped close. 3–5s, 1080 × 1350.

After capturing, open each MP4 (`open design/motion/out/*.mp4`) and watch it once. Check it starts on a composed frame, nothing pops, and the last frame holds for ~0.5s.
