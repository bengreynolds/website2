/* The five things src/tileGL.js uses out of ogl, imported from their own
   modules rather than from the package index.

   Not a style preference. "ogl" resolves to src/index.js, which re-exports
   about sixty classes - Orbit, GPGPU, Shadow, the whole loader set, every
   extra geometry. The package declares sideEffects: false so Rollup does drop
   the unreachable ones, but the chunk still measured 39.38kB gzipped against
   14.09kB for this file, because the index drags in transitive dependencies
   that nothing here touches.

   This file exists so the dynamic import in tileGL.js has one specifier to
   point at and the deep paths are written once. */

export { Renderer } from "ogl/src/core/Renderer.js";
export { Program } from "ogl/src/core/Program.js";
export { Mesh } from "ogl/src/core/Mesh.js";
export { Texture } from "ogl/src/core/Texture.js";
export { Triangle } from "ogl/src/extras/Triangle.js";
