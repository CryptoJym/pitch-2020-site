function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function createUniqueSlugGenerator() {
  const slugCounts = new Map();
  return function nextUniqueSlug(base) {
    const prev = slugCounts.get(base) || 0;
    const next = prev + 1;
    slugCounts.set(base, next);
    return next === 1 ? base : `${base}-${next}`;
  };
}

// TOC functionality removed

async function loadVerbatimContent() {
  const contentContainer = document.getElementById("content");
  const brandTitle = document.getElementById("brandTitle");

  const response = await fetch("/content/content.html", { cache: "no-store" });
  const raw = await response.text();

  const parser = new DOMParser();
  const doc = parser.parseFromString(raw, "text/html");

  const body = doc.body || doc.querySelector("body");
  const tempContainer = document.createElement("div");
  tempContainer.innerHTML = body ? body.innerHTML : raw;

  tempContainer.querySelectorAll("script").forEach((el) => el.remove());

  contentContainer.innerHTML = tempContainer.innerHTML;

  const firstHeading = contentContainer.querySelector("h1, h2, h3");
  if (firstHeading) {
    const titleText = firstHeading.textContent?.trim() || "2020 Master Pitch";
    document.title = titleText;
    brandTitle.textContent = titleText;
  }

  enhanceDocument();
}

function enhanceDocument() {
  const contentContainer = document.getElementById("content");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const toUnique = createUniqueSlugGenerator();
  const headings = Array.from(
    contentContainer.querySelectorAll("h1, h2, h3")
  );

  // Add IDs to headings for anchor links
  headings.forEach((heading) => {
    if (!heading.id) {
      const base = slugify(heading.textContent || "section");
      heading.id = toUnique(base);
    }
  });

  // Smooth scrolling for anchor links
  const smoothBehavior = prefersReducedMotion ? "auto" : "smooth";
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = e.currentTarget.getAttribute("href");
      if (!id) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: smoothBehavior, block: "start" });
      history.replaceState(null, "", id);
      target.focus({ preventScroll: true });
    });
  });
}

function setupProgressBar() {
  const bar = document.getElementById("progressBar");
  function update() {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const height =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    const progress = Math.max(0, Math.min(1, height ? scrollTop / height : 0));
    bar.style.width = `${progress * 100}%`;
  }
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
}

// TOC toggle removed

window.addEventListener("DOMContentLoaded", async () => {
  setupProgressBar();
  await loadVerbatimContent();
});
