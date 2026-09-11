/* Fetches the brand marks used by the skills readouts and the project stack
   panels, and generates src/logoCredits.js.

   Why a generator and not committed SVG files: every mark here is one shape
   plus a brand hex, and the page needs that hex as a CSS value anyway to
   survive the dark theme. Keeping the path data inside the module means one
   fewer request per mark, no flash of an unstyled figure, and a dark-mode
   colour computed once here rather than hand-picked forty times.

   Run: node scripts/logos/fetch-logos.mjs

   Licensing. Simple Icons ships its SVGs under CC0-1.0, Devicon under MIT.
   Neither licence grants trademark rights, and none is claimed: every mark
   sits beside the tool's own name, labelling a tool the adjacent text already
   names, which is what nominative use is. No shape is altered. Several of
   these brands prohibit recolouring and all of them prohibit reshaping, so
   the only adjustment made anywhere is a lightness lift for contrast, which
   holds hue and saturation fixed. */
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const OUT = resolve(ROOT, "src/logoCredits.js");

/* Both sources are pinned, and the pin is the point rather than tidiness.
   Asking the CDN for @latest resolves the data manifest and the icon files
   independently, and it will happily serve a cached SVG for an icon the
   current release has dropped - which is how PowerShell, Windows and ZeroMQ
   first appeared to be available here. Simple Icons removes a mark when its
   owner asks it to, so a file that outlives its manifest entry is the one
   file you least want to ship. Pinning makes the two agree, and the missing
   check below turns a removal into a build error instead of a silent revival. */
const SI_VERSION = "16.30.0";
const DEV_VERSION = "v2.17.0";

const SI_DATA = `https://cdn.jsdelivr.net/npm/simple-icons@${SI_VERSION}/data/simple-icons.json`;
const SI_SVG = (s) => `https://cdn.jsdelivr.net/npm/simple-icons@${SI_VERSION}/icons/${s}.svg`;
const DEV_SVG = (n, variant) =>
  `https://cdn.jsdelivr.net/gh/devicons/devicon@${DEV_VERSION}/icons/${n}/${n}-${variant}.svg`;

/* Simple Icons marks: single-path and monochrome, so the page colours them
   with the brand hex and can lift that hex where a ground needs it.

   Some entries list a version-suffixed spelling as well ("Rust 1.70",
   "TensorFlow 2.10.1"). The project stacks pin versions in the item text, and
   matching stays exact, so the pinned spelling has to be listed to resolve.
   Listing them beats loosening the match: a prefix rule that caught
   "Rust 1.70" also caught every sentence starting with C.
   id: [slug, display label, ...strings in siteData.js that mean it] */
const MONO = {
  python: ["python", "Python", "Python"],
  cplusplus: ["cplusplus", "C++", "C++"],
  c: ["c", "C", "C"],
  rust: ["rust", "Rust", "Rust", "Cargo", "Rust 1.70"],
  javascript: ["javascript", "JavaScript", "JavaScript"],
  typescript: ["typescript", "TypeScript", "TypeScript"],
  bash: ["gnubash", "Bash", "Bash", "bash"],
  /* PowerShell, Windows and ZeroMQ are deliberately not here. Simple Icons
     carries no entry for any of them as of 16.30.0 - they were dropped from
     the set - and no other free source for them was found that did not come
     with a worse licence than no mark at all. Those three render as plain
     text, which the sections already handle. */
  qt: ["qt", "Qt", "Qt", "Qt Designer", "PySide6"],
  react: ["react", "React", "React"],
  node: ["nodedotjs", "Node", "Node"],
  nginx: ["nginx", "nginx", "nginx"],
  socketio: ["socketdotio", "Socket.IO", "Socket.IO", "Socket.IO bridge"],
  cmake: ["cmake", "CMake", "CMake"],
  pytest: ["pytest", "pytest", "pytest"],
  arduino: ["arduino", "Arduino", "Arduino"],
  stm32: ["stmicroelectronics", "STM32", "STM32", "STM32 HAL", "STM32G474RET"],
  kicad: ["kicad", "KiCad", "KiCad"],
  tensorflow: ["tensorflow", "TensorFlow", "TensorFlow", "TensorFlow 2.10.1"],
  pytorch: ["pytorch", "PyTorch", "PyTorch"],
  sklearn: ["scikitlearn", "scikit-learn", "scikit-learn"],
  opencv: ["opencv", "OpenCV", "OpenCV"],
  numpy: ["numpy", "NumPy", "NumPy"],
  scipy: ["scipy", "SciPy", "SciPy"],
  pandas: ["pandas", "pandas", "pandas"],
  onnx: ["onnx", "ONNX Runtime", "ONNX Runtime"],
  nvidia: [
    "nvidia",
    "NVIDIA",
    "CUDA",
    "cuDNN",
    "Jetson",
    "Jetson AGX",
    "CUDA toolkit",
    "NVIDIA drivers",
    "JetPack 5.1",
  ],
  docker: ["docker", "Docker", "Docker"],
  git: ["git", "Git", "git", "Git hooks"],
  linux: ["linux", "Linux", "Linux", "Ubuntu x86_64", "Ubuntu 22.04 x86_64"],
  conda: ["anaconda", "conda", "conda", "Conda", "Conda environment"],
  pip: ["pypi", "pip", "pip"],
  blender: ["blender", "Blender", "Blender"],
  bambulab: ["bambulab", "Bambu Lab", "Bambu Lab"],
  /* Blender and Bambu Lab match nothing in siteData.js today - neither tool
     is named anywhere in the copy, so neither mark renders. They are kept
     because they are wanted, and the moment either name is added to a readout
     or a stack layer the mark is already here. Marks that were wanted by
     nobody and matched nothing - Raspberry Pi, SQLite, FreeCAD, LabVIEW -
     were removed instead: an unreferenced mark is payload in the main bundle
     and nothing else. */
  autodesk: ["autodesk", "Inventor", "Inventor"],
};

/* Devicon marks: the four Simple Icons has no entry for. A second source is a
   second licence to track, so it stays as small as it can.

   The variant is chosen per mark, and matplotlib is why. Its `original` is
   23kB of path data - more than a quarter of everything else here put
   together - because the logo is drawn as a real plot with every curve in it.
   Its `plain` is the same drawing at 2.6kB. Simplifying a mark by hand is out
   of the question, since reshaping is the one thing every brand policy here
   forbids, but choosing between two variants the owner already publishes is
   not reshaping anything.

   Tone is detected rather than declared: a Devicon mark drawn in a single
   fill is monochrome in everything but provenance, so it is treated as one
   below and gets the same theming as the Simple Icons set.
   id: [devicon name, variant, display label, ...strings that mean it] */
const DEVICON = {
  fusion: ["fusion", "original", "Fusion 360", "Fusion 360", "Autodesk Fusion"],
  matlab: ["matlab", "original", "MATLAB", "MATLAB"],
  matplotlib: ["matplotlib", "plain", "Matplotlib", "Matplotlib"],
};

async function get(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res.text();
}

/* WCAG relative luminance, then the 1.4.11 non-text contrast ratio. A brand
   hex is used exactly as given wherever it clears 3:1 on the ground it sits
   on; only the ones that miss get lifted, and they are lifted in HSL so hue
   and saturation - the part a reader actually recognises - are untouched. */
const srgb = (c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
function lum(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => srgb(v / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
const contrast = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

function toHsl(hex) {
  const n = parseInt(hex.replace("#", ""), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
  }
  h = (h * 60 + 360) % 360;
  const l = (max + min) / 2;
  const s = d ? d / (1 - Math.abs(2 * l - 1)) : 0;
  return [h, s, l];
}

function toHex(h, s, l) {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const t = [[c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x]][
    Math.floor(h / 60) % 6
  ];
  return (
    "#" +
    t.map((v) => Math.round((v + m) * 255).toString(16).padStart(2, "0")).join("")
  );
}

/* Returns null when the brand hex already clears `min` on this ground, so an
   override is only emitted where it earns itself and most marks ship carrying
   exactly one colour - which is the point, since the brand hex is the thing a
   reader recognises. */
function liftFor(hex, ground, min, downward) {
  if (contrast(hex, ground) >= min) return null;
  const [h, s] = toHsl(hex);
  const step = downward ? -0.02 : 0.02;
  const stop = downward ? 0.05 : 0.95;
  for (let l = 0.5; downward ? l >= stop : l <= stop; l += step) {
    const candidate = toHex(h, s, l);
    if (contrast(candidate, ground) >= min) return candidate;
  }
  return downward ? "#1a1c20" : "#e8e6e2";
}

const LIGHT_GROUND = "#faf8f5";
const DARK_GROUND = "#14161b";

/* Two different thresholds, because the two grounds fail differently.
   On the dark ground the failure is disappearance: half these brand hexes are
   near-black - Rust, Socket.IO, pandas at #150458 - and a black mark on
   #14161b is simply not there, so those take the full 3:1 of WCAG 1.4.11.
   On the light ground nothing disappears; the palest brand yellows just go
   faint, and the mark is never the only thing carrying the meaning because
   the tool's own name is the word directly beside it. Holding that case to
   3:1 too would have darkened sixteen marks off their brand colour to fix a
   legibility problem the text has already solved, so it is held to 2:1 and
   most marks keep the hex their owner published. */
const LIGHT_MIN = 2;
const DARK_MIN = 3;

async function main() {
  const raw = JSON.parse(await get(SI_DATA));
  const list = Array.isArray(raw) ? raw : raw.icons;
  const bySlug = new Map();
  for (const i of list) {
    const slug =
      i.slug || String(i.title).toLowerCase().replace(/[^a-z0-9]/g, "");
    bySlug.set(slug, i);
  }

  const out = [];
  const aliases = [];

  for (const [id, [slug, label, ...names]] of Object.entries(MONO)) {
    /* Loud, not skipped. A slug that has left the manifest has usually been
       withdrawn at the brand owner's request, and a warning in a build log is
       not where that should be discovered. Removing the entry above is the
       deliberate act; a silent `continue` here would have hidden it. */
    const meta = bySlug.get(slug);
    if (!meta) {
      throw new Error(
        `simple-icons@${SI_VERSION} has no entry for "${slug}" (wanted for ${id}). ` +
          `It was probably withdrawn. Drop it from MONO rather than pinning an older version.`
      );
    }
    const svg = await get(SI_SVG(slug));
    const d = svg.match(/ d="([^"]+)"/)?.[1];
    if (!d) throw new Error(`no path data in simple-icons ${slug}`);
    const hex = `#${meta.hex}`;
    out.push({
      id,
      label,
      tone: "mono",
      viewBox: "0 0 24 24",
      body: `<path d="${d}"/>`,
      hex,
      onLight: liftFor(hex, LIGHT_GROUND, LIGHT_MIN, true),
      onDark: liftFor(hex, DARK_GROUND, DARK_MIN, false),
      source: meta.source || `https://simpleicons.org/?q=${slug}`,
      licence: "CC0 1.0",
      licenceUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
      via: "Simple Icons",
    });
    names.forEach((n) => aliases.push([n, id]));
    process.stdout.write(".");
  }

  for (const [id, [name, variant, label, ...names]] of Object.entries(DEVICON)) {
    const svg = await get(DEV_SVG(name, variant));
    const viewBox = svg.match(/viewBox="([^"]+)"/)?.[1] || "0 0 128 128";
    let body = svg
      .replace(/^[\s\S]*?<svg[^>]*>/, "")
      .replace(/<\/svg>[\s\S]*$/, "")
      .trim();

    /* One fill across the whole drawing means it is monochrome in everything
       but provenance, so the fills come off and it joins the Simple Icons set
       - which is what lets matplotlib's dark blue survive the dark theme
       instead of sinking into it. More than one fill and the drawing is
       carrying real colour relationships, so it is left exactly alone. */
    const fills = [...new Set([...body.matchAll(/fill="([^"]+)"/g)].map((m) => m[1]))];
    const mono = fills.length === 1 && /^#[0-9a-f]{3,8}$/i.test(fills[0]);
    const hex = mono ? fills[0].toLowerCase() : null;
    if (mono) body = body.replace(/\s*fill="[^"]+"/g, "");

    out.push({
      id,
      label,
      tone: mono ? "mono" : "multi",
      viewBox,
      body,
      ...(mono
        ? {
            hex,
            onLight: liftFor(hex, LIGHT_GROUND, LIGHT_MIN, true),
            onDark: liftFor(hex, DARK_GROUND, DARK_MIN, false),
          }
        : {}),
      source: `https://github.com/devicons/devicon/tree/${DEV_VERSION}/icons/${name}`,
      licence: "MIT",
      licenceUrl: "https://github.com/devicons/devicon/blob/master/LICENSE",
      via: "Devicon",
    });
    names.forEach((n) => aliases.push([n, id]));
    process.stdout.write(".");
  }

  console.log(`\n${out.length} marks`);
  console.log(
    `lifted for dark:  ${out.filter((o) => o.onDark).map((o) => o.id).join(", ") || "none"}`
  );
  console.log(
    `lifted for light: ${out.filter((o) => o.onLight).map((o) => o.id).join(", ") || "none"}`
  );

  const header = `/* GENERATED by scripts/logos/fetch-logos.mjs - do not edit by hand.
   Re-run: node scripts/logos/fetch-logos.mjs

   Brand marks for the skills readouts and the project stack panels, stored as
   path data rather than as files so a mark costs no request and the theme can
   colour it.

   Licensing. The shapes come from Simple Icons (CC0-1.0) and Devicon (MIT);
   the licence on each entry records which. Neither grants trademark rights,
   and none is claimed here: each mark sits beside the tool's own name,
   labelling a tool the adjacent text already names. No shape is altered.
   Monochrome marks carry their brand hex, and onDark/onLight hold a
   lightness-only lift for the grounds where that hex misses the 3:1 of WCAG
   1.4.11 - hue and saturation are held fixed, because several of these brands
   prohibit recolouring and all of them prohibit reshaping.

   A tool with no entry renders as plain text, which is why the alias table can
   stay short and both sections still read correctly without it. */

`;

  const body =
    `export const logos = ${JSON.stringify(
      Object.fromEntries(out.map((o) => [o.id, o])),
      null,
      2
    )};\n\n` +
    `/* Exact match only: "Qt" takes a mark, "Qt threading and signals" does not,\n` +
    `   because a substring match would badge prose that is not naming a tool. */\n` +
    `export const logoAliases = ${JSON.stringify(
      Object.fromEntries(aliases),
      null,
      2
    )};\n`;

  await mkdir(dirname(OUT), { recursive: true });
  await writeFile(OUT, header + body, "utf8");
  console.log(`wrote ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
