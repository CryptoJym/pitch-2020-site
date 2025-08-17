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

function setTocOpen(open) {
  const toc = document.getElementById("toc");
  const button = document.getElementById("tocToggle");
  toc.classList.toggle("open", open);
  button.setAttribute("aria-expanded", String(open));
}

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
  const tocContainer = document.getElementById("toc");
  const mqlMobile = window.matchMedia("(max-width: 960px)");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const toUnique = createUniqueSlugGenerator();
  const headings = Array.from(
    contentContainer.querySelectorAll("h1, h2, h3")
  );

  headings.forEach((heading) => {
    if (!heading.id) {
      const base = slugify(heading.textContent || "section");
      heading.id = toUnique(base);
    }
  });

  const toc = document.createElement("nav");
  const list = document.createElement("ul");

  headings.forEach((heading) => {
    const level = Number(heading.tagName.substring(1));
    const li = document.createElement("li");
    li.className = `level-${level}`;

    const a = document.createElement("a");
    a.href = `#${heading.id}`;
    a.textContent = heading.textContent || "Section";

    li.appendChild(a);
    list.appendChild(li);
  });

  const title = document.createElement("h3");
  title.textContent = "Contents";
  toc.appendChild(title);
  toc.appendChild(list);
  tocContainer.innerHTML = "";
  tocContainer.appendChild(toc);

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
      if (mqlMobile.matches) setTocOpen(false);
    });
  });

  tocContainer.addEventListener("click", (e) => {
    const anchor = e.target.closest('a[href^="#"]');
    if (!anchor) return;
    if (mqlMobile.matches) setTocOpen(false);
  });

  try {
    const tocLinksById = new Map(
      Array.from(toc.querySelectorAll("a")).map((a) => [a.getAttribute("href").slice(1), a])
    );
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const id = entry.target.id;
          const link = tocLinksById.get(id);
          if (!link) return;
          if (entry.isIntersecting) {
            toc.querySelectorAll("a.active").forEach((el) => el.classList.remove("active"));
            link.classList.add("active");
          }
        });
      },
      { rootMargin: "-40% 0px -55% 0px", threshold: [0, 1] }
    );
    headings.forEach((h) => observer.observe(h));
  } catch {}
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

function setupTocToggle() {
  const button = document.getElementById("tocToggle");
  const toc = document.getElementById("toc");
  const mqlMobile = window.matchMedia("(max-width: 960px)");
  button.addEventListener("click", () => {
    const isOpen = toc.classList.contains("open");
    setTocOpen(!isOpen);
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setTocOpen(false);
  });
  document.addEventListener("click", (e) => {
    if (!mqlMobile.matches) return;
    if (!toc.classList.contains("open")) return;
    const target = e.target;
    if (toc.contains(target)) return;
    if (button.contains(target)) return;
    setTocOpen(false);
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  setupProgressBar();
  setupTocToggle();
  await loadVerbatimContent();
});
