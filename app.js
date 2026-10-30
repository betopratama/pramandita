import { selectedWork, microstockWork } from "./data.js";

const workList = document.querySelector("[data-work-list]");
const preview = document.querySelector("[data-work-preview]");
let activeIndex = 0;
let activePlayer = null;

const youtubePoster = (id) => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
const youtubeEmbed = (item) => `<iframe class="clean-youtube-frame" src="https://www.youtube-nocookie.com/embed/${item.id}?autoplay=1&controls=0&rel=0&modestbranding=1&iv_load_policy=3&disablekb=1&fs=0&playsinline=1&origin=${encodeURIComponent(location.origin)}" title="${item.title}" tabindex="-1" allow="autoplay; encrypted-media" referrerpolicy="strict-origin-when-cross-origin" aria-hidden="true"></iframe><span class="player-mask player-mask-top" aria-hidden="true"></span><span class="player-mask player-mask-bottom" aria-hidden="true"></span>`;
const mobilePoster = (item) => `<img src="${youtubePoster(item.id)}" alt="" width="480" height="360" loading="lazy"><span class="play-button" aria-hidden="true"></span>`;

function previewMarkup(item, playing = false) {
  const media = playing
    ? `${youtubeEmbed(item)}<button class="close-player" type="button" aria-label="Close video">Close</button>`
    : `<img src="${youtubePoster(item.id)}" alt="Video poster for ${item.title}" width="1280" height="720"><button class="play-button" type="button" aria-label="Play ${item.title}"></button>`;

  return `<div class="preview-media">${media}</div><div class="preview-copy"><h3>${item.title}</h3><p>${item.description}</p></div>`;
}

function setPreview(index, play = false) {
  activeIndex = index;
  activePlayer = play ? index : null;
  document.querySelectorAll(".work-item").forEach((button, buttonIndex) => {
    button.classList.toggle("is-active", buttonIndex === index);
    button.setAttribute("aria-pressed", String(buttonIndex === index));
  });
  preview.innerHTML = previewMarkup(selectedWork[index], play);
  if (play) preview.querySelector(".close-player")?.focus();
}

selectedWork.forEach((item, index) => {
  const button = document.createElement("button");
  button.type = "button";
  button.className = "work-item reveal";
  button.setAttribute("aria-pressed", "false");
  button.setAttribute("aria-label", `${item.title}. ${item.type}. Play video.`);
  button.innerHTML = `<span class="mobile-work-media">${mobilePoster(item)}</span><span class="work-item-title">${item.displayTitle}</span><span class="work-item-type">${item.type}</span>`;
  button.addEventListener("mouseenter", () => { if (activePlayer === null) setPreview(index); });
  button.addEventListener("focus", () => { if (activePlayer === null) setPreview(index); });
  button.addEventListener("click", () => {
    if (window.matchMedia("(max-width: 980px)").matches) {
      const media = button.querySelector(".mobile-work-media");
      if (activePlayer === index && media.querySelector("iframe")) {
        media.innerHTML = mobilePoster(item);
        activePlayer = null;
        return;
      }
      document.querySelectorAll(".work-item").forEach((otherButton, otherIndex) => {
        otherButton.querySelector(".mobile-work-media").innerHTML = mobilePoster(selectedWork[otherIndex]);
      });
      activePlayer = index;
      media.innerHTML = `${youtubeEmbed(item)}<span class="mobile-close-label" aria-hidden="true">Close</span>`;
    } else {
      setPreview(index, true);
    }
  });
  workList.append(button);
});

preview.addEventListener("click", (event) => {
  if (event.target.closest(".play-button")) setPreview(activeIndex, true);
  if (event.target.closest(".close-player")) setPreview(activeIndex, false);
});
setPreview(0);

const microstockGrid = document.querySelector("[data-microstock-grid]");
const stockVideoUrl = (asset) => `https://previews.customer.envatousercontent.com/${asset}/watermarked_preview/watermarked_preview.mp4`;
microstockWork.forEach((item) => {
  const article = document.createElement("article");
  article.className = `stock-card tone-${item.tone}`;
  article.dataset.category = item.category;
  const posterTitle = item.title.split(/\s+/).slice(0, 2).join(" ");
  const media = item.asset
    ? `<div class="stock-media"><video class="stock-video" data-src="${stockVideoUrl(item.asset)}" muted loop playsinline preload="none" aria-label="Video preview for ${item.title}"></video><span class="stock-loading">Loading preview</span></div>`
    : `<div class="stock-poster" role="img" aria-label="Preview pending for ${item.title}"><span class="stock-mark">${posterTitle}</span><span class="stock-unavailable">Preview processing</span></div>`;
  article.innerHTML = `${media}<div class="stock-meta"><h3>${item.title}</h3></div>`;
  microstockGrid.append(article);
});

const stockVideoObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    const video = entry.target;
    if (entry.isIntersecting) {
      if (!video.src) video.src = video.dataset.src;
      video.play().catch(() => {});
    } else {
      video.pause();
    }
  });
}, { rootMargin: "180px 0px", threshold: 0.18 });
document.querySelectorAll(".stock-video").forEach((video) => {
  video.addEventListener("playing", () => video.closest(".stock-media")?.classList.add("is-playing"), { once: true });
  video.addEventListener("error", () => video.closest(".stock-media")?.classList.add("has-error"));
  stockVideoObserver.observe(video);
});

document.querySelectorAll("[data-filter]").forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.filter;
    document.querySelectorAll("[data-filter]").forEach((item) => {
      const active = item === button;
      item.classList.toggle("is-active", active);
      item.setAttribute("aria-pressed", String(active));
    });
    document.querySelectorAll(".stock-card").forEach((card) => {
      card.hidden = filter !== "all" && card.dataset.category !== filter;
    });
  });
});

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-visible");
    observer.unobserve(entry.target);
  });
}, { threshold: 0.08, rootMargin: "0px 0px -8%" });
document.querySelectorAll(".reveal").forEach((element) => revealObserver.observe(element));

const sections = [...document.querySelectorAll("main section[id]")];
const navLinks = [...document.querySelectorAll("#site-nav a")];
const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    navLinks.forEach((link) => link.toggleAttribute("aria-current", link.getAttribute("href") === `#${entry.target.id}`));
  });
}, { rootMargin: "-40% 0px -50%" });
sections.forEach((section) => sectionObserver.observe(section));

const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector("#site-nav");
menuButton.addEventListener("click", () => {
  const open = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!open));
  nav.classList.toggle("is-open", !open);
});
nav.addEventListener("click", (event) => {
  if (!event.target.matches("a")) return;
  nav.classList.remove("is-open");
  menuButton.setAttribute("aria-expanded", "false");
});

if (window.matchMedia("(prefers-reduced-motion: no-preference)").matches) {
  const portrait = document.querySelector("[data-parallax] img");
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const progress = Math.min(window.scrollY / window.innerHeight, 1);
      portrait.style.transform = `scale(${1.04 + progress * 0.035}) translateY(${progress * 1.5}%)`;
      ticking = false;
    });
  }, { passive: true });
}
