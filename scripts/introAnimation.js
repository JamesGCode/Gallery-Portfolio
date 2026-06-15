export function playIntro(slides, config) {
  return new Promise((resolve) => {
    const slider = document.querySelector(".slider");
    const hero = document.querySelector(".hero");

    const spacing = config.slideWidth + config.gap;

    const heroIndex = 0;

    const visualCenter = config.totalSlides / 2;

    hero.style.opacity = "0";
    hero.style.filter = "blur(20px)";
    hero.style.transform = "translateY(180px)";
    hero.style.willChange = "opacity, transform, filter";

    const centerX = slider.clientWidth * 0.5;

    const startY = slider.clientHeight * 0.5 - config.slideHeight * 0.5;

    const finalY = slider.clientHeight - config.slideHeight;

    slides.forEach((slide, i) => {
      slide.style.width = `${config.slideWidth}px`;

      slide.style.height = `${config.slideHeight}px`;

      slide.style.transformOrigin = "bottom center";

      slide.style.opacity = "0";

      slide.style.transform = `
        translate3d(
          ${centerX - config.slideWidth / 2}px,
          ${startY}px,
          0
        )
        scale(0, 0)
      `;

      slide.style.zIndex = 100 - Math.abs(i - heroIndex);
    });

    const startTime = performance.now();

    const durationGrow = 1200;
    const durationSpread = 1200;
    const durationDrop = 1500;

    const totalDuration = durationGrow + durationSpread + durationDrop;

    function easeOutExpo(t) {
      return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function clamp(v) {
      return Math.max(0, Math.min(1, v));
    }

    function animate(now) {
      const elapsed = now - startTime;

      const growProgress = clamp(elapsed / durationGrow);

      const spreadProgress = clamp((elapsed - durationGrow) / durationSpread);

      const dropProgress = clamp(
        (elapsed - durationGrow - durationSpread) / durationDrop,
      );

      const growEase = easeOutExpo(growProgress);

      const spreadEase = easeOutCubic(spreadProgress);

      const dropEase = easeOutCubic(dropProgress);

      for (let i = 0; i < config.totalSlides; i++) {
        const slide = slides[i];

        const visualIndex = (i - heroIndex + visualCenter) % config.totalSlides;

        const offset = (visualIndex - visualCenter) * spacing * spreadEase;

        const left = centerX - config.slideWidth / 2 + offset;

        const y = startY + (finalY - startY) * dropEase;

        const distance = Math.abs(offset / spacing);

        const progress = Math.min(distance / 2, 1);

        const eased = progress * progress;

        const targetScaleY = 1 - (1 - 0.75) * eased;

        const scaleY = 1 + (targetScaleY - 1) * dropEase;

        let opacity = 1;

        if (dropProgress > 0) {
          const targetOpacity = 1 - progress * 0.4;

          opacity = 1 + (targetOpacity - 1) * dropEase;
        }

        if (i === heroIndex) {
          opacity = 1;
        }

        if (spreadProgress > 0 || i === heroIndex) {
          slide.style.opacity = opacity;
        }

        slide.style.transform = `
          translate3d(
            ${left}px,
            ${y}px,
            0
          )
          scale(
            ${growEase},
            ${growEase * scaleY}
          )
        `;
      }

      // Aparición suave del hero
      if (dropProgress > 0.65) {
        const heroProgress = clamp((dropProgress - 0.65) / 0.35);

        const easedHero = easeOutCubic(heroProgress);

        hero.style.opacity = easedHero;

        hero.style.filter = `blur(${20 - easedHero * 20}px)`;

        hero.style.transform = `translateY(${180 - easedHero * 180}px)`;
      }

      if (elapsed < totalDuration) {
        requestAnimationFrame(animate);
      } else {
        hero.style.opacity = "1";
        hero.style.filter = "blur(0px)";
        hero.style.transform = "translateY(0px)";

        resolve();
      }
    }

    requestAnimationFrame(animate);
  });
}
