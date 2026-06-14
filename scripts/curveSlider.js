const slider = document.querySelector(".slider");

const config = {
  totalSlides: 10,
  lerp: 0.075,
  scrollSpeed: 3.5,
  minSize: 0.1,
  growth: 0.25,
  aspect: 1 / 1.25,
  baseline: 0.0,
};

const growthRatio = Math.exp(config.growth);
const invGrowthM1 = 1 / (growthRatio - 1);

const halfCount =
  Math.ceil(Math.log(1 + (growthRatio - 1) / config.minSize) / config.growth) +
  4;
const slideCount = halfCount * 2 + 1;

const lerp = (start, end, t) => start + (end - start) * t;
const wrap = (value, max) => ((value % max) + max) % max;

/**
 * Devuelve la distancia acumulada desde el centro hasta el borde izquierdo
 * del slide en `position`. Posiciones positivas van a la derecha del centro,
 * negativas a la izquierda.
 *
 * La clave: usamos Math.abs(position) para que el crecimiento sea simétrico,
 * y multiplicamos por el signo para ubicar el lado correcto.
 */
const distFromCenter = (position, width) =>
  width *
  config.minSize *
  (Math.pow(growthRatio, Math.abs(position)) - 1) *
  invGrowthM1;

/**
 * Coordenada X del borde izquierdo del slide en `position`.
 * - position = 0  → borde izquierdo del slide central (en el centro de la pantalla)
 * - position > 0  → slides a la derecha del centro
 * - position < 0  → slides a la izquierda del centro
 */
const edgeX = (position, width) => {
  const center = width / 2;
  if (position >= 0) {
    // Borde izquierdo del slide que arranca en el centro o más a la derecha
    return center + distFromCenter(position, width);
  } else {
    // Borde izquierdo de slides a la izquierda:
    // restamos el ancho acumulado hasta position+1 (borde derecho del slide)
    return center - distFromCenter(-position, width);
  }
};

// Creación de slides

const slides = [];
const slideStreamIndex = [];

for (let i = 0; i < slideCount; i++) {
  const slide = document.createElement("div");
  slide.className = "slide";
  slide.appendChild(document.createElement("img"));
  slider.appendChild(slide);
  slides.push(slide);
  // Distribuimos los índices iniciales simétricamente alrededor del 0
  slideStreamIndex.push(i - halfCount);
}

function setSlideImage(slide, imageNumber) {
  if (slide.dataset.image === String(imageNumber)) return;
  slide.dataset.image = imageNumber;
  slide.querySelector("img").src = `assets/images/slide-img-${imageNumber}.jpg`;
}

// Input / scroll
let scroll = 0;
let scrollTarget = 0;

slider.addEventListener(
  "wheel",
  (e) => {
    e.preventDefault();
    scrollTarget += (e.deltaY + e.deltaX) * config.scrollSpeed * 0.0014;
  },
  { passive: false },
);

let lastTouchX = null;

slider.addEventListener("touchstart", (e) => {
  lastTouchX = e.touches[0].clientX;
});

slider.addEventListener(
  "touchmove",
  (e) => {
    if (lastTouchX === null) return;
    const x = e.touches[0].clientX;
    scrollTarget += (lastTouchX - x) * config.scrollSpeed * 0.004;
    lastTouchX = x;
  },
  { passive: false },
);

slider.addEventListener("touchend", () => {
  lastTouchX = null;
});

let lastPointerX = null;

slider.addEventListener("pointerdown", (e) => {
  lastPointerX = e.clientX;
  slider.setPointerCapture(e.pointerId);
});

slider.addEventListener("pointermove", (e) => {
  if (lastPointerX === null) return;
  scrollTarget += (lastPointerX - e.clientX) * config.scrollSpeed * -0.005;
  lastPointerX = e.clientX;
});

const releasePointer = () => {
  lastPointerX = null;
};
slider.addEventListener("pointerup", releasePointer);
slider.addEventListener("pointercancel", releasePointer);

// Render
function render() {
  scroll = lerp(scroll, scrollTarget, config.lerp);

  const sliderWidth = slider.clientWidth;
  const sliderHeight = slider.clientHeight;
  const baselineOffset = sliderHeight * config.baseline;

  for (let i = 0; i < slideCount; i++) {
    const slide = slides[i];
    let streamIndex = slideStreamIndex[i];

    // Reubica el slide si salió del área visible.
    // edgeX(streamIndex + scroll)     → borde izquierdo del slide
    // edgeX(streamIndex + scroll + 1) → borde derecho del slide
    // (+1 en el índice da el siguiente borde del stream exponencial)
    while (edgeX(streamIndex + scroll, sliderWidth) > sliderWidth)
      streamIndex -= slideCount;
    while (edgeX(streamIndex + scroll + 1, sliderWidth) < 0)
      streamIndex += slideCount;

    slideStreamIndex[i] = streamIndex;

    const left = Math.round(edgeX(streamIndex + scroll, sliderWidth));
    const right = Math.round(edgeX(streamIndex + scroll + 1, sliderWidth));
    const width = right - left;
    const height = width / config.aspect;

    setSlideImage(slide, wrap(streamIndex, config.totalSlides) + 1);

    slide.style.width = `${width}px`;
    slide.style.height = `${height}px`;
    // zIndex mayor = más cercano al centro (slide más grande encima)
    slide.style.zIndex = String(width);
    slide.style.transform = `translate(${left}px, ${-baselineOffset}px)`;
  }

  requestAnimationFrame(render);
}

render();
