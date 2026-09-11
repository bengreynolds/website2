import { memo, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { skills, skillsIntro } from "./siteData";
import { skillCredits } from "./skillCredits";
import { JUMP_AT, MARK_LEAD } from "./deckGeometry";

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
   per stage - so nobody ever wrote down what the section cost. Now the cost
   IS a number, declared once in src/deckGeometry.js:

       DECK_SCROLL_VH = 5

   Five viewports of scroll for all eight panels, 0.625 each. It sets the
   ScrollTrigger `end`, it sets the height of the pin spacer through that, and
   it sets the spacing of the scroll marks the rail jumps to. Change it and
   every one of those moves together.

   ---- three files, and why -------------------------------------------------

   This one renders the markup and decides which of the two layouts it is.
   src/deckGeometry.js holds the numbers and imports nothing.
   src/deckTimeline.js builds the pin and the timeline, and it is imported
   DYNAMICALLY - because it is the only one of the three that needs GSAP and
   ScrollTrigger, 45.5kB gzipped that a phone, a reduced-motion reader and a
   narrow window can never use. The import is armed by an IntersectionObserver
   about a viewport and a half ahead of the section, which is the same shape
   of gate the site already puts in front of its sprite sheets.

   Ahead, and not on arrival, for a specific reason: switching from the flow
   stack to the pinned deck changes the height of the section by several
   viewports. Armed early that happens below the fold and nothing a reader is
   looking at moves. Armed late it would happen under them.

   ---- what is pinned, and what is not -------------------------------------

   .deck-stage is pinned; .deck is the trigger. The eight .deck-mark elements
   are absolutely positioned against .deck and stand in for the scroll
   positions a pinned panel does not have - each spans exactly the slice of
   track where its panel is the front card, which is what makes App.jsx's
   stage observer correct rather than merely alive and makes a rail jump land
   on the panel it names. See the geometry note in src/deck.css and the longer
   one in src/deckTimeline.js.

   ---- when the deck does not run -----------------------------------------

   Reduced motion, or a viewport too small to hold a full panel, renders the
   same eight panels in ordinary document flow, and there the panels carry
   #skill-<id> and data-stage-id themselves because they have real positions
   again. Nothing is pinned, nothing is scrubbed, no marks are rendered, and
   GSAP is never even fetched.

   Both modes are decided at first render from matchMedia, not in an effect,
   so the DOM App.jsx's observer queries on mount is already the right one.
   -------------------------------------------------------------------------- */

/* How far ahead of the section the timeline is fetched. One and a half
   viewports of margin on each side of the root, so the arming happens while
   the deck is still comfortably off screen. */
const ARM_MARGIN = "150% 0px";

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
  /* A deck chunk that will not load has to put the section back into flow,
     not just stop trying. While `dealt` is true the panels hand their id and
     data-stage-id to the scroll marks, and the marks are 0px tall at the top
     of the deck until buildDeck's first onRefresh - so without this every
     #skill-<id> anchor in the rail resolves to the same point and App.jsx's
     stage observer can no longer tell which skill the reader is in. */
  const [failed, setFailed] = useState(false);
  const dealt = roomy && !reduced && !failed;

  const deckRef = useRef(null);
  const stageRef = useRef(null);

  useEffect(() => {
    if (!dealt) return undefined;
    const deck = deckRef.current;
    const stage = stageRef.current;
    if (!deck || !stage) return undefined;

    /* The timeline, and GSAP with it, is fetched on approach rather than on
       mount. Everything below is the arming: one observer, fired once, and a
       teardown that has to be correct in three states - before the import is
       started, while it is in flight, and after it has built the deck. */
    let cancelled = false;
    let armed = false;
    let teardown = null;

    const arm = () => {
      if (cancelled || armed) return;
      armed = true;
      import("./deckTimeline")
        .then(({ buildDeck }) => {
          /* The reader may have resized into the flow layout, or navigated
             away, while the chunk was in flight. Building the deck then would
             pin a section nobody is looking at and leave a spacer behind. */
          if (cancelled) return;
          teardown = buildDeck(deck, stage);
        })
        .catch(() => {
          /* A chunk that will not load falls back to the flow layout - the
             same one reduced motion and a narrow window get. Setting `failed`
             rather than only disarming is what actually gets there: it hands
             the id and data-stage-id back to the panels, so the rail's anchors
             and the stage observer keep working. Disarming alone left the
             panels readable but the rail pointing eight links at one spot. */
          armed = false;
          if (!cancelled) setFailed(true);
        });
    };

    if (typeof IntersectionObserver !== "function") {
      arm();
      return () => {
        cancelled = true;
        if (teardown) teardown();
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        arm();
      },
      { rootMargin: ARM_MARGIN }
    );
    observer.observe(deck);

    return () => {
      cancelled = true;
      observer.disconnect();
      if (teardown) teardown();
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
