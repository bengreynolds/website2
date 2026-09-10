/* Attribution for the skills section's imagery, one entry per sourced image.
   A skill absent from this array has no image and renders a labelled
   placeholder instead, which is why the array can be empty and the section
   still ships.

   Every entry below was verified against its source page on Wikimedia
   Commons: the licence template, the author field and the licence URL were
   each read from the file's own description page, and both `licenceUrl` and
   `source` were fetched and returned 200. Only genuinely free licences are
   here - CC0, CC BY, CC BY-SA. Nothing is fair use, nothing is pending
   Commons licence review, and nothing carries a non-commercial or
   no-derivatives term.

   Where no topical image with a verifiable free licence could be found, the
   slot was left empty rather than filled with something unlicensed or only
   vaguely related, so a missing skill is a deliberate gap and not an
   oversight.

   Images are WebP, 1600px on the long edge. The `author` and `licence` of a
   CC BY or CC BY-SA entry have to stay visible wherever its image is shown.

     { slug, file, title, author, licence, licenceUrl, source, alt }
*/
export const skillCredits = [
  {
    slug: "01-software",
    file: "/skills/01-software.webp",
    title: "Skeleton programming code",
    author: "Monky2020",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    source: "https://commons.wikimedia.org/wiki/File:Skeleton_programming_code.jpg",
    alt: "Source code on a computer screen, photographed at an angle.",
  },
  {
    slug: "02-automation",
    file: "/skills/02-automation.webp",
    title: "UR16e robot arm",
    author: "Auledas",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    source: "https://commons.wikimedia.org/wiki/File:UR16e_robot_arm.png",
    alt: "A collaborative robot arm on a workbench, with its controller and teach pendant beside it.",
  },
  {
    slug: "03-cad",
    file: "/skills/03-cad.webp",
    title: "FreeCAD 1.0 Light PartDesign Pozidriv",
    author: "Maxwxyz",
    licence: "CC BY 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by/4.0/",
    source: "https://commons.wikimedia.org/wiki/File:FreeCAD_1.0_Light_PartDesign_Pozidriv.png",
    alt: "A CAD application showing a solid model of a screwdriver bit in its part-design workbench.",
  },
  {
    slug: "04-electronics",
    file: "/skills/04-electronics.webp",
    title: "MDT AKS-1216.03 circuit board",
    author: "Phiarc",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    source: "https://commons.wikimedia.org/wiki/File:MDT_AKS-1216.03_circuit_board.jpg",
    alt: "A populated circuit board carrying relays, screw terminals and surface-mount ICs.",
  },
  {
    slug: "05-acquisition",
    file: "/skills/05-acquisition.webp",
    title: "Esselte oscilloscope",
    author: "Unnerving duck",
    licence: "CC0 1.0",
    licenceUrl: "https://creativecommons.org/publicdomain/zero/1.0/deed.en",
    source: "https://commons.wikimedia.org/wiki/File:Esselte_oscilloscope.jpg",
    alt: "An analogue oscilloscope displaying a waveform on its screen.",
  },
  {
    slug: "06-ml-vision",
    file: "/skills/06-ml-vision.webp",
    title: "Banana Plant Flask by Max Gruber",
    author: "Max Gruber / Better Images of AI",
    licence: "CC BY 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by/4.0/",
    source: "https://commons.wikimedia.org/wiki/File:Banana_Plant_Flask_by_Max_Gruber.jpg",
    alt: "A banana, a plant and a flask, each inside a labelled frame in the manner of an object detector.",
  },
  {
    slug: "07-statistics",
    file: "/skills/07-statistics.webp",
    title: "Sina plot ver1",
    author: "Mike Shelk",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    source: "https://commons.wikimedia.org/wiki/File:Sina_plot_ver1.png",
    alt: "A violin plot beside a sina plot of the same sample.",
  },
  {
    slug: "08-deployment",
    file: "/skills/08-deployment.webp",
    title: "Corridors b",
    author: "Damakamis",
    licence: "CC BY-SA 4.0",
    licenceUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    source: "https://commons.wikimedia.org/wiki/File:Corridors_b.jpg",
    alt: "An aisle of server cabinets in a data centre.",
  },
];
