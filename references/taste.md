# Taste

Read this before Phase 2 and keep it open through Phase 5. This is the part of the skill that matters. A clean, well-organised screen is the *floor*, not the goal. The goal is a screen a stranger remembers: they could describe it in one sentence that fits no other app.

The bar is studio work: the kind of consumer app Apple features, made by a small team with a point of view. It is **not** "good for AI".

---

## 1. The bar: seven patterns

Each pattern has a **do** and a **fails when**. The critic scores against these.

**1. A world per app, not a theme.**
Do: start from a concrete anchor (an allotment with a mole gardener, glossy savings marbles, a harbour at noon) and let it decide palette, illustration, shapes and motion.
Fails when: you could swap the app's name and the design would still fit; or the "concept" is an adjective ("clean", "friendly", "premium", "modern").

**2. One loud signal colour, everything else quiet.**
Do: one high-chroma signal for the primary action, the active tab and *one* highlighted datum per screen. Everything else is world tint, ink and neutrals.
Fails when: the signal appears on more than those three things; two saturated hues compete for attention in the UI (illustrations may use more); the ground is white or grey by default.

**3. One hero per screen, at an extreme scale.**
Do: one element 3–6× the body size, or an illustration covering a third of the screen. Examples: a wordmark, a big numeral with a small unit (`1h 15min`, `€49 /mo`), a place name (`Elba`), a sentence (`This week, you shipped.`).
Fails when: the screen opens with a 28px title and a grid of equal cards; two elements compete for hero; the hero is a stock icon in a circle.

**4. Two type voices, each with a job.**
Do: a display voice (heavy sans or characterful serif) for marks, numbers and editorial sentences; the platform text face (SF Pro / Roboto Flex) for everything you read.
Fails when: everything is one sans in four weights; the display face is Inter or Arial; the serif is used for UI labels.

**5. Owned illustration.**
Do: a drawn world in one consistent style: a mascot, motifs, objects from the concept. It is reused across screens, bleeds out of cards and sits behind or overlaps text deliberately.
Fails when: there's no illustration at all; the illustration is generic (abstract blobs, isometric people, stock 3D emoji); the style changes between screens; everything sits politely inside rectangles.

**6. Human copy.**
Do: sentence headlines with a full stop and at most one turn of phrase; specific numbers, names, times and places (see `copy.md`).
Fails when: copy could ship in any app; title case; marketing verbs; placeholder people.

**7. Platform craft.**
Do: correct status bar ink, safe areas, native navigation for each platform, a 4pt rhythm, one radius scale, real touch targets (see `ios.md`, `android.md`).
Fails when: it's a web page in a phone frame.

Where the reference set itself falls short (so you must do better):
- A generic emoji mood row: draw the faces in the app's style instead.
- A headline that doesn't parse ("Three agrees at work").
- An "Other accounts" list that could come from any banking template: give lists one ownable detail (an illustrated category glyph, a world-coloured amount pill, a sparkline).

---

## 2. Concept anchors

A good anchor is a **real object, place, ritual or material connected to the app's job**. It must suggest three things at once: a **palette**, an **illustration subject** and a **motion**. If it doesn't suggest all three, it's not specific enough.

How to find one:
1. Write the app's job as a verb phrase ("save towards a thing", "focus for 40 minutes", "learn ten words a day").
2. List 10 physical things, places or rituals people associate with that job, including odd ones (a piggy bank, a jar of coins, a pot on a shelf, marbles, a seed packet, a harbour ledger).
3. Discard the clichés everyone uses (piggy bank, rocket, lightbulb, trophy, brain).
4. Pick the one with the best palette + illustration + motion.

Worked examples:

| App | Anchor | Palette | Illustration | Motion |
|---|---|---|---|---|
| Savings goals | Glossy marbles in a jar | warm paper, tomato, teal, cobalt marbles | 3D-ish spheres, one per goal | marbles drop and settle |
| Focus timer | An allotment at dawn, with a mole gardener | sky blue → soil brown, sunflower yellow | thick-outline flat garden, mole in a straw hat | sunflowers sway, the mole waters |
| Recipe keeper | A grandmother's recipe tin of index cards | tin red, card cream, pencil grey | line-art cards with food sketches, a tin lid | cards flip up out of the tin |
| Podcast player | A late-night radio booth | studio black-brown, on-air red, warm lamp amber | a desk mic, VU needles, a lit sign | needles bounce, the ON AIR sign glows |
| Travel planner | A harbour departure board + postcards | sea blue, sand, stamp red | postcard scenes, stamps | the board flips |
| Delivery tracking | A seed packet travelling by post | peach, kraft brown, leaf green | mascot with packet, flowers | packet hops along a route |
| Sleep | A village going to sleep, window by window | dusk indigo (not purple-blue gradient!), lamp amber | windows lighting off | lights fade one by one |
| Fitness | An athletics track, lane lines | track terracotta, lane white, grass green | lane geometry, numbered bibs | lane lines sweep |
| Language learning | A café menu chalkboard | chalk green-black, chalk white, one awning stripe | chalk lettering, café objects | chalk writes on |
| Habit tracker | A paper cut-out calendar on a fridge | craft-paper colours | cut-paper shapes with offset shadows | pieces fold into place |
| Plant care | A greenhouse logbook | glass green, terracotta, label white | botanical line drawings with tags | leaves unfurl |
| Meditation | Stones stacked on a riverbank | river grey-green, warm stone | soft-shaded pebbles | stack balances |

Anti-anchors (never accepted): "modern and clean", "friendly", "premium", "minimal", "playful", "bold", "trustworthy". These are qualities the design should *have*, not concepts.

---

## 3. Colour worlds

Recipe:
- **world**: the ground. Light worlds have L 92–97% and low chroma, tinted toward the anchor (sky, paper, sage, peach). Dark worlds are allowed when the anchor is nocturnal, never "because dark looks premium".
- **world-2**: one step deeper, for wells, grouped lists and pressed states.
- **surface**: cards, slightly lighter or warmer than world (or world-2 on dark).
- **ink**: near-black pulled toward the world's hue (warm ink on paper, blue-black on sky). Never pure #000 on a tinted world.
- **ink-2 / ink-3**: secondary and tertiary text; ink-3 only ≥ 15px and must pass 4.5:1.
- **signal**: one high-chroma colour, complementary to or clearly apart from the world. Text *on* the signal is ink or white, whichever passes 4.5:1. Never use the signal for body text on a light ground.
- **illustration palette**: 3–5 extra colours that live only inside illustrations.

Example worlds (hex):

| World | world / world-2 / surface | ink / ink-2 | signal | illustration |
|---|---|---|---|---|
| Allotment | `#EEF4E6` / `#DFE9D2` / `#FAFCF6` | `#1E2A1B` / `#4A5844` | `#FF6A2B` | `#F6C431` `#8A5A3B` `#4E9A4A` `#9FD3F5` |
| Harbour | `#EAF3FA` / `#D9E8F4` / `#FAFDFF` | `#0F2233` / `#3D5468` | `#FF5A2E` | `#2F8FD8` `#F2D6A2` `#FFFFFF` `#173B5C` |
| Kiln | `#F4ECE3` / `#E9DCCD` / `#FCF7F1` | `#2A1E18` / `#5E4A3E` | `#D9480F` | `#C2794D` `#2E6F73` `#EBC9A0` |
| Night market | `#15131D` / `#211E2C` / `#2A2638` | `#F6F1E7` / `#C9C2B4` | `#FFB020` | `#FF6B3D` `#3CD6C4` `#F6F1E7` |
| Ledger paper | `#F6F3EC` / `#ECE6D9` / `#FFFDF8` | `#1B1A16` / `#4D493F` | `#0E7A4D` | `#2B48C9` `#E9B949` `#D8D2C4` |
| Lido | `#E6F5F2` / `#D2EBE6` / `#F8FEFC` | `#0C2B2B` / `#3C5B59` | `#FF4F6E` | `#3BB3C3` `#F6C344` `#FFFFFF` |

Gradients: only when they *depict* something (sky, light on a sphere, water depth), never as decoration on buttons or headers. Purple-to-blue is banned (the scanner fails it).

---

## 4. Type pairings

Install with `node "$SKILL/scripts/fonts.mjs" <slug…>`. Text is SF Pro (iOS) and Roboto Flex (Android); these are the display voices:

| Slug | Character | Pairs well with |
|---|---|---|
| `fraunces` | warm, soft, bookish serif; use axes `SOFT 100`, `WONK 1`, `opsz 144` at hero sizes | gardens, food, money with warmth |
| `instrument-serif` | slim, elegant, editorial; italic for one accent word | reading, wellness, journaling |
| `dm-serif-display` | classic high-contrast display | travel, culture, places |
| `young-serif` | chunky, friendly, retro | recipes, local, crafts |
| `gloock` | dramatic, sharp contrast | fashion, nightlife, events |
| `newsreader` | text-grade serif for long editorial lines | longform, news, reading |
| `bricolage-grotesque` | quirky grotesque with ink traps; heavy and condensed at display sizes | social, events, youthful |
| `familjen-grotesk` | warm, slightly odd sans | productivity with personality |
| `unbounded` | wide, round, geometric | fitness, games, music |
| `syne` | extended, artsy at 700–800 | creative tools, galleries |
| `hanken-grotesk` | neutral-friendly sans for numerals | data-forward screens |
| `baloo-2` | rounded, mascot-friendly | kids, pets, playful habits |

Tested pairings:
1. Fraunces 700 (SOFT 100) hero numerals + Instrument Serif sentences + SF text. A warm finance app.
2. Instrument Serif headlines (italic for one word) + SF. Calm editorial.
3. Bricolage Grotesque 800 wordmark and heroes + SF. Loud and social.
4. Unbounded 700 numerals + SF. Sporty.
5. DM Serif Display place names + SF. Travel.
6. Young Serif headlines + Familjen Grotesk numerals + SF. Retro-local.
7. Baloo 2 800 wordmark + Fraunces sentences + SF. Mascot-driven.
8. Syne 800 headlines + Newsreader quotes + SF. Creative.

Rules:
- **Numerals:** hero numerals use the display face at 56–96px with `letter-spacing: -0.03em`. Units sit at 30–40% of the numeral size, baseline-aligned, 2–4px apart (`1h 15min`, `€49 /mo`). Data tables use `font-variant-numeric: tabular-nums` in the text face.
- **Scale:** jump sizes by ≥ 1.5× between levels. 17 → 28 → 44 → 72 beats 17 → 20 → 24 → 28.
- **Tracking:** −0.02 to −0.04em at ≥ 34px; 0 for text sizes; +0.02 to +0.06em only for small all-caps labels (use rarely).
- **Line length** for sentences: 18–32 characters per line at hero sizes. Break lines deliberately with `<br>` or `text-wrap: balance`.

---

## 5. Layout archetypes

Each of the three directions in Phase 2 uses a **different** archetype.

**Editorial.** A big sentence headline, top-left, fills 25–40% of the screen. Below it, quiet content (a short list, one card) and lots of world. Hero: the sentence. Fits reading, wellness, summaries ("This week, you shipped.").

**Bento.** A lead tile (twice the size, illustrated or in the signal colour) plus 2–4 tiles of *different* shapes (wide, square, tall). There are never three equal tiles in a row. Hero: the lead tile. Fits travel, multi-facet dashboards, home screens with several jobs.

**Illustrated world.** The top 40–55% is an illustrated scene running full-bleed behind the status bar. The content sheet or card overlaps the scene's bottom edge (−24 to −40px). Hero: the scene. Fits habits, focus, delivery, anything with a mascot.

**Data-forward.** One giant number with a small unit, one chart with a single highlighted datum (the signal colour; the rest at ink-3 or world-2), and a short list. Hero: the number. Fits money, fitness, timers.

---

## 6. Illustration

All illustration is hand-written SVG or CSS. `illustrations.svg` is XML: a double hyphen inside a `<!-- comment -->` (e.g. naming a CSS variable) makes the whole file invalid and every symbol renders blank (the scanner reports `broken-illustration`). Use `vector-effect="non-scaling-stroke"` on strokes so one symbol drawn at several sizes keeps one stroke weight. Pick **one** style per app and keep its rules on every screen. Reusable pieces go in `design/illustrations.svg` as `<symbol id="…" viewBox="…">`. Use them with `<svg><use href="../../illustrations.svg#id"/></svg>`.

**Thick-outline flat** (garden, mole, delivery)
- Strokes 3–4px at 1× in `ink`, `stroke-linejoin: round`, `stroke-linecap: round`.
- Flat fills from the illustration palette.
- No gradients; at most one flat shadow shape per object (a darker fill offset 3–4px).
- Shapes are simple primitives (ellipses, rounded rects, quadratic curves). Slight asymmetry makes it feel hand-made.
- Clouds are outline-only.

**Glossy spheres** (savings, marbles)
- Built in CSS. Each sphere is a circle with:
  `background: radial-gradient(circle at 32% 28%, rgba(255,255,255,.85) 0 5%, rgba(255,255,255,0) 20%), radial-gradient(circle at 40% 38%, LIGHT, BASE 58%, DARK 100%)`.
  LIGHT, BASE and DARK are one hue at three lightnesses.
- Plus `box-shadow: inset -10px -14px 30px rgba(0,0,0,.18)`.
- Overlap the spheres and vary their sizes 1:1.6:2.4.

**Line art** (books, journaling, travel)
- One 2px stroke in ink, open paths, a little wobble (hand-adjusted control points).
- One accent fill (the signal or one illustration colour) on a single element.

**Cut paper** (habits, kids, crafts)
- Layered flat shapes with 2–3px offset shadows (`filter: drop-shadow(2px 3px 0 rgba(0,0,0,.15))`).
- Slightly rotated pieces (±2–4°) and torn edges via irregular polygons.

**The mascot method**
1. Build it from 4–6 primitives: body ellipse, head circle, two eyes, a nose, one prop that comes from the concept (a straw hat, a satchel, a scarf).
2. Define 3 poses as symbols (`mascot-idle`, `mascot-act`, `mascot-cheer`). Change only arms, eyes and the prop between poses.
3. It appears on at most half the screens; the rest use motifs (flowers, clouds, parcels).

Placement rules:
- Illustrations **bleed**: they run off the screen edge or out of their card by 8–40px.
- They overlap at least one other layer (a card edge, a headline).
- They sit next to the hero, never in a list row.

---

## 7. Composition

- **One hero, one dense region, one quiet region per screen.** The quiet region is world colour with nothing in it, and it's deliberate.
- **4pt grid.** Spacing from the `--s-*` scale only.
- **Radius scale:** pick a personality, then stay on its scale.
  - soft: 14 / 22 / 32
  - crisp: 6 / 10 / 16
  - pill-heavy: 999 for actions, 24 for cards
  Buttons, cards and sheets get different radii from the same scale.
- **Asymmetry:** left-aligned heroes, uneven bento, an illustration offset to one side. Centred everything is a template (except deliberate onboarding moments).
- **Lists get one ownable detail:** an illustrated glyph per category, amounts in world-coloured pills, or a mini sparkline. Never just icon-title-chevron.
- **Avoid identical sibling cards:** lead with one big card, then a list; or a bento of mixed sizes. Three equal cards in a row is the scanner's `identical-cards` warning and the critic's favourite complaint.
- **Bars and tabs belong to the world:** a tab bar tinted with the world colour, a signal-coloured active state, icons drawn in the same stroke as the illustrations.

---

## 8. Anti-slop list

**The scanner fails:**
- Inter, Arial or Helvetica display text (and Roboto display text on iOS),
- Tailwind default indigo or violet,
- purple-to-blue gradients,
- emoji used as icons,
- lorem ipsum and John Doe,
- low contrast,
- small touch targets,
- text overflow,
- banned phrases,
- incomplete paywalls.

**The critic fails what the scanner can't see:**
- a row of generic emoji faces for mood (draw them in the app's style),
- feature grids of icon-in-a-circle + title + subtitle,
- centred onboarding with abstract blobs and a tagline,
- gradients as decoration,
- default "glassmorphism",
- dashboards of four equal stat cards,
- avatars as initials in coloured circles everywhere (draw a few illustrated avatars, or use one style of portrait),
- every corner the same radius as every button,
- shadows on everything,
- a hero that's a 28px bold title,
- a tab bar that's grey and could belong to any app,
- the same layout repeated on every screen with different text.
