import { useEffect, useState } from "react";
import { galleryItems } from "../siteData";

export default function GallerySection({ reducedMotion = false }) {
  const [galleryIndex, setGalleryIndex] = useState(0);

  useEffect(() => {
    if (reducedMotion || galleryItems.length <= 1) return undefined;

    const timer = window.setInterval(() => {
      setGalleryIndex((index) => (index + 1) % galleryItems.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [reducedMotion]);

  return (
    <>
      <div className="section-heading reveal">
        <p className="eyebrow">Visuals</p>
        <h2>Gallery</h2>
        <p>Abstract visual snapshots now, with room for real imagery later.</p>
      </div>

      <div className="gallery-layout">
        <article className="gallery-hero reveal" style={{ "--delay": "0.1s" }}>
          <div className={`gallery-graphic gallery-${galleryIndex + 1}`} aria-hidden="true" />
          <div className="gallery-copy">
            <span className="tag">Feature reel</span>
            <h3>{galleryItems[galleryIndex].title}</h3>
            <p>{galleryItems[galleryIndex].body}</p>
          </div>
        </article>

        <div className="gallery-grid">
          {galleryItems.map((item, index) => (
            <button
              key={item.title}
              type="button"
              className={`gallery-card reveal ${index === galleryIndex ? "is-active" : ""}`}
              style={{ "--delay": `${index * 0.1}s` }}
              onClick={() => setGalleryIndex(index)}
            >
              <div className={`gallery-thumb gallery-${index + 1}`} aria-hidden="true" />
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
