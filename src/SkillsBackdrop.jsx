import { useEffect, useRef } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from "three";

/* --------------------------------------------------------------------------
   Skills backdrop
   An ambient WebGL field behind the skills spine: a lattice of points with a
   slow wave running through it. A lattice and not a particle drift because
   the sheet is already built on a grid and the section is about a signal
   path - this is the same idea, moving.

   This is the one infinite animation on the site, which AGENTS.md permits for
   background and ambient elements and nothing else. It earns that only by
   staying out of the way, so:

   - Under prefers-reduced-motion it is never mounted. Not paused, not slowed:
     the component returns null and three.js is never asked for a context.
   - It stops when it cannot be seen. An IntersectionObserver halts the frame
     loop when the section leaves the viewport and a visibilitychange listener
     halts it when the tab is hidden, so a reader on another tab is not paying
     for a wave nobody is looking at. Neither observer drives motion - the
     wave is time-based, and both only decide whether to spend a frame.
   - It is decoration and nothing else: aria-hidden, pointer-events none, and
     no content depends on it. With JS off, WebGL unavailable, or the context
     lost, the section is exactly what it was before.

   Loaded through React.lazy from Skills.jsx so three.js lands in its own
   chunk. The project routes never render Skills, so they never fetch it.
   -------------------------------------------------------------------------- */

/* Sparse on purpose. The first pass put 88x48 points across the section and
   the result was a dot screen the headings had to compete with - legible, but
   the opposite of calm. Roughly half the density, a third of the opacity and
   a hole in the middle is what makes it a backdrop instead of a texture. */
const COLS = 60;
const ROWS = 34;
const SPAN_X = 130;
const SPAN_Y = 72;

const VERT = `
  uniform float uTime;
  uniform float uSize;
  uniform vec2 uSpan;
  varying float vFade;

  void main() {
    vec3 p = position;

    /* Two waves at different rates and angles. One alone reads as a flag;
       crossed, the lattice never repeats a pose inside a visit. */
    float a = sin(p.x * 0.085 + uTime * 0.21);
    float b = cos(p.y * 0.115 - uTime * 0.16);
    float w = a * b;

    p.z += w * 3.4;

    /* Crests brighter than troughs, so the wave is legible as depth even at
       the opacity this thing has to live at. */
    float fade = 0.30 + 0.70 * (w * 0.5 + 0.5);

    /* Quiet in the middle, present at the edges. The headings and the lede
       run across the centre of this section, and a field that is uniformly
       dense puts dots through every one of them. Falling away from the centre
       means the wave frames the content instead of crossing it, and the
       reader only really catches it in the margins. */
    float r = length(position.xy / vec2(uSpan * 0.5));
    fade *= smoothstep(0.28, 0.95, r);

    vFade = fade;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = uSize * (300.0 / -mv.z);
    gl_Position = projectionMatrix * mv;
  }
`;

const FRAG = `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vFade;

  void main() {
    /* Round points. gl_PointCoord squares are visibly square at this size. */
    float d = length(gl_PointCoord - vec2(0.5));
    if (d > 0.5) discard;
    float edge = smoothstep(0.5, 0.15, d);
    gl_FragColor = vec4(uColor, edge * vFade * uOpacity);
  }
`;

/* The field is drawn in whatever the theme calls decoration, read off the
   custom property rather than hardcoded, so the light and dark grounds each
   get a colour that was already chosen to sit on them.

   Opacity has to be read per theme as well, and it is not a rounding detail.
   --decor is #5c5850 against a #08090b stage in the dark and #a8a9ad against
   #efece7 in the light: the dark pairing is far closer in luminance, so the
   single value that made the light theme calm made the dark theme empty. Each
   ground gets the number that was tuned on it. */
const OPACITY = { light: 0.18, dark: 0.42 };

function readTheme(el) {
  const styles = getComputedStyle(el);
  const raw = styles.getPropertyValue("--decor").trim();
  let color;
  try {
    color = new Color(raw || "#5c5850");
  } catch {
    color = new Color("#5c5850");
  }
  const dark = el.dataset.theme === "dark";
  return { color, opacity: dark ? OPACITY.dark : OPACITY.light };
}

export default function SkillsBackdrop() {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return undefined;

    /* Checked here as well as at the call site: the media query can flip
       while the page is open, and a reader who turns reduced motion on
       should not have to reload to be rid of this. */
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motion.matches) return undefined;

    let renderer;
    try {
      renderer = new WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power" });
    } catch {
      /* No WebGL. The section is complete without this. */
      return undefined;
    }

    renderer.setClearAlpha(0);
    host.appendChild(renderer.domElement);

    const scene = new Scene();
    const camera = new PerspectiveCamera(55, 1, 0.1, 400);
    camera.position.set(0, -6, 74);
    camera.lookAt(0, 0, 0);

    const count = COLS * ROWS;
    const positions = new Float32Array(count * 3);
    for (let iy = 0, i = 0; iy < ROWS; iy += 1) {
      for (let ix = 0; ix < COLS; ix += 1, i += 1) {
        positions[i * 3] = (ix / (COLS - 1) - 0.5) * SPAN_X;
        positions[i * 3 + 1] = (iy / (ROWS - 1) - 0.5) * SPAN_Y;
        positions[i * 3 + 2] = 0;
      }
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(positions, 3));

    const material = new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uSize: { value: 0.9 },
        uSpan: { value: new Vector2(SPAN_X, SPAN_Y) },
        uColor: { value: readTheme(document.documentElement).color },
        uOpacity: { value: readTheme(document.documentElement).opacity },
      },
      vertexShader: VERT,
      fragmentShader: FRAG,
      transparent: true,
      depthWrite: false,
    });

    const points = new Points(geometry, material);
    scene.add(points);

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = host;
      if (!w || !h) return;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();

    let raf = 0;
    let last = performance.now();
    let onScreen = true;

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      /* Time advanced by elapsed seconds rather than by frame count, so the
         wave runs at the same rate on a 60Hz panel and a 144Hz one, and does
         not jump after a pause. */
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      material.uniforms.uTime.value += dt;
      renderer.render(scene, camera);
    };

    const start = () => {
      if (raf) return;
      last = performance.now();
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      if (!raf) return;
      cancelAnimationFrame(raf);
      raf = 0;
    };
    const sync = () => {
      if (onScreen && !document.hidden) start();
      else stop();
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { rootMargin: "120px" }
    );
    io.observe(host);

    const ro = new ResizeObserver(resize);
    ro.observe(host);

    /* The theme toggle rewrites data-theme on the root, which changes what
       --decor resolves to. Without this the field keeps the previous theme's
       colour until reload. */
    const themeObserver = new MutationObserver(() => {
      const next = readTheme(document.documentElement);
      material.uniforms.uColor.value = next.color;
      material.uniforms.uOpacity.value = next.opacity;
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    const onMotionChange = () => {
      if (motion.matches) stop();
      else sync();
    };

    const canvas = renderer.domElement;
    const onLost = (event) => {
      /* Preventing the default is what makes the loss recoverable, but this
         backdrop has nothing to restore and nothing depends on it, so it
         simply stops and leaves the section as it was. */
      event.preventDefault();
      stop();
    };
    canvas.addEventListener("webglcontextlost", onLost);

    document.addEventListener("visibilitychange", sync);
    motion.addEventListener("change", onMotionChange);
    sync();

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", sync);
      motion.removeEventListener("change", onMotionChange);
      canvas.removeEventListener("webglcontextlost", onLost);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      /* forceContextLoss frees the GPU context immediately rather than at the
         next GC. Without it, navigating between routes enough times exhausts
         the browser's WebGL context limit and later canvases fail silently. */
      renderer.forceContextLoss?.();
      if (canvas.parentNode === host) host.removeChild(canvas);
    };
  }, []);

  return <div className="stage-backdrop" ref={hostRef} aria-hidden="true" />;
}
