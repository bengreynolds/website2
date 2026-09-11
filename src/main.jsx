import React from "react";
import ReactDOM from "react-dom/client";

/* Self-hosted fonts. Keeps type off the critical third-party path and
   avoids the render-blocking @import the stylesheet used to carry.

   Syne carries the name and the stage titles at poster scale, Geist carries
   body copy, IBM Plex Mono carries every number, label and readout. The
   family names these packages declare are suffixed ("Syne Variable"), which
   is what src/spa.css asks for - the previous stylesheet named the
   unsuffixed families and quietly rendered every heading in system-ui. */
import "@fontsource-variable/syne";
import "@fontsource-variable/geist";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-500.css";

import App from "./App";
import "./spa.css";
import "./rig-buildup.css";
import "./rig-prosthetic-build.css";
import "./rig-lickreward-build.css";
import "./rig-hypoxia-build.css";
/* rig-scrub.css must stay LAST of the rig sheets. Its animation-range override
   is .rig-figure[data-figure].is-live, the same 0,3,0 specificity as the range
   each generated file declares, so source order is the only thing that decides
   between them. */
import "./rig-scrub.css";
import "./demo-pellet.css";
import "./demo-pellet-close.css";
import "./demo-tunnel.css";
import "./demo-pcb.css";
import "./demo-prosthetic-function.css";
import "./demo-lickrevolver-build.css";
import "./demo-lickrevolver-trial.css";
import "./demo-lickrevolver-trial-close.css";
import "./demo-lickrevolver-ui.css";
import "./demo-reach-single.css";
import "./demo-reach-session.css";
/* The demo sheets, sprite then live-DOM. Both branches appended here, so the
   order is: site-e's new sprite demos with the rest of the sprite demos, then
   the two DOM demos, then main's navigation-depth chrome, which is page
   furniture rather than a demo and stays last as it was. pipeline-demo.css
   arrived on both sides and is imported once. */
import "./demo-lickdetect-build.css";
import "./demo-lickdetect-reward.css";
import "./demo-lickreward-port.css";
import "./demo-hypoxia-loop.css";
import "./demo-hypoxia-door.css";
import "./pipeline-demo.css";
import "./report-demo.css";
import "./rail-depth.css";
import "./nav-swap.css";
import "./grid-depth.css";
import "./view-transition.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
