import { memo } from "react";

/* --------------------------------------------------------------------------
   NavSwap
   A label that swaps for a copy of itself on hover and focus. Two stacked
   copies in a clipped box; the stack translates exactly one line on hover, so
   the outgoing and incoming glyphs are the same shape and the movement reads
   as one object rather than a crossfade.

   The technique is lifted from landonorris.com. The defect is not: that site
   leaves both copies in the accessibility tree, so a screen reader announces
   "Home Home". The second copy here is aria-hidden, and the box is presented
   as a single label.

   Transform only, no opacity, one duration token. This is legal under the
   section 4 motion budget as written, which is why it is the one component
   here that needs no sandbox argument.
   -------------------------------------------------------------------------- */

const NavSwap = memo(function NavSwap({ children }) {
  return (
    <span className="nav-swap">
      <span className="nav-swap-track">
        <span className="nav-swap-face">{children}</span>
        <span className="nav-swap-face" aria-hidden="true">
          {children}
        </span>
      </span>
    </span>
  );
});

export default NavSwap;
