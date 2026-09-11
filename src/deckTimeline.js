import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import {
  BELOW,
  DECK_SCROLL_VH,
  DWELL,
  FADE_IN,
  FADE_OUT,
  FADE_OUT_FROM,
  FRONT,
  HANDOVER,
  MARK_LEAD,
  RECEDED,
} from "./deckGeometry";

/* --------------------------------------------------------------------------
   The skills deck's timeline
   --------------------------------------------------------------------------
   Split out of src/Skills.jsx for one reason: this file imports GSAP and
   ScrollTrigger, 45.5kB gzipped between them, and Skills.jsx renders on the
   first paint. Statically imported they were 38% of the entry bundle, paid
   for by every visitor including the ones on a phone, under reduced motion,
   or in a window too small for the deck to exist at all - none of whom can
   ever cause a single tween in here to run.

   Skills.jsx imports this dynamically when the reader is within about a
   viewport and a half of the section, which is the same shape of gate the
   site already uses for the 0.5-3MB sprite sheets. Early enough that the
   layout change from the flow stack to the pinned deck happens well below
   the fold, so nothing a reader is looking at moves.

   ---- what is pinned, and what is not -------------------------------------

   .deck-stage is pinned; .deck is the trigger and keeps its full scroll
   height because ScrollTrigger's pin spacer stands in for the stage. The
   eight .deck-mark elements are siblings of that spacer, absolutely
   positioned against .deck, so they sit at fixed points along the track
   rather than being carried along with the pin.

   The marks exist because a pinned panel has no scroll position of its own.
   All eight panels occupy the same 100vh box, so #skill-<id> on a panel would
   scroll every skill to the same place, and App.jsx's stage observer - a 1%
   band across the middle of the viewport - would see all eight cross it at
   once and mark an arbitrary one. See the geometry note in src/deck.css.
   -------------------------------------------------------------------------- */

gsap.registerPlugin(ScrollTrigger);

export function buildDeck(deck, stage) {
  /* data-deck is what switches deck.css from the flow stack to the stacked
     cards. It is set here rather than from render on purpose: if this module
     ever fails to load or throws, the markup is still the readable stack,
     because the CSS that collapses eight panels onto one box only applies
     once the code that animates them is known to have run. */
  deck.dataset.deck = "pinned";

  const ctx = gsap.context(() => {
    const panels = gsap.utils.toArray(".deck-panel", stage);
    const count = panels.length;
    if (!count) return;

    /* The card the reader is looking at. Held here so onUpdate writes to the
       DOM only when it changes rather than on every scroll frame. */
    let front = 0;
    panels[0].dataset.front = "1";

    /* opacity, NOT autoAlpha, and this is the whole of the find-in-page fix.
       autoAlpha is opacity plus visibility, and it sets visibility: hidden
       the moment alpha reaches 0 - which takes seven of the eight cards out
       of find-in-page and out of the accessibility tree. Ctrl-F for any skill
       but the one on screen found nothing, measured at 1 of 8, against a
       <details> version where all eight were always findable. Plain opacity
       leaves the text rendered, so it is found, announced and reachable by
       search while still being invisible. content-visibility: hidden would
       have the same fault. */
    gsap.set(panels[0], { ...FRONT, opacity: 1 });
    gsap.set(panels.slice(1), { ...BELOW, opacity: 0 });

    /* An empty tween sets the length so the timeline is exactly one unit per
       panel: panel i is the front card over [i, i+1). Everything below is
       inserted at an absolute position in those units, so the mark geometry
       in deck.css and this timeline share one grid. */
    const tl = gsap.timeline({ defaults: { ease: "none", immediateRender: false } });
    tl.to({}, { duration: count });

    for (let i = 0; i < count - 1; i += 1) {
      const at = i + DWELL;
      const out = panels[i];
      const next = panels[i + 1];

      /* Transforms run the full handover at a constant rate: the scrub is the
         reader's hand, and an ease on top of it makes the card lag the wheel
         rather than follow it. */
      tl.fromTo(out, FRONT, { ...RECEDED, duration: HANDOVER }, at);
      tl.fromTo(next, BELOW, { ...FRONT, duration: HANDOVER }, at);

      tl.fromTo(
        next,
        { opacity: 0 },
        { opacity: 1, duration: HANDOVER * FADE_IN, ease: "power2.out" },
        at
      );
      tl.fromTo(
        out,
        { opacity: 1 },
        { opacity: 0, duration: HANDOVER * FADE_OUT, ease: "power1.in" },
        at + HANDOVER * FADE_OUT_FROM
      );
    }

    ScrollTrigger.create({
      animation: tl,
      trigger: deck,
      start: "top top",
      /* The whole point. A function so it is re-evaluated on every refresh
         rather than frozen at the viewport height the page happened to load
         at, and the only place the section's scroll cost is decided. */
      end: () => `+=${DECK_SCROLL_VH * window.innerHeight}`,
      pin: stage,
      pinSpacing: true,
      /* A little smoothing, not a lag: 0.3s of catch-up keeps a trackpad
         flick from snapping through three cards in one frame. */
      scrub: 0.3,
      invalidateOnRefresh: true,
      /* Two numbers out to CSS, which derives the marks from them. Taken from
         the trigger rather than recomputed so they cannot disagree with the
         pin that actually ran. */
      onRefresh: (self) => {
        const span = self.end - self.start;
        deck.style.setProperty("--deck-vh", `${window.innerHeight}px`);
        deck.style.setProperty("--deck-step", `${span / count}px`);
      },
      /* Which card the reader is looking at, out to CSS as data-front, and
         the only thing CSS uses it for is pointer-events.

         That became necessary when the cards stopped being visibility:
         hidden. At opacity 0 they are hit targets again, and seven
         full-viewport cards stacked on the one being read would swallow every
         click and every drag-select in the section.

         Same arithmetic as the scroll marks in deck.css, deliberately: the
         card a reader sees changes at unit i + HANDOVER_SEEN, which is
         floor(t + MARK_LEAD). Two places agreeing by construction rather than
         by coincidence. */
      onUpdate: (self) => {
        const t = self.progress * count;
        const seen = Math.min(count - 1, Math.max(0, Math.floor(t + MARK_LEAD)));
        if (seen === front) return;
        front = seen;
        panels.forEach((panel, i) => {
          if (i === seen) panel.dataset.front = "1";
          else delete panel.dataset.front;
        });
      },
    });
  }, deck);

  /* The deck's start position depends on where the section head ends, which
     depends on which font is drawing it. Without this the pin begins a few
     dozen pixels off on a cold load and every mark inherits the error. */
  let cancelled = false;
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(() => {
      if (!cancelled) ScrollTrigger.refresh();
    });
  }

  return () => {
    cancelled = true;
    /* revert() kills the trigger, unwraps the pin spacer and puts every
       inline style GSAP wrote back, so a mode flip or a route change leaves
       the plain markup behind rather than eight cards frozen mid-deal. */
    ctx.revert();
    /* revert() puts back every inline style GSAP wrote, but data-front is
       ours. It only means anything under [data-deck="pinned"], so a stale one
       is inert - removed anyway, because a leftover attribute that happens
       not to matter is the kind of thing that starts mattering. */
    deck.querySelectorAll("[data-front]").forEach((panel) => {
      delete panel.dataset.front;
    });
    delete deck.dataset.deck;
    deck.style.removeProperty("--deck-vh");
    deck.style.removeProperty("--deck-step");
  };
}
