import { useEffect } from "react";

/* --------------------------------------------------------------------------
   Wheel scrub
   -------------------------------------------------------------------------- */

/* One wheel notch, near enough, on every platform that reports pixels. Making
   it the cost of a single frame is the whole point of this hook: at the
   view() timeline's ~3.6px per frame a notch skipped ~27 frames, so the
   sequence was over in about four of them. Raise it to make the figure slower
   and finer, lower it to get past the figure in fewer notches. */
const PX_PER_FRAME = 100;

/* Firefox reports lines, and page mode exists on some remotes. */
function wheelPixels(event) {
  if (event.deltaMode === 1) return event.deltaY * 16;
  if (event.deltaMode === 2) return event.deltaY * window.innerHeight;
  return event.deltaY;
}

/* AGENTS.md forbids scroll listeners and this is the one deliberate exception
   to it; see the header of src/rig-scrub.css for why no declarative timeline
   can do this. It stays narrow: a wheel listener on one figure, no observers,
   no timers, and nothing on the page or document.

   React owns the frame index, but it lives in a closure and is written
   straight to a custom property rather than to state. A wheel gesture fires
   dozens of events a second and none of them change anything React renders. */
export default function useWheelScrub(ref, frames, enabled) {
  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled || !frames || frames < 2) return undefined;

    /* Coarse pointers keep the view() timeline: capturing a touch drag is far
       more hostile than capturing a wheel, and there is no hover to scope it
       to. Under reduce the sprite is never even downloaded, so a panel that
       ate the wheel would trap the page in front of a static poster. */
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
      return undefined;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return undefined;
    }

    const last = frames - 1;
    let frame = 0;
    let carry = 0;

    /* Snapped to a keyframe stop rather than left continuous. The generated
       keyframes put frame k at k/(frames-1) of the timeline and hold it with
       step-end, so landing on a stop is what guarantees every frame is
       reachable instead of some being scrubbed past between notches.
       rig-scrub.css biases the seek half a step past the stop; without that,
       float rounding lands under the boundary and shows frame k-1. */
    const write = () => {
      el.style.setProperty("--scrub", String(frame / last));
      /* Drives the cursor: at either end the wheel goes back to the page, and
         the panel should stop advertising a scrub it will not perform. */
      el.dataset.scrubEnd = frame <= 0 || frame >= last ? "1" : "0";
    };

    /* Where the scroll timeline currently has the sprite, read back off the
       painted cell so handing over is seamless. background-size carries the
       column count ("1000%" is ten) and background-position the cell, both
       from the generated CSS, so this cannot disagree with the sheet. */
    const frameFromPaint = () => {
      const cs = getComputedStyle(el);
      const cols = Math.round(parseFloat(cs.backgroundSize) / 100);
      if (!cols || cols < 2) return 0;
      const [x, y] = cs.backgroundPosition.split(" ").map(parseFloat);
      if (!Number.isFinite(x) || !Number.isFinite(y)) return 0;
      const stepPct = 100 / (cols - 1);
      const col = Math.round(x / stepPct);
      const row = Math.round(y / stepPct);
      return Math.min(last, Math.max(0, row * cols + col));
    };

    let engaged = false;

    /* Engaging is deliberate. An earlier build handed the wheel over as soon
       as the pointer was inside the figure, which meant anyone scrolling the
       page with the cursor over it got caught mid-sequence and had to wheel
       out the remaining frames. Worse, it replaced the scroll timeline
       outright, so a visitor who never hovered watched the figure sit frozen
       on frame 0 while it scrolled past - measured: 600px of page scroll, no
       frame change. The scroll timeline now stays in charge until asked. */
    const engage = () => {
      if (engaged) return;
      engaged = true;
      frame = frameFromPaint();
      carry = 0;
      el.dataset.scrub = "wheel";
      /* Interval count, not frame count: stops sit 1/steps apart, and
         rig-scrub.css needs that spacing to bias the seek off the boundary. */
      el.style.setProperty("--scrub-steps", String(last));
      write();
    };

    const release = () => {
      if (!engaged) return;
      engaged = false;
      delete el.dataset.scrub;
      delete el.dataset.scrubEnd;
      el.style.removeProperty("--scrub");
      el.style.removeProperty("--scrub-steps");
    };

    const onClick = () => (engaged ? release() : engage());

    const onWheel = (event) => {
      if (!engaged) return; // scroll timeline still owns it; let the page have it
      const direction = Math.sign(event.deltaY);
      if (!direction) return;

      /* Release at the ends: once the sequence is exhausted in the direction
         being scrolled, the wheel goes back to the page untouched. Without
         this the figure is a scroll trap for anyone whose pointer happens to
         rest on it. */
      if (direction > 0 && frame >= last) return;
      if (direction < 0 && frame <= 0) return;

      event.preventDefault();

      carry += wheelPixels(event);
      const step = Math.trunc(carry / PX_PER_FRAME);
      if (!step) return;

      carry -= step * PX_PER_FRAME;
      const next = Math.min(last, Math.max(0, frame + step));
      if (next === frame) return;
      frame = next;
      write();
    };

    /* The keyboard equivalent of the wheel, and the reason engaging is worth
       making focusable at all: arrows step a frame, Home/End jump the ends,
       Escape hands the figure back to the scroll timeline. */
    const onKeyDown = (event) => {
      const { key } = event;
      if (key === "Enter" || key === " ") {
        event.preventDefault();
        onClick();
        return;
      }
      if (key === "Escape") {
        release();
        return;
      }
      if (!engaged) return;
      const delta =
        key === "ArrowDown" || key === "ArrowRight"
          ? 1
          : key === "ArrowUp" || key === "ArrowLeft"
            ? -1
            : key === "End"
              ? last
              : key === "Home"
                ? -last
                : 0;
      if (!delta) return;
      event.preventDefault();
      const next = Math.min(last, Math.max(0, frame + delta));
      if (next === frame) return;
      frame = next;
      write();
    };

    /* Armed, not engaged: the cursor and the caption can advertise the scrub
       without the figure having taken the wheel yet. */
    el.dataset.scrubArmed = "1";
    el.tabIndex = 0;
    el.addEventListener("click", onClick);
    el.addEventListener("keydown", onKeyDown);
    /* Not passive: preventDefault is the entire mechanism. */
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("click", onClick);
      el.removeEventListener("keydown", onKeyDown);
      el.removeEventListener("wheel", onWheel);
      delete el.dataset.scrubArmed;
      el.removeAttribute("tabindex");
      release();
    };
  }, [ref, frames, enabled]);
}

