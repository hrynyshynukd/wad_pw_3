const artworks = [
  { file: "image_1.webp", title: "Soft Bloom", description: "Розмиті форми й теплі кольори створюють відчуття руху, світла та ніжності.", tags: ["Soft focus", "Pastel", "Floral mood"] },
  { file: "image_2.webp", title: "Quiet Petals", description: "Світла абстрактна композиція, у якій прозорі відтінки переплітаються з природними формами.", tags: ["Light", "Organic forms", "Dreamy"] },
  { file: "image_3.webp", title: "Petal Study", description: "М'які лінії та делікатні переходи кольору утворюють спокійний візуальний ритм.", tags: ["Abstract", "Motion", "Pastel"] },
  { file: "image_4.webp", title: "Blush in Motion", description: "Теплі персикові й рожеві тони нагадують фрагмент квітки, знятий крізь м'яке світло.", tags: ["Blush", "Texture", "Floral mood"] },
  { file: "image_5.webp", title: "Lavender Haze", description: "Пастельні фіолетові та молочні відтінки створюють майже невагому композицію.", tags: ["Lavender", "Dreamy", "Soft focus"] },
  { file: "image_6.webp", title: "Golden Hour", description: "Світло-жовті акценти та розмиті форми додають композиції тепла й глибини.", tags: ["Warm light", "Organic forms", "Abstract"] },
  { file: "image_7.webp", title: "Petal Drift", description: "Абстрактний квітковий мотив із плавними переходами та легким відчуттям руху.", tags: ["Floral mood", "Movement", "Pastel"] },
  { file: "image_8.webp", title: "Tender Shape", description: "М'які контури й тепла палітра перетворюють природну форму на візуальний етюд.", tags: ["Organic forms", "Warm tones", "Study"] },
  { file: "image_9.webp", title: "Almost a Dream", description: "Розфокусовані пелюстки, прозоре світло та ніжні відтінки на межі абстракції.", tags: ["Dreamy", "Soft focus", "Floral mood"] },
  { file: "image_10.webp", title: "Petals at Dawn", description: "Персикові й кремові відтінки створюють відчуття ранкового світла та легкості.", tags: ["Peach", "Light", "Abstract"] }
];

const gallery = document.querySelector("#gallery");
const sentinel = document.querySelector("#loading-sentinel");
const dialog = document.querySelector("#art-dialog");
const dialogImage = document.querySelector("#dialog-image");
const dialogTitle = document.querySelector("#dialog-title");
const dialogDescription = document.querySelector("#dialog-description");
const dialogTags = document.querySelector("#dialog-tags");
const dialogIndex = document.querySelector("#dialog-index");
const closeButton = document.querySelector("#dialog-close");
const status = document.querySelector("#gallery-status");

let nextArtworkIndex = 0;
let batchNumber = 0;
let lastFocusedCard = null;
const initialBatchSize = 10;
const nextBatchSize = 6;

function createArtworkCard(artwork, index) {
  const card = document.createElement("button");
  card.className = "art-card";
  card.type = "button";
  card.setAttribute("aria-label", `Відкрити роботу «${artwork.title}»`);

  const image = document.createElement("img");
  image.src = `images/${artwork.file}`;
  image.alt = `Абстрактна квіткова композиція — ${artwork.title}`;
  image.loading = index < 8 ? "eager" : "lazy";
  image.decoding = "async";
  image.draggable = false;

  const title = document.createElement("span");
  title.className = "art-card-title";
  title.textContent = artwork.title;

  card.append(image, title);
  card.addEventListener("click", () => openArtwork(artwork, index, card));
  return card;
}

function appendBatch(count) {
  const fragment = document.createDocumentFragment();

  for (let i = 0; i < count; i += 1) {
    const artworkIndex = nextArtworkIndex % artworks.length;
    const artwork = artworks[artworkIndex];
    const globalIndex = nextArtworkIndex;
    const card = createArtworkCard(artwork, globalIndex);
    card.style.animationDelay = `${Math.min(i * 35, 210)}ms`;
    fragment.appendChild(card);
    nextArtworkIndex += 1;
  }

  gallery.appendChild(fragment);
  batchNumber += 1;
  status.textContent = `Завантажено ${nextArtworkIndex} карток галереї.`;
}

function fitDialogToImage() {
  if (!dialogImage.naturalWidth || !dialogImage.naturalHeight) return;

  const ratio = dialogImage.naturalWidth / dialogImage.naturalHeight;
  const mobile = window.matchMedia("(max-width: 650px)").matches;
  const viewportHeight = Math.max(280, window.innerHeight - (mobile ? 32 : 80));
  const viewportWidth = Math.max(280, window.innerWidth - (mobile ? 20 : 80));

  if (mobile) {
    const imageWidth = viewportWidth;
    const imageHeight = Math.min(imageWidth / ratio, window.innerHeight * 0.58);
    dialog.style.setProperty("--dialog-width", `${viewportWidth}px`);
    dialog.style.setProperty("--dialog-height", `${Math.min(window.innerHeight - 20, imageHeight + 300)}px`);
    dialog.style.setProperty("--artwork-width", "minmax(0, 1fr)");
    dialog.style.setProperty("--mobile-artwork-height", `${imageHeight}px`);
  } else {
    const infoWidth = 370;
    const imageHeight = Math.min(790, viewportHeight, (viewportWidth - infoWidth) / ratio);
    const imageWidth = imageHeight * ratio;
    dialog.style.setProperty("--dialog-width", `${imageWidth + infoWidth}px`);
    dialog.style.setProperty("--dialog-height", `${imageHeight}px`);
    dialog.style.setProperty("--artwork-width", `${imageWidth}px`);
    dialog.style.setProperty("--mobile-artwork-height", "");
  }
}

function openArtwork(artwork, index, card) {
  lastFocusedCard = card;
  dialogImage.alt = `Зображення «${artwork.title}»`;
  dialogImage.onload = fitDialogToImage;
  dialogImage.src = `images/${artwork.file}`;
  dialog.classList.toggle("is-portrait", artwork.file === "image_1.webp" || artwork.file === "image_2.webp");
  dialogTitle.textContent = artwork.title;
  dialogDescription.textContent = artwork.description;
  dialogIndex.textContent = `ARTWORK ${String((index % artworks.length) + 1).padStart(2, "0")}  /  ${String(artworks.length).padStart(2, "0")}`;

  dialogTags.replaceChildren();
  artwork.tags.forEach((tagText) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = tagText;
    dialogTags.appendChild(tag);
  });

  if (typeof dialog.showModal === "function") {
    dialog.showModal();
    document.body.classList.add("dialog-open");
    closeButton.focus();
  }
}

function closeArtwork() {
  if (dialog.open) dialog.close();
}

window.addEventListener("resize", () => {
  if (dialog.open) fitDialogToImage();
});

closeButton.addEventListener("click", closeArtwork);

dialog.addEventListener("click", (event) => {
  // Clicking the backdrop closes the dialog; clicks inside the panel do not.
  if (event.target === dialog) closeArtwork();
});

dialog.addEventListener("close", () => {
  document.body.classList.remove("dialog-open");
  if (lastFocusedCard && document.contains(lastFocusedCard)) lastFocusedCard.focus();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && dialog.open) closeArtwork();
});

appendBatch(initialBatchSize);

const observer = new IntersectionObserver((entries) => {
  if (entries.some((entry) => entry.isIntersecting)) {
    appendBatch(nextBatchSize);
  }
}, {
  root: null,
  rootMargin: "650px 0px",
  threshold: 0
});

observer.observe(sentinel);
