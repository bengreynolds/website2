import { evidenceItems } from "../siteData";

export default function GallerySection() {
  return (
    <>
      <div className="section-heading reveal">
        <p className="eyebrow">Evidence</p>
        <h2>Selected work artifacts</h2>
        <p>Quick artifacts first, with the fuller archive one click away.</p>
      </div>

      <div className="gallery-archive reveal">
        {evidenceItems.slice(0, 3).map((item, index) => (
          <article key={item.title} className="gallery-archive-tile" style={{ "--delay": `${index * 0.08}s` }}>
            <span>Artifact {String(index + 1).padStart(2, "0")}</span>
            <strong>{item.title}</strong>
            <p>{item.proof}</p>
          </article>
        ))}
      </div>

      <details className="gallery-disclosure reveal">
        <summary className="gallery-disclosure-summary">
          <span className="eyebrow">Archive</span>
          <strong>Show the full evidence grid</strong>
          <span className="gallery-disclosure-cue">Open details</span>
        </summary>
        <div className="gallery-disclosure-body">
          <div className="evidence-grid">
            {evidenceItems.map((item, index) => (
              <article key={item.title} className="evidence-card reveal" style={{ "--delay": `${index * 0.08}s` }}>
                <p className="evidence-kicker">{item.proof}</p>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </details>
    </>
  );
}
