function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
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

  const headings = Array.from(
    contentContainer.querySelectorAll("h1, h2, h3")
  );

  headings.forEach((heading) => {
    if (!heading.id) heading.id = slugify(heading.textContent || "section");
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

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = (e.currentTarget).getAttribute("href");
      if (id) {
        const target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: "smooth", block: "start" });
          history.replaceState(null, "", id);
          target.focus({ preventScroll: true });
        }
      }
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

function setupTocToggle() {
  const button = document.getElementById("tocToggle");
  const toc = document.getElementById("toc");
  function setState(open) {
    toc.classList.toggle("open", open);
    button.setAttribute("aria-expanded", String(open));
  }
  button.addEventListener("click", () => {
    const isOpen = toc.classList.contains("open");
    setState(!isOpen);
  });
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setState(false);
  });
}

window.addEventListener("DOMContentLoaded", async () => {
  setupProgressBar();
  setupTocToggle();
  await loadVerbatimContent();
});
