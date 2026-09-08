import React from "react";
import ReactDOM from "react-dom/client";

/* Self-hosted fonts. Keeps type off the critical third-party path and
   avoids the render-blocking @import the stylesheet used to carry. */
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/ibm-plex-sans";
import "@fontsource/ibm-plex-mono/latin-400.css";
import "@fontsource/ibm-plex-mono/latin-500.css";

import App from "./App";
import "./spa.css";
import "./rig-buildup.css";
import "./demo-pellet.css";
import "./demo-pellet-close.css";
import "./demo-tunnel.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
