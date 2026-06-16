import { playIntro } from "./scripts/introAnimation.js";

const slider = document.querySelector(".slider");

const config = {
  totalSlides: 10,
  slideWidth: 400,
  slideHeight: 430,
  gap: 0,
  lerp: 0.085,
  dragSpeed: 1.2,
  maxWidthBoost: 180,
};

const spacing = config.slideWidth + config.gap;

const slides = [];
for (let i = 0; i < config.totalSlides; i++) {
  const slide = document.createElement("div");
  slide.className = "slide";
  const img = document.createElement("img");
  img.src = `assets/images/slide-img-${i + 1}.jpg`;
  slide.appendChild(img);
  slider.appendChild(slide);
  slides.push(slide);
  slide.style.width = `${config.slideWidth}px`;
  slide.style.height = `${config.slideHeight}px`;
}

let scroll = 0;
let scrollTarget = 0;

slider.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    scrollTarget += e.deltaY * 0.8;
  },
  { passive: false },
);

let touchX = 0;
slider.addEventListener("touchstart", (e) => {
  touchX = e.touches[0].clientX;
});
slider.addEventListener(
  "touchmove",
  (e) => {
    e.preventDefault();
    const currentX = e.touches[0].clientX;
    scrollTarget += (touchX - currentX) * 2;
    touchX = currentX;
  },
  { passive: false },
);

let pointerX = null;
slider.addEventListener("pointerdown", (e) => {
  pointerX = e.clientX;
  slider.setPointerCapture(e.pointerId);
});
slider.addEventListener("pointermove", (e) => {
  if (pointerX === null) return;
  scrollTarget += (pointerX - e.clientX) * config.dragSpeed;
  pointerX = e.clientX;
});
function releasePointer() {
  pointerX = null;
}
slider.addEventListener("pointerup", releasePointer);
slider.addEventListener("pointercancel", releasePointer);

function render() {
  scroll += (scrollTarget - scroll) * config.lerp;

  const viewportWidth = slider.clientWidth;
  const centerX = viewportWidth * 0.5;
  const trackWidth = config.totalSlides * spacing;
  const top = slider.clientHeight - config.slideHeight;

  for (let i = 0; i < config.totalSlides; i++) {
    let x = i * spacing - scroll;

    // Loop infinito
    x = ((x % trackWidth) + trackWidth) % trackWidth;
    if (x > trackWidth / 2) x -= trackWidth;

    const distanceToCenter = Math.abs(x);
    const maxDistance = spacing * 2;

    const progress = Math.min(distanceToCenter / maxDistance, 1);

    // Centro = altura completa
    // Lejanas = altura reducida
    const maxScale = 1;
    const minScale = 0.75;

    const eased = progress * progress;

    const scaleY = maxScale - (maxScale - minScale) * eased;

    const left = centerX + x - config.slideWidth / 2;

    slides[i].style.zIndex = Math.round((1 - progress) * 100);

    // Mantener ancho fijo y reducir solo altura
    slides[i].style.transformOrigin = "bottom center";

    slides[i].style.transform = `translate3d(${left}px, ${top}px, 0)
       scale(1, ${scaleY})`;

    // Un poco menos opacas las lejanas
    slides[i].style.opacity = 1 - progress * 0.4;
  }

  requestAnimationFrame(render);
}

(async () => {
  await playIntro(slides, config);
  render();
})();
