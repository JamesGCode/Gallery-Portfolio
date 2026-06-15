// const slider = document.querySelector(".slider");

// const config = {
//   totalSlides: 10,
//   slideWidth: 450,
//   slideHeight: 480,
//   spacing: 350,
//   minScale: 0.55,
//   lerp: 0.085,
//   dragSpeed: 1.2,
// };

// const slides = [];

// for (let i = 0; i < config.totalSlides; i++) {
//   const slide = document.createElement("div");
//   slide.className = "slide";

//   const img = document.createElement("img");
//   img.src = `assets/images/slide-img-${i + 1}.jpg`;

//   slide.appendChild(img);
//   slider.appendChild(slide);

//   slides.push(slide);

//   slide.style.width = `${config.slideWidth}px`;
//   slide.style.height = `${config.slideHeight}px`;
// }

// let scroll = 0;
// let scrollTarget = 0;

// slider.addEventListener(
//   "wheel",
//   (e) => {
//     e.preventDefault();
//     scrollTarget += e.deltaY * 0.8;
//   },
//   { passive: false },
// );

// let touchX = 0;

// slider.addEventListener("touchstart", (e) => {
//   touchX = e.touches[0].clientX;
// });

// slider.addEventListener(
//   "touchmove",
//   (e) => {
//     e.preventDefault();

//     const currentX = e.touches[0].clientX;

//     scrollTarget += (touchX - currentX) * 2;

//     touchX = currentX;
//   },
//   { passive: false },
// );

// let pointerX = null;

// slider.addEventListener("pointerdown", (e) => {
//   pointerX = e.clientX;

//   slider.setPointerCapture(e.pointerId);
// });

// slider.addEventListener("pointermove", (e) => {
//   if (pointerX === null) return;

//   scrollTarget += (pointerX - e.clientX) * config.dragSpeed;

//   pointerX = e.clientX;
// });

// function releasePointer() {
//   pointerX = null;
// }

// slider.addEventListener("pointerup", releasePointer);
// slider.addEventListener("pointercancel", releasePointer);

// function getScale(distance) {
//   const d = Math.min(Math.abs(distance), 1);

//   return config.minScale + (1 - d) * (1 - config.minScale);
// }

// function render() {
//   scroll += (scrollTarget - scroll) * config.lerp;

//   const viewportWidth = slider.clientWidth;
//   const centerX = viewportWidth * 0.5;

//   const trackWidth = config.totalSlides * config.spacing;

//   const items = [];

//   for (let i = 0; i < config.totalSlides; i++) {
//     let x = i * config.spacing - scroll;

//     x = ((x % trackWidth) + trackWidth) % trackWidth;

//     if (x > trackWidth / 2) {
//       x -= trackWidth;
//     }

//     const normalized = x / (viewportWidth * 0.5);

//     const scale = getScale(normalized);

//     items.push({
//       slide: slides[i],
//       x,
//       scale,
//     });
//   }

//   items
//     .sort((a, b) => a.scale - b.scale)
//     .forEach((item) => {
//       const left =
//         centerX +
//         item.x -
//         config.slideWidth / 2;

//       const top =
//         slider.clientHeight -
//         config.slideHeight;

//       item.slide.style.zIndex = Math.round(
//         item.scale * 1000,
//       );

//       item.slide.style.transform =
//         `translate3d(${left}px, ${top}px, 0) scale(${item.scale})`;
//     });

//   requestAnimationFrame(render);
// }

// render();

const slider = document.querySelector(".slider");

const config = {
  totalSlides: 10,
  slideWidth: 400,
  slideHeight: 400,
  gap: 0,           // espacio entre slides
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

slider.addEventListener("wheel", (e) => {
  e.preventDefault();
  scrollTarget += e.deltaY * 0.8;
}, { passive: false });

let touchX = 0;
slider.addEventListener("touchstart", (e) => { touchX = e.touches[0].clientX; });
slider.addEventListener("touchmove", (e) => {
  e.preventDefault();
  const currentX = e.touches[0].clientX;
  scrollTarget += (touchX - currentX) * 2;
  touchX = currentX;
}, { passive: false });

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
function releasePointer() { pointerX = null; }
slider.addEventListener("pointerup", releasePointer);
slider.addEventListener("pointercancel", releasePointer);

function render() {
  scroll += (scrollTarget - scroll) * config.lerp;

  const viewportWidth = slider.clientWidth;
  const centerX = viewportWidth * 0.5;
  const trackWidth = config.totalSlides * spacing;

  // Posición vertical centrada
  const top = (slider.clientHeight - config.slideHeight);

  for (let i = 0; i < config.totalSlides; i++) {
    let x = i * spacing - scroll;

    // Loop infinito
    x = ((x % trackWidth) + trackWidth) % trackWidth;
    if (x > trackWidth / 2) x -= trackWidth;

    const left = centerX + x - config.slideWidth / 2;

    slides[i].style.zIndex = 1;
    slides[i].style.transform = `translate3d(${left}px, ${top}px, 0)`;
  }

  requestAnimationFrame(render);
}

render();