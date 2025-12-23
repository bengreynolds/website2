const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const revealEls = document.querySelectorAll(".reveal");
const statEls = document.querySelectorAll("[data-count]");
const header = document.querySelector(".site-header");
const progressBar = document.querySelector(".scroll-progress");
const navLinks = document.querySelectorAll("nav a");
const parallaxTargets = document.querySelectorAll(".orb, .hero-card, .carousel-image");
const carousels = document.querySelectorAll("[data-carousel]");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const activateReveal = (entries, obs) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      obs.unobserve(entry.target);
    }
  });
};

const activateCount = (entries, obs) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.dataset.count || 0);
    const duration = 1200;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const value = Math.floor(progress * target);
      el.textContent = value.toString();
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
    obs.unobserve(el);
  });
};

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(activateReveal, {
    threshold: 0.2,
  });
  revealEls.forEach((el) => revealObserver.observe(el));

  const countObserver = new IntersectionObserver(activateCount, {
    threshold: 0.5,
  });
  statEls.forEach((el) => countObserver.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add("is-visible"));
  statEls.forEach((el) => (el.textContent = el.dataset.count || "0"));
}

const updateScrollUI = () => {
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const height = document.documentElement.scrollHeight - window.innerHeight;
  const progress = height ? Math.min(scrollTop / height, 1) : 0;
  if (progressBar) {
    progressBar.style.width = `${progress * 100}%`;
  }
  if (header) {
    header.classList.toggle("is-scrolled", scrollTop > 40);
  }

  if (!prefersReducedMotion) {
    parallaxTargets.forEach((el, index) => {
      const offset = (scrollTop * 0.05 * (index + 1)) / 5;
      el.style.setProperty("--parallax-offset", `${offset}px`);
      el.classList.add("parallax");
    });
  }
};

const updateActiveLink = () => {
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  navLinks.forEach((link) => {
    const href = link.getAttribute("href") || "";
    const normalized = href.split("#")[0];
    if (!normalized) return;
    link.classList.toggle("is-active", normalized === currentPath);
  });
};

const onScroll = () => {
  updateScrollUI();
  updateActiveLink();
};

window.addEventListener("scroll", onScroll, { passive: true });
const initCarousels = () => {
  if (prefersReducedMotion) return;
  carousels.forEach((carousel) => {
    const items = carousel.querySelectorAll(".carousel-item");
    if (items.length <= 1) return;
    let index = 0;
    items[index].classList.add("is-active");
    setInterval(() => {
      items[index].classList.remove("is-active");
      index = (index + 1) % items.length;
      items[index].classList.add("is-active");
    }, 4200);
  });
};

window.addEventListener("load", () => {
  onScroll();
  if (!prefersReducedMotion) {
    document.body.classList.add("motion-ready");
  }
  initCarousels();
});

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const targetId = link.getAttribute("href");
    if (!targetId || !targetId.startsWith("#")) return;
    const target = document.querySelector(targetId);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});
