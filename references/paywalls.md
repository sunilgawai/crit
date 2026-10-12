# Onboarding and paywalls

Read this before designing onboarding or a paywall. A paywall that's rejected in review earns nothing, and one built on dark patterns earns refunds and one-star reviews. Design for conversion **inside** the rules.

## Onboarding

1. **Value first, at most three screens before any ask** (account, permission or payment). Every screen earns the next tap.
2. **Show the product, not slogans.** Each screen shows a real piece of the app working: the hero number, the illustrated world, a real row of data. Floating blobs with a tagline are the AI default.
3. **One idea and one CTA per screen.** The CTA names the next outcome ("Show me my week"), not "Next".
4. **Personalise early.** One or two questions whose answers visibly change what comes next ("Who do you live with?" → names appear on the next screen).
5. **Prime permissions before the system prompt.** A screen in the app's voice explains *why* ("We'll nudge you on Sunday, not before"), with a "Not now" that works. Only then trigger the system dialog.
6. **Skip is visible** on non-essential steps (top-right, 44pt target).
7. Onboarding screens use `data-screen-kind="onboarding"` (the scanner allows centred layouts there).

## The `data-paywall` contract (scanner-enforced)

On `<body data-screen-kind="paywall">`, mark these elements:

| Attribute | Element | Rule |
|---|---|---|
| `data-paywall="price"` | the amount that will be billed, e.g. "€24.99 a year" | must be the **largest price** on screen |
| `data-paywall="trial"` | the trial line, e.g. "Free for 7 days" | if present, `after-trial` is required |
| `data-paywall="after-trial"` | "Then €24.99 a year" | visible whenever a trial is shown |
| `data-paywall="restore"` | Restore purchases | required, visible, 44pt (iOS) / 48dp (Android) |
| `data-paywall="terms"` | Terms of Use (EULA) link | required, visible |
| `data-paywall="privacy"` | Privacy Policy link | required, visible |
| `data-paywall="close"` | close / "Not now" | required, visible from the first frame, not faded or delayed |

Per-week or per-month breakdowns ("That's €0.48 a week") are allowed but must be **smaller** than the billed price.

## Apple (App Review Guidelines 3.1.1, 3.1.2)

- Clearly say what the subscriber gets, how much it costs and for how long (the billing period) before they subscribe.
- The amount that will be billed is the most prominent pricing element; intro or derived prices are subordinate.
- Free trials: state the length, and what will be charged, and when, after the trial ends.
- Auto-renewal must be clear: "Renews yearly. Cancel anytime in Settings."
- A restore mechanism for previous purchases.
- Functional links to the Terms of Use (EULA) and the Privacy Policy.
- No misleading urgency (fake countdowns), no hidden or delayed close button, no pre-checked add-ons.

## Google Play (Subscriptions policy)

- Clear offer terms before purchase: price, billing frequency, what's included.
- Free trials: duration, the price after the trial, and that it converts automatically unless cancelled.
- Explain how to cancel ("Cancel anytime in Google Play → Subscriptions").
- The dismiss control must be clear; don't disguise the free path.
- No misleading claims ("Free" when a payment method is charged immediately).

## Three paywall layouts that convert without tricks

**1. Trial timeline** (best with a free trial)
- A vertical 3-step timeline: *Today: full access* → *Day 5: we'll remind you* → *Day 7: €24.99 a year starts*.
- Honesty about the reminder raises trial starts.
- The billed price sits on the last step and is repeated large above the CTA.
- CTA: "Start my free week".

**2. Plan comparison** (best with 2 plans)
- Annual and monthly as two selectable cards. Annual is pre-selected, with an honest "save 48%" badge.
- The billed amount is the big number on each card ("€24.99 a year"); "€2.08/mo" is small underneath.
- The concept's illustration sits above; one sentence states the outcome.

**3. Single-plan story** (best for a simple product)
- The hero is the product's best moment (the illustrated world, the finished state, the number that matters), then 3 short benefit lines with drawn icons, then price and CTA.
- No feature-comparison table.

On every layout:
- close top-left (iOS) or top-right (Android),
- restore, terms and privacy as a quiet row at the bottom,
- the CTA in the signal colour,
- copy per `copy.md`.

## What the critic checks on paywalls

- The scanner contract passes.
- The paywall still belongs to the app's world (most generated paywalls are generic black screens with gold).
- Price clarity in under 3 seconds.
- Nothing a reviewer would call a dark pattern.
