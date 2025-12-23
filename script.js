const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const revealEls = document.querySelectorAll(".reveal");
const statEls = document.querySelectorAll("[data-count]");
const header = document.querySelector(".site-header");
const progressBar = document.querySelector(".scroll-progress");
const navLinks = document.querySelectorAll("nav a");
const parallaxTargets = document.querySelectorAll(
  ".orb, .hero-card, .carousel-image, .home-card, .stat-card, .gallery-card, .info-card, .card, .feature, .timeline-item, .education-card, .specialty-card"
);
const carousels = document.querySelectorAll("[data-carousel]");
const panelStacks = document.querySelectorAll(".scroll-panel.panel-stack");

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let pointerX = 0;
let pointerY = 0;
let pointerFrame = null;
let activePanelStack = null;
const panelStackState = new Map();

const updatePointer = (event) => {
  const { clientX, clientY } = event;
  const width = window.innerWidth || 1;
  const height = window.innerHeight || 1;
  pointerX = (clientX / width - 0.5) * 2;
  pointerY = (clientY / height - 0.5) * 2;

  if (!pointerFrame) {
    pointerFrame = requestAnimationFrame(() => {
      updateScrollUI();
      pointerFrame = null;
    });
  }
};

if (!prefersReducedMotion) {
  window.addEventListener("pointermove", updatePointer, { passive: true });
}

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
      const drift = Math.sin(scrollTop / 480 + index) * 1.2;
      const tiltX = drift + pointerY * 1.4;
      const tiltY = -drift + pointerX * 1.6;
      el.style.setProperty("--parallax-offset", `${offset}px`);
      el.style.setProperty("--parallax-tilt", `${tiltX.toFixed(2)}deg`);
      el.style.setProperty("--parallax-tilt-y", `${tiltY.toFixed(2)}deg`);
      el.classList.add("parallax");
    });
  }
};

const updateActiveLink = () => {
  const currentPath = window.location.pathname.split("/").pop() || "index.html";
  const currentHash = window.location.hash || "";
  let hasHashMatch = false;

  navLinks.forEach((link) => {
    const href = link.getAttribute("href") || "";
    const [path, hash] = href.split("#");
    if (!path) return;
    const linkHash = hash ? `#${hash}` : "";
    if (path === currentPath && linkHash && linkHash === currentHash) {
      hasHashMatch = true;
    }
  });

  navLinks.forEach((link) => {
    const href = link.getAttribute("href") || "";
    const [path, hash] = href.split("#");
    if (!path) return;
    const linkHash = hash ? `#${hash}` : "";
    const matchesPath = path === currentPath;
    const matchesHash = linkHash && linkHash === currentHash;
    const isActive = hasHashMatch ? matchesPath && matchesHash : matchesPath;
    link.classList.toggle("is-active", isActive);
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

const setPanelStackIndex = (stack, index) => {
  const state = panelStackState.get(stack);
  if (!state) return;
  state.index = index;
  state.panels.forEach((panel, i) => {
    panel.classList.remove("is-active", "is-prev", "is-next");
    if (i === index) {
      panel.classList.add("is-active");
    } else if (i === index - 1) {
      panel.classList.add("is-prev");
    } else if (i === index + 1) {
      panel.classList.add("is-next");
    }
  });

  if (state.thumb) {
    const total = state.total > 1 ? state.total - 1 : 1;
    const progress = state.total > 1 ? index / total : 0.5;
    const min = 8;
    const max = 92;
    const top = min + (max - min) * progress;
    state.thumb.style.top = `${top}%`;
    state.thumb.style.setProperty("--progress", progress.toFixed(3));
  }
};

const initPanelStacks = () => {
  if (!panelStacks.length) return;
  panelStacks.forEach((stack) => {
    const panels = Array.from(stack.querySelectorAll(".panel-card"));
    if (!panels.length) return;
    const shell = document.createElement("div");
    shell.className = "panel-stack-shell";
    stack.parentNode.insertBefore(shell, stack);
    shell.appendChild(stack);

    const progress = document.createElement("div");
    progress.className = "panel-progress";
    progress.setAttribute("aria-hidden", "true");

    const label = document.createElement("div");
    label.className = "panel-progress-label";
    label.textContent = "Scroll";

    const track = document.createElement("div");
    track.className = "panel-progress-track";

    const thumb = document.createElement("div");
    thumb.className = "panel-progress-thumb";

    track.appendChild(thumb);
    progress.append(label, track);
    shell.appendChild(progress);

    panelStackState.set(stack, {
      panels,
      index: 0,
      lock: false,
      thumb,
      total: panels.length,
    });
    setPanelStackIndex(stack, 0);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          activePanelStack = entry.target;
        } else if (activePanelStack === entry.target && !entry.isIntersecting) {
          activePanelStack = null;
        }
      });
    },
    { threshold: [0.6] }
  );

  panelStacks.forEach((stack) => observer.observe(stack));
};

const handlePanelScroll = (event) => {
  if (prefersReducedMotion || !activePanelStack) return;
  const state = panelStackState.get(activePanelStack);
  if (!state) return;
  const rect = activePanelStack.getBoundingClientRect();
  const viewportCenter = window.innerHeight / 2;
  const center = rect.top + rect.height / 2;
  const centered = Math.abs(center - viewportCenter) <= window.innerHeight * 0.18;
  const headerHeight = header ? header.offsetHeight : 0;
  const fullyVisible = rect.top >= headerHeight && rect.bottom <= window.innerHeight;
  if (!centered || !fullyVisible) return;

  const delta = event.deltaY;
  if (Math.abs(delta) < 4) return;
  const direction = delta > 0 ? 1 : -1;
  const nextIndex = state.index + direction;
  if (nextIndex < 0 || nextIndex >= state.panels.length) {
    return;
  }

  event.preventDefault();
  if (state.lock) return;
  state.lock = true;
  setPanelStackIndex(activePanelStack, nextIndex);
  window.setTimeout(() => {
    state.lock = false;
  }, 180);
};

const initThreeBackground = () => {
  if (prefersReducedMotion || !window.THREE) return;
  const ambient = document.querySelector(".ambient");
  if (!ambient) return;

  const canvas = document.createElement("canvas");
  canvas.className = "ambient-canvas";
  ambient.prepend(canvas);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    55,
    window.innerWidth / window.innerHeight,
    0.1,
    500
  );
  camera.position.z = 80;

  const group = new THREE.Group();

  const pointsCount = 200;
  const positions = new Float32Array(pointsCount * 3);
  for (let i = 0; i < pointsCount; i += 1) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 140;
    positions[i3 + 1] = (Math.random() - 0.5) * 90;
    positions[i3 + 2] = (Math.random() - 0.5) * 120;
  }

  const pointsGeometry = new THREE.BufferGeometry();
  pointsGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const basePositions = positions.slice();
  const pointsPosition = pointsGeometry.attributes.position;
  const pointsMaterial = new THREE.PointsMaterial({
    color: new THREE.Color(0x9fb4b0),
    size: 0.9,
    transparent: true,
    opacity: 0.3,
    depthWrite: false,
  });
  const points = new THREE.Points(pointsGeometry, pointsMaterial);
  group.add(points);

  scene.add(group);

  const handleResize = () => {
    const width = window.innerWidth || 1;
    const height = window.innerHeight || 1;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  };

  window.addEventListener("resize", handleResize);

  const animate = () => {
    const time = performance.now() * 0.00018;
    group.rotation.y = time * 0.08 + pointerX * 0.08;
    group.rotation.x = time * 0.05 + pointerY * 0.06;
    for (let i = 0; i < pointsCount; i += 1) {
      const i3 = i * 3;
      const baseX = basePositions[i3];
      const baseY = basePositions[i3 + 1];
      positions[i3] = baseX + Math.sin(time * 1.4 + baseY * 0.02) * 1.1;
      positions[i3 + 1] = baseY + Math.cos(time * 1.2 + baseX * 0.02) * 0.9;
    }
    pointsPosition.needsUpdate = true;
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  };

  animate();
};

window.addEventListener("load", () => {
  onScroll();
  if (!prefersReducedMotion) {
    document.body.classList.add("motion-ready");
  }
  initCarousels();
  initPanelStacks();
  initThreeBackground();
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

window.addEventListener("wheel", handlePanelScroll, { passive: false });
