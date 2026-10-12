# Copy

Read this when writing any visible text, and again in Phase 6 (the copy pass). Copy is half of why the reference screens feel human: "Every seed in the packet." and "18 months left" do more than any gradient.

## The voice test

Read each line aloud as the app's maker, to one friend who uses the app. If you wouldn't say it, rewrite it. If it would fit any other app unchanged, rewrite it.

## Rules

1. **Say the specific thing.** Name the plant, the person, the place, the time. "Fern watered" beats "Task completed".
2. **Numbers over adjectives.** "Arriving by 3pm", "12 more than last week", "€212 left for May". Never "amazing progress".
3. **Sentence case everywhere.** Headlines end with a full stop when they're sentences. Title Case reads as a template (the scanner warns).
4. **One idea per line.** Headlines ≤ 8 words; supporting lines ≤ 14. If a line needs "and", it's probably two lines, or one too many.
5. **One turn of phrase per screen, at most.** A headline may play ("Making payments to a brighter you."); everything else is plain. Two jokes on one screen is a greeting card.
6. **Buttons are verbs naming the outcome:** "Water them all", "Start my free week", "Track my order". 1–3 words. Never "Submit", "Continue" when something better exists, or "Click here".
7. **Empty states say what to do next**, in the app's voice: "No plants thirsty today." + "Add a plant". No "Oops", no "Uh-oh", no sad-face illustrations by default.
8. **Errors say what happened and what to do**, without blame: "Couldn't reach your bank. Try again in a minute."
9. **Exclamation marks:** at most one per screen, and only where a person would actually raise their voice (the scanner warns above one).
10. **Real content only.** Real-sounding names (varied across cultures: Aiko, Kwame, Lucía, Rohan, Ingrid), real amounts with the right currency, real dates and places. No lorem ipsum, John Doe or Acme (the scanner fails them).
11. **No AI cadence:** no "Whether you're X or Y", no rule-of-three adjective lists, no "it's not just X, it's Y", no em-dash flourishes in UI, no rhetorical questions in headlines.

## Banned (scanner: error)

unlock your / the · seamless(ly) · effortless(ly) · elevate · supercharge · empower · your journey · take control · all-in-one · revolutionise · game-changer · dive in / into · in today's fast-paced · next-level · unleash · harness the power · at your fingertips · look no further · whether you're · designed to help you · we've got you covered · say goodbye to · hassle-free

Also avoid (not scanned, but the critic notices): *smart*, *intuitive*, *powerful*, *simple yet powerful*, *magic*, *delightful*, *streamline*, *boost*, *optimize your*, *peace of mind*, *on the go*, *made easy*, *like never before*, *transform*.

## Rewrites

| Before | After |
|---|---|
| Unlock your financial potential | €212 left for May. Groceries are covered. |
| Track your workouts seamlessly | Three runs this week. Saturday's was your fastest. |
| Welcome back, User! | Morning, Aiko. |
| Your Daily Learning Journey | Day 12. 140 words you didn't know in May. |
| Start Your Free Trial Today! | Start my free week |
| Booking Confirmed! 🎉 | Booked. Table for two, Friday at 8. |
| No data available | Nothing yet. Your first trip goes here. |
| Elevate your focus with smart sessions | Forty minutes. Phone face down. |
| Get started | Make my first pot |
| Something went wrong. Please try again later. | Couldn't save that. Check your signal and try again. |

## Onboarding and paywall copy

- Onboarding headlines state what the person *gets*, in their words: "Know when every plant needs water." Not what the app *is*: "A smart plant-care platform".
- The paywall headline is the outcome, the price line is plain and exact ("€39.99 a year"), and the trial line says what happens next ("Free for 7 days, then €39.99 a year. Cancel anytime in Settings.").
- Store screenshot headlines: ≤ 6 words, benefit-first, the same voice as the app.

## Text people wrote

Quotes, book passages, messages and names typed by users aren't the app's voice. Mark their container with `data-user-content` and the scanner skips its copy and emoji rules for them (a quoted sentence may be long; a friend's message may have an emoji).

## Phase 6: the copy pass

1. Extract all visible text per screen (open each HTML file; ignore the status bar).
2. For each line: run the voice test, the rules and the banned list; rewrite.
3. Read the whole app's copy top to bottom in one go: is it one voice? Does any headline repeat a construction?
4. Re-render and rescan.
