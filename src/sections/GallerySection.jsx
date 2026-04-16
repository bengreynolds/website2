export default function GallerySection() {
  return (
    <div className="gallery-layout">
      <div className="section-heading reveal">
        <p className="eyebrow">Visual archive</p>
        <h2>Space for 3D renders and motion studies</h2>
        <p>
          This section stays intentionally light so future renderings, animations, and build photos can carry real visual weight without adding more text clutter.
        </p>
      </div>

      <div className="gallery-hero reveal">
        <div className="gallery-graphic gallery-1" aria-hidden="true" />
        <div className="gallery-copy">
          <div className="gallery-card">
            <span className="gallery-card-kicker">Planned visual media</span>
            <h3>3D product views, motion clips, and physical prototypes</h3>
            <p>
              The goal here is to show what the systems look like in practice, not just describe them.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
