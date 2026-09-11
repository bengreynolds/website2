/* --------------------------------------------------------------------------
   The skills deck's numbers
   --------------------------------------------------------------------------
   No imports, deliberately. Three things need these and they must not
   disagree: src/Skills.jsx, which writes two of them out to CSS as inline
   custom properties; src/deckTimeline.js, which builds the timeline from
   them; and src/deck.css, which derives the scroll marks from what Skills.jsx
   wrote. Splitting the timeline into its own lazily imported module put GSAP
   behind a dynamic import and would otherwise have put these behind it too -
   and the markup that reads them renders on the first paint.

   Under a kilobyte in the entry chunk. GSAP's 45 is not.
   -------------------------------------------------------------------------- */

/* The one number. Total scroll, in viewport heights, for all eight panels.

   It sets the ScrollTrigger `end`, it sets the height of the pin spacer
   through that, and it sets the spacing of the scroll marks the rail jumps
   to. Change it and every one of those moves together. The pinned version
   this replaced failed because its scroll cost fell out of the layout instead
   and nobody ever wrote it down. */
export const DECK_SCROLL_VH = 5;

/* One unit of the timeline is one panel. Of that unit the panel holds still
   for DWELL and hands over for the rest, so a reader gets a stationary page
   of text before it starts moving rather than eight continuously drifting
   ones. Held as a fraction because the mark geometry in deck.css assumes
   unit == panel and nothing else. */
export const DWELL = 0.45;
export const HANDOVER = 1 - DWELL;

/* Alpha is tweened apart from the transform, and the two windows do not line
   up, because a linear crossfade of two full pages of text is unreadable in
   the middle - measured at 0.51 and 0.74 on the first build, which put two
   ledes on top of each other for a third of a viewport of scroll.

   The cards are opaque (--surface, see deck.css), and the incoming one is in
   front, so the fix is to stop treating this as a crossfade at all: the
   incoming card reaches full opacity in the first third of the handover and
   covers the outgoing one, which only then fades, behind it, where nobody is
   trying to read it. Fractions of one handover, so they follow DWELL. */
export const FADE_IN = 0.32;
export const FADE_OUT_FROM = 0.55;
export const FADE_OUT = 0.45;

/* Where the reader thinks one card became the next, in units, and how far the
   scroll marks therefore run ahead of the timeline's own unit boundaries.

   Panel i is the front card for the first DWELL of unit i, and the incoming
   card is fully opaque and covering it FADE_IN of the handover later - so the
   card a reader is looking at changes at i + 0.63, not at i + 1. Marking the
   unit boundaries instead left the rail saying 03 with card 04 filling the
   screen, which was visible and wrong.

   MARK_LEAD is also what decides which card is clickable: floor(t +
   MARK_LEAD) is the card on screen, and deck.css gives that one alone
   pointer-events. Rail, marks and hit target from one expression. */
export const HANDOVER_SEEN = DWELL + HANDOVER * FADE_IN;
export const MARK_LEAD = 1 - HANDOVER_SEEN;

/* Where a rail jump aims: the middle of the stationary part of a unit, so the
   card lands still rather than already moving. */
export const JUMP_AT = DWELL / 2;

/* The three card states. z is what does the work: the front card is on the
   projection plane, the outgoing card recedes behind the incoming one, and
   painting order in a preserve-3d stage follows z, so nothing here needs a
   z-index. */
export const FRONT = { yPercent: 0, z: 0, rotateX: 0 };
export const BELOW = { yPercent: 11, z: -260, rotateX: 7 };
export const RECEDED = { yPercent: -8, z: -520, rotateX: -13 };
