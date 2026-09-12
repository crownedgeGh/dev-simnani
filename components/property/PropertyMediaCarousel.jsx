"use client";

import { useMemo, useState, useRef } from "react";
import Image from "next/image";
import { MdChevronLeft, MdChevronRight, MdPlayCircle } from "react-icons/md";

export default function PropertyMediaCarousel({ image, galleryImages, video, title, badge }) {
  const slides = useMemo(() => {
    const images = [image, ...(galleryImages || [])].filter(Boolean);
    const uniqueImages = [...new Set(images)].map((src) => ({ type: "image", src }));
    const videoSlide = video ? [{ type: "video", src: video }] : [];
    return [...uniqueImages, ...videoSlide];
  }, [image, galleryImages, video]);

  const [index, setIndex] = useState(0);
  const touchStartX = useRef(null);

  const hasMultiple = slides.length > 1;
  const active = slides[index] || slides[0];

  function goTo(next) {
    setIndex((next + slides.length) % slides.length);
  }

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e) {
    if (touchStartX.current === null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) {
      goTo(index + (delta < 0 ? 1 : -1));
    }
    touchStartX.current = null;
  }

  if (!active) return null;

  return (
    <div className="w-full">
      <div
        className="relative aspect-[4/3] w-full overflow-hidden border border-navy-700/60 bg-navy-900 sm:aspect-[16/10] lg:aspect-[16/9]"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {active.type === "video" ? (
          <video
            key={active.src}
            src={active.src}
            controls
            playsInline
            className="h-full w-full object-contain bg-navy-950"
          />
        ) : (
          <>
            <Image
              key={`${active.src}-bg`}
              src={active.src}
              alt=""
              aria-hidden="true"
              fill
              sizes="100vw"
              className="scale-110 object-cover opacity-60 blur-2xl"
            />
            <Image
              key={active.src}
              src={active.src}
              alt={title}
              fill
              sizes="100vw"
              priority={index === 0}
              className="relative object-contain"
            />
          </>
        )}

        {badge && (
          <span className="tracked-label absolute left-4 top-4 z-10 bg-gold-500 px-3 py-1.5 text-[10px] font-semibold text-navy-950">
            {badge}
          </span>
        )}

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Previous media"
              className="absolute left-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-navy-950/70 text-cream transition hover:bg-navy-950 hover:text-gold-400 sm:left-4"
            >
              <MdChevronLeft size={26} />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Next media"
              className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center bg-navy-950/70 text-cream transition hover:bg-navy-950 hover:text-gold-400 sm:right-4"
            >
              <MdChevronRight size={26} />
            </button>

            <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 sm:hidden">
              {slides.map((slide, i) => (
                <span
                  key={`${slide.type}-${slide.src}`}
                  className={`h-1.5 w-1.5 rounded-full transition ${
                    i === index ? "bg-gold-400" : "bg-cream/40"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {hasMultiple && (
        <div className="mt-3 hidden grid-cols-6 gap-2 sm:grid lg:grid-cols-8">
          {slides.map((slide, i) => (
            <button
              key={`${slide.type}-${slide.src}`}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Show media ${i + 1}`}
              className={`relative aspect-square overflow-hidden border transition ${
                i === index ? "border-gold-400" : "border-navy-700/60 hover:border-navy-600"
              }`}
            >
              {slide.type === "video" ? (
                <div className="flex h-full w-full items-center justify-center bg-navy-900 text-cream">
                  <MdPlayCircle size={20} />
                </div>
              ) : (
                <Image src={slide.src} alt="" fill sizes="150px" className="object-cover" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
