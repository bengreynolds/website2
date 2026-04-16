import { evidenceItems } from "../siteData";

export default function GallerySection() {
  return (
    <>
      <div className="section-heading reveal">
        <p className="eyebrow">Evidence</p>
        <h2>Selected work artifacts</h2>
        <p>
          These are the systems, workflows, and outputs that make the work concrete. If you want screenshots, rig photos, or notebooks later, this section can grow into a visual archive.
        </p>
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

      <div className="evidence-grid">
        {evidenceItems.map((item, index) => (
          <article key={item.title} className="evidence-card reveal" style={{ "--delay": `${index * 0.08}s` }}>
            <p className="evidence-kicker">{item.proof}</p>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    </>
  );
}
