"use client";

import { useMemo, useState, useRef } from "react";
import Image from "next/image";
import { MdChevronLeft, MdChevronRight, MdPlayCircle } from "react-icons/md";
import { FiDownload, FiLoader } from "react-icons/fi";
import { toast } from "sonner";
import { downloadFiles } from "@/lib/downloadFile";

export default function PropertyMediaCarousel({ image, galleryImages, video, title, badge, showDownloadButtons = false }) {
  const slides = useMemo(() => {
    const images = [image, ...(galleryImages || [])].filter(Boolean);
    const uniqueImages = [...new Set(images)].map((src) => ({ type: "image", src }));
    const videoSlide = video ? [{ type: "video", src: video }] : [];
    return [...uniqueImages, ...videoSlide];
  }, [image, galleryImages, video]);

  const imageSlides = useMemo(() => slides.filter((s) => s.type === "image"), [slides]);
  const videoSlides = useMemo(() => slides.filter((s) => s.type === "video"), [slides]);

  const [index, setIndex] = useState(0);
  const [downloadingImages, setDownloadingImages] = useState(false);
  const [downloadingVideo, setDownloadingVideo] = useState(false);
  const [frameRatio, setFrameRatio] = useState(4 / 3);
  const touchStartX = useRef(null);

  const hasMultiple = slides.length > 1;
  const active = slides[index] || slides[0];

  const MIN_RATIO = 9 / 16; // tallest frame allowed (portrait, phone-shot media)
  const MAX_RATIO = 16 / 9; // widest frame allowed (landscape)

  function handleImageLoad(e) {
    const { naturalWidth, naturalHeight } = e.target;
    if (!naturalWidth || !naturalHeight) return;
    const ratio = naturalWidth / naturalHeight;
    setFrameRatio(Math.min(MAX_RATIO, Math.max(MIN_RATIO, ratio)));
  }

  function handleVideoLoad(e) {
    const { videoWidth, videoHeight } = e.target;
    if (!videoWidth || !videoHeight) return;
    const ratio = videoWidth / videoHeight;
    setFrameRatio(Math.min(MAX_RATIO, Math.max(MIN_RATIO, ratio)));
  }

  function goTo(next) {
    setIndex((next + slides.length) % slides.length);
    setFrameRatio(4 / 3);
  }

  async function handleDownloadImages() {
    if (downloadingImages) return;
    setDownloadingImages(true);
    await downloadFiles(imageSlides.map((s) => s.src), title || "property-image");
    setDownloadingImages(false);
    toast.success(`${imageSlides.length} image${imageSlides.length > 1 ? "s" : ""} downloaded`);
  }

  async function handleDownloadVideo() {
    if (downloadingVideo) return;
    setDownloadingVideo(true);
    await downloadFiles(videoSlides.map((s) => s.src), title || "property-video");
    setDownloadingVideo(false);
    toast.success("Video downloaded");
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
        className="relative w-full overflow-hidden border border-navy-700/60 bg-navy-950 transition-[aspect-ratio] duration-200 sm:max-h-[480px] lg:max-h-[560px]"
        style={{ aspectRatio: frameRatio }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {active.type === "video" ? (
          <video
            key={active.src}
            src={active.src}
            controls
            playsInline
            onLoadedMetadata={handleVideoLoad}
            className="h-full w-full object-contain bg-navy-950"
          />
        ) : (
          <Image
            key={active.src}
            src={active.src}
            alt={title}
            fill
            sizes="100vw"
            priority={index === 0}
            onLoad={handleImageLoad}
            className="object-contain"
          />
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

      {showDownloadButtons && (
      <div className="mt-3 flex flex-wrap justify-end gap-2">
        {imageSlides.length > 0 && (
          <button
            type="button"
            onClick={handleDownloadImages}
            disabled={downloadingImages}
            className="tracked-label flex min-h-11 items-center gap-2 border border-gold-500/70 px-4 py-2 text-xs text-gold-400 transition hover:bg-gold-500/10 active:scale-95 disabled:cursor-wait disabled:opacity-70"
          >
            {downloadingImages ? (
              <FiLoader className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FiDownload className="h-3.5 w-3.5" />
            )}
            {downloadingImages ? "Downloading…" : `Download Image${imageSlides.length > 1 ? "s" : ""}`}
          </button>
        )}
        {videoSlides.length > 0 && (
          <button
            type="button"
            onClick={handleDownloadVideo}
            disabled={downloadingVideo}
            className="tracked-label flex min-h-11 items-center gap-2 border border-gold-500/70 px-4 py-2 text-xs text-gold-400 transition hover:bg-gold-500/10 active:scale-95 disabled:cursor-wait disabled:opacity-70"
          >
            {downloadingVideo ? (
              <FiLoader className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <FiDownload className="h-3.5 w-3.5" />
            )}
            {downloadingVideo ? "Downloading…" : "Download Video"}
          </button>
        )}
      </div>
      )}
    </div>
  );
}
