import { memo, useEffect, useRef, useSyncExternalStore } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { skills, skillsIntro } from "./siteData";
import { skillCredits } from "./skillCredits";

gsap.registerPlugin(ScrollTrigger);

/* --------------------------------------------------------------------------
   Skills - eight panels dealt off a pinned deck
   --------------------------------------------------------------------------
   This replaces the eight <details> accordions, which in turn replaced an
   earlier pinned version that was deleted. Section 9 of spa.css recorded why
   that one went: it took three viewports of scroll per skill, so eight skills
   cost twenty-four viewports and the reader had no way to move at their own
   pace.

   The whole of that failure is a single missing number. The old version let
   the pin length fall out of the layout - a track taller than its content,
   per stage - so nobody ever wrote down what the section cost. Here the cost
   IS the number, declared once:

       DECK_SCROLL_VH = 5

   Five viewports of scroll for all eight panels, 0.625 each. It sets the
   ScrollTrigger `end`, it sets the height of the pin spacer through that, and
   it sets the spacing of the scroll marks the rail jumps to. Change it and
   every one of those moves together.

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
   once and mark an arbitrary one. Each mark instead spans exactly the slice
   of the track where its panel is the front card, which makes the observer
   correct rather than merely alive, and makes a rail jump land on the panel
   it names. See the geometry note in src/deck.css.

   ---- when the deck does not run -----------------------------------------

   Reduced motion, or a viewport too small to hold a full panel, renders the
   same eight panels in ordinary document flow, and there the panels carry
   #skill-<id> and data-stage-id themselves because they have real positions
   again. Nothing is pinned, nothing is scrubbed, no marks are rendered, and
   GSAP builds no timeline at all.

   Both modes are decided at first render from matchMedia, not in an effect,
   so the DOM App.jsx's observer queries on mount is already the right one.
   -------------------------------------------------------------------------- */

/* The one number. Total scroll, in viewport heights, for all eight panels. */
export const DECK_SCROLL_VH = 5;

/* One unit of the timeline is one panel. Of that unit the panel holds still
   for DWELL and hands over for the rest, so a reader gets a stationary page
   of text before it starts moving rather than eight continuously drifting
   ones. Held here as a fraction because the mark geometry in deck.css assumes
   unit == panel and nothing else. */
const DWELL = 0.45;
const HANDOVER = 1 - DWELL;

/* The three card states. z is what does the work: the front card is on the
   projection plane, the outgoing card recedes behind the incoming one, and
   painting order in a preserve-3d stage follows z, so nothing here needs a
   z-index. */
const FRONT = { yPercent: 0, z: 0, rotateX: 0 };
const BELOW = { yPercent: 11, z: -260, rotateX: 7 };
const RECEDED = { yPercent: -8, z: -520, rotateX: -13 };

/* Alpha is tweened apart from the transform, and the two windows do not line
   up, because a linear crossfade of two full pages of text is unreadable in
   the middle - measured at 0.51 and 0.74 on the first build, which put two
   ledes on top of each other for a third of a viewport of scroll.

   The cards are opaque (--surface, see deck.css), and the incoming one is in
   front, so the fix is to stop treating this as a crossfade at all: the
   incoming card reaches full opacity in the first third of the handover and
   covers the outgoing one, which only then fades, behind it, where nobody is
   trying to read it. Fractions of one handover, so they follow DWELL. */
const FADE_IN = 0.32;
const FADE_OUT_FROM = 0.55;
const FADE_OUT = 0.45;

/* Where the reader thinks one card became the next, in units, and how far the
   scroll marks therefore run ahead of the timeline's own unit boundaries.

   Panel i is the front card for the first DWELL of unit i, and the incoming
   card is fully opaque and covering it FADE_IN of the handover later - so the
   card a reader is looking at changes at i + 0.63, not at i + 1. Marking the
   unit boundaries instead left the rail saying 03 with card 04 filling the
   screen, which was visible and wrong. */
const HANDOVER_SEEN = DWELL + HANDOVER * FADE_IN;
const MARK_LEAD = 1 - HANDOVER_SEEN;
/* Where a rail jump aims: the middle of the stationary part of a unit, so the
   card lands still rather than already moving. */
const JUMP_AT = DWELL / 2;

const REDUCE_QUERY = "(prefers-reduced-motion: reduce)";
/* A pinned panel is a full viewport of text. Below this it does not fit, and
   a pin that has to scroll internally is worse than no pin - so a phone, a
   tablet in portrait and a short window all get the flow stack, which is the
   same fallback reduced motion gets and is therefore already exercised.

   78rem is not a guess: it is the breakpoint where :root sets --rail-h to 0
   and the index rail becomes a fixed left column. Below it the rail is a
   sticky bar across the top, which a 100vh pinned stage would sit under. */
const ROOM_QUERY = "(min-width: 78rem) and (min-height: 34rem)";

/* Read at render, not in an effect: App.jsx's stage observer runs once on
   mount and queries [data-stage-id] out of the committed DOM, so the mode has
   to be settled before that commit or the observer latches onto nodes that
   are about to be replaced. The server snapshot is false, which resolves to
   the flow stack - the readable one. */
function useMedia(query) {
  return useSyncExternalStore(
    (notify) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", notify);
      /* resize as well as change, and not for belt and braces: a viewport
         resized through DevTools' device emulation updates matchMedia().matches
         but does not always dispatch the change event, which left the deck in
         flow mode on a window that had grown large enough for it. The store
         only re-renders when the snapshot differs, so notifying on every
         resize frame costs one boolean comparison. */
      window.addEventListener("resize", notify);
      return () => {
        mq.removeEventListener("change", notify);
        window.removeEventListener("resize", notify);
      };
    },
    () => window.matchMedia(query).matches,
    () => false
  );
}

const creditBySlug = new Map(skillCredits.map((entry) => [entry.slug, entry]));

/* Whether the image's own title already credits its author. Compared on the
   first word of the author, because the manifest may carry a library credit
   after the person's name ("Max Gruber / Better Images of AI") while the
   title carries only the name. */
function namesAuthor(credit) {
  const first = String(credit.author || "").trim().split(/[\s/]+/)[0];
  if (first.length < 3) return false;
  return String(credit.title || "").toLowerCase().includes(first.toLowerCase());
}

/* A slug with no file renders a labelled placeholder rather than a gap. The
   section is meant to ship before every image is sourced, and an empty plate
   that says what belongs in it is more useful to whoever fills it than a
   collapsed box. */
const SkillFigure = memo(function SkillFigure({ skill }) {
  const credit = creditBySlug.get(skill.image);

  if (!credit) {
    return (
      <div className="skill-plate skill-plate--empty">
        <p className="skill-plate-note">
          <span className="skill-plate-slug">{skill.image}</span>
          image not yet sourced
        </p>
      </div>
    );
  }

  return (
    <figure className="skill-plate">
      <img
        className="skill-shot"
        src={credit.file}
        alt={credit.alt || credit.title}
        loading="lazy"
        decoding="async"
      />
      <figcaption className="skill-credit">
        <a href={credit.source} target="_blank" rel="noreferrer noopener">
          {credit.title}
        </a>
        {/* Some Commons titles already carry the author, so appending it
            printed "Banana Plant Flask by Max Gruber by Max Gruber". The
            licence still needs the attribution, so it is only skipped when the
            title has already given it. */}
        {namesAuthor(credit) ? null : <> by {credit.author}</>},{" "}
        <a href={credit.licenceUrl} target="_blank" rel="noreferrer noopener">
          {credit.licence}
        </a>
      </figcaption>
    </figure>
  );
});

/* One panel. In the deck it is an absolutely positioned card and the marks
   own the identity; in flow it is an ordinary block and owns its own. Exactly
   one of the two carries data-stage-id at any time, because App.jsx's
   observer takes the first intersecting entry and two carriers per skill
   would make that a coin toss. */
const DeckPanel = memo(function DeckPanel({ skill, dealt }) {
  const titleId = `skill-title-${skill.id}`;

  return (
    <article
      className="deck-panel"
      aria-labelledby={titleId}
      id={dealt ? undefined : `skill-${skill.id}`}
      data-stage-id={dealt ? undefined : skill.id}
    >
      <div className="deck-panel-inner">
        <div className="deck-copy">
          <p className="deck-slug">
            <span className="stage-num">{skill.n}</span>
            {/* Spans rather than a list: this is one line of metadata, and a
                <ul> here would announce eight list items per panel. */}
            <span className="stage-terms">
              {skill.terms.map((term) => (
                <span className="stage-term" key={term}>
                  {term}
                </span>
              ))}
            </span>
          </p>

          <h3 className="stage-title" id={titleId}>
            {skill.title}
          </h3>

          <p className="stage-lede">{skill.lede}</p>

          <dl className="stage-readout">
            {skill.readout.map((row) => (
              <div className="stage-readout-row" key={row.label}>
                <dt>{row.label}</dt>
                <dd>{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div className="deck-figure">
          <SkillFigure skill={skill} />
        </div>
      </div>
    </article>
  );
});

export default function Skills() {
  const reduced = useMedia(REDUCE_QUERY);
  const roomy = useMedia(ROOM_QUERY);
  const dealt = roomy && !reduced;

  const deckRef = useRef(null);
  const stageRef = useRef(null);

  useEffect(() => {
    if (!dealt) return undefined;
    const deck = deckRef.current;
    const stage = stageRef.current;
    if (!deck || !stage) return undefined;

    /* data-deck is what switches deck.css from the flow stack to the stacked
       cards. It is set from the effect rather than from render on purpose: if
       this module ever fails to run - GSAP missing, an exception in the
       timeline - the markup is still the readable stack, because the CSS that
       collapses eight panels onto one box only applies once the code that
       animates them is known to have run. */
    deck.dataset.deck = "pinned";

    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray(".deck-panel", stage);
      const count = panels.length;
      if (!count) return;

      gsap.set(panels[0], { ...FRONT, autoAlpha: 1 });
      gsap.set(panels.slice(1), { ...BELOW, autoAlpha: 0 });

      /* An empty tween sets the length so the timeline is exactly one unit
         per panel: panel i is the front card over [i, i+1). Everything below
         is inserted at an absolute position in those units, so the mark
         geometry in deck.css and this timeline share one grid. */
      const tl = gsap.timeline({ defaults: { ease: "none", immediateRender: false } });
      tl.to({}, { duration: count });

      for (let i = 0; i < count - 1; i += 1) {
        const at = i + DWELL;
        const out = panels[i];
        const next = panels[i + 1];

        /* Transforms run the full handover at a constant rate: the scrub is
           the reader's hand, and an ease on top of it makes the card lag the
           wheel rather than follow it. */
        tl.fromTo(out, FRONT, { ...RECEDED, duration: HANDOVER }, at);
        tl.fromTo(next, BELOW, { ...FRONT, duration: HANDOVER }, at);

        tl.fromTo(
          next,
          { autoAlpha: 0 },
          { autoAlpha: 1, duration: HANDOVER * FADE_IN, ease: "power2.out" },
          at
        );
        tl.fromTo(
          out,
          { autoAlpha: 1 },
          { autoAlpha: 0, duration: HANDOVER * FADE_OUT, ease: "power1.in" },
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
        /* Two numbers out to CSS, which derives the marks from them. Taken
           from the trigger rather than recomputed so they cannot disagree
           with the pin that actually ran. */
        onRefresh: (self) => {
          const span = self.end - self.start;
          deck.style.setProperty("--deck-vh", `${window.innerHeight}px`);
          deck.style.setProperty("--deck-step", `${span / count}px`);
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
      delete deck.dataset.deck;
      deck.style.removeProperty("--deck-vh");
      deck.style.removeProperty("--deck-step");
    };
  }, [dealt]);

  return (
    <section id="skills" className="section section--stage">
      <div className="container">
        <div className="section-head reveal">
          <h2 className="section-title">Skills</h2>
          <p className="section-lead">{skillsIntro}</p>
        </div>
      </div>

      {/* Two dimensionless numbers out to CSS, which is where the mark
          geometry lives. They come from the timeline constants above rather
          than being typed twice, so retiming the handover moves the marks and
          the rail jumps with it. */}
      <div
        className="deck"
        ref={deckRef}
        style={{ "--mark-lead": MARK_LEAD, "--jump-at": JUMP_AT }}
      >
        <div className="deck-stage" ref={stageRef}>
          {skills.map((skill) => (
            <DeckPanel skill={skill} dealt={dealt} key={skill.id} />
          ))}
        </div>

        {/* Scroll marks. Empty, 1px wide, pointer-transparent: they exist to
            have a position, and the position is the whole of their job. Only
            rendered when the deck is pinned, because in flow the panels have
            positions of their own. */}
        {dealt
          ? skills.map((skill, index) => (
              <div
                className="deck-mark"
                key={skill.id}
                id={`skill-${skill.id}`}
                data-stage-id={skill.id}
                style={{ "--i": index }}
              />
            ))
          : null}
      </div>
    </section>
  );
}
